#!/bin/bash

source ~/emsdk/emsdk_env.sh

rm rnnoise.js rnnoise.wasm

emcc \
    -O3 \
    -s WASM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s ENVIRONMENT='node' \
    -s EXPORT_NAME='createRNNoiseModule' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s EXPORTED_FUNCTIONS='[
        "_rnnoise_create_wasm", 
        "_rnnoise_destroy_wasm", 
        "_rnnoise_process_frame_wasm", 
        "_rnnoise_process_buffer_wasm",
        "_get_frame_size", 
        "_malloc", 
        "_free"
    ]' \
    -s EXPORTED_RUNTIME_METHODS='[
        "ccall", 
        "cwrap",
        "getValue",
        "setValue",
        "HEAPU8",
        "HEAPF32",
        "HEAP32",
        "UTF8ToString",
        "AsciiToString"
    ]' \
    -s INITIAL_MEMORY=16777216 \
    -I rnnoise/src \
    -I rnnoise/include \
    rnnoise/src/denoise.c \
    rnnoise/src/rnn.c \
    rnnoise/src/rnn_data.c \
    rnnoise/src/kiss_fft.c \
    rnnoise/src/celt_lpc.c \
    rnnoise/src/pitch.c \
    rnnoise_wrapper.c \
    -o rnnoise.js

