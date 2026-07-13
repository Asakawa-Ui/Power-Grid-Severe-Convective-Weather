import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, Layers } from 'lucide-react';
import { cachedSelectedProductKey } from './LeftPanel';

interface DataLayersPanelProps {
  activeNav: string;
  isCaseMode: boolean;
  playbackMinutes: number;
  normalMinutes: number;
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
  return 5; // Default fallback
};

export default function DataLayersPanel({
  activeNav,
  isCaseMode,
  playbackMinutes,
  normalMinutes
}: DataLayersPanelProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(() => cachedSelectedProductKey);
  const [hiddenKeys, setHiddenKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleProductChange = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setSelectedKey(customEvent.detail);
    };
    window.addEventListener('product-select-changed', handleProductChange);
    return () => {
      window.removeEventListener('product-select-changed', handleProductChange);
    };
  }, []);

  if (activeNav !== '监测预警') return null;

  // Calculate current total minutes
  const totalMinutes = isCaseMode ? (playbackMinutes + 15 * 60) : normalMinutes;

  // Format date based on mode
  const formattedDate = isCaseMode ? '06-18' : '07-07';

  // Construct overlaid layers list (no default radar reflection layer as requested)
  const layersList = [];

  if (selectedKey) {
    const [catId, subclass, productName] = selectedKey.split('|');
    layersList.push({
      catId,
      subclass,
      productName,
      label: `${subclass}-${productName}`,
      key: selectedKey
    });
  }

  // Calculate snapped times
  const processedLayers = layersList.map((layer) => {
    const res = getProductResolution(layer.catId, layer.subclass);
    const snappedMinutes = Math.floor(totalMinutes / res) * res;
    const h = Math.floor(snappedMinutes / 60) % 24;
    const m = snappedMinutes % 60;
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    return {
      key: layer.key,
      label: layer.label,
      time: `${formattedDate} ${timeStr}`
    };
  });

  const toggleVisibility = (key: string) => {
    setHiddenKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDelete = (key: string) => {
    // Clear global selection
    window.dispatchEvent(new CustomEvent('product-select-changed', { detail: null }));
  };

  const rightPosition = 'right-[356px]';

  return (
    <div className={`absolute bottom-[242px] ${rightPosition} z-40 w-[340px] bg-white/75 backdrop-blur-md px-4 py-3 flex flex-col gap-2 rounded-xl text-slate-700 border border-slate-200/60 transition-all duration-300`}>
      <div className="flex items-center pb-1.5 border-b border-slate-200/40">
        <span className="text-[11.5px] font-extrabold tracking-wide text-slate-800">数据图层</span>
      </div>
      
      {processedLayers.length === 0 ? (
        <div className="text-center py-1.5 text-[10.5px] font-bold text-slate-400 select-none">
          暂无叠加数据图层
        </div>
      ) : (
        <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto pr-0.5 scrollbar-thin">
          {processedLayers.map((layer) => {
            const isHidden = !!hiddenKeys[layer.key];
            return (
              <div 
                key={layer.key} 
                className={`flex items-center justify-between py-1.5 px-1.5 rounded-lg transition-all ${
                  isHidden ? 'opacity-45 bg-slate-50/50' : 'hover:bg-slate-100/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    onClick={() => toggleVisibility(layer.key)}
                    className="text-slate-400 hover:text-blue-500 p-0.5 rounded transition-colors shrink-0"
                    title={isHidden ? "显示图层" : "隐藏图层"}
                  >
                    {isHidden ? (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </button>
                  <span className={`text-[10.5px] font-bold truncate ${
                    isHidden ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}>
                    {layer.label}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-4">
                  <span className="font-mono text-[10.5px] text-slate-500 font-bold select-none">
                    {layer.time}
                  </span>
                  <button
                    onClick={() => handleDelete(layer.key)}
                    className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors shrink-0"
                    title="移除图层"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
