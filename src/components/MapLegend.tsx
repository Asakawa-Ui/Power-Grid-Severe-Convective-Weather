import React, { useState, useEffect, useRef } from 'react';
import { cachedSelectedProductKeys } from './LeftPanel';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

// CMA standard radar reflectivity color scale (5 to 70 dBZ)
const RADAR_LEGEND_DATA = [
  { value: '5', color: '#4da0f8' },
  { value: '10', color: '#7be7f8' },
  { value: '15', color: '#9dfc75' },
  { value: '20', color: '#47da33' },
  { value: '25', color: '#2f9e25' },
  { value: '30', color: '#fef64c' },
  { value: '35', color: '#eec335' },
  { value: '40', color: '#f6922d' },
  { value: '45', color: '#ea3323' },
  { value: '50', color: '#bc1b1b' },
  { value: '55', color: '#7c0f0f' },
  { value: '60', color: '#f21df2' },
  { value: '65', color: '#8e1aa0' },
  { value: '70', color: '#b09af8' },
];

interface MapLegendProps {
  activeNav?: string;
  activeRegion?: string;
  isCaseMode?: boolean;
  playbackMinutes?: number;
  normalMinutes?: number;
  position?: 'bottom-left' | 'top-left';
}

const DEFAULT_RADAR_KEY = 'radar|雷达实况|全国组网组合反射率';

export default function MapLegend({
  activeNav,
  isCaseMode = false,
  playbackMinutes = 0,
  normalMinutes = 1080,
  position
}: MapLegendProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => {
    return (cachedSelectedProductKeys && cachedSelectedProductKeys.length > 0)
      ? cachedSelectedProductKeys
      : [DEFAULT_RADAR_KEY];
  });
  const [collapsed, setCollapsed] = useState(false);
  const [opacity, setOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('map-weather-opacity');
      if (saved !== null) {
        const val = Number(saved);
        if (!isNaN(val) && val >= 0 && val <= 100) return val;
      }
    } catch (e) {}
    return 80;
  });
  const lastActiveKeyRef = useRef<string>(DEFAULT_RADAR_KEY);

  useEffect(() => {
    const handleProductChange = (e: Event) => {
      const customEvent = e as CustomEvent<string[] | null>;
      const keys = customEvent.detail || [];
      setSelectedKeys(keys);
      if (keys.length > 0) {
        lastActiveKeyRef.current = keys[0];
      }
    };
    window.addEventListener('product-select-changed', handleProductChange);
    return () => {
      window.removeEventListener('product-select-changed', handleProductChange);
    };
  }, []);

  // Sync initial opacity to map
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('weather-opacity-changed', {
      detail: {
        opacity: opacity / 100,
        percentage: opacity
      }
    }));
  }, []);

  // Do not show on equipment management pages
  if (activeNav === '装备管理') {
    return null;
  }

  const getProductTimeStr = (key: string) => {
    const [catId, subclass] = key.split('|');
    const totalMinutes = isCaseMode ? (playbackMinutes + 15 * 60) : normalMinutes;
    const res = getProductResolution(catId, subclass || '');
    const snappedMinutes = Math.floor(totalMinutes / res) * res;
    const h = Math.floor(snappedMinutes / 60) % 24;
    const m = snappedMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const isChecked = selectedKeys.length > 0;
  const currentKey = selectedKeys[0] || lastActiveKeyRef.current || DEFAULT_RADAR_KEY;
  const [, subclass, productName] = currentKey.split('|');
  const displayLabel = subclass && productName ? `${subclass}-${productName}` : '雷达实况-全国组网组合反射率';
  const timeStr = getProductTimeStr(currentKey);

  const handleToggleCurrent = () => {
    let nextKeys: string[];
    if (isChecked) {
      lastActiveKeyRef.current = currentKey;
      nextKeys = [];
    } else {
      nextKeys = [lastActiveKeyRef.current || DEFAULT_RADAR_KEY];
    }
    setSelectedKeys(nextKeys);
    window.dispatchEvent(new CustomEvent('product-select-changed', { detail: nextKeys }));
  };

  const handleToggleKey = (key: string) => {
    let nextKeys: string[];
    if (selectedKeys.includes(key)) {
      nextKeys = selectedKeys.filter(k => k !== key);
    } else {
      nextKeys = [key, ...selectedKeys];
    }
    setSelectedKeys(nextKeys);
    window.dispatchEvent(new CustomEvent('product-select-changed', { detail: nextKeys }));
  };

  const handleOpacityChange = (val: number) => {
    setOpacity(val);
    try {
      localStorage.setItem('map-weather-opacity', String(val));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('weather-opacity-changed', {
      detail: {
        opacity: val / 100,
        percentage: val
      }
    }));
  };

  const isRadar = currentKey.includes('radar') || currentKey.includes('雷达') || currentKey.includes('反射率');
  const isTopLeft = position === 'top-left' || (!position && activeNav === '效果评估');

  return (
    <div
      className={`absolute ${isTopLeft ? 'top-3 left-3' : 'bottom-[88px] left-6'} z-30 select-none pointer-events-auto transition-all duration-300 font-sans animate-fade-in`}
      id="map-bottom-left-legend"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 px-3.5 py-2.5 flex flex-col gap-2 min-w-[320px] max-w-[360px]">
        {/* Header with Checkbox & Title & Time */}
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-800 tracking-wide select-none group">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleToggleCurrent}
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer accent-blue-600"
            />
            <span className={`transition-colors ${isChecked ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`}>
              {displayLabel}
            </span>
            <span className="font-mono text-slate-500 font-normal text-[10px]">
              ({timeStr})
            </span>
          </label>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100 transition-colors shrink-0"
            title={collapsed ? '展开图例' : '收起图例'}
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Additional overlaid weather products if any */}
        {selectedKeys.length > 1 && (
          <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
            {selectedKeys.slice(1).map((key) => {
              const [, sub, prod] = key.split('|');
              const extraLabel = `${sub}-${prod}`;
              const extraTime = getProductTimeStr(key);
              return (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => handleToggleKey(key)}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 cursor-pointer accent-blue-600"
                  />
                  <span>{extraLabel}</span>
                  <span className="font-mono text-slate-400 font-normal">({extraTime})</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Radar Scale Content: Show when not collapsed */}
        {!collapsed && isRadar && (
          <div className={`flex items-center gap-2 pt-0.5 transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
            <div className="flex-1 flex flex-col">
              {/* Color Swatch Bar with live Opacity preview */}
              <div
                className="grid grid-cols-[repeat(14,minmax(0,1fr))] h-3.5 rounded-[2px] overflow-hidden shadow-2xs border border-slate-200/70 transition-opacity duration-150"
                style={{ opacity: isChecked ? Math.max(0.2, opacity / 100) : 0.3 }}
              >
                {RADAR_LEGEND_DATA.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-full border-r border-white/60 last:border-r-0"
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>

              {/* Tick Values */}
              <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] pt-1 text-[9px] font-mono font-medium text-slate-600 text-center">
                {RADAR_LEGEND_DATA.map((item, idx) => (
                  <span key={idx} className="truncate">
                    {item.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Unit */}
            <span className="text-[10px] font-mono font-bold text-slate-700 shrink-0 self-start mt-0.5">
              dBZ
            </span>
          </div>
        )}

        {/* Opacity Adjustment Row: Show when not collapsed */}
        {!collapsed && (
          <div className={`flex items-center gap-2 pt-1.5 border-t border-slate-100/90 transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <span className="text-[10px] font-medium text-slate-500 shrink-0 select-none">
              不透明度
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={opacity}
              disabled={!isChecked}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${opacity}%, #e2e8f0 ${opacity}%, #e2e8f0 100%)`
              }}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              title={`调整不透明度: ${opacity}%`}
            />
            <span className="text-[10.5px] font-mono font-bold text-slate-700 w-8 text-right select-none">
              {opacity}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
