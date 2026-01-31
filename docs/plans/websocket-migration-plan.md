# WebSocket Migration Plan

## Executive Summary

**Current State**: Application uses hybrid HTTP + WebSocket pattern where HTTP requests trigger WebSocket responses
**Target State**: Full WebSocket-based bidirectional communication for all client-server interactions
**Feasibility**: ✅ **Highly feasible** with well-defined migration path

## Current Architecture Analysis

### Existing Communication Pattern
```
Frontend HTTP Request → Laravel Controller → Business Logic → WebSocket Event → Frontend
```

### Current WebSocket Usage
- **Channels**: 6 public channels for different data types
- **Events**: FilePicker, FFMpegProgress, FFMpegOut, Transcode.Config, Transcode.Clips, TextViewer
- **Infrastructure**: Laravel Reverb + Laravel Echo + Pusher.js
- **Pattern**: Request-Response via separate HTTP/WebSocket paths

## Migration Strategy

### Phase 1: Foundation - WebSocket Request Infrastructure (Week 1)

#### 1.1 Create WebSocket Request Handler
```php
// app/Http/Controllers/WebSocketRequestController.php
class WebSocketRequestController
{
    public function handle(Request $request)
    {
        $event = $request->input('event');
        $data = $request->input('data');
        $channel = $request->input('channel');
        
        // Route to appropriate handler
        $this->routeWebSocketRequest($event, $data, $channel);
    }
}
```

#### 1.2 Implement Client-Side WebSocket Manager (Vanilla JS)
```javascript
// resources/js/components/WebSocketManager.js
class WebSocketManager {
    constructor() {
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.setupRequestHandler();
    }
    
    async request(channel, event, data) {
        const requestId = ++this.requestId;
        
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(requestId, { resolve, reject });
            
            // Using Laravel Echo utility (allowed - communication only)
            window.Echo.private(`user.${this.getUserId()}`)
                .whisper('request-response', { requestId, event, data });
        });
    }
    
    // Vanilla helper method
    getUserId() {
        return document.querySelector('meta[name="user-id"]').content;
    }
}
```

### Phase 2: Core Operations Migration (Week 2-3)

#### 2.1 File System Operations
**Current**: `GET /file-picker/{path}` → `FilePicker` event
**Target**: WebSocket request → WebSocket response

```javascript
// Migration
const files = await wsManager.request('filepicker', 'getItems', { path });
```

#### 2.2 Video Analysis Operations
**Current**: `GET /streams/{path}` → `Transcode.Config` event
**Target**: WebSocket request → WebSocket response

```javascript
// Migration  
const streams = await wsManager.request('transcode', 'getStreams', { path });
```

#### 2.3 Progress Monitoring
**Current**: `GET /progress` → `FFMpegProgress` event
**Target**: WebSocket request → WebSocket response + live updates

```javascript
// Migration
const progress = await wsManager.request('queue', 'getProgress');
// Plus existing real-time updates
```

### Phase 3: Action Operations Migration (Week 3-4)

#### 3.1 Video Processing Actions
**Current**: POST requests to `/transcode`, `/concat`, `/scale`, etc.
**Target**: WebSocket actions with immediate acknowledgment + progress

```javascript
// Migration
const job = await wsManager.request('video', 'transcode', {
    path, config
});
// Progress continues via existing FFMpegProgress channel
```

#### 3.2 Configuration Operations
**Current**: POST `/settings/{path}` → No WebSocket response
**Target**: WebSocket save → WebSocket confirmation

```javascript
// Migration
await wsManager.request('config', 'saveSettings', { path, config });
```

### Phase 4: Advanced Features (Week 4-5)

#### 4.1 Bidirectional Communication
- Real-time collaboration features
- Live preview capabilities
- Stream synchronization

#### 4.2 Connection Management
- Automatic reconnection with request replay
- Request queuing during disconnection
- Connection state awareness

## Technical Implementation Plan

### Backend Implementation

#### 1. WebSocket Request Router
```php
// app/Services/WebSocketRouter.php
class WebSocketRouter
{
    protected $handlers = [
        'filepicker' => FilePickerHandler::class,
        'transcode' => TranscodeHandler::class,
        'video' => VideoProcessingHandler::class,
        'queue' => QueueHandler::class,
        'config' => ConfigHandler::class,
    ];
    
    public function route($namespace, $event, $data, $channel)
    {
        $handler = $this->handlers[$namespace] ?? null;
        return $handler?::handle($event, $data, $channel);
    }
}
```

#### 2. Request Handler Base Class
```php
// app/Services/WebSocketHandlers/BaseHandler.php
abstract class BaseHandler
{
    protected function success($data)
    {
        return ['status' => 'success', 'data' => $data];
    }
    
    protected function error($message, $code = 400)
    {
        return ['status' => 'error', 'message' => $message, 'code' => $code];
    }
    
    protected function broadcast($channel, $event, $data)
    {
        event(new WebSocketResponse($channel, $event, $data));
    }
}
```

#### 3. WebSocket Request Middleware
```php
// app/Http/Middleware/WebSocketAuth.php
class WebSocketAuth
{
    public function handle($request, Closure $next)
    {
        // Authenticate WebSocket requests
        // Rate limiting
        // Request validation
        
        return $next($request);
    }
}
```

### Frontend Implementation

#### 1. Enhanced Request Manager
```javascript
// resources/js/components/WebSocketRequestManager.js
class WebSocketRequestManager extends Request {
    constructor() {
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.setupWebSocketResponseHandler();
    }
    
    async get(url, indicate = true) {
        // Convert HTTP GET to WebSocket request
        const route = this.parseUrlToRoute(url);
        return this.webSocketRequest(route.method, route.namespace, route.event, route.data);
    }
    
    async post(url, body) {
        // Convert HTTP POST to WebSocket request
        const route = this.parseUrlToRoute(url);
        return this.webSocketRequest(route.method, route.namespace, route.event, { ...route.data, ...body });
    }
    
    async webSocketRequest(method, namespace, event, data) {
        const requestId = ++this.requestId;
        
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(requestId, {
                resolve, reject, 
                timestamp: Date.now(),
                method, namespace, event, data
            });
            
            window.Echo.private(`user.${this.getUserId()}`)
                .whisper('request', { requestId, method, namespace, event, data });
                
            // Set timeout for request
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Request timeout'));
                }
            }, 30000); // 30 second timeout
        });
    }
}
```

#### 2. URL-to-WebSocket Route Mapping
```javascript
const ROUTE_MAP = {
    'GET /file-picker/{path}': { namespace: 'filepicker', event: 'getItems' },
    'GET /streams/{path}': { namespace: 'transcode', event: 'getStreams' },
    'POST /transcode/{path}': { namespace: 'video', event: 'transcode' },
    'POST /concat/{path}': { namespace: 'video', event: 'concat' },
    'POST /scale/{path}': { namespace: 'video', event: 'scale' },
    'GET /progress': { namespace: 'queue', event: 'getProgress' },
    'POST /settings/{path}': { namespace: 'config', event: 'saveSettings' }
};

class RouteMapper {
    static parseUrlToRoute(url, method = 'GET', body = null) {
        // Parse URL and map to WebSocket route
        for (const [pattern, route] of Object.entries(ROUTE_MAP)) {
            if (this.matchesPattern(url, pattern)) {
                const params = this.extractParams(url, pattern);
                return {
                    method,
                    ...route,
                    data: { ...params, ...body }
                };
            }
        }
        throw new Error(`No WebSocket route found for ${method} ${url}`);
    }
}
```

### Channel Structure Update

#### New Private Channels
```php
// app/Events/WebSocketRequest.php
class WebSocketRequest implements ShouldBroadcastNow
{
    public function broadcastOn()
    {
        return new PrivateChannel("user.{$this->userId}");
    }
}

// app/Events/WebSocketResponse.php  
class WebSocketResponse implements ShouldBroadcastNow
{
    public function broadcastOn()
    {
        return new PrivateChannel("user.{$this->userId}");
    }
}
```

## Benefits Analysis

### Performance Benefits
1. **Reduced Latency**: Single WebSocket connection vs HTTP + WebSocket
2. **Less Overhead**: No HTTP headers/cookies for each request
3. **Better Connection Reuse**: Persistent connection
4. **Real-time Potential**: True bidirectional communication

### User Experience Benefits
1. **Faster Response Times**: 20-40% reduction in response latency
2. **Better Offline Handling**: Request queuing during disconnection
3. **Advanced Features**: Collaboration, live updates, synchronization

### Development Benefits
1. **Consistent API**: Single communication pattern
2. **Better Testing**: Easier to mock and test WebSocket communication
3. **Future-Proof**: Foundation for advanced real-time features

## Risk Assessment

### Technical Risks
- **Connection Management**: More complex than HTTP
- **Browser Compatibility**: Some older browsers may have limitations
- **Debugging**: WebSocket debugging is more complex than HTTP

### Mitigation Strategies
- **Fallback Mechanism**: Maintain HTTP fallback for compatibility
- **Connection Monitoring**: Robust connection health checks
- **Comprehensive Testing**: Unit and integration tests for WebSocket communication
- **Graceful Degradation**: Detect connection issues and fallback to HTTP

## Implementation Timeline

### Week 1: Foundation
- [ ] WebSocket request router implementation
- [ ] Basic client-side WebSocket manager
- [ ] Request/response protocol definition

### Week 2: Core Operations  
- [ ] File picker WebSocket migration
- [ ] Stream analysis WebSocket migration
- [ ] Progress monitoring WebSocket migration

### Week 3: Actions Migration
- [ ] Video processing actions (transcode, concat, scale)
- [ ] Configuration save/load operations
- [ ] Error handling and validation

### Week 4: Advanced Features
- [ ] Connection management and reconnection
- [ ] Request queuing and timeout handling
- [ ] Performance optimization

### Week 5: Testing & Deployment
- [ ] Comprehensive testing suite
- [ ] Performance benchmarking
- [ ] Documentation updates
- [ ] Production deployment

## Success Metrics

### Performance Metrics
- **Response Time**: Target 30% reduction in average response time
- **Connection Overhead**: Target 50% reduction in connection overhead
- **Memory Usage**: Target 20% reduction in client-side memory usage

### User Experience Metrics  
- **Error Rate**: Target <1% WebSocket communication errors
- **Connection Success**: Target >99% connection success rate
- **User Satisfaction**: Improved perceived responsiveness

### Development Metrics
- **Code Simplicity**: Reduced complexity in request handling
- **Test Coverage**: >90% WebSocket communication test coverage
- **API Consistency**: Unified communication patterns

## Conclusion

**Migrating to full WebSocket communication is highly recommended and feasible**. The existing WebSocket infrastructure provides a solid foundation, and the migration can be implemented incrementally with minimal risk.

**Key Success Factors:**
1. **Incremental Migration**: Phase-by-phase approach minimizes risk
2. **Robust Error Handling**: Proper fallback and recovery mechanisms  
3. **Comprehensive Testing**: Full test coverage for WebSocket communication
4. **Performance Monitoring**: Track metrics throughout migration

**Expected Outcome**: A faster, more responsive application with foundation for advanced real-time features, while maintaining backward compatibility and robust error handling.