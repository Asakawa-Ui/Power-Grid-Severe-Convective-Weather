import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Line, Legend } from 'recharts';
import { MapPin, Calendar, Clock, BarChart3, LineChart } from 'lucide-react';

interface LeftProps {
  activeRegion: string;
  isCaseMode?: boolean;
  activeCaseId?: string;
}

export default function EffectEvaluationLeft({ activeRegion, isCaseMode = false, activeCaseId = '2026-06-18' }: LeftProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>('湖北');
  const [selectedCity, setSelectedCity] = useState<string>('全省');
  const [startTime, setStartTime] = useState('2026-07-02 12:00');
  const [endTime, setEndTime] = useState('2026-07-02 21:00');

  React.useEffect(() => {
    if (isCaseMode) {
      if (activeCaseId === '2026-07-02') {
        setStartTime('2026-07-02 12:00');
        setEndTime('2026-07-02 21:00');
      } else {
        setStartTime('2026-06-18 14:00');
        setEndTime('2026-06-18 18:00');
      }
    } else {
      setStartTime('2026-07-07 12:00');
      setEndTime('2026-07-07 21:00');
    }
  }, [isCaseMode, activeCaseId]);

  React.useEffect(() => {
    if (isCaseMode) {
      if (activeCaseId === '2026-07-02') {
        setSelectedProvince('江苏');
        setSelectedCity('南京市');
      } else {
        setSelectedProvince('湖北');
        setSelectedCity('黄石市');
      }
    } else {
      if (activeRegion === '江苏地块') {
        setSelectedProvince('江苏');
        setSelectedCity('南京市');
      } else {
        setSelectedProvince('湖北');
        setSelectedCity('黄石市');
      }
    }
  }, [isCaseMode, activeCaseId, activeRegion]);

  // Chart data exactly copied/reused from OperationCommandLeft statsData
  const liveChartData = [
    { time: '12:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 25 },
    { time: '13:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 12 },
    { time: '14:00', rocketOps: 0, rocketAmmo: 0, gunOps: 3, gunAmmo: 30 },
    { time: '15:00', rocketOps: 3, rocketAmmo: 24, gunOps: 0, gunAmmo: 0 },
    { time: '16:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 20 },
    { time: '17:00', rocketOps: 2, rocketAmmo: 16, gunOps: 1, gunAmmo: 10 },
    { time: '18:00', rocketOps: 1, rocketAmmo: 8, gunOps: 1, gunAmmo: 15 },
  ];

  const caseChartData = [
    { time: '14:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
    { time: '15:00', rocketOps: 2, rocketAmmo: 8, gunOps: 0, gunAmmo: 0 }, // 白沙 15:18, 刘仁八 15:28
    { time: '16:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
    { time: '17:00', rocketOps: 1, rocketAmmo: 4, gunOps: 0, gunAmmo: 0 }, // 大冶金湖 17:18
    { time: '18:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
  ];

  const nanjingChartData = [
    { time: '14:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
    { time: '15:00', rocketOps: 1, rocketAmmo: 8, gunOps: 2, gunAmmo: 75 }, // 三道沟 15:30 (8发), 太平庄 15:20 (40发), 大杨树 15:10 (35发)
    { time: '16:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
    { time: '17:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
    { time: '18:00', rocketOps: 0, rocketAmmo: 0, gunOps: 0, gunAmmo: 0 },
  ];

  const chartData = isCaseMode 
    ? (activeCaseId === '2026-07-02' ? nanjingChartData : caseChartData) 
    : liveChartData;

  // Calculate stats based on actual active dataset
  let totalOps = 0;
  let successOps = 0;
  let gunOpsCount = 0;
  let gunAmmoCount = 0;
  let rocketOpsCount = 0;
  let rocketAmmoCount = 0;

  if (!isCaseMode) {
    liveChartData.forEach(item => {
      rocketOpsCount += item.rocketOps;
      rocketAmmoCount += item.rocketAmmo;
      gunOpsCount += item.gunOps;
      gunAmmoCount += item.gunAmmo;
    });
    totalOps = rocketOpsCount + gunOpsCount;
    successOps = 18; // 18 successful operations out of 20
  } else if (activeCaseId === '2026-07-02') {
    rocketOpsCount = 1;
    rocketAmmoCount = 8;
    gunOpsCount = 2;
    gunAmmoCount = 75;
    totalOps = rocketOpsCount + gunOpsCount;
    successOps = totalOps;
  } else {
    rocketOpsCount = 3;
    rocketAmmoCount = 12;
    gunOpsCount = 0;
    gunAmmoCount = 0;
    totalOps = rocketOpsCount + gunOpsCount;
    successOps = totalOps;
  }

  let tableData = [
    { name: '大冶金湖', type: '火箭', rational: '合理', status: '有效', radarChange: '-52%' },
    { name: '刘仁八', type: '火箭', rational: '合理', status: '有效', radarChange: '-48%' },
    { name: '白沙', type: '火箭', rational: '合理', status: '有效', radarChange: '-55%' }
  ];

  if (isCaseMode) {
    if (activeCaseId === '2026-07-02') {
      tableData = [
        { name: '三道沟', type: '火箭', rational: '合理', status: '有效', radarChange: '-58%' },
        { name: '太平庄', type: '高炮', rational: '合理', status: '有效', radarChange: '-50%' },
        { name: '大杨树', type: '高炮', rational: '合理', status: '有效', radarChange: '-45%' },
      ];
    } else {
      tableData = [
        { name: '大冶金湖', type: '火箭', rational: '合理', status: '有效', radarChange: '-52%' },
        { name: '刘仁八', type: '火箭', rational: '合理', status: '有效', radarChange: '-48%' },
        { name: '白沙', type: '火箭', rational: '合理', status: '有效', radarChange: '-55%' }
      ];
    }
  } else {
    if (activeRegion === '江苏地块') {
      tableData = [
        { name: '三道沟', type: '火箭', rational: '合理', status: '有效', radarChange: '-58%' },
        { name: '太平庄', type: '高炮', rational: '合理', status: '有效', radarChange: '-50%' },
        { name: '大杨树', type: '高炮', rational: '合理', status: '有效', radarChange: '-45%' },
      ];
    } else {
      tableData = [
        { name: '大冶金湖', type: '火箭', rational: '合理', status: '有效', radarChange: '-52%' },
        { name: '刘仁八', type: '火箭', rational: '合理', status: '有效', radarChange: '-48%' },
        { name: '姜祥村', type: '高炮', rational: '合理', status: '有效', radarChange: '-40%' },
        { name: '铁山南', type: '高炮', rational: '合理', status: '有效', radarChange: '-42%' },
        { name: '沿湖生态园', type: '高炮', rational: '合理', status: '有效', radarChange: '-44%' },
      ];
    }
  }

  return (
    <>
      {/* 1. 作业范围 (Operation Scope) */}
      <div className="bg-gradient-to-b from-slate-50/80 to-white border-l-4 border-l-indigo-500 border-y border-r border-slate-200/60 rounded-r-xl rounded-l-none p-3 flex flex-col gap-2.5 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800">作业范围</h3>
          </div>
        </div>

        {/* Side-by-side select dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          {/* Province selection dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">选择省份</span>
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

          {/* City selection dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">选择市/区域</span>
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

        {/* Date Time Inputs */}
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

      {/* 2. 作业信息统计 (Operation Stats - Replicated exactly from OperationCommandLeft UI layout) */}
      <div className="bg-gradient-to-b from-slate-50/80 to-white border-l-4 border-l-indigo-500 border-y border-r border-slate-200/60 rounded-r-xl rounded-l-none p-3 flex flex-col gap-3 shadow-sm shrink-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800">作业信息统计</h3>
          </div>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-white rounded-lg p-2 border border-blue-100 shadow-sm">
            <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              火箭
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-[10px] text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-xs">{rocketOpsCount}</span> 次</div>
              <div className="text-[10px] text-blue-600 font-medium"><span className="font-bold font-mono text-xs">{rocketAmmoCount}</span> 发</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-between bg-gradient-to-br from-emerald-50/50 to-white rounded-lg p-2 border border-emerald-100 shadow-sm">
            <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              高炮
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-[10px] text-slate-500 font-medium"><span className="font-bold text-slate-800 font-mono text-xs">{gunOpsCount}</span> 次</div>
              <div className="text-[10px] text-emerald-600 font-medium"><span className="font-bold font-mono text-xs">{gunAmmoCount}</span> 发</div>
            </div>
          </div>
        </div>
        
        <div className="w-full h-[160px] relative mt-1 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="25%">
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

        {/* 作业总结内容嵌入到图表下方 */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs text-slate-600 leading-relaxed font-sans shrink-0">
          当前统计时段内共作业 <span className="font-bold text-blue-600">{totalOps}</span> 次，
          成功完成作业 <span className="font-bold text-emerald-600">{successOps}</span> 次，
          其中高炮作业 <span className="font-bold text-slate-800">{gunOpsCount}</span> 次，
          发射高炮共 <span className="font-bold text-slate-800">{gunAmmoCount}</span> 发;
          火箭作业 <span className="font-bold text-slate-800">{rocketOpsCount}</span> 次，
          发射火箭弹共 <span className="font-bold text-slate-800">{rocketAmmoCount}</span> 发。
        </div>
      </div>

      {/* 3. 作业点列表 (Operation Points Table) */}
      <div className="bg-gradient-to-b from-slate-50/80 to-white border-l-4 border-l-indigo-500 border-y border-r border-slate-200/60 rounded-r-xl rounded-l-none p-3.5 flex flex-col gap-3 shadow-sm flex-1 min-h-0">
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
                <th className="px-3 py-2">作业点</th>
                <th className="px-2 py-2">类型</th>
                <th className="px-2 py-2">合理性</th>
                <th className="px-2 py-2">有效性</th>
                <th className="px-3 py-2 text-right">变化率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-2.5 font-bold">{row.name}</td>
                  <td className="px-2 py-2.5">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-600 border border-blue-100">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                      row.rational === '合理' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {row.rational}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">
                    {row.radarChange}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
