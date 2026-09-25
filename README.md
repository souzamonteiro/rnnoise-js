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
## Maia Reel visual theme

The interface uses the shared Maia Reel dark theme in `www/maia-reel.css`,
loaded after the app's layout styles. It is a local static asset: no CDN, build
step or new server is needed. Media processing and user-selected video title
styles remain under the original application code's control.

The canonical stylesheet and deployment instructions are maintained in the
sibling `maia-edge-apps-deployment` repository, in `themes/maia-reel.css` and
`docs/MEDIA-THEME.md`. The PWA cache has a new version and is scoped to this app.
