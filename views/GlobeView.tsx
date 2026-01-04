import React, { useEffect, useState, useRef, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

// Define the type for our city data
interface CityData {
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
  altitude: number;
}

const GlobeView: React.FC = () => {
  // Mock active user count
  const [activeUsers, setActiveUsers] = useState(1243);
  
  // Container dimensions for responsive globe
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState({ features: [] });
  const globeEl = useRef<GlobeMethods | undefined>(undefined);

  // Load GeoJSON for country boundaries
  useEffect(() => {
    fetch('https://vasturiano.github.io/react-globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  // ResizeObserver for reliable dimension tracking
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle Globe Ready state and inject Three.js material properties
  const handleGlobeReady = () => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      
      // Always keep globe centered
      controls.enablePan = false;
      
      // Access the underlying Three.js material of the globe sphere
      // This allows us to make the sphere itself transparent
      const globeMaterial = globeEl.current.globeMaterial() as any;
      if (globeMaterial) {
        globeMaterial.transparent = true;
        // Setting a low opacity allows seeing the "back" of the globe 
        // while the "front" shell provides a slight tint/occlusion for depth.
        globeMaterial.opacity = 0.15; 
        globeMaterial.color.set('#1c1917'); // Ensure it matches our zen-bg
      }
      
      // Set initial POV with a higher altitude for a smaller initial size
      globeEl.current.pointOfView({ altitude: 3.5 }, 0);
    }
  };

  // Slowly fluctuate user count
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Dummy Data for Points
  const pointsData: CityData[] = useMemo(() => [
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, size: 0.6, color: '#ffffff', altitude: 0.015 },
    { name: 'New York', lat: 40.7128, lng: -74.0060, size: 0.6, color: '#ffffff', altitude: 0.015 },
    { name: 'London', lat: 51.5074, lng: -0.1278, size: 0.6, color: '#ffffff', altitude: 0.015 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, size: 0.6, color: '#ffffff', altitude: 0.015 },
    { name: 'User 1', lat: 37.2, lng: 127.1, size: 0.3, color: 'rgba(255,255,255,0.7)', altitude: 0.015 },
    { name: 'User 2', lat: 41.0, lng: -73.5, size: 0.3, color: 'rgba(255,255,255,0.7)', altitude: 0.015 },
    { name: 'User 3', lat: 51.8, lng: 0.1, size: 0.3, color: 'rgba(255,255,255,0.7)', altitude: 0.015 },
    { name: 'User 4', lat: 35.2, lng: 139.2, size: 0.3, color: 'rgba(255,255,255,0.7)', altitude: 0.015 },
  ], []);

  return (
    <div className="h-full flex flex-col items-center relative animate-fade-in overflow-hidden touch-none pointer-events-auto">
       
       {/* Top Overlay: Stats */}
       <div className="absolute top-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none select-none">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zen-surface/40 border border-white/5 text-[10px] font-medium text-zen-muted uppercase tracking-wider mb-6 backdrop-blur-md">
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
        className="flex-1 w-full flex items-center justify-center cursor-move touch-none pointer-events-auto"
        style={{ background: 'transparent' }}
      >
        {dimensions.width > 0 && (
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            onGlobeReady={handleGlobeReady}
            
            // Visuals: Pure Wireframe Style
            backgroundColor="rgba(0,0,0,0)"
            showAtmosphere={true}
            atmosphereColor="#44403c"
            atmosphereAltitude={0.12}
            
            // The Sphere (Occlusion Shell)
            showGlobe={true}
            globeColor="#1c1917" // Color used in onGlobeReady to set the base
            
            // Country Outlines
            polygonsData={countries.features}
            polygonCapColor={() => 'rgba(0, 0, 0, 0)'} // Transparent fill
            polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
            polygonStrokeColor={() => '#e7e5e4'} // Bright white stroke
            polygonStrokeWidth={0.5}
            
            // Points (Users)
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude="altitude"
            pointRadius="size"
            pointResolution={32}
            pointsMerge={true}
            
            // Interaction settings
            animateIn={true}
            minAltitude={1.5}
            maxAltitude={3.5} // Maximum zoom out set to initial state
          />
        )}
      </div>
    </div>
  );
};

export default GlobeView;