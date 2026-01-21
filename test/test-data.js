//test-data.js
import createRNNoiseModule from './rnnoise.js';

async function testData() {
    console.log('🔍 Detailed data test...');

    try {
        const module = await createRNNoiseModule();
        const wrapper = module._rnnoise_create_wasm();
        const frameSize = module._get_frame_size();

        console.log('✅ Instance created, frameSize:', frameSize);

        // Test with different signal types
        const tests = [{

                name: 'Silence',
                data: new Float32Array(frameSize).fill(0)

            },
            {

                name: 'Low noise',
                data: new Float32Array(frameSize).map(() => (Math.random() - 0.5) * 0.001)

            },
            {

                name: 'High noise',
                data: new Float32Array(frameSize).map(() => (Math.random() - 0.5) * 0.1)

            },
            {

                name: 'Strong sine wave',
                data: new Float32Array(frameSize).map((_, i) => Math.sin(i * 0.5) * 0.5)

            },

            {

                name: 'Very strong sine wave',
                data: new Float32Array(frameSize).map((_, i) => Math.sin(i * 0.5) * 1.0)
            },
            {
                name: 'Sawtooth',
                data: new Float32Array(frameSize).map((_, i) => (i % 100) / 100 * 0.5 - 0.25)
            }
        ];

        for (const test of tests) {
            console.log(`\n🎵 Test: ${test.name}`);

            const inputPtr = module._malloc(frameSize * 4);
            const outputPtr = module._malloc(frameSize * 4);

            // Check data before processing 
            console.log(' Input min/max:',
                Math.min(...test.data).toFixed(6), '/',
                Math.max(...test.data).toFixed(6));

            // Copy to WASM 
            const inputBytes = new Uint8Array(test.data.buffer);
            module.HEAPU8.set(inputBytes, inputPtr);

            // Check if it was copied correctly 
            const inputStart = inputPtr / 4;
            const inputCopy = new Float32Array(frameSize);
            for (let i = 0; i < frameSize; i++) {
                inputCopy[i] = module.HEAPF32[inputStart + i];
            }
            console.log(' Copied min/max:',
                Math.min(...inputCopy).toFixed(6), '/',
                Math.max(...inputCopy).toFixed(6));

            // Process 
            const vad = module._rnnoise_process_frame_wasm(wrapper, outputPtr, inputPtr);

            // Check output 
            const outputStart = outputPtr / 4;
            const outputFrame = new Float32Array(frameSize);
            for (let i = 0; i < frameSize; i++) {
                outputFrame[i] = module.HEAPF32[outputStart + i];
            }

            console.log(' Result:');
            console.log(' VAD:', vad);
            console.log('Output min/max:',
                Math.min(...outputFrame).toFixed(6), '/',
                Math.max(...outputFrame).toFixed(6));
            console.log('Non-zero Output:',
                outputFrame.filter(x => Math.abs(x) > 0.0001).length, 'samples');

            module._free(inputPtr);
            module._free(outputPtr);
        }

        module._rnnoise_destroy_wasm(wrapper);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testData();