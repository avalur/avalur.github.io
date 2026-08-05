#!/usr/bin/env bash
# Downloads the Earth textures used by the globe stage.
# Run once, with network. After that the talk needs no network at all.
#
#   ./assets/fetch_assets.sh
set -euo pipefail

cd "$(dirname "$0")"
DEST="textures/earth"
mkdir -p "$DEST"

BASE="https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets"
FILES=(
	earth_atmos_2048.jpg
	earth_normal_2048.jpg
	earth_specular_2048.jpg
	earth_clouds_1024.png
	earth_lights_2048.png
)

for f in "${FILES[@]}"; do
	if [[ -s "$DEST/$f" ]]; then
		echo "= $f (уже есть)"
		continue
	fi
	echo "↓ $f"
	curl -fsSL --retry 3 -o "$DEST/$f" "$BASE/$f"
done

echo
echo "Готово. Текстуры лежат в $DEST"
echo "Крупные снимки для глубокого зума (patch_*.jpg) — см. assets/README.md"
