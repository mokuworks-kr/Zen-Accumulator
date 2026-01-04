import React, { useEffect, useState, useRef, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

// Define the type for our city data
interface CityData {
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
}

const GlobeView: React.FC = () => {
  // Mock active user count
  const [activeUsers, setActiveUsers] = useState(1243);
  
  // Container dimensions for responsive globe
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const globeEl = useRef<GlobeMethods | undefined>(undefined);

  // Measure container on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Set initial auto-rotation
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      // Set initial distance slightly further away for a nice overview
      globeEl.current.pointOfView({ altitude: 2.5 }, 0);
    }
  }, []);

  // Slowly fluctuate user count
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Dummy Data for Points
  const pointsData: CityData[] = useMemo(() => [
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, size: 0.5, color: '#e7e5e4' },
    { name: 'New York', lat: 40.7128, lng: -74.0060, size: 0.5, color: '#e7e5e4' },
    { name: 'London', lat: 51.5074, lng: -0.1278, size: 0.5, color: '#e7e5e4' },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, size: 0.5, color: '#e7e5e4' },
    // Add some random smaller points nearby to simulate users
    { name: 'User 1', lat: 37.2, lng: 127.1, size: 0.2, color: '#78716c' },
    { name: 'User 2', lat: 41.0, lng: -73.5, size: 0.2, color: '#78716c' },
    { name: 'User 3', lat: 51.8, lng: 0.1, size: 0.2, color: '#78716c' },
    { name: 'User 4', lat: 35.2, lng: 139.2, size: 0.2, color: '#78716c' },
  ], []);

  return (
    <div className="h-full flex flex-col items-center relative animate-fade-in overflow-hidden">
       
       {/* Top Overlay: Stats */}
       {/* Pointer-events-none ensures drag works on the globe even if mouse is over this area (except the text itself if needed, but safer to let clicks pass through) */}
       <div className="absolute top-6 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zen-surface/30 border border-white/5 text-[10px] font-medium text-zen-muted uppercase tracking-wider mb-6 backdrop-blur-sm">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"/>
               Live Now
             </div>
             
             <h2 className="text-4xl md:text-5xl font-extralight text-zen-text text-center tracking-tighter drop-shadow-2xl">
               {activeUsers.toLocaleString()}
             </h2>
             <span className="text-sm text-zen-muted/80 font-light mt-1 tracking-wide drop-shadow-md">
                minds meditating
             </span>
          </div>
       </div>

      {/* 3D Globe Container */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full flex items-center justify-center cursor-move"
        style={{ background: 'transparent' }} // Ensure transparency so app bg shows (or use specific bg prop)
      >
        {dimensions.width > 0 && (
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            
            // Visuals
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundColor="rgba(0,0,0,0)" // Transparent to let app bg show, or match #1c1917
            atmosphereColor="#44403c" // Stone-700 ish
            atmosphereAltitude={0.15}
            
            // Points
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={0.01}
            pointRadius="size"
            pointResolution={32} // Smoother circles
            pointsMerge={true}
            pointPulseBtn={true} // Add a subtle pulse to points
            
            // Interaction
            animateIn={true}
          />
        )}
      </div>
    </div>
  );
};

export default GlobeView;