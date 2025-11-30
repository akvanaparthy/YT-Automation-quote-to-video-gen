# Quote-to-Video Generator

A web application that generates short-form videos with quote overlays suitable for YouTube Shorts, Instagram Reels, and TikTok.

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- FFmpeg installed on your system

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

- `POST /api/generate` - Generate video with quote
- `GET /api/videos` - List available videos
- `POST /api/upload` - Upload new video
- `DELETE /api/videos/:filename` - Delete video
- `GET /api/download/:videoId` - Download generated video

## Tech Stack

- **Backend:** Node.js + Express.js + FFmpeg
- **Frontend:** React + Vite
- **Storage:** Local file system

## Features

- Generate videos with custom text overlays
- Customizable fonts, colors, and text positioning
- Upload and manage video files
- Support for 9:16 aspect ratio (Shorts/Reels format)

## Documentation

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Complete project structure and planning
- [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) - Detailed API documentation
- [docs/DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) - Setup and development instructions

## Development Phases

**Phase 1 (In Progress):** Backend core functionality
- FFmpeg integration
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

1. Install backend dependencies
2. Install FFmpeg on your system
3. Create `backend/.env` from `.env.example`
4. Start backend server
5. Start frontend development server
6. Upload test videos
7. Test video generation

## License

MIT
