import React from 'react';
import { cn } from '../lib/utils';
import { ShieldAlert, ChevronDown } from 'lucide-react';

const navItems = ['监测预警', '作业指挥', '效果评估', '装备管理', '作业管理'];

interface HeaderProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isCaseMode: boolean;
  onModeChange: (caseMode: boolean) => void;
  playbackMinutes: number;
  normalMinutes: number;
}

export default function Header({ 
  activeNav, 
  setActiveNav,
  isCaseMode,
  onModeChange,
  playbackMinutes,
  normalMinutes
}: HeaderProps) {
  
  // Format playback time helper
  const formatTime = (totalMinutes: number, baseHour = 0) => {
    const mins = totalMinutes + baseHour * 60;
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
  };

  const formattedDate = isCaseMode ? '2026年06月18日' : '2026年07月07日';
  const formattedTime = isCaseMode ? formatTime(playbackMinutes, 15) : formatTime(normalMinutes, 0);

  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md shadow-md z-50 flex items-center justify-between px-6 border-b border-slate-200/80">
      <div className="flex items-center gap-4 w-[280px] shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md border border-blue-400">
          <ShieldAlert className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-wide">
          电网强对流<span className="text-blue-600">干预系统</span>
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
        
        {/* Real-time / Case Study Mode Switcher */}
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
            个例
          </button>
        </div>

        {/* Case Selector Dropdown */}
        {isCaseMode && (
          <div className="relative animate-fade-in flex items-center">
            <select
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
              defaultValue="2026-06-18"
            >
              <option value="2026-06-18">2026年6月18日湖北黄石</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
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
