# RNNoise WebAssembly for JavaScript

Denoising audio using RNNoise in JavaScript/Node.js

## Quick Start

```javascript
import { RNNoiseNode } from './src/rnnoise-node.js';

const processor = new RNNoiseNode();
await processor.init();

const result = processor.processFrame(audioFrame);
console.log('VAD probability:', result.vad);
```

## CLI Usage

```bash
node src/cli.js input.wav output.wav
```

## Building from Source

```bash
./compile.sh
```

## Examples

See `/examples` folder for usage examples.