import React from 'react';
import { cn } from '../lib/utils';
import { ShieldAlert, Bell, Settings } from 'lucide-react';

const navItems = ['监测预警', '作业指挥', '效果评估', '装备管理', '作业管理'];

export default function Header({ activeNav, setActiveNav }: { activeNav: string, setActiveNav: (nav: string) => void }) {
  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md shadow-md z-50 flex items-center justify-between px-6 border-b border-slate-200/80">
      <div className="flex items-center gap-4 w-[360px]">
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

      <div className="flex items-center justify-end gap-6 w-[360px]">
        <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
          <div className="flex flex-col items-end">
            <span className="text-[15px] font-bold font-mono text-slate-800">09:56:32</span>
            <span className="text-[11px] text-slate-500 font-medium">2024年05月21日</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 ml-2 cursor-pointer hover:ring-2 ring-blue-500 transition-all">
             <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
