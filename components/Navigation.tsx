import React from 'react';
import { Home, History, Timer, Globe } from 'lucide-react';

type Tab = 'home' | 'history' | 'timer' | 'globe';

interface NavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  highlightHistory?: boolean;
}

const Navigation: React.FC<NavProps> = ({ activeTab, onTabChange, highlightHistory = false }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'timer', icon: Timer, label: 'Timer' },
    { id: 'globe', icon: Globe, label: 'Live' },
  ] as const;

  return (
    <div className="h-20 flex-none bg-zen-bg border-t border-white/5 px-6 pb-4">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isHistory = item.id === 'history';
          
          // Should we apply the highlight effect?
          // Only highlight history if requested and not currently active (optional, but looks better if it glows even when active)
          const isHighlighted = isHistory && highlightHistory;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-200 ease-out ${
                isActive ? 'text-zen-text scale-105' : 'text-zen-muted hover:text-zen-text/70'
              } ${isHighlighted ? '!text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : ''}`}
            >
              <item.icon 
                strokeWidth={isActive ? 2.5 : 1.5} 
                className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`} 
              />
              <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;