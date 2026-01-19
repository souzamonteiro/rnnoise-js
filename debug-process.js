// debug-process.js
import createRNNoiseModule from './rnnoise.js';

async function debugProcess() {
    console.log('🔍 Debug detalhado do processamento...');
    
    try {
        const module = await createRNNoiseModule();
        console.log('✅ Módulo carregado');
        
        // Criar instância
        const instance = module._rnnoise_create_wasm();
        console.log('📦 Instância criada:', instance);
        
        const frameSize = module._get_frame_size();
        console.log('📏 Frame size:', frameSize);
        
        // Criar um frame de teste MUITO forte
        const inputFrame = new Float32Array(frameSize);
        for (let i = 0; i < frameSize; i++) {
            // Sinal muito forte e claro
            inputFrame[i] = Math.sin(i * 0.3) * 0.5; // Amplitude alta
        }
        
        console.log('🎵 Sinal de teste:');
        console.log('   Min:', Math.min(...inputFrame).toFixed(4));
        console.log('   Max:', Math.max(...inputFrame).toFixed(4));
        console.log('   RMS:', Math.sqrt(inputFrame.reduce((sum, x) => sum + x*x, 0) / frameSize).toFixed(4));
        
        // Alocar memória
        const inputPtr = module._malloc(frameSize * 4);
        const outputPtr = module._malloc(frameSize * 4);
        
        console.log('📍 Ponteiros:', { inputPtr, outputPtr });
        
        // Verificar se a memória foi zerada
        console.log('\n🧠 Verificando memória inicial:');
        const initialOutput = new Float32Array(frameSize);
        const outputStart = outputPtr / 4;
        for (let i = 0; i < Math.min(5, frameSize); i++) {
            initialOutput[i] = module.HEAPF32[outputStart + i];
        }
        console.log('   Primeiros valores do output (antes):', initialOutput.slice(0, 5));
        
        // Copiar input para WASM
        const inputBytes = new Uint8Array(inputFrame.buffer);
        module.HEAPU8.set(inputBytes, inputPtr);
        
        console.log('✅ Input copiado para WASM');
        
        // Verificar se o input foi copiado corretamente
        const inputStart = inputPtr / 4;
        const inputCopy = new Float32Array(frameSize);
        for (let i = 0; i < frameSize; i++) {
            inputCopy[i] = module.HEAPF32[inputStart + i];
        }
        console.log('   Input copiado (primeiros 5):', inputCopy.slice(0, 5));
        
        // Chamar a função de processamento
        console.log('\n🎯 Chamando rnnoise_process_frame_wasm...');
        const vad = module._rnnoise_process_frame_wasm(instance, outputPtr, inputPtr);
        console.log('   VAD retornado:', vad);
        
        // Verificar output
        const outputFrame = new Float32Array(frameSize);
        for (let i = 0; i < frameSize; i++) {
            outputFrame[i] = module.HEAPF32[outputStart + i];
        }
        
        console.log('📊 Resultados:');
        console.log('   Output min:', Math.min(...outputFrame).toFixed(6));
        console.log('   Output max:', Math.max(...outputFrame).toFixed(6));
        console.log('   Output não-zero:', outputFrame.filter(x => Math.abs(x) > 0.0001).length);
        console.log('   Primeiros valores output:', outputFrame.slice(0, 5));
        
        // Testar função de buffer também
        console.log('\n🔊 Testando _rnnoise_process_buffer_wasm...');
        try {
            const inputArray = Array.from(inputFrame);
            const outputArray = new Array(frameSize);
            
            const vadBuffer = module._rnnoise_process_buffer_wasm(
                instance, 
                outputArray, 
                inputArray, 
                frameSize
            );
            console.log('   VAD (buffer):', vadBuffer);
            console.log('   Output array (primeiros 5):', outputArray.slice(0, 5));
        } catch (error) {
            console.log('   ❌ Erro com buffer:', error.message);
        }
        
        // Limpar
        module._free(inputPtr);
        module._free(outputPtr);
        module._rnnoise_destroy_wasm(instance);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

debugProcess();
