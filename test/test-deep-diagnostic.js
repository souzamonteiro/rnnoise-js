// test-deep-diagnostic.js
import createRNNoiseModule from './rnnoise.js';

async function deepDiagnostic() {
    console.log('🔍 Diagnóstico profundo do RNNoise...');
    
    try {
        const module = await createRNNoiseModule();
        
        // Teste 1: Verificar se há estado interno
        console.log('\n🧪 Teste 1: Estado interno do módulo');
        console.log('   Tem _rnnoise_create_wasm?', !!module._rnnoise_create_wasm);
        console.log('   Tem HEAPU8?', !!module.HEAPU8);
        console.log('   Tem HEAPF32?', !!module.HEAPF32);
        
        // Teste 2: Verificar se a função retorna algo diferente de zero
        console.log('\n🧪 Teste 2: Retorno da função de criação');
        const instance1 = module._rnnoise_create_wasm();
        console.log('   Instância 1:', instance1);
        console.log('   É zero?', instance1 === 0);
        console.log('   É null?', instance1 === null);
        console.log('   É undefined?', instance1 === undefined);
        
        // Teste 3: Frame size
        const frameSize = module._get_frame_size();
        console.log('   Frame size:', frameSize);
        
        // Teste 4: Teste direto com a função
        console.log('\n🧪 Teste 4: Chamada direta da função');
        
        const testFrame = new Float32Array(frameSize);
        for (let i = 0; i < frameSize; i++) {
            testFrame[i] = Math.sin(i * 0.5) * 1.0; // Sinal MUITO forte
        }
        
        const inputPtr = module._malloc(frameSize * 4);
        const outputPtr = module._malloc(frameSize * 4);
        
        // Copiar
        const inputBytes = new Uint8Array(testFrame.buffer);
        module.HEAPU8.set(inputBytes, inputPtr);
        
        console.log('   Input min/max:', Math.min(...testFrame).toFixed(4), '/', Math.max(...testFrame).toFixed(4));
        
        // Chamar função
        const vad = module._rnnoise_process_frame_wasm(instance1, outputPtr, inputPtr);
        console.log('   VAD retornado:', vad);
        console.log('   VAD é número?', typeof vad === 'number');
        console.log('   VAD é NaN?', isNaN(vad));
        
        // Verificar output
        const outputFrame = new Float32Array(frameSize);
        const outputStart = outputPtr / 4;
        for (let i = 0; i < frameSize; i++) {
            outputFrame[i] = module.HEAPF32[outputStart + i];
        }
        console.log('   Output min/max:', Math.min(...outputFrame).toFixed(6), '/', Math.max(...outputFrame).toFixed(6));
        console.log('   Output é diferente de zero?', outputFrame.some(x => Math.abs(x) > 0.0001));
        
        // Teste 5: Múltiplas chamadas
        console.log('\n🧪 Teste 5: Múltiplas chamadas sequenciais');
        for (let i = 0; i < 5; i++) {
            const testFrame2 = new Float32Array(frameSize);
            for (let j = 0; j < frameSize; j++) {
                testFrame2[j] = Math.sin(j * 0.5 + i) * 0.8;
            }
            
            const inputPtr2 = module._malloc(frameSize * 4);
            const outputPtr2 = module._malloc(frameSize * 4);
            
            const inputBytes2 = new Uint8Array(testFrame2.buffer);
            module.HEAPU8.set(inputBytes2, inputPtr2);
            
            const vad2 = module._rnnoise_process_frame_wasm(instance1, outputPtr2, inputPtr2);
            console.log(`   Chamada ${i + 1}: VAD = ${vad2}`);
            
            module._free(inputPtr2);
            module._free(outputPtr2);
        }
        
        // Teste 6: Verificar destruição
        console.log('\n🧪 Teste 6: Destruição e nova instância');
        module._rnnoise_destroy_wasm(instance1);
        
        const instance2 = module._rnnoise_create_wasm();
        console.log('   Nova instância:', instance2);
        console.log('   É diferente?', instance2 !== instance1);
        
        // Teste com nova instância
        const inputPtr3 = module._malloc(frameSize * 4);
        const outputPtr3 = module._malloc(frameSize * 4);
        
        module.HEAPU8.set(inputBytes, inputPtr3);
        const vad3 = module._rnnoise_process_frame_wasm(instance2, outputPtr3, inputPtr3);
        console.log('   VAD nova instância:', vad3);
        
        module._free(inputPtr);
        module._free(outputPtr);
        module._free(inputPtr3);
        module._free(outputPtr3);
        module._rnnoise_destroy_wasm(instance2);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

deepDiagnostic();
