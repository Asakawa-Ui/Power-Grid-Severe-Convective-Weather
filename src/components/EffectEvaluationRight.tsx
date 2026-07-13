import React, { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceArea, ReferenceLine, ComposedChart } from 'recharts';
import { Target, Clock, Rocket, ArrowUpRight, Navigation, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export const liveHistoryData = [
  { id: 'h1', type: '火箭', location: '姜祥村作业点', date: '2026-07-07 18:30', time: '18:45', ammo: '8发', angle: '45°', azimuth: '225°', status: '合理' },
  { id: 'h2', type: '火箭', location: '铁山南作业点', date: '2026-07-07 18:25', time: '18:38', ammo: '6发', angle: '42°', azimuth: '210°', status: '合理' },
  { id: 'h3', type: '火箭', location: '白沙作业点', date: '2026-07-07 18:15', time: '18:28', ammo: '12发', angle: '55°', azimuth: '160°', status: '合理' },
  { id: 'h4', type: '高炮', location: '大冶金湖作业点', date: '2026-07-03 11:45', time: '11:57', ammo: '8发', angle: '45°', azimuth: '225°', status: '合理' },
  { id: 'h5', type: '高炮', location: '刘仁八作业点', date: '2026-07-03 11:45', time: '11:57', ammo: '8发', angle: '45°', azimuth: '225°', status: '合理' },
  { id: 'h6', type: '高炮', location: '金牛镇作业点', date: '2026-07-02 14:15', time: '14:22', ammo: '10发', angle: '50°', azimuth: '180°', status: '合理' },
  { id: 'h7', type: '火箭', location: '陈贵镇作业点', date: '2026-07-01 16:30', time: '16:40', ammo: '16发', angle: '48°', azimuth: '200°', status: '合理' }
];

export const caseHistoryData = [
  { id: 'c1', type: '火箭', location: '大冶金湖作业点', date: '2026-06-18 17:18', time: '17:19', ammo: '4发', angle: '48°', azimuth: '200°', status: '合理' },
  { id: 'c2', type: '火箭', location: '刘仁八作业点', date: '2026-06-18 15:28', time: '15:29', ammo: '4发', angle: '56°', azimuth: '215°', status: '合理' },
  { id: 'c3', type: '火箭', location: '白沙作业点', date: '2026-06-18 15:18', time: '15:19', ammo: '4发', angle: '45°', azimuth: '210°', status: '合理' }
];

export const historyData = liveHistoryData;

export function getHistorySiteDetails(id: string, isCaseMode?: boolean) {
  const isCase = isCaseMode ?? id.startsWith('c');
  const data = isCase ? caseHistoryData : liveHistoryData;
  const site = data.find(h => h.id === id) || data[0];
  let coord: [number, number] = [114.87528, 30.07444]; // default 大冶金湖
  if (site.location === '姜祥村作业点') coord = [115.07944, 30.02250];
  else if (site.location === '铁山南作业点') coord = [114.89139, 30.19389];
  else if (site.location === '白沙作业点') coord = [115.04722, 29.96778];
  else if (site.location === '大冶金湖作业点') coord = [114.87528, 30.07444];
  else if (site.location === '刘仁八作业点') coord = [114.84639, 29.94417];
  else if (site.location === '金牛镇作业点') coord = [114.78, 30.01];
  else if (site.location === '陈贵镇作业点') coord = [114.82, 30.12];
  
  return {
    ...site,
    coord
  };
}

export function getAdministrativeAddress(location: string) {
  if (location === '姜祥村作业点') return '黄石市大冶市金牛镇姜祥村';
  if (location === '铁山南作业点') return '黄石市铁山区铁山街道铁山南村';
  if (location === '白沙作业点') return '黄石市阳新县白沙镇白沙村';
  if (location === '大冶金湖作业点') return '黄石市大冶市金湖街道金湖村';
  if (location === '刘仁八作业点') return '黄石市大冶市刘仁八镇刘仁八村';
  if (location === '金牛镇作业点') return '黄石市大冶市金牛镇金牛街村';
  if (location === '陈贵镇作业点') return '黄石市大冶市陈贵镇陈贵街村';
  return `黄石市大冶市${location}`;
}

const trajectoryData = [
  { range: 0, height: 0, echo: 15, path: 0 },
  { range: 1000, height: 2500, echo: 35, path: 2500 },
  { range: 2000, height: 4800, echo: 45, path: 4800 },
  { range: 3000, height: 6800, echo: 52, path: 6800 },
  { range: 4000, height: 8200, echo: 50, path: 8200 },
  { range: 5000, height: 9000, echo: 45, path: 9000 },
  { range: 6000, height: 9200, echo: 40, path: 9200 },
  { range: 7000, height: 8800, echo: 35, path: 8800 },
  { range: 8000, height: 7800, echo: 28, path: 7800 },
  { range: 9000, height: 6200, echo: 22, path: 6200 },
  { range: 10000, height: 4000, echo: 18, path: 4000 },
  { range: 11000, height: 1500, echo: 15, path: 1500 },
  { range: 12000, height: 0, echo: 10, path: 0 }
];

const dbzHistoryData = [
  { time: '16:30', dbz_30_40: 32, dbz_40_50: 18, dbz_50_55: 10, dbz_above_55: 2, max_ref: 40 },
  { time: '16:40', dbz_30_40: 35, dbz_40_50: 22, dbz_50_55: 12, dbz_above_55: 3, max_ref: 43 },
  { time: '16:50', dbz_30_40: 42, dbz_40_50: 28, dbz_50_55: 15, dbz_above_55: 5, max_ref: 48 },
  { time: '17:00', dbz_30_40: 48, dbz_40_50: 38, dbz_50_55: 22, dbz_above_55: 8, max_ref: 55 }, // Seeding moment
  { time: '17:10', dbz_30_40: 28, dbz_40_50: 18, dbz_50_55: 8, dbz_above_55: 1, max_ref: 38 },
  { time: '17:20', dbz_30_40: 20, dbz_40_50: 10, dbz_50_55: 3, dbz_above_55: 0, max_ref: 30 },
  { time: '17:30', dbz_30_40: 15, dbz_40_50: 5, dbz_50_55: 1, dbz_above_55: 0, max_ref: 25 },
  { time: '17:40', dbz_30_40: 12, dbz_40_50: 2, dbz_50_55: 0, dbz_above_55: 0, max_ref: 20 }
];

const tabOptions = ['反射率因子', '液水分量', '垂直积分', '回波顶高'];

function getDynamicTimeRange(baseTimeStr: string) {
  const [h, m] = baseTimeStr.split(':').map(Number);
  const baseMinutes = h * 60 + m;
  
  const offsets = [-30, -20, -10, 0, 10, 20, 30, 40]; // 8 steps
  return offsets.map(offset => {
    const totalMins = (baseMinutes + offset + 1440) % 1440;
    const hh = Math.floor(totalMins / 60).toString().padStart(2, '0');
    const mm = (totalMins % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  });
}

interface RightChartsProps {
  selectedHistoryId?: string;
  isCaseMode?: boolean;
}

export function EffectEvaluationRightCharts({ selectedHistoryId = 'h1', isCaseMode = false }: RightChartsProps) {
  const [activeTab1, setActiveTab1] = useState<string>('反射率因子');
  const [activeTab2, setActiveTab2] = useState<string>('反射率因子');

  const siteDetails = getHistorySiteDetails(selectedHistoryId, isCaseMode);
  const startTimeStr = siteDetails.date.split(' ')[1] || '17:00';
  const dynamicTimes = getDynamicTimeRange(startTimeStr);

  // 动态生成符合物理弹道抛物线以及波浪起伏的 RHI 雷达回波多层自适应高精度采样数据
  const generateTrajectoryAndEchoData = () => {
    const angleValue = parseInt(siteDetails.angle) || 45;
    let burstX = 3500;
    let burstY = 5600;
    if (siteDetails.location.includes('金湖')) {
      burstX = 3700;
      burstY = 5800;
    } else if (siteDetails.location.includes('刘仁八')) {
      burstX = 3200;
      burstY = 6200;
    } else if (siteDetails.location.includes('白沙')) {
      burstX = 4000;
      burstY = 5400;
    } else {
      burstX = 3500;
      burstY = 5600;
    }

    // 计算标准弹道物理模型 (y = a*x^2 + b*x + c)
    // 抛物线顶点 x_v 约在 60% 位置，发射点 c = 1200m (作业点均高)
    const x_v = burstX * 0.6;
    const c = 1200;
    const denom = (burstX * burstX) - (2 * x_v * burstX);
    const a = (burstY - c) / denom;
    const b = -2 * a * x_v;

    const data = [];
    // 生成 X 在 0 到 8000 之间的 41 个等距点，保证折线经过插值后圆润平滑
    for (let x = 0; x <= 8000; x += 200) {
      let pathVal = null;
      if (x <= burstX) {
        pathVal = Math.round(a * x * x + b * x + c);
      }

      // 提取 selectedHistoryId 作为波动特征种子，使不同点位雷达回波形态具有专属特性且固定
      const seedNum = (selectedHistoryId.charCodeAt(0) || 0) + (selectedHistoryId.charCodeAt(1) || 0) + (selectedHistoryId.charCodeAt(2) || 0);
      const wave1 = Math.sin((x + seedNum * 80) / 900) * 450;
      const wave2 = Math.cos((x - seedNum * 40) / 700) * 350;

      // 1. 蓝色云顶薄层 (9000m - 9300m)
      const blueLayer = [Math.round(9100 + wave1 * 0.25), Math.round(9400 + wave2 * 0.25)];

      // 2. 浅绿层 (2000m - 9000m)
      const greenLightLayer = [Math.round(2000 + wave1 * 0.8), Math.round(9100 + wave2 * 0.8)];

      // 3. 深绿层 (3500m - 7800m)
      const greenDarkLayer = [
        Math.round(Math.max(2500, 3500 + wave2 * 0.7)), 
        Math.round(Math.min(8800, 7800 + wave1 * 0.7))
      ];

      // 4. 黄色层 (4200m - 6800m, 主要分布在 1000m 到 7200m 之间)
      let yellowLayer = null;
      if (x >= 1000 && x <= 7200) {
        yellowLayer = [
          Math.round(Math.max(3000, 4200 + wave1 * 0.6)),
          Math.round(Math.min(8200, 6800 + wave2 * 0.6))
        ];
      }

      // 5. 橙色层 (4800m - 5600m, 核心强回波, 2200m - 6000m 之间)
      let orangeLayer = null;
      if (x >= 2200 && x <= 6000) {
        orangeLayer = [
          Math.round(Math.max(3800, 4800 + wave2 * 0.5)),
          Math.round(Math.min(7400, 5700 + wave1 * 0.5))
        ];
      }

      data.push({
        range: x,
        path: pathVal,
        blue: blueLayer,
        greenLight: greenLightLayer,
        greenDark: greenDarkLayer,
        yellow: yellowLayer,
        orange: orangeLayer,
      });
    }

    return { data, burstX, burstY, angleValue };
  };

  const { data: dynamicTrajectoryData, burstX: actualBurstX, burstY: actualBurstY, angleValue } = generateTrajectoryAndEchoData();

  const renderBurstDot = (props: any) => {
    const { cx, cy, payload } = props;
    const targetRange = Math.floor(actualBurstX / 200) * 200;
    if (payload.range === targetRange) {
      return (
        <g key="burst-dot-g">
          {/* 炸点呼吸扩散环 */}
          <circle cx={cx} cy={cy} r={12} fill="#ef4444" opacity={0.25} className="animate-pulse" />
          <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth={1.5} />
          {/* 漂亮的炸点小横幅，提供清透的高亮标签 */}
          <rect x={cx + 10} y={cy - 12} width={105} height={20} rx={4} fill="#ffffff" stroke="#f1f5f9" strokeWidth={1} className="shadow-sm" />
          <text x={cx + 15} y={cy + 2} fill="#dc2626" fontSize={10} fontWeight="bold" fontFamily="sans-serif">
            炸点 ({actualBurstX.toLocaleString()}m)
          </text>
        </g>
      );
    }
    return null;
  };

  const dynamicDbzData = dbzHistoryData.map((item, index) => {
    const seed = selectedHistoryId.charCodeAt(0) + index;
    const offset30_40 = (seed % 5) - 2;
    const offset40_50 = (seed % 4) - 2;
    return {
      ...item,
      time: dynamicTimes[index],
      dbz_30_40: Math.max(5, item.dbz_30_40 + offset30_40),
      dbz_40_50: Math.max(2, item.dbz_40_50 + offset40_50),
      max_ref: Math.max(10, item.max_ref + (seed % 6) - 3)
    };
  });

  return (
    <div className="w-full h-full flex flex-col gap-1.5 overflow-hidden pb-1">
      {/* Panel 1: 作业轨迹雷达剖面 (Operation trajectory radar profile) */}
      <div className="bg-white border border-slate-200/50 shadow-sm rounded-xl p-2.5 flex flex-col gap-1 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-blue-600 rounded-full" />
            作业轨迹雷达剖面 ({siteDetails.location})
          </h4>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded">
              作业合理性: {siteDetails.status}
            </span>
          </div>
        </div>

        {/* Profile SVG Area */}
        <div className="flex-1 w-full mt-0.5 relative bg-slate-50/40 rounded-lg p-1 overflow-hidden border border-slate-200/50 flex flex-col justify-center">
          {(() => {
            // Coordinate mapping functions
            const mapX = (xVal: number) => 45 + (xVal / 8000) * 410;
            const mapY = (yVal: number) => 202 - (yVal / 10000) * 187; // 202 is X axis, 15 is top limit (187px height)

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

            const x1 = mapX(actualBurstX);
            const y1 = mapY(actualBurstY);

            const vertexX = actualBurstX * 0.55;
            const vertexY = Math.max(actualBurstY + 1200, Math.min(10500, 6800 + (angleValue - 45) * 120));
            const xc = mapX(vertexX);
            const yc = mapY(vertexY);

            return (
              <svg viewBox="0 0 500 220" className="w-full h-full" style={{ display: 'block' }}>
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
                    strokeWidth={0.8}
                    strokeDasharray="4,4"
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
                    strokeWidth={0.8}
                    strokeDasharray="4,4"
                  />
                ))}

                {/* 4. Y-Axis and Ticks/Labels */}
                <line x1={mapX(0)} y1={mapY(0)} x2={mapX(0)} y2={mapY(10000) - 10} stroke="#0284c7" strokeWidth={1.2} />
                {[0, 2000, 4000, 6000, 8000, 10000].map((hVal) => (
                  <g key={hVal}>
                    <line x1={mapX(0) - 4} y1={mapY(hVal)} x2={mapX(0)} y2={mapY(hVal)} stroke="#0284c7" strokeWidth={1.2} />
                    <text
                      x={mapX(0) - 8}
                      y={mapY(hVal) + 3.5}
                      fill="#475569"
                      fontSize="11"
                      fontWeight="500"
                      textAnchor="end"
                      fontFamily="sans-serif"
                    >
                      {hVal / 1000}
                    </text>
                  </g>
                ))}

                {/* 5. X-Axis and Ticks/Labels */}
                <line x1={mapX(0)} y1={mapY(0)} x2={mapX(8000) + 15} y2={mapY(0)} stroke="#0284c7" strokeWidth={1.2} />
                {[0, 2000, 4000, 6000, 8000].map((rVal) => (
                  <g key={rVal}>
                    <line x1={mapX(rVal)} y1={mapY(0)} x2={mapX(rVal)} y2={mapY(0) + 4} stroke="#0284c7" strokeWidth={1.2} />
                    <text
                      x={mapX(rVal)}
                      y={mapY(0) + 13}
                      fill="#475569"
                      fontSize="11"
                      fontWeight="500"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {rVal.toLocaleString()}
                    </text>
                  </g>
                ))}

                {/* 6. Axis Titles */}
                <text x={mapX(0) - 8} y={mapY(10000) - 6} fill="#0284c7" fontSize={10} fontWeight="600" textAnchor="end" fontFamily="sans-serif">
                  高度(km)
                </text>
                <text x={mapX(8000) + 15} y={mapY(0) + 12} fill="#0284c7" fontSize={10} fontWeight="600" textAnchor="start" fontFamily="sans-serif">
                  距离(m)
                </text>

                {/* 7. Trajectory Path */}
                <path
                  d={`M ${x0} ${y0} Q ${xc} ${yc} ${x1} ${y1}`}
                  stroke="#000000"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  fill="none"
                />

                {/* 8. Burst Dot and Legend Badge */}
                <circle cx={x1} cy={y1} r={8} fill="#ef4444" opacity={0.25} className="animate-pulse" />
                <circle cx={x1} cy={y1} r={4} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />
                <g transform={`translate(${x1 + 8}, ${y1 - 7})`}>
                  <rect width={75} height={15} rx={3} fill="#ffffff" stroke="#e2e8f0" strokeWidth={1} className="shadow-sm" />
                  <text x={6} y={11} fill="#dc2626" fontSize={8} fontWeight="bold" fontFamily="sans-serif">
                    炸点 ({actualBurstX.toLocaleString()}m)
                  </text>
                </g>
              </svg>
            );
          })()}
        </div>
      </div>

      {/* Panel 2: 爆炸点雷达垂直分布变化 (Radar vertical distribution change at burst site) */}
      <div className="bg-white border border-slate-200/50 shadow-sm rounded-xl p-2.5 flex flex-col gap-1 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-blue-600 rounded-full" />
            爆炸点雷达垂直分布变化
          </h4>
          <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded">
            作业有效性: 有效
          </span>
        </div>

        {/* Time-Height Profile Heatmap Mockup */}
        <div className="flex-1 min-h-0 w-full mt-0.5 bg-white border border-slate-200/60 rounded-lg p-1.5 px-2 flex flex-col relative justify-between overflow-hidden">
          
          {/* Scientific grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-40">
            <div className="border-b border-slate-100 w-full" />
            <div className="border-b border-slate-100 w-full" />
            <div className="border-b border-slate-100 w-full" />
            <div className="border-b border-slate-100 w-full" />
          </div>

          <span className="text-[8px] text-slate-500 font-sans absolute top-1 left-2 font-medium">高度 (m)</span>
          <span className="text-[8px] text-slate-500 font-sans absolute bottom-0.5 right-2 font-medium">时间序列</span>

          {/* A vertical bar sequence showing cloud thinning after 17:00 */}
          <div className="flex-1 flex gap-1 items-end px-6 pt-2 pb-0.5 relative z-10">
            {[12000, 10000, 8000, 6000, 4000, 2000, 0].map((h, index) => (
              <div key={index} className="flex-1 flex flex-col gap-0.5 h-full justify-end">
                {[1, 2, 3, 4, 5, 6].map((slice) => {
                  const isRightSide = index > 3;
                  let bg = 'bg-emerald-500';
                  if (!isRightSide) {
                    if (slice === 3 || slice === 4) bg = 'bg-red-500';
                    else if (slice === 2 || slice === 5) bg = 'bg-amber-500';
                  } else {
                    if (slice === 3 || slice === 4) bg = 'bg-emerald-400/80';
                    else bg = 'bg-blue-400/60';
                  }
                  return (
                    <div 
                      key={slice} 
                      className={`w-full flex-1 min-h-[3px] rounded-[1px] ${bg} transition-all duration-500 hover:scale-105`} 
                      title={`高度: ${(7 - slice) * 2000}米 时相: ${index}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Seeding vertical marker line with dark colors for white background */}
          <div className="absolute top-0 bottom-0 left-[50%] w-[1px] border-l border-dashed border-slate-300 flex items-center justify-center pointer-events-none z-20">
            <span className="text-[7px] text-white bg-blue-600 px-1 py-0.5 rounded absolute top-2.5 rotate-90 whitespace-nowrap shadow-sm">作业时刻</span>
          </div>

          <div className="flex justify-between px-6 text-[8px] text-slate-500 font-sans relative z-10">
            <span>{dynamicTimes[0]}</span>
            <span>{dynamicTimes[1]}</span>
            <span>{dynamicTimes[2]}</span>
            <span className="text-blue-600 font-bold">{dynamicTimes[3]}</span>
            <span>{dynamicTimes[4]}</span>
            <span>{dynamicTimes[5]}</span>
            <span>{dynamicTimes[6]}</span>
          </div>
        </div>
      </div>

      {/* Panel 3: 爆炸点区域雷达反射率统计变化 (Line Chart of dBZ reduction) */}
      <div className="bg-white border border-slate-200/50 shadow-sm rounded-xl p-2.5 flex flex-col gap-1 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-blue-600 rounded-full" />
            爆炸点区域雷达反射率统计变化
          </h4>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-slate-500">雷达变化率:</span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded">
              -50%
            </span>
          </div>
        </div>

        {/* Trend line chart with custom side legend */}
        <div className="flex-1 min-h-0 w-full mt-0.5 flex relative">
          
          {/* Chart area container */}
          <div className="flex-1 h-full relative">
            {/* Top X/Y Axis Labels placed perfectly above the axes ticks with a clean gap */}
            <div className="absolute left-[7px] top-[0px] w-[28px] text-center text-[8px] text-slate-400 font-medium font-sans select-none pointer-events-none">km²</div>
            <div className="absolute right-[7px] top-[0px] w-[28px] text-center text-[8px] text-slate-400 font-medium font-sans select-none pointer-events-none">dBZ</div>

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicDbzData} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  ticks={[dynamicTimes[1], dynamicTimes[3], dynamicTimes[5], dynamicTimes[7]]}
                  tick={{ fontSize: 9, fill: '#475569' }} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={2}
                  height={18}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 60]}
                  ticks={[0, 15, 30, 45, 60]}
                  tick={{ fontSize: 9, fill: '#475569' }} 
                  tickLine={false} 
                  axisLine={false}
                  width={22}
                  tickMargin={2}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 60]}
                  ticks={[0, 15, 30, 45, 60]}
                  tick={{ fontSize: 9, fill: '#475569' }} 
                  tickLine={false} 
                  axisLine={false}
                  width={22}
                  tickMargin={2}
                />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '9px', color: '#fff' }}
                />
                <ReferenceArea 
                  yAxisId="left"
                  x1={dynamicTimes[2]} 
                  x2={dynamicTimes[4]} 
                  {...({ fill: '#22c55e', fillOpacity: 0.06 } as any)}
                />
                <ReferenceLine 
                  yAxisId="left"
                  x={dynamicTimes[3]} 
                  stroke="#22c55e" 
                  strokeDasharray="3 3" 
                  strokeWidth={1.2}
                  label={{ 
                    value: '作业时刻', 
                    fill: '#15803d', 
                    fontSize: 8, 
                    position: 'insideTopLeft',
                    dy: 4,
                    dx: 4,
                    fontWeight: 'bold'
                  }} 
                />
                <Line yAxisId="left" type="monotone" dataKey="dbz_30_40" stroke="#3b82f6" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} name="30~40dBZ" />
                <Line yAxisId="left" type="monotone" dataKey="dbz_40_50" stroke="#f97316" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} name="40~50dBZ" />
                <Line yAxisId="left" type="monotone" dataKey="dbz_50_55" stroke="#22c55e" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} name="50~55dBZ" />
                <Line yAxisId="left" type="monotone" dataKey="dbz_above_55" stroke="#ef4444" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} name=">55dBZ" />
                <Line yAxisId="right" type="monotone" dataKey="max_ref" stroke="#a855f7" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} name="MAX_REF" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Side/Overlay Legend styled EXACTLY like the user picture with straight line indicators */}
          <div className="w-[82px] h-full flex flex-col justify-center gap-1 border-l border-slate-100 pl-2 select-none">
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 flex items-center justify-center relative">
                <div className="w-full h-[1.5px] bg-[#3b82f6] rounded-full" />
              </div>
              <span className="text-[9px] font-sans text-slate-600 font-medium whitespace-nowrap">30~40dBZ</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-4 h-2 flex items-center justify-center relative">
                <div className="w-full h-[1.5px] bg-[#f97316] rounded-full" />
              </div>
              <span className="text-[9px] font-sans text-slate-600 font-medium whitespace-nowrap">40~50dBZ</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-4 h-2 flex items-center justify-center relative">
                <div className="w-full h-[1.5px] bg-[#22c55e] rounded-full" />
              </div>
              <span className="text-[9px] font-sans text-slate-600 font-medium whitespace-nowrap">50~55dBZ</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-4 h-2 flex items-center justify-center relative">
                <div className="w-full h-[1.5px] bg-[#ef4444] rounded-full" />
              </div>
              <span className="text-[9px] font-sans text-slate-600 font-medium whitespace-nowrap">&gt;55dBZ</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-4 h-2 flex items-center justify-center relative">
                <div className="w-full h-[1.5px] bg-[#a855f7] rounded-full" />
              </div>
              <span className="text-[9px] font-sans text-slate-600 font-medium whitespace-nowrap">MAX_REF</span>
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-4 h-2 bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-sm" />
              <span className="text-[9px] font-sans text-slate-600 font-medium whitespace-nowrap">作业时刻</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HistoryListProps {
  selectedHistoryId: string;
  setSelectedHistoryId: (id: string) => void;
  isCaseMode?: boolean;
}

export function EffectEvaluationHistoryList({ selectedHistoryId, setSelectedHistoryId, isCaseMode = false }: HistoryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeHistoryData = isCaseMode ? caseHistoryData : liveHistoryData;

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (containerRef.current) {
        // Height of the list container. 
        // Card height is approx 115px + gap 10px = 125px.
        const containerHeight = containerRef.current.clientHeight;
        const calculatedItems = Math.max(1, Math.floor(containerHeight / 125));
        setItemsPerPage(calculatedItems);
      }
    };

    const observer = new ResizeObserver(() => {
      updateItemsPerPage();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const totalPages = Math.ceil(activeHistoryData.length / itemsPerPage);
  // Ensure current page is valid when total pages change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentData = activeHistoryData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
          历史作业信息
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
          共 {activeHistoryData.length} 条记录
        </span>
      </div>

      {/* Scrollable list of cards styled exactly like operational commands */}
      <div ref={containerRef} className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 -mr-1 scrollbar-none">
        {currentData.map((card, index) => {
          const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
          const isSelected = selectedHistoryId === card.id;
          
          // Get coordinates for geographic location
          const details = getHistorySiteDetails(card.id, isCaseMode);
          const coord = details.coord;
          
          // Format combined date time range: YYYY-MM-DD HH:MM-HH:MM
          const [datePart, startTimePart] = card.date.split(' ');
          const fullTimeRange = `${datePart} ${startTimePart}-${card.time}`;

          return (
            <div
              key={card.id}
              onClick={() => setSelectedHistoryId(card.id)}
              className={`p-2.5 rounded-lg cursor-pointer border transition-all flex flex-col gap-1.5 ${
                isSelected
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50/50 to-white shadow-md ring-1 ring-blue-300'
                  : 'border-slate-100 bg-gradient-to-r from-slate-50 to-white hover:border-slate-200 hover:shadow-md shadow-sm'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-4 text-right">
                    {globalIndex}.
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-sm ${
                    card.type === '火箭' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {card.type}
                  </span>
                  <span className="text-sm font-bold text-slate-700 ml-0.5">{card.location}</span>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-600">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium">时间: <span className="font-mono">{fullTimeRange}</span></span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium">
                  地点: {getAdministrativeAddress(card.location)}
                </span>
              </div>

              {/* Action parameter details in single line layout with blue Lucide-react icons */}
              <div className="flex items-center justify-between px-1 text-slate-600 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium">用量: {card.ammo}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium">仰角: {card.angle}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium">方位: <span className="font-mono">{card.azimuth}</span></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
          <span className="text-[10px] text-slate-500 font-medium">
            第 {currentPage} 页 / 共 {totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EffectEvaluationRight() {
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('h1');
  return (
    <div className="w-full h-full flex gap-3">
      <div className="flex-1 min-w-0 bg-white rounded-xl p-3 shadow-sm border border-slate-200/60 overflow-y-auto">
        <EffectEvaluationRightCharts />
      </div>
      <div className="w-[280px] shrink-0 bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 overflow-hidden">
        <EffectEvaluationHistoryList selectedHistoryId={selectedHistoryId} setSelectedHistoryId={setSelectedHistoryId} />
      </div>
    </div>
  );
}
