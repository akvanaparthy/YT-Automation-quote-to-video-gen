# Custom Fonts Directory

Place custom font files here (.ttf, .otf)

## Default Fonts Used
The system uses DejaVu fonts which are pre-installed in the Docker container:
- DejaVuSans.ttf (Arial)
- DejaVuSans-Bold.ttf (Arial Bold)
- DejaVuSerif.ttf (Times New Roman)
- DejaVuSerif-Bold.ttf (Times Bold)
- DejaVuSansMono.ttf (Courier New)
- DejaVuSansMono-Bold.ttf (Courier Bold)

## Adding Custom Fonts
1. Place your .ttf or .otf font files in this directory
2. Update the FONT_MAP in `src/services/textOverlay.js`
3. The fonts will be available via the volume mount
