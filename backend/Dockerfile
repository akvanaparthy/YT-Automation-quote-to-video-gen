# Use Node.js 20 on Debian Bookworm (has GLIBC 2.36)
FROM node:20-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies for Remotion (keeping FFmpeg for ffprobe)
RUN apt-get update && apt-get install -y \
    curl \
    fonts-dejavu \
    fonts-liberation \
    chromium \
    chromium-driver \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome/Chromium path for Remotion
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy backend package files
COPY package*.json ./

# Install backend Node dependencies
RUN npm install

# Copy remotion package files and install
COPY remotion/package*.json ./remotion/
WORKDIR /app/remotion
RUN npm install

# Pre-download Chrome Headless Shell for Remotion
RUN npx remotion browser ensure

# Back to app directory
WORKDIR /app

# Copy all application files
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/videos || exit 1

# Start the application
CMD ["npm", "run", "dev"]
