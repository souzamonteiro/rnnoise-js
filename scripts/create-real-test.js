// create-real-test.js
import { ManualWavReader } from './cli-manual-wav.js';

// Criar arquivo de teste mais realista
function createRealisticAudio() {
    const sampleRate = 48000;
    const duration = 5; // segundos
    const samples = duration * sampleRate;
    const audio = new Float32Array(samples);
    
    // Criar áudio com características vocais
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        
        // Voz simulada com formantes
        const f0 = 120; // frequência fundamental
        const voice = 
            Math.sin(2 * Math.PI * f0 * t) * 0.3 +           // fundamental
            Math.sin(2 * Math.PI * f0 * 2 * t) * 0.2 +       // primeiro harmônico  
            Math.sin(2 * Math.PI * f0 * 3 * t) * 0.1 +       // segundo harmônico
            Math.sin(2 * Math.PI * 500 * t) * 0.05 +         // formante F1
            Math.sin(2 * Math.PI * 1500 * t) * 0.03 +        // formante F2
            (Math.random() - 0.5) * 0.02;                    // ruído leve
        
        // Ruído mais forte
        const noise = (Math.random() - 0.5) * 0.4;
        
        // Alternar entre voz e ruído
        if (t < 2 || (t >= 3 && t < 4)) {
            audio[i] = voice;
        } else {
            audio[i] = noise;
        }
    }
    
    return { audioData: audio, sampleRate };
}

async function createTest() {
    console.log('🎵 Criando áudio realista...');
    const audio = createRealisticAudio();
    ManualWavReader.write('real_test.wav', audio.audioData, audio.sampleRate);
    console.log('✅ Arquivo criado: real_test.wav');
    console.log('💡 Teste com: node cli-manual-wav.js real_test.wav processed.wav');
}

createTest();
