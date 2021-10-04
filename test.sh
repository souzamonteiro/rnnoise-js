#!/bin/sh

ffmpeg -y -i babble_15dB.opus -acodec pcm_s16le -f s16le -ac 1 -ar 48k babble_15dB.raw

rm -f babble_15dB_denoised.raw
rm -f babble_15dB_denoised.wav

node ./bin/maiascript.js maia/rnnoise.maia babble_15dB.raw babble_15dB_denoised.raw

ffmpeg -f s16le -ar 48k -ac 1 -i babble_15dB_denoised.raw babble_15dB_denoised.wav
