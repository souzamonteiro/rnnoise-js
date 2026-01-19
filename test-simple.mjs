// test-simple.mjs
import RNNoiseNode from './rnnoise-node.js';

async function testSimple() {
    console.log('🧪 Teste simplificado do RNNoise...');
    
    const processor = new RNNoiseNode();
    
    try {
        console.log('1. Inicializando...');
        await processor.init();
        
        console.log('2. Criando frame de teste...');
        const testFrame = new Float32Array(processor.frameSize);
        for (let i = 0; i < processor.frameSize; i++) {
            testFrame[i] = Math.sin(i * 0.1) * 0.01; // Onda senoidal suave
        }
        
        console.log('3. Processando frame...');
        const result = processor.processFrame(testFrame);
        
        console.log('✅ Resultado:');
        console.log('   VAD:', result.vad.toFixed(4));
        console.log('   Audio samples:', result.audio.length);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        processor.destroy();
    }
}

testSimple();
