import React, { useState } from 'react';
import { cn } from '../lib/utils';
import {
  Satellite,
  Radar,
  Activity,
  CloudRain,
  LineChart,
  CloudLightning,
  AlertTriangle
} from 'lucide-react';

const mainCategories = [
  { id: 'satellite', name: '卫星', icon: Satellite },
  { id: 'radar', name: '雷达', icon: Radar },
  { id: 'actual', name: '实况', icon: Activity },
  { id: 'rain', name: '降水', icon: CloudRain },
  { id: 'forecast', name: '数值预报', icon: LineChart },
  { id: 'lightning', name: '雷电', icon: CloudLightning },
  { id: 'warning', name: '预警信息', icon: AlertTriangle },
];

const subProducts = Array.from({ length: 6 }, (_, i) => `子产品${i + 1}`);

export default function LeftPanel() {
  const [activeMain, setActiveMain] = useState('satellite');
  const [activeSub, setActiveSub] = useState('子产品5');

  return (
    <div className="absolute top-24 left-6 z-40 flex gap-2">
      {/* Main Categories Column */}
      <div className="flex flex-col gap-2 w-24">
        {mainCategories.map((cat) => {
          const isActive = activeMain === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveMain(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center p-3 h-20 bg-white shadow-md border-l-4 transition-all duration-200",
                isActive 
                  ? "border-blue-500 text-blue-600 bg-slate-50" 
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-blue-500"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", isActive ? "text-blue-500" : "text-slate-400")} />
              <span className="text-sm font-medium">
                {cat.name}
                {isActive && <span className="block text-xs font-normal opacity-70">(选中)</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub Products Column */}
      <div className="flex flex-col w-48 bg-white/80 backdrop-blur-sm shadow-lg p-2 gap-2 h-fit">
        {subProducts.map((sub) => {
          const isActive = activeSub === sub;
          return (
            <button
              key={sub}
              onClick={() => setActiveSub(sub)}
              className={cn(
                "w-full text-left px-4 py-3 text-sm transition-colors",
                isActive 
                  ? "bg-slate-200 text-slate-800 font-medium" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {sub} {isActive && '(选中状态)'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
