// test-exports.js
import createRNNoiseModule from './rnnoise.js';

async function testExports() {
    console.log('🔍 Verificando exportações do módulo...');
    
    try {
        const module = await createRNNoiseModule();
        console.log('✅ Módulo carregado');
        
        // Listar todas as funções exportadas
        console.log('\n📋 Todas as funções exportadas:');
        Object.keys(module)
            .filter(key => typeof module[key] === 'function')
            .sort()
            .forEach(key => console.log(`   - ${key}`));
        
        // Verificar se as funções do RNNoise original estão disponíveis
        console.log('\n🔍 Funções RNNoise específicas:');
        const rnnoiseFuncs = Object.keys(module).filter(key => 
            typeof module[key] === 'function' && 
            key.includes('rnnoise')
        );
        
        rnnoiseFuncs.forEach(fn => console.log(`   - ${fn}`));
        
        // Testar criação direta (se disponível)
        if (module._rnnoise_create) {
            console.log('\n🧪 Testando _rnnoise_create direto...');
            const directInstance = module._rnnoise_create();
            console.log('   Instância direta:', directInstance);
        }
        
        // Testar wrapper
        console.log('\n🧪 Testando wrapper...');
        const wrapperInstance = module._rnnoise_create_wasm();
        console.log('   Wrapper instance:', wrapperInstance);
        
        const frameSize = module._get_frame_size();
        console.log('   Frame size:', frameSize);
        
        // Verificar se há diferença entre as funções
        if (module._rnnoise_create && module._rnnoise_create_wasm) {
            console.log('   Funções diferentes?', module._rnnoise_create !== module._rnnoise_create_wasm);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

testExports();
