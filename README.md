# Quote-to-Video Generator

A web application that generates short-form videos with quote overlays suitable for YouTube Shorts, Instagram Reels, and TikTok.

## Quick Start

### Prerequisites
- Node.js (v20 or higher)
- Docker (for containerized deployment)

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server will start on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Application will open at `http://localhost:3000`

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for the complete project structure, API documentation, and development phases.

## API Endpoints

### Video Generation
- `POST /api/videos/generate` - Generate video with quote and subtitle
- `GET /api/videos` - List available videos
- `GET /api/videos/download/:videoId` - Download generated video
- `DELETE /api/videos/:filename` - Delete video

### File Upload
- `POST /api/upload` - Upload new video or music file

### Configuration
- `GET /api/fonts` - Get available fonts
- `GET /api/animations` - Get available animations

### History
- `GET /api/history` - Get generation history
- `DELETE /api/history` - Clear history

### Drive Sync
- `POST /api/sync` - Trigger manual sync with Google Drive
- `GET /api/sync/status` - Check sync configuration status

See [DRIVE_SYNC_GUIDE.md](./docs/DRIVE_SYNC_GUIDE.md) for detailed sync setup instructions.

## Tech Stack

- **Backend:** Node.js + Express.js + Remotion
- **Frontend:** React + Vite
- **Video Rendering:** Remotion (React-based)
- **Storage:** Local file system

## Features

- Generate videos with custom text overlays and subtitles
- Customizable fonts, colors, and text positioning
- Upload and manage video files
- Support for 9:16 aspect ratio (Shorts/Reels format)
- Background music integration
- Multiple animation effects (fade, slide, zoom, bounce)
- **Google Drive Sync** - Automatically sync videos and music with Google Drive
- Generation history tracking
- Auto-delete generated videos after 24 hours (configurable)

## Development Phases

**Phase 1 (Completed):** Backend core functionality
- Remotion integration
- Video processing with text overlay
- API endpoints

**Phase 2:** File management
- Upload handling
- Video listing and deletion

**Phase 3:** Text styling features
- Custom fonts
- Animation effects

**Phase 4:** Frontend UI
- React components
- User interface

**Phase 5:** Optimization and polish

## Next Steps

1. Install Docker
2. Run `docker-compose up --build`
3. Access frontend at http://localhost:3000
4. Upload test videos
5. Test video generation

## License

MIT
