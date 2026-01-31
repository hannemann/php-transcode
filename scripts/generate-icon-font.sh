#!/bin/bash

# Icon Font Generation Script
# This script creates a custom icon font from MDI SVG icons

set -e

# Configuration
ICON_DIR="resources/icons"
OUTPUT_DIR="public/fonts"
TEMP_DIR="tmp/icons"

# Create directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

echo "🎨 Creating custom icon font for PHP Transcode Toolbox..."

# Step 1: Download MDI SVG icons
echo "📥 Downloading MDI SVG icons..."
cd "$TEMP_DIR"

# Read icon configuration and download each icon
while IFS= read -r line; do
    if [[ $line =~ '"mdi": *"([^"]+)"* ]]; then
        mdi_name="${BASH_REMATCH[1]}"
        echo "Downloading: $mdi_name"
        
        # Download SVG from MDI CDN
        curl -s "https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/${mdi_name}.svg" -o "${mdi_name}.svg" || {
            echo "⚠️  Failed to download: $mdi_name"
            continue
        }
    fi
done < "$ICON_DIR/icon-config.json"

# Step 2: Create icon font using fontforge (if available)
if command -v fontforge &> /dev/null; then
    echo "🔧 Generating font with FontForge..."
    
    # Create FontForge Python script
    cat > create_font.py << 'EOF'
import fontforge
import json
import os
import re

# Load icon configuration
with open('../icon-config.json', 'r') as f:
    config = json.load(f)

# Create new font
font = fontforge.font()
font.fontname = "PHPTranscodeIcons"
font.familyname = "PHP Transcode Icons"
font.fullname = "PHP Transcode Icons"
font.copyright = "PHP Transcode Toolbox"

# Unicode Private Use Area starting point
unicode_start = 0xe001

# Process each icon
for icon in config['icons']:
    svg_file = f"{icon['mdi']}.svg"
    
    if os.path.exists(svg_file):
        # Import SVG
        glyph = font.createGlyph(-1)
        glyph.importOutlines(svg_file)
        
        # Set glyph properties
        glyph.unicode = unicode_start
        glyph.glyphname = icon['name']
        
        # Set glyph metrics
        glyph.width = 1000
        glyph.vwidth = 1000
        
        # Center icon in em square
        glyph.left_side_bearing = 0
        glyph.right_side_bearing = 1000
        
        print(f"Added {icon['name']} at U+{unicode_start:04X}")
        unicode_start += 1
    else:
        print(f"Missing SVG for: {icon['mdi']}")

# Generate font files
font.generate("../php-transcode-icons.ttf")
font.generate("../php-transcode-icons.woff")
font.generate("../php-transcode-icons.woff2")
EOF

    # Run FontForge script
    fontforge -script create_font.py
    
elif command -v svg2ttf &> /dev/null; then
    echo "🔧 Generating font with svg2ttf..."
    
    # Combine all SVGs into a single SVG with proper Unicode mapping
    python3 << 'EOF'
import xml.etree.ElementTree as ET
import json

# Load configuration
with open('../icon-config.json', 'r') as f:
    config = json.load(f)

# Create SVG font structure
svg = ET.Element("svg", {
    "xmlns": "http://www.w3.org/2000/svg",
    "version": "1.1"
})

# Add font definition
font = ET.SubElement(svg, "font", {
    "id": "php-transcode-icons",
    "horiz-adv-x": "1024"
})

# Add font face
font_face = ET.SubElement(font, "font-face", {
    "font-family": "PHPTranscodeIcons",
    "units-per-em": "1024",
    "ascent": "960",
    "descent": "-64"
})

unicode_start = 0xe001

# Add each glyph
for icon in config['icons']:
    svg_file = f"{icon['mdi']}.svg"
    
    try:
        # Parse individual icon SVG
        icon_tree = ET.parse(svg_file)
        icon_root = icon_tree.getroot()
        
        # Find the path element
        path = icon_root.find('.//path')
        if path is not None:
            # Create glyph
            glyph = ET.SubElement(font, "glyph", {
                "unicode": f"&#{unicode_start:04x};",
                "glyph-name": icon['name'],
                "d": path.get('d', ''),
                "horiz-adv-x": "1024"
            })
            
            print(f"Added {icon['name']} at U+{unicode_start:04X}")
            unicode_start += 1
    except Exception as e:
        print(f"Error processing {svg_file}: {e}")

# Write combined SVG
tree = ET.ElementTree(svg)
tree.write("../combined-icons.svg", encoding='utf-8', xml_declaration=True)
EOF

    # Convert to TTF
    svg2ttf combined-icons.svg ../php-transcode-icons.ttf
    
    # Convert to WOFF using fontforge (if available) or online converter
    if command -v fontforge &> /dev/null; then
        fontforge -c "font.open('../php-transcode-icons.ttf').generate('../php-transcode-icons.woff')"
        fontforge -c "font.open('../php-transcode-icons.ttf').generate('../php-transcode-icons.woff2')"
    else
        echo "⚠️  FontForge not available for WOFF conversion"
        echo "   Use online converter: https://fontconverter.org"
        echo "   Convert php-transcode-icons.ttf to WOFF and WOFF2 formats"
    fi
    
else
    echo "❌ Neither FontForge nor svg2ttf found"
    echo "   Install one of these tools:"
    echo "   - FontForge: sudo apt-get install fontforge"
    echo "   - svg2ttf: pip install svg2ttf"
    exit 1
fi

# Step 3: Move fonts to output directory
echo "📁 Moving fonts to output directory..."
mv php-transcode-icons.* "$OUTPUT_DIR/"

# Step 4: Generate CSS fallback with Unicode characters
echo "📝 Creating CSS fallback file..."
cat > "$ICON_DIR/icons-fallback.css" << 'EOF'
/* Fallback CSS for icon font - Unicode character method */
.custom-icon {
    font-family: 'PHPTranscodeIcons', sans-serif;
    speak: none;
    display: inline-block;
    text-decoration: inherit;
    width: 1em;
    height: 1em;
    font-size: 1em;
    text-align: center;
}

/* Unicode fallbacks */
EOF

# Add unicode fallbacks
unicode_start = 0xe001
while IFS= read -r line; do
    if [[ $line =~ '"name": *"([^"]+)"* ]]; then
        name="${BASH_REMATCH[1]}"
        echo ".icon-$name::before { content: \"\\$unicode_start\"; }" >> "$ICON_DIR/icons-fallback.css"
        echo "Added unicode fallback for: $name"
        unicode_start=$((unicode_start + 1))
    fi
done < "$ICON_DIR/icon-config.json"

# Step 5: Clean up
echo "🧹 Cleaning up temporary files..."
cd ../
rm -rf "$TEMP_DIR"

echo "✅ Icon font generation complete!"
echo ""
echo "📦 Generated files:"
echo "   - $OUTPUT_DIR/php-transcode-icons.ttf"
echo "   - $OUTPUT_DIR/php-transcode-icons.woff" 
echo "   - $OUTPUT_DIR/php-transcode-icons.woff2"
echo ""
echo "🎯 Next steps:"
echo "   1. Copy fonts to your web server"
echo "   2. Import resources/css/icons.css in your app.css"
echo "   3. Update JavaScript components to use new icon system"
echo "   4. Remove iconify dependencies from package.json"
echo ""
echo "📚 See docs/icon-migration-guide.md for detailed migration instructions"