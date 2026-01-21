// test-deep-diagnostic.js
import createRNNoiseModule from './rnnoise.js';

async function deepDiagnostic() {
    console.log('🔍 Deep Diagnosis of RNNoise...');

    try {
        const module = await createRNNoiseModule();

        // Test 1: Check for internal state
        console.log('\n🧪 Test 1: Internal state of the module');
        console.log(' Does it have _rnnoise_create_wasm?', !!module._rnnoise_create_wasm);
        console.log(' Does it have HEAPU8?', !!module.HEAPU8);
        console.log(' Does it have HEAPF32?', !!module.HEAPF32);

        // Test 2: Check if the function returns something other than zero
        console.log('\n🧪 Test 2: Return from the creation function');
        const instance1 = module._rnnoise_create_wasm();
        console.log('Instance 1:', instance1);
        console.log('Is it zero?', instance1 === 0);
        console.log('Is it null?', instance1 === null);
        console.log('Is it undefined?', instance1 === undefined);

        // Test 3: Frame size
        const frameSize = module._get_frame_size();
        console.log('Frame size:', frameSize);

        // Test 4: Direct test with the function
        console.log('\n🧪 Test 4: Direct call to the function');
        const testFrame = new Float32Array(frameSize);

        for (let i = 0; i < frameSize; i++) {
            testFrame[i] = Math.sin(i * 0.5) * 1.0; // VERY strong signal 
        }

        const inputPtr = module._malloc(frameSize * 4);
        const outputPtr = module._malloc(frameSize * 4);

        // Copy 
        const inputBytes = new Uint8Array(testFrame.buffer);
        module.HEAPU8.set(inputBytes, inputPtr);
        console.log(' Input min/max:', Math.min(...testFrame).toFixed(4), '/', Math.max(...testFrame).toFixed(4));

        // Call function 
        const vad = module._rnnoise_process_frame_wasm(instance1, outputPtr, inputPtr);
        console.log(' VAD returned:', vad);
        console.log('VAD is number?', typeof vad === 'number');
        console.log('VAD is NaN?', isNaN(vad));

        // Check output 
        const outputFrame = new Float32Array(frameSize);
        const outputStart = outputPtr / 4;
        for (let i = 0; i < frameSize; i++) {
            outputFrame[i] = module.HEAPF32[outputStart + i];
        }
        console.log(' Output min/max:', Math.min(...outputFrame).toFixed(6), '/', Math.max(...outputFrame).toFixed(6));
        console.log(' Is output different from zero?', outputFrame.some(x => Math.abs(x) > 0.0001));

        // Test 5: Multiple calls
        console.log('\n🧪 Test 5: Sequential Multiple Calls');

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
            console.log(` Call ${i + 1}: VAD = ${vad2}`);

            module._free(inputPtr2);
            module._free(outputPtr2);
        }

        // Test 6: Verify destruction
        console.log('\n🧪 Test 6: Destruction and new instance');
        module._rnnoise_destroy_wasm(instance1);
        const instance2 = module._rnnoise_create_wasm();
        console.log(' New instance:', instance2);
        console.log('Is it different?', instance2 !== instance1);

        // Test with new instance 
        const inputPtr3 = module._malloc(frameSize * 4);
        const outputPtr3 = module._malloc(frameSize * 4);

        module.HEAPU8.set(inputBytes, inputPtr3);
        const vad3 = module._rnnoise_process_frame_wasm(instance2, outputPtr3, inputPtr3);
        console.log('VAD new instance:', vad3);

        module._free(inputPtr);
        module._free(outputPtr);
        module._free(inputPtr3);
        module._free(outputPtr3);
        module._rnnoise_destroy_wasm(instance2);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

deepDiagnostic();