import React, { useMemo } from 'react';
import { formatDuration } from '../utils';

interface AccumulatorDisplayProps {
  totalMinutes: number;
}

const OdometerDigit: React.FC<{ char: string }> = ({ char }) => {
  const isNumber = /^[0-9]$/.test(char);

  // If not a number (e.g., 'h', 'm', space), render normally
  if (!isNumber) {
    return <span className="inline-block text-zen-muted/80">{char}</span>;
  }

  const digit = parseInt(char, 10);

  return (
    <span 
        className="inline-block relative h-[1em] w-[0.65em] overflow-hidden text-center align-top"
        style={{
            // Create a fade effect at the top and bottom of the digit window
            // This softens the hard clip as numbers scroll in/out
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
        }}
    >
      {/* The strip of numbers 0-9 */}
      <span
        className="absolute top-0 left-0 flex flex-col items-center w-full transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <span key={num} className="h-[1em] flex items-center justify-center">
            {num}
          </span>
        ))}
      </span>
      {/* Invisible placeholder to maintain width and height in the flow */}
      <span className="opacity-0">{digit}</span>
    </span>
  );
};

const AccumulatorDisplay: React.FC<AccumulatorDisplayProps> = ({ totalMinutes }) => {
  const { major, label } = useMemo(() => formatDuration(totalMinutes), [totalMinutes]);

  return (
    <div className="flex flex-col items-center justify-center space-y-2 animate-fade-in select-none">
      {/* Removed overflow-hidden from h1 to prevent unintended clipping of ascenders/descenders */}
      {/* Added items-baseline to ensure numbers and units align perfectly on the text baseline */}
      <h1 className="flex justify-center items-baseline text-7xl md:text-9xl font-light tracking-tighter text-zen-text leading-none py-2 tabular-nums">
        {major.split('').map((char, index) => (
          // Use index as key to ensure the component persists for animation
          <OdometerDigit key={index} char={char} />
        ))}
      </h1>
      <span className="text-lg text-zen-muted/60 font-normal tracking-tight capitalize">
        {label}
      </span>
    </div>
  );
};

export default AccumulatorDisplay;