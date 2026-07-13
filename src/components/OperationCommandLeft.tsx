import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Clock, Rocket, ArrowUpRight, Navigation, MapPin } from 'lucide-react';
import { getAdministrativeAddress } from './EffectEvaluationRight';

const statsData = [
  { time: '12:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 25 },
  { time: '13:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 12 },
  { time: '14:00', rocketOps: 0, rocketAmmo: 0, gunOps: 3, gunAmmo: 30 },
  { time: '15:00', rocketOps: 3, rocketAmmo: 24, gunOps: 0, gunAmmo: 0 },
  { time: '16:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 20 },
  { time: '17:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 10 },
  { time: '18:00', rocketOps: 1, rocketAmmo: 8, gunOps: 1, gunAmmo: 15 },
];

interface OperationCommandLeftProps {
  isCaseMode: boolean;
  playbackMinutes: number;
}

export default function OperationCommandLeft({
  isCaseMode,
  playbackMinutes
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
    <div className="absolute top-24 left-6 z-40 flex flex-col gap-4 w-[360px] h-[calc(100vh-130px)] pb-4 overflow-y-auto pr-1 -mr-1 scrollbar-none">
      
      {/* 空域情况 */}
      <div className="shrink-0 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-3 flex items-center gap-3">
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
              <div className="text-xs text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-sm">{rocketOpsCount}</span> 次</div>
              <div className="text-xs text-blue-600 font-medium"><span className="font-bold font-mono text-sm">{rocketAmmoCount}</span> 发</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-emerald-50/50 to-white rounded-lg p-2.5 border border-emerald-100 shadow-sm">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              高炮
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-sm">{gunOpsCount}</span> 次</div>
              <div className="text-xs text-emerald-600 font-medium"><span className="font-bold font-mono text-sm">{gunAmmoCount}</span> 发</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={activeStatsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="25%">
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
              {(!isCaseMode) && (
                <Bar yAxisId="right" dataKey="gunAmmo" name="高炮弹(发)" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={12} />
              )}
              
              <Line yAxisId="left" type="monotone" dataKey="rocketOps" name="火箭作业(次)" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#fff', stroke: '#2563eb', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
              {(!isCaseMode) && (
                <Line yAxisId="left" type="monotone" dataKey="gunOps" name="高炮作业(次)" stroke="#059669" strokeWidth={2} dot={{ fill: '#fff', stroke: '#059669', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 最新作业上报 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
            最新作业上报
          </h3>
          <span className="text-xs text-slate-500 font-mono">{latestResult.displayTime}</span>
        </div>
        
        {latestResult.station === '无当前回放作业' ? (
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
              className="p-3 rounded-lg border border-slate-100 bg-gradient-to-r from-slate-50 to-white shadow-sm flex flex-col gap-1.5 mb-4 shrink-0 cursor-pointer hover:border-blue-200/60 transition-all hover:shadow-md active:bg-slate-100/50"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-sm ${
                    latestResult.type === '火箭' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {latestResult.type}
                  </span>
                  <span className="text-sm font-bold text-slate-700 ml-0.5">{latestResult.station}</span>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-600">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium">时间: <span className="font-mono">{isCaseMode ? '2026-06-18 ' : '2026-07-02 '}{latestResult.time}</span></span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium">
                  地点: {latestResult.station === '无当前回放作业' ? '--' : getAdministrativeAddress(latestResult.station)}
                </span>
              </div>

              {/* Action parameter details in single line layout with blue Lucide-react icons */}
              <div className="flex items-center justify-between px-1 text-slate-600 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium">用量: {latestResult.count}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium">仰角: {latestResult.angle}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium">方位: <span className="font-mono">{latestResult.azimuth}</span></span>
                </div>
              </div>
            </div>
            
            {/* Radar profile */}
            <div className="flex-1 min-h-[160px] w-full mt-1 relative bg-slate-50/40 rounded-lg p-1 overflow-hidden border border-slate-200/50 flex flex-col justify-center">
              {(() => {
                const angleValue = parseInt(latestResult.angle) || 45;
                let burstX = 3500;
                let burstY = 5600;
                if (latestResult.station.includes('金湖')) {
                  burstX = 3700;
                  burstY = 5800;
                } else if (latestResult.station.includes('刘仁八')) {
                  burstX = 3200;
                  burstY = 6200;
                } else if (latestResult.station.includes('白沙')) {
                  burstX = 4000;
                  burstY = 5400;
                } else if (latestResult.station.includes('姜祥')) {
                  burstX = 3500;
                  burstY = 5600;
                } else if (latestResult.station.includes('林家')) {
                  burstX = 3600;
                  burstY = 5700;
                } else {
                  burstX = 3500;
                  burstY = 5600;
                }

                const selectedHistoryId = latestResult.station || 'h1';

                // Coordinate mapping functions for a compact 320x160 viewBox
                const mapX = (xVal: number) => 32 + (xVal / 8000) * 260;
                const mapY = (yVal: number) => 136 - (yVal / 10000) * 116; // 136 is X baseline, 20 is top limit (116px height)

                const getWave = (x: number) => {
                  const seedNum = (selectedHistoryId.charCodeAt(0) || 0) + (selectedHistoryId.charCodeAt(1) || 0);
                  return Math.sin((x + seedNum * 120) / 1000) * 400 + Math.cos((x - seedNum * 80) / 600) * 200;
                };

                const generateAreaPath = (
                  xStart: number,
                  xEnd: number,
                  getTopY: (x: number) => number,
                  getBottomY: (x: number) => number
                ) => {
                  const points = [];
                  const step = 400;
                  for (let x = xStart; x <= xEnd; x += step) {
                    points.push({ x, yTop: getTopY(x), yBottom: getBottomY(x) });
                  }
                  if (points[points.length - 1].x < xEnd) {
                    points.push({ x: xEnd, yTop: getTopY(xEnd), yBottom: getBottomY(xEnd) });
                  }

                  let topPath = `M ${mapX(points[0].x)} ${mapY(points[0].yTop)}`;
                  for (let i = 1; i < points.length; i++) {
                    topPath += ` L ${mapX(points[i].x)} ${mapY(points[i].yTop)}`;
                  }

                  let bottomPath = ` L ${mapX(points[points.length - 1].x)} ${mapY(points[points.length - 1].yBottom)}`;
                  for (let i = points.length - 2; i >= 0; i--) {
                    bottomPath += ` L ${mapX(points[i].x)} ${mapY(points[i].yBottom)}`;
                  }

                  return `${topPath}${bottomPath} Z`;
                };

                const bluePath = generateAreaPath(0, 8000, x => 9300 + getWave(x)*0.2, x => 9000 + getWave(x)*0.2);
                const greenLightPath = generateAreaPath(0, 8000, x => 9000 + getWave(x)*0.2, x => 2000 + getWave(x)*0.6);
                const greenDarkPath = generateAreaPath(0, 8000, x => 7800 + getWave(x)*0.5, x => 3500 + getWave(x)*0.5);
                const yellowPath = generateAreaPath(1000, 7200, x => 6800 + getWave(x)*0.4, x => 4200 + getWave(x)*0.4);
                const orangePath = generateAreaPath(2200, 5800, x => 5700 + getWave(x)*0.3, x => 4800 + getWave(x)*0.3);

                // Trajectory Calculations
                const x0 = mapX(0);
                const y0 = mapY(1200); // launch height

                const x1 = mapX(burstX);
                const y1 = mapY(burstY);

                const vertexX = burstX * 0.55;
                const vertexY = Math.max(burstY + 1200, Math.min(10500, 6800 + (angleValue - 45) * 120));
                const xc = mapX(vertexX);
                const yc = mapY(vertexY);

                return (
                  <svg viewBox="0 0 320 160" className="w-full h-full" style={{ display: 'block' }}>
                    {/* 1. Radar Echo Color Layers */}
                    <path d={greenLightPath} fill="#4ade80" fillOpacity={0.3} />
                    <path d={greenDarkPath} fill="#22c55e" fillOpacity={0.45} />
                    <path d={yellowPath} fill="#eab308" fillOpacity={0.55} />
                    <path d={orangePath} fill="#ea580c" fillOpacity={0.65} />
                    <path d={bluePath} fill="#3b82f6" fillOpacity={0.4} />

                    {/* 2. Horizontal Grid Lines */}
                    {[2000, 4000, 6000, 8000, 10000].map((hVal) => (
                      <line
                        key={hVal}
                        x1={mapX(0)}
                        y1={mapY(hVal)}
                        x2={mapX(8000)}
                        y2={mapY(hVal)}
                        stroke="#e2e8f0"
                        strokeWidth={0.6}
                        strokeDasharray="3,3"
                      />
                    ))}

                    {/* 3. Vertical Grid Lines */}
                    {[2000, 4000, 6000, 8000].map((rVal) => (
                      <line
                        key={rVal}
                        x1={mapX(rVal)}
                        y1={mapY(0)}
                        x2={mapX(rVal)}
                        y2={mapY(10000)}
                        stroke="#e2e8f0"
                        strokeWidth={0.6}
                        strokeDasharray="3,3"
                      />
                    ))}

                    {/* 4. Y-Axis and Ticks/Labels */}
                    <line x1={mapX(0)} y1={mapY(0)} x2={mapX(0)} y2={mapY(10000) - 5} stroke="#0284c7" strokeWidth={1} />
                    {[0, 2000, 4000, 6000, 8000, 10000].map((hVal) => (
                      <g key={hVal}>
                        <line x1={mapX(0) - 3} y1={mapY(hVal)} x2={mapX(0)} y2={mapY(hVal)} stroke="#0284c7" strokeWidth={1} />
                        <text
                          x={mapX(0) - 5}
                          y={mapY(hVal) + 2.5}
                          fill="#475569"
                          fontSize="7.5"
                          fontWeight="500"
                          textAnchor="end"
                          fontFamily="sans-serif"
                        >
                          {hVal / 1000}
                        </text>
                      </g>
                    ))}

                    {/* 5. X-Axis and Ticks/Labels */}
                    <line x1={mapX(0)} y1={mapY(0)} x2={mapX(8000) + 10} y2={mapY(0)} stroke="#0284c7" strokeWidth={1} />
                    {[0, 2000, 4000, 6000, 8000].map((rVal) => (
                      <g key={rVal}>
                        <line x1={mapX(rVal)} y1={mapY(0)} x2={mapX(rVal)} y2={mapY(0) + 3} stroke="#0284c7" strokeWidth={1} />
                        <text
                          x={mapX(rVal)}
                          y={mapY(0) + 10}
                          fill="#475569"
                          fontSize="7.5"
                          fontWeight="500"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          {rVal}
                        </text>
                      </g>
                    ))}

                    {/* 6. Axis Titles */}
                    <text x={mapX(0) - 5} y={mapY(10000) - 4} fill="#0284c7" fontSize={7} fontWeight="600" textAnchor="end" fontFamily="sans-serif">
                      高度(km)
                    </text>
                    <text x={mapX(8000) + 10} y={mapY(0) + 9} fill="#0284c7" fontSize={7} fontWeight="600" textAnchor="start" fontFamily="sans-serif">
                      距离(m)
                    </text>

                    {/* 7. Trajectory Path */}
                    <path
                      d={`M ${x0} ${y0} Q ${xc} ${yc} ${x1} ${y1}`}
                      stroke="#000000"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* 8. Burst Dot and Legend Badge */}
                    <circle cx={x1} cy={y1} r={6} fill="#ef4444" opacity={0.25} className="animate-pulse" />
                    <circle cx={x1} cy={y1} r={2.5} fill="#ef4444" stroke="#ffffff" strokeWidth={0.8} />
                    <g transform={`translate(${Math.min(240, x1 + 5)}, ${Math.min(120, y1 - 6)})`}>
                      <rect width={55} height={12} rx={2} fill="#ffffff" stroke="#e2e8f0" strokeWidth={0.6} className="shadow-sm" />
                      <text x={4} y={8.5} fill="#dc2626" fontSize={6.5} fontWeight="bold" fontFamily="sans-serif">
                        炸点({burstX}m)
                      </text>
                    </g>
                  </svg>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}