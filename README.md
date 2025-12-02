# Quote-to-Video Generator

A web application that generates short-form videos with quote overlays suitable for YouTube Shorts, Instagram Reels, and TikTok. Features automatic Google Drive sync, custom text styling, and Remotion-powered rendering.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd YT-Automation-quote-to-video-gen

# 2. Start containers
./start.bat  # Windows
# or
docker-compose up -d  # Linux/Mac

# 3. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Manual Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Postman Testing](./docs/POSTMAN_TESTING_GUIDE.md)** - Test API with Postman
- **[n8n Integration](./docs/N8N_INTEGRATION.md)** - Automate with workflows
- **[Drive Sync Setup](./docs/DRIVE_SYNC_GUIDE.md)** - Configure Google Drive sync
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Fix common issues
- **[Development Guide](./docs/DEVELOPMENT_GUIDE.md)** - For developers
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Code organization

## ✨ Features

### Video Generation
- ✅ Remotion-based rendering (browser-quality text)
- ✅ Custom text styling (fonts, colors, sizes)
- ✅ Subtitle support with independent styling
- ✅ Multiple animations (fade, slide, zoom, bounce)
- ✅ Automatic music integration
- ✅ 9:16 aspect ratio (Shorts/Reels/TikTok format)
- ✅ Auto-delete generated videos (24h, configurable)

### Google Drive Sync
- ✅ Automatic two-way sync with Drive folders
- ✅ Download missing videos/music automatically
- ✅ Remove local files deleted from Drive
- ✅ Manual and auto-sync on startup
- ✅ Corrupted file detection and re-download

### Management
- ✅ Upload videos and music files
- ✅ Generation history tracking
- ✅ File management UI
- ✅ REST API for automation

## 🎯 API Endpoints

### Video Generation
```
POST   /api/videos/generate  - Generate video with quote
GET    /api/videos           - List available videos
GET    /api/videos/download/:videoId - Download video
GET    /api/history          - Get generation history
```

### Google Drive Sync
```
POST   /api/sync             - Trigger manual sync
GET    /api/sync/status      - Check sync status
```

### File Management
```
POST   /api/upload           - Upload video/music
DELETE /api/videos/:filename - Delete file
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.

## 🛠️ Tech Stack

- **Backend:** Node.js 20 + Express + Remotion 4.0
- **Frontend:** React 18 + Vite
- **Video Rendering:** Remotion (React-based, Chromium)
- **Deployment:** Docker + Docker Compose
- **Storage:** Local filesystem + Google Drive sync

## 🧪 Testing

### Postman
1. Import collection from [POSTMAN_TESTING_GUIDE.md](./docs/POSTMAN_TESTING_GUIDE.md)
2. Test endpoints step-by-step
3. Download generated videos

### n8n Automation
1. Install n8n: https://n8n.io
2. Follow [N8N_INTEGRATION.md](./docs/N8N_INTEGRATION.md)
3. Create automated workflows

## 🐛 Troubleshooting

**Common Issues:**

| Issue | Solution |
|-------|----------|
| "moov atom not found" | Corrupted videos, run Drive sync |
| Port 5000 in use | `./stop.bat` then `./start.bat` |
| Docker loop error | Start Docker Desktop first |
| No videos available | Run sync or upload videos manually |

See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for complete guide.

## 📋 Example Request

```bash
curl -X POST http://localhost:5000/api/videos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "Success is not final, failure is not fatal.",
    "subtitle": "- Winston Churchill",
    "style": {
      "fontFamily": "Impact",
      "fontSize": 80,
      "fontColor": "#FFD700",
      "position": "center",
      "animation": "zoom-in"
    },
    "addMusic": true
  }'
```

**Response:**
```json
{
  "success": true,
  "videoId": "generated_1764617930989.mp4",
  "downloadUrl": "/api/videos/download/generated_1764617930989.mp4",
  "hasMusic": true,
  "duration": 8,
  "autoDelete": true,
  "expiresIn": "24 hours"
}
```

## 🎨 Style Options

**Fonts:** Arial, Impact, Courier New, Georgia, Comic Sans MS  
**Positions:** top, center, bottom  
**Animations:** none, fade-in, slide-in-left, slide-in-right, zoom-in, bounce  
**Colors:** Any hex color (#FFFFFF, #FFD700, etc.)  
**Background:** RGBA with transparency support

## 🔧 Configuration

### Environment Variables (docker-compose.yml)

```yaml
environment:
  GOOGLE_DRIVE_API_KEY: your-api-key-here
  DRIVE_VIDEOS_FOLDER: https://drive.google.com/drive/folders/...
  DRIVE_MUSIC_FOLDER: https://drive.google.com/drive/folders/...
  AUTO_SYNC_ON_START: true
```

See [DRIVE_SYNC_GUIDE.md](./docs/DRIVE_SYNC_GUIDE.md) for API key setup.

## 📈 Development Phases

✅ **Phase 1:** Backend core + Remotion integration  
✅ **Phase 2:** File management + uploads  
✅ **Phase 3:** Text styling + animations  
✅ **Phase 4:** Frontend UI + React components  
✅ **Phase 5:** Google Drive sync integration  
✅ **Phase 6:** Docker deployment + optimization  

## 🤝 Contributing

See [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) for:
- Code structure
- Development workflow
- Testing guidelines
- Deployment process

## 📄 License

MIT
