// test-memory.js
import createRNNoiseModule from './rnnoise.js';

async function testMemoryAccess() {
    console.log('🧠 Teste de acesso à memória WASM...');
    
    try {
        const module = await createRNNoiseModule();
        console.log('✅ Módulo carregado');
        
        // Verificar todas as formas possíveis de acessar memória
        console.log('\n🔍 Verificando acesso à memória:');
        console.log('   module.HEAPU8:', !!module.HEAPU8);
        console.log('   module.HEAPF32:', !!module.HEAPF32);
        console.log('   module.memory:', !!module.memory);
        console.log('   module.asm:', !!module.asm);
        
        if (module.asm) {
            console.log('   module.asm.HEAPU8:', !!module.asm.HEAPU8);
            console.log('   module.asm.HEAPF32:', !!module.asm.HEAPF32);
        }
        
        // Testar se podemos criar views de memória
        if (module.memory) {
            console.log('\n📊 Informações de memória:');
            console.log('   buffer byteLength:', module.memory.buffer.byteLength);
            
            const heapU8 = new Uint8Array(module.memory.buffer);
            const heapF32 = new Float32Array(module.memory.buffer);
            console.log('   heapU8 length:', heapU8.length);
            console.log('   heapF32 length:', heapF32.length);
        }
        
        // Testar funções básicas
        console.log('\n🧪 Testando funções:');
        const instance = module._rnnoise_create_wasm();
        const frameSize = module._get_frame_size();
        console.log('   Instância:', instance);
        console.log('   Frame size:', frameSize);
        
        // Testar alocação
        const ptr = module._malloc(100);
        console.log('   Ponteiro alocado:', ptr);
        module._free(ptr);
        console.log('   Memória liberada');
        
        module._rnnoise_destroy_wasm(instance);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

testMemoryAccess();
