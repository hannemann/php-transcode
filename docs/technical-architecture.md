# Technical Architecture Deep Dive

## Application Flow

### Request Processing
1. **HTTP Request** → Laravel Router (`routes/web.php`)
2. **Controller** → Validates input via Form Requests
3. **Job Dispatch** → `ProcessVideo` queued for background processing
4. **WebSocket Events** → Real-time progress updates to frontend
5. **FFmpeg Execution** → Backend models execute video operations
6. **Completion** → Results broadcasted, file picker updated

### Video Processing Pipeline

#### Single File Transcoding
```
Video File → Stream Analysis → User Configuration → FFmpeg Command → Output File
```

#### Multi-Clip Processing
```
Multiple Files → Concat Preparation → Stream Analysis → Configuration → Transcode → Output
```

## Backend Architecture

### Laravel Structure

#### Controllers (`app/Http/Controllers/`)
- **TranscodeController**: Main orchestration for transcoding operations
- **ClipperController**: Frame extraction and thumbnail generation
- **PlayerController**: HLS streaming endpoints
- **ConcatController**: File concatenation operations
- **ScaleController**: Video resizing
- **CropController**: Video cropping
- **DelogoController**: Channel logo removal
- **RemovelogoController**: Custom logo mask processing

#### Models (`app/Models/`)

##### Video Processing (`app/Models/Video/`)
- **File.php**: Core video file handling, FFProbe integration
- **Stream analysis and metadata extraction**
- **Media object creation and management**

##### FFmpeg Actions (`app/Models/FFMpeg/Actions/`)
- **AbstractAction.php**: Base class for all FFmpeg operations
- **Transcode.php**: Main transcoding implementation
- **Concat.php**: File concatenation
- **Scale.php**: Video resizing with hardware acceleration
- **Crop.php**: Video cropping operations
- **DelogoCPU.php**: Software-based logo removal
- **Helper classes**:
  - `CodecMapper`: Stream-to-codec mapping
  - `OutputMapper`: Output stream configuration
  - `ConcatDemuxer`: Multi-file handling
  - `Libx264Options`: H.264 encoding parameters

##### Filters (`app/Models/FFMpeg/Filters/Video/`)
- **ClipFromToFilter**: Time-based trimming
- **ComplexConcat**: Multi-stream concatenation
- **FilterGraph**: Custom filter chain management

##### Formats (`app/Models/FFMpeg/Format/Video/`)
- **h264_vaapi.php**: Hardware-accelerated H.264 encoding
- **Custom format configurations for different codecs**

### Job Processing (`app/Jobs/`)

#### ProcessVideo Job
- **Queue Management**: Separate queues for different operation types
- **Progress Tracking**: Real-time updates via WebSocket events
- **Error Handling**: Comprehensive exception handling with logging
- **Timeout Management**: 3600-second timeout for long operations
- **State Management**: Pending → Running → Done/Failed states

#### CurrentQueue Model
- **Database Tracking**: SQLite-based job state persistence
- **Progress Metrics**: Percentage, rate, remaining time
- **Error Storage**: Detailed error messages for debugging

### Frontend Architecture (Pure Vanilla Web Components)

#### Philosophy: Framework-Free Frontend
The frontend is built with a **strictly vanilla approach** - absolutely NO rendering frameworks like Vue.js or React. All components use the native Web Components API for maximum performance and minimal dependencies.

#### Component System (`resources/js/components/`)

##### Core Components (Native Web Components)
- **Transcoder.js**: Main application shell and routing (custom element)
- **FilePicker/**: Hierarchical file browser with security (custom elements)
- **Configurator/**: Video processing configuration interface (custom elements)
- **Statusbar/**: Real-time job progress monitoring (custom elements)

##### Configurator Subcomponents
- **Streams/**: Per-stream codec and format configuration (custom elements)
- **Clips/**: Timeline-based clip marking interface (custom elements)
- **Dialogues/**: Modal interfaces for specific operations (custom elements)
- **Tools/**: Quick action toolbar (custom elements)

##### Utility Components
- **Request/**: HTTP client wrapper with error handling (plain JavaScript)
- **Toast/**: Notification system (custom element)
- **Modal/**: Reusable modal framework (custom element)
- **Icons/**: Material Design Icons integration (iconify utility)
- **Sortable**: Drag and drop functionality (html5sortable utility)
- **Image Editor**: Logo mask creation (painterro utility)

#### Real-time Communication (Vanilla JavaScript)
- **Laravel Echo + Pusher**: WebSocket client implementation (utility only)
- **Event-driven updates**: Progress, file changes, status updates
- **Channel-based communication**: Separate channels for different data types
- **Native event handling**: Using native DOM events and CustomEvent API

#### Styling System (Pure CSS)
- **CSS Custom Properties**: Theme system with light/dark modes
- **Grid-based layouts**: Responsive design system
- **Component-scoped styles**: Encapsulation via native Shadow DOM
- **Material Design**: Consistent UI patterns (CSS implementation)
- **No CSS frameworks**: Pure PostCSS with custom properties
- **Minimal dependencies**: Only essential utility libraries (iconify, hls.js, html5sortable, painterro)

## Database Schema

### CurrentQueue Table
```sql
- id: Primary key
- path: File path being processed
- streams: JSON configuration of selected streams
- clips: JSON clip configuration
- type: Operation type (transcode, concat, etc.)
- state: Processing state (pending, running, done, failed)
- percentage: Progress percentage
- rate: Processing speed
- remaining: Estimated remaining time
- start/end: Timestamps
- exception: Error details if failed
```

### Users Table
- Basic Laravel authentication for security

## Configuration System

### Laravel Configuration (`config/`)
- **transcode.php**: Codec definitions and quality settings
- **filesystems.php**: Storage disk configurations
- **laravel-ffmpeg.php**: FFmpeg binary paths and options
- **queue.php**: Job queue configuration

### Environment Variables
- **Media Paths**: Host/container directory mappings
- **GPU Access**: VAAPI device configuration
- **Codec Preferences**: Default encoding parameters
- **WebSocket Settings**: Real-time communication configuration

## Security Architecture

### File System Security
- **Restricted Access**: File picker limited to configured directories
- **Path Validation**: Prevents directory traversal attacks
- **Internal File Protection**: Prevents deletion of system files

### Authentication
- **Laravel Sanctum**: API token-based authentication
- **Session Management**: Secure session handling

### Input Validation
- **Form Requests**: Comprehensive input validation
- **FFmpeg Parameter Sanitization**: Prevents command injection
- **File Type Validation**: Ensures only video files are processed

## Performance Optimizations

### Hardware Acceleration
- **VAAPI Support**: Intel/AMD GPU acceleration
- **Memory Management**: Efficient buffer handling
- **Format Conversion**: Optimized pixel format conversions

### Asynchronous Processing
- **Queue System**: Non-blocking operation handling
- **Progress Streaming**: Real-time updates without polling
- **Resource Management**: Controlled concurrent operations

### Frontend Optimizations (Vanilla JavaScript)
- **Lazy Loading**: Native web components loaded on demand
- **Efficient DOM Updates**: Native Shadow DOM minimizes reflows
- **Web Workers**: Heavy computations off main thread
- **No Framework Overhead**: Direct browser API usage for maximum performance
- **Minimal Bundle Size**: Only essential utilities, no framework code
- **Native Event System**: Using CustomEvent API for component communication

## Error Handling

### Backend
- **Exception Handling**: Comprehensive try-catch blocks
- **FFmpeg Error Parsing**: Detailed error extraction
- **Job Recovery**: Failed job retry mechanisms
- **Logging**: Detailed error logging for debugging

### Frontend
- **Network Error Handling**: Graceful degradation
- **User Feedback**: Clear error messages
- **Recovery Options**: Retry mechanisms where appropriate

## Testing Strategy

### Backend Tests
- **Unit Tests**: Model and service layer testing
- **Feature Tests**: HTTP endpoint testing
- **Job Tests**: Queue processing validation

### Frontend Tests
- **Component Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Complete user workflow validation

## Deployment Considerations

### Docker Deployment
- **Multi-stage Builds**: Optimized image sizes
- **GPU Passthrough**: Hardware acceleration support
- **Volume Mounts**: Persistent storage configuration
- **Network Isolation**: Security boundaries

### Scaling Considerations
- **Horizontal Scaling**: Multiple queue workers
- **Load Balancing**: Request distribution
- **Database Scaling**: SQLite limitations for multi-user scenarios
- **File Storage**: Distributed file system options