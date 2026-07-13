import React from 'react';

interface WeatherLegendProps {
  activeNav: string;
}

export default function WeatherLegend({ activeNav }: WeatherLegendProps) {
  const statuses = [
    { label: '无状态', color: 'text-[#94a3b8]' },
    { label: '就绪', color: 'text-[#84b676]' },
    { label: '作业', color: 'text-[#e3d122]' },
    { label: '完成', color: 'text-[#8b10ec]' },
    { label: '取消', color: 'text-[#df5a5a]' },
  ];

  const shapes = [
    { 
      label: '火箭弹', 
      svg: (
        <svg width="14" height="14" viewBox="0 0 14 14" className="overflow-visible text-[#94a3b8]" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
          <circle cx="7" cy="7" r="6" fill="currentColor" stroke="white" strokeWidth="1.5" />
        </svg>
      )
    },
    { 
      label: '高炮', 
      svg: (
        <svg width="14" height="14" viewBox="0 0 14 14" className="overflow-visible text-[#94a3b8]" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
          <polygon points="7,1 13,12 1,12" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    },
    { 
      label: '作业车', 
      svg: (
        <svg width="14" height="14" viewBox="0 0 14 14" className="overflow-visible text-[#94a3b8]" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>
          <rect x="1" y="1" width="12" height="12" rx="1.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
        </svg>
      )
    },
  ];

  const lines = [
    { label: '1000kV', color: 'bg-[#ef4444]' },
    { label: '±500kV', color: 'bg-[#22c55e]' },
    { label: '220kV', color: 'bg-[#0ea5e9]' },
  ];

  const warnings = [
    { label: '红色', border: 'border-[#dc2626]', bg: 'bg-[#ef4444]/30' },
    { label: '橙色', border: 'border-[#ea580c]', bg: 'bg-[#f97316]/30' },
    { label: '黄色', border: 'border-[#ca8a04]', bg: 'bg-[#eab308]/30' },
  ];

  const rightPosition = activeNav === '作业指挥' ? 'right-[396px]' : 'right-[356px]';

  return (
    <div className={`absolute bottom-[116px] ${rightPosition} z-40 bg-white/75 backdrop-blur-md px-4 py-3 flex flex-col gap-2.5 rounded-xl text-slate-700 border border-slate-200/60 whitespace-nowrap transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <span className="text-[10.5px] font-bold tracking-wider text-slate-500 w-12 text-right shrink-0">状态</span>
        <div className="flex items-center gap-3.5">
          {statuses.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full shadow-inner border border-black/5 bg-current ${s.color}`} />
              <span className="text-[10.5px] font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10.5px] font-bold tracking-wider text-slate-500 w-12 text-right shrink-0">类型</span>
        <div className="flex items-center gap-3.5">
          {shapes.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 flex items-center justify-center filter drop-shadow-sm">
                {s.svg}
              </div>
              <span className="text-[10.5px] font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10.5px] font-bold tracking-wider text-slate-500 w-12 text-right shrink-0">输电线路</span>
        <div className="flex items-center gap-3.5">
          {lines.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-3.5 h-0.5 ${l.color}`} />
              <span className="text-[10.5px] font-medium">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-1 border-l border-slate-200 pl-3">
            <div className="w-5 h-2.5 bg-blue-100 flex flex-col justify-center items-center rounded-sm border border-blue-200">
               <div className="w-5 h-0.5 bg-blue-500"></div>
            </div>
            <span className="text-[10.5px] font-medium text-slate-700">保护区</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10.5px] font-bold tracking-wider text-slate-500 w-12 text-right shrink-0">预警区域</span>
        <div className="flex items-center gap-3.5">
          {warnings.map((w) => (
            <div key={w.label} className="flex items-center gap-1.5">
              <div className={`w-4 h-2.5 border skew-x-[-20deg] ${w.border} ${w.bg}`} />
              <span className="text-[10.5px] font-medium">{w.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
