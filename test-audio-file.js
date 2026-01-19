// test-audio-file.js
import RNNoiseNode from './rnnoise-node.js';
import fs from 'fs';
import wav from 'wav';

async function testWithAudioFile(filename) {
    console.log(`🎵 Testando com arquivo de áudio: ${filename}`);
    
    const processor = new RNNoiseNode();
    await processor.init();
    
    try {
        // Ler arquivo WAV (simplificado - você precisaria de uma lib para parsing)
        // Esta é uma versão simplificada para demonstração
        
        const buffer = fs.readFileSync(filename);
        console.log('📊 Tamanho do arquivo:', buffer.length);
        
        // Processar frames do áudio
        const results = [];
        const frameSize = processor.frameSize;
        
        // Simular processamento de frames (versão simplificada)
        for (let i = 0; i < 10; i++) { // Apenas primeiros 10 frames
            const fakeAudioFrame = new Float32Array(frameSize);
            for (let j = 0; j < frameSize; j++) {
                fakeAudioFrame[j] = (Math.random() - 0.5) * 0.02;
            }
            
            const result = processor.processFrame(fakeAudioFrame);
            results.push(result.vad);
            
            console.log(`   Frame ${i + 1}: VAD = ${result.vad.toFixed(4)}`);
        }
        
        const avgVad = results.reduce((a, b) => a + b) / results.length;
        console.log(`📈 VAD médio: ${avgVad.toFixed(4)}`);
        
    } catch (error) {
        console.error('❌ Erro ao processar arquivo:', error.message);
    } finally {
        processor.destroy();
    }
}

// testWithAudioFile('audio.wav'); // Descomente se tiver um arquivo
