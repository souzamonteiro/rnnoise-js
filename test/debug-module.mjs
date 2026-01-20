// debug-module.mjs
import createRNNoiseModule from './rnnoise.js';

async function debugModule() {
    console.log('🔍 Debugando estrutura do módulo RNNoise...');
    
    try {
        console.log('📦 Carregando módulo...');
        const module = await createRNNoiseModule();
        console.log('✅ Módulo carregado:', typeof module);
        
        console.log('\n📋 Propriedades do módulo:');
        Object.keys(module).forEach(key => {
            const value = module[key];
            if (typeof value === 'function') {
                console.log(`- ${key}: function`);
            } else {
                console.log(`- ${key}:`, typeof value);
            }
        });
        
        console.log('\n🔍 Propriedades importantes:');
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
        
        console.log('\n🧪 Testando funções...');
        if (typeof module._rnnoise_create_wasm === 'function') {
            const instance = module._rnnoise_create_wasm();
            console.log('- Instância criada:', instance);
        }
        
        if (typeof module._get_frame_size === 'function') {
            const frameSize = module._get_frame_size();
            console.log('- Frame size:', frameSize);
        }
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
        console.error('Stack:', error.stack);
    }
}

debugModule();
