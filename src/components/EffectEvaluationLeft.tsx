import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, Line, Legend } from 'recharts';
import { MapPin, Calendar, BarChart3, LineChart } from 'lucide-react';

interface LeftProps {
  activeRegion: string;
  isCaseMode?: boolean;
  activeCaseId?: string;
}

// 效果评估趋势图专属 Tooltip：与作业指挥系统历史模式专属 Tooltip 保持完全一致视觉与结构
const EffectChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const samplePayload = payload[0]?.payload || {};
  const { timeRangeDesc, rocketOps = 0, gunOps = 0, rocketAmmo = 0, gunAmmo = 0 } = samplePayload;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-2 shadow-xl border border-slate-200/90 text-xs min-w-[170px] pointer-events-none select-none">
      <div className="pb-1 mb-1.5 border-b border-slate-100 flex items-center justify-between">
        <span className="font-mono font-bold text-slate-800 text-[11px]">
          {timeRangeDesc === '起始时刻' ? label : (timeRangeDesc || label)}
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
};

export default function EffectEvaluationLeft({ 
  activeRegion, 
  isCaseMode = false, 
  activeCaseId = '2026-07-02',
  selectedHistoryId,
  setSelectedHistoryId
}: LeftProps & { selectedHistoryId?: string; setSelectedHistoryId?: (id: string) => void }) {
  return (
    <>
      <EffectEvaluationLeftScopeAndStats activeRegion={activeRegion} isCaseMode={isCaseMode} activeCaseId={activeCaseId} />
      <EffectEvaluationLeftTable 
        activeRegion={activeRegion} 
        isCaseMode={isCaseMode} 
        activeCaseId={activeCaseId} 
        selectedHistoryId={selectedHistoryId}
        setSelectedHistoryId={setSelectedHistoryId}
      />
    </>
  );
}

export function EffectEvaluationLeftScopeAndStats({ activeRegion, isCaseMode = false, activeCaseId = '2026-07-02' }: LeftProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>('江苏');
  const [selectedCity, setSelectedCity] = useState<string>('南京市');
  const [startTime, setStartTime] = useState('2026-07-02 12:00');
  const [endTime, setEndTime] = useState('2026-07-02 21:00');

  React.useEffect(() => {
    if (isCaseMode) {
      if (activeCaseId === '2026-07-02') {
        setStartTime('2026-07-02 12:00');
        setEndTime('2026-07-02 21:00');
        setSelectedProvince('江苏');
        setSelectedCity('南京市');
      } else {
        setStartTime('2026-06-18 14:00');
        setEndTime('2026-06-18 18:00');
        setSelectedProvince('湖北');
        setSelectedCity('黄石市');
      }
    } else {
      if (activeRegion === '江苏地块') {
        setStartTime('2026-07-07 12:00');
        setEndTime('2026-07-07 21:00');
        setSelectedProvince('江苏');
        setSelectedCity('南京市');
      } else {
        setStartTime('2026-06-18 14:00');
        setEndTime('2026-06-18 18:00');
        setSelectedProvince('湖北');
        setSelectedCity('黄石市');
      }
    }
  }, [isCaseMode, activeCaseId, activeRegion]);

  // 湖北黄石个例 (2026-06-18)：完整展示开始时间到结束时间的全部结果（无需动态更新）
  // 15:18 白沙作业点 (火箭弹 4发, 1次)
  // 15:28 刘仁八作业点 (火箭弹 4发, 1次)
  // 17:18 大冶金湖作业点 (火箭弹 4发, 1次)
  const caseChartData = [
    { time: '14:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0, timeRangeDesc: '起始时刻' },
    { time: '15:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0, timeRangeDesc: '14:00—15:00' },
    { time: '16:00', rocketOps: 2, rocketAmmo: 8, gunOps: 0, gunAmmo: 0, timeRangeDesc: '15:00—16:00' },
    { time: '17:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0, timeRangeDesc: '16:00—17:00' },
    { time: '18:00', rocketOps: 1, rocketAmmo: 4, gunOps: 0, gunAmmo: 0, timeRangeDesc: '17:00—18:00' },
  ];

  // 江苏南京个例 (2026-07-02)：完整展示开始时间到结束时间的全部结果（无需动态更新）
  // 15:10 大杨树作业点 (高炮 35发, 1次)
  // 15:20 太平庄高炮站 (高炮 40发, 1次)
  // 15:30 三道沟火箭点 (火箭弹 8发, 1次)
  const nanjingChartData = [
    { time: '14:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0, timeRangeDesc: '起始时刻' },
    { time: '15:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0, timeRangeDesc: '14:00—15:00' },
    { time: '16:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 75, timeRangeDesc: '15:00—16:00' },
    { time: '17:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0, timeRangeDesc: '16:00—17:00' },
    { time: '18:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0, timeRangeDesc: '17:00—18:00' },
  ];

  // 常规/其他个例完整统计数据
  const standardChartData = [
    { time: '12:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0, timeRangeDesc: '起始时刻' },
    { time: '13:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 25, timeRangeDesc: '12:00—13:00' },
    { time: '14:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 12, timeRangeDesc: '13:00—14:00' },
    { time: '15:00', rocketOps: 0, rocketAmmo: 0, gunOps: 3, gunAmmo: 30, timeRangeDesc: '14:00—15:00' },
    { time: '16:00', rocketOps: 3, rocketAmmo: 24, gunOps: 0, gunAmmo: 0, timeRangeDesc: '15:00—16:00' },
    { time: '17:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 20, timeRangeDesc: '16:00—17:00' },
    { time: '18:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 10, timeRangeDesc: '17:00—18:00' },
  ];

  const chartData = (isCaseMode && activeCaseId === '2026-07-02') || (!isCaseMode && activeRegion === '江苏地块')
    ? nanjingChartData
    : (isCaseMode || activeRegion === '湖北地块' ? caseChartData : standardChartData);

  // 计算用于左右纵轴智能刻度范围的最大值（与作业指挥系统历史模式完全一致）
  const maxOpsVal = Math.max(
    1,
    ...chartData.map(d => Math.max(d.rocketOps || 0, d.gunOps || 0))
  );
  const leftAxisMax = maxOpsVal <= 2 ? 2 : (maxOpsVal % 2 === 0 ? maxOpsVal : maxOpsVal + 1);
  const leftAxisTicks = leftAxisMax === 2 ? [0, 1, 2] : [0, Math.round(leftAxisMax / 2), leftAxisMax];

  const maxAmmoVal = Math.max(
    10,
    ...chartData.map(d => Math.max(d.rocketAmmo || 0, d.gunAmmo || 0))
  );
  let rightAxisMax = Math.ceil(maxAmmoVal / 10) * 10;
  if (rightAxisMax % 2 !== 0) rightAxisMax += 10;
  const rightAxisTicks = [0, rightAxisMax / 2, rightAxisMax];

  const caseXAxisTicks = chartData.map(d => d.time);

  // 统计概览数据
  let totalOps = 0;
  let successOps = 0;
  let gunOpsCount = 0;
  let gunAmmoCount = 0;
  let rocketOpsCount = 0;
  let rocketAmmoCount = 0;

  chartData.forEach(item => {
    rocketOpsCount += item.rocketOps;
    rocketAmmoCount += item.rocketAmmo;
    gunOpsCount += item.gunOps;
    gunAmmoCount += item.gunAmmo;
  });
  totalOps = rocketOpsCount + gunOpsCount;
  successOps = totalOps;

  return (
    <div className="flex flex-col gap-3 shrink-0">
      {/* 1. 作业范围 (Operation Scope) */}
      <div className="bg-gradient-to-b from-slate-50/80 to-white border-l-4 border-l-indigo-500 border-y border-r border-slate-200/60 rounded-r-xl rounded-l-none p-3 flex flex-col gap-2.5 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800">作业范围</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">省份</span>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedCity('全省');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              {['全部', '湖北', '江苏', '四川', '安徽'].map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">地市</span>
            <select
              value={selectedCity}
              disabled={selectedProvince === '全部'}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {selectedProvince === '全部' ? (
                <option value="全省">请先选择省份</option>
              ) : (
                (() => {
                  const citiesMap: Record<string, string[]> = {
                    '湖北': ['全省', '武汉市', '黄石市', '宜昌市', '襄阳市', '十堰市'],
                    '江苏': ['全省', '南京市', '苏州市', '无锡市', '常州市', '徐州市'],
                    '四川': ['全省', '成都市', '绵阳市', '德阳市', '乐山市', '南充市'],
                    '安徽': ['全省', '合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市'],
                  };
                  return (citiesMap[selectedProvince] || []).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ));
                })()
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400">起始时间</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-transparent text-[10px] font-semibold font-mono focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400">结束时间</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-transparent text-[10px] font-semibold font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 作业信息统计 (Operation Stats) */}
      <div className="bg-gradient-to-b from-slate-50/80 to-white border-l-4 border-l-indigo-500 border-y border-r border-slate-200/60 rounded-r-xl rounded-l-none p-3 flex flex-col gap-2 shadow-sm shrink-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800">作业信息统计</h3>
          </div>
        </div>
        
        {/* 卡片汇总：火箭弹与高炮 */}
        <div className="flex gap-2 shrink-0">
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-white rounded-lg p-2 border border-blue-100 shadow-sm">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
              火箭弹
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-xs">{rocketOpsCount}</span> 次</div>
              <div className="text-[11px] text-blue-600 font-medium"><span className="font-bold font-mono text-xs">{rocketAmmoCount}</span> 发</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-emerald-50/50 to-white rounded-lg p-2 border border-emerald-100 shadow-sm">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              高炮
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-xs">{gunOpsCount}</span> 次</div>
              <div className="text-[11px] text-emerald-600 font-medium"><span className="font-bold font-mono text-xs">{gunAmmoCount}</span> 发</div>
            </div>
          </div>
        </div>
        
        {/* 图表纵轴维度说明：左次数，右用弹量 */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium select-none pointer-events-none shrink-0 pl-1 pr-1 mt-0.5">
          <span>次数（次）</span>
          <span>用弹量（发）</span>
        </div>

        {/* 趋势图部分：与作业指挥系统历史模式相同的柱线组合图，完整展示从开始时间到结束时间的全部结果 */}
        <div className="w-full h-[155px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={chartData as any} 
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
                content={<EffectChartTooltip />}
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

              {/* 柱形：按1小时统计用弹量（右纵轴，火箭弹蓝色，高炮绿色） */}
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

              {/* 折线：按1小时统计作业次数（左纵轴，火箭弹蓝色，高炮绿色） */}
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
          </ResponsiveContainer>
        </div>

        {/* 3-Column Stats Summary Card matching design */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl py-2 px-1 grid grid-cols-3 divide-x divide-slate-200/70 text-center shrink-0">
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[12px] font-medium text-slate-700 mb-0.5">本次作业</span>
            <div className="flex items-baseline gap-1 text-slate-800">
              <span className="text-lg font-bold font-mono text-slate-800">{totalOps}</span>
              <span className="text-[11px] text-slate-500 font-medium">次</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[12px] font-medium text-slate-700 mb-0.5">成功完成</span>
            <div className="flex items-baseline gap-1 text-slate-800">
              <span className="text-lg font-bold font-mono text-slate-800">{successOps}</span>
              <span className="text-[11px] text-slate-500 font-medium">次</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[12px] font-medium text-slate-700 mb-0.5">完成率</span>
            <div className="flex items-baseline gap-1 text-slate-800">
              <span className="text-lg font-bold font-mono text-slate-800">{totalOps > 0 ? Math.round((successOps / totalOps) * 100) : 100}</span>
              <span className="text-[11px] text-slate-500 font-medium">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EffectEvaluationLeftTable({ 
  activeRegion, 
  isCaseMode = false, 
  activeCaseId = '2026-07-02',
  selectedHistoryId,
  setSelectedHistoryId
}: LeftProps & { selectedHistoryId?: string; setSelectedHistoryId?: (id: string) => void }) {
  let tableData = [
    { name: '大冶金湖', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-52%' },
    { name: '刘仁八', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-48%' },
    { name: '白沙', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-55%' }
  ];

  if (isCaseMode) {
    if (activeCaseId === '2026-07-02') {
      tableData = [
        { name: '三道沟', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-58%' },
        { name: '太平庄', type: '高炮', rational: '合理', status: '有效', radarChange: '-50%' },
        { name: '大杨树', type: '高炮', rational: '合理', status: '有效', radarChange: '-45%' },
      ];
    } else {
      tableData = [
        { name: '大冶金湖', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-52%' },
        { name: '刘仁八', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-48%' },
        { name: '白沙', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-55%' }
      ];
    }
  } else {
    if (activeRegion === '江苏地块') {
      tableData = [
        { name: '三道沟', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-58%' },
        { name: '太平庄', type: '高炮', rational: '合理', status: '有效', radarChange: '-50%' },
        { name: '大杨树', type: '高炮', rational: '合理', status: '有效', radarChange: '-45%' },
      ];
    } else {
      tableData = [
        { name: '大冶金湖', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-52%' },
        { name: '刘仁八', type: '火箭弹', rational: '合理', status: '有效', radarChange: '-48%' },
        { name: '姜祥村', type: '高炮', rational: '合理', status: '有效', radarChange: '-40%' },
        { name: '铁山南', type: '高炮', rational: '合理', status: '有效', radarChange: '-42%' },
        { name: '沿湖生态园', type: '高炮', rational: '合理', status: '有效', radarChange: '-44%' },
      ];
    }
  }

  const getRowId = (name: string) => {
    if (isCaseMode) {
      if (activeCaseId === '2026-07-02') {
        if (name.includes('大杨树')) return 'n3';
        if (name.includes('太平庄')) return 'n2';
        if (name.includes('三道沟')) return 'n1';
      } else {
        if (name.includes('金湖')) return 'c1';
        if (name.includes('刘仁八')) return 'c2';
        if (name.includes('白沙')) return 'c3';
      }
    } else {
      if (name.includes('姜祥村')) return 'h1';
      if (name.includes('铁山南')) return 'h2';
      if (name.includes('白沙')) return 'h3';
      if (name.includes('金湖')) return 'h4';
      if (name.includes('刘仁八')) return 'h5';
      if (name.includes('金牛镇')) return 'h6';
      if (name.includes('陈贵镇')) return 'h7';
      if (name.includes('大杨树')) return 'n3';
      if (name.includes('太平庄')) return 'n2';
      if (name.includes('三道沟')) return 'n1';
    }
    return '';
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-50/80 to-white border-l-4 border-l-indigo-500 border-y border-r border-slate-200/60 rounded-r-xl rounded-l-none p-2.5 flex flex-col gap-2 shadow-sm min-h-0 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-indigo-500 shrink-0" />
          <h3 className="text-xs font-bold text-slate-800">作业点效果统计</h3>
        </div>
      </div>

      <div className="overflow-y-auto border border-slate-200 rounded-lg flex-1 scrollbar-none relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-indigo-50/60 border-b border-indigo-100 text-indigo-700/80 font-bold select-none">
              <th className="px-2.5 py-1.5">作业点</th>
              <th className="px-1.5 py-1.5">类型</th>
              <th className="px-1.5 py-1.5">合理性</th>
              <th className="px-1.5 py-1.5">有效性</th>
              <th className="px-2.5 py-1.5 text-right">变化率</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {tableData.map((row, i) => {
              const rowId = getRowId(row.name);
              const isSelected = selectedHistoryId === rowId;
              return (
                <tr 
                  key={i} 
                  onClick={() => {
                    if (rowId && setSelectedHistoryId) {
                      setSelectedHistoryId(rowId);
                    }
                  }}
                  className={`transition-colors cursor-pointer select-none ${
                    isSelected 
                      ? 'bg-blue-50/80 font-semibold ring-1 ring-inset ring-blue-300' 
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="px-2.5 py-2 font-bold">{row.name}</td>
                  <td className="px-1.5 py-2">
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                      row.type.includes('火箭')
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-1.5 py-2">
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                      row.rational === '合理' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {row.rational}
                    </span>
                  </td>
                  <td className="px-1.5 py-2">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-2.5 py-2 text-right font-mono font-bold text-emerald-600">
                    {row.radarChange}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
