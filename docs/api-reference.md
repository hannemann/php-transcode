# API Reference

## REST API Endpoints

### File Operations

#### Get File Items
```http
GET /file-picker/{subdir?}
```
**Description:** Browse directory structure for video files
**Parameters:**
- `subdir` (optional): Subdirectory path relative to recordings root

**Response:** File picker items broadcasted via WebSocket

#### Delete File
```http
DELETE /file-picker/{path}
```
**Description:** Delete a video file (internal files only)
**Parameters:**
- `path`: File path to delete

**Response:** HTTP 200 on success, 403 on external file attempt

### Video Processing Operations

#### Concatenate Files
```http
POST /concat/{path?}
```
**Description:** Join multiple video files into single output
**Parameters:**
- `path` (optional): Base path for files
**Body:** Concat configuration object

#### Transcode Video
```http
POST /transcode/{path}
```
**Description:** Convert video/audio codecs and formats
**Parameters:**
- `path`: Input file path
**Body:** Transcode configuration with streams, clips, codecs

**Example Body:**
```json
{
  "streams": [
    {
      "id": 0,
      "config": {
        "codec": "h264_vaapi",
        "qp": 25,
        "aspectRatio": "16:9"
      }
    }
  ],
  "clips": [
    {
      "from": "00:05:00",
      "to": "01:30:00"
    }
  ],
  "crop": {},
  "removeLogo": {},
  "delogo": {},
  "filterGraph": []
}
```

#### Save Settings
```http
POST /settings/{path}
```
**Description:** Save configuration settings without processing
**Parameters:**
- `path`: File path for settings
**Body:** Same format as transcode endpoint

#### Scale Video
```http
POST /scale/{path}
```
**Description:** Resize video dimensions
**Parameters:**
- `path`: Input file path
**Body:** Scale configuration (width, height, maintain aspect)

#### Crop Video
```http
POST /crop/{path}
```
**Description:** Crop video to specified dimensions
**Parameters:**
- `path`: Input file path
**Body:** Crop coordinates and dimensions

#### DeLogo Filter
```http
POST /delogo/{path}
```
**Description:** Remove channel logo using FFmpeg delogo filter
**Parameters:**
- `path`: Input file path
**Body:** Logo coordinates and filter parameters

#### Remove Logo (Custom Mask)
```http
POST /removelogo/{path}
```
**Description:** Remove logo using custom mask image
**Parameters:**
- `path`: Input file path
**Body:** Mask configuration

```http
POST /removelogoCustomMask/{path}
```
**Description:** Upload custom logo mask
**Parameters:**
- `path`: Input file path
**Body:** Multipart form with mask image

```http
GET /removelogo/{path}
```
**Description:** Get current logo mask information
**Parameters:**
- `path`: Input file path

```http
GET /removelogoImage/{path}
```
**Description:** Get logo mask image
**Parameters:**
- `path`: Input file path

#### Remux Container
```http
POST /remux/{path}
```
**Description:** Change container format without re-encoding
**Parameters:**
- `path`: Input file path
**Query:** `container` (mp4|mkv|ts)
**Body:** Stream selection configuration

### Media Analysis

#### Get Stream Information
```http
GET /streams/{path?}
```
**Description:** Analyze video file and return stream information
**Parameters:**
- `path` (optional): File path to analyze

**Response:** Stream data broadcasted via WebSocket channel

**Response Format:**
```json
{
  "format": {
    "duration": 5400.5,
    "size": "1073741824",
    "bit_rate": "2000000"
  },
  "streams": [
    {
      "index": 0,
      "codec_type": "video",
      "codec_name": "h264",
      "width": 1920,
      "height": 1080,
      "bit_rate": "1500000",
      "channels": null,
      "duration": 5400.5
    },
    {
      "index": 1,
      "codec_type": "audio",
      "codec_name": "ac3",
      "width": null,
      "height": null,
      "bit_rate": "384000",
      "channels": 6,
      "duration": 5400.5
    }
  ],
  "chapters": [],
  "crop": {},
  "removeLogo": {},
  "delogo": {},
  "filterGraph": []
}
```

#### Get Clip Information
```http
GET /clips/{path?}
```
**Description:** Get saved clip configuration for a file
**Parameters:**
- `path` (optional): File path

**Response:** Clips data broadcasted via WebSocket

### Playback and Preview

#### Get Thumbnail Image
```http
GET /image/{path}
```
**Description:** Extract thumbnail from video at specific time
**Parameters:**
- `path`: Video file path
**Query:** `time` (optional): Timestamp for thumbnail (default: 00:00:01)

#### HLS Streaming
```http
GET /stream-playlist/{path}.m3u8
```
**Description:** Get HLS playlist for video streaming
**Parameters:**
- `path`: Video file path

```http
GET /stream-segment/{path}
```
**Description:** Get HLS video segment
**Parameters:**
- `path`: Video file path with segment info

```http
POST /stream/{path}
```
**Description:** Start HLS transcoding for playback
**Parameters:**
- `path`: Video file path

```http
DELETE /stream/{path}
```
**Description:** Clean up HLS transcoding resources
**Parameters:**
- `path`: Video file path

### Queue Management

#### Get Progress
```http
GET /progress
```
**Description:** Get current queue status and progress
**Response:** Progress data broadcasted via WebSocket

#### Cancel Queue Item
```http
POST /queue/cancel/{queue}
```
**Description:** Cancel a queued or running job
**Parameters:**
- `queue`: Queue item ID

#### Delete Progress Item
```http
DELETE /progress/{id}
```
**Description:** Remove completed/failed item from queue
**Parameters:**
- `id`: Queue item ID

#### Kill FFmpeg Process
```http
POST /kill
```
**Description:** Terminate all running FFmpeg processes
**Response:** HTTP 200 on success

### Text Viewer

#### View Text File
```http
GET /textviewer/{path}
```
**Description:** Display text file content (logs, metadata, etc.)
**Parameters:**
- `path`: Text file path
**Response:** File content broadcasted via WebSocket

## WebSocket Events

### Channels

#### Transcode.Config
**Purpose:** Real-time stream and configuration updates
**Events:**
- `Transcode.Config`: Stream information, chapters, filters

#### Transcode.Clips
**Purpose:** Clip configuration updates
**Events:**
- `Transcode.Config.Clips`: Clip data changes

#### FilePicker
**Purpose:** File system updates
**Events:**
- `FilePicker`: Directory contents, file changes

#### FFMpegProgress
**Purpose:** Job progress updates
**Events:**
- `queue.progress`: Queue status, job progress

#### TextViewer
**Purpose:** Text file content display
**Events:**
- `TextViewer`: File content updates

### Event Data Formats

#### Stream Configuration Event
```json
{
  "format": {
    "duration": 5400.5,
    "size": "1073741824",
    "bit_rate": "2000000",
    "format_name": "matroska,webm"
  },
  "streams": [
    {
      "index": 0,
      "codec_type": "video",
      "codec_name": "h264",
      "width": 1920,
      "height": 1080,
      "bit_rate": "1500000",
      "channels": null,
      "duration": 5400.5,
      "active": true,
      "transcodeConfig": {
        "codec": 0,
        "qp": 25,
        "aspectRatio": "16:9"
      }
    }
  ],
  "chapters": [
    {
      "id": 0,
      "start": 0.0,
      "end": 300.0,
      "title": "Chapter 1"
    }
  ],
  "crop": {},
  "removeLogo": {},
  "delogo": {},
  "filterGraph": []
}
```

#### Progress Event
```json
{
  "queue": [
    {
      "id": 1,
      "path": "/media/recordings/video.mkv",
      "type": "transcode",
      "state": "running",
      "percentage": 45,
      "rate": "2.5x",
      "remaining": 1800,
      "start": "2023-01-01T10:00:00Z",
      "end": null
    }
  ]
}
```

#### File Picker Event
```json
{
  "items": [
    {
      "name": "video.mkv",
      "path": "/media/recordings/video.mkv",
      "type": "file",
      "size": 1073741824,
      "modified": "2023-01-01T09:00:00Z",
      "mime": "video/x-matroska",
      "internal": true
    }
  ],
  "currentDir": "/media/recordings"
}
```

## Error Responses

### Standard Error Format
```json
{
  "status": 500,
  "message": "Error description"
}
```

### Common Error Codes
- **400**: Bad Request (invalid parameters)
- **403**: Forbidden (security violation)
- **404**: Not Found (file doesn't exist)
- **500**: Internal Server Error (processing failure)

### FFmpeg Specific Errors
```json
{
  "status": 500,
  "message": "FFmpeg command failed:\n\n/path/to/ffmpeg -i input.mkv output.mp4\n\nError output details"
}
```

## Configuration Objects

### Stream Configuration
```json
{
  "id": 0,
  "config": {
    "codec": "h264_vaapi",
    "qp": 25,
    "aspectRatio": "16:9",
    "bitrate": 2000000,
    "channels": 6
  }
}
```

### Clip Configuration
```json
{
  "clips": [
    {
      "from": "00:05:00",
      "to": "01:30:00",
      "title": "Main Content"
    }
  ]
}
```

### Filter Configuration
```json
{
  "filterGraph": [
    {
      "type": "crop",
      "params": {
        "x": 100,
        "y": 100,
        "width": 1720,
        "height": 880
      }
    }
  ],
  "crop": {
    "x": 100,
    "y": 100,
    "width": 1720,
    "height": 880
  },
  "removeLogo": {
    "mask": "/path/to/mask.png"
  },
  "delogo": {
    "x": 50,
    "y": 50,
    "width": 100,
    "height": 50
  }
}
```

## Rate Limiting and Security

### File Access Restrictions
- File picker limited to configured `MEDIA_PATH_CONTAINER`
- Cannot delete files outside internal storage
- Path traversal protection implemented

### Request Validation
- All FFmpeg parameters validated and sanitized
- File type verification before processing
- Command injection protection

### Authentication (if enabled)
- Laravel Sanctum token-based authentication
- Session management for web interface
- CSRF protection for state-changing operations