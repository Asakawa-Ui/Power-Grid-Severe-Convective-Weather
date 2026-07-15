import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2 
} from 'lucide-react';
import { cachedSelectedProductKeys } from './LeftPanel';

interface MapLayersPanelProps {
  activeNav: string;
  isCaseMode: boolean;
  playbackMinutes: number;
  normalMinutes: number;
}

export interface MapLayersVisibility {
  mobileRocket: boolean;
  mobileGun: boolean;
  fixedRocket: boolean;
  fixedGun: boolean;
  temporary: boolean;
  stateNone: boolean;
  stateReady: boolean;
  stateOperating: boolean;
  stateCompleted: boolean;
  stateCanceled: boolean;
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
      mobileRocket: true,
      mobileGun: true,
      fixedRocket: true,
      fixedGun: true,
      temporary: true,
      stateNone: true,
      stateReady: true,
      stateOperating: true,
      stateCompleted: true,
      stateCanceled: true,
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

  // Accordion open/collapse states
  const [expanded, setExpanded] = useState({
    siteTypes: true,
    states: true,
    lines: true,
    weather: true,
  });

  // Active weather overlays state (synced with LeftPanel)
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => cachedSelectedProductKeys);

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

  if (activeNav === '效果评估') return null;

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
      className={`absolute bottom-[116px] ${rightPosition} z-40 w-[104px] flex flex-col gap-1 select-none pointer-events-auto transition-all duration-300`}
      id="map-layers-accordion-panel"
    >
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
          <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-1.5">
            {/* 移动点 */}
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-1">
              <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-700">
                <svg width="10" height="10" viewBox="0 0 14 14" className="overflow-visible text-blue-500 shrink-0">
                  <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>移动点</span>
              </div>
              <div className="flex items-center gap-2 pl-1.5">
                <label className="flex items-center gap-0.5 cursor-pointer hover:text-blue-600 rounded text-[9px] font-medium text-slate-500">
                  <input 
                    type="checkbox"
                    checked={visibility.mobileRocket}
                    onChange={() => toggleLeaf('mobileRocket')}
                    className="w-2.5 h-2.5 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <span>火箭</span>
                </label>
                <label className="flex items-center gap-0.5 cursor-pointer hover:text-blue-600 rounded text-[9px] font-medium text-slate-500">
                  <input 
                    type="checkbox"
                    checked={visibility.mobileGun}
                    onChange={() => toggleLeaf('mobileGun')}
                    className="w-2.5 h-2.5 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <span>高炮</span>
                </label>
              </div>
            </div>

            {/* 固定点 */}
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-1">
              <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-700">
                <svg width="10" height="10" viewBox="0 0 14 14" className="overflow-visible text-blue-500 shrink-0">
                  <rect x="1" y="1" width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>固定点</span>
              </div>
              <div className="flex items-center gap-2 pl-1.5">
                <label className="flex items-center gap-0.5 cursor-pointer hover:text-blue-600 rounded text-[9px] font-medium text-slate-500">
                  <input 
                    type="checkbox"
                    checked={visibility.fixedRocket}
                    onChange={() => toggleLeaf('fixedRocket')}
                    className="w-2.5 h-2.5 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <span>火箭</span>
                </label>
                <label className="flex items-center gap-0.5 cursor-pointer hover:text-blue-600 rounded text-[9px] font-medium text-slate-500">
                  <input 
                    type="checkbox"
                    checked={visibility.fixedGun}
                    onChange={() => toggleLeaf('fixedGun')}
                    className="w-2.5 h-2.5 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <span>高炮</span>
                </label>
              </div>
            </div>

            {/* 临时点 */}
            <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-700 pl-0.5">
              <svg width="10" height="10" viewBox="0 0 14 14" className="overflow-visible text-blue-500 shrink-0">
                <polygon points="7,1 13,11 1,11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span>临时点</span>
            </div>
          </div>
        )}
      </div>

      {/* Category 2: 作业状态 */}
      <div className="flex flex-col">
        <button 
          onClick={() => toggleExpand('states')}
          className="flex items-center justify-between w-full h-7 px-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-bold">作业状态</span>
          {expanded.states ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>

        {expanded.states && (
          <div className="mt-0.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded p-1 flex flex-col gap-0.5">
            <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
              <input 
                type="checkbox"
                checked={visibility.stateNone}
                onChange={() => toggleLeaf('stateNone')}
                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="w-2 h-2 rounded-full bg-[#94a3b8] shrink-0" />
              <span className="truncate">无状态</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
              <input 
                type="checkbox"
                checked={visibility.stateReady}
                onChange={() => toggleLeaf('stateReady')}
                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="w-2 h-2 rounded-full bg-[#84b676] shrink-0" />
              <span className="truncate">就绪</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
              <input 
                type="checkbox"
                checked={visibility.stateOperating}
                onChange={() => toggleLeaf('stateOperating')}
                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="w-2 h-2 rounded-full bg-[#e3d122] shrink-0" />
              <span className="truncate">作业</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
              <input 
                type="checkbox"
                checked={visibility.stateCompleted}
                onChange={() => toggleLeaf('stateCompleted')}
                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="w-2 h-2 rounded-full bg-[#8b10ec] shrink-0" />
              <span className="truncate">完成</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-slate-50 rounded text-[9.5px] font-medium text-slate-600">
              <input 
                type="checkbox"
                checked={visibility.stateCanceled}
                onChange={() => toggleLeaf('stateCanceled')}
                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="w-2 h-2 rounded-full bg-[#df5a5a] shrink-0" />
              <span className="truncate">取消</span>
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
