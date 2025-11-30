# Development Guide

## Prerequisites

### System Requirements
- Node.js v16 or higher
- npm or yarn
- FFmpeg (for video processing)
- Git

### Install FFmpeg

**Windows:**
```bash
# Using chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Create Storage Directory

The `/storage` directory should already exist. Verify:
```bash
ls -la storage/
# Should show: videos/ and output/
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 5. Test Backend

```bash
# Health check
curl http://localhost:5000/api/health

# List videos (empty initially)
curl http://localhost:5000/api/videos
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Application will open at `http://localhost:3000`

## Testing the Full System

### 1. Prepare a Test Video

You need an MP4 video file with 1080x1920 resolution (9:16 aspect ratio).

**Create a test video** (using FFmpeg):
```bash
ffmpeg -f lavfi -i color=c=blue:s=1080x1920:d=5 -f lavfi -i sine=f=1000:d=5 test_video.mp4
```

### 2. Upload Video

**Via cURL:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@test_video.mp4"
```

**Via Frontend:**
- Go to http://localhost:3000
- Use the "Upload Video" section to select and upload `test_video.mp4`

### 3. Generate Video with Quote

**Via cURL:**
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "The only way to do great work is to love what you do.",
    "style": {
      "fontFamily": "Arial",
      "fontSize": 60,
      "fontColor": "#FFFFFF",
      "position": "center"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "videoId": "gen_1701259200000",
  "downloadUrl": "/api/download/gen_1701259200000.mp4",
  "message": "Video generated successfully"
}
```

### 4. Download Generated Video

Access the download URL:
```
http://localhost:5000/api/download/gen_1701259200000.mp4
```

Or from the frontend, click the download button.

## Project File Structure

```
backend/
├── src/
│   ├── routes/           # API route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic (FFmpeg processing)
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   └── config/           # Configuration
├── storage/
│   ├── videos/           # Source video files
│   └── output/           # Generated videos (temporary)
├── server.js             # Entry point
└── package.json

frontend/
├── src/
│   ├── components/       # React components
│   ├── services/         # API integration
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Common Development Tasks

### Adding a New API Endpoint

1. Create route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Import route in `backend/server.js`
4. Add validation middleware if needed

### Adding a New React Component

1. Create component in `frontend/src/components/`
2. Import in parent component or `App.jsx`
3. Update API calls in `frontend/src/services/api.js` if needed

### Testing Video Processing

1. Verify video format:
   ```bash
   ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
     -of default=noprint_wrappers=1:nokey=1:noprint_wrappers=1 storage/videos/your_video.mp4
   ```

2. Check FFmpeg command manually:
   ```bash
   ffmpeg -i input.mp4 \
     -vf "drawtext=text='Test':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" \
     -codec:a copy output.mp4
   ```

## Troubleshooting

### FFmpeg Not Found
```bash
# Update PATH to include FFmpeg
# Or set FFMPEG_PATH in config
```

### CORS Errors
Check `CORS_ORIGIN` in `.env` matches your frontend URL

### File Upload Issues
- Check file size (max 100MB)
- Verify file format (MP4)
- Ensure `/storage/videos/` directory exists

### Video Processing Fails
- Verify source video format with `ffprobe`
- Check error logs in console
- Ensure output directory exists

## Debugging

### Enable Debug Logging

Edit `backend/src/config/config.js`:
```javascript
DEBUG_MODE: true
```

### Monitor FFmpeg Processing

Add logging to `backend/src/services/videoProcessor.js`:
```javascript
.on('progress', (progress) => {
  console.log(`Encoding: ${Math.round(progress.percent)}%`);
})
```

## Performance Tips

1. Use `preset: 'fast'` or `preset: 'ultrafast'` in development
2. Reduce video resolution for testing
3. Enable output cleanup to avoid disk space issues
4. Monitor server logs for bottlenecks

## Next Steps

See [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) for development phases and what to build next.
