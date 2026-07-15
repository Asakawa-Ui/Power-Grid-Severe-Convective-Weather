import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Clock, Rocket, ArrowUpRight, Navigation, MapPin } from 'lucide-react';
import { getAdministrativeAddress } from './EffectEvaluationRight';
import RegionSelector from './RegionSelector';
import { weatherPoints } from '../utils/weatherPoints';

const statsData = [
  { time: '12:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 25 },
  { time: '13:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 12 },
  { time: '14:00', rocketOps: 0, rocketAmmo: 0, gunOps: 3, gunAmmo: 30 },
  { time: '15:00', rocketOps: 3, rocketAmmo: 24, gunOps: 0, gunAmmo: 0 },
  { time: '16:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 20 },
  { time: '17:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 10 },
  { time: '18:00', rocketOps: 1, rocketAmmo: 8, gunOps: 1, gunAmmo: 15 },
];

const liveForceTimeSeries = [
  { time: '12:00', rocketReady: 3, gunReady: 1, rocketAmmo: 80, gunAmmo: 140 },
  { time: '13:00', rocketReady: 4, gunReady: 1, rocketAmmo: 90, gunAmmo: 150 },
  { time: '14:00', rocketReady: 4, gunReady: 1, rocketAmmo: 90, gunAmmo: 150 },
  { time: '15:00', rocketReady: 5, gunReady: 1, rocketAmmo: 100, gunAmmo: 170 },
  { time: '16:00', rocketReady: 5, gunReady: 1, rocketAmmo: 100, gunAmmo: 170 },
  { time: '17:00', rocketReady: 6, gunReady: 1, rocketAmmo: 120, gunAmmo: 180 },
  { time: '18:00', rocketReady: 6, gunReady: 1, rocketAmmo: 120, gunAmmo: 180 },
];

interface OperationCommandLeftProps {
  isCaseMode: boolean;
  playbackMinutes: number;
  activeRegion: string;
  setActiveRegion: (region: string) => void;
}

export default function OperationCommandLeft({
  isCaseMode,
  playbackMinutes,
  activeRegion,
  setActiveRegion
}: OperationCommandLeftProps) {

  // Time formatting helper
  const formatPlaybackTime = (minutes: number) => {
    const baseHour = 15;
    const totalMinutes = minutes;
    const h = Math.floor(totalMinutes / 60) + baseHour;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Dynamic values based on playbackMinutes
  let rocketOpsCount = 10;
  let rocketAmmoCount = 80;
  let gunOpsCount = 10;
  let gunAmmoCount = 112;
  let activeStatsData = statsData;

  // Filter weather points for activeRegion just like Map3D does
  const currentRegionPoints = weatherPoints.filter(wp => {
    if (wp.region !== activeRegion) return false;
    if (wp.type === 'vehicle') return false; // Exclude vehicle sites
    if (activeRegion === '湖北地块' && !wp.id.startsWith('wp-hb-new')) return false;
    return true;
  });

  const activeRocketReadyCount = currentRegionPoints.filter(p => p.type === 'rocket').length;
  const activeGunReadyCount = currentRegionPoints.filter(p => p.type === 'gun').length;

  const activeRocketAmmo = activeRocketReadyCount * 20; // 20 per rocket site
  const activeGunAmmo = activeGunReadyCount * 60; // 60 per gun site

  // Generate dynamic time series to climb up to the final values
  const liveForceTimeSeriesData = liveForceTimeSeries.map((item, index) => {
    const steps = liveForceTimeSeries.length - 1; // 6 steps
    
    const rReady = index === 0 ? Math.min(3, activeRocketReadyCount) : Math.min(activeRocketReadyCount, Math.round(3 + (index / steps) * (activeRocketReadyCount - 3)));
    const gReady = index === 0 ? Math.min(1, activeGunReadyCount) : Math.min(activeGunReadyCount, Math.round(1 + (index / steps) * (activeGunReadyCount - 1)));
    
    const rAmmo = rReady * 20;
    const gAmmo = gReady * 60;

    return {
      time: item.time,
      rocketReady: rReady,
      gunReady: gReady,
      rocketAmmo: rAmmo,
      gunAmmo: gAmmo,
    };
  });

  let latestResult = {
    station: '林家村作业点',
    type: '火箭',
    time: '11:59',
    count: '8发',
    angle: '45°',
    azimuth: '225°',
    displayTime: '11:48'
  };

  if (isCaseMode) {
    // Fired times
    // 白沙: 15:18 (mins >= 18) -> 4发, 1次
    // 刘仁八: 15:28 (mins >= 28) -> 4发, 1次
    // 大冶金湖: 17:18 (mins >= 138) -> 4发, 1次
    rocketOpsCount = 0;
    rocketAmmoCount = 0;
    if (playbackMinutes >= 18) {
      rocketOpsCount += 1;
      rocketAmmoCount += 4;
    }
    if (playbackMinutes >= 28) {
      rocketOpsCount += 1;
      rocketAmmoCount += 4;
    }
    if (playbackMinutes >= 138) {
      rocketOpsCount += 1;
      rocketAmmoCount += 4;
    }

    gunOpsCount = 0;
    gunAmmoCount = 0;

    activeStatsData = [
      { time: '15:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
      { time: '15:18', rocketOps: playbackMinutes >= 18 ? 1 : 0, rocketAmmo: playbackMinutes >= 18 ? 4 : 0, gunOps: 0, gunAmmo: 0 },
      { time: '15:28', rocketOps: playbackMinutes >= 28 ? 1 : 0, rocketAmmo: playbackMinutes >= 28 ? 4 : 0, gunOps: 0, gunAmmo: 0 },
      { time: '16:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
      { time: '17:18', rocketOps: playbackMinutes >= 138 ? 1 : 0, rocketAmmo: playbackMinutes >= 138 ? 4 : 0, gunOps: 0, gunAmmo: 0 },
      { time: '18:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
    ];

    if (playbackMinutes >= 138) {
      latestResult = {
        station: '大冶金湖作业点',
        type: '火箭',
        time: '17:18',
        count: '4发',
        angle: '--',
        azimuth: '--',
        displayTime: '17:18'
      };
    } else if (playbackMinutes >= 28) {
      latestResult = {
        station: '刘仁八作业点',
        type: '火箭',
        time: '15:28',
        count: '4发',
        angle: '56°',
        azimuth: '215°',
        displayTime: '15:28'
      };
    } else if (playbackMinutes >= 18) {
      latestResult = {
        station: '白沙作业点',
        type: '火箭',
        time: '15:18',
        count: '4发',
        angle: '--',
        azimuth: '210°',
        displayTime: '15:18'
      };
    } else {
      latestResult = {
        station: '无当前回放作业',
        type: '火箭',
        time: '--:--',
        count: '0发',
        angle: '--',
        azimuth: '--',
        displayTime: '15:00'
      };
    }
  }

  return (
    <div className="absolute top-[76px] bottom-6 left-6 z-40 flex flex-col gap-4 w-[360px] overflow-y-auto pr-1 -mr-1 scrollbar-none">
      
      {/* Region Selector placed first */}
      <RegionSelector activeRegion={activeRegion} setActiveRegion={setActiveRegion} inline />
 
      {/* 今日作业统计 */}
      <div className="shrink-0 h-[280px] bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 shrink-0">
          <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
          {isCaseMode ? "当日作业统计" : "当前作业力量"}
        </h3>
        
        <div className="flex gap-2.5 mb-4 shrink-0">
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-white rounded-lg p-2.5 border border-blue-100 shadow-sm">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              火箭
            </div>
            {isCaseMode ? (
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-sm">{rocketOpsCount}</span> 次</div>
                <div className="text-xs text-blue-600 font-medium"><span className="font-bold font-mono text-sm">{rocketAmmoCount}</span> 发</div>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-0.5">
                <div className="text-[10px] text-slate-500 font-medium leading-none">就绪: <span className="font-bold text-slate-800 font-mono text-xs">{activeRocketReadyCount}</span> 个</div>
                <div className="text-[10px] text-blue-600 font-medium leading-none">库存: <span className="font-bold font-mono text-xs">{activeRocketAmmo}</span> 发</div>
              </div>
            )}
          </div>
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-emerald-50/50 to-white rounded-lg p-2.5 border border-emerald-100 shadow-sm">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              高炮
            </div>
            {isCaseMode ? (
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-sm">{gunOpsCount}</span> 次</div>
                <div className="text-xs text-emerald-600 font-medium"><span className="font-bold font-mono text-sm">{gunAmmoCount}</span> 发</div>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-0.5">
                <div className="text-[10px] text-slate-500 font-medium leading-none">就绪: <span className="font-bold text-slate-800 font-mono text-xs">{activeGunReadyCount}</span> 个</div>
                <div className="text-[10px] text-emerald-600 font-medium leading-none">库存: <span className="font-bold font-mono text-xs">{activeGunAmmo}</span> 发</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-h-0 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={(isCaseMode ? activeStatsData : liveForceTimeSeriesData) as any} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={5} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconSize={8} />
              
              {isCaseMode ? (
                <>
                  <Bar yAxisId="right" dataKey="rocketAmmo" name="火箭弹(发)" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={12} />
                  <Bar yAxisId="right" dataKey="gunAmmo" name="高炮弹(发)" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={12} />
                  <Line yAxisId="left" type="monotone" dataKey="rocketOps" name="火箭作业(次)" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#fff', stroke: '#2563eb', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
                  <Line yAxisId="left" type="monotone" dataKey="gunOps" name="高炮作业(次)" stroke="#059669" strokeWidth={2} dot={{ fill: '#fff', stroke: '#059669', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
                </>
              ) : (
                <>
                  <Bar yAxisId="right" dataKey="rocketAmmo" name="火箭弹库存" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={8} />
                  <Bar yAxisId="right" dataKey="gunAmmo" name="高炮库存" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={8} />
                  <Line yAxisId="left" type="monotone" dataKey="rocketReady" name="火箭就绪点" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#fff', stroke: '#2563eb', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
                  <Line yAxisId="left" type="monotone" dataKey="gunReady" name="高炮就绪点" stroke="#059669" strokeWidth={2} dot={{ fill: '#fff', stroke: '#059669', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 最新作业上报 / 最新就绪作业点情况 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
            {isCaseMode ? "最新作业上报" : "最新就绪作业点情况"}
          </h3>
          {isCaseMode ? (
            <span className="text-xs text-slate-500 font-mono">{latestResult.displayTime}</span>
          ) : (
            <div className="flex items-center gap-1 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">在线就绪</span>
            </div>
          )}
        </div>
        
        {isCaseMode ? (
          latestResult.station === '无当前回放作业' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-12 gap-2">
              <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                <Clock className="w-8 h-8" />
              </div>
              <span className="font-medium text-slate-400">当前无最新作业上报信息</span>
            </div>
          ) : (
            <>
              <div 
                onClick={() => {
                  if (latestResult.station && latestResult.station !== '无当前回放作业') {
                    window.dispatchEvent(new CustomEvent('map-focus-site', { detail: { siteName: latestResult.station } }));
                  }
                }}
                className="flex flex-col gap-1.5 pb-2 cursor-pointer hover:opacity-90 transition-all"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded ${
                    latestResult.type === '火箭' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {latestResult.type}
                  </span>
                  <span className="text-sm font-bold text-slate-700 ml-0.5">{latestResult.station}</span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 px-0.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium">时间: <span className="font-mono">{isCaseMode ? '2026-06-18 ' : '2026-07-02 '}{latestResult.time}</span></span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 px-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium">
                    地点: {latestResult.station === '无当前回放作业' ? '--' : getAdministrativeAddress(latestResult.station)}
                  </span>
                </div>

                {/* Action parameters */}
                <div className="flex items-center justify-between px-0.5 text-slate-600 text-[11px] pt-1.5 border-t border-slate-100/60 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Rocket className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium">用量: {latestResult.count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium">仰角: {latestResult.angle}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium">方位: <span className="font-mono">{latestResult.azimuth}</span></span>
                  </div>
                </div>
              </div>
              
              {/* Radar composite reflectivity schematic */}
              <div className="w-full mt-1 relative bg-[#090F1E] rounded-xl p-2.5 overflow-hidden border border-slate-800/80 flex items-center justify-center text-slate-300 font-sans shadow-inner select-none">
                <svg viewBox="0 0 200 200" className="w-full max-w-[190px] h-auto overflow-visible">
                  <defs>
                    <filter id="radarBlur" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" />
                    </filter>
                  </defs>

                  {/* Concentric Range Rings */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2,2" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                  <circle cx="100" cy="100" r="30" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2,2" />
                  
                  {/* Angle grid lines */}
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#1e293b" strokeWidth="0.6" />
                  <line x1="100" y1="10" x2="100" y2="190" stroke="#1e293b" strokeWidth="0.6" />
                  <line x1="36.3" y1="36.3" x2="163.6" y2="163.6" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3,3" opacity="0.5" />
                  <line x1="36.3" y1="163.6" x2="163.6" y2="36.3" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3,3" opacity="0.5" />

                  {/* Range Labels */}
                  <text x="100" y="66" fill="#475569" fontSize="6.5" fontStyle="italic" textAnchor="middle">30km</text>
                  <text x="100" y="36" fill="#475569" fontSize="6.5" fontStyle="italic" textAnchor="middle">60km</text>
                  <text x="100" y="6" fill="#475569" fontSize="6.5" fontStyle="italic" textAnchor="middle">90km</text>

                  {/* Weather Echo Blobs (Dynamic placement based on selected station) */}
                  {(() => {
                    let dx = 0;
                    let dy = 0;
                    if (latestResult.station.includes('金湖')) { dx = 25; dy = -15; }
                    else if (latestResult.station.includes('刘仁八')) { dx = -20; dy = 20; }
                    else if (latestResult.station.includes('白沙')) { dx = 35; dy = 10; }
                    else if (latestResult.station.includes('林家')) { dx = -10; dy = -25; }
                    else { dx = 10; dy = -10; }

                    return (
                      <g filter="url(#radarBlur)" opacity="0.85" className="transition-all duration-700">
                        {/* Outermost Light Green (dBZ 15-25) */}
                        <path d={`M ${90+dx} ${75+dy} Q ${60+dx} ${90+dy} ${80+dx} ${130+dy} T ${130+dx} ${125+dy} T ${140+dx} ${85+dy} Z`} fill="#22c55e" opacity="0.4" />
                        
                        {/* Medium Green/Yellow (dBZ 25-35) */}
                        <path d={`M ${95+dx} ${85+dy} Q ${75+dx} ${95+dy} ${90+dx} ${120+dy} T ${120+dx} ${115+dy} T ${125+dx} ${95+dy} Z`} fill="#a3e635" opacity="0.65" />
                        
                        {/* Yellow Core (dBZ 35-45) */}
                        <path d={`M ${100+dx} ${90+dy} Q ${85+dx} ${100+dy} ${100+dx} ${112+dy} T ${115+dx} ${110+dy} T ${118+dx} ${100+dy} Z`} fill="#eab308" opacity="0.8" />
                        
                        {/* Red Strong Core (dBZ 45-55) */}
                        <circle cx={105+dx} cy={102+dy} r="12" fill="#ef4444" opacity="0.9" />
                        
                        {/* Purple Severe/Hail Core (dBZ > 55) */}
                        <circle cx={107+dx} cy={103+dy} r="6" fill="#a855f7" opacity="0.95" />
                      </g>
                    );
                  })()}

                  {/* Centered radar station indicator */}
                  <circle cx="100" cy="100" r="2.5" fill="#10b981" stroke="#ffffff" strokeWidth="0.5" />
                </svg>
              </div>
            </>
          )
        ) : (
          /* 最新上线作业点情况 (放作业点的基本信息) */
          <div 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('map-focus-site', { detail: { siteName: '姜祥村作业点' } }));
            }}
            className="flex-1 flex flex-col gap-2 min-h-0 cursor-pointer hover:opacity-95 transition-all animate-fade-in"
          >
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 text-[11px] bg-slate-50/50 border border-slate-100 rounded-lg p-2.5">
              <div className="flex items-center col-span-2 border-b border-slate-100/50 pb-1">
                <span className="w-[54px] text-slate-400 font-medium shrink-0">站点名称:</span>
                <span className="text-slate-800 font-bold text-[11.5px]">姜祥村作业点</span>
              </div>
              <div className="flex items-center col-span-2 border-b border-slate-100/50 pb-1">
                <span className="w-[54px] text-slate-400 font-medium shrink-0">站点编号:</span>
                <span className="text-slate-800 font-mono font-medium">1301270001</span>
              </div>
              <div className="flex items-center col-span-2 border-b border-slate-100/50 pb-1">
                <span className="w-[54px] text-slate-400 font-medium shrink-0">详细地址:</span>
                <span className="text-slate-700 font-medium truncate" title="湖北省黄石市大冶市金牛镇姜祥村">
                  湖北省黄石市大冶市金牛镇姜祥村
                </span>
              </div>
              <div className="flex items-center border-b border-slate-100/50 pb-1">
                <span className="w-[54px] text-slate-400 font-medium shrink-0">装备类型:</span>
                <span className="text-slate-700 font-medium">固定火箭点</span>
              </div>
              <div className="flex items-center border-b border-slate-100/50 pb-1">
                <span className="w-[54px] text-slate-400 font-medium shrink-0">装备型号:</span>
                <span className="text-slate-700 font-medium font-mono">WR-98型</span>
              </div>
              <div className="flex items-center col-span-2">
                <span className="w-[54px] text-slate-400 font-medium shrink-0">库存储备:</span>
                <span className="text-slate-800 font-bold text-blue-600">火箭弹 24发 (状态良好)</span>
              </div>
            </div>

            {/* Live camera video screen representation */}
            <div className="flex-1 min-h-[90px] bg-slate-950 rounded-lg overflow-hidden relative border border-slate-200/80 shadow-inner group">
              <img 
                src="https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=400" 
                alt="实时监控画面" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8.5px] text-white font-medium flex items-center gap-1 shadow-sm select-none">
                <span className="relative flex h-1 w-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-red-500"></span>
                </span>
                <span className="font-mono tracking-wider font-bold">LIVE CAMERA</span>
              </div>
              <div className="absolute bottom-1 right-1 bg-black/40 backdrop-blur-[1px] px-1.5 py-0.5 rounded text-[8px] text-white/90 font-mono font-medium">
                实时现场画面
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}