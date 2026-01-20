// test-data.js
import createRNNoiseModule from './rnnoise.js';

async function testData() {
    console.log('🔍 Teste detalhado dos dados...');
    
    try {
        const module = await createRNNoiseModule();
        const wrapper = module._rnnoise_create_wasm();
        const frameSize = module._get_frame_size();
        
        console.log('✅ Instância criada, frameSize:', frameSize);
        
        // Testar com diferentes tipos de sinal
        const tests = [
            {
                name: 'Silêncio',
                data: new Float32Array(frameSize).fill(0)
            },
            {
                name: 'Ruído baixo',
                data: new Float32Array(frameSize).map(() => (Math.random() - 0.5) * 0.001)
            },
            {
                name: 'Ruído alto',
                data: new Float32Array(frameSize).map(() => (Math.random() - 0.5) * 0.1)
            },
            {
                name: 'Onda senoidal forte',
                data: new Float32Array(frameSize).map((_, i) => Math.sin(i * 0.5) * 0.5)
            },
            {
                name: 'Onda senoidal muito forte',
                data: new Float32Array(frameSize).map((_, i) => Math.sin(i * 0.5) * 1.0)
            },
            {
                name: 'Dente de serra',
                data: new Float32Array(frameSize).map((_, i) => (i % 100) / 100 * 0.5 - 0.25)
            }
        ];
        
        for (const test of tests) {
            console.log(`\n🎵 Teste: ${test.name}`);
            
            const inputPtr = module._malloc(frameSize * 4);
            const outputPtr = module._malloc(frameSize * 4);
            
            // Verificar dados antes de processar
            console.log('   Input min/max:', 
                Math.min(...test.data).toFixed(6), '/', 
                Math.max(...test.data).toFixed(6));
            
            // Copiar para WASM
            const inputBytes = new Uint8Array(test.data.buffer);
            module.HEAPU8.set(inputBytes, inputPtr);
            
            // Verificar se foi copiado corretamente
            const inputStart = inputPtr / 4;
            const inputCopy = new Float32Array(frameSize);
            for (let i = 0; i < frameSize; i++) {
                inputCopy[i] = module.HEAPF32[inputStart + i];
            }
            console.log('   Copiado min/max:', 
                Math.min(...inputCopy).toFixed(6), '/', 
                Math.max(...inputCopy).toFixed(6));
            
            // Processar
            const vad = module._rnnoise_process_frame_wasm(wrapper, outputPtr, inputPtr);
            
            // Verificar output
            const outputStart = outputPtr / 4;
            const outputFrame = new Float32Array(frameSize);
            for (let i = 0; i < frameSize; i++) {
                outputFrame[i] = module.HEAPF32[outputStart + i];
            }
            
            console.log('   Resultado:');
            console.log('     VAD:', vad);
            console.log('     Output min/max:', 
                Math.min(...outputFrame).toFixed(6), '/', 
                Math.max(...outputFrame).toFixed(6));
            console.log('     Output não-zero:', 
                outputFrame.filter(x => Math.abs(x) > 0.0001).length, 'amostras');
            
            module._free(inputPtr);
            module._free(outputPtr);
        }
        
        module._rnnoise_destroy_wasm(wrapper);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

testData();
