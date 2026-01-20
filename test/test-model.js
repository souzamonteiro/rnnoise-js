// test-model.js
import createRNNoiseModule from './rnnoise.js';

async function testModel() {
    console.log('🤖 Verificando modelo RNNoise...');
    
    try {
        const module = await createRNNoiseModule();
        
        // Testar criação múltipla de instâncias
        console.log('👥 Testando múltiplas instâncias...');
        const instances = [];
        for (let i = 0; i < 3; i++) {
            const instance = module._rnnoise_create_wasm();
            instances.push(instance);
            console.log(`   Instância ${i + 1}:`, instance);
        }
        
        // Verificar se são únicas
        const uniqueInstances = new Set(instances).size;
        console.log('   Instâncias únicas:', uniqueInstances === 3);
        
        // Testar cada instância
        const frameSize = module._get_frame_size();
        const testFrame = new Float32Array(frameSize);
        for (let i = 0; i < frameSize; i++) {
            testFrame[i] = Math.sin(i * 0.2) * 0.3;
        }
        
        for (let i = 0; i < instances.length; i++) {
            const inputPtr = module._malloc(frameSize * 4);
            const outputPtr = module._malloc(frameSize * 4);
            
            const inputBytes = new Uint8Array(testFrame.buffer);
            module.HEAPU8.set(inputBytes, inputPtr);
            
            const vad = module._rnnoise_process_frame_wasm(instances[i], outputPtr, inputPtr);
            console.log(`   Instância ${i + 1} VAD:`, vad);
            
            module._free(inputPtr);
            module._free(outputPtr);
        }
        
        // Limpar
        instances.forEach(instance => module._rnnoise_destroy_wasm(instance));
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

testModel();
