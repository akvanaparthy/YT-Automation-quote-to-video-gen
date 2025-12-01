# Quote-to-Video Generator - Complete Project Structure

## Overview

A web application that generates short-form videos with quote overlays suitable for YouTube Shorts and Instagram Reels. The system accepts a quote via API, applies it as text overlay to a random video, and returns the processed video file.

**Core Workflow:**
```
User sends quote → Backend selects random video → Remotion renders text overlay → Returns processed video
```

---

## Technology Stack

### Backend
- **Runtime:** Node.js v20
- **Framework:** Express.js
- **Video Processing:** Remotion (React-based rendering)
- **Metadata Extraction:** FFmpeg (ffprobe only)
- **File Upload:** Multer
- **CORS:** cors package
- **Environment:** dotenv

### Frontend
- **Framework:** React
- **HTTP Client:** Axios
- **Build Tool:** Vite or Create React App

### Storage
- **Local file system** (no database initially)
- Videos stored in `backend/storage/videos/`
- Generated videos in `backend/storage/output/`

---

## Project Directory Structure

```
quote-video-generator/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── video.routes.js          # Video generation & download endpoints
│   │   │   └── upload.routes.js         # Video upload & deletion endpoints
│   │   │
│   │   ├── controllers/
│   │   │   ├── videoController.js       # Video generation logic
│   │   │   └── uploadController.js      # File upload handling
│   │   │
│   │   ├── services/
│   │   │   ├── videoProcessorRemotion.js # Remotion-based video rendering
│   │   │   └── fileManager.js            # File operations (read, delete, list)
│   │   │
│   │   ├── middleware/
│   │   │   ├── validation.js            # Request validation (quote, style params)
│   │   │   ├── errorHandler.js          # Global error handling
│   │   │   └── upload.js                # Multer configuration
│   │   │
│   │   ├── utils/
│   │   │   ├── randomSelector.js        # Random video selection logic
│   │   │   └── constants.js             # App-wide constants & defaults
│   │   │
│   │   ├── config/
│   │   │   └── config.js                # Configuration variables
│   │   │
│   │   └── server.js                    # Express app setup & initialization
│   │
│   ├── storage/
│   │   ├── videos/                      # Source video files (user uploads + preloaded)
│   │   └── output/                      # Generated videos (temporary)
│   │
│   ├── .env.example                     # Environment variables template
│   ├── .gitignore                       # Git ignore rules
│   ├── package.json                     # Backend dependencies
│   └── server.js                        # Entry point (shortcut to src/server.js)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuoteInput.jsx           # Quote text input form
│   │   │   ├── StyleCustomizer.jsx      # Font, color, position picker
│   │   │   ├── VideoUpload.jsx          # Upload interface
│   │   │   ├── VideoList.jsx            # Display available videos
│   │   │   └── VideoPreview.jsx         # Display/download generated video
│   │   │
│   │   ├── services/
│   │   │   └── api.js                   # API client (axios wrapper)
│   │   │
│   │   ├── pages/
│   │   │   └── Dashboard.jsx            # Main page (all components combined)
│   │   │
│   │   ├── App.jsx                      # Root component
│   │   ├── App.css                      # Global styles
│   │   └── main.jsx                     # Entry point
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.js                   # Vite configuration (or CRA)
│   └── index.html
│
├── docs/
│   ├── API_REFERENCE.md                 # Detailed API endpoint documentation
│   ├── DEVELOPMENT_GUIDE.md             # Setup & development instructions
│   ├── VIDEO_REQUIREMENTS.md            # Video format specifications
│   └── TROUBLESHOOTING.md               # Common issues & solutions
│
├── .gitignore                           # Root git ignore
├── PROJECT_STRUCTURE.md                 # This file
└── README.md                            # Project overview & quick start

```

---

## API Specification

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Generate Video with Quote
**`POST /api/generate`**

Generates a video with quoted text overlay.

**Request:**
```json
{
  "quote": "The only way to do great work is to love what you do.",
  "style": {
    "fontFamily": "Arial",
    "fontSize": 60,
    "fontColor": "#FFFFFF",
    "position": "center",
    "backgroundColor": "rgba(0, 0, 0, 0.5)",
    "animation": "fade"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "videoId": "gen_1234567890",
  "downloadUrl": "/api/download/gen_1234567890.mp4",
  "duration": "30s",
  "message": "Video generated successfully"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

#### 2. List Available Source Videos
**`GET /api/videos`**

Returns list of available source videos.

**Response (200):**
```json
{
  "success": true,
  "videos": [
    {
      "id": "1",
      "filename": "sunset.mp4",
      "size": "15MB",
      "duration": "45s",
      "resolution": "1080x1920"
    },
    {
      "id": "2",
      "filename": "nature.mp4",
      "size": "12MB",
      "duration": "30s",
      "resolution": "1080x1920"
    }
  ]
}
```

---

#### 3. Upload New Video
**`POST /api/upload`**

Upload a new source video file.

**Request:**
```
Content-Type: multipart/form-data

Form Data:
- file: [video file]
```

**Response (200):**
```json
{
  "success": true,
  "filename": "my_video.mp4",
  "message": "Video uploaded successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "File size exceeds limit" or other error message
}
```

---

#### 4. Download Generated Video
**`GET /api/download/:videoId`**

Download the generated video file.

**Response:**
- File stream (MP4 video)
- Status: 200 (success) or 404 (file not found)

---

#### 5. Delete Source Video
**`DELETE /api/videos/:filename`**

Remove a source video from storage.

**Response (200):**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

---

## Video Processing Pipeline

### Step-by-Step Flow

```
1. VALIDATE REQUEST
   └─ Check quote length and style parameters

2. SELECT VIDEO & MUSIC
   └─ Randomly pick from storage/videos/ and storage/music/

3. GET VIDEO METADATA
   └─ Use ffprobe to get duration and resolution

4. COPY FILES TO REMOTION PUBLIC
   └─ Temporary copy for Remotion access

5. RENDER WITH REMOTION
   └─ Bundle React components
   └─ Render video with Chromium browser
   └─ Apply text overlay with animations
   └─ Composite video, text, and music

6. STORE & RETURN
   └─ Save to storage/output/
   └─ Return download URL to client
   └─ Clean up temporary files

7. CLEANUP (Optional)
   └─ Schedule deletion after 1 hour
```

### Remotion Rendering

Remotion uses React components to define video compositions, then renders them using a headless Chromium browser. This provides:
- Browser-quality text rendering (no font glyph issues)
- CSS-based animations and styling
- Full Unicode support
- Easy to customize and extend

---

## File Specifications

### Supported Video Formats
- **Container:** MP4
- **Video Codec:** H.264 (libx264)
- **Audio Codec:** AAC
- **Resolution:** 1080x1920 (9:16 aspect ratio)
- **Max File Size:** 100MB
- **Duration:** 15-60 seconds recommended

### Font Support
- **Supported Formats:** TTF, OTF
- **Default Font:** Arial
- **Custom Fonts:** Place in `backend/src/assets/fonts/`

### Text Overlay Options

**Position:**
- `top` - Text at top (10% from edge)
- `center` - Vertically centered
- `bottom` - At bottom (10% from edge)

**Style Options:**
- `fontFamily` - CSS font family (default: Arial)
- `fontSize` - Size in pixels (default: 60)
- `fontColor` - CSS color value (default: #FFFFFF)
- `backgroundColor` - CSS background with opacity (default: rgba(0, 0, 0, 0.5))
- `animation` - `fade-in`, `slide-in-left`, `slide-in-right`, `zoom-in`, `bounce-in`, or `none`

**Supported Animations:**
- `fade-in` - Gradual opacity increase
- `fade-out` - Gradual opacity decrease
- `slide-in-left` - Slide from left edge
- `slide-in-right` - Slide from right edge
- `zoom-in` - Scale from 0 to 1
- `bounce-in` - Spring animation with bounce
- `none` - No animation

---

## Configuration

### Backend Config Variables
Located in `backend/src/config/config.js`:

```javascript
module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Paths
  VIDEO_STORAGE_PATH: './storage/videos',
  OUTPUT_PATH: './storage/output',
  FONTS_PATH: './src/assets/fonts',

  // File Limits
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FORMATS: ['.mp4', '.mov'],

  // Text Defaults
  DEFAULT_FONT: 'Arial',
  DEFAULT_FONT_SIZE: 60,
  DEFAULT_FONT_COLOR: '#FFFFFF',
  DEFAULT_POSITION: 'center',

  // FFmpeg
  FFMPEG_PRESET: 'medium', // ultrafast, superfast, veryfast, faster, fast, medium, slow
  VIDEO_BITRATE: '5000k',

  // Cleanup
  OUTPUT_CLEANUP_ENABLED: true,
  OUTPUT_CLEANUP_TIME: 3600000, // 1 hour in ms

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
```

### Environment Variables
Create `backend/.env`:

```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## Development Phases

### Phase 1: Backend Core (COMPLETED)
- [x] Initialize Node.js project with Express
- [x] Install Remotion and dependencies
- [x] Create folder structure
- [x] Setup configuration system
- [x] Implement videoProcessorRemotion service
  - [x] Remotion bundling and rendering
  - [x] Text overlay with React components
- [x] Create video generation endpoint (`/api/generate`)
- [x] Implement random video and music selection
- [x] Test with sample videos and quotes

### Phase 2: File Management (COMPLETED)
- [x] Create `/api/upload` endpoint
- [x] Implement multer configuration
- [x] Create `/api/videos` listing endpoint
- [x] Add `/api/videos/:filename` delete endpoint
- [x] File validation (format, size)
- [x] Error handling for invalid files

### Phase 3: Text Styling & Features (COMPLETED)
- [x] Support custom fonts (via CSS)
- [x] Implement color customization
- [x] Add positioning options (top/center/bottom)
- [x] Background box for text readability
- [x] Text animation effects (fade-in, slide, zoom, bounce)
- [x] Handle long quotes (automatic text wrapping)
- [x] Background music integration

### Phase 4: Frontend Interface (IN PROGRESS)
- [x] Setup React project
- [x] Create QuoteInput component
- [x] Create StyleCustomizer component
- [x] Create VideoUpload component
- [x] Create VideoPreview component
- [x] Integrate with API
- [x] Add loading states & error handling

### Phase 5: Optimization & Polish
- [ ] Video format validation & conversion
- [ ] Temporary file cleanup system
- [ ] Progress indicators for video processing
- [ ] Performance optimization
- [ ] Error messages improvement
- [ ] Logging system

### Phase 6: Advanced Features (Future)
- [ ] User authentication
- [ ] Quote history/database
- [ ] Social media integration (YouTube/Instagram API)
- [ ] Batch processing
- [ ] Video templates

---

## NPM Dependencies

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "fluent-ffmpeg": "^2.1.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.5"
  }
}
```

---

## Getting Started (Quick Reference)

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### First Video Generation
1. Upload a 1080x1920 MP4 video via `/api/upload`
2. Send POST to `/api/generate` with quote
3. Download from returned URL

---

## Common File Formats & Specs

### Input Video (Source)
- Format: MP4 (H.264)
- Resolution: 1080x1920 (9:16)
- Duration: 15-60 seconds
- Size: < 100MB

### Output Video (Generated)
- Format: MP4 (H.264)
- Resolution: 1080x1920 (9:16)
- Duration: Same as input
- Size: Varies (5-50MB typically)
- Playable on: YouTube Shorts, Instagram Reels, TikTok

---

## Key Design Decisions

1. **No Database** - Simple file-based system for MVP
2. **Local Storage** - Videos stored locally (can scale to cloud later)
3. **FFmpeg** - Industry standard for video processing
4. **9:16 Format** - Optimized for short-form video platforms
5. **Express.js** - Lightweight, widely used
6. **React** - Flexible UI framework
7. **Backend-First** - API designed before frontend

---

## Next Steps

1. Review this structure
2. Create folder structure and package.json files
3. Install dependencies
4. Implement backend Phase 1 (video processor)
5. Test with sample videos
6. Iterate and expand

---

**Last Updated:** 2025-11-30
**Status:** Planning Phase - Ready for Implementation
