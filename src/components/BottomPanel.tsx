import React from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function BottomPanel() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md shadow-2xl px-6 py-4 rounded-2xl flex items-center gap-6 border border-slate-200/60">
      
      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
        <input 
          type="text" 
          value="2025年10月23日" 
          readOnly
          className="bg-white border border-slate-200 px-3 py-1.5 text-sm text-slate-700 w-32 outline-none rounded shadow-sm font-medium"
        />
        <input 
          type="text" 
          value="08:00" 
          readOnly
          className="bg-white border border-slate-200 px-3 py-1.5 text-sm text-slate-700 w-[72px] outline-none rounded shadow-sm text-center font-mono font-medium"
        />
      </div>

      <div className="flex items-center gap-2 text-blue-600">
        <button className="p-2 hover:bg-blue-50 rounded-full transition-colors active:bg-blue-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="p-2.5 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors active:bg-blue-300 shadow-sm text-blue-700">
          <Play className="w-5 h-5" fill="currentColor" />
        </button>
        <button className="p-2 hover:bg-blue-50 rounded-full transition-colors active:bg-blue-100">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="w-[480px] relative flex items-center h-10 ml-2">
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-200 rounded-full shadow-inner" />
        
        {/* Tick marks */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1">
          {Array.from({ length: 24 }).map((_, i) => (
             <div key={i} className="flex flex-col items-center">
               <div className="w-[2px] h-2 bg-slate-300 rounded-full" />
               {i % 4 === 0 && <span className="absolute mt-4 text-[10px] text-slate-400 font-mono">{String(i).padStart(2, '0')}:00</span>}
             </div>
          ))}
        </div>

        {/* Current Time Indicator */}
        <div className="absolute left-[33%] top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
          <div className="bg-blue-600 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md shadow-md -mt-12 whitespace-nowrap opacity-100 transition-transform transform group-hover:-translate-y-1">
            10/23 08:00
          </div>
          <div className="w-1 h-8 bg-blue-500 mt-1 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>
      </div>
    </div>
  );
}
