import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, Infinity, Hourglass } from 'lucide-react';
import { OdometerText } from '../components/OdometerText';

interface TimerProps {
  onFinish: (minutes: number) => void;
}

const PRESETS = [5, 10, 15, 20, 30, 45, 60];

type TimerMode = 'countdown' | 'open';

const TimerView: React.FC<TimerProps> = ({ onFinish }) => {
  const [mode, setMode] = useState<TimerMode>('countdown');
  
  // Countdown State
  const [targetMinutes, setTargetMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  
  // Open State
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Shared State
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  // Time Tracking Refs (for accuracy)
  const endTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Switch Mode Handler
  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'countdown') {
        setTimeLeft(targetMinutes * 60);
    } else {
        setElapsedTime(0);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (isRunning) {
      // Initialize timestamps anchor points
      if (mode === 'countdown') {
        // Calculate when the timer should end based on current timeLeft
        endTimeRef.current = Date.now() + (timeLeft * 1000);
      } else {
        // Calculate when the timer effectively started (subtracting already elapsed time)
        startTimeRef.current = Date.now() - (elapsedTime * 1000);
      }

      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        
        if (mode === 'countdown') {
            const delta = endTimeRef.current - now;
            // Use ceil to keep the display showing "15:00" until it hits "14:59.xxx"
            const remaining = Math.ceil(delta / 1000);
            
            if (remaining <= 0) {
                // Timer Finished
                setTimeLeft(0);
                completeSession(targetMinutes);
            } else {
                setTimeLeft(remaining);
            }
        } else {
            const delta = now - startTimeRef.current;
            const elapsed = Math.floor(delta / 1000);
            setElapsedTime(elapsed);
        }
      }, 100); // Check frequently (100ms) to ensure UI feels responsive, math handles the seconds.
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // We intentionally omit timeLeft/elapsedTime from deps to prevent resetting anchors on every tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode]); 

  // Complete & Save
  const completeSession = (minutesToLog: number) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Round to nearest minute
    const finalMinutes = Math.max(0, Math.round(minutesToLog));
    
    // Always call onFinish to trigger visual feedback
    onFinish(finalMinutes);
    
    // Reset states
    if (mode === 'countdown') {
        setTimeLeft(targetMinutes * 60);
    } else {
        setElapsedTime(0);
    }
  };

  const handleManualFinish = () => {
    if (mode === 'countdown') {
        // Log the time elapsed so far (Target - Remaining)
        const elapsed = (targetMinutes * 60) - timeLeft;
        completeSession(elapsed / 60);
    } else {
        // Log elapsed time
        completeSession(elapsedTime / 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'countdown') {
        setTimeLeft(targetMinutes * 60);
    } else {
        setElapsedTime(0);
    }
  };

  const setDuration = (min: number) => {
    setTargetMinutes(min);
    setTimeLeft(min * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    
    if (h > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
  };

  // Display Value based on Mode
  const displayTime = mode === 'countdown' ? timeLeft : elapsedTime;

  return (
    <div className="h-full flex flex-col items-center p-6 animate-fade-in relative">
      
      {/* Mode Toggle */}
      <div className="flex bg-zen-surface/50 p-1 rounded-full mb-12 border border-white/5">
        <button
            onClick={() => switchMode('countdown')}
            className={`
                flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all
                ${mode === 'countdown' ? 'bg-stone-700 text-zen-text shadow-sm' : 'text-zen-muted hover:text-zen-text'}
            `}
        >
            <Hourglass size={14} />
            Timer
        </button>
        <button
            onClick={() => switchMode('open')}
            className={`
                flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all
                ${mode === 'open' ? 'bg-stone-700 text-zen-text shadow-sm' : 'text-zen-muted hover:text-zen-text'}
            `}
        >
            <Infinity size={14} />
            Open
        </button>
      </div>

      {/* Main Display - Updated max-w-sm to max-w-md for consistency */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <div className="relative mb-16">
            <OdometerText 
                value={formatTime(displayTime)}
                className={`text-8xl md:text-9xl font-light tracking-tighter text-zen-text transition-opacity duration-500 ${isRunning ? 'opacity-100' : 'opacity-90'}`}
            />
            
            {isRunning && (
                <div className="absolute -inset-8 border border-zen-muted/10 rounded-full animate-pulse pointer-events-none" />
            )}
            <div className="text-center mt-2">
                 {/* Unified Typography: Lowercase, No All-Caps, Consistent with Home */}
                <span className="text-lg text-zen-muted/60 font-normal tracking-tight">
                    {mode === 'countdown' ? 'remaining' : 'elapsed'}
                </span>
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mb-12">
            {/* Reset */}
            <button 
                onClick={resetTimer}
                disabled={displayTime === 0 && !isRunning}
                className="w-14 h-14 rounded-full border border-white/5 bg-zen-surface/20 text-zen-muted hover:text-zen-text hover:bg-zen-surface hover:border-white/20 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                aria-label="Reset Timer"
            >
                <RotateCcw size={20} />
            </button>

            {/* Play / Pause */}
            <button 
                onClick={toggleTimer}
                className={`
                    w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                    ${isRunning 
                        ? 'bg-transparent border border-white/5 text-zen-muted hover:text-zen-text hover:border-white/10' 
                        : 'bg-zen-text text-zen-bg hover:scale-105 active:scale-95 shadow-xl shadow-black/20'}
                `}
                aria-label={isRunning ? "Pause" : "Start"}
            >
                {isRunning ? (
                    // Solid fill, no stroke (flat shape)
                    <Pause size={32} fill="currentColor" strokeWidth={0} />
                ) : (
                    // Play button standard fill
                    <Play size={32} className="fill-current ml-1" />
                )}
            </button>

            {/* Finish / Save */}
            <button 
                onClick={handleManualFinish}
                disabled={mode === 'countdown' ? (timeLeft === targetMinutes * 60) : (elapsedTime === 0)}
                className="w-14 h-14 rounded-full border border-white/5 bg-green-900/20 text-green-400 hover:text-green-300 hover:bg-green-900/30 hover:border-green-500/30 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                aria-label="Finish and Save"
            >
                <Check size={22} />
            </button>
        </div>

        {/* Duration Selection (Only for Countdown) */}
        <div className={`transition-all duration-500 overflow-hidden ${mode === 'countdown' && !isRunning ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex gap-2 overflow-x-auto max-w-[90vw] px-2 pb-2 mask-linear-fade">
                {PRESETS.map(min => (
                <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`
                        px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors border
                        ${targetMinutes === min 
                            ? 'bg-zen-surface text-zen-text border-white/10' 
                            : 'bg-transparent text-zen-muted border-transparent hover:text-zen-text hover:bg-white/5'}
                    `}
                >
                    {min}m
                </button>
                ))}
            </div>
        </div>
        
        {/* Helper Text for Open Mode */}
        <div className={`transition-all duration-500 ${mode === 'open' && !isRunning && elapsedTime === 0 ? 'opacity-100' : 'opacity-0 h-0'}`}>
            <p className="text-zen-muted/60 text-xs tracking-wide">Tap play to begin an open-ended session</p>
        </div>

      </div>
    </div>
  );
};

export default TimerView;