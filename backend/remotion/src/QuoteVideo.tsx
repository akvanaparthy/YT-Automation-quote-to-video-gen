import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from 'remotion';

interface QuoteVideoProps {
  quote: string;
  videoSrc: string;
  musicSrc?: string;
  style: {
    fontSize: number;
    fontColor: string;
    fontFamily: string;
    position: 'top' | 'center' | 'bottom';
    animation: string;
    backgroundColor?: string;
  };
}

export const QuoteVideo: React.FC<QuoteVideoProps> = ({
  quote,
  videoSrc,
  musicSrc,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation logic
  const getAnimation = () => {
    switch (style.animation) {
      case 'fade-in':
        return {
          opacity: interpolate(frame, [0, fps], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        };
      case 'fade-out':
        return {
          opacity: interpolate(frame, [0, fps], [1, 0]),
        };
      case 'slide-in-left':
        return {
          transform: `translateX(${interpolate(
            frame,
            [0, fps],
            [-1000, 0],
            {
              extrapolateRight: 'clamp',
            }
          )}px)`,
        };
      case 'slide-in-right':
        return {
          transform: `translateX(${interpolate(
            frame,
            [0, fps],
            [1000, 0],
            {
              extrapolateRight: 'clamp',
            }
          )}px)`,
        };
      case 'bounce-in':
        const bounce = spring({
          frame,
          fps,
          config: {
            damping: 10,
            mass: 0.5,
          },
        });
        return {
          transform: `scale(${bounce})`,
        };
      case 'zoom-in':
        return {
          transform: `scale(${interpolate(frame, [0, fps], [0, 1], {
            extrapolateRight: 'clamp',
          })})`,
        };
      default:
        return {};
    }
  };

  // Position logic
  const getPosition = () => {
    switch (style.position) {
      case 'top':
        return { top: '10%' };
      case 'bottom':
        return { bottom: '10%' };
      default:
        return { top: '50%', transform: 'translateY(-50%)' };
    }
  };

  return (
    <AbsoluteFill>
      {/* Background Video */}
      <OffthreadVideo src={staticFile(videoSrc)} />

      {/* Background Music */}
      {musicSrc && <Audio src={staticFile(musicSrc)} volume={0.3} />}

      {/* Text Overlay */}
      <AbsoluteFill
        style={{
          justifyContent: style.position === 'center' ? 'center' : 'flex-start',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            ...getPosition(),
            ...getAnimation(),
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: style.backgroundColor || 'rgba(0, 0, 0, 0.5)',
              padding: '30px',
              borderRadius: '10px',
            }}
          >
            <p
              style={{
                fontSize: style.fontSize,
                color: style.fontColor,
                fontFamily: style.fontFamily,
                margin: 0,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {quote}
            </p>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
