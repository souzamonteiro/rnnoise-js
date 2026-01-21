// test-memory.js
import createRNNoiseModule from './rnnoise.js';

async function testMemoryAccess() {
    console.log('🧠 WASM memory access test...');

    try {
        const module = await createRNNoiseModule();
        console.log('✅ Module loaded');

        // Check all possible ways to access memory
        console.log('\n🔍 Checking memory access:');
        console.log(' module.HEAPU8:', !!module.HEAPU8);
        console.log(' module.HEAPF32:', !!module.HEAPF32);
        console.log(' module.memory:', !!module.memory);
        console.log(' module.asm:', !!module.asm);

        if (module.asm) {
            console.log(' module.asm.HEAPU8:', !!module.asm.HEAPU8);
            console.log(' module.asm.HEAPF32:', !!module.asm.HEAPF32);
        }

        // Test if we can create memory views 
        if (module.memory) {
            console.log('\n📊 Memory information:');
            console.log(' buffer byteLength:', module.memory.buffer.byteLength);

            const heapU8 = new Uint8Array(module.memory.buffer);
            const heapF32 = new Float32Array(module.memory.buffer);
            console.log(' heapU8 length:', heapU8.length);
            console.log(' heapF32 length:', heapF32.length);
        }

        // Testing basic functions
        console.log('\n🧪 Testing functions:');
        const instance = module._rnnoise_create_wasm();
        const frameSize = module._get_frame_size();
        console.log('Instance:', instance);
        console.log('Frame size:', frameSize);

        // Testing allocation
        const ptr = module._malloc(100);
        console.log('Pointer allocated:', ptr);
        module._free(ptr);
        console.log('Memory freed');
        module._rnnoise_destroy_wasm(instance);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testMemoryAccess();