import React, { useState, useEffect } from 'react';
import AccumulatorDisplay from './components/AccumulatorDisplay';
import SessionLogger from './components/SessionLogger';
import { STORAGE_KEY } from './utils';
import { RotateCcw, Trash2 } from 'lucide-react';

interface Ripple {
  id: number;
  gradient: string;
}

const App: React.FC = () => {
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Track history for undo
  const [previousTotal, setPreviousTotal] = useState<number>(0);
  const [lastDiff, setLastDiff] = useState<number>(0);

  // Ripple state
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Initialize from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTotalMinutes(parsed.totalMinutes || 0);
      } catch (e) {
        console.error("Failed to parse stored meditation data", e);
      }
    }
    setMounted(true);
  }, []);

  // Persist to LocalStorage whenever state changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalMinutes }));
    }
  }, [totalMinutes, mounted]);

  const triggerRipple = () => {
    const id = Date.now();
    // Generate two random vibrant colors for a beautiful gradient
    // Using HSL to ensure they are colorful but not too dark
    const h1 = Math.floor(Math.random() * 360);
    const h2 = (h1 + 60) % 360; // 60 deg offset for harmony
    const c1 = `hsl(${h1}, 70%, 60%)`;
    const c2 = `hsl(${h2}, 80%, 60%)`;
    
    // Radial gradient from bottom center ish
    const gradient = `radial-gradient(circle, ${c1}, ${c2}, transparent 70%)`;
    
    setRipples(prev => [...prev, { id, gradient }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1500);
  };

  const handleUpdateMinutes = (minutes: number) => {
    setPreviousTotal(totalMinutes);
    setLastDiff(minutes);
    
    setTotalMinutes((prev) => Math.max(0, prev + minutes));
    
    if (minutes > 0) {
        triggerRipple();
    }

    // Show Undo Toast
    setShowUndo(true);
    const timer = setTimeout(() => setShowUndo(false), 5000); // 5 seconds to undo
    return () => clearTimeout(timer);
  };

  const handleUndo = () => {
    setTotalMinutes(previousTotal);
    setShowUndo(false);
  };

  const confirmReset = () => {
    setTotalMinutes(0);
    setShowResetConfirm(false);
    setShowUndo(false); // Hide undo toast if visible as we just reset everything
  };

  if (!mounted) return <div className="min-h-screen bg-zen-bg" />;

  return (
    <div className="relative min-h-screen bg-zen-bg text-zen-text overflow-hidden flex flex-col justify-between font-sans">
      
      {/* Ambient Background Glow (Static) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stone-800/20 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Background Ripples Layer */}
      {/* Using margins for centering instead of translate to avoid conflict with scale animation keyframes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {ripples.map(ripple => (
            <div
                key={ripple.id}
                className="absolute top-1/2 left-1/2 w-[100vw] h-[100vw] -ml-[50vw] -mt-[50vw] rounded-full opacity-0 animate-ripple origin-center"
                style={{ background: ripple.gradient }}
            />
        ))}
      </div>

      {/* Reset Button (Top Right, Subtle) */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="absolute top-6 right-6 p-3 text-zen-muted/30 hover:text-zen-muted/80 transition-colors duration-300 z-40 outline-none"
        aria-label="Reset progress"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Undo Toast - Positioned at top center */}
      <div 
        className={`
            fixed top-6 left-1/2 -translate-x-1/2 z-50
            transition-all duration-500 ease-in-out
            ${showUndo ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
        <button 
            onClick={handleUndo}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 border border-stone-700/50 rounded-full shadow-2xl text-sm font-medium text-zen-text/90 hover:bg-stone-700 transition-colors"
        >
            <RotateCcw className="w-3.5 h-3.5 text-zen-accent" />
            <span>
                {lastDiff > 0 
                  ? `Undo adding ${lastDiff}m` 
                  : `Undo removing ${Math.abs(lastDiff)}m`
                }
            </span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={() => setShowResetConfirm(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-zen-surface border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-scale-in">
                <h3 className="text-xl font-medium text-zen-text mb-2">Reset Progress?</h3>
                <p className="text-zen-muted mb-6 text-sm leading-relaxed">
                    This will permanently delete all your accumulated meditation time. This action cannot be undone.
                </p>
                
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-2 text-sm text-zen-muted hover:text-zen-text transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmReset}
                        className="px-4 py-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Content Area - Expands to push footer down */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-6 pt-12">
        <AccumulatorDisplay totalMinutes={totalMinutes} />
      </main>

      {/* Bottom Control Area */}
      <footer className="relative z-20 w-full bg-gradient-to-t from-zen-bg via-zen-bg to-transparent pt-8">
         <SessionLogger onAddMinutes={handleUpdateMinutes} />
      </footer>

    </div>
  );
};

export default App;