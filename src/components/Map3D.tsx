import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { RotateCcw, Pentagon, Crosshair, Ruler, Check, Save, Trash2, Undo2, Layers } from 'lucide-react';
import { powerLines } from '../utils/powerLines';
import { weatherPoints, WeatherPoint } from '../utils/weatherPoints';
import { warningAreas } from "../utils/warningAreas";
import { getHistorySiteDetails } from './EffectEvaluationRight';
import geo420000 from '../../public/geo/420000.json';
import geo320000 from '../../public/geo/320000.json';
import geo340000 from '../../public/geo/340000.json';
import geo510000 from '../../public/geo/510000.json';

const localGeoMap: Record<string, any> = {
  '420000': geo420000,
  '320000': geo320000,
  '340000': geo340000,
  '510000': geo510000
};

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

export const createSitePopupHTML = (wp: WeatherPoint) => {
  const name = wp.name;
  let siteName = name.endsWith('作业点') ? name : `${name}作业点`;
  let siteCode = '1301270001';
  let region = '湖北省黄石市大冶市';
  let address = '湖北省黄石市大冶市金牛镇姜祥村';
  let equipment = wp.type === 'gun' ? '高炮' : '火箭弹';
  let inventory = '24发';

  if (name.includes('姜祥村')) {
    siteCode = '1301270001';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市金牛镇姜祥村';
    equipment = '火箭弹';
    inventory = '24发';
  } else if (name.includes('金湖') || name.includes('大冶金湖')) {
    siteCode = '1301270002';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市金湖街道金湖大道';
    equipment = '火箭弹';
    inventory = '18发';
  } else if (name.includes('刘仁八')) {
    siteCode = '1301270003';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市刘仁八镇刘仁八村';
    equipment = '火箭弹';
    inventory = '24发';
  } else if (name.includes('铁山南')) {
    siteCode = '1301270004';
    region = '湖北省黄石市铁山区';
    address = '湖北省黄石市铁山区铁山南路28号';
    equipment = '高炮';
    inventory = '120发';
  } else if (name.includes('沿湖生态园')) {
    siteCode = '1301270005';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市沿湖生态园内';
    equipment = '火箭弹';
    inventory = '16发';
  } else if (name.includes('白沙')) {
    siteCode = '1301270006';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市白沙镇白沙村';
    equipment = '火箭弹';
    inventory = '24发';
  } else if (name.includes('太子')) {
    siteCode = '1301270007';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市太子镇太子村';
    equipment = '火箭弹';
    inventory = '20发';
  } else {
    const numMatch = wp.id.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0], 10) : 1;
    siteCode = `130127${String(num).padStart(4, '0')}`;

    if (wp.region === '四川地块') {
      region = '四川省成都市龙泉驿区';
      address = `四川省成都市龙泉驿区${name}`;
    } else if (wp.region === '安徽地块') {
      region = '安徽省合肥市蜀山区';
      address = `安徽省合肥市蜀山区${name}`;
    } else if (wp.region === '江苏地块') {
      region = '江苏省南京市玄武区';
      address = `江苏省南京市玄武区${name}`;
    } else {
      region = '湖北省十堰市茅箭区';
      address = `湖北省十堰市茅箭区${name}`;
    }
    equipment = wp.type === 'gun' ? '高炮' : '火箭弹';
    inventory = wp.type === 'gun' ? '120发' : '24发';
  }

  return `
    <div class="p-2 font-sans text-xs text-slate-700 min-w-[200px] max-w-[250px] select-text">
      <div class="space-y-1.5 text-[11.5px] leading-snug">
        <div class="flex items-start">
          <span class="text-slate-400 w-[60px] shrink-0 font-medium">站点名称:</span>
          <span class="text-slate-800 font-semibold">${siteName}</span>
        </div>
        <div class="flex items-center">
          <span class="text-slate-400 w-[60px] shrink-0 font-medium">站点编号:</span>
          <span class="text-slate-800 font-mono font-medium">${siteCode}</span>
        </div>
        <div class="flex items-start">
          <span class="text-slate-400 w-[60px] shrink-0 font-medium">所属区域:</span>
          <span class="text-slate-800 font-medium">${region}</span>
        </div>
        <div class="flex items-start">
          <span class="text-slate-400 w-[60px] shrink-0 font-medium">详细地址:</span>
          <span class="text-slate-800 font-medium break-all">${address}</span>
        </div>
        <div class="flex items-center">
          <span class="text-slate-400 w-[60px] shrink-0 font-medium">作业器具:</span>
          <span class="text-slate-800 font-medium">${equipment}</span>
        </div>
        <div class="flex items-center">
          <span class="text-slate-400 w-[60px] shrink-0 font-medium">弹药库存:</span>
          <span class="text-slate-800 font-semibold text-emerald-600">${inventory}</span>
        </div>
      </div>
    </div>
  `;
};


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
  const evalSiteMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapType, setMapType] = useState<'vec' | 'img' | 'ter'>('ter');
  const [mapInitError, setMapInitError] = useState<Error | null>(null);

  // Map Tools States ('draw' | 'inspect' | 'measure' | null)
  const [activeMapTool, setActiveMapTool] = useState<'draw' | 'inspect' | 'measure' | null>(null);
  const activeMapToolRef = useRef<'draw' | 'inspect' | 'measure' | null>(null);
  activeMapToolRef.current = activeMapTool;

  // Active overlaid weather products synced from LeftPanel / MapLayersPanel
  const [selectedProductKeys, setSelectedProductKeys] = useState<string[]>([]);
  useEffect(() => {
    const handleProductChange = (e: Event) => {
      const customEvent = e as CustomEvent<string[] | null>;
      setSelectedProductKeys(customEvent.detail || []);
    };
    window.addEventListener('product-select-changed', handleProductChange);
    return () => {
      window.removeEventListener('product-select-changed', handleProductChange);
    };
  }, []);

  // Saved Regions state (persisted so they stay on the map continuously over time)
  const [savedRegions, setSavedRegions] = useState<Array<{
    id: string;
    name: string;
    coordinates: [number, number][];
    areaKm2: string;
    color?: string;
    lineStyle?: 'solid' | 'dashed';
    createdAt: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem('map-saved-drawn-regions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const savedRegionsRef = useRef(savedRegions);
  savedRegionsRef.current = savedRegions;
  const savedMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Draw Area state (in-progress drawing matching image_55adfb97.png)
  const [drawShapeType, setDrawShapeType] = useState<'polygon' | 'rect' | 'circle'>('polygon');
  const drawShapeTypeRef = useRef<'polygon' | 'rect' | 'circle'>('polygon');
  drawShapeTypeRef.current = drawShapeType;

  const [drawColor, setDrawColor] = useState('#2563eb');
  const drawColorRef = useRef('#2563eb');
  drawColorRef.current = drawColor;

  const [isDashedLine, setIsDashedLine] = useState(false);
  const isDashedLineRef = useRef(false);
  isDashedLineRef.current = isDashedLine;

  const [showColorPicker, setShowColorPicker] = useState(false);

  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const drawPointsRef = useRef<[number, number][]>([]);
  drawPointsRef.current = drawPoints;

  // Cached generated coordinates for current shape
  const [draftRingCoords, setDraftRingCoords] = useState<[number, number][]>([]);
  const draftRingCoordsRef = useRef<[number, number][]>([]);
  draftRingCoordsRef.current = draftRingCoords;

  const [isDrawClosed, setIsDrawClosed] = useState(false);
  const isDrawClosedRef = useRef(false);
  isDrawClosedRef.current = isDrawClosed;

  const [drawAreaStr, setDrawAreaStr] = useState('');
  const draftActionMarkerRef = useRef<maplibregl.Marker | null>(null);
  const activeTipMarkerRef = useRef<maplibregl.Marker | null>(null);
  const selectedSavedRegionIdRef = useRef<string | null>(null);

  const clearActiveTipMarker = () => {
    if (activeTipMarkerRef.current) {
      activeTipMarkerRef.current.remove();
      activeTipMarkerRef.current = null;
    }
    if (draftActionMarkerRef.current) {
      draftActionMarkerRef.current.remove();
      draftActionMarkerRef.current = null;
    }
    selectedSavedRegionIdRef.current = null;
  };

  // Dragging & moving refs for drawn shapes
  const isDraggingDrawRef = useRef(false);
  const isMovingShapeRef = useRef(false);
  const dragStartCoordRef = useRef<[number, number] | null>(null);
  const dragCurrentRingRef = useRef<[number, number][] | null>(null);
  const dragCurrentPointsRef = useRef<[number, number][] | null>(null);
  const initialDragRingRef = useRef<[number, number][] | null>(null);
  const initialDragPointsRef = useRef<[number, number][] | null>(null);
  const wasJustDraggedRef = useRef(false);

  // Measure state
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const measurePointsRef = useRef<[number, number][]>([]);
  measurePointsRef.current = measurePoints;
  const [measureTotalDistStr, setMeasureTotalDistStr] = useState('');

  // Inspect state: ONLY coordinates and superimposed meteorological data value
  const [inspectData, setInspectData] = useState<{
    coord: [number, number];
    weatherName: string;
    weatherValue: string;
  } | null>(null);
  const inspectMarkerRef = useRef<maplibregl.Marker | null>(null);

  // If map initialization failed fatally, throw to let MapErrorBoundary catch it
  if (mapInitError) {
    throw mapInitError;
  }

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

          const isClassVisible = (siteClass === 'mobile' && vis.siteMobile !== false) ||
                                 (siteClass === 'fixed' && vis.siteFixed !== false);
          const isWeaponVisible = (currentType === 'rocket' && vis.siteRocket !== false) ||
                                  (currentType === 'gun' && vis.siteGun !== false);
          const isTypeVisible = isClassVisible && isWeaponVisible;

          el.style.visibility = isTypeVisible ? 'visible' : 'hidden';
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
      mapInstance.setFilter('power-lines-glow-layer', ['all', ['==', 'type', 'line'], colorMatchFilter] as any);
    }
    if (mapInstance.getLayer('power-lines-layer')) {
      mapInstance.setFilter('power-lines-layer', ['all', ['==', 'type', 'line'], colorMatchFilter] as any);
    }

    if (mapInstance.getLayer('power-lines-buffer-layer')) {
      if (vis.lineBuffer) {
        mapInstance.setLayoutProperty('power-lines-buffer-layer', 'visibility', 'visible');
        mapInstance.setFilter('power-lines-buffer-layer', colorMatchFilter as any);
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

    try {
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
        pitch: 0,
        bearing: 0,
        maxPitch: 0,
        minPitch: 0,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false
      });
    } catch (err: any) {
      console.error('[Map3D] Failed to instantiate MapLibre GL:', err);
      setMapInitError(err instanceof Error ? err : new Error(String(err)));
      return;
    }

    map.current.on('error', (e) => {
      // Gracefully capture and suppress map tile loading errors (like 429 Too Many Requests or 404)
      const msg = e.message || '';
      const isExpectedTileError = msg.includes('429') || msg.includes('404') || e.error?.status === 429 || e.error?.status === 404;
      if (isExpectedTileError) {
        return;
      }
      if (e?.error && (msg.includes('WebGL') || msg.includes('context lost'))) {
        setMapInitError(e.error);
        return;
      }
      console.warn('MapLibre gracefully handled error:', e);
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: false,
        showZoom: true,
        showCompass: false
      }),
      'top-right'
    );

    map.current.once('load', () => {
      if (map.current) {
        ensureSavedRegionsLayers(map.current);
        syncSavedRegionsGeoJson(savedRegionsRef.current);
      }
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
      if (inspectMarkerRef.current) {
        inspectMarkerRef.current.remove();
        inspectMarkerRef.current = null;
      }
      if (evalSiteMarkerRef.current) {
        evalSiteMarkerRef.current.remove();
        evalSiteMarkerRef.current = null;
      }
      savedMarkersRef.current.forEach(m => m.remove());
      savedMarkersRef.current = [];
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
        let data = localGeoMap[code];
        if (!data) {
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
                const parsed = await response.json();
                if (parsed && parsed.features) {
                  data = parsed;
                  break;
                }
              }
            } catch (err) {
              // continue trying
            }
          }
        }
        
        if (cancelled) return;
        if (!data || !data.features || !data.features[0]) {
          throw new Error(`Failed to load geo data for code: ${code}`);
        }
        
        const provinceFeature = data.features[0];
        provinceFeatureRef.current = provinceFeature;
        
        if (!mapInstance || !mapInstance.style || !mapInstance.getStyle) return;
        
        if (activeNav !== '效果评估') {
          const bbox = turf.bbox(provinceFeature);
          mapInstance.fitBounds(bbox as [number, number, number, number], {
            padding: { top: 100, bottom: 100, left: 200, right: 350 }, // leaving space for UI
            pitch: 0,
            bearing: 0
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

            el.innerHTML = `
              <div class="w-full h-full relative flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                <svg width="18" height="18" viewBox="0 0 18 18" class="overflow-visible" style="filter: drop-shadow(0px 1.5px 3px rgba(0,0,0,0.35))">
                  <circle cx="9" cy="9" r="6.5" fill="${color}" stroke="white" stroke-width="1.8" />
                  <circle cx="9" cy="9" r="2" fill="white" />
                </svg>
                <div class="site-label absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-white/10 shadow whitespace-nowrap pointer-events-none select-none">
                  ${wp.name}
                </div>
              </div>
            `;

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
              
              if (activeNav === '监测预警') {
                currentStatus = 'none';
              } else if (isCaseMode && activeRegion === '湖北地块') {
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
              let siteClass = numVal % 2 === 1 ? 'fixed' : 'mobile';
              if (activeRegion === '湖北地块' && (wp.id === 'wp-hb-new2' || wp.id === 'wp-hb-new3' || wp.id === 'wp-hb-new6')) {
                siteClass = 'fixed';
              }

              const vis = (window as any).mapLayersVisibilityGranular || {
                siteMobile: true, siteFixed: true, siteRocket: true, siteGun: true,
                line1000: true, line500: true, line220: true, lineBuffer: true, weatherOverlay: true
              };

              const isClassVisible = (siteClass === 'mobile' && vis.siteMobile !== false) ||
                                     (siteClass === 'fixed' && vis.siteFixed !== false);
              const isWeaponVisible = (currentType === 'rocket' && vis.siteRocket !== false) ||
                                      (currentType === 'gun' && vis.siteGun !== false);
              const isTypeVisible = isClassVisible && isWeaponVisible;

              const el = document.createElement('div');
              el.className = 'w-4 h-4 flex items-center justify-center relative cursor-pointer group';
              
              // Store id, class, type, and status attributes on the element for runtime toggle
              el.setAttribute('data-site-id', wp.id);
              el.setAttribute('data-site-name', wp.name);
              el.setAttribute('data-site-class', siteClass);
              el.setAttribute('data-site-type', currentType);
              el.setAttribute('data-site-status', currentStatus || 'none');

              const marker = new maplibregl.Marker({ element: el })
                .setLngLat(wp.coord as [number, number]);

              const updateMarkerFn = (status: string) => {
                let colorClass = 'text-[#94a3b8]'; // none
                let fillColor = '#94a3b8';
                if (status === 'ready') { colorClass = 'text-[#84b676]'; fillColor = '#84b676'; }
                else if (status === 'operating') { colorClass = 'text-[#e3d122]'; fillColor = '#e3d122'; }
                else if (status === 'completed') { colorClass = 'text-[#8b10ec]'; fillColor = '#8b10ec'; }
                else if (status === 'canceled') { colorClass = 'text-[#df5a5a]'; fillColor = '#df5a5a'; }

                el.setAttribute('data-site-status', status || 'none');

                const vis = (window as any).mapLayersVisibilityGranular || {
                  siteMobile: true, siteFixed: true, siteRocket: true, siteGun: true,
                  line1000: true, line500: true, line220: true, lineBuffer: true, weatherOverlay: true
                };

                const isClassVisible = (siteClass === 'mobile' && vis.siteMobile !== false) ||
                                       (siteClass === 'fixed' && vis.siteFixed !== false);
                const isWeaponVisible = (currentType === 'rocket' && vis.siteRocket !== false) ||
                                        (currentType === 'gun' && vis.siteGun !== false);
                const isTypeVisible = isClassVisible && isWeaponVisible;

                el.style.visibility = isTypeVisible ? 'visible' : 'hidden';

                let shapeSvg = '';
                if (activeNav === '效果评估') {
                  const isGun = currentType === 'gun';
                  const iconSrc = isGun ? '/assets/aistudio/__-___6776d79c.svg' : '/assets/aistudio/___-___9cba7a11.svg';

                  // If this marker is at the active evaluation site, hide it from markersRef so evalSiteMarkerRef renders cleanly
                  const currentEvalSite = getHistorySiteDetails(selectedHistoryId, isCaseMode, activeCaseId);
                  const isEvalActiveSite = (Math.abs(wp.coord[0] - currentEvalSite.coord[0]) < 0.005 && Math.abs(wp.coord[1] - currentEvalSite.coord[1]) < 0.005) ||
                    Boolean(wp.name && (currentEvalSite.location.includes(wp.name.replace(/作业点|高炮站|火箭点/, '')) || wp.name.includes(currentEvalSite.location.replace(/作业点|高炮站|火箭点/, ''))));

                  if (isEvalActiveSite) {
                    el.style.display = 'none';
                    return;
                  }
                  el.style.display = 'flex';

                  el.innerHTML = `
                    <div class="w-8 h-8 relative flex items-center justify-center group-hover:scale-115 transition-transform duration-200">
                      <img src="${iconSrc}" class="w-8 h-8 select-none drop-shadow-sm opacity-90 hover:opacity-100" alt="${wp.name}" />
                      <div class="site-label absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 shadow whitespace-nowrap pointer-events-none select-none">
                        ${wp.name}
                      </div>
                    </div>
                  `;
                } else {
                  if (currentType === 'rocket') {
                    // 火箭弹：圆形
                    shapeSvg = `<svg width="14" height="14" viewBox="0 0 14 14" class="overflow-visible ${colorClass}" style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3))">
                      <circle cx="7" cy="7" r="6" fill="${fillColor}" stroke="white" stroke-width="1.5" />
                    </svg>`;
                  } else {
                    // 高炮：方形
                    shapeSvg = `<svg width="14" height="14" viewBox="0 0 14 14" class="overflow-visible ${colorClass}" style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3))">
                      <rect x="1" y="1" width="12" height="12" rx="1.5" fill="${fillColor}" stroke="white" stroke-width="1.5" />
                    </svg>`;
                  }

                  const pingSpan = status === 'operating' ? '<span class="absolute w-6 h-6 rounded-full bg-yellow-400/40 animate-ping"></span>' : '';

                  el.innerHTML = `
                    <div class="w-full h-full relative flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                      ${shapeSvg}
                      ${pingSpan}
                      <div class="site-label absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-white/10 shadow whitespace-nowrap pointer-events-none select-none">
                        ${wp.name}
                      </div>
                    </div>
                  `;
                }

                marker.setPopup(
                  new maplibregl.Popup({ 
                    offset: 12, 
                    closeButton: true, 
                    className: 'custom-site-popup' 
                  }).setHTML(createSitePopupHTML({ ...wp, status: status as any, type: currentType }))
                );
              };

              (el as any)._updateMarkerStatus = updateMarkerFn;
              updateMarkerFn(currentStatus);

              const updatedWp = { ...wp, status: currentStatus, type: currentType };

              if (onPointClick) {
                el.addEventListener('click', () => {
                  const latestStatus = (el.getAttribute('data-site-status') || currentStatus) as WeatherPoint['status'];
                  onPointClick({ ...wp, status: latestStatus, type: currentType });
                });
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
          siteMobile: true, siteFixed: true, siteRocket: true, siteGun: true,
          line1000: true, line500: true, line220: true, lineBuffer: true, weatherOverlay: true
        };
        applyGranularVisibility(currentVis);

        // Keep saved regions rendered on top across region and nav switches
        syncSavedRegionsGeoJson(savedRegionsRef.current);
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
  }, [activeRegion, isCaseMode, activeNav]);

  // Lightweight marker status updater on timeline change without modifying map zoom or position
  useEffect(() => {
    if (activeNav === '监测预警' || !isCaseMode || activeRegion !== '湖北地块') return;

    markersRef.current.forEach(marker => {
      const el = marker.getElement();
      if (!el) return;
      const siteId = el.getAttribute('data-site-id');
      if (!siteId) return;

      let currentStatus = 'none';
      if (siteId === 'wp-hb-new2') { // 大冶金湖 (17:18-17:19)
        if (playbackMinutes < 133) currentStatus = 'none';
        else if (playbackMinutes < 138) currentStatus = 'ready';
        else if (playbackMinutes < 139) currentStatus = 'operating';
        else currentStatus = 'completed';
      } else if (siteId === 'wp-hb-new3') { // 刘仁八 (15:28-15:29)
        if (playbackMinutes < 23) currentStatus = 'none';
        else if (playbackMinutes < 28) currentStatus = 'ready';
        else if (playbackMinutes < 29) currentStatus = 'operating';
        else currentStatus = 'completed';
      } else if (siteId === 'wp-hb-new6') { // 白沙 (15:18-15:19)
        if (playbackMinutes < 13) currentStatus = 'none';
        else if (playbackMinutes < 18) currentStatus = 'ready';
        else if (playbackMinutes < 19) currentStatus = 'operating';
        else currentStatus = 'completed';
      } else {
        currentStatus = 'none';
      }

      if ((el as any)._updateMarkerStatus) {
        (el as any)._updateMarkerStatus(currentStatus);
      } else {
        el.setAttribute('data-site-status', currentStatus);
      }
    });
  }, [playbackMinutes, isCaseMode, activeRegion, activeNav, selectedHistoryId]);

  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const setupEvaluation = () => {
      if (activeNav === '效果评估') {
        const siteDetails = getHistorySiteDetails(selectedHistoryId, isCaseMode, activeCaseId);
        const start = siteDetails.coord;
        const isGun = (siteDetails.type || '').includes('高炮');
        const distKm = isGun ? 4 : 6;
        const azimuthVal = parseInt(siteDetails.azimuth) || 0;

        // Calculate burst point coordinates using azimuth and distance (4km for gun, 6km for rocket)
        let end: [number, number];
        try {
          const dest = (turf as any).destination(turf.point(start), distKm, azimuthVal, { units: 'kilometers' });
          end = [dest.geometry.coordinates[0], dest.geometry.coordinates[1]];
        } catch (err) {
          const R = 6371;
          const rad = Math.PI / 180;
          const lat1 = start[1] * rad;
          const lon1 = start[0] * rad;
          const brng = azimuthVal * rad;
          const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distKm / R) + Math.cos(lat1) * Math.sin(distKm / R) * Math.cos(brng));
          const lon2 = lon1 + Math.atan2(
            Math.sin(brng) * Math.sin(distKm / R) * Math.cos(lat1),
            Math.cos(distKm / R) - Math.sin(lat1) * Math.sin(lat2)
          );
          end = [lon2 / rad, lat2 / rad];
        }

        const evalZoom = isGun ? 11.8 : 11.0;

        // Center directly on the site in 2D planar mode (pitch: 0, bearing: 0)
        mapInstance.flyTo({
          center: [start[0], start[1]],
          zoom: evalZoom,
          pitch: 0,
          bearing: 0,
          duration: 1500
        });

        // 1. Direct straight trajectory line in 2D
        const trajectoryCoords: [number, number][] = [start, end];

        // Remove old risk layers if present
        if (mapInstance.getLayer('eval-risk-layer')) mapInstance.removeLayer('eval-risk-layer');
        if (mapInstance.getLayer('eval-risk-border')) mapInstance.removeLayer('eval-risk-border');

        const evalGeoJson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'trajectory', name: '轨迹' },
              geometry: { type: 'LineString', coordinates: trajectoryCoords }
            },
            {
              type: 'Feature',
              properties: { type: 'launch', name: '发射点' },
              geometry: { type: 'Point', coordinates: start }
            },
            {
              type: 'Feature',
              properties: { type: 'impact', name: '炸点' },
              geometry: { type: 'Point', coordinates: end }
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

        // Clean up previous active evaluation site marker
        if (evalSiteMarkerRef.current) {
          evalSiteMarkerRef.current.remove();
          evalSiteMarkerRef.current = null;
        }
        document.querySelectorAll('.eval-site-marker').forEach(el => el.remove());

        // Hide any marker in markersRef that matches the active evaluation site (by coord or by name),
        // and ensure other markers in markersRef remain visible
        markersRef.current.forEach((marker) => {
          const el = marker.getElement();
          if (el) {
            const mCoord = marker.getLngLat();
            const isAtStart = (Math.abs(mCoord.lng - start[0]) < 0.005 && Math.abs(mCoord.lat - start[1]) < 0.005);
            const mName = el.getAttribute('data-site-name') || '';
            const rawSiteName = siteDetails.location.replace(/作业点|高炮站|火箭点/, '');
            const nameMatches = Boolean(mName && (siteDetails.location.includes(mName) || mName.includes(rawSiteName)));
            if (isAtStart || nameMatches) {
              el.style.display = 'none';
            } else {
              el.style.display = 'flex';
            }
          }
        });

        const iconSrc = isGun ? '/assets/aistudio/__-___6776d79c.svg' : '/assets/aistudio/___-___9cba7a11.svg';

        const markerEl = document.createElement('div');
        markerEl.className = 'eval-site-marker relative flex flex-col items-center select-none cursor-pointer group z-20';
        markerEl.innerHTML = `
          <div class="eval-site-label inline-block bg-slate-900/85 backdrop-blur-sm text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-white/20 shadow whitespace-nowrap mb-0.5 pointer-events-none select-none">
            ${siteDetails.location}
          </div>
          <div class="relative w-9 h-9 flex items-center justify-center group-hover:scale-115 transition-transform duration-200">
            <img src="${iconSrc}" class="w-9 h-9 select-none drop-shadow-md" alt="${isGun ? '高炮站点' : '火箭弹站点'}" />
          </div>
        `;

        evalSiteMarkerRef.current = new maplibregl.Marker({
          element: markerEl,
          anchor: 'bottom',
          offset: [0, 8]
        })
          .setLngLat(start)
          .addTo(mapInstance);

        // Add layers if they don't exist, and set visibility to 'visible'
        const layers = [
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
              'circle-radius': 0,
              'circle-opacity': 0
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
            filter: ['==', ['get', 'type'], 'impact'],
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
        if (evalSiteMarkerRef.current) {
          evalSiteMarkerRef.current.remove();
          evalSiteMarkerRef.current = null;
        }
        document.querySelectorAll('.eval-site-marker').forEach(el => el.remove());
        markersRef.current.forEach((marker) => {
          const el = marker.getElement();
          if (el) {
            el.style.display = 'flex';
          }
        });
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
        pitch: 0,
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
          pitch: 0,
          bearing: 0,
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
            pitch: 0,
            bearing: 0,
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

  const handleResetEvaluationView = () => {
    const mapInstance = map.current;
    if (!mapInstance) return;
    try {
      const siteDetails = getHistorySiteDetails(selectedHistoryId, isCaseMode, activeCaseId);
      const start = siteDetails.coord;
      const isGun = (siteDetails.type || '').includes('高炮');
      const evalZoom = isGun ? 11.8 : 11.0;

      mapInstance.flyTo({
        center: [start[0], start[1]],
        zoom: evalZoom,
        pitch: 0,
        bearing: 0,
        duration: 1200
      });
    } catch (e) {
      console.warn('Error resetting evaluation view:', e);
    }
  };

  // Geometry helpers for Rectangle and Circle drawing
  const generateRectCoords = (p1: [number, number], p2: [number, number]): [number, number][] => {
    const minX = Math.min(p1[0], p2[0]);
    const maxX = Math.max(p1[0], p2[0]);
    const minY = Math.min(p1[1], p2[1]);
    const maxY = Math.max(p1[1], p2[1]);
    return [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
      [minX, minY]
    ];
  };

  const generateCircleCoords = (center: [number, number], radiusKm: number): [number, number][] => {
    try {
      const circle = (turf as any).circle(center, radiusKm, { steps: 64, units: 'kilometers' });
      return circle.geometry.coordinates[0];
    } catch (e) {
      const coords: [number, number][] = [];
      const points = 64;
      const kmLat = 1 / 110.574;
      const kmLng = 1 / (111.320 * Math.cos(center[1] * Math.PI / 180));
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const dx = radiusKm * Math.cos(theta) * kmLng;
        const dy = radiusKm * Math.sin(theta) * kmLat;
        coords.push([center[0] + dx, center[1] + dy]);
      }
      return coords;
    }
  };

  // 圆形绘制：以初始点击/按下点为起始边界点，拖拽或移动对向点为边界点（两点定直径）
  const generateCircleFromBoundary = (p1: [number, number], p2: [number, number]): [number, number][] => {
    const center: [number, number] = [
      Number(((p1[0] + p2[0]) / 2).toFixed(5)),
      Number(((p1[1] + p2[1]) / 2).toFixed(5))
    ];
    let distKm = 0.1;
    try {
      distKm = (turf as any).distance(turf.point(p1), turf.point(p2), { units: 'kilometers' });
    } catch (e) {
      distKm = 0.1;
    }
    const radiusKm = Math.max(0.05, distKm / 2);
    return generateCircleCoords(center, radiusKm);
  };

  // 任意形状几何生成函数：点击一个点或者拖拽立即生成形态自然的多边形闭合环（5边形，具备填充和清晰边界线）
  const generatePolygonCoords = (p1: [number, number], p2?: [number, number]): [number, number][] => {
    let cx = p1[0];
    let cy = p1[1];
    let rx = 0.13; // 经度跨度约 13km
    let ry = 0.10; // 纬度跨度约 11km

    if (p2) {
      const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      if (dist > 0.005) {
        const minX = Math.min(p1[0], p2[0]);
        const maxX = Math.max(p1[0], p2[0]);
        const minY = Math.min(p1[1], p2[1]);
        const maxY = Math.max(p1[1], p2[1]);
        cx = (minX + maxX) / 2;
        cy = (minY + maxY) / 2;
        rx = Math.max(0.04, (maxX - minX) / 2);
        ry = Math.max(0.03, (maxY - minY) / 2);
      }
    }

    // 5个顶点的任意多边形形态，自然且形状分明
    const angles = [18, 88, 162, 228, 300];
    const scales = [1.06, 0.94, 1.05, 0.93, 1.02];
    const ring: [number, number][] = [];
    for (let i = 0; i < angles.length; i++) {
      const rad = (angles[i] * Math.PI) / 180;
      const x = cx + rx * scales[i] * Math.cos(rad);
      const y = cy + ry * scales[i] * Math.sin(rad);
      ring.push([Number(x.toFixed(5)), Number(y.toFixed(5))]);
    }
    ring.push(ring[0]); // 闭合
    return ring;
  };

  // --- Saved Regions Layer (持久化保存区域并在地图上持续呈现) ---
  const ensureSavedRegionsLayers = (mapInstance: maplibregl.Map) => {
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;
    try {
      if (!mapInstance.getSource('map-saved-regions-source')) {
        mapInstance.addSource('map-saved-regions-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
      }
      if (!mapInstance.getLayer('map-saved-regions-fill')) {
        mapInstance.addLayer({
          id: 'map-saved-regions-fill',
          type: 'fill',
          source: 'map-saved-regions-source',
          filter: ['==', ['get', 'featureType'], 'fill'],
          paint: {
            'fill-color': ['coalesce', ['get', 'color'], '#2563eb'],
            'fill-opacity': 0.25,
            'fill-outline-color': ['coalesce', ['get', 'color'], '#2563eb']
          }
        });
      } else {
        mapInstance.setFilter('map-saved-regions-fill', ['==', ['get', 'featureType'], 'fill']);
        mapInstance.setPaintProperty('map-saved-regions-fill', 'fill-outline-color', ['coalesce', ['get', 'color'], '#2563eb']);
      }

      if (!mapInstance.getLayer('map-saved-regions-stroke-solid')) {
        mapInstance.addLayer({
          id: 'map-saved-regions-stroke-solid',
          type: 'line',
          source: 'map-saved-regions-source',
          filter: ['all', ['==', ['get', 'featureType'], 'stroke'], ['!=', ['get', 'lineStyle'], 'dashed']],
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#2563eb'],
            'line-width': 3,
            'line-opacity': 1.0
          }
        });
      } else {
        mapInstance.setFilter('map-saved-regions-stroke-solid', ['all', ['==', ['get', 'featureType'], 'stroke'], ['!=', ['get', 'lineStyle'], 'dashed']]);
        mapInstance.setPaintProperty('map-saved-regions-stroke-solid', 'line-width', 3);
        mapInstance.setPaintProperty('map-saved-regions-stroke-solid', 'line-opacity', 1.0);
      }

      if (!mapInstance.getLayer('map-saved-regions-stroke-dashed')) {
        mapInstance.addLayer({
          id: 'map-saved-regions-stroke-dashed',
          type: 'line',
          source: 'map-saved-regions-source',
          filter: ['all', ['==', ['get', 'featureType'], 'stroke'], ['==', ['get', 'lineStyle'], 'dashed']],
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#2563eb'],
            'line-width': 3,
            'line-opacity': 1.0,
            'line-dasharray': [2, 2]
          }
        });
      } else {
        mapInstance.setFilter('map-saved-regions-stroke-dashed', ['all', ['==', ['get', 'featureType'], 'stroke'], ['==', ['get', 'lineStyle'], 'dashed']]);
        mapInstance.setPaintProperty('map-saved-regions-stroke-dashed', 'line-width', 3);
        mapInstance.setPaintProperty('map-saved-regions-stroke-dashed', 'line-opacity', 1.0);
      }
    } catch (e) {
      console.warn('ensureSavedRegionsLayers deferred:', e);
    }
  };

  const handleDeleteSavedRegion = (id: string) => {
    clearActiveTipMarker();
    const next = savedRegionsRef.current.filter(r => r.id !== id);
    setSavedRegions(next);
    try {
      localStorage.setItem('map-saved-drawn-regions', JSON.stringify(next));
    } catch (e) {}
    syncSavedRegionsGeoJson(next, false);
    window.dispatchEvent(new CustomEvent('saved-regions-updated', { detail: { regions: next } }));
  };

  const handleClearSavedRegions = () => {
    clearActiveTipMarker();
    setSavedRegions([]);
    try {
      localStorage.removeItem('map-saved-drawn-regions');
    } catch (e) {}
    syncSavedRegionsGeoJson([], false);
    window.dispatchEvent(new CustomEvent('saved-regions-updated', { detail: { regions: [] } }));
  };

  const syncSavedRegionsGeoJson = (
    regions: Array<{
      id: string;
      name: string;
      coordinates: [number, number][];
      areaKm2: string;
      color?: string;
      lineStyle?: 'solid' | 'dashed';
      createdAt: number;
    }>,
    _isEditing: boolean = false
  ) => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    if (!mapInstance.isStyleLoaded()) {
      mapInstance.once('style.load', () => {
        syncSavedRegionsGeoJson(regions, _isEditing);
      });
      return;
    }

    try {
      ensureSavedRegionsLayers(mapInstance);
      const source = mapInstance.getSource('map-saved-regions-source') as maplibregl.GeoJSONSource;
      if (!source) return;

      const features: any[] = [];
      regions.forEach((r) => {
        if (r.coordinates && r.coordinates.length >= 3) {
          const first = r.coordinates[0];
          const last = r.coordinates[r.coordinates.length - 1];
          const isClosed = first[0] === last[0] && first[1] === last[1];
          const ring = isClosed ? r.coordinates : [...r.coordinates, first];
          const color = r.color || '#2563eb';
          const lineStyle = r.lineStyle || 'solid';
          const commonProps = { 
            id: r.id, 
            name: r.name, 
            areaKm2: r.areaKm2,
            color,
            lineStyle
          };

          // 1. 区域多边形填充面
          features.push({
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [ring] },
            properties: { ...commonProps, featureType: 'fill' }
          });

          // 2. 区域边界轮廓线（确保任何底图上均有清晰的高对比度边界线）
          features.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: ring },
            properties: { ...commonProps, featureType: 'stroke' }
          });
        }
      });

      source.setData({
        type: 'FeatureCollection',
        features
      });

      // 确保图层位于顶层正常透光显示
      if (mapInstance.getLayer('map-saved-regions-fill')) {
        mapInstance.moveLayer('map-saved-regions-fill');
      }
      if (mapInstance.getLayer('map-saved-regions-stroke-solid')) {
        mapInstance.moveLayer('map-saved-regions-stroke-solid');
      }
      if (mapInstance.getLayer('map-saved-regions-stroke-dashed')) {
        mapInstance.moveLayer('map-saved-regions-stroke-dashed');
      }
    } catch (e) {
      console.warn('syncSavedRegionsGeoJson deferred:', e);
    }
  };

  // 监听来自其他面板或外部的操作指令
  useEffect(() => {
    const handleAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: 'delete' | 'clear'; id?: string }>;
      if (customEvent.detail?.action === 'delete' && customEvent.detail.id) {
        handleDeleteSavedRegion(customEvent.detail.id);
      } else if (customEvent.detail?.action === 'clear') {
        handleClearSavedRegions();
      }
    };
    window.addEventListener('map-saved-regions-action', handleAction);
    return () => window.removeEventListener('map-saved-regions-action', handleAction);
  }, []);

  // Sync saved regions to map on load or change
  useEffect(() => {
    if (!map.current) return;
    const mapInstance = map.current;
    const isEditing = activeMapToolRef.current === 'draw';
    if (mapInstance.isStyleLoaded()) {
      syncSavedRegionsGeoJson(savedRegions, isEditing);
    } else {
      mapInstance.once('style.load', () => {
        syncSavedRegionsGeoJson(savedRegions, isEditing);
      });
    }
  }, [savedRegions]);

  // --- Map Tools Implementation (绘制区域 / 测距 / 鼠标取值) ---
  const ensureToolLayers = (mapInstance: maplibregl.Map) => {
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;
    try {
      if (!mapInstance.getSource('map-tool-draw-source')) {
        mapInstance.addSource('map-tool-draw-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        mapInstance.addLayer({
          id: 'map-tool-draw-fill',
          type: 'fill',
          source: 'map-tool-draw-source',
          filter: ['==', ['get', 'featureType'], 'fill'],
          paint: {
            'fill-color': ['coalesce', ['get', 'color'], '#3b82f6'],
            'fill-opacity': 0.25,
            'fill-outline-color': ['coalesce', ['get', 'color'], '#2563eb']
          }
        });
        mapInstance.addLayer({
          id: 'map-tool-draw-stroke-solid',
          type: 'line',
          source: 'map-tool-draw-source',
          filter: ['all', ['==', ['get', 'featureType'], 'stroke'], ['!=', ['get', 'lineStyle'], 'dashed']],
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#2563eb'],
            'line-width': 3,
            'line-opacity': 1.0
          }
        });
        mapInstance.addLayer({
          id: 'map-tool-draw-stroke-dashed',
          type: 'line',
          source: 'map-tool-draw-source',
          filter: ['all', ['==', ['get', 'featureType'], 'stroke'], ['==', ['get', 'lineStyle'], 'dashed']],
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#2563eb'],
            'line-width': 3,
            'line-opacity': 1.0,
            'line-dasharray': [2, 2]
          }
        });
        mapInstance.addLayer({
          id: 'map-tool-draw-nodes',
          type: 'circle',
          source: 'map-tool-draw-source',
          filter: ['==', ['get', 'featureType'], 'node'],
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': 5,
            'circle-stroke-width': 2.5,
            'circle-stroke-color': ['coalesce', ['get', 'color'], '#2563eb']
          }
        });
      } else {
        if (mapInstance.getLayer('map-tool-draw-fill')) {
          mapInstance.setFilter('map-tool-draw-fill', ['==', ['get', 'featureType'], 'fill']);
          mapInstance.setPaintProperty('map-tool-draw-fill', 'fill-outline-color', ['coalesce', ['get', 'color'], '#2563eb']);
        }
        if (mapInstance.getLayer('map-tool-draw-stroke-solid')) {
          mapInstance.setFilter('map-tool-draw-stroke-solid', ['all', ['==', ['get', 'featureType'], 'stroke'], ['!=', ['get', 'lineStyle'], 'dashed']]);
          mapInstance.setPaintProperty('map-tool-draw-stroke-solid', 'line-width', 3);
          mapInstance.setPaintProperty('map-tool-draw-stroke-solid', 'line-opacity', 1.0);
        }
        if (mapInstance.getLayer('map-tool-draw-stroke-dashed')) {
          mapInstance.setFilter('map-tool-draw-stroke-dashed', ['all', ['==', ['get', 'featureType'], 'stroke'], ['==', ['get', 'lineStyle'], 'dashed']]);
          mapInstance.setPaintProperty('map-tool-draw-stroke-dashed', 'line-width', 3);
          mapInstance.setPaintProperty('map-tool-draw-stroke-dashed', 'line-opacity', 1.0);
        }
        if (mapInstance.getLayer('map-tool-draw-nodes')) {
          mapInstance.setFilter('map-tool-draw-nodes', ['==', ['get', 'featureType'], 'node']);
        }
      }

      if (!mapInstance.getSource('map-tool-measure-source')) {
        mapInstance.addSource('map-tool-measure-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        mapInstance.addLayer({
          id: 'map-tool-measure-line-glow',
          type: 'line',
          source: 'map-tool-measure-source',
          filter: ['==', ['get', 'featureType'], 'line'],
          paint: {
            'line-color': '#f59e0b',
            'line-width': 6,
            'line-opacity': 0.35,
            'line-blur': 2
          }
        });
        mapInstance.addLayer({
          id: 'map-tool-measure-line',
          type: 'line',
          source: 'map-tool-measure-source',
          filter: ['==', ['get', 'featureType'], 'line'],
          paint: {
            'line-color': '#f59e0b',
            'line-width': 3
          }
        });
        mapInstance.addLayer({
          id: 'map-tool-measure-points',
          type: 'circle',
          source: 'map-tool-measure-source',
          filter: ['==', ['get', 'featureType'], 'node'],
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': 5,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#d97706'
          }
        });
        mapInstance.addLayer({
          id: 'map-tool-measure-labels',
          type: 'symbol',
          source: 'map-tool-measure-source',
          filter: ['has', 'distText'],
          layout: {
            'text-field': ['get', 'distText'],
            'text-size': 11,
            'text-offset': [0, -1.3],
            'text-anchor': 'bottom'
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2.5
          }
        });
      }
    } catch (e) {
      console.warn('ensureToolLayers deferred:', e);
    }
  };

  const syncDrawGeoJson = (
    points: [number, number][],
    ringCoords?: [number, number][],
    color: string = drawColorRef.current,
    lineStyle: 'solid' | 'dashed' = isDashedLineRef.current ? 'dashed' : 'solid'
  ) => {
    const mapInstance = map.current;
    if (!mapInstance) return;
    ensureToolLayers(mapInstance);
    const source = mapInstance.getSource('map-tool-draw-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    const features: any[] = [];
    const commonProps = { color, lineStyle };

    if (ringCoords && ringCoords.length >= 3) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [ringCoords] },
        properties: { ...commonProps, featureType: 'fill' }
      });
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: ringCoords },
        properties: { ...commonProps, featureType: 'stroke' }
      });
    } else if (points.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: points },
        properties: { ...commonProps, featureType: 'stroke' }
      });
    }

    points.forEach(p => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: p },
        properties: { ...commonProps, featureType: 'node' }
      });
    });

    source.setData({
      type: 'FeatureCollection',
      features
    });

    // 确保轮廓线与控制点图层在填充面之上
    try {
      if (mapInstance.getLayer('map-tool-draw-fill')) mapInstance.moveLayer('map-tool-draw-fill');
      if (mapInstance.getLayer('map-tool-draw-stroke-solid')) mapInstance.moveLayer('map-tool-draw-stroke-solid');
      if (mapInstance.getLayer('map-tool-draw-stroke-dashed')) mapInstance.moveLayer('map-tool-draw-stroke-dashed');
      if (mapInstance.getLayer('map-tool-draw-nodes')) mapInstance.moveLayer('map-tool-draw-nodes');
    } catch (e) {}
  };

  // 几何位置与图形包含判断工具函数（用于拖拽移动图形与光标感知）
  const isPointInPolygonRing = (point: [number, number], ring: [number, number][]) => {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const isNearPolygonBorder = (point: [number, number], ring: [number, number][], maxDistKm = 0.8) => {
    try {
      for (const p of ring) {
        const d = (turf as any).distance(turf.point(point), turf.point(p), { units: 'kilometers' });
        if (d < maxDistKm) return true;
      }
      const line = turf.lineString(ring);
      const d = (turf as any).pointToLineDistance(turf.point(point), line, { units: 'kilometers' });
      return d < maxDistKm;
    } catch {
      return false;
    }
  };

  const isCoordInDraftShape = (coord: [number, number], ring: [number, number][]) => {
    if (!ring || ring.length < 3) return false;
    return isPointInPolygonRing(coord, ring) || isNearPolygonBorder(coord, ring, 0.8);
  };

  // 在绘制图形的外部边缘渲染操作徽章（绝对不遮挡图形内部）：包含 [保存] 按钮（代表完成也代表保存）以及 [删除] 按钮
  const renderDraftActionMarker = (
    ring: [number, number][],
    shapeType: 'polygon' | 'rect' | 'circle',
    color: string
  ) => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    clearActiveTipMarker();

    if (!ring || ring.length < 3) return;

    const poly = turf.polygon([ring]);
    const areaVal = turf.area(poly) / 1_000_000;
    const areaKm2 = `${areaVal.toFixed(2)} km²`;
    setDrawAreaStr(areaKm2);

    // 计算图形的外接包围盒，确保操作徽章锚定在图形上方边缘外部（或下方边缘外部），绝对不遮挡图形！
    const bbox = turf.bbox(poly); // [minLng, minLat, maxLng, maxLat]
    const midLng = (bbox[0] + bbox[2]) / 2;
    const topLat = bbox[3];
    const bottomLat = bbox[1];

    const projTop = mapInstance.project([midLng, topLat]);
    // 避开顶部 140px 工具栏范围；若靠顶则置于图形下方外部，否则置于图形上方外部
    const placeBelow = projTop.y < 140;

    const badgeEl = document.createElement('div');
    badgeEl.className = 'draft-action-badge select-none pointer-events-auto z-40 transition-transform';
    const label = shapeType === 'circle' ? '圆形' : shapeType === 'rect' ? '矩形' : '任意形状';

    badgeEl.innerHTML = `
      <div class="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-blue-400 text-xs font-sans ring-2 ring-blue-500/10">
        <div class="flex items-center gap-1.5 pr-2.5 border-r border-slate-200">
          <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style="background-color: ${color}"></span>
          <span class="font-bold text-slate-800 text-[11px]">${label}</span>
          <span class="text-blue-600 font-mono font-bold text-[10.5px]">(${areaKm2})</span>
        </div>
        <button class="draft-save-btn flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer active:scale-95 transition-all" title="完成并保存该图形">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          保存
        </button>
        <button class="draft-del-btn p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors" title="删除该图形">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
        </button>
      </div>
    `;

    // 阻止鼠标与指针事件冒泡到地图，防止点击按钮时触发地图 mousedown 导致徽章被意外销毁
    ['mousedown', 'pointerdown', 'mouseup', 'pointerup', 'click', 'dblclick', 'touchstart', 'touchend'].forEach(evt => {
      badgeEl.addEventListener(evt, (e) => e.stopPropagation());
    });

    const saveBtn = badgeEl.querySelector('.draft-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleSaveCurrentRegion(ring);
      });
    }

    const delBtn = badgeEl.querySelector('.draft-del-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleClearCurrentDraw();
      });
    }

    const marker = new maplibregl.Marker({
      element: badgeEl,
      anchor: placeBelow ? 'top' : 'bottom',
      offset: placeBelow ? [0, 14] : [0, -14]
    }).setLngLat([midLng, placeBelow ? bottomLat : topLat]).addTo(mapInstance);

    draftActionMarkerRef.current = marker;
    activeTipMarkerRef.current = marker;
  };

  // 针对已保存图形的独立提示条（仅显示最新被点击的图形，且置于图形外部边缘不遮挡）
  const renderSavedRegionTipMarker = (region: {
    id: string;
    name: string;
    coordinates: [number, number][];
    areaKm2: string;
    color?: string;
    lineStyle?: 'solid' | 'dashed';
  }) => {
    const mapInstance = map.current;
    if (!mapInstance || !region.coordinates || region.coordinates.length < 3) return;

    clearActiveTipMarker();
    selectedSavedRegionIdRef.current = region.id;

    const ring = [...region.coordinates, region.coordinates[0]];
    const poly = turf.polygon([ring]);
    const bbox = turf.bbox(poly);
    const midLng = (bbox[0] + bbox[2]) / 2;
    const topLat = bbox[3];
    const bottomLat = bbox[1];
    const projTop = mapInstance.project([midLng, topLat]);
    const placeBelow = projTop.y < 140;
    const color = region.color || '#2563eb';

    const badgeEl = document.createElement('div');
    badgeEl.className = 'saved-region-tip-badge select-none pointer-events-auto z-40 animate-fade-in';
    badgeEl.innerHTML = `
      <div class="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-blue-400 text-xs font-sans ring-2 ring-blue-500/10">
        <div class="flex items-center gap-1.5 pr-2.5 border-r border-slate-200">
          <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style="background-color: ${color}"></span>
          <span class="font-bold text-slate-800 text-[11px]">${region.name}</span>
          <span class="text-blue-600 font-mono font-bold text-[10.5px]">(${region.areaKm2})</span>
        </div>
        <button class="saved-del-btn flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer active:scale-95 transition-all" title="删除该图形">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
          删除
        </button>
        <button class="saved-close-btn p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors" title="关闭提示条">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;

    // 阻止鼠标与指针事件冒泡到地图
    ['mousedown', 'pointerdown', 'mouseup', 'pointerup', 'click', 'dblclick', 'touchstart', 'touchend'].forEach(evt => {
      badgeEl.addEventListener(evt, (e) => e.stopPropagation());
    });

    const delBtn = badgeEl.querySelector('.saved-del-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleDeleteSavedRegion(region.id);
        clearActiveTipMarker();
      });
    }

    const closeBtn = badgeEl.querySelector('.saved-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        clearActiveTipMarker();
      });
    }

    const marker = new maplibregl.Marker({
      element: badgeEl,
      anchor: placeBelow ? 'top' : 'bottom',
      offset: placeBelow ? [0, 14] : [0, -14]
    }).setLngLat([midLng, placeBelow ? bottomLat : topLat]).addTo(mapInstance);

    activeTipMarkerRef.current = marker;
  };

  const syncMeasureGeoJson = (points: [number, number][]) => {
    const mapInstance = map.current;
    if (!mapInstance) return;
    ensureToolLayers(mapInstance);
    const source = mapInstance.getSource('map-tool-measure-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    const features: any[] = [];
    let cumulative = 0;

    if (points.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: points },
        properties: { featureType: 'line' }
      });
    }

    // 点一下就是一个点，绝对不添加中间点！初始点是 0 km，后续每个点显示从起点累加的距离
    points.forEach((p, idx) => {
      if (idx === 0) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: p },
          properties: { featureType: 'node', distText: '0 km' }
        });
      } else {
        const segDist = (turf as any).distance(turf.point(points[idx - 1]), turf.point(p), { units: 'kilometers' });
        cumulative += segDist;
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: p },
          properties: { featureType: 'node', distText: `${cumulative.toFixed(1)} km` }
        });
      }
    });

    setMeasureTotalDistStr(cumulative > 0 ? `${cumulative.toFixed(1)} km` : (points.length === 1 ? '0 km' : ''));

    source.setData({
      type: 'FeatureCollection',
      features
    });
  };

  const getInspectData = (lng: number, lat: number) => {
    let nearestWp = weatherPoints[0];
    let minDist = 9999;
    for (const wp of weatherPoints) {
      try {
        const d = (turf as any).distance(turf.point([lng, lat]), turf.point(wp.coord as [number, number]), { units: 'kilometers' });
        if (d < minDist) {
          minDist = d;
          nearestWp = wp;
        }
      } catch (e) {}
    }

    let radarDbz = 15;
    if (minDist < 10) {
      radarDbz = Math.min(65, Math.round(42 + Math.abs(Math.sin(lng * 10)) * 18));
    } else if (minDist < 25) {
      radarDbz = Math.min(48, Math.round(28 + Math.abs(Math.cos(lat * 8)) * 14));
    } else if (minDist < 50) {
      radarDbz = Math.round(18 + Math.abs(Math.sin(lat * 6)) * 10);
    }

    // 计算当前叠加的气象数据类型与数值（经纬度 + 叠加的气象数据的值）
    let weatherName = '组合反射率';
    let weatherValue = `${radarDbz} dBZ`;

    const activeProd = selectedProductKeys && selectedProductKeys.length > 0 ? selectedProductKeys[0] : '';
    if (activeProd.includes('卫星') || activeProd.includes('葵花') || activeProd.includes('风云') || activeProd.includes('亮温')) {
      weatherName = '云顶亮温';
      const tbb = (248 - radarDbz * 1.6).toFixed(1);
      weatherValue = `${tbb} K`;
    } else if (activeProd.includes('外推')) {
      weatherName = '外推反射率';
      weatherValue = `${Math.max(10, radarDbz - 3)} dBZ`;
    } else if (activeProd.includes('降水') || activeProd.includes('降雨')) {
      weatherName = '降水强度';
      const rainRate = (Math.max(0, (radarDbz - 15) * 0.4)).toFixed(1);
      weatherValue = `${rainRate} mm/h`;
    } else if (activeProd.includes('气温') || activeProd.includes('温度')) {
      weatherName = '地面气温';
      const temp = (27.2 - Math.abs(lat - 30.2) * 1.8).toFixed(1);
      weatherValue = `${temp} ℃`;
    } else if (activeProd.includes('湿度')) {
      weatherName = '相对湿度';
      const hum = Math.min(99, Math.round(62 + radarDbz * 0.5));
      weatherValue = `${hum} %`;
    } else if (activeProd.includes('风速') || activeProd.includes('风流')) {
      weatherName = '10米风速';
      const wind = (3.5 + radarDbz * 0.15).toFixed(1);
      weatherValue = `${wind} m/s`;
    } else if (activeProd.includes('雷电')) {
      weatherName = '闪电频次';
      const lgt = radarDbz >= 40 ? Math.round((radarDbz - 38) * 2.5) : 0;
      weatherValue = `${lgt} 次/分`;
    } else if (activeProd) {
      weatherName = activeProd;
      weatherValue = `${radarDbz} dBZ`;
    }

    return {
      coord: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] as [number, number],
      weatherName,
      weatherValue
    };
  };

  const renderInspectMarker = (data: {
    coord: [number, number];
    weatherName: string;
    weatherValue: string;
  } | null) => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    if (!data) {
      if (inspectMarkerRef.current) {
        inspectMarkerRef.current.remove();
        inspectMarkerRef.current = null;
      }
      return;
    }

    if (!inspectMarkerRef.current) {
      const containerEl = document.createElement('div');
      containerEl.className = 'inspect-marker-wrapper relative select-none pointer-events-auto z-40';
      inspectMarkerRef.current = new maplibregl.Marker({
        element: containerEl,
        anchor: 'bottom',
        offset: [0, -6]
      });
    }

    const containerEl = inspectMarkerRef.current.getElement();
    containerEl.innerHTML = `
      <div class="relative flex flex-col items-center">
        <div class="relative bg-white/95 backdrop-blur-md text-slate-800 text-xs px-3 py-2.5 rounded-xl border border-slate-200/90 shadow-xl flex flex-col gap-1.5 min-w-[195px] mb-2 pointer-events-auto select-none">
          <button class="inspect-close-btn absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 w-4 h-4 rounded flex items-center justify-center text-[10px] cursor-pointer transition-colors" title="关闭">✕</button>
          <div class="flex flex-col gap-1.5 pt-0.5 pr-2">
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-500 text-[11.5px]">经度:</span>
              <span class="font-mono text-slate-800 font-semibold text-[11.5px]">${data.coord[0]}° E</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-500 text-[11.5px]">纬度:</span>
              <span class="font-mono text-slate-800 font-semibold text-[11.5px]">${data.coord[1]}° N</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-500 text-[11.5px]">${data.weatherName}:</span>
              <span class="font-mono text-slate-800 font-semibold text-[11.5px]">${data.weatherValue}</span>
            </div>
          </div>
        </div>

        <div class="relative w-6 h-6 flex items-center justify-center pointer-events-none">
          <div class="w-4 h-4 rounded-full border-2 border-blue-600 bg-white shadow-md flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = containerEl.querySelector('.inspect-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setInspectData(null);
        if (inspectMarkerRef.current) {
          inspectMarkerRef.current.remove();
          inspectMarkerRef.current = null;
        }
      });
    }

    inspectMarkerRef.current.setLngLat(data.coord).addTo(mapInstance);
  };

  const handleUndoLastDrawPoint = () => {
    const shapeType = drawShapeTypeRef.current;
    if (shapeType === 'polygon') {
      const current = drawPointsRef.current;
      if (current.length === 0) return;
      const next = current.slice(0, -1);
      setDrawPoints(next);
      setIsDrawClosed(false);
      if (next.length >= 3) {
        const ring = [...next, next[0]];
        setDraftRingCoords(ring);
        syncDrawGeoJson(next, ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
        renderDraftActionMarker(ring, 'polygon', drawColorRef.current);
      } else {
        setDraftRingCoords([]);
        setDrawAreaStr('');
        if (draftActionMarkerRef.current) {
          draftActionMarkerRef.current.remove();
          draftActionMarkerRef.current = null;
        }
        syncDrawGeoJson(next, undefined, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
      }
    } else {
      handleClearCurrentDraw();
    }
  };

  const handleClearCurrentDraw = () => {
    isMovingShapeRef.current = false;
    isDraggingDrawRef.current = false;
    if (map.current) {
      map.current.dragPan.enable();
      map.current.getCanvas().style.cursor = activeMapToolRef.current === 'draw' ? 'crosshair' : '';
    }
    setDrawPoints([]);
    setDraftRingCoords([]);
    setIsDrawClosed(false);
    setDrawAreaStr('');
    if (draftActionMarkerRef.current) {
      draftActionMarkerRef.current.remove();
      draftActionMarkerRef.current = null;
    }
    const mapInstance = map.current;
    if (mapInstance) {
      const s = mapInstance.getSource('map-tool-draw-source') as maplibregl.GeoJSONSource;
      if (s) s.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  const handleSaveCurrentRegion = (customRing?: [number, number][]) => {
    let ring = customRing || (draftRingCoordsRef.current && draftRingCoordsRef.current.length >= 3 ? draftRingCoordsRef.current : null);
    if (!ring || ring.length < 3) {
      if (draftRingCoords && draftRingCoords.length >= 3) {
        ring = draftRingCoords;
      } else if (drawPointsRef.current && drawPointsRef.current.length >= 3) {
        ring = [...drawPointsRef.current, drawPointsRef.current[0]];
      } else if (drawPoints && drawPoints.length >= 3) {
        ring = [...drawPoints, drawPoints[0]];
      }
    }
    if (!ring || ring.length < 3) {
      console.warn('Cannot save region: insufficient coordinates', ring);
      return;
    }

    // 确保 ring 闭合以及提取保存顶点
    const first = ring[0];
    const last = ring[ring.length - 1];
    const isClosed = first[0] === last[0] && first[1] === last[1];
    const closedRing = isClosed ? ring : [...ring, first];
    const rawCoords = isClosed ? ring.slice(0, -1) : ring;

    let areaKm2 = '0.00 km²';
    try {
      const poly = turf.polygon([closedRing]);
      const areaVal = turf.area(poly) / 1_000_000;
      areaKm2 = `${areaVal.toFixed(2)} km²`;
    } catch (e) {
      areaKm2 = '0.00 km²';
    }

    const shapeType = drawShapeTypeRef.current;
    const count = savedRegionsRef.current.length + 1;
    const regName = `${shapeType === 'circle' ? '圆形' : shapeType === 'rect' ? '矩形' : '区域'} ${count}`;

    const newRegion = {
      id: `region_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: regName,
      coordinates: rawCoords,
      areaKm2,
      color: drawColorRef.current,
      lineStyle: (isDashedLineRef.current ? 'dashed' : 'solid') as 'solid' | 'dashed',
      createdAt: Date.now()
    };

    const next = [...savedRegionsRef.current, newRegion];
    savedRegionsRef.current = next;
    setSavedRegions(next);
    try {
      localStorage.setItem('map-saved-drawn-regions', JSON.stringify(next));
    } catch (e) {}

    // 保存后这个图形就应该固定在地图上了，同时提示条就消失！
    clearActiveTipMarker();
    handleClearCurrentDraw();
    syncSavedRegionsGeoJson(next, false);
    window.dispatchEvent(new CustomEvent('saved-regions-updated', { detail: { regions: next } }));
  };

  const handleClearCurrentTool = () => {
    const mapInstance = map.current;
    if (activeMapTool === 'draw') {
      handleClearCurrentDraw();
    } else if (activeMapTool === 'measure') {
      setMeasurePoints([]);
      setMeasureTotalDistStr('');
      if (mapInstance) {
        const s = mapInstance.getSource('map-tool-measure-source') as maplibregl.GeoJSONSource;
        if (s) s.setData({ type: 'FeatureCollection', features: [] });
      }
    } else if (activeMapTool === 'inspect') {
      setInspectData(null);
      renderInspectMarker(null);
    }
  };

  const handleCloseCurrentTool = () => {
    isMovingShapeRef.current = false;
    isDraggingDrawRef.current = false;
    clearActiveTipMarker();
    if (map.current) {
      map.current.dragPan.enable();
      map.current.getCanvas().style.cursor = '';
    }
    handleClearCurrentTool();
    setActiveMapTool(null);
    window.dispatchEvent(new CustomEvent('map-tool-changed', { detail: { tool: null } }));
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
  };

  // 监听工具激活与切换
  useEffect(() => {
    const handleToolActivated = (e: Event) => {
      const customEvent = e as CustomEvent<{ tool: 'draw' | 'inspect' | 'measure' | null }>;
      const nextTool = customEvent.detail?.tool || null;
      setActiveMapTool(nextTool);

      const mapInstance = map.current;
      if (mapInstance) {
        const canvas = mapInstance.getCanvas();
        if (nextTool) {
          canvas.style.cursor = 'crosshair';
          ensureToolLayers(mapInstance);
        } else {
          canvas.style.cursor = '';
        }

        if (nextTool !== 'draw') {
          handleClearCurrentDraw();
        }
        if (nextTool !== 'measure') {
          setMeasurePoints([]);
          setMeasureTotalDistStr('');
          const measureSource = mapInstance.getSource('map-tool-measure-source') as maplibregl.GeoJSONSource;
          if (measureSource) measureSource.setData({ type: 'FeatureCollection', features: [] });
        }
        if (nextTool !== 'inspect') {
          setInspectData(null);
          renderInspectMarker(null);
        }
      }
    };

    window.addEventListener('map-tool-activated', handleToolActivated);
    return () => {
      window.removeEventListener('map-tool-activated', handleToolActivated);
    };
  }, []);

  // 当 activeMapTool 改变时，控制编辑与只读模式的切换（退出编辑不可新增也不可删除，只留图形在上面）
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;
    clearActiveTipMarker();
    if (mapInstance.isStyleLoaded()) {
      syncSavedRegionsGeoJson(savedRegionsRef.current, false);
    }
  }, [activeMapTool]);

  // 当颜色或线型在草稿状态下调整时实时更新草稿图形
  useEffect(() => {
    if (activeMapTool === 'draw' && draftRingCoords.length >= 3) {
      syncDrawGeoJson(drawPoints, draftRingCoords, drawColor, isDashedLine ? 'dashed' : 'solid');
      renderDraftActionMarker(draftRingCoords, drawShapeType, drawColor);
    }
  }, [drawColor, isDashedLine]);

  // Map canvas user interaction handlers for tools (支持圆、矩形拖拽绘制与已闭合图形拖拽平移)
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const handleCanvasMouseDown = (e: maplibregl.MapMouseEvent) => {
      const tool = activeMapToolRef.current;
      if (tool !== 'draw') return;

      const coord: [number, number] = [
        Number(e.lngLat.lng.toFixed(5)),
        Number(e.lngLat.lat.toFixed(5))
      ];

      // 1. 如果已有闭合草稿图形且鼠标点在草稿内部或边线上，进入“拖拽移动图形”模式
      if (isDrawClosedRef.current && draftRingCoordsRef.current.length >= 3) {
        if (isCoordInDraftShape(coord, draftRingCoordsRef.current)) {
          isMovingShapeRef.current = true;
          dragStartCoordRef.current = coord;
          initialDragRingRef.current = [...draftRingCoordsRef.current];
          initialDragPointsRef.current = [...drawPointsRef.current];
          dragCurrentRingRef.current = [...draftRingCoordsRef.current];
          dragCurrentPointsRef.current = [...drawPointsRef.current];
          mapInstance.dragPan.disable();
          mapInstance.getCanvas().style.cursor = 'grabbing';
          clearActiveTipMarker();
          return;
        }
      }

      // 2. 对于矩形与圆形，支持鼠标按下起始点并拖拽生成图形（交互式拖拽）
      // 圆形：第一个点为起始边界点！
      // 矩形：第一个点为起始角点！
      // 任意形状：完全由用户逐点点击确定多边形顶点！
      const shapeType = drawShapeTypeRef.current;
      if (shapeType === 'rect' || shapeType === 'circle') {
        isDraggingDrawRef.current = true;
        dragStartCoordRef.current = coord;
        dragCurrentRingRef.current = null;
        dragCurrentPointsRef.current = [coord];
        mapInstance.dragPan.disable();
        mapInstance.getCanvas().style.cursor = 'crosshair';
        clearActiveTipMarker();
      }
    };

    const handleCanvasMouseMove = (e: maplibregl.MapMouseEvent) => {
      const tool = activeMapToolRef.current;
      const coord: [number, number] = [
        Number(e.lngLat.lng.toFixed(5)),
        Number(e.lngLat.lat.toFixed(5))
      ];

      if (tool === 'inspect' && !inspectData) {
        const info = getInspectData(coord[0], coord[1]);
        renderInspectMarker(info);
        return;
      }

      if (tool === 'draw') {
        const shapeType = drawShapeTypeRef.current;

        // A. 正在拖拽平移已有闭合草稿图形
        if (isMovingShapeRef.current && dragStartCoordRef.current && initialDragRingRef.current) {
          const deltaLng = coord[0] - dragStartCoordRef.current[0];
          const deltaLat = coord[1] - dragStartCoordRef.current[1];

          const newRing: [number, number][] = initialDragRingRef.current.map(([lng, lat]) => [
            Number((lng + deltaLng).toFixed(5)),
            Number((lat + deltaLat).toFixed(5))
          ]);
          const newPoints: [number, number][] = (initialDragPointsRef.current || []).map(([lng, lat]) => [
            Number((lng + deltaLng).toFixed(5)),
            Number((lat + deltaLat).toFixed(5))
          ]);

          dragCurrentRingRef.current = newRing;
          dragCurrentPointsRef.current = newPoints;
          syncDrawGeoJson(newPoints, newRing, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
          return;
        }

        // B. 正在按住拖拽绘制矩形或圆形
        if (isDraggingDrawRef.current && dragStartCoordRef.current) {
          const p1 = dragStartCoordRef.current;
          const p2 = coord;

          if (shapeType === 'rect') {
            const ring = generateRectCoords(p1, p2);
            dragCurrentRingRef.current = ring;
            dragCurrentPointsRef.current = [p1, p2];
            syncDrawGeoJson([p1, p2], ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
          } else if (shapeType === 'circle') {
            // p1 为起始边界点，p2 为移动对向边界点（两点定直径）
            const ring = generateCircleFromBoundary(p1, p2);
            dragCurrentRingRef.current = ring;
            dragCurrentPointsRef.current = [p1, p2];
            syncDrawGeoJson([p1, p2], ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
          }
          return;
        }

        // C. 正在通过单步点击绘制过程中的动态光标与辅助预览
        if (!isDrawClosedRef.current) {
          const currentPoints = drawPointsRef.current;
          if (shapeType === 'polygon') {
            if (currentPoints.length === 1) {
              // 1个点：显示从点1到光标的橡皮筋线
              syncDrawGeoJson([currentPoints[0], coord], undefined, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
            } else if (currentPoints.length === 2) {
              // 2个点：移动光标时实时预览光标加入后构成的三角形闭合面与边界线
              const previewRing: [number, number][] = [currentPoints[0], currentPoints[1], coord, currentPoints[0]];
              syncDrawGeoJson([...currentPoints, coord], previewRing, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
            } else if (currentPoints.length >= 3) {
              // 3个及以上点：已形成图形，移动光标时预览加入当前光标后的闭合多边形
              const previewRing: [number, number][] = [...currentPoints, coord, currentPoints[0]];
              syncDrawGeoJson([...currentPoints, coord], previewRing, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
            }
          } else if (shapeType === 'rect' && currentPoints.length === 1) {
            // 单击起始角点后的对角点移动预览
            const ring = generateRectCoords(currentPoints[0], coord);
            syncDrawGeoJson([currentPoints[0], coord], ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
          } else if (shapeType === 'circle' && currentPoints.length === 1) {
            // 单击起始边界点后的对向边界点移动圆形预览
            const ring = generateCircleFromBoundary(currentPoints[0], coord);
            syncDrawGeoJson([currentPoints[0], coord], ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
          }
        }

        // D. 悬浮光标指示：
        // 1) 若悬浮在已闭合草稿图形上方，提示 grab 拖拽
        if (isDrawClosedRef.current && draftRingCoordsRef.current.length >= 3 && isCoordInDraftShape(coord, draftRingCoordsRef.current)) {
          mapInstance.getCanvas().style.cursor = 'grab';
          return;
        }

        // 2) 若悬浮在已保存的图形上方，提示 pointer（点击可弹出该图形提示条与删除按钮）
        const isOverSaved = savedRegionsRef.current.some(r => {
          if (!r.coordinates || r.coordinates.length < 3) return false;
          return isCoordInDraftShape(coord, [...r.coordinates, r.coordinates[0]]);
        });
        if (isOverSaved && drawPointsRef.current.length === 0 && !isDraggingDrawRef.current && !isMovingShapeRef.current) {
          mapInstance.getCanvas().style.cursor = 'pointer';
          return;
        }

        // 3) 默认十字标
        mapInstance.getCanvas().style.cursor = 'crosshair';
      }
    };

    const handleCanvasMouseUp = (e: maplibregl.MapMouseEvent) => {
      const tool = activeMapToolRef.current;
      if (tool !== 'draw') return;

      const coord: [number, number] = [
        Number(e.lngLat.lng.toFixed(5)),
        Number(e.lngLat.lat.toFixed(5))
      ];

      // A. 结束图形移动拖拽
      if (isMovingShapeRef.current) {
        isMovingShapeRef.current = false;
        mapInstance.dragPan.enable();
        mapInstance.getCanvas().style.cursor = 'grab';

        if (dragCurrentRingRef.current && dragCurrentRingRef.current.length >= 3) {
          const finalRing = dragCurrentRingRef.current;
          const finalPoints = dragCurrentPointsRef.current || drawPointsRef.current;
          setDraftRingCoords(finalRing);
          setDrawPoints(finalPoints);
          setIsDrawClosed(true);
          renderDraftActionMarker(finalRing, drawShapeTypeRef.current, drawColorRef.current);
        }

        wasJustDraggedRef.current = true;
        setTimeout(() => {
          wasJustDraggedRef.current = false;
        }, 150);
        return;
      }

      // B. 结束矩形或圆形的拖拽绘制
      if (isDraggingDrawRef.current) {
        isDraggingDrawRef.current = false;
        mapInstance.dragPan.enable();
        mapInstance.getCanvas().style.cursor = 'crosshair';

        const p1 = dragStartCoordRef.current;
        if (p1) {
          const distKm = (turf as any).distance(turf.point(p1), turf.point(coord), { units: 'kilometers' });
          // 如果拖拽位移大于 50 米，则认为完成了拖拽绘制！
          if (distKm > 0.05) {
            const shapeType = drawShapeTypeRef.current;
            if (shapeType === 'circle' || shapeType === 'rect') {
              const finalRing = shapeType === 'circle' 
                ? generateCircleFromBoundary(p1, coord) 
                : generateRectCoords(p1, coord);
              const finalPoints: [number, number][] = [p1, coord];
              setDraftRingCoords(finalRing);
              setDrawPoints(finalPoints);
              setIsDrawClosed(true);
              syncDrawGeoJson(finalPoints, finalRing, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
              renderDraftActionMarker(finalRing, shapeType, drawColorRef.current);

              wasJustDraggedRef.current = true;
              setTimeout(() => {
                wasJustDraggedRef.current = false;
              }, 150);
              return;
            }
          }
        }
        // 如果拖动距离极小（相当于原地点击），不标记 wasJustDragged，让后续 click 事件自然处理单步绘制
      }
    };

    const handleCanvasClick = (e: maplibregl.MapMouseEvent) => {
      // 如果刚完成拖拽，忽略紧随其后的 click 事件
      if (wasJustDraggedRef.current) return;

      const tool = activeMapToolRef.current;
      if (!tool) return;

      const coord: [number, number] = [
        Number(e.lngLat.lng.toFixed(5)),
        Number(e.lngLat.lat.toFixed(5))
      ];

      if (tool === 'draw') {
        const shapeType = drawShapeTypeRef.current;
        const currentPoints = drawPointsRef.current;

        // 若当前已有闭合草稿图形且点击在草稿内，保持当前图形
        if (isDrawClosedRef.current && draftRingCoordsRef.current.length >= 3) {
          if (isCoordInDraftShape(coord, draftRingCoordsRef.current)) {
            return;
          }
        }

        // 3. 在绘制区域功能打开的情况下，点击已保存的图形显示提示条，图形的提示条只能显示最新点击的那个！
        if (currentPoints.length === 0 || isDrawClosedRef.current) {
          const clickedSaved = savedRegionsRef.current.slice().reverse().find(r => {
            if (!r.coordinates || r.coordinates.length < 3) return false;
            return isCoordInDraftShape(coord, [...r.coordinates, r.coordinates[0]]);
          });

          if (clickedSaved) {
            handleClearCurrentDraw();
            renderSavedRegionTipMarker(clickedSaved);
            return;
          }
        }

        // 如果点击在空地上，且当前有提示条处于显示状态，关闭提示条
        clearActiveTipMarker();

        if (shapeType === 'polygon') {
          // 如果当前图形已经闭合，再次点击代表重新开始绘制新任意多边形
          if (isDrawClosedRef.current) {
            const next = [coord];
            setDrawPoints(next);
            setDraftRingCoords([]);
            setIsDrawClosed(false);
            setDrawAreaStr('');
            clearActiveTipMarker();
            syncDrawGeoJson(next, undefined, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
            return;
          }

          // 如果已经有至少3个点，且点击在第1个点附近，闭合多边形
          if (currentPoints.length >= 3) {
            const first = currentPoints[0];
            let distToFirst = 999;
            try {
              distToFirst = (turf as any).distance(turf.point(coord), turf.point(first), { units: 'kilometers' });
            } catch (e) {}

            if (distToFirst < 0.8) {
              setIsDrawClosed(true);
              const ring = [...currentPoints, currentPoints[0]];
              setDraftRingCoords(ring);
              syncDrawGeoJson(currentPoints, ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
              renderDraftActionMarker(ring, 'polygon', drawColorRef.current);
              return;
            }
          }

          // 用户点击添加新点（多边形顶点）
          const next = [...currentPoints, coord];
          setDrawPoints(next);

          if (next.length >= 3) {
            // 点了3个点（或更多）立刻显示闭合形状（带半透明填充、清晰3px边界线和操作徽章），形状完全由用户点击确定！
            const ring = [...next, next[0]];
            setDraftRingCoords(ring);
            syncDrawGeoJson(next, ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
            renderDraftActionMarker(ring, 'polygon', drawColorRef.current);
          } else {
            // 1个或2个点：显示点和连接引导线
            setDraftRingCoords([]);
            clearActiveTipMarker();
            syncDrawGeoJson(next, undefined, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
          }
          return;
        } else if (shapeType === 'rect') {
          if (currentPoints.length === 0 || isDrawClosedRef.current) {
            // 第一个点作为起始角点，同时立即呈现带边界线的矩形预览，而不是只有点！
            const defaultP2: [number, number] = [
              Number((coord[0] + 0.16).toFixed(5)),
              Number((coord[1] + 0.12).toFixed(5))
            ];
            const previewRing = generateRectCoords(coord, defaultP2);
            const next = [coord];
            setDrawPoints(next);
            setDraftRingCoords(previewRing);
            setIsDrawClosed(false);
            clearActiveTipMarker();
            syncDrawGeoJson(next, previewRing, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
          } else {
            const p1 = currentPoints[0];
            const p2 = coord;
            const ring = generateRectCoords(p1, p2);
            setDrawPoints([p1, p2]);
            setDraftRingCoords(ring);
            setIsDrawClosed(true);
            syncDrawGeoJson([p1, p2], ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
            renderDraftActionMarker(ring, 'rect', drawColorRef.current);
          }
        } else if (shapeType === 'circle') {
          if (currentPoints.length === 0 || isDrawClosedRef.current) {
            // 第一个点是确定的起始边界点，同时立即呈现带边界线的圆形几何预览，而不是只有点！
            const defaultP2: [number, number] = [
              Number((coord[0] + 0.14).toFixed(5)),
              Number((coord[1] + 0.14).toFixed(5))
            ];
            const previewRing = generateCircleFromBoundary(coord, defaultP2);
            const next = [coord];
            setDrawPoints(next);
            setDraftRingCoords(previewRing);
            setIsDrawClosed(false);
            clearActiveTipMarker();
            syncDrawGeoJson(next, previewRing, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
          } else {
            // 第二个点是对向边界点，以这两点连线作为直径生成圆！
            const p1 = currentPoints[0];
            const p2 = coord;
            const ring = generateCircleFromBoundary(p1, p2);
            setDrawPoints([p1, p2]);
            setDraftRingCoords(ring);
            setIsDrawClosed(true);
            syncDrawGeoJson([p1, p2], ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
            renderDraftActionMarker(ring, 'circle', drawColorRef.current);
          }
        }
      } else if (tool === 'measure') {
        const next = [...measurePointsRef.current, coord];
        setMeasurePoints(next);
        syncMeasureGeoJson(next);
      } else if (tool === 'inspect') {
        const info = getInspectData(coord[0], coord[1]);
        setInspectData(info);
        renderInspectMarker(info);
      }
    };

    const handleCanvasDblClick = (e: maplibregl.MapMouseEvent) => {
      const tool = activeMapToolRef.current;
      if (!tool) return;
      e.preventDefault();

      if (tool === 'draw') {
        const shapeType = drawShapeTypeRef.current;
        if (shapeType === 'polygon') {
          const currentPoints = drawPointsRef.current;
          if (currentPoints.length >= 3 && !isDrawClosedRef.current) {
            setIsDrawClosed(true);
            const ring = [...currentPoints, currentPoints[0]];
            setDraftRingCoords(ring);
            syncDrawGeoJson(currentPoints, ring, drawColorRef.current, isDashedLineRef.current ? 'dashed' : 'solid');
            renderDraftActionMarker(ring, 'polygon', drawColorRef.current);
          }
        }
      }
    };

    // 全局 mouseup 兜底，防止鼠标拖出地图容器后释放卡死
    const handleGlobalMouseUp = () => {
      if (isMovingShapeRef.current || isDraggingDrawRef.current) {
        isMovingShapeRef.current = false;
        isDraggingDrawRef.current = false;
        mapInstance.dragPan.enable();
      }
    };

    mapInstance.on('mousedown', handleCanvasMouseDown);
    mapInstance.on('mousemove', handleCanvasMouseMove);
    mapInstance.on('mouseup', handleCanvasMouseUp);
    mapInstance.on('click', handleCanvasClick);
    mapInstance.on('dblclick', handleCanvasDblClick);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      mapInstance.off('mousedown', handleCanvasMouseDown);
      mapInstance.off('mousemove', handleCanvasMouseMove);
      mapInstance.off('mouseup', handleCanvasMouseUp);
      mapInstance.off('click', handleCanvasClick);
      mapInstance.off('dblclick', handleCanvasDblClick);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [inspectData]);

  return (
    <div className={`absolute inset-0 z-0 ${activeNav === '效果评估' ? 'map-effect-eval-mode' : ''}`}>
      <div ref={mapContainer} className="w-full h-full bg-slate-200" />

      {/* 简洁的小操作面板（严格按照用户截图与指令设计） */}
      {activeMapTool === 'draw' && (
        <div className={`absolute ${activeNav === '效果评估' ? 'top-3' : 'top-[76px]'} left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl shadow-xl border border-slate-200/90 p-3 select-none pointer-events-auto animate-fade-in font-sans w-[305px] flex flex-col gap-2.5`}>
          {/* 标题栏 */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm tracking-wide">绘制区域</span>
            <button
              onClick={handleCloseCurrentTool}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xs cursor-pointer transition-colors"
              title="退出编辑"
            >
              ✕
            </button>
          </div>

          {/* 第一行：形状选择 [ 圆形 ] [ 矩形 ] [ 任意形状 ] */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                setDrawShapeType('circle');
                handleClearCurrentDraw();
              }}
              className={`h-8 rounded-xl border flex items-center justify-center gap-1 text-[11.5px] transition-all cursor-pointer ${
                drawShapeType === 'circle'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full border border-current inline-block shrink-0" />
              <span>圆形</span>
            </button>

            <button
              onClick={() => {
                setDrawShapeType('rect');
                handleClearCurrentDraw();
              }}
              className={`h-8 rounded-xl border flex items-center justify-center gap-1 text-[11.5px] transition-all cursor-pointer ${
                drawShapeType === 'rect'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="w-3.5 h-3.5 border border-current rounded-[2px] inline-block shrink-0" />
              <span>矩形</span>
            </button>

            <button
              onClick={() => {
                setDrawShapeType('polygon');
                handleClearCurrentDraw();
              }}
              className={`h-8 rounded-xl border flex items-center justify-center gap-1 text-[11.5px] transition-all cursor-pointer ${
                drawShapeType === 'polygon'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <line x1="8" y1="2" x2="8" y2="4.5" />
                <line x1="8" y1="11.5" x2="8" y2="14" />
                <line x1="2" y1="8" x2="4.5" y2="8" />
                <line x1="11.5" y1="8" x2="14" y2="8" />
                <line x1="3.8" y1="3.8" x2="5.5" y2="5.5" />
                <line x1="10.5" y1="10.5" x2="12.2" y2="12.2" />
              </svg>
              <span>任意形状</span>
            </button>
          </div>

          {/* 第二行：操作按钮 [ 撤销 ] [ 清空 ] [ 颜色选择 ] [ 虚实线型 ] [ 保存 ] */}
          <div className="flex items-center gap-2 relative">
            {/* 撤销上点 */}
            <button
              onClick={handleUndoLastDrawPoint}
              disabled={drawPoints.length === 0}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center text-slate-700 transition-all ${
                drawPoints.length > 0 
                  ? 'border-slate-200 bg-white hover:bg-slate-100 hover:text-blue-600 cursor-pointer shadow-xs active:scale-95' 
                  : 'border-slate-200/60 bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
              title="撤销上一点"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14 4 9l5-5"/>
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
              </svg>
            </button>

            {/* 清空草稿 */}
            <button
              onClick={handleClearCurrentDraw}
              disabled={drawPoints.length === 0}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center text-slate-700 transition-all ${
                drawPoints.length > 0 
                  ? 'border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 cursor-pointer shadow-xs active:scale-95' 
                  : 'border-slate-200/60 bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
              title="清空当前草稿"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>

            {/* 颜色色块选择器 */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all"
                title="选择图形填充与线条颜色"
              >
                <div className="w-5 h-5 rounded-[4px] shadow-xs" style={{ backgroundColor: drawColor }} />
              </button>
              {showColorPicker && (
                <div className="absolute top-10 left-0 z-50 bg-white/98 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-1.5 flex items-center gap-1.5 animate-fade-in">
                  {['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setDrawColor(c);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-md cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${drawColor === c ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 线型切换 (~ 波浪/虚实) */}
            <button
              onClick={() => setIsDashedLine(!isDashedLine)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                isDashedLine
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title={isDashedLine ? '当前：虚线（点击切换为实线）' : '当前：实线（点击切换为虚线）'}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M2 12c3-6 5 6 8 0s5 6 8 0 3-3 4-2" />
              </svg>
            </button>

            {/* 保存当前区域按钮 */}
            <button
              onClick={() => handleSaveCurrentRegion()}
              disabled={!(draftRingCoords.length >= 3 || drawPoints.length >= 3)}
              className={`h-8 px-2.5 rounded-xl border flex items-center justify-center gap-1 text-[11.5px] font-bold transition-all ml-auto ${
                (draftRingCoords.length >= 3 || drawPoints.length >= 3)
                  ? 'border-blue-600 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs active:scale-95'
                  : 'border-slate-200/60 bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
              title="完成并保存当前绘制区域"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>保存</span>
            </button>
          </div>

          {/* 操作提示说明 */}
          <div className="text-[10.5px] text-slate-400 font-sans px-0.5 pt-0.5 leading-tight text-center border-t border-slate-100">
            {drawShapeType === 'circle' && '确定起始边界点，拖拽或点击对向边界点完成'}
            {drawShapeType === 'rect' && '确定起始角点，拖拽或点击对角点完成'}
            {drawShapeType === 'polygon' && '连续点击绘制顶点，双击或点击首点闭合'}
          </div>
        </div>
      )}

      {/* 测距 / 鼠标取值顶部浮动控制条 */}
      {(activeMapTool === 'measure' || activeMapTool === 'inspect') && (
        <div className={`absolute ${activeNav === '效果评估' ? 'top-3' : 'top-[76px]'} left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-white/95 backdrop-blur-md text-slate-800 px-4 py-2 rounded-full shadow-xl border border-slate-200/90 text-xs animate-fade-in pointer-events-auto`}>
          <div className="flex items-center gap-1.5 font-bold">
            {activeMapTool === 'inspect' && (
              <>
                <Crosshair className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-blue-700">鼠标取值</span>
              </>
            )}
            {activeMapTool === 'measure' && (
              <>
                <Ruler className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-amber-700">测距工具</span>
              </>
            )}
          </div>

          <span className="w-px h-3.5 bg-slate-200 mx-0.5" />

          <div className="text-[11px] text-slate-600 max-w-[320px] truncate">
            {activeMapTool === 'measure' && (
              measurePoints.length === 0 
                ? '在地图上单击设置起点（起点为 0 km）' 
                : `已选 ${measurePoints.length} 点，累加测距总长: ${measureTotalDistStr || '0 km'}`
            )}
            {activeMapTool === 'inspect' && (
              inspectData 
                ? `已锁定 [${inspectData.coord[0]}°E, ${inspectData.coord[1]}°N] ${inspectData.weatherName}: ${inspectData.weatherValue}` 
                : '单击地图任意点位查看经纬度与叠加气象值'
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={handleClearCurrentTool}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-[10.5px] font-medium cursor-pointer transition-colors"
            >
              清除
            </button>
            <button
              onClick={handleCloseCurrentTool}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-[11px] font-bold cursor-pointer transition-colors"
              title="退出工具"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 效果评估右上角操作按钮：复位视角（纯二维显示） */}
      {activeNav === '效果评估' && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 select-none pointer-events-auto">
          <button
            onClick={handleResetEvaluationView}
            className="w-7 h-7 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-md shadow-sm hover:bg-slate-50 hover:border-blue-300 active:scale-95 flex items-center justify-center transition-all cursor-pointer group"
            title="复位视角"
          >
            <RotateCcw className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      )}
    </div>
  );
}
