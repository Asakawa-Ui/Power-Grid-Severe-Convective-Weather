import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

const regions = ['四川地块', '湖北地块', '安徽地块', '江苏地块'];

interface Props {
  activeRegion: string;
  setActiveRegion: (region: string) => void;
  inline?: boolean;
}

const fallbacks: Record<string, string> = {
  '四川地块': "M 15,40 C 18,30 35,22 45,25 C 55,28 75,20 85,28 C 92,34 92,48 88,62 C 84,76 72,88 65,92 C 58,95 50,85 42,90 C 34,95 28,82 22,75 C 16,68 12,50 15,40 Z",
  '湖北地块': "M 10,55 C 12,42 32,38 52,38 C 72,38 90,45 95,50 C 100,55 98,68 90,75 C 82,82 72,78 60,78 C 48,78 30,76 18,72 C 12,68 8,62 10,55 Z",
  '安徽地块': "M 42,20 C 52,15 68,15 72,25 C 76,35 68,48 76,58 C 84,68 78,85 70,90 C 62,95 50,92 46,85 C 44,81 50,72 46,62 C 42,52 38,35 42,20 Z",
  '江苏地块': "M 25,32 C 38,25 58,32 72,45 C 82,55 88,68 82,78 C 76,88 62,85 52,82 C 42,79 35,68 28,58 C 22,48 18,38 25,32 Z"
};

// Robust function to parse GeoJSON and project onto 100x100 box
function parseGeoJSONToPath(geoJson: any): string {
  if (!geoJson || !geoJson.features || geoJson.features.length === 0) return '';
  const feature = geoJson.features[0];
  if (!feature || !feature.geometry) return '';

  const { type, coordinates } = feature.geometry;
  if (!coordinates) return '';

  // 1. Extract linear rings
  let rings: [number, number][][] = [];
  if (type === 'Polygon') {
    rings = coordinates;
  } else if (type === 'MultiPolygon') {
    for (const polygon of coordinates) {
      for (const ring of polygon) {
        rings.push(ring);
      }
    }
  }

  if (rings.length === 0) return '';

  // 2. Find bounding box
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const ring of rings) {
    for (const pt of ring) {
      const [lon, lat] = pt;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  if (minLon === Infinity || minLat === Infinity) return '';

  // 3. Compute scaling & offset to center inside 100x100 with padding
  const rangeLon = maxLon - minLon;
  const rangeLat = maxLat - minLat;
  const maxRange = Math.max(rangeLon, rangeLat);

  const padding = 8; // generous padding for sleek display inside circles/buttons
  const viewSize = 100;
  const usableSize = viewSize - 2 * padding;

  const scale = usableSize / (maxRange || 1);
  const xOffset = padding + (usableSize - rangeLon * scale) / 2;
  const yOffset = padding + (usableSize - rangeLat * scale) / 2;

  // 4. Generate SVG path
  let d = '';
  for (const ring of rings) {
    if (ring.length === 0) continue;
    
    const projectedPoints = ring.map((pt) => {
      const [lon, lat] = pt;
      const x = xOffset + (lon - minLon) * scale;
      const y = yOffset + (maxLat - lat) * scale; // Flip Y axis
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    d += ` M ${projectedPoints[0]} L ${projectedPoints.slice(1).join(' ')} Z`;
  }

  return d;
}

export default function RegionSelector({ activeRegion, setActiveRegion, inline = false }: Props) {
  const [regionPaths, setRegionPaths] = useState<Record<string, string>>({});

  useEffect(() => {
    const codes: Record<string, string> = {
      '四川地块': '510000',
      '湖北地块': '420000',
      '安徽地块': '340000',
      '江苏地块': '320000'
    };

    const fetchPaths = async () => {
      const newPaths: Record<string, string> = {};
      for (const [name, code] of Object.entries(codes)) {
        try {
          const response = await fetch(`/geo/${code}.json`);
          if (response.ok) {
            const data = await response.json();
            const pathD = parseGeoJSONToPath(data);
            if (pathD) {
              newPaths[name] = pathD;
            }
          }
        } catch (error) {
          console.error(`Error loading boundary for ${name}:`, error);
        }
      }
      setRegionPaths(newPaths);
    };

    fetchPaths();
  }, []);

  return (
    <div className={cn(
      inline 
        ? "w-full shrink-0 flex items-center justify-around pointer-events-auto select-none animate-fade-in py-1"
        : "absolute top-16 left-1/2 -translate-x-1/2 z-40 flex gap-4 pointer-events-auto"
    )}>
      {regions.map((region) => {
        const isActive = activeRegion === region;
        return (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={cn(
              "group flex flex-col items-center justify-center hover:scale-[1.06] active:scale-[0.96] transition-all duration-300 cursor-pointer select-none bg-transparent border-none",
              inline ? "flex-1 p-1" : "p-1.5 w-20",
              isActive 
                ? "text-blue-600 font-bold" 
                : "text-slate-300 hover:text-slate-500"
            )}
          >
            {/* SVG Boundary Shape */}
            <div className={cn(
              "flex items-center justify-center transition-all duration-300 mb-1",
              inline ? "w-10 h-10" : "w-12 h-12",
              isActive ? "scale-110" : "opacity-85 hover:opacity-100"
            )}>
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <path
                  d={regionPaths[region] || fallbacks[region]}
                  fill="white"
                  stroke="currentColor"
                  strokeWidth={isActive ? "3.2" : "1.8"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: isActive 
                      ? 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.8)) drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))' 
                      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))'
                  }}
                  className="transition-all duration-300"
                />
              </svg>
            </div>
            
            {/* Name */}
            <span className={cn(
              "tracking-wide font-medium transition-all duration-300",
              inline ? "text-[10px]" : "text-[11px]",
              isActive ? "text-blue-600 font-semibold" : "text-slate-500 group-hover:text-slate-700"
            )}>
              {region.replace('地块', '区域')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
