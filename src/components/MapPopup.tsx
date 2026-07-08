import React from 'react';
import { X } from 'lucide-react';
import { WeatherPoint } from '../utils/weatherPoints';

export default function MapPopup({ point, onClose }: { point: WeatherPoint | null, onClose: () => void }) {
  if (!point) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-[200px] -translate-y-1/2 z-50 bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/80 rounded-xl w-[460px] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-50 to-white px-4 py-3 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
          <span className="text-slate-800 text-[14px] font-bold tracking-wider">作业点详情</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors ml-auto">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 flex gap-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 flex-1 items-start content-start">
          <div className="flex text-xs items-center border-b border-slate-50 pb-1 col-span-2">
            <span className="w-[60px] text-slate-500 mr-2 font-medium shrink-0">编号:</span>
            <span className="text-slate-800 font-medium font-mono">{point.id.replace('wp-', '1301270')}</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1 col-span-2">
            <span className="w-[60px] text-slate-500 mr-2 font-medium shrink-0">名称:</span>
            <span className="text-slate-800 font-medium truncate" title={point.name}>{point.name}</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1 col-span-2">
            <span className="w-[60px] text-slate-500 mr-2 font-medium shrink-0">地理位置:</span>
            <span className="text-slate-800 font-medium truncate">湖北 十堰市</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1 col-span-2">
            <span className="w-[60px] text-slate-500 mr-2 font-medium shrink-0">详细地址:</span>
            <span className="text-slate-800 font-medium truncate" title={`十堰市${point.name}内`}>十堰市{point.name}内</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1">
            <span className="w-[40px] text-slate-500 mr-2 font-medium shrink-0">类型:</span>
            <span className="text-slate-800 font-medium truncate">{point.type === 'rocket' ? '火箭' : point.type === 'gun' ? '高炮' : '作业车'}</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1">
            <span className="w-[40px] text-slate-500 mr-2 font-medium shrink-0">装备:</span>
            <span className="text-slate-800 font-medium truncate" title="WR-98型">WR-98型</span>
          </div>
        </div>
        
        <div className="w-[140px] h-[105px] bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-200/80 shadow-inner group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=300" 
            alt="实时监控画面" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
            <span className="text-[10px] text-slate-700 bg-white/90 px-2 py-1 rounded-full font-medium shadow-sm">点击放大</span>
          </div>
          <div className="absolute bottom-1 right-1 bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white/90 font-mono">
            实时画面
          </div>
        </div>
      </div>
    </div>
  );
}
