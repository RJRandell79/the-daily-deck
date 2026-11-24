#!/usr/bin/env bash
# Builds the single-file game from src/.
#   ./build.sh        -> dist/index.html          (Claude prototype: all experiment toggles, shared test log)
#   ./build.sh itch   -> dist/itch/index.html     (itch.io playtest: candidate rules v1 fixed, results sent to
#                        your Google Sheet using the endpoint and token in itch.config.json) + a zip of it
set -e
cd "$(dirname "$0")"
MODE="${1:-claude}"
if [ "$MODE" = "itch" ]; then
  [ -f itch.config.json ] || { echo "itch.config.json not found — copy itch.config.example.json and add your Apps Script URL and token"; exit 1; }
  BUILD_JS=$(node -e '
    const c = require("./itch.config.json");
    if (!c.endpoint || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(c.endpoint) && !c.allowAnyEndpoint) { console.error("itch.config.json: endpoint should be your Apps Script web app URL ending in /exec"); process.exit(1); }
    if (!c.token) { console.error("itch.config.json: add a token (any short random text, the same as in the Apps Script)"); process.exit(1); }
    process.stdout.write("const DD_BUILD = " + JSON.stringify({ mode: "itch", endpoint: c.endpoint, token: c.token }) + ";\n");')
  OUT=dist/itch; TITLE="The Daily Deck — Playtest"
else
  BUILD_JS='const DD_BUILD = { mode: "claude" };'
  OUT=dist; TITLE="The Daily Deck — Prototype"
fi
mkdir -p "$OUT"
{
echo "<!DOCTYPE html><html lang=\"en-GB\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>$TITLE</title><style>"
cat src/style.css
echo '</style></head><body><main id="app"></main><div id="bar"></div><div id="tip" role="status"></div><script>'
echo "$BUILD_JS"
cat src/engine.js
cat src/log.js
cat src/remote.js
cat src/ui.js
echo '</script></body></html>'
} > "$OUT/index.html"
echo "Built $OUT/index.html"
if [ "$MODE" = "itch" ]; then
  python3 -c "import zipfile; z=zipfile.ZipFile('dist/the-daily-deck-itch.zip','w',zipfile.ZIP_DEFLATED); z.write('dist/itch/index.html','index.html'); z.close()"
  echo "Built dist/the-daily-deck-itch.zip (upload this, or dist/itch/index.html, to itch.io)"
fi
