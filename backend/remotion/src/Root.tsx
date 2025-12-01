import React from 'react';
import { Composition } from 'remotion';
import { QuoteVideo } from './QuoteVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuoteVideo"
        component={QuoteVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          quote: 'Default quote text',
          videoSrc: '',
          musicSrc: '',
          style: {
            fontSize: 60,
            fontColor: '#FFFFFF',
            fontFamily: 'Arial',
            position: 'center',
            animation: 'fade-in',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }
        }}
      />
    </>
  );
};
