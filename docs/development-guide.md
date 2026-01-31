# Development Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git
- Modern web browser (Chrome/Firefox/Edge)

### Initial Setup
```bash
git clone <repository-url>
cd php-transcode
cp .env.example .env
# Edit .env to set MEDIA_PATH_HOST to your recordings directory
./run  # Start Docker containers
```

### Development Commands
```bash
# Start containers
./run

# Access shell in container
./exec bash

# Asset compilation (watch mode)
vendor/bin/sail npm run watch

# Production build
vendor/bin/sail npm run production

# Stop containers
vendor/bin/sail down

# View logs
vendor/bin/sail logs -f
```

## Development Environment

### Container Structure
- **php-transcode**: Main Laravel application container
- **mysql**: Database (if configured)
- **redis**: Queue and caching
- **nginx**: Web server (if separate from PHP)

### Volume Mounts
- **Application Code**: Live reload during development
- **Media Storage**: Your recordings directory
- **Logs**: Persistent application logs
- **Database**: SQLite file for development

### Xdebug Integration
```bash
# Edit .env
SAIL_XDEBUG_MODE=develop,debug

# Restart containers
./run
```

## Code Organization

### Backend Structure

#### Controllers (app/Http/Controllers/)
```
Controller/
├── TranscodeController.php    # Main transcoding operations
├── ClipperController.php     # Frame extraction and UI
├── PlayerController.php       # HLS streaming
├── ConcatController.php       # File concatenation
├── ScaleController.php        # Video resizing
├── CropController.php         # Video cropping
└── [Operation]Controller.php  # Other specific operations
```

**Best Practices:**
- Keep controllers thin - delegate business logic to models
- Use form requests for validation
- Return JSON responses for API endpoints
- Implement proper error handling

#### Models (app/Models/)
```
Models/
├── Video/
│   └── File.php              # Core video file handling
├── FFMpeg/
│   ├── Actions/              # FFmpeg operation implementations
│   ├── Filters/              # Video/audio filters
│   ├── Format/               # Output format configurations
│   └── Helpers/              # Utility classes
├── CurrentQueue.php          # Job tracking
└── FilePicker.php           # Secure file browsing
```

**Best Practices:**
- Use repositories for complex data access
- Implement proper error handling in FFmpeg operations
- Use dependency injection where possible
- Keep models focused on business logic

#### Jobs (app/Jobs/)
```
Jobs/
├── ProcessVideo.php          # Main video processing job
└── Player.php               # HLS streaming job
```

**Best Practices:**
- Make jobs idempotent
- Handle failures gracefully
- Use proper queue priorities
- Implement progress tracking

### Frontend Structure

#### Components (resources/js/components/)
```
components/
├── Transcoder.js            # Main application component
├── FilePicker/              # File browser component
├── Configurator/            # Video processing UI
│   ├── Streams/            # Stream configuration
│   ├── Clips/              # Timeline-based clipping
│   ├── Dialogues/          # Modal interfaces
│   └── Tools/              # Quick actions
├── Statusbar/              # Progress monitoring
├── Request/                # HTTP client wrapper
└── [Utility]/              # Helper components
```

**Best Practices (Vanilla Web Components):**
- Use native web components for encapsulation
- Implement proper event handling with native APIs
- Use Shadow DOM for style isolation
- Keep components focused and reusable
- **Avoid framework patterns**: Use native DOM APIs directly
- **Performance first**: Leverage browser optimizations
- **Minimal abstraction**: No virtual DOM, no reactive systems

#### Styling (resources/css/)
```
css/
├── app.css                 # Main styles
├── grid.css               # Grid system
└── properties/            # CSS custom properties
    ├── colors.css
    ├── fonts.css
    ├── layout.css
    └── icons.css
```

**Best Practices:**
- Use CSS custom properties for theming
- Implement responsive design
- Follow BEM methodology for class names
- Optimize for performance

## Adding New Features

### Backend: New FFmpeg Operation

1. **Create Action Class**
```php
// app/Models/FFMpeg/Actions/NewOperation.php
class NewOperation extends AbstractAction
{
    protected string $filenameAffix = 'newop';
    protected string $filenameSuffix = 'mkv';
    
    public function execute(?ProcessVideo $job = null)
    {
        // Implementation here
    }
}
```

2. **Add Controller Method**
```php
// app/Http/Controllers/NewOperationController.php
public function newOperation(NewOperationRequest $request, string $path)
{
    ProcessVideo::dispatch('newoperation', 'recordings', $path, $request);
    FFMpegProgress::dispatch('queue.progress');
}
```

3. **Add Route**
```php
// routes/web.php
Route::post('/newoperation/{path}', [NewOperationController::class, 'newOperation']);
```

4. **Update Job Processing**
```php
// app/Jobs/ProcessVideo.php
case 'newoperation':
    $model = NewOperation::class;
    break;
```

5. **Create Form Request**
```php
// app/Http/Requests/NewOperationRequest.php
class NewOperationRequest extends FFMpegActionRequest
{
    public function rules()
    {
        return [
            // Validation rules
        ];
    }
}
```

### Frontend: New Operation UI (Vanilla Web Components)

1. **Create Native Web Component**
```javascript
// resources/js/components/Configurator/Dialogues/NewOperation.js
class NewOperationDialogue extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.shadowRoot.innerHTML = this.getTemplate();
        this.addEventListener();
    }
    
    getTemplate() {
        return `
            <style>
                /* Component-scoped styles */
            </style>
            <div class="dialogue-content">
                <!-- Native HTML, no framework template -->
            </div>
        `;
    }
}

customElements.define('new-operation-dialogue', NewOperationDialogue);
```

2. **Add to Tools Dropdown (No Framework)**
```javascript
// resources/js/components/Configurator/Dialogues/index.js
import './NewOperation';

// Add option to combo button in Configurator template
<option value="newoperation:cpu:instantOpen">New Operation</option>
```

3. **Add Request Handler (Vanilla JavaScript)**
```javascript
// resources/js/components/Configurator/Tools/index.js
case 'newoperation':
    // Handle operation with native fetch and events
    this.handleNewOperation(data);
    break;
```

## Testing

### Backend Testing

#### Unit Tests
```bash
# Run all tests
vendor/bin/sail php artisan test

# Run specific test
vendor/bin/sail php artisan test --filter TranscodeTest

# Generate coverage report
vendor/bin/sail php artisan test --coverage
```

#### Feature Tests
```php
// tests/Feature/TranscodeTest.php
class TranscodeTest extends TestCase
{
    public function test_can_transcode_video()
    {
        // Test implementation
    }
}
```

#### Job Testing
```php
// tests/Unit/ProcessVideoTest.php
class ProcessVideoTest extends TestCase
{
    public function test_processes_video_successfully()
    {
        // Test job execution
    }
}
```

### Frontend Testing

#### Component Tests
```javascript
// tests/js/components/Transcoder.test.js
describe('Transcoder', () => {
    it('should initialize correctly', () => {
        // Test component initialization
    });
});
```

#### E2E Tests
```javascript
// tests/e2e/transcode-workflow.test.js
describe('Transcode Workflow', () => {
    it('should complete full transcode process', () => {
        // Test complete user workflow
    });
});
```

## Debugging

### Backend Debugging

#### Xdebug Configuration
1. Set up VS Code with PHP Debug extension
2. Configure launch.json:
```json
{
    "name": "Listen for Xdebug",
    "type": "php",
    "request": "launch",
    "port": 9003,
    "pathMappings": {
        "/var/www/html": "${workspaceFolder}"
    }
}
```

#### Logging
```php
// Add logging to your code
Log::debug('Debug message', ['data' => $data]);
Log::error('Error occurred', ['exception' => $e]);

// View logs
vendor/bin/sail tail -f storage/logs/laravel.log
```

#### FFmpeg Debugging
```php
// Enable FFmpeg command logging
$this->media->export()->onProgress(function ($percentage, $remaining, $rate) {
    Log::debug('FFmpeg Progress', [
        'percentage' => $percentage,
        'remaining' => $remaining,
        'rate' => $rate
    ]);
});
```

### Frontend Debugging

#### Browser DevTools
1. Use browser developer tools for DOM inspection
2. Network tab for API requests
3. Console for JavaScript debugging
4. Application tab for WebSocket connections

#### Component Debugging
```javascript
// Add debug logging
console.log('Component initialized', this.data);

// Use debugger statements
debugger;

// Check Shadow DOM
console.log(this.shadowRoot);
```

## Performance Optimization

### Backend Optimization

#### Database Optimization
- Use proper indexing
- Optimize queries
- Consider caching for frequently accessed data

#### FFmpeg Optimization
- Use hardware acceleration when available
- Optimize codec settings
- Implement proper resource management

#### Queue Optimization
- Use separate queues for different operation types
- Implement proper queue priorities
- Monitor queue performance

### Frontend Optimization

#### Asset Optimization
- Minimize and compress assets
- Use lazy loading for components
- Optimize images and media

#### JavaScript Optimization
- Use efficient DOM manipulation
- Implement proper event handling
- Optimize WebSocket usage

#### Memory Management
- Clean up event listeners
- Dispose of unused objects
- Monitor memory usage

## Deployment

### Docker Deployment
```bash
# Build production image
docker build -t php-transcode .

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration
- Set proper environment variables
- Configure storage paths
- Set up GPU access for production
- Configure backup strategies

### Monitoring
- Set up application monitoring
- Monitor queue performance
- Track error rates
- Monitor resource usage