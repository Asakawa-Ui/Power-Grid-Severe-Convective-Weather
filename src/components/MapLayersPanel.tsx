import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  Pentagon,
  Crosshair,
  Ruler
} from 'lucide-react';
import { cachedSelectedProductKeys } from './LeftPanel';

interface MapLayersPanelProps {
  activeNav: string;
  isCaseMode: boolean;
  playbackMinutes: number;
  normalMinutes: number;
}

export interface MapLayersVisibility {
  siteMobile: boolean;
  siteFixed: boolean;
  siteRocket: boolean;
  siteGun: boolean;
  mobileRocket?: boolean;
  mobileGun?: boolean;
  fixedRocket?: boolean;
  fixedGun?: boolean;
  temporary?: boolean;
  stateNone?: boolean;
  stateReady?: boolean;
  stateOperating?: boolean;
  stateCompleted?: boolean;
  stateCanceled?: boolean;
  line1000: boolean;
  line500: boolean;
  line220: boolean;
  lineBuffer: boolean;
  weatherOverlay: boolean;
  // Equipment Mode Layer toggles
  eqLightning: boolean;
  eqElectricField: boolean;
  eqSounding: boolean;
  eqRadar: boolean;
  eqSatellite: boolean;
  eqGun: boolean;
  eqRocket: boolean;
  eqVehicle: boolean;
}

const getProductResolution = (catId: string, subclass: string): number => {
  if (catId === 'lightning' || catId === 'warning') return 1;
  if (catId === 'rain') return 5;
  if (catId === 'radar') return 6;
  if (catId === 'forecast') return 30;
  if (catId === 'satellite') {
    if (subclass.includes('葵花')) return 10;
    if (subclass.includes('风云')) return 15;
    return 10;
  }
  if (catId === 'actual') {
    if (subclass.includes('1km')) return 5;
    if (subclass.includes('5km')) return 10;
    return 5;
  }
  return 5;
};

export default function MapLayersPanel({
  activeNav,
  isCaseMode,
  playbackMinutes,
  normalMinutes
}: MapLayersPanelProps) {
  // Granular leaf-level visibility state
  const [visibility, setVisibility] = useState<MapLayersVisibility>(() => {
    const defaultState = {
      siteMobile: true,
      siteFixed: true,
      siteRocket: true,
      siteGun: true,
      line1000: true,
      line500: true,
      line220: true,
      lineBuffer: true,
      weatherOverlay: true,
      eqLightning: true,
      eqElectricField: true,
      eqSounding: true,
      eqRadar: true,
      eqSatellite: true,
      eqGun: true,
      eqRocket: true,
      eqVehicle: true,
    };
    const saved = localStorage.getItem('map-layers-visibility-granular');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      } catch (e) {}
    }
    return defaultState;
  });

  // Active map tool: 'draw' | 'inspect' | 'measure' | null
  const [activeTool, setActiveTool] = useState<'draw' | 'inspect' | 'measure' | null>(null);

  // Saved regions state synced with Map3D and localStorage
  const [savedRegions, setSavedRegions] = useState<Array<{
    id: string;
    name: string;
    coordinates: [number, number][];
    areaKm2: string;
    createdAt: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem('map-saved-drawn-regions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const handleSavedRegionsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ regions: any[] }>;
      if (customEvent.detail?.regions) {
        setSavedRegions(customEvent.detail.regions);
      }
    };
    window.addEventListener('saved-regions-updated', handleSavedRegionsUpdated);
    return () => {
      window.removeEventListener('saved-regions-updated', handleSavedRegionsUpdated);
    };
  }, []);

  // Accordion open/collapse states (In 效果评估, only weather is expanded by default, others are collapsed)
  const [expanded, setExpanded] = useState(() => {
    if (activeNav === '效果评估') {
      return {
        mapTools: false,
        siteTypes: false,
        states: false,
        lines: false,
        weather: true,
      };
    }
    return {
      mapTools: true,
      siteTypes: true,
      states: true,
      lines: true,
      weather: true,
    };
  });

  useEffect(() => {
    if (activeNav === '效果评估') {
      setExpanded(prev => ({
        ...prev,
        mapTools: false,
        siteTypes: false,
        lines: false,
        weather: true,
      }));
    }
  }, [activeNav]);

  // Listen to external tool changes or clearances from map HUD
  useEffect(() => {
    const handleToolChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ tool: 'draw' | 'inspect' | 'measure' | null }>;
      if (customEvent.detail) {
        setActiveTool(customEvent.detail.tool);
      }
    };
    window.addEventListener('map-tool-changed', handleToolChanged);
    return () => {
      window.removeEventListener('map-tool-changed', handleToolChanged);
    };
  }, []);

  // When switching navigation away, clear tool for 装备管理
  useEffect(() => {
    if (activeNav === '装备管理') {
      setActiveTool(null);
      window.dispatchEvent(new CustomEvent('map-tool-activated', { detail: { tool: null } }));
    }
  }, [activeNav]);

  // Ensure 效果评估 has radar actual overlay active by default
  useEffect(() => {
    if (activeNav === '效果评估') {
      const radarKey = 'radar|雷达实况|全国组网组合反射率';
      if (!selectedKeys.includes(radarKey)) {
        const next = [radarKey, ...selectedKeys];
        setSelectedKeys(next);
        window.dispatchEvent(new CustomEvent('product-select-changed', { detail: next }));
      }
    }
  }, [activeNav]);

  const toggleMapTool = (tool: 'draw' | 'inspect' | 'measure') => {
    const nextTool = activeTool === tool ? null : tool;
    setActiveTool(nextTool);
    window.dispatchEvent(new CustomEvent('map-tool-activated', { detail: { tool: nextTool } }));
  };

  // Active weather overlays state (synced with LeftPanel)
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => {
    if (activeNav === '效果评估' && !cachedSelectedProductKeys.includes('radar|雷达实况|全国组网组合反射率')) {
      return ['radar|雷达实况|全国组网组合反射率', ...cachedSelectedProductKeys];
    }
    return cachedSelectedProductKeys;
  });

  useEffect(() => {
    const handleProductChange = (e: Event) => {
      const customEvent = e as CustomEvent<string[] | null>;
      setSelectedKeys(customEvent.detail || []);
    };
    window.addEventListener('product-select-changed', handleProductChange);
    return () => {
      window.removeEventListener('product-select-changed', handleProductChange);
    };
  }, []);

  // Broadcast and save visibility state
  useEffect(() => {
    localStorage.setItem('map-layers-visibility-granular', JSON.stringify(visibility));
    (window as any).mapLayersVisibilityGranular = visibility;
    window.dispatchEvent(new CustomEvent('map-layers-visibility-changed', { detail: visibility }));
  }, [visibility]);

  const toggleLeaf = (key: keyof MapLayersVisibility) => {
    setVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleExpand = (key: keyof typeof expanded) => {
    setExpanded(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getProductTimeStr = (key: string) => {
    const [catId, subclass] = key.split('|');
    const totalMinutes = isCaseMode ? (playbackMinutes + 15 * 60) : normalMinutes;
    
    const res = getProductResolution(catId, subclass);
    const snappedMinutes = Math.floor(totalMinutes / res) * res;
    const h = Math.floor(snappedMinutes / 60) % 24;
    const m = snappedMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleToggleProduct = (key: string) => {
    const nextKeys = selectedKeys.filter(k => k !== key);
    window.dispatchEvent(new CustomEvent('product-select-changed', { detail: nextKeys }));
  };

  const rightPosition = (activeNav === '作业指挥' || activeNav === '装备管理') ? 'right-[408px]' : 'right-[368px]';

  if (activeNav === '效果评估') {
    const isRadarChecked = selectedKeys.includes('radar|雷达实况|全国组网组合反射率');
    const handleRadarToggle = () => {
      const radarKey = 'radar|雷达实况|全国组网组合反射率';
      let nextKeys: string[];
      if (isRadarChecked) {
        nextKeys = selectedKeys.filter(k => k !== radarKey);
      } else {
        nextKeys = [radarKey, ...selectedKeys];
      }
      setSelectedKeys(nextKeys);
      window.dispatchEvent(new CustomEvent('product-select-changed', { detail: nextKeys }));
    };

    return (
      <div 
        className="absolute bottom-[72px] right-3 z-40 w-[114px] flex flex-col gap-1 select-none pointer-events-auto transition-all duration-300 max-h-[calc(100%-86px)] overflow-y-auto scrollbar-none"
        id="map-layers-accordion-panel"
      >
        {/* Category 1: 地图工具 */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleExpand('mapTools')}
            className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-slate-800">地图工具</span>
            {expanded.mapTools ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {expanded.mapTools && (
            <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-1">
              {/* 1. 绘制区域 */}
              <button
                onClick={() => toggleMapTool('draw')}
                className={`w-full flex items-center justify-between px-1.5 py-1 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                  activeTool === 'draw' 
                    ? 'bg-blue-600 text-white font-bold shadow-xs' 
                    : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-700'
                }`}
                title="在地图上多点绘制区域并自动计算面积"
              >
                <div className="flex items-center gap-1 truncate">
                  <Pentagon className="w-3 h-3 shrink-0" />
                  <span className="truncate">绘制区域</span>
                </div>
                {activeTool === 'draw' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
              </button>

              {/* 2. 鼠标取值 */}
              <button
                onClick={() => toggleMapTool('inspect')}
                className={`w-full flex items-center justify-between px-1.5 py-1 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                  activeTool === 'inspect' 
                    ? 'bg-blue-600 text-white font-bold shadow-xs' 
                    : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-700'
                }`}
                title="移动或单击地图查看经纬度、高程及雷达反射率"
              >
                <div className="flex items-center gap-1 truncate">
                  <Crosshair className="w-3 h-3 shrink-0" />
                  <span className="truncate">鼠标取值</span>
                </div>
                {activeTool === 'inspect' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
              </button>

              {/* 3. 测距 */}
              <button
                onClick={() => toggleMapTool('measure')}
                className={`w-full flex items-center justify-between px-1.5 py-1 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                  activeTool === 'measure' 
                    ? 'bg-blue-600 text-white font-bold shadow-xs' 
                    : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-700'
                }`}
                title="在地图上连续选点进行距离测量"
              >
                <div className="flex items-center gap-1 truncate">
                  <Ruler className="w-3 h-3 shrink-0" />
                  <span className="truncate">测距工具</span>
                </div>
                {activeTool === 'measure' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
              </button>

              {/* 已保存区域列表 */}
              {savedRegions.length > 0 && (
                <div className="pt-1 mt-0.5 border-t border-slate-200/70 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[9px] text-slate-500 px-0.5">
                    <span className="font-semibold text-slate-700">已存区域 ({savedRegions.length})</span>
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('map-saved-regions-action', { detail: { action: 'clear' } }));
                      }}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer text-[8px]"
                    >
                      清空
                    </button>
                  </div>
                  <div className="max-h-24 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
                    {savedRegions.map((reg) => (
                      <div 
                        key={reg.id} 
                        className="flex items-center justify-between px-1 py-0.5 text-[8.5px] bg-blue-50/80 border border-blue-100 rounded text-slate-700 group hover:bg-blue-100/70 transition-colors"
                      >
                        <span className="truncate max-w-[48px] font-medium text-blue-900" title={reg.name}>{reg.name}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span className="text-slate-400 font-mono text-[7.5px]">{reg.areaKm2}</span>
                          <button
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('map-saved-regions-action', { detail: { action: 'delete', id: reg.id } }));
                            }}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5 text-[8.5px] leading-none"
                            title="删除"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category 2: 作业点类型 */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleExpand('siteTypes')}
            className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-slate-800">作业点类型</span>
            {expanded.siteTypes ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>
          
          {expanded.siteTypes && (
            <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-1">
              <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-1">
                <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-700">
                  <input 
                    type="checkbox"
                    checked={visibility.siteMobile !== false}
                    onChange={() => toggleLeaf('siteMobile')}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <span className="truncate">移动点</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-700">
                  <input 
                    type="checkbox"
                    checked={visibility.siteFixed !== false}
                    onChange={() => toggleLeaf('siteFixed')}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <span className="truncate">固定点</span>
                </label>
              </div>

              <div className="flex flex-col gap-0.5 pt-0.5">
                <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-700">
                  <input 
                    type="checkbox"
                    checked={visibility.siteRocket !== false}
                    onChange={() => toggleLeaf('siteRocket')}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <svg width="10" height="10" viewBox="0 0 14 14" className="overflow-visible text-blue-500 shrink-0">
                    <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  <span className="truncate">火箭弹</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-700">
                  <input 
                    type="checkbox"
                    checked={visibility.siteGun !== false}
                    onChange={() => toggleLeaf('siteGun')}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <svg width="10" height="10" viewBox="0 0 14 14" className="overflow-visible text-orange-500 shrink-0">
                    <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  <span className="truncate">高炮</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Category 3: 输电线路 */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleExpand('lines')}
            className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-slate-800">输电线路</span>
            {expanded.lines ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {expanded.lines && (
            <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-0.5">
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.line1000}
                  onChange={() => toggleLeaf('line1000')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <div className="w-3.5 h-0.5 bg-[#ef4444] shrink-0 rounded-sm" />
                <span className="truncate">1000kV</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.line500}
                  onChange={() => toggleLeaf('line500')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <div className="w-3.5 h-0.5 bg-[#22c55e] shrink-0 rounded-sm" />
                <span className="truncate">±500kV</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.line220}
                  onChange={() => toggleLeaf('line220')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <div className="w-3.5 h-0.5 bg-[#0ea5e9] shrink-0 rounded-sm" />
                <span className="truncate">220kV</span>
              </label>
            </div>
          )}
        </div>

        {/* Category 4: 气象数据 (默认叠加雷达实况) */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleExpand('weather')}
            className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-slate-800">气象数据</span>
            {expanded.weather ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {expanded.weather && (
            <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-0.5">
              {/* 雷达实况-全国组网组合反射率 (默认勾选) */}
              <label className="flex items-start gap-1 cursor-pointer text-[9.5px] font-medium text-slate-600 p-0.5 hover:bg-slate-50 rounded">
                <input 
                  type="checkbox"
                  checked={isRadarChecked}
                  onChange={handleRadarToggle}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer mt-[2px]"
                />
                <span className="font-bold text-slate-800 text-[9.5px] leading-tight break-all whitespace-normal">
                  雷达实况-全国组网组合反射率 <span className="font-mono text-slate-500 font-normal">({getProductTimeStr('radar|雷达实况|全国组网组合反射率')})</span>
                </span>
              </label>

              {/* 其他可能叠加的产品 */}
              {selectedKeys.filter(k => k !== 'radar|雷达实况|全国组网组合反射率').map((key) => {
                const [, subclass, productName] = key.split('|');
                const label = `${subclass}-${productName}`;
                const timeStr = getProductTimeStr(key);
                return (
                  <label key={key} className="flex items-start gap-1 cursor-pointer text-[9.5px] font-medium text-slate-600 p-0.5 hover:bg-slate-50 rounded">
                    <input 
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggleProduct(key)}
                      className="w-2.5 h-2.5 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer mt-[2.5px]"
                    />
                    <span className="font-bold text-slate-700 text-[9.5px] leading-tight break-all whitespace-normal" title={label}>
                      {label} <span className="font-mono text-slate-500 font-normal">({timeStr})</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeNav === '装备管理') {
    return (
      <div 
        className={`absolute bottom-[116px] ${rightPosition} z-40 w-[104px] flex flex-col gap-1 select-none pointer-events-auto transition-all duration-300`}
        id="map-layers-accordion-panel"
      >
        {/* Category 1: 气象监测装置 */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleExpand('siteTypes')}
            className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-slate-800">气象监测装置</span>
            {expanded.siteTypes ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>
          
          {expanded.siteTypes && (
            <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-1">
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.eqLightning}
                  onChange={() => toggleLeaf('eqLightning')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">雷电探测</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.eqElectricField}
                  onChange={() => toggleLeaf('eqElectricField')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">大气电场</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.eqSounding}
                  onChange={() => toggleLeaf('eqSounding')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">三维探空</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.eqRadar}
                  onChange={() => toggleLeaf('eqRadar')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">气象雷达</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.eqSatellite}
                  onChange={() => toggleLeaf('eqSatellite')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">卫星云图</span>
              </label>
            </div>
          )}
        </div>

        {/* Category 2: 作业装备 */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleExpand('states')}
            className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-slate-800">作业装备</span>
            {expanded.states ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {expanded.states && (
            <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-1">
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.eqGun}
                  onChange={() => toggleLeaf('eqGun')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">高炮</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.eqRocket}
                  onChange={() => toggleLeaf('eqRocket')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">火箭弹</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.eqVehicle}
                  onChange={() => toggleLeaf('eqVehicle')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">作业车</span>
              </label>
            </div>
          )}
        </div>

        {/* Category 3: 输电线路 */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleExpand('lines')}
            className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-slate-800">输电线路</span>
            {expanded.lines ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {expanded.lines && (
            <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-0.5">
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.line1000}
                  onChange={() => toggleLeaf('line1000')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <div className="w-3.5 h-0.5 bg-[#ef4444] shrink-0 rounded-sm" />
                <span className="truncate">1000kV</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.line500}
                  onChange={() => toggleLeaf('line500')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <div className="w-3.5 h-0.5 bg-[#22c55e] shrink-0 rounded-sm" />
                <span className="truncate">±500kV</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
                <input 
                  type="checkbox"
                  checked={visibility.line220}
                  onChange={() => toggleLeaf('line220')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <div className="w-3.5 h-0.5 bg-[#0ea5e9] shrink-0 rounded-sm" />
                <span className="truncate">220kV</span>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`absolute bottom-[116px] ${rightPosition} z-40 w-[110px] flex flex-col gap-1 select-none pointer-events-auto transition-all duration-300`}
      id="map-layers-accordion-panel"
    >
      {/* Category 0: 地图工具 */}
      <div className="flex flex-col">
        <button 
          onClick={() => toggleExpand('mapTools')}
          className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-bold">地图工具</span>
          {expanded.mapTools ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>

        {expanded.mapTools && (
          <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-1">
            {/* 1. 绘制区域 */}
            <button
              onClick={() => toggleMapTool('draw')}
              className={`w-full flex items-center justify-between px-1.5 py-1 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                activeTool === 'draw' 
                  ? 'bg-blue-600 text-white font-bold shadow-xs' 
                  : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-700'
              }`}
              title="在地图上多点绘制区域并自动计算面积"
            >
              <div className="flex items-center gap-1 truncate">
                <Pentagon className="w-3 h-3 shrink-0" />
                <span className="truncate">绘制区域</span>
              </div>
              {activeTool === 'draw' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            </button>

            {/* 2. 鼠标取值 */}
            <button
              onClick={() => toggleMapTool('inspect')}
              className={`w-full flex items-center justify-between px-1.5 py-1 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                activeTool === 'inspect' 
                  ? 'bg-blue-600 text-white font-bold shadow-xs' 
                  : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-700'
              }`}
              title="移动或单击地图查看经纬度、高程及雷达反射率"
            >
              <div className="flex items-center gap-1 truncate">
                <Crosshair className="w-3 h-3 shrink-0" />
                <span className="truncate">鼠标取值</span>
              </div>
              {activeTool === 'inspect' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            </button>

            {/* 3. 测距 */}
            <button
              onClick={() => toggleMapTool('measure')}
              className={`w-full flex items-center justify-between px-1.5 py-1 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                activeTool === 'measure' 
                  ? 'bg-blue-600 text-white font-bold shadow-xs' 
                  : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-700'
              }`}
              title="在地图上连续选点进行距离测量"
            >
              <div className="flex items-center gap-1 truncate">
                <Ruler className="w-3 h-3 shrink-0" />
                <span className="truncate">测距工具</span>
              </div>
              {activeTool === 'measure' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            </button>

            {/* 已保存区域列表 */}
            {savedRegions.length > 0 && (
              <div className="pt-1 mt-0.5 border-t border-slate-200/70 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px] text-slate-500 px-0.5">
                  <span className="font-semibold text-slate-700">已存区域 ({savedRegions.length})</span>
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('map-saved-regions-action', { detail: { action: 'clear' } }));
                    }}
                    className="text-rose-500 hover:text-rose-700 cursor-pointer text-[8px]"
                  >
                    清空
                  </button>
                </div>
                <div className="max-h-24 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
                  {savedRegions.map((reg) => (
                    <div 
                      key={reg.id} 
                      className="flex items-center justify-between px-1 py-0.5 text-[8.5px] bg-blue-50/80 border border-blue-100 rounded text-slate-700 group hover:bg-blue-100/70 transition-colors"
                    >
                      <span className="truncate max-w-[48px] font-medium text-blue-900" title={reg.name}>{reg.name}</span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <span className="text-slate-400 font-mono text-[7.5px]">{reg.areaKm2}</span>
                        <button
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('map-saved-regions-action', { detail: { action: 'delete', id: reg.id } }));
                          }}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5 text-[8.5px] leading-none"
                          title="删除"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category 1: 作业点类型 */}
      <div className="flex flex-col">
        <button 
          onClick={() => toggleExpand('siteTypes')}
          className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-bold">作业点类型</span>
          {expanded.siteTypes ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>
        
        {expanded.siteTypes && (
          <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-1">
            {/* 移动点 & 固定点 勾选筛选 */}
            <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-1">
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-700">
                <input 
                  type="checkbox"
                  checked={visibility.siteMobile !== false}
                  onChange={() => toggleLeaf('siteMobile')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">移动点</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-700">
                <input 
                  type="checkbox"
                  checked={visibility.siteFixed !== false}
                  onChange={() => toggleLeaf('siteFixed')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <span className="truncate">固定点</span>
              </label>
            </div>

            {/* 火箭弹 (圆形) & 高炮 (方形) 勾选筛选与图例 */}
            <div className="flex flex-col gap-0.5 pt-0.5">
              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-700">
                <input 
                  type="checkbox"
                  checked={visibility.siteRocket !== false}
                  onChange={() => toggleLeaf('siteRocket')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <svg width="10" height="10" viewBox="0 0 14 14" className="overflow-visible text-blue-500 shrink-0">
                  <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span className="truncate">火箭弹</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-700">
                <input 
                  type="checkbox"
                  checked={visibility.siteGun !== false}
                  onChange={() => toggleLeaf('siteGun')}
                  className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <svg width="10" height="10" viewBox="0 0 14 14" className="overflow-visible text-orange-500 shrink-0">
                  <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span className="truncate">高炮</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Category 2: 作业状态 (无勾选功能，纯状态图例展示) */}
      {activeNav !== '监测预警' && (
        <div className="flex flex-col">
          <button 
            onClick={() => toggleExpand('states')}
            className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold">作业状态</span>
            {expanded.states ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {expanded.states && (
            <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-0.5 select-none">
              <div className="flex items-center gap-1 p-0.5 text-[9.5px] font-medium text-slate-600">
                <div className="w-3 h-3 shrink-0" aria-hidden="true" />
                <div className="w-2 h-2 rounded-full bg-[#94a3b8] shrink-0" />
                <span className="truncate">无状态</span>
              </div>

              <div className="flex items-center gap-1 p-0.5 text-[9.5px] font-medium text-slate-600">
                <div className="w-3 h-3 shrink-0" aria-hidden="true" />
                <div className="w-2 h-2 rounded-full bg-[#84b676] shrink-0" />
                <span className="truncate">就绪</span>
              </div>

              <div className="flex items-center gap-1 p-0.5 text-[9.5px] font-medium text-slate-600">
                <div className="w-3 h-3 shrink-0" aria-hidden="true" />
                <div className="w-2 h-2 rounded-full bg-[#e3d122] shrink-0" />
                <span className="truncate">作业</span>
              </div>

              <div className="flex items-center gap-1 p-0.5 text-[9.5px] font-medium text-slate-600">
                <div className="w-3 h-3 shrink-0" aria-hidden="true" />
                <div className="w-2 h-2 rounded-full bg-[#8b10ec] shrink-0" />
                <span className="truncate">完成</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category 3: 输电线路 */}
      <div className="flex flex-col">
        <button 
          onClick={() => toggleExpand('lines')}
          className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-bold">输电线路</span>
          {expanded.lines ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>

        {expanded.lines && (
          <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-0.5">
            <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
              <input 
                type="checkbox"
                checked={visibility.line1000}
                onChange={() => toggleLeaf('line1000')}
                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="w-3.5 h-0.5 bg-[#ef4444] shrink-0 rounded-sm" />
              <span className="truncate">1000kV</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
              <input 
                type="checkbox"
                checked={visibility.line500}
                onChange={() => toggleLeaf('line500')}
                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="w-3.5 h-0.5 bg-[#22c55e] shrink-0 rounded-sm" />
              <span className="truncate">±500kV</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
              <input 
                type="checkbox"
                checked={visibility.line220}
                onChange={() => toggleLeaf('line220')}
                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="w-3.5 h-0.5 bg-[#0ea5e9] shrink-0 rounded-sm" />
              <span className="truncate">220kV</span>
            </label>
          </div>
        )}
      </div>

      {/* Category 4: 气象数据 */}
      <div className="flex flex-col">
        <button 
          onClick={() => toggleExpand('weather')}
          className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-bold">气象数据</span>
          {expanded.weather ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>

        {expanded.weather && (
          <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-0.5">
            {selectedKeys.length === 0 ? (
              <div className="text-center py-1.5 text-[9px] font-medium text-slate-400 select-none bg-slate-50/50 rounded border border-dashed border-slate-200/30">
                暂无叠加
              </div>
            ) : (
              selectedKeys.map((key) => {
                const [, subclass, productName] = key.split('|');
                const label = `${subclass}-${productName}`;
                const timeStr = getProductTimeStr(key);
                
                return (
                  <label key={key} className="flex items-start gap-1 cursor-pointer text-[9.5px] font-medium text-slate-600 p-0.5 hover:bg-slate-50 rounded">
                    <input 
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggleProduct(key)}
                      className="w-2.5 h-2.5 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer mt-[2.5px]"
                    />
                    <span className="font-bold text-slate-700 text-[9.5px] leading-tight break-all whitespace-normal" title={label}>
                      {label} <span className="font-mono text-slate-500 font-normal">({timeStr})</span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

    </div>
  );
}
