import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { powerLines } from '../utils/powerLines';
import { weatherPoints, WeatherPoint } from '../utils/weatherPoints';
import { warningAreas } from "../utils/warningAreas";

const TDT_KEY = (import.meta as any).env?.VITE_TDT_KEY || '1d3ede6b2f0e89e9eed057f2424239a3';

const createTdtSource = (layerCode: string) => ({
  type: 'raster' as const,
  tiles: [
    `https://t0.tianditu.gov.cn/${layerCode}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerCode}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TDT_KEY}`,
    `https://t1.tianditu.gov.cn/${layerCode}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerCode}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TDT_KEY}`,
    `https://t2.tianditu.gov.cn/${layerCode}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerCode}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TDT_KEY}`,
    `https://t3.tianditu.gov.cn/${layerCode}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerCode}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TDT_KEY}`
  ],
  tileSize: 256,
  attribution: '&copy; <a href="https://www.tianditu.gov.cn/">天地图</a>',
});

const regionCodes: Record<string, string> = {
  '湖北地块': '420000',
  '四川地块': '510000',
  '安徽地块': '340000',
  '江苏地块': '320000'
};

interface Props {
  activeRegion?: string;
  onPointClick?: (point: WeatherPoint) => void;
}

export default function Map3D({ activeRegion = '湖北地块', onPointClick }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapType, setMapType] = useState<'vec' | 'img' | 'ter'>('ter');

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          tdt_ter: createTdtSource('ter'),
          tdt_cta: createTdtSource('cta'),
          tdt_img: createTdtSource('img'),
          tdt_cia: createTdtSource('cia'),
          tdt_vec: createTdtSource('vec'),
          tdt_cva: createTdtSource('cva')
        },
        layers: [
          // Terrain (default)
          {
            id: 'tdt-ter-layer',
            type: 'raster',
            source: 'tdt_ter',
            layout: { visibility: 'visible' }
          },
          {
            id: 'tdt-cta-layer',
            type: 'raster',
            source: 'tdt_cta',
            layout: { visibility: 'visible' }
          },
          // Satellite
          {
            id: 'tdt-img-layer',
            type: 'raster',
            source: 'tdt_img',
            layout: { visibility: 'none' }
          },
          {
            id: 'tdt-cia-layer',
            type: 'raster',
            source: 'tdt_cia',
            layout: { visibility: 'none' }
          },
          // Vector
          {
            id: 'tdt-vec-layer',
            type: 'raster',
            source: 'tdt_vec',
            layout: { visibility: 'none' }
          },
          {
            id: 'tdt-cva-layer',
            type: 'raster',
            source: 'tdt_cva',
            layout: { visibility: 'none' }
          }
        ],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
      },
      center: [112.27, 30.15],
      zoom: 6,
      pitch: 45,
      bearing: 0,
      maxPitch: 85
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }),
      'bottom-right'
    );

    map.current.once('load', () => {
    });



    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    const mapInstance = map.current;

    const updateMask = async () => {
      const code = regionCodes[activeRegion];
      if (!code) return;
      
      try {
        let res: Response | null = null;
        const urls = [
          `/geo/${code}.json`,
          `geo/${code}.json`,
          `./geo/${code}.json`,
          `${window.location.origin}/geo/${code}.json`
        ];
        
        for (const url of urls) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              res = response;
              break;
            }
          } catch (err) {
            // continue trying
          }
        }
        
        if (!res || !res.ok) {
          throw new Error(`Failed to fetch from any URLs for geo code: ${code}`);
        }
        
        const data = await res.json();
        const provinceFeature = data.features[0];
        
        const bbox = turf.bbox(provinceFeature);
        mapInstance.fitBounds(bbox as [number, number, number, number], {
          padding: { top: 100, bottom: 100, left: 200, right: 350 }, // leaving space for UI
          pitch: 45
        });

        // We use turf.mask to invert the polygon to cover the whole world EXCEPT the province
        const maskFeature = (turf as any).mask(provinceFeature as any);

        // Update markers based on active region
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        
        weatherPoints.filter(wp => {
          if (wp.region !== activeRegion) return false;
          try {
            return (turf as any).booleanPointInPolygon((turf as any).point(wp.coord as [number, number]), provinceFeature);
          } catch (e) {
            return false;
          }
        }).forEach(wp => {
            const el = document.createElement('div');
            el.className = 'w-4 h-4 flex items-center justify-center relative cursor-pointer group';
            
            let colorClass = 'text-[#94a3b8]'; // none
            if (wp.status === 'ready') colorClass = 'text-[#84b676]';
            else if (wp.status === 'operating') colorClass = 'text-[#e3d122]';
            else if (wp.status === 'completed') colorClass = 'text-[#8b10ec]';
            else if (wp.status === 'canceled') colorClass = 'text-[#df5a5a]';

            const root = createRoot(el);
            
            const Shape = () => {
              if (wp.type === 'rocket') {
                return (
                  <svg width="14" height="14" viewBox="0 0 14 14" className={`overflow-visible ${colorClass}`} style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
                    <circle cx="7" cy="7" r="6" fill="currentColor" stroke="white" strokeWidth="1.5" />
                  </svg>
                );
              } else if (wp.type === 'gun') {
                return (
                  <svg width="14" height="14" viewBox="0 0 14 14" className={`overflow-visible ${colorClass}`} style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
                    <polygon points="7,1 13,12 1,12" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                );
              } else {
                return (
                  <svg width="14" height="14" viewBox="0 0 14 14" className={`overflow-visible ${colorClass}`} style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
                    <rect x="1" y="1" width="12" height="12" rx="1.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
                  </svg>
                );
              }
            };
            
            root.render(
              <div className="w-full h-full relative flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                <Shape />
              </div>
            );

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat(wp.coord as [number, number]);
            
            if (onPointClick) {
              el.addEventListener('click', () => {
                onPointClick(wp);
              });
            } else {
              marker.setPopup(new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
                <div class="p-2 min-w-[120px]">
                  <h3 class="font-bold text-sm mb-1 text-slate-800">${wp.name}</h3>
                  <div class="flex flex-col gap-1">
                    <p class="text-xs text-slate-600 flex items-center justify-between">
                      <span>状态</span>
                      <span class="font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 ${
                        wp.status === 'ready' ? 'text-[#84b676]' : 
                        wp.status === 'operating' ? 'text-[#e3d122]' : 
                        wp.status === 'completed' ? 'text-[#8b10ec]' : 
                        wp.status === 'canceled' ? 'text-[#df5a5a]' : 'text-[#94a3b8]'
                      }">${
                        wp.status === 'ready' ? '就绪' : 
                        wp.status === 'operating' ? '作业' : 
                        wp.status === 'completed' ? '完成' : 
                        wp.status === 'canceled' ? '取消' : '无状态'
                      }</span>
                    </p>
                    <p class="text-xs text-slate-600 flex items-center justify-between">
                      <span>类型</span>
                      <span class="font-medium text-slate-700">${wp.type === 'rocket' ? '火箭弹' : wp.type === 'gun' ? '高炮' : '作业车'}</span>
                    </p>
                  </div>
                </div>
              `));
            }
            
            marker.addTo(mapInstance);
              
            markersRef.current.push(marker);
        });


        const sourceMask = mapInstance.getSource('province-mask') as maplibregl.GeoJSONSource;
        if (sourceMask) {
          sourceMask.setData(maskFeature as any);
        } else {
          mapInstance.addSource('province-mask', {
            type: 'geojson',
            data: maskFeature as any
          });
        }
        
        const sourceBorder = mapInstance.getSource('province-border') as maplibregl.GeoJSONSource;
        if (sourceBorder) {
           sourceBorder.setData(provinceFeature as any);
        } else {
           mapInstance.addSource('province-border', {
             type: 'geojson',
             data: provinceFeature as any
           });
        }

        if (!mapInstance.getLayer('province-tint-layer')) {
          mapInstance.addLayer({
            id: 'province-tint-layer',
            type: 'fill',
            source: 'province-border',
            paint: {
              'fill-color': '#7A829B',
              'fill-opacity': 0.2
            }
          });
        }

        const bufferedLinesFeatures = (powerLines.features as any[])
          .filter(f => f.geometry.type === 'LineString')
          .map(f => {
            const buffered = (turf as any).buffer(f, 20, { units: 'kilometers' });
            return {
              ...buffered,
              properties: {
                ...f.properties,
                type: 'buffer'
              }
            };
          });
        const bufferedLinesCollection = (turf as any).featureCollection(bufferedLinesFeatures);

        const sourcePowerBuffer = mapInstance.getSource('power-lines-buffer') as maplibregl.GeoJSONSource;
        if (sourcePowerBuffer) {
           sourcePowerBuffer.setData(bufferedLinesCollection as any);
        } else {
           mapInstance.addSource('power-lines-buffer', {
             type: 'geojson',
             data: bufferedLinesCollection as any
           });
        }

        if (!mapInstance.getLayer('power-lines-buffer-layer')) {
          mapInstance.addLayer({
            id: 'power-lines-buffer-layer',
            type: 'fill',
            source: 'power-lines-buffer',
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.15,
              'fill-outline-color': ['get', 'color']
            }
          });
        }

        const sourcePowerLines = mapInstance.getSource('power-lines') as maplibregl.GeoJSONSource;
        if (sourcePowerLines) {
           sourcePowerLines.setData(powerLines as any);
        } else {
           mapInstance.addSource('power-lines', {
             type: 'geojson',
             data: powerLines as any
           });
        }

        if (!mapInstance.getLayer('power-lines-glow-layer')) {
          mapInstance.addLayer({
            id: 'power-lines-glow-layer',
            type: 'line',
            source: 'power-lines',
            filter: ['==', 'type', 'line'],
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 8,
              'line-opacity': 0.4,
              'line-blur': 4
            }
          });
        }

        if (!mapInstance.getLayer('power-lines-layer')) {
          mapInstance.addLayer({
            id: 'power-lines-layer',
            type: 'line',
            source: 'power-lines',
            filter: ['==', 'type', 'line'],
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 3,
              'line-opacity': 1
            }
          });
        }

        if (!mapInstance.getLayer('power-substation-point')) {
          mapInstance.addLayer({
            id: 'power-substation-point',
            type: 'circle',
            source: 'power-lines',
            filter: ['==', 'type', 'substation'],
            paint: {
              'circle-color': '#ffffff',
              'circle-radius': 5,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#334155'
            }
          });
        }

        if (!mapInstance.getLayer('power-substation-label')) {
          mapInstance.addLayer({
            id: 'power-substation-label',
            type: 'symbol',
            source: 'power-lines',
            filter: ['==', 'type', 'substation'],
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 12,
              'text-offset': [0, 1.2],
              'text-anchor': 'top'
            },
            paint: {
              'text-color': '#1e293b',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            }
          });
        }

        if (!mapInstance.getLayer('province-mask-layer')) {
          mapInstance.addLayer({
            id: 'province-mask-layer',
            type: 'fill',
            source: 'province-mask',
            paint: {
              'fill-color': '#e2e8f0', // slate-200
              'fill-opacity': 1
            }
          });
        }

        if (!mapInstance.getLayer('province-border-layer')) {
          mapInstance.addLayer({
            id: 'province-border-layer',
            type: 'line',
            source: 'province-border',
            paint: {
              'line-color': '#ffffff', // white border
              'line-width': 2
            }
          });
        }

        // Add warning areas
        const warningFeatures = warningAreas.filter(wa => wa.region === activeRegion).map(wa => ({
          type: 'Feature',
          properties: {
            id: wa.id,
            name: wa.name,
            level: wa.level,
            fillColor: wa.level === 'red' ? '#ef4444' : wa.level === 'orange' ? '#f97316' : '#eab308',
            borderColor: wa.level === 'red' ? '#dc2626' : wa.level === 'orange' ? '#ea580c' : '#ca8a04'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [wa.polygon]
          }
        }));

        const sourceWarning = mapInstance.getSource('warning-areas') as maplibregl.GeoJSONSource;
        if (sourceWarning) {
          sourceWarning.setData({ type: 'FeatureCollection', features: warningFeatures } as any);
        } else {
          mapInstance.addSource('warning-areas', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: warningFeatures
            } as any
          });
        }

        const beforeId = mapInstance.getLayer('power-lines-buffer-layer') ? 'power-lines-buffer-layer' : undefined;

        if (!mapInstance.getLayer('warning-areas-fill')) {
          mapInstance.addLayer({
            id: 'warning-areas-fill',
            type: 'fill',
            source: 'warning-areas',
            paint: {
              'fill-color': ['get', 'fillColor'],
              'fill-opacity': 0.3
            }
          }, beforeId);
        }

        if (!mapInstance.getLayer('warning-areas-line')) {
          mapInstance.addLayer({
            id: 'warning-areas-line',
            type: 'line',
            source: 'warning-areas',
            paint: {
              'line-color': ['get', 'borderColor'],
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          }, beforeId);
        }

      } catch (e) {
        console.error('Failed to load province boundary or initialize layers', e);
      }
    };

    if (mapInstance.isStyleLoaded()) {
      updateMask();
    } else {
      mapInstance.once('load', updateMask);
    }
  }, [activeRegion]);

  useEffect(() => {
    const handleSimulate = () => {
      const mapInstance = map.current;
      if (!mapInstance) return;

      const startCoord: [number, number] = [111.0753, 31.275]; // 林家村火箭点
      
      mapInstance.flyTo({
        center: startCoord,
        zoom: 12.5,
        pitch: 60,
        bearing: -30, // View from South-West
        duration: 2000
      });

      setTimeout(() => {
        import('../utils/ThreeJSLayer').then(({ RocketTrajectoryLayer }) => {
            if (mapInstance.getLayer('rocket-trajectory')) {
                mapInstance.removeLayer('rocket-trajectory');
            }
            
            const customLayer = new RocketTrajectoryLayer(startCoord, 45, 8, 4);
            mapInstance.addLayer(customLayer);
        });
      }, 2000); // Wait for flyTo to finish
    };

    window.addEventListener('simulate-trajectory', handleSimulate);
    return () => window.removeEventListener('simulate-trajectory', handleSimulate);
  }, []);

  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const types: ('vec' | 'img' | 'ter')[] = ['vec', 'img', 'ter'];
    
    const applyVisibility = () => {
      types.forEach(type => {
        const visibility = type === mapType ? 'visible' : 'none';
        
        const baseLayerId = `tdt-${type}-layer`;
        const labelLayerId = `tdt-${type === 'vec' ? 'cva' : type === 'img' ? 'cia' : 'cta'}-layer`;
        
        if (mapInstance.getLayer(baseLayerId)) {
          mapInstance.setLayoutProperty(baseLayerId, 'visibility', visibility);
        }
        if (mapInstance.getLayer(labelLayerId)) {
          mapInstance.setLayoutProperty(labelLayerId, 'visibility', visibility);
        }
      });
    };

    if (mapInstance.isStyleLoaded()) {
      applyVisibility();
    } else {
      mapInstance.once('load', applyVisibility);
    }
  }, [mapType]);

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mapContainer} className="w-full h-full bg-slate-200" />
      
      {/* 天地图图层切换器 */}
      <div className="absolute bottom-6 left-6 z-40 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 rounded-xl p-1 flex gap-1 text-xs font-semibold">
        <button
          onClick={() => setMapType('ter')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${mapType === 'ter' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span>地形地图</span>
        </button>
        <button
          onClick={() => setMapType('img')}
          className={`flex items-all gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${mapType === 'img' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span>影像地图</span>
        </button>
        <button
          onClick={() => setMapType('vec')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${mapType === 'vec' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span>矢量地图</span>
        </button>
      </div>
    </div>
  );
}
