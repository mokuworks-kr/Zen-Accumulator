import React, { useEffect, useState } from 'react';

const GlobeView: React.FC = () => {
  // Mock active user count
  const [activeUsers, setActiveUsers] = useState(1243);

  // Slowly fluctuate count to simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center p-6 animate-fade-in relative">
       
       {/* Container to enforce alignment with other tabs */}
       <div className="w-full max-w-md h-full flex flex-col items-center">
            {/* Top Section: Aligned with where Toggle is in other views */}
           <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zen-surface/30 border border-white/5 text-[10px] font-medium text-zen-muted uppercase tracking-wider mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"/>
                Live Now
              </div>
              
              <h2 className="text-4xl md:text-5xl font-extralight text-zen-text text-center tracking-tighter">
                {activeUsers.toLocaleString()}
              </h2>
              <span className="text-sm text-zen-muted/60 font-light mt-1 tracking-wide">
                 minds meditating
              </span>
           </div>

          {/* Globe Placeholder - Centered in remaining space */}
          <div className="flex-1 flex items-center justify-center w-full relative -mt-8">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-[#1c1917] to-[#0c0a09] shadow-2xl flex items-center justify-center border border-white/5 relative overflow-hidden animate-fade-in">
                {/* World Map Texture Overlay */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center mix-blend-overlay"></div>
                
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80 pointer-events-none"></div>
                
                {/* Subtle Atmosphere Glow */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] pointer-events-none"></div>

                {/* Random Activity Dots */}
                <div className="absolute top-[35%] left-[45%] w-1 h-1 bg-white rounded-full animate-ping opacity-80 duration-[3000ms]"></div>
                <div className="absolute bottom-[40%] right-[30%] w-0.5 h-0.5 bg-white rounded-full animate-ping delay-700 opacity-60 duration-[4000ms]"></div>
                <div className="absolute top-[50%] left-[20%] w-1 h-1 bg-white rounded-full animate-ping delay-1000 opacity-50 duration-[2500ms]"></div>
                <div className="absolute bottom-[25%] left-[60%] w-0.5 h-0.5 bg-white rounded-full animate-ping delay-[2000ms] opacity-40 duration-[5000ms]"></div>
            </div>
          </div>
       </div>
    </div>
  );
};

export default GlobeView;