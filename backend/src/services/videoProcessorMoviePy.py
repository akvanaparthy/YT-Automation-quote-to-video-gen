#!/usr/bin/env python3
"""
MoviePy-based Video Processor
Alternative to FFmpeg for cleaner text rendering
"""

from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, AudioFileClip
import sys
import json

def process_video(video_path, quote, style, output_path, music_path=None, max_duration=None):
    """
    Process video with text overlay using MoviePy
    
    Args:
        video_path: Path to input video
        quote: Text to overlay
        style: Dict with fontsize, fontcolor, position, etc.
        output_path: Path to save output video
        music_path: Optional background music path
        max_duration: Optional max duration in seconds
    """
    
    # Load video
    video = VideoFileClip(video_path)
    
    # Apply duration limit if specified
    if max_duration and max_duration < video.duration:
        video = video.subclip(0, max_duration)
    
    # Create text clip with proper wrapping
    txt_clip = TextClip(
        quote,
        fontsize=style.get('fontSize', 60),
        color=style.get('fontColor', 'white'),
        font='DejaVu-Sans',  # System font name
        method='caption',  # Auto-wrap text
        size=(video.w * 0.8, None),  # 80% of video width
        stroke_color='black',
        stroke_width=2
    )
    
    # Position text based on style
    position = style.get('position', 'center')
    if position == 'top':
        txt_clip = txt_clip.set_position(('center', 50))
    elif position == 'bottom':
        txt_clip = txt_clip.set_position(('center', video.h - txt_clip.h - 50))
    else:  # center
        txt_clip = txt_clip.set_position('center')
    
    # Set duration to match video
    txt_clip = txt_clip.set_duration(video.duration)
    
    # Composite video with text
    final_video = CompositeVideoClip([video, txt_clip])
    
    # Add music if provided
    if music_path:
        music = AudioFileClip(music_path)
        # Mix with original audio if video has audio
        if video.audio:
            from moviepy.audio.AudioClip import CompositeAudioClip
            # Lower music volume
            music = music.volumex(0.3)
            # Mix audio
            final_audio = CompositeAudioClip([video.audio, music.set_duration(video.duration)])
            final_video = final_video.set_audio(final_audio)
        else:
            final_video = final_video.set_audio(music.set_duration(video.duration).volumex(0.3))
    
    # Write output
    final_video.write_videofile(
        output_path,
        codec='libx264',
        audio_codec='aac',
        temp_audiofile='temp-audio.m4a',
        remove_temp=True,
        fps=video.fps
    )
    
    # Close clips
    video.close()
    txt_clip.close()
    final_video.close()
    if music_path:
        music.close()

if __name__ == '__main__':
    # Read JSON config from stdin or args
    if len(sys.argv) > 1:
        config = json.loads(sys.argv[1])
    else:
        config = json.load(sys.stdin)
    
    process_video(
        config['video_path'],
        config['quote'],
        config['style'],
        config['output_path'],
        config.get('music_path'),
        config.get('max_duration')
    )
    
    print(json.dumps({'success': True, 'output': config['output_path']}))
