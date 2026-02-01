#!/bin/bash

# Simple Icon Font Generator - Failsafe Version
# Creates a basic icon font without complex dependencies

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ICON_DIR="$PROJECT_ROOT/resources/icons"
OUTPUT_DIR="$PROJECT_ROOT/public/fonts"
TEMP_DIR="$PROJECT_ROOT/tmp/icons"

# Create directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

echo "🎨 Creating simple icon font for PHP Transcode Toolbox..."

# Check if icon config exists
if [ ! -f "$ICON_DIR/icon-config.json" ]; then
    echo "❌ Error: Icon config file not found at $ICON_DIR/icon-config.json"
    exit 1
fi

echo "Script dir: $SCRIPT_DIR"
echo "Project root: $PROJECT_ROOT"
echo "Icon config: $ICON_DIR/icon-config.json"
echo "Output dir: $OUTPUT_DIR"

# Step 1: Download MDI SVG icons
echo "📥 Downloading MDI SVG icons..."
cd "$TEMP_DIR"

# Download only the icons we need
echo "Downloading required icons..."
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-close.svg" -o "mdi-close.svg" || echo "Failed: mdi-close"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-play.svg" -o "mdi-play.svg" || echo "Failed: mdi-play"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-chevron-down.svg" -o "mdi-chevron-down.svg" || echo "Failed: mdi-chevron-down"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-chevron-right.svg" -o "mdi-chevron-right.svg" || echo "Failed: mdi-chevron-right"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-menu-down-outline.svg" -o "mdi-menu-down.svg" || echo "Failed: mdi-menu-down"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-content-save-outline.svg" -o "mdi-content-save-outline.svg" || echo "Failed: mdi-content-save-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-tools.svg" -o "mdi-tools.svg" || echo "Failed: mdi-tools"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-scissors.svg" -o "mdi-scissors.svg" || echo "Failed: mdi-scissors"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-content-copy.svg" -o "mdi-content-copy.svg" || echo "Failed: mdi-content-copy"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-plus-outline.svg" -o "mdi-plus-outline.svg" || echo "Failed: mdi-plus-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-minus-outline.svg" -o "mdi-minus-outline.svg" || echo "Failed: mdi-minus-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-plus-box-outline.svg" -o "mdi-plus-box-outline.svg" || echo "Failed: mdi-plus-box-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-minus-box-outline.svg" -o "mdi-minus-box-outline.svg" || echo "Failed: mdi-minus-box-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-trash-can-outline.svg" -o "mdi-trash-can-outline.svg" || echo "Failed: mdi-trash-can-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-reload.svg" -o "mdi-reload.svg" || echo "Failed: mdi-reload"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-cog-outline.svg" -o "mdi-cog-outline.svg" || echo "Failed: mdi-cog-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-loading.svg" -o "mdi-loading.svg" || echo "Failed: mdi-loading"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-circle-outline.svg" -o "mdi-circle-outline.svg" || echo "Failed: mdi-circle-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-thumb-up-outline.svg" -o "mdi-thumb-up-outline.svg" || echo "Failed: mdi-thumb-up-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-alert-box-outline.svg" -o "mdi-alert-box-outline.svg" || echo "Failed: mdi-alert-box-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-alert-outline.svg" -o "mdi-alert-outline.svg" || echo "Failed: mdi-alert-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-alert-circle-outline.svg" -o "mdi-alert-circle-outline.svg" || echo "Failed: mdi-alert-circle-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-skull-crossbones-outline.svg" -o "mdi-skull-crossbones-outline.svg" || echo "Failed: mdi-skull-crossbones-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-folder.svg" -o "mdi-folder.svg" || echo "Failed: mdi-folder"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-filmstrip.svg" -o "mdi-filmstrip.svg" || echo "Failed: mdi-filmstrip"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-note-text-outline.svg" -o "mdi-note-text-outline.svg" || echo "Failed: mdi-note-text-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-file-image-outline.svg" -o "mdi-file-image-outline.svg" || echo "Failed: mdi-file-image-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-file.svg" -o "mdi-file.svg" || echo "Failed: mdi-file"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-motion-play-outline.svg" -o "mdi-motion-play-outline.svg" || echo "Failed: mdi-motion-play-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-swap-vertical-bold.svg" -o "mdi-swap-vertical-bold.svg" || echo "Failed: mdi-swap-vertical-bold"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-swap-horizontal-bold.svg" -o "mdi-swap-horizontal-bold.svg" || echo "Failed: mdi-swap-horizontal-bold"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-mouse.svg" -o "mdi-mouse.svg" || echo "Failed: mdi-mouse"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-checkbox-blank-outline.svg" -o "mdi-checkbox-blank-outline.svg" || echo "Failed: mdi-checkbox-blank-outline"
curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/mdi-checkbox-marked-outline.svg" -o "mdi-checkbox-marked-outline.svg" || echo "Failed: mdi-checkbox-marked-outline"

echo "✅ Downloaded $(ls -1 *.svg | wc -l) SVG icons"

# Step 2: Create a simple SVG font
echo "🔧 Creating basic SVG font..."

# Create SVG font with proper structure
cat > "$TEMP_DIR/php-transcode-icons.svg" << 'EOF'
<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg">
<metadata>
  <font-face>
    <font-family>PHPTranscodeIcons</font-family>
    <units-per-em>1024</units-per-em>
    <ascent>960</ascent>
    <descent>-64</descent>
  </font-face>
</metadata>
<defs>
  <font id="php-transcode-icons" horiz-adv-x="1024">
    <font-face font-family="PHPTranscodeIcons" units-per-em="1024" ascent="960" descent="-64"/>
EOF

# Add each icon as a glyph
unicode_start=57345  # 0xe001

for svg_file in *.svg; do
    if [ -f "$svg_file" ]; then
        # Extract the path data
        path_data=$(grep -o 'd="[^"]*"' "$svg_file" | sed 's/d="\([^"]*\)"/\1/' 2>/dev/null || echo '')
        
        if [ -n "$path_data" ]; then
            # Get icon name from filename
            icon_name=$(basename "$svg_file" .svg | sed 's/^mdi-//')
            
            # Add glyph to font
            echo "    <glyph glyph-name=\"$icon_name\" unicode=\"&#$(printf '%d' $unicode_start);\" horiz-adv-x=\"1024\" d=\"$path_data\"/>" >> "$TEMP_DIR/php-transcode-icons.svg"
            echo "Added glyph for: $icon_name (U+$(printf 'X' $unicode_start))"
            
            unicode_start=$((unicode_start + 1))
        else
            echo "⚠️  Could not extract path from: $svg_file"
        fi
    fi
done

# Close SVG font structure
echo "  </font>
</defs>
</svg>
EOF

echo "✅ Created SVG font structure"

# Step 3: Try to convert to TFF with available tools
echo "🔧 Attempting to convert to TTF..."

# Method 1: Try using online converter (download a pre-made font)
echo "Attempting to download pre-compiled font..."
curl -s "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu5mxPKT1U.woff2" -o "$OUTPUT_DIR/temp-font.woff2" || echo "No pre-compiled font available"

# Method 2: Try simple tools
if command -v convert &> /dev/null; then
    echo "Using ImageMagick convert..."
    convert "$TEMP_DIR/php-transcode-icons.svg" "$OUTPUT_DIR/php-transcode-icons.ttf" || echo "ImageMagick conversion failed"
elif command -v fontforge &> /dev/null; then
    echo "Using FontForge..."
    fontforge -c "
font = fontforge.open('$TEMP_DIR/php-transcode-icons.svg')
font.generate('$OUTPUT_DIR/php-transcode-icons.ttf')
" || echo "FontForge conversion failed"
elif python3 -c "import sys; sys.exit(0 if 'svg2ttf' in sys.modules else 1)" 2>/dev/null; then
    echo "Using svg2ttf..."
    python3 -c "
import svg2ttf
try:
    svg2ttf('$TEMP_DIR/php-transcode-icons.svg', '$OUTPUT_DIR/php-transcode-icons.ttf')
except Exception as e:
    print(f'svg2ttf failed: {e}')
" || echo "svg2ttf conversion failed"
else
    echo "⚠️  No font conversion tools available"
    echo "   Copying SVG font as fallback..."
    cp "$TEMP_DIR/php-transcode-icons.svg" "$OUTPUT_DIR/php-transcode-icons.svg"
fi

# Step 4: Create updated CSS with correct paths
echo "📝 Creating updated CSS..."
cat > "$PROJECT_ROOT/resources/css/icons-simple.css" << 'EOF'
/* Simple Icon Font for PHP Transcode Toolbox */
@font-face {
  font-family: 'PHPTranscodeIcons';
  src: url('../fonts/php-transcode-icons.ttf') format('truetype'),
       url('../fonts/php-transcode-icons.svg') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

/* Base icon styles */
.custom-icon {
  font-family: 'PHPTranscodeIcons';
  font-style: normal;
  font-weight: normal;
  speak: none;
  display: inline-block;
  text-decoration: inherit;
  width: 1em;
  height: 1em;
  font-size: 1em;
  text-align: center;
  vertical-align: middle;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Icon mappings - using Unicode values */
.icon-close::before { content: "󰁁"; }
.icon-play::before { content: "󰁂"; }
.icon-chevron-down::before { content: "󰁃"; }
.icon-chevron-right::before { content: "󰁄"; }
.icon-menu-down::before { content: "󰁅"; }
.icon-save::before { content: "󰁆"; }
.icon-tools::before { content: "󰁇"; }
.icon-scissors::before { content: "󰁈"; }
.icon-copy::before { content: "󰁉"; }
.icon-plus::before { content: "󰁊"; }
.icon-minus::before { content: "󰁋"; }
.icon-plus-box::before { content: "󰁌"; }
.icon-minus-box::before { content: "󰁍"; }
.icon-trash::before { content: "󰁎"; }
.icon-reload::before { content: "󰁏"; }
.icon-cog::before { content: "󰁐"; }
.icon-loading::before { content: "󰁑"; }
.icon-circle-outline::before { content: "󰁒"; }
.icon-thumb-up::before { content: "󰁓"; }
.icon-alert-box::before { content: "󰁔"; }
.icon-alert::before { content: "󰁕"; }
.icon-alert-circle::before { content: "󰁖"; }
.icon-skull::before { content: "󰁗"; }
.icon-folder::before { content: "󰁘"; }
.icon-filmstrip::before { content: "󰁙"; }
.icon-note-text::before { content: "󰁚"; }
.icon-file-image::before { content: "󰁛"; }
.icon-file::before { content: "󰁜"; }
.icon-motion-play::before { content: "󰁝"; }
.icon-swap-vertical::before { content: "󰁞"; }
.icon-swap-horizontal::before { content: "󰁟"; }
.icon-mouse::before { content: "󰁠"; }
.icon-checkbox-blank::before { content: "󰁡"; }
.icon-checkbox-marked::before { content: "󰁢"; }

/* Additional styles copied from original */
.icon-stack {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  font-size: 1.5rem;
}

.icon-stack .custom-icon {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.icon-stack .custom-icon:first-child {
  opacity: 0.7;
}

.icon-stack .custom-icon:last-child {
  opacity: 0;
  transform: scale(0.8);
}

.icon-stack:hover .custom-icon:first-child {
  opacity: 0.4;
}

.icon-stack:hover .custom-icon:last-child {
  opacity: 1;
  transform: scale(1);
}

.icon-success { color: var(--clr-success, #4caf50); }
.icon-info { color: var(--clr-info, #2196f3); }
.icon-warning { color: var(--clr-warning, #ff9800); }
.icon-error { color: var(--clr-error, #f44336); }
.icon-muted { color: var(--clr-muted, #9e9e9e); }

.icon-active {
  color: var(--active-icon-clr, var(--clr-enlightened, #ffffff));
  filter: var(--active-icon-glow, drop-shadow(0px 0px 5px rgba(255,255,255,0.3)));
}

.icon-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

div.success .custom-icon.icon-thumb-up,
div.info .custom-icon.icon-alert-box,
div.warning .custom-icon.icon-alert,
div.error .custom-icon.icon-alert-circle
{ color: var(--clr-success, #4caf50), var(--clr-info, #2196f3), var(--clr-warning, #ff9800), var(--clr-error, #f44336)); }
EOF

echo "✅ Created simple CSS with Unicode fallbacks"

# Step 5: Clean up
echo "🧹 Cleaning up temporary files..."
cd "$PROJECT_ROOT"
rm -rf "$TEMP_DIR"
rm -f "$OUTPUT_DIR/temp-font.woff2"

# Step 6: Report results
echo ""
echo "✅ Simple icon font generation complete!"
echo ""
echo "📦 Generated files:"
if [ -f "$OUTPUT_DIR/php-transcode-icons.ttf" ]; then
    echo "   ✅ $OUTPUT_DIR/php-transcode-icons.ttf"
fi
if [ -f "$OUTPUT_DIR/php-transcode-icons.svg" ]; then
    echo "   ✅ $OUTPUT_DIR/php-transcode-icons.svg (fallback)"
fi
echo "   ✅ $PROJECT_ROOT/resources/css/icons-simple.css"
echo ""
echo "🎯 Next steps:"
echo "   1. Add to app.css: @import '../css/icons-simple.css';"
echo "   2. Remove iconify: npm uninstall @iconify/iconify @iconify/icons-mdi"
echo "   3. Test components with new icon system"
echo ""
echo "💡 If TTF generation failed, you can:"
echo "   - Use the SVG fallback font"
echo "   - Convert manually with online tools"
echo "   - Install fontforge or svg2ttf for better results"