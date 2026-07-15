import React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

const navItems = ['监测预警', '作业指挥', '效果评估', '装备管理'];

interface HeaderProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isCaseMode: boolean;
  onModeChange: (caseMode: boolean) => void;
  playbackMinutes: number;
  normalMinutes: number;
  activeCaseId?: string;
  setActiveCaseId?: (caseId: string) => void;
}

export default function Header({ 
  activeNav, 
  setActiveNav,
  isCaseMode,
  onModeChange,
  playbackMinutes,
  normalMinutes,
  activeCaseId = '2026-06-18',
  setActiveCaseId
}: HeaderProps) {
  
  // Format playback time helper
  const formatTime = (totalMinutes: number, baseHour = 0) => {
    const mins = totalMinutes + baseHour * 60;
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
  };

  const showCaseTime = isCaseMode && activeNav !== '装备管理';
  const formattedDate = showCaseTime 
    ? (activeCaseId === '2026-07-02' ? '2026年07月02日' : '2026年06月18日')
    : '2026年07月07日';
  const formattedTime = showCaseTime ? formatTime(playbackMinutes, 15) : formatTime(normalMinutes, 0);

  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md shadow-md z-50 flex items-center justify-between px-6 border-b border-slate-200/80">
      <div className="flex items-center gap-4 shrink-0">
        <h1 className="text-xl font-bold text-slate-800 tracking-wide">
          电网强对流灾害人工干预作业指挥系统
        </h1>
      </div>

      <nav className="flex-1 flex justify-center h-full">
        <ul className="flex items-center gap-2 h-full">
          {navItems.map((item) => {
            const isActive = activeNav === item;
            return (
              <li
                key={item}
                onClick={() => setActiveNav(item)}
                className={cn(
                  "h-[40px] px-6 rounded-full flex items-center justify-center cursor-pointer text-[15px] font-medium transition-all duration-300",
                  isActive 
                    ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                {item}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Right control section - flexible width up to 480px to accommodate buttons cleanly */}
      <div className="flex items-center justify-end gap-4 max-w-[500px] shrink-0">
        
        {/* Case Selector Dropdown */}
        {isCaseMode && activeNav !== '监测预警' && activeNav !== '装备管理' && (
          <div className="relative animate-fade-in flex items-center">
            <select
              value={activeCaseId}
              onChange={(e) => setActiveCaseId?.(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
            >
              <option value="2026-06-18">2026年6月18日湖北黄石个例</option>
              <option value="2026-07-02">2026年7月02日江苏南京个例 (新布局)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
          </div>
        )}

        {/* Real-time / Case Study Mode Switcher */}
        {activeNav !== '监测预警' && activeNav !== '装备管理' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => onModeChange(false)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 select-none",
                !isCaseMode 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50/50"
              )}
            >
              实况
            </button>
            <button
              onClick={() => onModeChange(true)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 select-none",
                isCaseMode 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50/50"
              )}
            >
              历史
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 pr-2">
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-bold font-mono text-slate-800 tracking-wider leading-none">{formattedTime}</span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 leading-none">{formattedDate}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
