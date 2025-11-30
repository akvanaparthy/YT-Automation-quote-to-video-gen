# Quote to Video Generator API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Generate Video with Quote
Generate a video with text overlay, animations, and optional background music.

**Endpoint:** `POST /videos/generate`

**Request Body:**
```json
{
  "quote": "Your inspirational quote here",
  "style": {
    "fontFamily": "Arial",
    "fontSize": 60,
    "fontColor": "#FFFFFF",
    "position": "center",
    "backgroundColor": "rgba(0, 0, 0, 0.5)",
    "animation": "fade-in"
  },
  "maxDuration": 10,
  "addMusic": true
}
```

**Parameters:**
- `quote` (string, required): The text to overlay on the video (max 500 characters)
- `style` (object, optional): Styling options for the text
  - `fontFamily` (string): Font name (see /fonts endpoint for available fonts)
  - `fontSize` (number): Font size in pixels (default: 60)
  - `fontColor` (string): Hex color code (default: #FFFFFF)
  - `position` (string): Text position - "top", "center", or "bottom" (default: "center")
  - `backgroundColor` (string): Background box color in rgba format (default: "rgba(0, 0, 0, 0.5)")
  - `animation` (string): Animation type (see /animations endpoint for available animations)
- `maxDuration` (number, optional): Maximum video duration in seconds (if not provided, uses full video length)
- `addMusic` (boolean, optional): Whether to add background music (default: true)

**Response:**
```json
{
  "success": true,
  "videoId": "generated_1234567890.mp4",
  "downloadUrl": "/api/videos/download/generated_1234567890.mp4",
  "message": "Video generated successfully",
  "hasMusic": true,
  "duration": 10
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/videos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "Believe you can and you are halfway there",
    "style": {
      "fontFamily": "Arial Bold",
      "fontSize": 70,
      "fontColor": "#FFD700",
      "position": "center",
      "backgroundColor": "rgba(0, 0, 0, 0.7)",
      "animation": "slide-in-left"
    },
    "maxDuration": 15,
    "addMusic": true
  }'
```

---

### 2. Download Generated Video
Download the generated video file.

**Endpoint:** `GET /videos/download/:videoId`

**Response:** Video file (MP4)

**Example:**
```
http://localhost:5000/api/videos/download/generated_1234567890.mp4
```

---

### 3. List Available Videos
Get a list of all available source videos.

**Endpoint:** `GET /videos`

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "filename": "video1.mp4",
      "size": 14551040,
      "sizeFormatted": "14.55MB"
    }
  ]
}
```

---

### 4. List Available Fonts
Get a list of all available fonts.

**Endpoint:** `GET /fonts`

**Response:**
```json
{
  "success": true,
  "fonts": [
    "Arial",
    "Arial Bold",
    "Times New Roman",
    "Times Bold",
    "Courier New",
    "Courier Bold",
    "Impact",
    "Comic Sans",
    "Helvetica",
    "Georgia"
  ]
}
```

---

### 5. List Available Animations
Get a list of all available text animations.

**Endpoint:** `GET /animations`

**Response:**
```json
{
  "success": true,
  "animations": [
    "none",
    "fade-in",
    "fade-out",
    "slide-in-left",
    "slide-in-right",
    "slide-in-top",
    "slide-in-bottom",
    "zoom-in",
    "bounce-in",
    "pulse",
    "shake",
    "typewriter",
    "rotate-in"
  ]
}
```

---

## Animation Descriptions

- **none**: Static text without animation
- **fade-in**: Text gradually appears (opacity 0 to 1)
- **fade-out**: Text gradually disappears (opacity 1 to 0)
- **slide-in-left**: Text slides in from the left side
- **slide-in-right**: Text slides in from the right side
- **slide-in-top**: Text slides in from the top
- **slide-in-bottom**: Text slides in from the bottom
- **zoom-in**: Text zooms in with fade effect
- **bounce-in**: Text bounces in with elastic effect
- **pulse**: Text continuously pulsates
- **shake**: Text shakes/vibrates
- **typewriter**: Characters appear progressively
- **rotate-in**: Text rotates as it appears (with fade)

**Note:** All animations complete within half of the specified duration (or half of the video duration if no maxDuration is specified).

---

## Using with n8n

### HTTP Request Node Configuration

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/videos/generate`
3. **Authentication:** None
4. **Body Content Type:** JSON
5. **Specify Body:** Using Fields Below
6. **Body Parameters:**
   - `quote`: Your text content
   - `style.fontFamily`: Font selection
   - `style.fontSize`: Font size
   - `style.fontColor`: Text color
   - `style.position`: Text position
   - `style.backgroundColor`: Background color
   - `style.animation`: Animation type
   - `maxDuration`: Max video length
   - `addMusic`: true/false

### Example n8n Workflow

```json
{
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:5000/api/videos/generate",
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "={\n  \"quote\": \"{{ $json.quoteText }}\",\n  \"style\": {\n    \"fontFamily\": \"Arial Bold\",\n    \"fontSize\": 70,\n    \"fontColor\": \"#FFFFFF\",\n    \"position\": \"center\",\n    \"backgroundColor\": \"rgba(0, 0, 0, 0.5)\",\n    \"animation\": \"fade-in\"\n  },\n  \"maxDuration\": 15,\n  \"addMusic\": true\n}"
      },
      "name": "Generate Video",
      "type": "n8n-nodes-base.httpRequest",
      "position": [250, 300]
    }
  ]
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Quote is required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Video not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Video processing failed: [error message]"
}
```

---

## Notes

1. **Background Music:** Place MP3/WAV files in `backend/storage/music/` for random selection
2. **Source Videos:** Place MP4 files in `backend/storage/videos/` for random selection
3. **Custom Fonts:** Place TTF/OTF files in `backend/storage/fonts/` (optional - DejaVu fonts are pre-installed)
3. **Animation Timing:** Animations complete in the first half of the video duration
4. **Music Volume:** Background music is automatically set to 30% volume and mixed with original audio
5. **Video Duration:** If `maxDuration` is specified and shorter than the source video, the video will be trimmed
