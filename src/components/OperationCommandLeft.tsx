import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Clock, Rocket, ArrowUpRight, Navigation, ShieldAlert, Box } from 'lucide-react';

const statsData = [
  { time: '12:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 25 },
  { time: '13:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 12 },
  { time: '14:00', rocketOps: 0, rocketAmmo: 0, gunOps: 3, gunAmmo: 30 },
  { time: '15:00', rocketOps: 3, rocketAmmo: 24, gunOps: 0, gunAmmo: 0 },
  { time: '16:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 20 },
  { time: '17:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 10 },
  { time: '18:00', rocketOps: 1, rocketAmmo: 8, gunOps: 1, gunAmmo: 15 },
];

export default function OperationCommandLeft() {
  return (
    <div className="absolute top-24 left-6 z-40 flex flex-col gap-4 w-[360px] h-[calc(100vh-130px)] pb-4">
      
      {/* 空域情况 */}
      <div className="shrink-0 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="flex items-center gap-3 w-full">
          <div className="text-sm font-bold text-slate-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">空域24</div>
          <div className="text-xs text-slate-600 flex-1 text-right">生效时间：<span className="font-mono font-medium">14:00-20:00</span></div>
        </div>
      </div>

      {/* 今日作业统计 */}
      <div className="shrink-0 h-[280px] bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 shrink-0">
          <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
          今日作业统计
        </h3>
        
        <div className="flex gap-2.5 mb-4 shrink-0">
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-white rounded-lg p-2.5 border border-blue-100 shadow-sm">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              火箭
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-sm">10</span> 次</div>
              <div className="text-xs text-blue-600 font-medium"><span className="font-bold font-mono text-sm">80</span> 发</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-emerald-50/50 to-white rounded-lg p-2.5 border border-emerald-100 shadow-sm">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              高炮
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-sm">10</span> 次</div>
              <div className="text-xs text-emerald-600 font-medium"><span className="font-bold font-mono text-sm">112</span> 发</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={statsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={5} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconSize={8} />
              
              <Bar yAxisId="right" dataKey="rocketAmmo" name="火箭弹(发)" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={12} />
              <Bar yAxisId="right" dataKey="gunAmmo" name="高炮弹(发)" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={12} />
              
              <Line yAxisId="left" type="monotone" dataKey="rocketOps" name="火箭作业(次)" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#fff', stroke: '#2563eb', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="gunOps" name="高炮作业(次)" stroke="#059669" strokeWidth={2} dot={{ fill: '#fff', stroke: '#059669', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 最新作业结果 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
            最新作业结果
          </h3>
          <span className="text-xs text-slate-500 font-mono">11:48</span>
        </div>
        
        <div className="flex flex-col gap-2.5 border border-slate-100 rounded-lg pb-3 mb-4 bg-white shadow-sm shrink-0">
          <div className="flex items-center border-b border-slate-50">
            <div className="w-16 text-center py-2 border-r border-slate-50 bg-slate-50/50 text-slate-600 text-sm font-medium rounded-tl-lg">火箭</div>
            <div className="flex-1 text-center py-2 text-slate-700 text-sm font-medium">林家村火箭点</div>
          </div>
          
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium font-mono">11:59</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Rocket className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">8发</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <ArrowUpRight className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">45°</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Navigation className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">225°</span>
            </div>
          </div>
        </div>
        
        {/* Radar profile mock */}
        <div className="flex-1 min-h-0 w-full bg-slate-900 rounded-lg relative overflow-hidden flex flex-col shadow-inner">
          <div className="absolute top-2 left-3 text-white text-xs font-bold shadow-sm tracking-wider">雷达剖面</div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('simulate-trajectory'))}
            className="absolute top-2 right-2 bg-slate-800/80 hover:bg-slate-700 p-1.5 rounded text-white/80 hover:text-white transition-colors z-10"
            title="三维推演"
          >
            <Box className="w-4 h-4" />
          </button>
          <div className="absolute top-6 left-3 text-white/50 text-[10px]">高度(m)</div>
          <div className="flex-1 mt-6 flex flex-col justify-end pb-4 relative">
             {/* Some rough charts */}
             <div className="absolute bottom-4 left-0 w-full h-[60%] bg-blue-500/20" />
             <div className="absolute bottom-4 left-0 w-[80%] h-[40%] bg-emerald-500/40 rounded-tr-full blur-[2px]" />
             <div className="absolute bottom-4 left-[20%] w-[50%] h-[30%] bg-yellow-400/60 rounded-t-full blur-[2px]" />
             <div className="absolute bottom-4 left-[30%] w-[30%] h-[20%] bg-red-500/60 rounded-t-full blur-[2px]" />
             
             {/* Target dot */}
             <div className="absolute bottom-[35%] left-[45%] w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)] border border-white/50" />
             
             {/* Grid lines */}
             <div className="absolute bottom-4 left-0 w-full h-px bg-white/10" />
             <div className="absolute bottom-[30%] left-0 w-full h-px bg-white/5" />
             <div className="absolute bottom-[50%] left-0 w-full h-px bg-white/5" />
             <div className="absolute bottom-[70%] left-0 w-full h-px bg-white/5" />
             <div className="absolute bottom-[90%] left-0 w-full h-px bg-white/5" />
          </div>
          
          <div className="h-4 bg-slate-800/80 flex justify-between items-center px-2 backdrop-blur-sm border-t border-white/10">
             <div className="flex gap-px w-full justify-between pr-2">
               {['0','5','10','15','20','25','30','35','40','45','50','55','60','65'].map(v => (
                 <div key={v} className="text-[8px] text-center text-white/60">{v}</div>
               ))}
             </div>
             <div className="text-[8px] text-white/40 ml-1 font-mono">dBZ</div>
          </div>
        </div>
      </div>
    </div>
  );
}