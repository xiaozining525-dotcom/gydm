import React from 'react';
import { DanmuItem } from '../types';
import { MAX_TRACKS } from '../constants';

interface DanmuLayerProps {
  items: DanmuItem[];
  onAnimationEnd: (id: string) => void;
}

const DanmuLayer: React.FC<DanmuLayerProps> = ({ items, onAnimationEnd }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-danmu text-2xl md:text-3xl font-bold drop-shadow-md select-none px-4"
          style={{
            top: `${(item.track / MAX_TRACKS) * 85 + 5}%`, // Top 90%
            color: item.color,
            fontFamily: item.font,
            animationDuration: `${item.speed}s`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          }}
          onAnimationEnd={() => onAnimationEnd(item.id)}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default DanmuLayer;