# Video Requirements & Specifications

## Source Video Specifications

### Required Format
- **Container:** MP4
- **Video Codec:** H.264 (libx264)
- **Audio Codec:** AAC
- **Resolution:** 1080x1920 (9:16 aspect ratio)
- **Frame Rate:** 24-60 fps
- **Bitrate:** 2-10 Mbps
- **Max File Size:** 100 MB

### Why 9:16 Format?
- YouTube Shorts: 9:16 vertical video format
- Instagram Reels: 9:16 aspect ratio
- TikTok: 9:16 native format
- Better for mobile viewing

### Recommended Durations
- **Minimum:** 15 seconds
- **Optimal:** 30-45 seconds
- **Maximum:** 60 seconds (platform dependent)

## Supported Input Formats

```
✓ MP4 (H.264)
✓ MOV (QuickTime)
⚠ WEBM (partial support)
✗ AVI (not recommended)
✗ FLV (not recommended)
```

## Output Video Specifications

**Generated videos will have:**
- Format: MP4 (H.264)
- Resolution: 1080x1920 (input resolution preserved)
- Audio: Original audio codec preserved
- Quality: Matches input quality
- Text Overlay: Rendered at native resolution

## Creating Test Videos

### Using FFmpeg

**Simple Color Video (no audio):**
```bash
ffmpeg -f lavfi -i color=c=blue:s=1080x1920:d=30 \
  -y test_blue.mp4
```

**Color Video with Audio:**
```bash
ffmpeg -f lavfi -i color=c=black:s=1080x1920:d=30 \
  -f lavfi -i sine=f=1000:d=30 \
  -pix_fmt yuv420p -y test_with_audio.mp4
```

**Gradient Video:**
```bash
ffmpeg -f lavfi -i "color=c=red:s=1080x1920:d=30,format=yuv420p" \
  -f lavfi -i sine=f=440:d=30 -pix_fmt yuv420p -y gradient.mp4
```

**From Image Sequence:**
```bash
ffmpeg -framerate 24 -i image_%04d.png -c:v libx264 \
  -pix_fmt yuv420p -y output.mp4
```

### Convert Existing Video to 9:16 Format

**Scale to 1080x1920:**
```bash
ffmpeg -i input_video.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 23 -c:a aac -b:a 128k \
  output_1080x1920.mp4
```

**Crop to 9:16 (if input is different aspect ratio):**
```bash
ffmpeg -i input.mp4 \
  -vf "crop=1080:1920" \
  output_cropped.mp4
```

## Checking Video Properties

### Verify Resolution
```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height \
  -of default=noprint_wrappers=1 video.mp4
```

**Output should be:**
```
width=1080
height=1920
```

### Get Complete Information
```bash
ffprobe -show_format -show_streams video.mp4
```

### Check Aspect Ratio
```bash
ffmpeg -i video.mp4 2>&1 | grep "Stream.*Video"
```

**Expected output:**
```
Stream #0:0: Video: h264 (avc1 / 0x31637661), yuv420p, 1080x1920, ...
```

## Text Overlay Positioning

### Position Options

**Top:**
```
┌─────────────────────┐
│ "Your quote here"   │  ← Text at top
│                     │
│                     │
│                     │
└─────────────────────┘
```

**Center (default):**
```
┌─────────────────────┐
│                     │
│ "Your quote here"   │  ← Text centered
│                     │
│                     │
└─────────────────────┘
```

**Bottom:**
```
┌─────────────────────┐
│                     │
│                     │
│                     │
│ "Your quote here"   │  ← Text at bottom
└─────────────────────┘
```

## Font Support

### Built-in Fonts (Windows)
- Arial
- Times New Roman
- Courier New
- Verdana
- Georgia

### Custom Fonts
Place font files in `backend/src/assets/fonts/`:
- Format: TTF or OTF
- Usage: Reference filename in style options

### Font Size Guidelines
- **Minimum:** 20px
- **Readable:** 40-80px
- **Large:** 80-120px
- **Maximum:** 150px

## Color Formats

### Supported Color Formats
- **Hex:** `#FFFFFF`, `#000000`
- **RGB:** Not recommended (use hex instead)

### Common Colors
```
White:   #FFFFFF
Black:   #000000
Red:     #FF0000
Blue:    #0000FF
Yellow:  #FFFF00
Green:   #00FF00
```

## Text Length Guidelines

### Quote Length Limits
- **Short Quote:** < 50 characters (fits on 1-2 lines)
- **Medium Quote:** 50-200 characters (fits on 3-5 lines)
- **Long Quote:** 200-500 characters (maximum allowed)

### Display Preview
```
Text wrapping is handled automatically by FFmpeg.
Newlines can be used for manual line breaks.
Long quotes will wrap to fit the video width.
```

## Platform Specifications

### YouTube Shorts
- Resolution: 1080x1920
- Aspect Ratio: 9:16
- Duration: 15-60 seconds
- Format: MP4

### Instagram Reels
- Resolution: 1080x1920 (recommended)
- Aspect Ratio: 9:16
- Duration: 15-90 seconds
- Format: MP4

### TikTok
- Resolution: 1080x1920 (native)
- Aspect Ratio: 9:16
- Duration: 15-10 minutes
- Format: MP4

## Performance Notes

### Processing Time
- Simple text overlay: 5-15 seconds
- Video with animation: 15-30 seconds
- Factors: CPU, video length, encoding preset

### Preset Comparison
```
ultrafast  → Fastest (lower quality)
superfast
veryfast
faster
fast
medium     → Balanced (default)
slow       → Slower (higher quality)
slower
veryslow   → Slowest (best quality)
```

## Troubleshooting

### Video Won't Upload
- Check file format (must be MP4)
- Verify file size < 100MB
- Ensure video is 1080x1920 resolution

### Text Overlay Missing or Incorrect
- Check font file path
- Verify text color is visible on background
- Test FFmpeg command manually

### Generated Video Corrupted
- Check source video integrity with `ffmpeg -v verbose`
- Verify sufficient disk space
- Try with different FFmpeg preset

### Audio Issues
- Verify source video has audio track
- Check audio codec support
- Test with `-c:a aac` explicitly

## Conversion Examples

### From Common Formats

**WebM to MP4:**
```bash
ffmpeg -i input.webm -c:v libx264 -crf 23 -c:a aac output.mp4
```

**AVI to MP4:**
```bash
ffmpeg -i input.avi -c:v libx264 -crf 23 -c:a aac output.mp4
```

**MOV to MP4:**
```bash
ffmpeg -i input.mov -c:v libx264 -crf 23 -c:a aac output.mp4
```

**Resize and Convert:**
```bash
ffmpeg -i input.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 23 -c:a aac output_1080x1920.mp4
```
