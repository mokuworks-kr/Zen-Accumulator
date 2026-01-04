
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { OdometerText } from '../components/OdometerText';

// Define types for GeoJSON data
interface GeoData {
  features: any[];
}

interface CityData {
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
  altitude: number;
  userCount: number;
}

const GlobeView: React.FC = () => {
  const [globalUsers, setGlobalUsers] = useState(1243);
  const [selectedLocation, setSelectedLocation] = useState<CityData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState<GeoData>({ features: [] });
  const [graticules, setGraticules] = useState<GeoData>({ features: [] });
  
  const globeEl = useRef<GlobeMethods>(null);
  const rotationTimerRef = useRef<number | null>(null);

  // Load GeoJSON data
  useEffect(() => {
    fetch('https://vasturiano.github.io/react-globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
    
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_graticules_10.geojson')
      .then(res => res.json())
      .then(setGraticules);
  }, []);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotation logic
  const triggerAutoRotatePause = useCallback(() => {
    const globe = globeEl.current;
    if (!globe) return;
    const controls = globe.controls();
    if (!controls) return;
    
    controls.autoRotate = false;
    if (rotationTimerRef.current) window.clearTimeout(rotationTimerRef.current);
    
    rotationTimerRef.current = window.setTimeout(() => {
      const currentGlobe = globeEl.current;
      if (currentGlobe) {
        const currentControls = currentGlobe.controls();
        if (currentControls) currentControls.autoRotate = true;
      }
    }, 2000);
  }, []);

  const handleGlobeReady = () => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.enablePan = false;
      
      const globeMaterial = (globeEl.current as any).globeMaterial();
      if (globeMaterial) {
        globeMaterial.transparent = true;
        globeMaterial.opacity = 0.15; 
        globeMaterial.color.set('#1c1917');
      }
      globeEl.current.pointOfView({ altitude: 2.8 }, 0);
    }
  };

  useEffect(() => {
    return () => {
      if (rotationTimerRef.current) window.clearTimeout(rotationTimerRef.current);
    };
  }, []);

  // Revert selected location after 5 seconds
  useEffect(() => {
    if (selectedLocation) {
      const timer = setTimeout(() => {
        setSelectedLocation(null);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [selectedLocation]);

  // Fluctuating user count
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const pointsData: CityData[] = useMemo(() => [
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 42 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 38 },
    { name: 'New York', lat: 40.7128, lng: -74.0060, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 112 },
    { name: 'London', lat: 51.5074, lng: -0.1278, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 85 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 71 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 29 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 44 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 56 },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 63 },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 18 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 94 },
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 33 },
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 12 },
    { name: 'Moscow', lat: 55.7558, lng: 37.6173, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 22 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 31 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 48 },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 27 },
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 19 },
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 35 },
    { name: 'Lagos', lat: 6.5244, lng: 3.3792, size: 0.6, color: '#ffffff', altitude: 0.015, userCount: 14 },
  ], []);

  const combinedPolygons = useMemo(() => {
    const countryFeatures = countries.features.map(f => ({ ...f, _isCountry: true }));
    const graticuleFeatures = graticules.features.map(f => ({ ...f, _isCountry: false }));
    return [...countryFeatures, ...graticuleFeatures];
  }, [countries, graticules]);

  const handlePointClick = (point: CityData) => {
    setSelectedLocation(point);
    triggerAutoRotatePause();
  };

  const odometerValue = useMemo(() => {
    const rawNum = selectedLocation ? selectedLocation.userCount : globalUsers;
    return rawNum.toLocaleString('en-US').padStart(5, ' ');
  }, [selectedLocation, globalUsers]);

  return (
    <div 
      className="h-full flex flex-col items-center relative animate-fade-in overflow-hidden touch-none pointer-events-auto"
      onPointerDown={triggerAutoRotatePause} 
      onPointerUp={triggerAutoRotatePause}
    >
       <div className="absolute top-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none select-none">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zen-surface/40 border border-white/5 text-[10px] font-medium text-zen-muted uppercase tracking-wider mb-6 backdrop-blur-md">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"/>
               Live Now
             </div>
             
             <div className="flex flex-col items-center animate-scale-in transition-all duration-300 min-h-[5rem]">
                <OdometerText 
                  value={odometerValue}
                  className="text-4xl md:text-5xl font-extralight text-zen-text text-center tracking-tighter drop-shadow-2xl h-12 md:h-16"
                />
                <span className="text-sm text-zen-muted/80 font-light mt-1 tracking-wide drop-shadow-md">
                   {selectedLocation ? `minds in ${selectedLocation.name}` : 'minds meditating globally'}
                </span>
             </div>
          </div>
       </div>

      <div 
        ref={containerRef} 
        className="flex-1 w-full flex items-center justify-center pt-24 cursor-move touch-none pointer-events-auto"
        style={{ background: 'transparent' }}
      >
        {dimensions.width > 0 && (
          <Globe
            ref={globeEl as any}
            width={dimensions.width}
            height={dimensions.height}
            onGlobeReady={handleGlobeReady}
            onZoom={triggerAutoRotatePause}
            onGlobeClick={triggerAutoRotatePause}
            backgroundColor="rgba(0,0,0,0)"
            showAtmosphere={false}
            showGlobe={true}
            polygonsData={combinedPolygons}
            polygonCapColor={() => 'rgba(0, 0, 0, 0)'}
            polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
            polygonStrokeColor={(d: any) => d._isCountry ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.15)'}
            {...({ polygonStrokeWidth: 0.7 } as any)}
            
            // INCREASED HIT AREA markers
            htmlElementsData={pointsData}
            htmlLat="lat"
            htmlLng="lng"
            htmlElement={(d: any) => {
                const el = document.createElement('div');
                // MASSIVE hit area for mobile usability
                el.style.width = '100px';
                el.style.height = '100px';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                el.style.cursor = 'pointer';
                el.style.pointerEvents = 'auto'; // Ensure it catches events
                
                // Pulsating Halo
                const halo = document.createElement('div');
                halo.style.position = 'absolute';
                halo.style.width = '24px';
                halo.style.height = '24px';
                halo.style.borderRadius = '50%';
                halo.style.border = '1px solid rgba(255,255,255,0.3)';
                halo.style.animation = 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite';
                
                // Visual inner dot (larger 8px)
                const dot = document.createElement('div');
                dot.style.width = '8px';
                dot.style.height = '8px';
                dot.style.borderRadius = '50%';
                dot.style.backgroundColor = 'white';
                dot.style.boxShadow = '0 0 12px rgba(255,255,255,0.9)';
                dot.style.position = 'relative';
                dot.style.zIndex = '2';
                
                el.appendChild(halo);
                el.appendChild(dot);
                
                // Capture touch/click
                el.onclick = (e) => {
                    e.stopPropagation();
                    handlePointClick(d);
                };
                el.ontouchend = (e) => {
                    // Prevent phantom clicks but handle single tap
                    e.preventDefault();
                    e.stopPropagation();
                    handlePointClick(d);
                };
                
                return el;
            }}
            
            animateIn={true}
            minAltitude={1.5}
            maxAltitude={3.5}
          />
        )}
      </div>
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GlobeView;
