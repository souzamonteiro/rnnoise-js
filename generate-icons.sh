#!/bin/bash

# Script to generate all the icons for the RNNoise Denoiser PWA

echo "Generating icons for the RNNoise Denoiser PWA..."

rm -rf www/icons
mkdir -p www/icons

# Check if the SVG file exists
if [ ! -f "icons/icon.svg" ]; then
    echo "Error: file icons/icon.svg not found!"
    exit 1
fi

# Install dependencies if necessary
# echo "Checking dependencies..."
# if ! command -v convert &> /dev/null; then
#     echo "Installing ImageMagick..."
#     sudo apt update && sudo apt install -y imagemagick
# fi

# if ! command -v rsvg-convert &> /dev/null; then
#     echo "Installing librsvg..."
#     sudo apt update && sudo apt install -y librsvg2-bin
# fi

# Required sizes for PWA
sizes=(16 32 72 96 128 144 152 180 192 384 512)

echo "Generating PNG icons..."
for size in "${sizes[@]}"; do
    echo "  Creating icon-${size}x${size}.png"
    rsvg-convert -w $size -h $size icons/icon.svg -o icons/icon-${size}x${size}.png
done

# Specific icons
echo "Generating special icons..."
rsvg-convert -w 32 -h 32 icons/icon.svg -o icons/favicon-32.png
rsvg-convert -w 16 -h 16 icons/icon.svg -o icons/favicon-16.png
rsvg-convert -w 180 -h 180 icons/icon.svg -o icons/apple-touch-icon.png

# Favicon ICO (with multiple sizes)
echo "Creating favicon.ico..."
convert icons/favicon-16.png icons/favicon-32.png icons/favicon.ico

echo "Generating updated manifest.json..."
cat > www/manifest.json << EOF
{
  "name": "RNNoise Denoiser",
  "short_name": "RNNoiseDenoiser",
  "start_url": "./index.html",
  "display": "standalone",
  "theme_color": "#3498db",
  "background_color": "#f5f7fa",
  "description": "A web-based audio denoiser using RNNoise and WebAssembly.",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
EOF

echo "✅ Icons generated successfully in the 'icons/' folder!"
echo "📁 Contents of the icons folder:"
ls -la icons/

# Copy generated icons to www/icons folder
cp icons/* www/icons/
echo "📁 Icons copied to www/icons/"
echo "Script completed."
