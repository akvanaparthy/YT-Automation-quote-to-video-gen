# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Docker Desktop installed and **RUNNING** (check system tray)
- ✅ At least 4GB RAM available
- ✅ Ports 3000 and 5000 available

## ⚠️ IMPORTANT: Prevent the Docker Loop Error

**The Error:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine...
```

**The Cause:** Docker Desktop is not running when you try to use docker-compose

**The Solution:**
1. **ALWAYS** check Docker Desktop is running first (look for whale icon in system tray)
2. Use the provided `start.bat` script instead of manual docker-compose commands
3. If Docker crashes, restart it before running any commands

## 🎯 Simple Setup (3 Steps)

### 1. Start Docker Desktop
- Find Docker Desktop in Start Menu
- Launch it
- **Wait** until the whale icon stops animating (usually 30-60 seconds)
- Verify: System tray should show a steady whale icon

### 2. Start the Application
Double-click: **`start.bat`**

Or in terminal:
```bash
start.bat
```

This script:
- ✅ Checks if Docker is running
- ✅ Prevents the error loop
- ✅ Builds and starts containers
- ✅ Shows you the URLs

### 3. Access the App
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000/api/videos

## 🛑 Stopping the Application

Double-click: **`stop.bat`**

Or in terminal:
```bash
stop.bat
```

## 🔄 Setting Up Drive Sync (Optional)

### Quick Version:
1. Get a Google Drive API key (see `docs/API_KEY_SETUP.md` - takes 5 min)
2. Edit `docker-compose.yml` and add your API key:
   ```yaml
   environment:
     - GOOGLE_DRIVE_API_KEY=your_key_here
   ```
3. Restart: `stop.bat` then `start.bat`

### Detailed Guide:
See: `docs/API_KEY_SETUP.md`

## 📋 Common Issues

### Issue: "Docker is not running" error
**Fix:** Start Docker Desktop first, wait for it to fully start

### Issue: Port already in use
**Fix:** Run `stop-servers.bat` to kill processes on ports 3000/5000

### Issue: Containers won't start
**Fix:**
```bash
docker-compose down
docker system prune -f
start.bat
```

### Issue: Drive sync not working
**Fix:** You need a Google Drive API key (free). See `docs/API_KEY_SETUP.md`

### Issue: Stuck in error loop
**Fix:**
1. Press `Ctrl+C` to stop the command
2. Open Task Manager
3. End any Docker processes
4. Restart Docker Desktop
5. Use `start.bat` instead of direct docker-compose commands

## 🔧 Manual Commands (Advanced)

If you prefer manual control:

```bash
# Check Docker is running
docker info

# Start (with build)
docker-compose up --build -d

# Start (without build)
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# Restart backend only
docker-compose restart backend

# Rebuild everything
docker-compose down
docker-compose up --build -d
```

## 📊 Health Check

After starting, check everything is working:

```bash
# Check container status
docker-compose ps

# Should show:
# quote-video-backend   running (healthy)
# quote-video-frontend  running

# Check backend logs
docker-compose logs backend --tail 20

# Test backend
curl http://localhost:5000/api/videos

# Test frontend
# Open http://localhost:3000 in browser
```

## 🎬 Using the App

1. **Upload Videos**: Click "Upload" or use Drive sync
2. **Upload Music**: Add music files or use Drive sync  
3. **Enter Quote**: Type your motivational quote
4. **Customize Style**: Choose font, color, position, animation
5. **Add Subtitle** (optional): Enter subtitle text
6. **Generate**: Click "Generate Video"
7. **Download**: Click download when ready

## 📁 File Structure

```
backend/storage/
  ├── videos/     ← Put your source videos here
  ├── music/      ← Put your music files here
  ├── output/     ← Generated videos appear here
  └── fonts/      ← Custom fonts (if any)
```

## 🔐 Environment Configuration

### For Docker (Recommended):
Edit `docker-compose.yml`:
```yaml
environment:
  - DRIVE_VIDEOS_FOLDER=https://...
  - DRIVE_MUSIC_FOLDER=https://...
  - GOOGLE_DRIVE_API_KEY=AIza...
```

### For Local Development:
Edit `backend/.env`:
```env
DRIVE_VIDEOS_FOLDER=https://...
DRIVE_MUSIC_FOLDER=https://...
GOOGLE_DRIVE_API_KEY=AIza...
```

## 📚 Documentation

- **Drive Sync Setup**: `docs/API_KEY_SETUP.md`
- **Drive Sync Guide**: `docs/DRIVE_SYNC_GUIDE.md`
- **Sync UI Guide**: `docs/SYNC_UI_GUIDE.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`

## 🆘 Still Having Issues?

1. Check Docker Desktop is running (system tray icon)
2. Check logs: `docker-compose logs backend`
3. Try: `docker-compose down && docker-compose up --build -d`
4. Restart Docker Desktop
5. Check you're not low on disk space (need ~2GB free)

## 🎉 Success Indicators

When everything is working, you'll see:

**In logs:**
```
Server running on http://localhost:5000
=== Drive Sync Service Ready ===
```

**In browser:**
- Frontend loads at localhost:3000
- Can generate videos
- Sync panel shows "Configured" badge (if sync enabled)

**In Docker Desktop:**
- Two containers running (green status)
- No error messages
