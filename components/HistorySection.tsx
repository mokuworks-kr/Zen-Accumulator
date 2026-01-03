import React, { useState, useMemo } from 'react';
import { Session } from '../types';
import { List, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface HistorySectionProps {
  sessions: Session[];
}

interface DailyStat {
  dateStr: string; // YYYY-MM-DD (Local)
  displayDate: string; // "Sep 24"
  fullDate: string; // "September 24, 2023"
  totalMinutes: number;
  sessions: Session[];
}

// Helper to get local YYYY-MM-DD
const getLocalDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Calendar View Component ---
const CalendarView: React.FC<{ stats: DailyStat[] }> = ({ stats }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Map for quick lookup: "YYYY-MM-DD" -> DailyStat
  const statsMap = useMemo(() => {
    return stats.reduce((acc, stat) => {
      acc[stat.dateStr] = stat;
      return acc;
    }, {} as Record<string, DailyStat>);
  }, [stats]);

  // Initialize selectedStat with today's data if available
  const [selectedStat, setSelectedStat] = useState<DailyStat | null>(() => {
    const todayStr = getLocalDateStr(new Date());
    return statsMap[todayStr] || null;
  });

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedStat(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedStat(null);
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = getLocalDateStr(clickedDate);
    const stat = statsMap[dateStr];
    
    // Only allow selection if there is recorded activity
    if (stat && stat.totalMinutes > 0) {
       if (selectedStat?.dateStr === dateStr) {
         setSelectedStat(null);
       } else {
         setSelectedStat(stat);
       }
    }
  };

  // Helper to format the selected date to "Weekday Day" (e.g., "Monday 24")
  const formatSelectedDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' });
  };

  return (
    // Restricted width on desktop for Calendar to keep cells square-ish
    <div className="w-full max-w-md mx-auto animate-fade-in flex flex-col">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={prevMonth} className="p-2 text-zen-muted hover:text-zen-text transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-medium tracking-wide">
          {/* Forced English Locale */}
          {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} className="p-2 text-zen-muted hover:text-zen-text transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Prominent Selected Day Header */}
      <div className="min-h-[5rem] flex items-center justify-center mb-6">
        {selectedStat ? (
            <div className="flex flex-col items-center animate-scale-in">
                <span className="text-sm text-zen-muted font-medium mb-1 tracking-wide">
                    {/* Changed to remove Month/Year redundancy */}
                    {formatSelectedDate(selectedStat.dateStr)}
                </span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-light text-zen-text tracking-tighter tabular-nums">
                        {selectedStat.totalMinutes}
                    </span>
                    <span className="text-lg text-zen-muted font-normal">min</span>
                </div>
            </div>
        ) : (
            <div className="text-zen-muted/30 text-sm italic font-light">
                Select a day to view details
            </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center text-sm">
        {/* Weekday Headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-zen-muted/60 font-medium text-xs py-2">{day}</div>
        ))}

        {/* Empty slots for start of month */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const currentLoopDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dateStr = getLocalDateStr(currentLoopDate);
          const stat = statsMap[dateStr];
          const hasActivity = stat && stat.totalMinutes > 0;
          
          const isToday = 
            new Date().getDate() === day && 
            new Date().getMonth() === currentDate.getMonth() && 
            new Date().getFullYear() === currentDate.getFullYear();
          
          const isSelected = selectedStat?.dateStr === dateStr;

          return (
            <button 
                key={day} 
                onClick={() => handleDayClick(day)}
                disabled={!hasActivity}
                className={`
                    flex flex-col items-center justify-center h-10 relative group outline-none
                    transition-all duration-200
                    ${hasActivity ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                `}
            >
              <span 
                className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-200
                  ${isSelected 
                      ? 'bg-zen-text text-zen-bg font-semibold shadow-lg shadow-white/5 scale-110' 
                      : ''}
                  ${!isSelected && hasActivity 
                      ? 'bg-zen-surface text-zen-text font-medium hover:bg-stone-700' 
                      : ''}
                  ${!isSelected && !hasActivity && isToday 
                      ? 'border border-zen-muted/50 text-zen-text' 
                      : ''}
                  ${!isSelected && !hasActivity && !isToday 
                      ? 'text-zen-muted/20' 
                      : ''}
                `}
              >
                {day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- List View Component ---
const ListView: React.FC<{ stats: DailyStat[] }> = ({ stats }) => {
  
  if (stats.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-zen-muted/50 animate-fade-in">
            <p className="text-sm">No sessions recorded yet.</p>
        </div>
    );
  }

  return (
    // Reverting to a single column flex stack max-w-md to ensure perfect centering on desktop.
    // The previous 2-column grid caused items to be left-aligned when there were few items.
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto animate-slide-up">
      {stats.map((stat) => {
        return (
          <div 
              key={stat.dateStr} 
              className="flex items-center justify-between p-5 rounded-xl bg-zen-surface/30 border border-white/5 hover:bg-zen-surface/50 transition-colors"
          >
             <div className="flex flex-col">
                <span className="text-zen-text text-sm font-medium">
                    {stat.fullDate}
                </span>
             </div>
             
             <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-light text-zen-text tabular-nums">{stat.totalMinutes}</span>
                <span className="text-xs text-zen-muted">min</span>
             </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Main History Container ---
const HistorySection: React.FC<HistorySectionProps> = ({ sessions }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Aggregate sessions by date
  const dailyStats: DailyStat[] = useMemo(() => {
    const grouped: Record<string, { total: number, sessions: Session[] }> = {};
    
    sessions.forEach(session => {
        const date = new Date(session.date);
        const dateKey = getLocalDateStr(date);
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = { total: 0, sessions: [] };
        }
        grouped[dateKey].total += session.duration;
        grouped[dateKey].sessions.push(session);
    });

    // Convert map to array and sort by newest first
    return Object.entries(grouped)
        .map(([dateStr, data]) => {
            const [y, m, d] = dateStr.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            
            return {
                dateStr,
                displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                totalMinutes: data.total,
                sessions: data.sessions
            };
        })
        .filter(stat => stat.totalMinutes > 0) // Only show days with net positive minutes
        .sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [sessions]);

  return (
    // Main container handles overall width. 
    // ListView now has its own internal max-w-md mx-auto to ensure centering.
    <div className="w-full max-w-md md:max-w-2xl mx-auto px-6 py-6 md:py-12 min-h-[50vh] flex flex-col items-center">
      
      {/* Mode Toggle (Timer Style) */}
      <div className="flex bg-zen-surface/50 p-1 rounded-full mb-12 border border-white/5">
        <button
            onClick={() => setViewMode('list')}
            className={`
                flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all
                ${viewMode === 'list' ? 'bg-stone-700 text-zen-text shadow-sm' : 'text-zen-muted hover:text-zen-text'}
            `}
        >
            <List size={14} />
            List
        </button>
        <button
            onClick={() => setViewMode('calendar')}
            className={`
                flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all
                ${viewMode === 'calendar' ? 'bg-stone-700 text-zen-text shadow-sm' : 'text-zen-muted hover:text-zen-text'}
            `}
        >
            <CalendarIcon size={14} />
            Calendar
        </button>
      </div>

      <div className="w-full">
        {viewMode === 'list' ? (
            <ListView stats={dailyStats} />
        ) : (
            <CalendarView stats={dailyStats} />
        )}
      </div>
      
      <div className="h-20" /> {/* Spacer for bottom scroll */}
    </div>
  );
};

export default HistorySection;