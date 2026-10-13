import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, ReferenceLine, Customized } from 'recharts';
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

/**
 * 计算实况模式下当前作业力量面板的6个时刻：
 * 最后一个时刻为当前系统时间向上取整到整点（如15:47取16:00；恰为16:00时仍取16:00），
 * 然后以1小时为间隔向前取5个时刻。
 */
function getLiveForceTimeMoments(now: Date = new Date()): string[] {
  const endHourDate = new Date(now);
  if (
    endHourDate.getMinutes() > 0 ||
    endHourDate.getSeconds() > 0 ||
    endHourDate.getMilliseconds() > 0
  ) {
    endHourDate.setHours(endHourDate.getHours() + 1);
  }
  endHourDate.setMinutes(0, 0, 0);

  const times: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(endHourDate.getTime() - i * 3600 * 1000);
    const h = String(d.getHours()).padStart(2, '0');
    times.push(`${h}:00`);
  }
  return times;
}

// 自定义图表 Tooltip，修复默认 Tooltip 内容溢出、行间距过大及无单位的问题
const ForceChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const samplePayload = payload[0]?.payload;
  if (!samplePayload) return null;
  if (samplePayload?.isFuture) return null;

  // 历史个例模式专属 Tooltip：鼠标悬停时展示实际统计时段、作业器具、次数及用弹量；未结束小时标注“截至当前回放时刻”
  if (samplePayload.timeRangeDesc !== undefined) {
    const { timeRangeDesc, isPartialHour, rocketOps = 0, gunOps = 0, rocketAmmo = 0, gunAmmo = 0 } = samplePayload;

    return (
      <div className="bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-2 shadow-xl border border-slate-200/90 text-xs min-w-[170px] pointer-events-none select-none">
        <div className="pb-1 mb-1.5 border-b border-slate-100 flex items-center justify-between">
          <span className="font-mono font-bold text-slate-800 text-[11px]">
            {isPartialHour ? `${label}截至当前` : (timeRangeDesc === '起始时刻' ? label : timeRangeDesc)}
          </span>
        </div>

        <div className="space-y-1">
          {/* 火箭弹作业次数 */}
          <div className="flex items-center justify-between text-[11px] leading-tight">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0 bg-[#3b82f6]" />
              <span className="text-slate-700">火箭弹作业次数</span>
            </div>
            <div className="font-mono shrink-0">
              <span className="font-bold text-slate-800">{rocketOps}</span>
              <span className="text-slate-400 ml-0.5 text-[10px]">次</span>
            </div>
          </div>

          {/* 火箭弹用弹量 */}
          <div className="flex items-center justify-between text-[11px] leading-tight">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0 bg-[#3b82f6]" />
              <span className="text-slate-700">火箭弹用弹量</span>
            </div>
            <div className="font-mono shrink-0">
              <span className="font-bold text-slate-800">{rocketAmmo}</span>
              <span className="text-slate-400 ml-0.5 text-[10px]">发</span>
            </div>
          </div>

          {/* 高炮作业次数 */}
          <div className="flex items-center justify-between text-[11px] leading-tight">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0 bg-[#10b981]" />
              <span className="text-slate-700">高炮作业次数</span>
            </div>
            <div className="font-mono shrink-0">
              <span className="font-bold text-slate-800">{gunOps}</span>
              <span className="text-slate-400 ml-0.5 text-[10px]">次</span>
            </div>
          </div>

          {/* 高炮用弹量 */}
          <div className="flex items-center justify-between text-[11px] leading-tight">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0 bg-[#10b981]" />
              <span className="text-slate-700">高炮用弹量</span>
            </div>
            <div className="font-mono shrink-0">
              <span className="font-bold text-slate-800">{gunAmmo}</span>
              <span className="text-slate-400 ml-0.5 text-[10px]">发</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 实况模式 Tooltip
  const validPayload = payload.filter((entry: any) => entry.value !== null && entry.value !== undefined);
  if (!validPayload.length) return null;

  // 排序：火箭器具在前，高炮器具在后，保持与历史模式一致的分组呈现
  const sortedPayload = [...validPayload].sort((a: any, b: any) => {
    const aName = a.name || '';
    const bName = b.name || '';
    const aIsRocket = aName.includes('火箭');
    const bIsRocket = bName.includes('火箭');
    if (aIsRocket && !bIsRocket) return -1;
    if (!aIsRocket && bIsRocket) return 1;
    return 0;
  });

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-2 shadow-xl border border-slate-200/90 text-xs min-w-[145px] pointer-events-none select-none">
      <div className="text-[11px] font-bold text-slate-700 pb-1 mb-1.5 border-b border-slate-100 flex items-center justify-between">
        <span className="font-mono font-bold text-slate-800 text-[11px]">{label}</span>
      </div>
      <div className="space-y-1">
        {sortedPayload.map((entry: any, index: number) => {
          let name = entry.name || '';
          let unit = '';
          const displayVal = entry.value;

          if (name.includes('库存') || name.includes('弹')) {
            unit = '发';
          } else if (name.includes('就绪') || name.includes('点')) {
            unit = '个';
          } else if (name.includes('作业')) {
            unit = '次';
          }

          // 圆点颜色严格一致：火箭统一为蓝色(#3b82f6)，高炮统一为绿色(#10b981)
          const isGun = name.includes('高炮');
          const dotColor = isGun ? '#10b981' : '#3b82f6';

          return (
            <div 
              key={`tip-${index}`} 
              className="flex items-center justify-between gap-3 text-[11px] leading-tight"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="text-slate-700 truncate">{name}</span>
              </div>
              <div className="font-mono shrink-0">
                <span className="font-bold text-slate-800">{displayVal}</span>
                {unit && <span className="text-slate-400 ml-0.5 text-[10px] font-normal">{unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


interface OperationCommandLeftProps {
  isCaseMode: boolean;
  playbackMinutes: number;
  activeRegion: string;
  setActiveRegion: (region: string) => void;
  activeCaseId?: string;
}

export default function OperationCommandLeft({
  isCaseMode,
  playbackMinutes,
  activeRegion,
  setActiveRegion,
  activeCaseId = '2026-06-18'
}: OperationCommandLeftProps) {
  // 实时跟踪系统时间，使时间标签随系统时间变化实时更新
  const [currentSystemTime, setCurrentSystemTime] = useState(() => new Date());
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [plotWidth, setPlotWidth] = useState(260);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateWidth = () => {
      if (chartContainerRef.current) {
        const w = chartContainerRef.current.clientWidth;
        if (w > 60) {
          setPlotWidth(w - 50);
        }
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(chartContainerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSystemTime(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Time formatting helper
  const formatPlaybackTime = (minutes: number) => {
    const baseHour = 15;
    const totalMinutes = minutes;
    const h = Math.floor(totalMinutes / 60) + baseHour;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

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

  // 实况模式下动态根据当前系统时间生成6个整点时刻
  const liveTimeMoments = getLiveForceTimeMoments(currentSystemTime);

  // Generate dynamic time series to climb up to the final values for the 6 moments
  const liveForceTimeSeriesData = liveTimeMoments.map((timeStr, index) => {
    const steps = liveTimeMoments.length - 1; // 5 steps
    
    const rReady = index === 0 ? Math.min(3, activeRocketReadyCount) : Math.min(activeRocketReadyCount, Math.round(3 + (index / steps) * (activeRocketReadyCount - 3)));
    const gReady = index === 0 ? Math.min(1, activeGunReadyCount) : Math.min(activeGunReadyCount, Math.round(1 + (index / steps) * (activeGunReadyCount - 1)));
    
    const rAmmo = rReady * 20;
    const gAmmo = gReady * 60;

    return {
      time: timeStr,
      rocketReady: rReady,
      gunReady: gReady,
      rocketAmmo: rAmmo,
      gunAmmo: gAmmo,
    };
  });

  // ========== 历史个例模式数据处理 ==========
  // 1. 作业记录定义（含精确触发分钟数，以15:00为分钟0）
  // 湖北黄石个例 (2026-06-18)
  // - 15:18: 白沙作业点, 火箭 4发, 1次 (minute 18)
  // - 15:28: 刘仁八作业点, 火箭 4发, 1次 (minute 28)
  // - 17:18: 大冶金湖作业点, 火箭 4发, 1次 (minute 138)
  // 江苏南京个例 (2026-07-02)
  // - 15:10: 大杨树作业点, 高炮 35发, 1次 (minute 10)
  // - 15:20: 太平庄高炮站, 高炮 40发, 1次 (minute 20)
  // - 15:30: 三道沟火箭点, 火箭 8发, 1次 (minute 30)

  interface CaseOpEvent {
    minute: number; // 相对个例起始时刻(15:00)的分钟数
    timeStr: string; // "15:18"
    hourIndex: number; // 0 for 15:00-16:00, 1 for 16:00-17:00, 2 for 17:00-18:00
    type: 'rocket' | 'gun';
    ammo: number;
    ops: number;
    station: string;
  }

  const caseOps: CaseOpEvent[] = activeCaseId === '2026-07-02' ? [
    { minute: 10, timeStr: '15:10', hourIndex: 0, type: 'gun', ammo: 35, ops: 1, station: '大杨树作业点' },
    { minute: 20, timeStr: '15:20', hourIndex: 0, type: 'gun', ammo: 40, ops: 1, station: '太平庄高炮站' },
    { minute: 30, timeStr: '15:30', hourIndex: 0, type: 'rocket', ammo: 8, ops: 1, station: '三道沟火箭点' },
  ] : [
    { minute: 18, timeStr: '15:18', hourIndex: 0, type: 'rocket', ammo: 4, ops: 1, station: '白沙作业点' },
    { minute: 28, timeStr: '15:28', hourIndex: 0, type: 'rocket', ammo: 4, ops: 1, station: '刘仁八作业点' },
    { minute: 138, timeStr: '17:18', hourIndex: 2, type: 'rocket', ammo: 4, ops: 1, station: '大冶金湖作业点' },
  ];

  // 计算当前回放时刻的向上取整整点
  // 15:00开始对应 offset 0.
  // 15:47 -> minute 47, ceil to 60 (16:00)
  // 16:00 -> minute 60, ceil is 60 (16:00)
  // 若 minute === 0，末端时刻为 15:00 (至少留1小时展示: 60分钟即 16:00)
  const safePlaybackMinutes = Math.max(0, playbackMinutes);
  const endHourMinutes = safePlaybackMinutes === 0 ? 60 : (safePlaybackMinutes % 60 === 0 ? safePlaybackMinutes : Math.ceil(safePlaybackMinutes / 60) * 60);

  // 柱状图以1小时为统计间隔，柱形对应的时间表示该时刻前1小时的用弹量。
  // 例如16:00对应15:00（含）至16:00（不含）的用弹量。
  // 当前回放时刻不足整点时，末端柱仅统计截至当前回放时刻已发生的作业。
  // 例如回放至15:47，16:00对应的柱形仅统计15:00至15:47的用弹量，并随回放推进更新。
  const numHours = Math.max(1, Math.round(endHourMinutes / 60));
  const hourlyAmmoMap = new Map<number, { rocketAmmo: number; gunAmmo: number }>();
  for (let h = 1; h <= numHours; h++) {
    const hStart = (h - 1) * 60;
    const hEnd = h * 60;
    // 落在该自然小时前1小时区间[hStart, hEnd)且截至当前回放时刻已发生(<= safePlaybackMinutes)的作业
    const opsInHour = caseOps.filter(op => op.minute >= hStart && op.minute < hEnd && op.minute <= safePlaybackMinutes);
    const rAmmo = opsInHour.filter(op => op.type === 'rocket').reduce((acc, cur) => acc + cur.ammo, 0);
    const gAmmo = opsInHour.filter(op => op.type === 'gun').reduce((acc, cur) => acc + cur.ammo, 0);
    hourlyAmmoMap.set(hEnd, { rocketAmmo: rAmmo, gunAmmo: gAmmo });
  }

  // 历史个例模式图表数据模型：
  // 1小时为一个数据点，标注时刻显示整小时 HH:00（如15:00, 16:00, 17:00等）
  // 标注时刻表示此前1小时的统计数据（例如16:00对应15:00—16:00；不足完整小时的，按实际回放范围统计，例如回放至15:47，16:00对应15:00—15:47）
  // 15:00为开端时刻，此前无个例作业，作业次数为0，用弹量为0
  interface HourlyChartPoint {
    time: string; // "15:00", "16:00", ...
    hourIndex: number; // 0 for 15:00, 1 for 16:00, ...
    minute: number; // 0, 60, 120, ...
    timeRangeDesc: string; // "15:00—16:00" 或 "15:00—15:47"
    isPartialHour: boolean; // 是否不足整小时（末端小时未结束）
    // 折线：按1小时统计作业次数（左纵轴）
    rocketOps: number;
    gunOps: number;
    // 柱形：按1小时统计用弹量（右纵轴）
    rocketAmmo: number;
    gunAmmo: number;
    isFuture?: boolean;
  }

  const caseChartData: HourlyChartPoint[] = [];

  // 起始时刻点（开端时刻 15:00）：此前无作业，作为图表起点
  caseChartData.push({
    time: formatPlaybackTime(0),
    hourIndex: 0,
    minute: 0,
    timeRangeDesc: '起始时刻',
    isPartialHour: false,
    rocketOps: 0,
    gunOps: 0,
    rocketAmmo: 0,
    gunAmmo: 0,
    isFuture: false,
  });

  // 各自然小时点 (h = 1 到 numHours)
  // 对应时刻格式如 16:00 (h=1), 17:00 (h=2), 18:00 (h=3)
  for (let h = 1; h <= numHours; h++) {
    const hStart = (h - 1) * 60;
    const hEnd = h * 60;
    const timeLabel = formatPlaybackTime(hEnd);
    
    // 实际统计区间：[hStart, Math.min(hEnd, safePlaybackMinutes)]
    const effectiveEnd = Math.min(hEnd, safePlaybackMinutes);
    const isPartial = safePlaybackMinutes < hEnd;
    const timeRangeDesc = `${formatPlaybackTime(hStart)}—${formatPlaybackTime(effectiveEnd)}`;

    // 落在实际统计区间内的作业
    const opsInWindow = caseOps.filter(op => op.minute >= hStart && op.minute <= effectiveEnd);
    
    const rOps = opsInWindow.filter(op => op.type === 'rocket').reduce((acc, cur) => acc + cur.ops, 0);
    const gOps = opsInWindow.filter(op => op.type === 'gun').reduce((acc, cur) => acc + cur.ops, 0);
    const rAmmo = opsInWindow.filter(op => op.type === 'rocket').reduce((acc, cur) => acc + cur.ammo, 0);
    const gAmmo = opsInWindow.filter(op => op.type === 'gun').reduce((acc, cur) => acc + cur.ammo, 0);

    caseChartData.push({
      time: timeLabel,
      hourIndex: h,
      minute: hEnd,
      timeRangeDesc,
      isPartialHour: isPartial,
      rocketOps: rOps,
      gunOps: gOps,
      rocketAmmo: rAmmo,
      gunAmmo: gAmmo,
      isFuture: false,
    });
  }

  // 计算用于左右纵轴智能刻度范围的最大值
  const maxOpsVal = Math.max(
    1,
    ...caseChartData.map(d => Math.max(d.rocketOps || 0, d.gunOps || 0))
  );
  // 纵轴刻度从0开始，采用整数刻度，最多展示3个标签
  // 当 maxOpsVal 为 1 时，ticks=[0, 1] 或 [0, 1, 2]
  const leftAxisMax = maxOpsVal <= 2 ? 2 : (maxOpsVal % 2 === 0 ? maxOpsVal : maxOpsVal + 1);
  const leftAxisTicks = leftAxisMax === 2 ? [0, 1, 2] : [0, Math.round(leftAxisMax / 2), leftAxisMax];

  const maxAmmoVal = Math.max(
    10,
    ...caseChartData.map(d => Math.max(d.rocketAmmo || 0, d.gunAmmo || 0))
  );
  // 右纵轴用弹量采用整十或合适整数倍
  let rightAxisMax = Math.ceil(maxAmmoVal / 10) * 10;
  if (rightAxisMax % 2 !== 0) rightAxisMax += 10;
  const rightAxisTicks = [0, rightAxisMax / 2, rightAxisMax];

  // 横轴整小时标签：HH:00，最多6个标签
  const allHourTicks = caseChartData.map(d => d.time);
  let caseXAxisTicks: string[] = allHourTicks;
  if (allHourTicks.length > 6) {
    const step = Math.ceil((allHourTicks.length - 1) / 5);
    caseXAxisTicks = [];
    for (let i = 0; i < allHourTicks.length; i += step) {
      caseXAxisTicks.push(allHourTicks[i]);
    }
    if (caseXAxisTicks[caseXAxisTicks.length - 1] !== allHourTicks[allHourTicks.length - 1]) {
      caseXAxisTicks.push(allHourTicks[allHourTicks.length - 1]);
    }
  }

  // 汇总卡片数值计算：
  // 累计作业次数与累计用弹量（截至当前回放时刻已发生）
  let rocketOpsCount = 0;
  let rocketAmmoCount = 0;
  let gunOpsCount = 0;
  let gunAmmoCount = 0;

  if (isCaseMode) {
    const firedOps = caseOps.filter(op => op.minute <= safePlaybackMinutes);
    rocketOpsCount = firedOps.filter(op => op.type === 'rocket').reduce((acc, cur) => acc + cur.ops, 0);
    gunOpsCount = firedOps.filter(op => op.type === 'gun').reduce((acc, cur) => acc + cur.ops, 0);
    rocketAmmoCount = firedOps.filter(op => op.type === 'rocket').reduce((acc, cur) => acc + cur.ammo, 0);
    gunAmmoCount = firedOps.filter(op => op.type === 'gun').reduce((acc, cur) => acc + cur.ammo, 0);
  } else {
    rocketOpsCount = 10;
    rocketAmmoCount = 80;
    gunOpsCount = 10;
    gunAmmoCount = 112;
  }

  // 最新作业上报结果
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
    if (activeCaseId === '2026-07-02') {
      if (safePlaybackMinutes >= 30) {
        latestResult = {
          station: '三道沟火箭点',
          type: '火箭',
          time: '15:30',
          count: '8发',
          angle: '45°',
          azimuth: '180°',
          displayTime: '15:30'
        };
      } else if (safePlaybackMinutes >= 20) {
        latestResult = {
          station: '太平庄高炮站',
          type: '高炮',
          time: '15:20',
          count: '40发',
          angle: '52°',
          azimuth: '120°',
          displayTime: '15:20'
        };
      } else if (safePlaybackMinutes >= 10) {
        latestResult = {
          station: '大杨树作业点',
          type: '高炮',
          time: '15:10',
          count: '35发',
          angle: '48°',
          azimuth: '150°',
          displayTime: '15:10'
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
    } else {
      if (safePlaybackMinutes >= 142) {
        latestResult = {
          station: '大冶金湖作业点',
          type: '火箭',
          time: '17:18',
          count: '4发',
          angle: '--',
          azimuth: '--',
          displayTime: '17:22'
        };
      } else if (safePlaybackMinutes >= 32) {
        latestResult = {
          station: '刘仁八作业点',
          type: '火箭',
          time: '15:28',
          count: '4发',
          angle: '56°',
          azimuth: '215°',
          displayTime: '15:32'
        };
      } else if (safePlaybackMinutes >= 22) {
        latestResult = {
          station: '白沙作业点',
          type: '火箭',
          time: '15:18',
          count: '4发',
          angle: '--',
          azimuth: '210°',
          displayTime: '15:22'
        };
      } else {
        latestResult = {
          station: '无当前回放作业',
          type: '火箭',
          time: '--:--',
          count: '0发',
          angle: '--',
          azimuth: '--',
          displayTime: '--:--'
        };
      }
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
          {isCaseMode ? "作业统计" : "当前作业力量"}
        </h3>
        
        <div className="flex gap-2.5 mb-4 shrink-0">
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-white rounded-lg p-2.5 border border-blue-100 shadow-sm">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              火箭弹
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
        
        <div className="flex-1 min-h-0 w-full relative flex flex-col">
          {isCaseMode ? (
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium select-none pointer-events-none shrink-0 pl-1 pr-1 mb-0.5">
              <span>次数（次）</span>
              <span>用弹量（发）</span>
            </div>
          ) : (
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium select-none pointer-events-none shrink-0 pl-1 pr-1 mb-0.5">
              <span>站点（个）</span>
              <span>弹药（发）</span>
            </div>
          )}
          <div ref={chartContainerRef} className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {isCaseMode ? (
                <ComposedChart 
                  data={caseChartData as any} 
                  margin={{ top: 8, right: 0, left: -20, bottom: 0 }} 
                  barGap={3} 
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    ticks={caseXAxisTicks}
                    interval={0}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    dy={5} 
                  />
                  <YAxis 
                    yAxisId="left" 
                    domain={[0, leftAxisTicks[leftAxisTicks.length - 1]]}
                    ticks={leftAxisTicks}
                    allowDecimals={false}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, rightAxisTicks[rightAxisTicks.length - 1]]}
                    ticks={rightAxisTicks}
                    allowDecimals={false}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    content={<ForceChartTooltip />}
                    wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  />
                  <Legend 
                    content={() => (
                      <div className="flex items-center justify-center gap-6 pt-2 select-none text-[10px] text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                          <span>火箭弹</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                          <span>高炮</span>
                        </div>
                      </div>
                    )}
                  />

                  {/* 柱形：按1小时统计用弹量（右纵轴，火箭使用蓝色，高炮使用绿色） */}
                  <Bar 
                    yAxisId="right" 
                    dataKey="rocketAmmo" 
                    name="火箭弹用弹量(发)" 
                    fill="#3b82f6" 
                    radius={[3, 3, 0, 0]}
                    maxBarSize={16}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="gunAmmo" 
                    name="高炮用弹量(发)" 
                    fill="#10b981" 
                    radius={[3, 3, 0, 0]}
                    maxBarSize={16}
                  />

                  {/* 折线：按1小时统计作业次数（左纵轴，火箭使用蓝色，高炮使用绿色） */}
                  <Line 
                    yAxisId="left" 
                    type="linear" 
                    dataKey="rocketOps" 
                    name="火箭弹作业次数(次)" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 4 }} 
                  />
                  <Line 
                    yAxisId="left" 
                    type="linear" 
                    dataKey="gunOps" 
                    name="高炮作业次数(次)" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2 }}
                    activeDot={{ r: 4 }} 
                  />
                </ComposedChart>
              ) : (
                <ComposedChart 
                  data={liveForceTimeSeriesData as any} 
                  margin={{ top: 4, right: 0, left: -20, bottom: 0 }} 
                  barGap={2} 
                  barCategoryGap="25%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={5} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    content={<ForceChartTooltip />}
                    wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  />
                  <Legend 
                    content={() => (
                      <div className="flex items-center justify-center gap-6 pt-2 select-none text-[10px] text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                          <span>火箭弹</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                          <span>高炮</span>
                        </div>
                      </div>
                    )}
                  />
                
                  <Bar yAxisId="right" dataKey="rocketAmmo" name="火箭弹库存" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={8} />
                  <Bar yAxisId="right" dataKey="gunAmmo" name="高炮库存" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={8} />
                  <Line yAxisId="left" type="monotone" dataKey="rocketReady" name="火箭弹就绪点" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#fff', stroke: '#3b82f6', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
                  <Line yAxisId="left" type="monotone" dataKey="gunReady" name="高炮就绪点" stroke="#10b981" strokeWidth={2} dot={{ fill: '#fff', stroke: '#10b981', r: 3, strokeWidth: 2 }} activeDot={{ r: 4 }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 最新作业上报 / 最新作业点情况 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
            {isCaseMode ? "最新作业上报" : "最新作业点情况"}
          </h3>
          {isCaseMode ? (
            <span className="text-xs text-slate-500 font-mono">{latestResult.displayTime}</span>
          ) : (
            <div className="flex items-center gap-1 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">就绪</span>
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
                  <span className="font-medium">作业时间: <span className="font-mono">{isCaseMode ? (activeCaseId === '2026-07-02' ? '2026-07-02 ' : '2026-06-18 ') : '2026-07-07 '}{latestResult.time}</span></span>
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
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 text-[11px] bg-slate-50/50 border border-slate-100 rounded-lg p-2.5">
              <div className="flex items-center col-span-2 border-b border-slate-100/50 pb-1">
                <span className="w-[60px] text-slate-400 font-medium shrink-0">站点名称:</span>
                <span className="text-slate-800 font-bold text-[11.5px]">姜祥村作业点</span>
              </div>
              <div className="flex items-center col-span-2 border-b border-slate-100/50 pb-1">
                <span className="w-[60px] text-slate-400 font-medium shrink-0">站点编号:</span>
                <span className="text-slate-800 font-mono font-medium">1301270001</span>
              </div>
              <div className="flex items-center col-span-2 border-b border-slate-100/50 pb-1">
                <span className="w-[60px] text-slate-400 font-medium shrink-0">所属区域:</span>
                <span className="text-slate-700 font-medium">湖北省黄石市</span>
              </div>
              <div className="flex items-center col-span-2 border-b border-slate-100/50 pb-1">
                <span className="w-[60px] text-slate-400 font-medium shrink-0">详细地址:</span>
                <span className="text-slate-700 font-medium truncate" title="湖北省黄石市大冶市金牛镇姜祥村">
                  湖北省黄石市大冶市金牛镇姜祥村
                </span>
              </div>
              <div className="flex items-center border-b border-slate-100/50 pb-1">
                <span className="w-[60px] text-slate-400 font-medium shrink-0">作业器具:</span>
                <span className="text-slate-800 font-bold text-blue-600">火箭弹</span>
              </div>
              <div className="flex items-center border-b border-slate-100/50 pb-1">
                <span className="w-[60px] text-slate-400 font-medium shrink-0">弹药库存:</span>
                <span className="text-slate-800 font-bold text-emerald-600">24发</span>
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