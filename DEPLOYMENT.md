# Deployment Guide - Quote to Video Generator

## Overview

This application uses Docker to ensure consistent deployment across all environments (local, staging, production). FFmpeg and all dependencies are bundled into the Docker images.

## Prerequisites

- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Local Development with Docker

### 1. Build and Run with Docker Compose

```bash
docker-compose up --build
```

This will:
- Build both frontend and backend Docker images
- Start both services
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 2. Stop the services

```bash
docker-compose down
```

### 3. Run in detached mode (background)

```bash
docker-compose up -d --build
```

### 4. View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Adding Videos to Storage

Videos should be placed in `backend/storage/videos/` directory. The backend will automatically pick a random video when generating.

Supported formats: `.mp4`, `.mov`

## Production Deployment

### Option 1: Deploy on Docker-compatible Hosting (Recommended)

**Platforms supporting Docker:**
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Heroku (with Docker)
- Railway
- Render
- Fly.io

### Steps for Deployment:

1. **Push your code to Git repository**
   ```bash
   git push origin main
   ```

2. **Configure your hosting platform** to use the `docker-compose.yml`

3. **Set environment variables** (if needed):
   ```
   NODE_ENV=production
   CORS_ORIGIN=your-domain.com
   ```

4. **Map storage volumes** to persist generated videos and source videos

### Option 2: Deploy on Traditional VPS (AWS EC2, DigitalOcean, Linode, etc.)

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker and Docker Compose**
   ```bash
   # For Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone your repository**
   ```bash
   git clone your-repo-url
   cd your-project-folder
   ```

4. **Add your videos to storage**
   ```bash
   # Copy videos to the storage directory
   cp /path/to/videos/*.mp4 backend/storage/videos/
   ```

5. **Start the application**
   ```bash
   docker-compose up -d --build
   ```

6. **Setup a reverse proxy (Nginx)** for better performance and SSL:

   Create `/etc/nginx/sites-available/quote-video`:
   ```nginx
   upstream backend {
     server localhost:5000;
   }

   upstream frontend {
     server localhost:3000;
   }

   server {
     listen 80;
     server_name your-domain.com;

     client_max_body_size 100M;

     # Frontend
     location / {
       proxy_pass http://frontend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }

     # Backend API
     location /api/ {
       proxy_pass http://backend/api/;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/quote-video /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt** (recommended):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-domain.com
VIDEO_BITRATE=5000k
FFMPEG_PRESET=medium
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-domain.com/api
```

## Storage Persistence

### Important: Configure Volume Mounts

The `docker-compose.yml` already includes volume mounts for:
- `./backend/storage/videos` - Source videos
- `./backend/storage/output` - Generated videos

Make sure these directories exist and have proper permissions:

```bash
mkdir -p backend/storage/{videos,output}
chmod 755 backend/storage/{videos,output}
```

## Monitoring and Maintenance

### Check service health
```bash
docker-compose ps
```

### Restart services
```bash
docker-compose restart backend
docker-compose restart frontend
```

### View real-time logs
```bash
docker-compose logs -f --tail=100
```

### Clean up old generated videos
```bash
# The backend has auto-cleanup enabled (1 hour by default)
# Or manually: rm backend/storage/output/*.mp4
```

## Troubleshooting

### FFmpeg not found
- This should not happen with Docker, but if it does:
  - Rebuild: `docker-compose up --build`

### Port already in use
- Change ports in `docker-compose.yml`
- Or kill the process: `sudo lsof -ti:3000,5000 | xargs kill -9`

### Videos not loading
- Ensure videos are in `backend/storage/videos/`
- Check permissions: `chmod 644 backend/storage/videos/*.mp4`

### Generated videos not accessible
- Check `backend/storage/output/` directory exists
- Verify disk space: `df -h`

## Security Considerations

1. **Use HTTPS in production**
2. **Set strong CORS_ORIGIN** to your domain only
3. **Implement rate limiting** on the API
4. **Backup your storage directories regularly**
5. **Use environment variables** for sensitive configuration
6. **Keep Docker images updated**

## Performance Optimization

- Increase video bitrate for quality: `VIDEO_BITRATE=8000k`
- Use faster encoding: `FFMPEG_PRESET=fast` (lower quality, faster)
- Use slower encoding for quality: `FFMPEG_PRESET=slow` (higher quality, slower)
