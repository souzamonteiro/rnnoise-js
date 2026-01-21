// test-model.js
import createRNNoiseModule from './rnnoise.js';

async function testModel() {
    console.log('🤖 Checking RNNoise model...');

    try {
        const module = await createRNNoiseModule();

        // Testing multiple instance creation
        console.log('👥 Testing multiple instances...');
        const instances = [];

        for (let i = 0; i < 3; i++) {
            const instance = module._rnnoise_create_wasm();
            instances.push(instance);
            console.log(` Instance ${i + 1}:`, instance);
        }

        // Checking if they are unique
        const uniqueInstances = new Set(instances).size;
        console.log(' Unique instances:', uniqueInstances === 3);

        // Test each instance 
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
            console.log(` Instance ${i + 1} VAD:`, vad);

            module._free(inputPtr);
            module._free(outputPtr);
        }

        // To clean 
        instances.forEach(instance => module._rnnoise_destroy_wasm(instance));
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testModel();