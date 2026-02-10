#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "== StarMap Release Process =="

DATE=$(date +%Y-%m-%d_%H%M)

echo "Cleaning build artifacts..."
rm -rf dist .astro node_modules

echo "Installing dependencies..."
npm ci

echo "Validating..."
npm run validate:all

echo "Building..."
npm run build

echo "Zipping dist..."
rm -f starmap-upload.zip
cd dist
zip -r ../starmap-upload.zip .
cd ..

echo "Archiving release..."
mkdir -p _releases
cp -f starmap-upload.zip "_releases/starmap-upload-$DATE.zip"

echo "Creating source archive..."
rm -f starmap-site-source.zip
zip -r starmap-site-source.zip \
  astro.config.mjs package.json package-lock.json \
  src public scripts codex README.md tsconfig.json vite.config.js \
  -x "node_modules/*" -x "dist/*" -x ".astro/*"

echo "Syncing source to shared StarMap folder..."
mkdir -p ~/storage/shared/StarMap
cp -f starmap-site-source.zip ~/storage/shared/StarMap/

echo ""
echo "Release complete."
echo "Upload file: starmap-upload.zip"
echo "Archived copy: _releases/starmap-upload-$DATE.zip"
