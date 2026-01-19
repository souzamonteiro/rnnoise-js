// debug-wasm.js
import createRNNoiseModule from './rnnoise.js';

async function debugWASM() {
    console.log('🔍 Debug avançado do módulo WASM...');
    
    try {
        const module = await createRNNoiseModule();
        console.log('✅ Módulo carregado');
        
        // Testar criação de instância
        console.log('\n🧪 Testando criação de instância...');
        const instance = module._rnnoise_create_wasm();
        console.log('   Instância:', instance);
        
        // Testar frame size
        const frameSize = module._get_frame_size();
        console.log('   Frame size:', frameSize);
        
        // Criar um frame de teste mais realista
        const testFrame = new Float32Array(frameSize);
        for (let i = 0; i < frameSize; i++) {
            // Sinal mais forte que simule voz
            testFrame[i] = Math.sin(i * 0.5) * 0.1; // Onda senoidal forte
        }
        
        console.log('\n🔧 Testando alocação de memória...');
        const inputPtr = module._malloc(testFrame.length * 4);
        const outputPtr = module._malloc(testFrame.length * 4);
        console.log('   Ponteiros:', { inputPtr, outputPtr });
        
        // Testar a função de processamento diretamente
        console.log('\n🎯 Testando _rnnoise_process_frame_wasm diretamente...');
        
        // Primeiro, precisamos descobrir a assinatura correta da função
        // Vamos testar diferentes abordagens
        
        // Tentativa 1: com ponteiros
        console.log('   Tentativa 1: com ponteiros...');
        try {
            // Preencher a memória com o frame de teste
            // Precisamos acessar a memória do WASM
            if (module.HEAPU8) {
                console.log('   HEAPU8 disponível');
                const inputBytes = new Uint8Array(testFrame.buffer);
                module.HEAPU8.set(inputBytes, inputPtr);
                
                const vad = module._rnnoise_process_frame_wasm(instance, outputPtr, inputPtr);
                console.log('   VAD (ponteiros):', vad);
            } else {
                console.log('   ❌ HEAPU8 não disponível');
            }
        } catch (error) {
            console.log('   ❌ Erro com ponteiros:', error.message);
        }
        
        // Tentativa 2: com ccall
        console.log('\n   Tentativa 2: com ccall...');
        try {
            const vad = module.ccall(
                'rnnoise_process_frame_wasm',
                'number',
                ['number', 'number', 'number'],
                [instance, outputPtr, inputPtr]
            );
            console.log('   VAD (ccall):', vad);
        } catch (error) {
            console.log('   ❌ Erro com ccall:', error.message);
        }
        
        // Tentativa 3: descobrir a assinatura correta
        console.log('\n📋 Examinando funções disponíveis...');
        const functions = Object.keys(module).filter(key => 
            typeof module[key] === 'function' && 
            key.startsWith('_rnnoise')
        );
        
        console.log('   Funções RNNoise:');
        functions.forEach(fn => {
            console.log('   -', fn);
        });
        
        // Testar função de buffer se disponível
        if (module._rnnoise_process_buffer_wasm) {
            console.log('\n🔊 Testando _rnnoise_process_buffer_wasm...');
            try {
                // Converter para array JavaScript
                const inputArray = Array.from(testFrame);
                const outputArray = new Array(testFrame.length).fill(0);
                
                const vad = module._rnnoise_process_buffer_wasm(
                    instance, 
                    outputArray, 
                    inputArray, 
                    testFrame.length
                );
                console.log('   VAD (buffer):', vad);
                console.log('   Output array samples:', outputArray.slice(0, 5));
            } catch (error) {
                console.log('   ❌ Erro com buffer:', error.message);
            }
        }
        
        // Liberar memória
        module._free(inputPtr);
        module._free(outputPtr);
        module._rnnoise_destroy_wasm(instance);
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
    }
}

debugWASM();
