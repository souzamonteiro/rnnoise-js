#!/bin/sh

rm -rf build/*

CFLAGS="--memory-init-file 1 -s STRICT=0 -s MODULARIZE=1 -s WASM=0 -s EXPORT_ES6=0 -s USE_ES6_IMPORT_META=0"

OUTPUT_NAME="rnnoise.js"

emcc ${CFLAGS} -s EXPORT_NAME="NoiseModule" -s EXPORTED_FUNCTIONS="['_malloc', '_rnnoise_get_size', '_rnnoise_get_frame_size', '_rnnoise_init', '_rnnoise_create', '_rnnoise_destroy', '_rnnoise_process_frame', '_rnnoise_model_from_file', '_rnnoise_model_free']" -I ../rnnoise/include/ ../rnnoise/src/celt_lpc.c ../rnnoise/src/denoise.c ../rnnoise/src/kiss_fft.c ../rnnoise/src/pitch.c  ../rnnoise/src/rnn_data.c ../rnnoise/src/rnn.c ../rnnoise/src/rnn_reader.c -o build/${OUTPUT_NAME}

