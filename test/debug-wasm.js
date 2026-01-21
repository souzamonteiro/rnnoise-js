// debug-wasm.js
import createRNNoiseModule from './/rnnoise.js';

async function debugWASM() {
    console.log('🔍 Advanced debugging of the WASM module...');
    try {
        const module = await createRNNoiseModule();
        console.log('✅ Module loaded');

        // Test instance creation
        console.log('\n🧪 Testing instance creation...');
        const instance = module._rnnoise_create_wasm();
        console.log(' Instance:', instance);

        // Test frame size
        const frameSize = module._get_frame_size();
        console.log(' Frame size:', frameSize);

        // Create a more realistic test frame
        const testFrame = new Float32Array(frameSize);
        for (let i = 0; i < frameSize; i++) {
            // Stronger signal that simulates voice
            testFrame[i] = Math.sin(i * 0.5) * 0.1; // Strong sine wave
        }
        console.log('\n🔧 Testing memory allocation...');
        const inputPtr = module._malloc(testFrame.length * 4);
        const outputPtr = module._malloc(testFrame.length * 4);
        console.log(' Pointers:', {
            inputPtr,
            outputPtr
        });

        // Test the processing function directly
        console.log('\n🎯 Testing _rnnoise_process_frame_wasm directly...');

        // First, we need to find the correct function signature
        // Let's test different approaches
        //Attempt 1: with pointers
        console.log('Attempt 1: with pointers...');
        try {
            // Fill the memory with the test frame
            //We need to access the WASM memory
            if (module.HEAPU8) {
                console.log(' HEAPU8 available');
                const inputBytes = new Uint8Array(testFrame.buffer);
                module.HEAPU8.set(inputBytes, inputPtr);
                const vad = module._rnnoise_process_frame_wasm(instance, outputPtr, inputPtr);
                console.log(' VAD (pointers):', vad);
            } else {
                console.log(' ❌ HEAPU8 not available');
            }
        } catch (error) {
            console.log(' ❌ Error with pointers:', error.message);
        }

        // Attempt 2: with ccall
        console.log('\n Attempt 2: with ccall...');
        try {
            const vad = module.ccall(
                'rnnoise_process_frame_wasm',
                'number',
                ['number', 'number', 'number'],
                [instance, outputPtr, inputPtr]
            );
            console.log(' VAD (ccall):', vad);
        } catch (error) {
            console.log(' ❌ Error with ccall:', error.message);
        }

        // Attempt 3: discover the correct signature
        console.log('\n📋 Examining available functions...');
        const functions = Object.keys(module).filter(key =>
            typeof module[key] === 'function' &&
            key.startsWith('_rnnoise')
        );
        console.log(' RNNoise Functions:');
        functions.forEach(fn => {
            console.log(' -', fn);
        });

        // Test buffer function if available
        if (module._rnnoise_process_buffer_wasm) {
            console.log('\n🔊 Testing _rnnoise_process_buffer_wasm...');
            try {
                // Convert to JavaScript array
                const inputArray = Array.from(testFrame);
                const outputArray = new Array(testFrame.length).fill(0);
                const vad = module._rnnoise_process_buffer_wasm(
                    instance,
                    outputArray,
                    inputArray,
                    testFrame.length
                );
                console.log(' VAD (buffer):', vad);
                console.log(' Output array samples:', outputArray.slice(0, 5));
            } catch (error) {
                console.log(' ❌ Error with buffer:', error.message);
            }
        }

        // Free up memory 
        module._free(inputPtr);
        module._free(outputPtr);
        module._rnnoise_destroy_wasm(instance);
    } catch (error) {
        console.error('❌ Debug error:', error);
    }
}

debugWASM();