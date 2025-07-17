
import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-base-300 rounded-full h-2.5 overflow-hidden border border-neutral/50">
      <div
        className="bg-primary h-2.5 rounded-full"
        style={{ width: `${progress}%`, transition: 'width 0.35s ease-in-out' }}
      ></div>
    </div>
  );
};
