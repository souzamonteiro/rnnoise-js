// test.mjs
import RNNoiseNode from './rnnoise-node.js';

async function testBasic() {
    console.log('🧪 Teste básico do RNNoise...');
    
    const processor = new RNNoiseNode();
    
    try {
        console.log('1. Inicializando...');
        await processor.init();
        console.log('✅ Inicialização OK');
        
        console.log('2. Criando frame de teste...');
        const testFrame = new Float32Array(processor.frameSize);
        for (let i = 0; i < processor.frameSize; i++) {
            testFrame[i] = (Math.random() - 0.5) * 0.01; // Ruído baixo
        }
        
        console.log('   Frame criado:', {
            tamanho: testFrame.length,
            min: Math.min(...testFrame).toFixed(6),
            max: Math.max(...testFrame).toFixed(6),
            avg: (testFrame.reduce((a, b) => a + b) / testFrame.length).toFixed(6)
        });
        
        console.log('3. Processando frame...');
        const result = processor.processFrame(testFrame);
        console.log('✅ Processamento OK');
        
        console.log('4. Verificando resultados...');
        console.log('   📊 VAD probability:', result.vad.toFixed(4));
        console.log('   🎯 Audio samples:', result.audio.length);
        console.log('   🔊 Audio range:', 
            Math.min(...result.audio).toFixed(6), 'to', 
            Math.max(...result.audio).toFixed(6));
        console.log('   💡 Audio não-zero:', 
            result.audio.filter(s => Math.abs(s) > 0.0001).length, 'amostras');
        
        // Teste com múltiplos frames
        console.log('\n5. Teste com múltiplos frames...');
        for (let i = 0; i < 3; i++) {
            const frame = new Float32Array(processor.frameSize);
            for (let j = 0; j < processor.frameSize; j++) {
                frame[j] = (Math.random() - 0.5) * 0.01;
            }
            const multiResult = processor.processFrame(frame);
            console.log(`   Frame ${i + 1}: VAD = ${multiResult.vad.toFixed(4)}`);
        }
        
        console.log('✅✅✅ Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌❌❌ Erro no teste:', error);
        console.error('Stack:', error.stack);
    } finally {
        processor.destroy();
        console.log('🧹 Recursos liberados');
    }
}

// Executar teste
testBasic();
