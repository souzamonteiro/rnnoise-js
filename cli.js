#!/usr/bin/env node

const RNNoiseNode = require('./rnnoise-node');
const fs = require('fs');
const path = require('path');
const wav = require('wavefile'); // npm install wavefile

class RNNoiseCLI {
    constructor() {
        this.processor = new RNNoiseNode();
    }

    async processWavFile(inputFile, outputFile) {
        await this.processor.init();
        
        try {
            // Ler arquivo WAV
            const wavFile = new wav.WaveFile(fs.readFileSync(inputFile));
            const audioData = wavFile.getSamples();
            
            if (wavFile.fmt.numChannels !== 1) {
                throw new Error('Apenas áudio mono é suportado');
            }

            const frameSize = 480; // Tamanho do frame do RNNoise
            const processedData = new Float32Array(audioData.length);

            // Processar em frames
            for (let i = 0; i < audioData.length; i += frameSize) {
                const frame = audioData.subarray(i, i + frameSize);
                const processedFrame = this.processor.processFrame(frame);
                processedData.set(processedFrame, i);
            }

            // Criar novo arquivo WAV
            const outputWav = new wav.WaveFile();
            outputWav.fromScratch(1, wavFile.fmt.sampleRate, '32f', processedData);
            
            fs.writeFileSync(outputFile, outputWav.toBuffer());
            console.log(`Arquivo processado: ${outputFile}`);

        } finally {
            this.processor.destroy();
        }
    }
}

// Uso via linha de comando
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Uso: node cli.js <arquivo_entrada.wav> <arquivo_saida.wav>');
        process.exit(1);
    }

    const cli = new RNNoiseCLI();
    cli.processWavFile(args[0], args[1]).catch(console.error);
}

module.exports = RNNoiseCLI;
