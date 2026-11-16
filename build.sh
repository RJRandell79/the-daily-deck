#!/usr/bin/env bash
# Builds the single-file prototype at dist/index.html from src/
set -e
cd "$(dirname "$0")"
mkdir -p dist
{
echo '<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The Daily Deck — Prototype</title><style>'
cat src/style.css
echo '</style></head><body><main id="app"></main><div id="bar"></div><div id="tip" role="status"></div><script>'
cat src/engine.js
cat src/log.js
cat src/ui.js
echo '</script></body></html>'
} > dist/index.html
echo "Built dist/index.html"
