// debug-module.mjs
import createRNNoiseModule from './rnnoise.js';

async function debugModule() {
    console.log('🔍 Debugging RNNoise module structure...');

    try {
        console.log('📦 Loading module...');
        const module = await createRNNoiseModule();
        console.log('✅ Module loaded:', typeof module);

        console.log('\n📋 Module properties:');
        Object.keys(module).forEach(key => {
            const value = module[key];
            if (typeof value === 'function') {
                console.log(`- ${key}: function`);
            } else {
                console.log(`- ${key}:`, typeof value);
            }
        });

        console.log('\n🔍 Important properties:');
        console.log('- _malloc:', typeof module._malloc);
        console.log('- _free:', typeof module._free);
        console.log('- _rnnoise_create_wasm:', typeof module._rnnoise_create_wasm);
        console.log('- _get_frame_size:', typeof module._get_frame_size);
        console.log('- HEAPU8:', module.HEAPU8 ? '✅' : '❌');
        console.log('- HEAPF32:', module.HEAPF32 ? '✅' : '❌');
        console.log('- memory:', module.memory ? '✅' : '❌');

        if (module.HEAPU8) {
            console.log('- HEAPU8 length:', module.HEAPU8.length);
        }
        if (module.HEAPF32) {
            console.log('- HEAPF32 length:', module.HEAPF32.length);
        }

        console.log('\n🧪 Testing functions...');
        if (typeof module._rnnoise_create_wasm === 'function') {
            const instance = module._rnnoise_create_wasm();
            console.log('- Instance created:', instance);
        }

        if (typeof module._get_frame_size === 'function') {
            const frameSize = module._get_frame_size();
            console.log('- Frame size:', frameSize);
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
        console.error('Stack:', error.stack);
    }
}

debugModule();