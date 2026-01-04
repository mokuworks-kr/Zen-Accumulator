
import React from 'react';

const OdometerDigit: React.FC<{ char: string }> = ({ char }) => {
  const isNumber = /^[0-9]$/.test(char);

  // If not a number (e.g., ':', 'h', 'm', space, comma), render normally
  if (!isNumber) {
    // Removed text-zen-muted/80 to make it match the digit color
    return <span className="inline-block">{char}</span>;
  }

  const digit = parseInt(char, 10);

  return (
    <span 
        className="inline-block relative h-[1em] w-[0.65em] overflow-hidden text-center align-top"
        style={{
            // Create a fade effect at the top and bottom of the digit window
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

interface OdometerTextProps {
  value: string;
  className?: string;
}

export const OdometerText: React.FC<OdometerTextProps> = ({ value, className = '' }) => {
  return (
    <div className={`flex justify-center items-baseline leading-none select-none ${className}`}>
      {value.split('').map((char, index) => (
        // Use index as key. For fixed-format strings, this works well.
        <OdometerDigit key={index} char={char} />
      ))}
    </div>
  );
};
