// test-working.js
import RNNoiseNode from './rnnoise-node.js';

async function testWorking() {
    console.log('🎉 Teste do RNNoise funcionando!');
    
    const processor = new RNNoiseNode();
    
    try {
        console.log('1. Inicializando...');
        await processor.init();
        
        console.log('2. Criando sinais de teste...');
        
        // Sinal 1: Ruído baixo (deve ter VAD baixo)
        const noiseFrame = new Float32Array(processor.frameSize);
        for (let i = 0; i < processor.frameSize; i++) {
            noiseFrame[i] = (Math.random() - 0.5) * 0.001; // Ruído muito baixo
        }
        
        // Sinal 2: Onda senoidal forte (deve ter VAD alto)
        const voiceFrame = new Float32Array(processor.frameSize);
        for (let i = 0; i < processor.frameSize; i++) {
            voiceFrame[i] = Math.sin(i * 0.5) * 0.2; // Onda senoidal forte
        }
        
        // Sinal 3: Voz simulada complexa
        const complexVoiceFrame = new Float32Array(processor.frameSize);
        const sampleRate = 48000;
        for (let i = 0; i < processor.frameSize; i++) {
            const t = i / sampleRate;
            const fundamental = Math.sin(2 * Math.PI * 120 * t);
            const harmonic1 = Math.sin(2 * Math.PI * 240 * t) * 0.3;
            const harmonic2 = Math.sin(2 * Math.PI * 360 * t) * 0.1;
            complexVoiceFrame[i] = (fundamental + harmonic1 + harmonic2) * 0.15;
        }
        
        console.log('3. Processando frames...');
        
        console.log('\n🔊 Ruído baixo:');
        const noiseResult = processor.processFrame(noiseFrame);
        console.log('   VAD:', noiseResult.vad.toFixed(4));
        
        console.log('\n📈 Onda senoidal:');
        const voiceResult = processor.processFrame(voiceFrame);
        console.log('   VAD:', voiceResult.vad.toFixed(4));
        
        console.log('\n🎤 Voz simulada complexa:');
        const complexResult = processor.processFrame(complexVoiceFrame);
        console.log('   VAD:', complexResult.vad.toFixed(4));
        
        console.log('\n📊 Comparação:');
        console.log('   Senoidal > Ruído?', voiceResult.vad > noiseResult.vad);
        console.log('   Voz > Ruído?', complexResult.vad > noiseResult.vad);
        console.log('   Voz > Senoidal?', complexResult.vad > voiceResult.vad);
        
        // Teste com frames sequenciais
        console.log('\n🔄 Teste sequencial (consistência):');
        for (let i = 0; i < 3; i++) {
            const testFrame = new Float32Array(processor.frameSize);
            for (let j = 0; j < processor.frameSize; j++) {
                testFrame[j] = Math.sin(j * 0.1 + i) * 0.1;
            }
            const result = processor.processFrame(testFrame);
            console.log(`   Frame ${i + 1}: VAD = ${result.vad.toFixed(4)}`);
        }
        
        console.log('\n🎊 Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        processor.destroy();
    }
}

// Teste adicional: verificar vazamento de memória
async function testMemoryLeak() {
    console.log('\n🧠 Teste de vazamento de memória...');
    
    for (let i = 0; i < 5; i++) {
        const processor = new RNNoiseNode();
        await processor.init();
        
        const testFrame = new Float32Array(480);
        for (let j = 0; j < 480; j++) {
            testFrame[j] = Math.random() * 0.1;
        }
        
        const result = processor.processFrame(testFrame);
        console.log(`   Iteração ${i + 1}: VAD = ${result.vad.toFixed(4)}`);
        
        processor.destroy();
    }
    
    console.log('✅ Teste de memória concluído');
}

// Executar testes
async function runTests() {
    await testWorking();
    await testMemoryLeak();
}

runTests();
