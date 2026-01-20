#!/bin/sh

FFMPEG_PATH=~/Projects/ffmpeg-wasm-browser/test/src/FFmpeg-n5.1.4/ffmpeg
#FFMPEG_PATH=ffmpeg

$FFMPEG_PATH -i audio/babble_15dB.opus -c pcm_s16le -f s16le -ar 48000 -ac 1 audio/babble_15dB.pcm -y
$FFMPEG_PATH -i audio/babble_15dB.opus audio/babble_15dB.wav -y

rm audio/babble_10dB_denoised.wav
rm audio/babble_15dB_denoised.wav

node cli.js audio/babble_10dB.wav audio/babble_10dB_denoised.wav
node cli.js audio/babble_15dB.wav audio/babble_15dB_denoised.wav

#$FFMPEG_PATH -f s16le -ar 48k -ac 1 -i babble_15dB_denoised.pcm babble_15dB_denoised.wav