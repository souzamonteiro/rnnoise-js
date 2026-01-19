// test-voice.js
import RNNoiseNode from './rnnoise-node.js';

// Função para gerar um sinal que simula voz
function generateVoiceLikeSignal(length, frequency = 100) {
    const signal = new Float32Array(length);
    
    // Simular características de voz:
    // - Onda fundamental baixa (100-200Hz)
    // - Harmônicos
    // - Envelope variável
    for (let i = 0; i < length; i++) {
        // Onda fundamental
        const fundamental = Math.sin(i * frequency * 2 * Math.PI / 48000);
        
        // Harmônicos
        const harmonic1 = Math.sin(i * frequency * 2 * 2 * Math.PI / 48000) * 0.3;
        const harmonic2 = Math.sin(i * frequency * 3 * 2 * Math.PI / 48000) * 0.2;
        
        // Envelope que varia ao longo do tempo (simulando sílabas)
        const envelope = 0.5 + 0.4 * Math.sin(i * 0.02);
        
        // Combinar tudo
        signal[i] = (fundamental + harmonic1 + harmonic2) * envelope * 0.05;
        
        // Adicionar um pouco de ruído (característica natural da voz)
        signal[i] += (Math.random() - 0.5) * 0.005;
    }
    
    return signal;
}

// Função para gerar ruído branco
function generateWhiteNoise(length, amplitude = 0.01) {
    const noise = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        noise[i] = (Math.random() - 0.5) * 2 * amplitude;
    }
    return noise;
}

async function testVoiceDetection() {
    console.log('🎤 Teste de detecção de voz com RNNoise...');
    
    const processor = new RNNoiseNode();
    
    try {
        console.log('1. Inicializando...');
        await processor.init();
        
        console.log('\n2. Teste com ruído (deve ter VAD baixo)...');
        const noiseFrame = generateWhiteNoise(processor.frameSize, 0.02);
        const noiseResult = processor.processFrame(noiseFrame);
        console.log('   🔇 Ruído - VAD:', noiseResult.vad.toFixed(4));
        
        console.log('\n3. Teste com sinal de voz simulado (deve ter VAD alto)...');
        const voiceFrame = generateVoiceLikeSignal(processor.frameSize, 120);
        const voiceResult = processor.processFrame(voiceFrame);
        console.log('   🎤 Voz simulada - VAD:', voiceResult.vad.toFixed(4));
        
        console.log('\n4. Teste com diferentes frequências fundamentais:');
        const frequencies = [80, 120, 200, 300];
        for (const freq of frequencies) {
            const testFrame = generateVoiceLikeSignal(processor.frameSize, freq);
            const result = processor.processFrame(testFrame);
            console.log(`   ${freq}Hz - VAD: ${result.vad.toFixed(4)}`);
        }
        
        console.log('\n5. Teste com diferentes amplitudes:');
        const amplitudes = [0.01, 0.02, 0.05, 0.1];
        for (const amp of amplitudes) {
            const testFrame = generateVoiceLikeSignal(processor.frameSize, 120);
            // Aplicar amplitude
            for (let i = 0; i < testFrame.length; i++) {
                testFrame[i] *= amp;
            }
            const result = processor.processFrame(testFrame);
            console.log(`   Amplitude ${amp} - VAD: ${result.vad.toFixed(4)}`);
        }
        
        console.log('\n🎉 Teste de detecção concluído!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        processor.destroy();
    }
}

// Teste com silêncio vs voz
async function testSilenceVsVoice() {
    console.log('\n🔊 Teste Silêncio vs Voz...');
    
    const processor = new RNNoiseNode();
    await processor.init();
    
    // Silêncio (apenas ruído muito baixo)
    const silence = new Float32Array(processor.frameSize);
    for (let i = 0; i < processor.frameSize; i++) {
        silence[i] = (Math.random() - 0.5) * 0.001; // Ruído muito baixo
    }
    
    // Voz simulada
    const voice = generateVoiceLikeSignal(processor.frameSize, 150);
    
    const silenceResult = processor.processFrame(silence);
    const voiceResult = processor.processFrame(voice);
    
    console.log('   🤫 Silêncio - VAD:', silenceResult.vad.toFixed(4));
    console.log('   🗣️ Voz - VAD:', voiceResult.vad.toFixed(4));
    console.log('   📊 Diferença:', (voiceResult.vad - silenceResult.vad).toFixed(4));
    
    processor.destroy();
}

// Executar testes
async function runTests() {
    await testVoiceDetection();
    await testSilenceVsVoice();
}

runTests();
