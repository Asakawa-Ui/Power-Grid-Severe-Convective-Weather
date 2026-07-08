import React from 'react';
import { Clock, Rocket, ArrowUpRight, Navigation, List, MapPin } from 'lucide-react';

export default function OperationCommandRight() {
  const commands = [
    { type: '火箭', name: '姜祥村作业点', team: '阳新、咸宁（通山）', time: '2026-07-07 18:30', actionTime: '18:45', count: '8发', angle: '45°', azimuth: '225°' },
    { type: '火箭', name: '铁山南作业点', team: '黄冈（黄州、浠水）*2', time: '2026-07-07 18:25', actionTime: '18:38', count: '6发', angle: '42°', azimuth: '210°' },
    { type: '高炮', name: '白沙作业点', team: '咸宁（嘉鱼、赤壁）*2', time: '2026-07-07 18:15', actionTime: '18:28', count: '12发', angle: '55°', azimuth: '160°' },
    { type: '火箭', name: '刘仁八作业点', team: '黄冈（武穴、黄梅）*2', time: '2026-07-07 18:10', actionTime: '18:22', count: '8发', angle: '48°', azimuth: '190°' },
  ];

  const dynamics = [
    { type: '火箭', name: '姜祥村作业点', id: '420222001', team: '阳新、咸宁（通山）', status: '作业', time: '2026-07-07 18:45' },
    { type: '高炮', name: '大冶金湖作业点', id: '420281002', team: '大冶、黄冈（蕲春）', status: '完成', time: '2026-07-07 18:30' },
    { type: '火箭', name: '太子作业点', id: '420222003', team: '咸宁（崇阳、通城）*2', status: '就绪', time: '2026-07-07 18:20' },
    { type: '高炮', name: '白沙作业点', id: '422324004', team: '咸宁（嘉鱼、赤壁）*2', status: '完成', time: '2026-07-07 18:28' },
  ];

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
            {commands.map((cmd, idx) => (
              <div key={idx} className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-lg p-3 flex flex-col gap-2 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-sm ${cmd.type === '火箭' ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                      {cmd.type}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{cmd.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{cmd.time}</span>
                </div>
                {cmd.team && (
                  <div className="text-xs text-slate-500 bg-slate-50/50 rounded px-2 py-1 border border-slate-100/50">
                    <span className="text-slate-400">作业队伍: </span>{cmd.team}
                  </div>
                )}
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
            ))}
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
              <div key={idx} className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-lg p-3 flex flex-col gap-2 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-sm ${dyn.type === '火箭' ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                      {dyn.type}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{dyn.name} <span className="text-slate-400 font-normal">({dyn.id})</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-500 transition-colors">
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-500 transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {dyn.team && (
                  <div className="text-xs text-slate-500 bg-slate-50/50 rounded px-2 py-1 border border-slate-100/50">
                    <span className="text-slate-400">作业队伍: </span>{dyn.team}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="flex items-center gap-1.5">当前状态: <span className="text-emerald-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{dyn.status}</span></span>
                  <span className="font-mono">{dyn.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
