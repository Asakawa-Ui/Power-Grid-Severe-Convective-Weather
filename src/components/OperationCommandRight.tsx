import React from 'react';
import { Clock, Rocket, ArrowUpRight, Navigation, List, MapPin } from 'lucide-react';

interface OperationCommandRightProps {
  isCaseMode?: boolean;
  playbackMinutes?: number;
}

export default function OperationCommandRight({ isCaseMode = false, playbackMinutes = 0 }: OperationCommandRightProps) {
  let commands = [];
  let dynamics = [];

  if (isCaseMode) {
    if (playbackMinutes >= 13) {
      commands.push({ type: '火箭', name: '白沙作业点', time: '2026-06-18 15:13', actionTime: '15:18', count: '4发', angle: '--', azimuth: '210°', status: '已接收' });
    }
    if (playbackMinutes >= 23) {
      commands.push({ type: '火箭', name: '刘仁八作业点', time: '2026-06-18 15:23', actionTime: '15:28', count: '4发', angle: '56°', azimuth: '215°', status: '已接收' });
    }
    if (playbackMinutes >= 133) {
      commands.push({ type: '火箭', name: '大冶金湖作业点', time: '2026-06-18 17:13', actionTime: '17:18', count: '4发', angle: '--', azimuth: '--', status: '已下发' });
    }

    commands.reverse(); // Newest first

    if (playbackMinutes >= 133) {
      dynamics.push({
        type: '火箭',
        name: '大冶金湖作业点',
        id: '420281002',
        status: playbackMinutes >= 139 ? '完成' : playbackMinutes >= 138 ? '作业' : '就绪',
        time: playbackMinutes >= 139 ? '2026-06-18 17:19' : playbackMinutes >= 138 ? '2026-06-18 17:18' : '2026-06-18 17:13'
      });
    }
    if (playbackMinutes >= 23) {
      dynamics.push({
        type: '火箭',
        name: '刘仁八作业点',
        id: '420281004',
        status: playbackMinutes >= 29 ? '完成' : playbackMinutes >= 28 ? '作业' : '就绪',
        time: playbackMinutes >= 29 ? '2026-06-18 15:29' : playbackMinutes >= 28 ? '2026-06-18 15:28' : '2026-06-18 15:23'
      });
    }
    if (playbackMinutes >= 13) {
      dynamics.push({
        type: '火箭',
        name: '白沙作业点',
        id: '422324004',
        status: playbackMinutes >= 19 ? '完成' : playbackMinutes >= 18 ? '作业' : '就绪',
        time: playbackMinutes >= 19 ? '2026-06-18 15:19' : playbackMinutes >= 18 ? '2026-06-18 15:18' : '2026-06-18 15:13'
      });
    }
  } else {
    commands = [
      { type: '火箭', name: '姜祥村作业点', time: '2026-07-07 18:30', actionTime: '18:45', count: '8发', angle: '45°', azimuth: '225°', status: '已下发' },
      { type: '火箭', name: '铁山南作业点', time: '2026-07-07 18:25', actionTime: '18:38', count: '6发', angle: '42°', azimuth: '210°', status: '已接收' },
      { type: '火箭', name: '白沙作业点', time: '2026-07-07 18:15', actionTime: '18:28', count: '12发', angle: '55°', azimuth: '160°', status: '已接收' },
      { type: '火箭', name: '刘仁八作业点', time: '2026-07-07 18:10', actionTime: '18:22', count: '8发', angle: '48°', azimuth: '190°', status: '接收失败' },
    ];

    dynamics = [
      { type: '火箭', name: '姜祥村作业点', id: '420222001', status: '作业', time: '2026-07-07 18:45' },
      { type: '火箭', name: '大冶金湖作业点', id: '420281002', status: '完成', time: '2026-07-07 18:30' },
      { type: '火箭', name: '太子作业点', id: '420222003', status: '就绪', time: '2026-07-07 18:20' },
      { type: '火箭', name: '白沙作业点', id: '422324004', status: '完成', time: '2026-07-07 18:28' },
    ];
  }

  const getStatusColorClass = (status: string) => {
    if (status === '就绪') return 'text-emerald-500';
    if (status === '作业') return 'text-amber-500';
    if (status === '完成') return 'text-purple-500';
    return 'text-slate-500';
  };

  const getStatusBgClass = (status: string) => {
    if (status === '就绪') return 'bg-emerald-500';
    if (status === '作业') return 'bg-amber-500';
    if (status === '完成') return 'bg-purple-500';
    return 'bg-slate-500';
  };

  return (
    <div className="absolute top-24 right-6 z-40 flex flex-col gap-4 w-[360px] h-[calc(100vh-130px)] pb-4">
      
      {/* 作业指令 */}
      <div className="flex-1 min-h-0 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
          <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
          作业指令
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <div className="flex flex-col gap-2.5 pb-2">
            {commands.map((cmd, idx) => {
              const timeOnly = cmd.time.includes(' ') ? cmd.time.split(' ')[1] : cmd.time;
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('map-focus-site', { detail: { siteName: cmd.name } }));
                  }}
                  className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-lg p-3 flex flex-col gap-2 shadow-sm transition-all hover:shadow-md hover:border-blue-200/60 cursor-pointer active:bg-slate-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-sm bg-orange-500">
                        {cmd.type}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{cmd.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono font-medium">{timeOnly}</span>
                      {cmd.status === '已接收' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/60 rounded shrink-0 select-none">
                          已接收
                        </span>
                      )}
                      {cmd.status === '接收失败' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100/60 rounded shrink-0 select-none">
                          接收失败
                        </span>
                      )}
                      {cmd.status === '已下发' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100/60 rounded shrink-0 select-none">
                          已下发
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1 mt-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-medium font-mono">{cmd.actionTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Rocket className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-medium">{cmd.count}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-medium">{cmd.angle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Navigation className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-medium">{cmd.azimuth}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {commands.length === 0 && (
              <div className="text-slate-400 text-xs text-center py-12 flex flex-col items-center justify-center gap-2">
                <span className="font-medium text-slate-400">暂无最新作业指令</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 作业动态 */}
      <div className="flex-1 min-h-0 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
          <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
          作业动态
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <div className="flex flex-col gap-2.5 pb-2">
            {dynamics.map((dyn, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('map-focus-site', { detail: { siteName: dyn.name } }));
                }}
                className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-lg p-3 flex flex-col gap-2 shadow-sm transition-all hover:shadow-md hover:border-blue-200/60 cursor-pointer active:bg-slate-100/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-sm bg-orange-500">
                      {dyn.type}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{dyn.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 px-1 mt-0.5">
                  <span className="flex items-center gap-1.5">
                    当前状态: 
                    <span className={`font-medium flex items-center gap-1 ${getStatusColorClass(dyn.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusBgClass(dyn.status)}`} />
                      {dyn.status}
                    </span>
                  </span>
                  <span className="font-mono">{dyn.time}</span>
                </div>
              </div>
            ))}
            {dynamics.length === 0 && (
              <div className="text-slate-400 text-xs text-center py-12 flex flex-col items-center justify-center gap-2">
                <span className="font-medium text-slate-400">暂无最新作业动态</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
