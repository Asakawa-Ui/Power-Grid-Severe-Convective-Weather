import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { powerLines } from '../utils/powerLines';
import { weatherPoints, WeatherPoint } from '../utils/weatherPoints';
import { warningAreas } from "../utils/warningAreas";
import { getHistorySiteDetails } from './EffectEvaluationRight';

const TDT_KEYS = [
  '1d3ede6b2f0e89e9eed057f2424239a3',
  '7ec6e34789ec3b7b2b63c873f13f3600',
  '210c4f0e9b25114704b7e8055eeef112',
  'f8303f26017b2b63cbdd977b3117565c',
  '5a1f6a1d828453cc14b436c6464244df',
  '7e5da3c23c72b22b2bf7b25e73ef13ff',
  'df77b06b93ec2f1f2a3c71ea407c3f36',
  '9a41b594bbfb9f697b0a701a5b82c2a3'
];

const ENV_KEY = (import.meta as any).env?.VITE_TDT_KEY;
const ALL_KEYS = ENV_KEY ? [ENV_KEY, ...TDT_KEYS] : TDT_KEYS;

const getRandomKey = () => {
  return ALL_KEYS[Math.floor(Math.random() * ALL_KEYS.length)];
};

const TDT_KEY = getRandomKey();

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
  isCaseMode?: boolean;
  playbackMinutes?: number;
  normalMinutes?: number;
  activeNav?: string;
  selectedHistoryId?: string;
  activeCaseId?: string;
}

export default function Map3D({ 
  activeRegion = '湖北地块', 
  onPointClick, 
  isCaseMode = false, 
  playbackMinutes = 0,
  normalMinutes = 1080,
  activeNav = '作业指挥',
  selectedHistoryId = 'h1',
  activeCaseId = '2026-06-18'
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapType, setMapType] = useState<'vec' | 'img' | 'ter'>('ter');

  const provinceFeatureRef = useRef<any>(null);
  const currentRegionRef = useRef<string>('');

  const applyGranularVisibility = (vis: any) => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    // 1. Filter markers
    markersRef.current.forEach((marker) => {
      const el = marker.getElement();
      if (el) {
        const eqType = el.getAttribute('data-eq-type');
        if (eqType) {
          // Equipment markers
          let isTypeVisible = false;
          if (eqType === 'lightning') isTypeVisible = vis.eqLightning !== false;
          else if (eqType === 'electric_field') isTypeVisible = vis.eqElectricField !== false;
          else if (eqType === 'sounding') isTypeVisible = vis.eqSounding !== false;
          else if (eqType === 'radar_station') isTypeVisible = vis.eqRadar !== false;
          else if (eqType === 'satellite_receiver') isTypeVisible = vis.eqSatellite !== false;
          else if (eqType === 'gun') isTypeVisible = vis.eqGun !== false;
          else if (eqType === 'rocket') isTypeVisible = vis.eqRocket !== false;
          else if (eqType === 'vehicle') isTypeVisible = vis.eqVehicle !== false;

          el.style.visibility = isTypeVisible ? 'visible' : 'hidden';
        } else {
          // WeatherPoint / Site markers
          const siteClass = el.getAttribute('data-site-class') || '';
          const currentType = el.getAttribute('data-site-type') || '';
          const currentStatus = el.getAttribute('data-site-status') || '';

          let isTypeVisible = false;
          if (siteClass === 'temporary') {
            isTypeVisible = vis.temporary;
          } else if (siteClass === 'mobile') {
            if (currentType === 'rocket') isTypeVisible = vis.mobileRocket;
            else if (currentType === 'gun') isTypeVisible = vis.mobileGun;
          } else if (siteClass === 'fixed') {
            if (currentType === 'rocket') isTypeVisible = vis.fixedRocket;
            else if (currentType === 'gun') isTypeVisible = vis.fixedGun;
          }

          const isStatusVisible = 
            (currentStatus === 'none' && vis.stateNone) ||
            (currentStatus === 'ready' && vis.stateReady) ||
            (currentStatus === 'operating' && vis.stateOperating) ||
            (currentStatus === 'completed' && vis.stateCompleted) ||
            (currentStatus === 'canceled' && vis.stateCanceled);

          el.style.visibility = (isTypeVisible && isStatusVisible) ? 'visible' : 'hidden';
        }
      }
    });

    // 2. Filter power lines
    const colorMatchFilter = [
      'match',
      ['get', 'color'],
      '#ef4444', vis.line1000,
      '#22c55e', vis.line500,
      '#0ea5e9', vis.line220,
      false
    ];

    if (mapInstance.getLayer('power-lines-glow-layer')) {
      mapInstance.setFilter('power-lines-glow-layer', ['all', ['==', 'type', 'line'], colorMatchFilter]);
    }
    if (mapInstance.getLayer('power-lines-layer')) {
      mapInstance.setFilter('power-lines-layer', ['all', ['==', 'type', 'line'], colorMatchFilter]);
    }

    if (mapInstance.getLayer('power-lines-buffer-layer')) {
      if (vis.lineBuffer) {
        mapInstance.setLayoutProperty('power-lines-buffer-layer', 'visibility', 'visible');
        mapInstance.setFilter('power-lines-buffer-layer', colorMatchFilter);
      } else {
        mapInstance.setLayoutProperty('power-lines-buffer-layer', 'visibility', 'none');
      }
    }

    const anyLineVisible = vis.line1000 || vis.line500 || vis.line220;
    if (mapInstance.getLayer('power-substation-point')) {
      mapInstance.setLayoutProperty('power-substation-point', 'visibility', anyLineVisible ? 'visible' : 'none');
    }
    if (mapInstance.getLayer('power-substation-label')) {
      mapInstance.setLayoutProperty('power-substation-label', 'visibility', anyLineVisible ? 'visible' : 'none');
    }

    // 3. Weather overlay visibility
    if (mapInstance.getLayer('warning-areas-fill')) {
      mapInstance.setLayoutProperty('warning-areas-fill', 'visibility', vis.weatherOverlay ? 'visible' : 'none');
    }
    if (mapInstance.getLayer('warning-areas-line')) {
      mapInstance.setLayoutProperty('warning-areas-line', 'visibility', vis.weatherOverlay ? 'visible' : 'none');
    }

    // Hide/show the top-left radar actual time container
    const radarOverlay = document.querySelector('.radar-overlay-time-container') as HTMLElement;
    if (radarOverlay) {
      radarOverlay.style.display = vis.weatherOverlay ? 'flex' : 'none';
    }
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      attributionControl: false,
      transformRequest: (url: string) => {
        if (url.includes('tianditu.gov.cn')) {
          const selectedKey = getRandomKey();
          const newUrl = url.replace(/tk=[a-zA-Z0-9]+/, `tk=${selectedKey}`);
          return { url: newUrl };
        }
        return { url };
      },
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

    map.current.on('error', (e) => {
      // Gracefully capture and suppress map tile loading errors (like 429 Too Many Requests or 404)
      const msg = e.message || '';
      const isExpectedTileError = msg.includes('429') || msg.includes('404') || e.error?.status === 429 || e.error?.status === 404;
      if (isExpectedTileError) {
        return;
      }
      console.warn('MapLibre gracefully handled error:', e);
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }),
      'top-right'
    );

    map.current.once('load', () => {
    });

    const checkZoom = () => {
      if (!map.current || !mapContainer.current) return;
      const currentZoom = map.current.getZoom();
      if (currentZoom >= 9.5) {
        mapContainer.current.classList.add('show-site-labels');
      } else {
        mapContainer.current.classList.remove('show-site-labels');
      }
    };

    map.current.on('zoom', checkZoom);
    checkZoom();



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
    let cancelled = false;

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
          if (cancelled) return;
          try {
            const response = await fetch(url);
            if (response.ok) {
              try {
                // Verify that the response is actually valid JSON (handles SPA fallback HTML elegantly)
                const clone = response.clone();
                await clone.json();
                res = response;
                break;
              } catch (parseErr) {
                // Not valid JSON, continue to next URL
              }
            }
          } catch (err) {
            // continue trying
          }
        }
        
        if (cancelled) return;
        if (!res || !res.ok) {
          throw new Error(`Failed to fetch from any URLs for geo code: ${code}`);
        }
        
        const data = await res.json();
        if (cancelled) return;
        const provinceFeature = data.features[0];
        provinceFeatureRef.current = provinceFeature;
        
        if (!mapInstance || !mapInstance.style || !mapInstance.getStyle) return;
        
        if (activeNav !== '效果评估') {
          const bbox = turf.bbox(provinceFeature);
          mapInstance.fitBounds(bbox as [number, number, number, number], {
            padding: { top: 100, bottom: 100, left: 200, right: 350 }, // leaving space for UI
            pitch: 45
          });
        }

        // We use turf.mask to invert the polygon to cover the whole world EXCEPT the province
        const maskFeature = (turf as any).mask(provinceFeature as any);

        // Update markers based on active region
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        
        if (activeNav === '装备管理') {
          // --- Equipment Management Mode ---
          let finalEqPoints: any[] = [];
          if (activeRegion === '湖北地块') {
            finalEqPoints = [
              // 雷电探测装置 (eqLightning)
              { id: 'LD-01', name: '黄石铁山雷电监测点', coord: [114.89, 30.19], type: 'lightning', region: '湖北地块', status: 'online' },
              { id: 'LD-02', name: '大冶白沙雷电监测站', coord: [115.04, 29.96], type: 'lightning', region: '湖北地块', status: 'online' },
              { id: 'LD-03', name: '大冶金湖雷电探测仪', coord: [114.87, 30.07], type: 'lightning', region: '湖北地块', status: 'online' },
              { id: 'LD-04', name: '咸宁咸安雷电接收端', coord: [114.32, 29.85], type: 'lightning', region: '湖北地块', status: 'maintenance' },
              { id: 'LD-05', name: '阳新三溪雷电预警仪', coord: [115.08, 29.80], type: 'lightning', region: '湖北地块', status: 'online' },

              // 大气电场装置 (eqElectricField)
              { id: 'EF-01', name: '金湖大气电场监测点', coord: [114.86, 30.08], type: 'electric_field', region: '湖北地块', status: 'online' },
              { id: 'EF-02', name: '沿湖村电场诊断探头', coord: [115.09, 30.14], type: 'electric_field', region: '湖北地块', status: 'online' },
              { id: 'EF-03', name: '白沙变电站电场网点', coord: [115.05, 29.97], type: 'electric_field', region: '湖北地块', status: 'offline' },
              { id: 'EF-04', name: '大冶陈贵电场分析站', coord: [114.78, 30.12], type: 'electric_field', region: '湖北地块', status: 'online' },

              // 三维探空装置 (eqSounding)
              { id: 'SD-01', name: '铁山南三维探空释放站', coord: [114.88, 30.18], type: 'sounding', region: '湖北地块', status: 'online' },
              { id: 'SD-02', name: '大冶金湖垂直对流探针', coord: [114.87, 30.06], type: 'sounding', region: '湖北地块', status: 'online' },
              { id: 'SD-03', name: '阳新龙港高空探空基地', coord: [115.10, 29.62], type: 'sounding', region: '湖北地块', status: 'online' },

              // 气象雷达站 (eqRadar)
              { id: 'RD-01', name: '黄石多普勒双偏振雷达', coord: [114.95, 30.12], type: 'radar_station', region: '湖北地块', status: 'online' },
              { id: 'RD-02', name: '咸宁九宫山精细天气雷达', coord: [114.65, 29.40], type: 'radar_station', region: '湖北地块', status: 'online' },
              { id: 'RD-03', name: '湖北鄂州边界层风廓线仪', coord: [115.02, 30.38], type: 'radar_station', region: '湖北地块', status: 'online' },

              // 卫星云图接收机 (eqSatellite)
              { id: 'SR-01', name: '风云四号B星超高接收站', coord: [114.30, 30.60], type: 'satellite_receiver', region: '湖北地块', status: 'online' },
              { id: 'SR-02', name: '葵花九号快速传输卫星端', coord: [114.35, 30.55], type: 'satellite_receiver', region: '湖北地块', status: 'online' },

              // 高炮装备 (eqGun)
              { id: 'GP-01', name: '铁山南37mm高炮作业点', coord: [114.89139, 30.19389], type: 'gun', region: '湖北地块', status: 'online' },
              { id: 'GP-02', name: '沿湖生态园37mm高炮点', coord: [115.08306, 30.13500], type: 'gun', region: '湖北地块', status: 'online' },
              { id: 'GP-03', name: '姜祥村防雹高炮基站', coord: [115.07944, 30.02250], type: 'gun', region: '湖北地块', status: 'online' },
              { id: 'GP-04', name: '太子镇移动高炮战车', coord: [115.17083, 30.04750], type: 'gun', region: '湖北地块', status: 'online' },

              // 火箭弹装备 (eqRocket)
              { id: 'HJ-01', name: '大冶金湖火箭发射基地', coord: [114.87528, 30.07444], type: 'rocket', region: '湖北地块', status: 'online' },
              { id: 'HJ-02', name: '刘仁八人工干预火箭点', coord: [114.84639, 29.94417], type: 'rocket', region: '湖北地块', status: 'online' },
              { id: 'HJ-03', name: '白沙防暴两用火箭发射点', coord: [115.04722, 29.96778], type: 'rocket', region: '湖北地块', status: 'online' },

              // 移动作业车 (eqVehicle)
              { id: 'VH-01', name: '应急一号强对流发射车', coord: [114.98, 30.09], type: 'vehicle', region: '湖北地块', status: 'online' },
              { id: 'VH-02', name: '移动式雷达探测指挥车', coord: [115.01, 29.95], type: 'vehicle', region: '湖北地块', status: 'online' },
              { id: 'VH-03', name: '特高压抢险应急机动车', coord: [114.52, 29.95], type: 'vehicle', region: '湖北地块', status: 'online' },
            ];
          } else {
            const wpList = weatherPoints.filter(wp => wp.region === activeRegion);
            wpList.forEach((wp, index) => {
              let type: string;
              if (index % 8 === 0) type = 'lightning';
              else if (index % 8 === 1) type = 'electric_field';
              else if (index % 8 === 2) type = 'sounding';
              else if (index % 8 === 3) type = 'radar_station';
              else if (index % 8 === 4) type = 'satellite_receiver';
              else if (index % 8 === 5) type = 'gun';
              else if (index % 8 === 6) type = 'rocket';
              else type = 'vehicle';
              
              finalEqPoints.push({
                id: `EQ-${wp.id}`,
                name: wp.name.replace('作业点', '') + (
                  type === 'lightning' ? '雷电探测点' :
                  type === 'electric_field' ? '大气电场站' :
                  type === 'sounding' ? '探空站' :
                  type === 'radar_station' ? '精细雷达' :
                  type === 'satellite_receiver' ? '卫星接收站' :
                  type === 'gun' ? '高炮点' :
                  type === 'rocket' ? '火箭发射点' : '作业车机位'
                ),
                coord: [wp.coord[0] + (index % 2 === 0 ? 0.01 : -0.01), wp.coord[1] + (index % 3 === 0 ? 0.01 : -0.01)],
                type,
                region: activeRegion,
                status: index % 5 === 0 ? 'online' : (index % 5 === 4 ? 'offline' : 'online')
              });
            });
          }

          finalEqPoints.forEach(wp => {
            const vis = (window as any).mapLayersVisibilityGranular || {
              line1000: true, line500: true, line220: true, lineBuffer: true,
              eqLightning: true, eqElectricField: true, eqSounding: true, eqRadar: true, eqSatellite: true,
              eqGun: true, eqRocket: true, eqVehicle: true
            };

            let isTypeVisible = false;
            if (wp.type === 'lightning') isTypeVisible = vis.eqLightning !== false;
            else if (wp.type === 'electric_field') isTypeVisible = vis.eqElectricField !== false;
            else if (wp.type === 'sounding') isTypeVisible = vis.eqSounding !== false;
            else if (wp.type === 'radar_station') isTypeVisible = vis.eqRadar !== false;
            else if (wp.type === 'satellite_receiver') isTypeVisible = vis.eqSatellite !== false;
            else if (wp.type === 'gun') isTypeVisible = vis.eqGun !== false;
            else if (wp.type === 'rocket') isTypeVisible = vis.eqRocket !== false;
            else if (wp.type === 'vehicle') isTypeVisible = vis.eqVehicle !== false;

            const el = document.createElement('div');
            el.className = 'w-4 h-4 flex items-center justify-center relative cursor-pointer group';
            el.style.visibility = isTypeVisible ? 'visible' : 'hidden';

            el.setAttribute('data-eq-type', wp.type);

            let color = '#94a3b8';
            if (wp.type === 'lightning') color = '#f59e0b';
            else if (wp.type === 'electric_field') color = '#3b82f6';
            else if (wp.type === 'sounding') color = '#6366f1';
            else if (wp.type === 'radar_station') color = '#10b981';
            else if (wp.type === 'satellite_receiver') color = '#a855f7';
            else if (wp.type === 'gun') color = '#059669';
            else if (wp.type === 'rocket') color = '#2563eb';
            else if (wp.type === 'vehicle') color = '#ea580c';

            const root = createRoot(el);
            root.render(
              <div className="w-full h-full relative flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                <svg width="18" height="18" viewBox="0 0 18 18" className="overflow-visible" style={{ filter: 'drop-shadow(0px 1.5px 3px rgba(0,0,0,0.35))' }}>
                  <circle cx="9" cy="9" r="6.5" fill={color} stroke="white" strokeWidth="1.8" />
                  <circle cx="9" cy="9" r="2" fill="white" />
                </svg>
                <div className="site-label absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-white/10 shadow whitespace-nowrap pointer-events-none select-none">
                  {wp.name}
                </div>
              </div>
            );

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat(wp.coord as [number, number]);

            marker.setPopup(new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
              <div class="p-2.5 min-w-[150px] font-sans">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
                  <h3 class="font-bold text-xs text-slate-800 leading-tight">${wp.name}</h3>
                </div>
                <div class="flex flex-col gap-1 text-[10.5px]">
                  <p class="text-slate-500 flex items-center justify-between">
                    <span>设备类型</span>
                    <span class="font-semibold text-slate-700">${
                      wp.type === 'lightning' ? '雷电探测装置' :
                      wp.type === 'electric_field' ? '大气电场装置' :
                      wp.type === 'sounding' ? '三维探空装置' :
                      wp.type === 'radar_station' ? '气象雷达站' :
                      wp.type === 'satellite_receiver' ? '卫星云图接收机' :
                      wp.type === 'gun' ? '高炮装备' :
                      wp.type === 'rocket' ? '火箭弹装备' : '移动作业车'
                    }</span>
                  </p>
                  <p class="text-slate-500 flex items-center justify-between">
                    <span>状态</span>
                    <span class="font-bold px-1.5 py-0.5 rounded-sm bg-slate-50 ${
                      wp.status === 'online' ? 'text-emerald-600 bg-emerald-50' : 
                      wp.status === 'maintenance' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50'
                    }">${
                      wp.status === 'online' ? '运行中' : 
                      wp.status === 'maintenance' ? '检修中' : '离线'
                    }</span>
                  </p>
                </div>
              </div>
            `));

            marker.addTo(mapInstance);
            markersRef.current.push(marker);
          });
        } else {
          // --- Normal Weather/Site Mode ---
          weatherPoints.filter(wp => {
            if (wp.region !== activeRegion) return false;
            if (wp.type === 'vehicle') return false; // Exclude vehicle sites
            if (activeRegion === '湖北地块' && !wp.id.startsWith('wp-hb-new')) return false;
            try {
              return (turf as any).booleanPointInPolygon((turf as any).point(wp.coord as [number, number]), provinceFeature);
            } catch (e) {
              return false;
            }
          }).forEach(wp => {
              // Override status/type if in Case Study Mode
              let currentStatus = wp.status;
              let currentType = wp.type;
              
              if (isCaseMode && activeRegion === '湖北地块') {
                const mins = playbackMinutes;
                if (wp.id === 'wp-hb-new2') { // 大冶金湖 (17:18-17:19)
                  if (mins < 133) currentStatus = 'none'; // Starts 15:00. 17:13 is minute 133 (5 mins before 17:18)
                  else if (mins < 138) currentStatus = 'ready'; // 17:13 - 17:18
                  else if (mins < 139) currentStatus = 'operating'; // 17:18 - 17:19
                  else currentStatus = 'completed'; // after 17:19
                } else if (wp.id === 'wp-hb-new3') { // 刘仁八 (15:28-15:29)
                  if (mins < 23) currentStatus = 'none'; // 15:23 is minute 23 (5 mins before 15:28)
                  else if (mins < 28) currentStatus = 'ready'; // 15:23 - 15:28
                  else if (mins < 29) currentStatus = 'operating'; // 15:28 - 15:29
                  else currentStatus = 'completed'; // after 15:29
                } else if (wp.id === 'wp-hb-new6') { // 白沙 (15:18-15:19)
                  if (mins < 13) currentStatus = 'none'; // 15:13 is minute 13 (5 mins before 15:18)
                  else if (mins < 18) currentStatus = 'ready'; // 15:13 - 15:18
                  else if (mins < 19) currentStatus = 'operating'; // 15:18 - 15:19
                  else currentStatus = 'completed'; // after 15:19
                } else {
                  currentStatus = 'none'; // "其他所有站点都是无状态"
                }
              } else if (!isCaseMode) {
                currentStatus = 'ready';
              }

              const matchNum = wp.id.match(/\d+/);
              const numVal = matchNum ? parseInt(matchNum[0], 10) : 0;
              let siteClass = currentType === 'vehicle' ? 'temporary' : (numVal % 2 === 1 ? 'fixed' : 'mobile');
              if (activeRegion === '湖北地块' && (wp.id === 'wp-hb-new2' || wp.id === 'wp-hb-new3' || wp.id === 'wp-hb-new6')) {
                siteClass = 'fixed';
              }

              const vis = (window as any).mapLayersVisibilityGranular || {
                mobileRocket: true, mobileGun: true, fixedRocket: true, fixedGun: true, temporary: true,
                stateNone: true, stateReady: true, stateOperating: true, stateCompleted: true, stateCanceled: true,
                line1000: true, line500: true, line220: true, lineBuffer: true, weatherOverlay: true
              };

              let isTypeVisible = false;
              if (siteClass === 'temporary') {
                isTypeVisible = vis.temporary;
              } else if (siteClass === 'mobile') {
                if (currentType === 'rocket') isTypeVisible = vis.mobileRocket;
                else if (currentType === 'gun') isTypeVisible = vis.mobileGun;
              } else if (siteClass === 'fixed') {
                if (currentType === 'rocket') isTypeVisible = vis.fixedRocket;
                else if (currentType === 'gun') isTypeVisible = vis.fixedGun;
              }

              const isStatusVisible = 
                (currentStatus === 'none' && vis.stateNone) ||
                (currentStatus === 'ready' && vis.stateReady) ||
                (currentStatus === 'operating' && vis.stateOperating) ||
                (currentStatus === 'completed' && vis.stateCompleted) ||
                (currentStatus === 'canceled' && vis.stateCanceled);

              const el = document.createElement('div');
              el.className = 'w-4 h-4 flex items-center justify-center relative cursor-pointer group';
              el.style.visibility = (isTypeVisible && isStatusVisible) ? 'visible' : 'hidden';
              
              // Store class, type, and status attributes on the element for runtime toggle
              el.setAttribute('data-site-class', siteClass);
              el.setAttribute('data-site-type', currentType);
              el.setAttribute('data-site-status', currentStatus || 'none');
              
              let colorClass = 'text-[#94a3b8]'; // none
              if (currentStatus === 'ready') colorClass = 'text-[#84b676]';
              else if (currentStatus === 'operating') colorClass = 'text-[#e3d122]';
              else if (currentStatus === 'completed') colorClass = 'text-[#8b10ec]';
              else if (currentStatus === 'canceled') colorClass = 'text-[#df5a5a]';
    
              const root = createRoot(el);
              
              const Shape = () => {
                if (siteClass === 'temporary') {
                  return (
                    <svg width="14" height="14" viewBox="0 0 14 14" className={`overflow-visible ${colorClass}`} style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
                      <polygon points="7,1 13,12 1,12" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  );
                }

                if (siteClass === 'fixed') {
                  return (
                    <svg width="14" height="14" viewBox="0 0 14 14" className={`overflow-visible ${colorClass}`} style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
                      <rect x="1" y="1" width="12" height="12" rx="1.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
                    </svg>
                  );
                }

                // Default: mobile sites are circles
                return (
                  <svg width="14" height="14" viewBox="0 0 14 14" className={`overflow-visible ${colorClass}`} style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
                    <circle cx="7" cy="7" r="6" fill="currentColor" stroke="white" strokeWidth="1.5" />
                  </svg>
                );
              };
              
              root.render(
                <div className="w-full h-full relative flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                  <Shape />
                  {currentStatus === 'operating' && (
                    <span className="absolute w-6 h-6 rounded-full bg-yellow-400/40 animate-ping" />
                  )}
                  <div className="site-label absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-white/10 shadow whitespace-nowrap pointer-events-none select-none">
                    {wp.name}
                  </div>
                </div>
              );

              const marker = new maplibregl.Marker({ element: el })
                .setLngLat(wp.coord as [number, number]);
              
              const updatedWp = { ...wp, status: currentStatus, type: currentType };

              if (onPointClick) {
                el.addEventListener('click', () => {
                  onPointClick(updatedWp);
                });
              } else {
                marker.setPopup(new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
                  <div class="p-2 min-w-[120px]">
                    <h3 class="font-bold text-sm mb-1 text-slate-800">${wp.name}</h3>
                    <div class="flex flex-col gap-1">
                      <p class="text-xs text-slate-600 flex items-center justify-between">
                        <span>状态</span>
                        <span class="font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 ${
                          currentStatus === 'ready' ? 'text-[#84b676]' : 
                          currentStatus === 'operating' ? 'text-[#e3d122]' : 
                          currentStatus === 'completed' ? 'text-[#8b10ec]' : 
                          currentStatus === 'canceled' ? 'text-[#df5a5a]' : 'text-[#94a3b8]'
                        }">${
                          currentStatus === 'ready' ? '就绪' : 
                          currentStatus === 'operating' ? '作业' : 
                          currentStatus === 'completed' ? '完成' : 
                          currentStatus === 'canceled' ? '取消' : '无状态'
                        }</span>
                      </p>
                      <p class="text-xs text-slate-600 flex items-center justify-between">
                        <span>类型</span>
                        <span class="font-medium text-slate-700">${
                          siteClass === 'temporary' ? '临时点' : 
                          `${siteClass === 'fixed' ? '固定' : '移动'}${currentType === 'rocket' ? '火箭' : '高炮'}`
                        }</span>
                      </p>
                    </div>
                  </div>
                `));
              }
              
              marker.addTo(mapInstance);
                
              markersRef.current.push(marker);
          });
        }


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

        // Apply initial visibilities from mapLayersVisibilityGranular
        const currentVis = (window as any).mapLayersVisibilityGranular || {
          rocket: true, gun: true, vehicle: true,
          stateNone: true, stateReady: true, stateOperating: true, stateCompleted: true, stateCanceled: true,
          line1000: true, line500: true, line220: true, lineBuffer: true, weatherOverlay: true
        };
        applyGranularVisibility(currentVis);

      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load province boundary or initialize layers', e);
        }
      }
    };

    if (mapInstance.isStyleLoaded()) {
      updateMask();
    } else {
      mapInstance.once('load', updateMask);
    }

    return () => {
      cancelled = true;
    };
  }, [activeRegion, isCaseMode, playbackMinutes, activeNav]);

  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const setupEvaluation = () => {
      if (activeNav === '效果评估') {
        const siteDetails = getHistorySiteDetails(selectedHistoryId, isCaseMode, activeCaseId);
        const start = siteDetails.coord;
        const azimuthVal = parseInt(siteDetails.azimuth) || 225;
        const bearingRad = (azimuthVal * Math.PI) / 180;

        // Dynamic end (impact) point & risk center based on azimuth and firing range
        const end: [number, number] = [
          start[0] + 0.06 * Math.sin(bearingRad),
          start[1] + 0.06 * Math.cos(bearingRad)
        ];
        const riskCenter: [number, number] = [
          start[0] + 0.035 * Math.sin(bearingRad),
          start[1] + 0.035 * Math.cos(bearingRad)
        ];

        // Fly camera to focus on the active site's trajectory and risk zone, matching the bearing!
        mapInstance.flyTo({
          center: [riskCenter[0], riskCenter[1]],
          zoom: 12.0,
          pitch: 52,
          bearing: azimuthVal - 180,
          duration: 2000
        });

        // 1. Generate Trajectory Curve (arc)
        const arcCoords = [];
        const segments = 50;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const lng = start[0] + (end[0] - start[0]) * t;
          const lat = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI) * 0.015;
          arcCoords.push([lng, lat]);
        }

        // 2. Generate High Risk Area Polygon (turf.circle)
        const riskCircle = (turf as any).circle(turf.point(riskCenter), 3.0, { units: 'kilometers' });

        const evalGeoJson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'trajectory', name: '轨迹' },
              geometry: { type: 'LineString', coordinates: arcCoords }
            },
            {
              type: 'Feature',
              properties: { type: 'launch', name: '发射点' },
              geometry: { type: 'Point', coordinates: start }
            },
            {
              type: 'Feature',
              properties: { type: 'impact', name: '落点' },
              geometry: { type: 'Point', coordinates: end }
            },
            {
              type: 'Feature',
              properties: { type: 'risk_area', name: '高风险' },
              geometry: riskCircle.geometry
            }
          ]
        };

        const sourceId = 'eval-source';
        const source = mapInstance.getSource(sourceId) as maplibregl.GeoJSONSource;
        if (source) {
          source.setData(evalGeoJson as any);
        } else {
          mapInstance.addSource(sourceId, {
            type: 'geojson',
            data: evalGeoJson as any
          });
        }

        // Add layers if they don't exist, and set visibility to 'visible'
        const layers = [
          {
            id: 'eval-risk-layer',
            type: 'fill',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'risk_area'],
            paint: {
              'fill-color': '#f97316',
              'fill-opacity': 0.18
            }
          },
          {
            id: 'eval-risk-border',
            type: 'line',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'risk_area'],
            paint: {
              'line-color': '#f97316',
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          },
          {
            id: 'eval-trajectory-glow',
            type: 'line',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'trajectory'],
            paint: {
              'line-color': '#10b981',
              'line-width': 8,
              'line-opacity': 0.4,
              'line-blur': 4
            }
          },
          {
            id: 'eval-trajectory-line',
            type: 'line',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'trajectory'],
            paint: {
              'line-color': '#ffffff',
              'line-width': 3,
              'line-opacity': 1.0
            }
          },
          {
            id: 'eval-launch-circle',
            type: 'circle',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'launch'],
            paint: {
              'circle-color': '#10b981',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          },
          {
            id: 'eval-impact-circle',
            type: 'circle',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'impact'],
            paint: {
              'circle-color': '#ef4444',
              'circle-radius': 10,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff'
            }
          },
          {
            id: 'eval-labels',
            type: 'symbol',
            source: sourceId,
            filter: ['in', ['get', 'type'], ['literal', ['launch', 'impact', 'risk_area']]],
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-offset': [0, 1.4],
              'text-anchor': 'top'
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#1e293b',
              'text-halo-width': 2
            }
          }
        ];

        layers.forEach(lyr => {
          if (!mapInstance.getLayer(lyr.id)) {
            mapInstance.addLayer(lyr as any);
          } else {
            mapInstance.setLayoutProperty(lyr.id, 'visibility', 'visible');
          }
        });

      } else {
        // Hide evaluation layers if they exist
        const evalLayerIds = [
          'eval-risk-layer',
          'eval-risk-border',
          'eval-trajectory-glow',
          'eval-trajectory-line',
          'eval-launch-circle',
          'eval-impact-circle',
          'eval-labels'
        ];
        evalLayerIds.forEach(id => {
          if (mapInstance.getLayer(id)) {
            mapInstance.setLayoutProperty(id, 'visibility', 'none');
          }
        });
      }
    };

    if (mapInstance.isStyleLoaded()) {
      setupEvaluation();
    } else {
      mapInstance.once('load', setupEvaluation);
    }
  }, [activeNav, activeRegion, selectedHistoryId, isCaseMode, activeCaseId]);

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

  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const handleEnterCase = () => {
      mapInstance.flyTo({
        center: [115.02, 30.08],
        zoom: 11,
        pitch: 45,
        bearing: 0,
        duration: 3000
      });
    };

    const handleExitCase = () => {
      const code = regionCodes[activeRegion];
      if (code && provinceFeatureRef.current) {
        const bbox = turf.bbox(provinceFeatureRef.current);
        mapInstance.fitBounds(bbox as [number, number, number, number], {
          padding: { top: 100, bottom: 100, left: 200, right: 350 },
          pitch: 45,
          duration: 2000
        });
      }
    };

    const handleFocusSite = (e: Event) => {
      const customEvent = e as CustomEvent<{ siteName: string }>;
      const siteName = customEvent.detail?.siteName;
      if (siteName) {
        const point = weatherPoints.find(p => p.name === siteName || p.name.includes(siteName) || siteName.includes(p.name));
        if (point) {
          mapInstance.flyTo({
            center: point.coord,
            zoom: 12.5,
            pitch: 50,
            duration: 2000
          });
        }
      }
    };

    const handleVisibilityChange = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const vis = customEvent.detail;
      setWeatherOverlayVisible(vis.weatherOverlay);
      applyGranularVisibility(vis);
    };

    window.addEventListener('enter-case-mode', handleEnterCase);
    window.addEventListener('exit-case-mode', handleExitCase);
    window.addEventListener('map-focus-site', handleFocusSite);
    window.addEventListener('map-layers-visibility-changed', handleVisibilityChange);

    return () => {
      window.removeEventListener('enter-case-mode', handleEnterCase);
      window.removeEventListener('exit-case-mode', handleExitCase);
      window.removeEventListener('map-focus-site', handleFocusSite);
      window.removeEventListener('map-layers-visibility-changed', handleVisibilityChange);
    };
  }, [activeRegion]);

  const [weatherOverlayVisible, setWeatherOverlayVisible] = useState(() => {
    const saved = localStorage.getItem('map-layers-visibility-granular');
    if (saved) {
      try {
        const vis = JSON.parse(saved);
        return vis.weatherOverlay !== false;
      } catch (e) {}
    }
    return true;
  });

  // Calculate snapped radar actual time (6 minutes interval)
  const totalMinutes = isCaseMode ? (playbackMinutes + 15 * 60) : normalMinutes;
  const radarMinutes = Math.floor(totalMinutes / 6) * 6;
  const h = Math.floor(radarMinutes / 60) % 24;
  const m = radarMinutes % 60;
  const formattedTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  const formattedDateStr = isCaseMode ? '2026-06-18' : '2026-07-07';
  const radarLabel = `全国组网-组合反射率 ${formattedDateStr} ${formattedTimeStr}`;

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mapContainer} className="w-full h-full bg-slate-200" />
      
      {/* 雷达产品实际数据时刻 */}
      {weatherOverlayVisible && (
        <div className="radar-overlay-time-container absolute top-3 left-3 z-40 bg-black/40 backdrop-blur-sm text-white text-[11px] font-sans font-medium px-2 py-1 rounded-sm border border-white/10 flex items-center gap-1.5 pointer-events-none">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>{radarLabel}</span>
        </div>
      )}
    </div>
  );
}
