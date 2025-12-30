import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface SessionLoggerProps {
  onAddMinutes: (minutes: number) => void;
}

// Discrete values for the slider to snap to
const PRESETS = [1, 5, 10, 15, 30, 60];

const SessionLogger: React.FC<SessionLoggerProps> = ({ onAddMinutes }) => {
  // Default to index 4 (which is 30 minutes)
  const [sliderIndex, setSliderIndex] = useState(4);
  
  const selectedMinutes = PRESETS[sliderIndex];

  const handleAction = (type: 'add' | 'remove') => {
    const minutesToLog = type === 'add' ? selectedMinutes : -selectedMinutes;
    onAddMinutes(minutesToLog);
    
    // Minimal visual feedback
    const btnId = type === 'add' ? 'btn-add' : 'btn-remove';
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.classList.add('scale-95', 'opacity-80');
      setTimeout(() => {
        btn.classList.remove('scale-95', 'opacity-80');
      }, 150);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 pb-12 flex flex-col gap-8 animate-slide-up">
      
      {/* Slider Section */}
      <div className="flex flex-col gap-4">
        
        {/* Value Display */}
        <div className="flex justify-between items-end px-1">
            <span className="text-sm text-zen-muted font-medium mb-1">
                Select duration
            </span>
            <div className="text-3xl font-light text-zen-text tabular-nums tracking-tight">
                {selectedMinutes}<span className="text-lg text-zen-muted ml-0.5 font-normal">min</span>
            </div>
        </div>

        {/* Slider Input */}
        <div className="relative h-10 flex items-center group">
          {/* Ticks/Guides */}
          <div className="absolute w-full flex justify-between px-[14px] pointer-events-none opacity-20 transition-opacity group-hover:opacity-40">
             {PRESETS.map((_, idx) => (
                 <div key={idx} className={`w-0.5 h-1.5 bg-zen-text ${idx === 0 || idx === PRESETS.length - 1 ? 'h-2.5' : ''}`}></div>
             ))}
          </div>

          <input
            type="range"
            min="0"
            max={PRESETS.length - 1}
            step="1"
            value={sliderIndex}
            onChange={(e) => setSliderIndex(parseInt(e.target.value))}
            className="z-10"
            aria-label="Select duration"
          />
        </div>
      </div>

      {/* Combined Action Bar */}
      <div className="flex w-full h-20 gap-2">
        {/* Remove Button (Neutral, Icon-only) */}
        <button
            id="btn-remove"
            onClick={() => handleAction('remove')}
            aria-label="Remove time"
            className="
                flex-1 
                bg-zen-surface/50 border border-white/5 
                rounded-2xl
                flex items-center justify-center
                text-zen-muted hover:text-zen-text hover:bg-white/5 hover:border-white/10
                transition-all duration-200 ease-out active:scale-95
            "
        >
            <Minus className="w-6 h-6" />
        </button>

        {/* Add Button (Prominent) */}
        <button
            id="btn-add"
            onClick={() => handleAction('add')}
            className="
                flex-[2.5] 
                bg-zen-text text-zen-bg
                rounded-2xl
                flex items-center justify-center gap-3
                text-xl font-medium tracking-tight
                shadow-lg shadow-black/20
                hover:bg-white hover:scale-[1.02]
                transition-all duration-200 ease-out active:scale-95
            "
        >
            <Plus className="w-6 h-6" />
            <span>Add time</span>
        </button>
      </div>

    </div>
  );
};

export default SessionLogger;