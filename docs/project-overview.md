# PHP Transcode Toolbox - Project Overview

## Project Purpose

PHP Transcode Toolbox is a web-based video processing application designed specifically for creating frame-perfect cuts from DVB (Digital Video Broadcasting) recordings. It provides a browser-based GUI for FFmpeg operations with hardware acceleration support via VAAPI for Intel and AMD integrated GPUs.

## Core Problem Solved

The application addresses the complexity of cutting DVB recordings where:

- Movies might be 4:3 while commercials are 16:9 (resolution changes cause encode failures)
- Audio streams may change during content
- Multiple complicated FFmpeg commands are typically required

## Architecture Overview

### Backend (Laravel PHP)

- **Framework**: Laravel 12.0 with PHP 8.3
- **Key Packages**:
    - `pbmedia/laravel-ffmpeg` - FFmpeg integration
    - `laravel/reverb` - WebSocket support
    - `laravel/sanctum` - Authentication
- **Database**: SQLite (lightweight, suitable for this single-user tool)

### Frontend (Vanilla Web Components)

- **Philosophy**: Completely vanilla approach - NO frontend rendering frameworks like Vue.js or React
- **Technology Stack**: Pure HTML, CSS, JavaScript with Web Components API
- **Key Libraries** (utility only, no rendering):
    - `hls.js` - HLS video playback (media utility)
    - `media-chrome` - Media player UI (media controls)
    - Laravel Echo + Pusher - Real-time communication (WebSocket client)
    - `html5sortable` - Drag and drop functionality (utility only)
    - `painterro` - Image editor for logo masks (utility only)

### Docker Support

- Complete containerized setup with Laravel Sail
- Hardware acceleration support via GPU device access
- Pre-configured FFmpeg binaries

## Key Features

### Video Processing Operations

1. **Concat** - Join multiple video files
2. **Transcode** - Convert video/audio codecs with hardware acceleration
3. **Scale** - Resize video dimensions
4. **Crop** - Remove unwanted portions
5. **Remux** - Change container format (MP4, MKV, TS)
6. **Clipper** - Frame-perfect cutting interface
7. **DeLogo/RemoveLogo** - Channel logo removal filters

### Supported Codecs

- **Video**: H.264 (VAAPI), H.265 (VAAPI), Copy
- **Audio**: AAC, AC3, FLAC, Copy
- **Subtitles**: DVB, DVD subtitle support

### User Interface

- File picker for browsing recordings
- Real-time progress tracking via WebSockets
- Frame-by-frame navigation in clipper
- Stream configuration per video/audio track
- Chapter support for commercial break navigation

## Project Structure

### Backend Controllers

- `TranscodeController` - Main transcoding operations
- `ClipperController` - Frame extraction and clipping
- `PlayerController` - HLS streaming for playback
- `ConcatController`, `ScaleController`, etc. - Specific operations

### Core Models

- `Video/File` - Video file handling and FFProbe integration
- `FFMpeg/Actions/*` - Individual FFmpeg operation implementations
- `CurrentQueue` - Job tracking and progress management
- `FilePicker` - File system browsing with security controls

### Frontend Components (Pure Web Components)

- `Transcoder` - Main application shell (custom element)
- `TranscodeConfigurator` - Video processing configuration UI (custom element)
- `FilePicker` - File browser component (custom element)
- Various dialog components for specific operations (custom elements)
- **No framework dependencies** - All components use native Web Components API with Shadow DOM

### Job Processing

- `ProcessVideo` job handles all FFmpeg operations
- Queue-based processing with progress tracking
- Real-time status updates via WebSockets
- Error handling and recovery mechanisms

## Configuration

### Environment Variables

- `MEDIA_PATH_HOST` - Local recordings directory
- `MEDIA_PATH_CONTAINER` - Container path mapping
- `VAAPI_DEVICE` - GPU device for hardware acceleration
- Codec preferences and quality settings

### Storage Configuration

- Supports local filesystem and external storage
- Separate disk configuration for recordings
- Security controls for file access

## Development Workflow

### Docker Development

```bash
./run                    # Start containers
vendor/bin/sail npm run watch  # Asset compilation
vendor/bin/sail down     # Stop containers
```

### Asset Pipeline

- Laravel Mix for asset compilation
- PostCSS for styling
- Custom web components build system (no build step required for components)
- **Vanilla JavaScript** - ES6+ features, no transpilation needed

## Deployment Options

### Docker (Recommended)

- Complete isolated environment
- GPU passthrough for acceleration
- Easy configuration and scaling

### Native Installation

- Ubuntu 20.04+ support
- Requires PHP 8.3, FFmpeg, Nginx
- Systemd service configurations provided

## Security Considerations

- File picker restricts access to configured directories
- Authentication via Laravel Sanctum
- Input validation for all FFmpeg parameters
- Container isolation for production deployments

## Performance Optimizations

- Hardware video encoding via VAAPI
- Asynchronous job processing
- Real-time progress updates without page refreshes
- Efficient file streaming for large video files
- **Vanilla frontend performance** - No framework overhead, direct DOM manipulation
- **Lightweight components** - Minimal JavaScript bundle size with native Web Components
