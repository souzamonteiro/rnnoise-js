#!/usr/bin/env node
// cli-correct.js - Usando a mesma lógica do seu código C
import createRNNoiseModule from './rnnoise.js';
import fs from 'fs';

class RNNoiseProcessor {
    constructor() {
        this.module = null;
        this.rnnoise = null;
        this.frameSize = 480;
    }

    async init() {
        console.log('🔧 Inicializando RNNoise...');
        this.module = await createRNNoiseModule();
        this.rnnoise = this.module._rnnoise_create_wasm();
        this.frameSize = this.module._get_frame_size();
        console.log('✅ RNNoise pronto');
    }

    processFrame(inputFrame) {
        const inputPtr = this.module._malloc(this.frameSize * 4);
        const outputPtr = this.module._malloc(this.frameSize * 4);

        try {
            // ⚠️ CRÍTICO: Escalar o áudio como no seu código C
            // Seu código C: float_buffer[j] = (float)(l + r / 2);
            const scaledInput = new Float32Array(this.frameSize);
            for (let i = 0; i < inputFrame.length; i++) {
                scaledInput[i] = inputFrame[i] * 32768.0; // Escalar para int16 range
            }

            const inputBytes = new Uint8Array(scaledInput.buffer);
            this.module.HEAPU8.set(inputBytes, inputPtr);
            
            const vad = this.module._rnnoise_process_frame_wasm(this.rnnoise, outputPtr, inputPtr);
            
            // ⚠️ CRÍTICO: Pegar o áudio PROCESSADO, não cortar
            const processedFrame = new Float32Array(this.frameSize);
            const outputStart = outputPtr / 4;
            for (let i = 0; i < this.frameSize; i++) {
                processedFrame[i] = this.module.HEAPF32[outputStart + i];
            }

            // ⚠️ CRÍTICO: Aplicar ganho e scaling como no seu código C
            // Seu código C: sample = output_buffer[j] * RNNOISE_GAIN / 32768.0;
            const RNNOISE_GAIN = 0.95; // Mesmo do seu código
            const finalFrame = new Float32Array(inputFrame.length);
            for (let i = 0; i < inputFrame.length; i++) {
                let sample = processedFrame[i] * RNNOISE_GAIN / 32768.0;
                // Clipping como no seu código C
                if (sample > 1.0) sample = 1.0;
                else if (sample < -1.0) sample = -1.0;
                finalFrame[i] = sample;
            }

            return { vad, audio: finalFrame };
            
        } finally {
            this.module._free(inputPtr);
            this.module._free(outputPtr);
        }
    }

    destroy() {
        if (this.module && this.rnnoise) {
            this.module._rnnoise_destroy_wasm(this.rnnoise);
        }
    }
}

// Funções auxiliares para WAV
function readString(view, offset, length) {
    let str = '';
    for (let i = 0; i < length; i++) str += String.fromCharCode(view.getUint8(offset + i));
    return str;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
}

function readWavFile(filepath) {
    console.log(`📖 Lendo: ${filepath}`);
    
    const buffer = fs.readFileSync(filepath);
    const view = new DataView(buffer.buffer);
    
    if (readString(view, 0, 4) !== 'RIFF' || readString(view, 8, 4) !== 'WAVE') {
        throw new Error('Arquivo WAV inválido');
    }
    
    let offset = 12, fmtOffset = -1;
    while (offset < view.byteLength - 8) {
        const chunkID = readString(view, offset, 4);
        const chunkSize = view.getUint32(offset + 4, true);
        if (chunkID === 'fmt ') {
            fmtOffset = offset + 8;
            break;
        }
        offset += 8 + chunkSize;
    }
    
    if (fmtOffset === -1) throw new Error('Chunk fmt não encontrado');
    
    const sampleRate = view.getUint32(fmtOffset + 4, true);
    const channels = view.getUint16(fmtOffset + 2, true);
    const bitsPerSample = view.getUint16(fmtOffset + 14, true);
    
    console.log(`📊 ${sampleRate}Hz, ${channels}c, ${bitsPerSample}bit`);
    
    offset = 12;
    let dataOffset = -1, dataSize = 0;
    while (offset < view.byteLength - 8) {
        const chunkID = readString(view, offset, 4);
        const chunkSize = view.getUint32(offset + 4, true);
        if (chunkID === 'data') {
            dataOffset = offset + 8;
            dataSize = chunkSize;
            break;
        }
        offset += 8 + chunkSize;
    }
    
    if (dataOffset === -1) throw new Error('Chunk data não encontrado');
    
    const samples = dataSize / (bitsPerSample / 8) / channels;
    const audioData = new Float32Array(samples);
    
    let sampleIndex = 0;
    for (let i = 0; i < dataSize; i += (bitsPerSample / 8) * channels) {
        if (bitsPerSample === 16) {
            audioData[sampleIndex++] = view.getInt16(dataOffset + i, true) / 32768.0;
            if (channels > 1) i += (bitsPerSample / 8) * (channels - 1);
        }
    }
    
    console.log(`📈 ${audioData.length} amostras lidas`);
    return { audioData, sampleRate };
}

function writeWavFile(filepath, audioData, sampleRate = 48000) {
    console.log(`💾 Escrevendo: ${filepath}`);
    
    const samples = audioData.length;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples * 2, true);
    
    for (let i = 0; i < samples; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(44 + i * 2, sample * 32767, true);
    }
    
    fs.writeFileSync(filepath, Buffer.from(buffer));
    console.log('✅ Arquivo salvo');
}

// Versão com warm-up igual ao seu código C
async function processWithWarmup(inputFile, outputFile) {
    console.log('🚀 Processando com warm-up (como no código C)...');
    
    const audio = readWavFile(inputFile);
    const processor = new RNNoiseProcessor();
    await processor.init();
    
    const processed = [];
    let warmupFrames = 2; // Como no seu código C: static bool first_frame = true
    
    for (let i = 0; i < audio.audioData.length; i += processor.frameSize) {
        const frame = audio.audioData.slice(i, i + processor.frameSize);
        
        if (frame.length < processor.frameSize) {
            // Frame incompleto - preencher com zeros
            const paddedFrame = new Float32Array(processor.frameSize);
            paddedFrame.set(frame);
            const result = processor.processFrame(paddedFrame);
            processed.push(...result.audio.slice(0, frame.length));
        } else {
            const result = processor.processFrame(frame);
            
            // ⚠️ CRÍTICO: Warm-up como no seu código C
            if (warmupFrames > 0) {
                // Durante warm-up, usar áudio original (não processado)
                processed.push(...frame);
                warmupFrames--;
            } else {
                // Após warm-up, usar áudio processado
                processed.push(...result.audio);
            }
        }
        
        // Progresso
        if (i > 0 && i % (processor.frameSize * 100) === 0) {
            const percent = ((i / audio.audioData.length) * 100).toFixed(1);
            console.log(`📈 ${percent}% processado`);
        }
    }
    
    writeWavFile(outputFile, Float32Array.from(processed), audio.sampleRate);
    processor.destroy();
}

// CLI principal
async function main() {
    const args = process.argv.slice(2);
    
    console.log('='.repeat(50));
    console.log('🎤 RNNoise CLI - Versão Corrigida');
    console.log('='.repeat(50));
    
    if (args.length < 2) {
        console.log('Uso: node cli-correct.js <entrada.wav> <saida.wav>');
        return;
    }
    
    const inputFile = args[0];
    const outputFile = args[1];
    
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Arquivo não encontrado: ${inputFile}`);
        return;
    }
    
    await processWithWarmup(inputFile, outputFile);
    console.log('\n🎉 PROCESSAMENTO CONCLUÍDO!');
}

main().catch(console.error);
