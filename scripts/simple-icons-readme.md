# Simple Icon Font Generator (Failsafe Version)

This is a simplified version that works reliably without external dependencies.

## Usage

```bash
# Make executable
chmod +x scripts/generate-simple-icons.sh

# Run script
./scripts/generate-simple-icons.sh
```

## What it does:

1. **Downloads SVGs** from Material Design Icons CDN
2. **Creates basic SVG font** with proper Unicode mapping  
3. **Generates TTF file** (working format)
4. **Moves fonts** to public/fonts directory

## Prerequisites

- Just curl (no fontforge or svg2ttf needed)
- Basic shell tools (sed, grep, etc.)

## Generated Files

- `public/fonts/php-transcode-icons.ttf` - Main font file
- `resources/css/icons-simple.css` - Updated CSS paths

## Testing

After running, add to your CSS:
```css
@import '../css/icons-simple.css';
```

This version is less feature-rich but should work reliably on most systems.