// test-exports.js
import createRNNoiseModule from './rnnoise.js';

async function testExports() {
    console.log('🔍 Checking module exports...');

    try {
        const module = await createRNNoiseModule();
        console.log('✅ Module loaded');

        // List all exported functions
        console.log('\n📋 All exported functions:');
        Object.keys(module)
            .filter(key => typeof module[key] === 'function')
            .sort()
            .forEach(key => console.log(` - ${key}`));

        // Check if the original RNNoise functions are available
        console.log('\n🔍 Specific RNNoise functions:');

        const rnnoiseFuncs = Object.keys(module).filter(key =>
            typeof module[key] === 'function' &&
            key.includes('rnnoise')
        );

        rnnoiseFuncs.forEach(fn => console.log(` - ${fn}`));

        // Test direct creation (if available)
        if (module._rnnoise_create) {
            console.log('\n🧪 Testing _rnnoise_create directly...');
            const directInstance = module._rnnoise_create();
            console.log(' Direct instance:', directInstance);
        }

        // Test wrapper
        console.log('\n🧪 Testing wrapper...');

        const wrapperInstance = module._rnnoise_create_wasm();
        console.log(' Wrapper instance:', wrapperInstance);

        const frameSize = module._get_frame_size();
        console.log(' Frame size:', frameSize);

        // Check if there is a difference between the functions
        if (module._rnnoise_create && module._rnnoise_create_wasm) {
            console.log(' Different functions?', module._rnnoise_create !== module._rnnoise_create_wasm);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testExports();