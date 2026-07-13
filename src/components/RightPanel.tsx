import React, { useState } from 'react';
import { 
  MapPin, 
  Zap, 
  Wind, 
  CloudLightning, 
  CloudRain, 
  Tornado, 
  Snowflake,
  Crosshair,
  FileText,
  Search,
  BarChart2,
  X,
  Maximize2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '../lib/utils';

const warnings = [
  { level: 'red', count: 6, label: '红色预警', color: 'text-red-500' },
  { level: 'orange', count: 23, label: '橙色预警', color: 'text-orange-500' },
  { level: 'yellow', count: 12, label: '黄色预警', color: 'text-yellow-500' },
  { level: 'blue', count: 4, label: '蓝色预警', color: 'text-blue-500' },
];

type Level = 'red' | 'orange' | 'yellow' | 'blue';
type WarningType = '雷电' | '大风' | '雷雨大风' | '暴雨' | '台风' | '暴雪' | '强对流';

interface WarningItem {
  id: string;
  title: string;
  loc: string;
  type: WarningType;
  level: Level;
}

const listItems: WarningItem[] = [
  { id: '1', title: '1000kV特高压线 (十堰-襄阳段)', loc: '十堰市丹江口市', type: '雷电', level: 'red' },
  { id: '2', title: '500kV输电线 (恩施-宜昌段)', loc: '宜昌市长阳土家族自治县', type: '大风', level: 'orange' },
  { id: '3', title: '220kV输电线 (荆门-荆州段)', loc: '荆州市沙市区', type: '雷雨大风', level: 'yellow' },
  { id: '4', title: '武汉北变电站', loc: '武汉市黄陂区', type: '暴雨', level: 'blue' },
  { id: '5', title: '500kV输电线 (宜昌-荆门段)', loc: '宜昌市当阳市', type: '台风', level: 'red' },
  { id: '6', title: '1000kV特高压线 (襄阳-荆门段)', loc: '襄阳市宜城市', type: '暴雪', level: 'orange' },
  { id: '7', title: '220kV输电线 (咸宁-武汉段)', loc: '咸宁市咸安区', type: '强对流', level: 'yellow' },
  { id: '8', title: '恩施变电站', loc: '恩施土家族苗族自治州', type: '雷电', level: 'blue' },
];

const levelStyles: Record<Level, string> = {
  red: 'bg-red-50 text-red-600 border-red-300',
  orange: 'bg-orange-50 text-orange-600 border-orange-300',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-400',
  blue: 'bg-blue-50 text-blue-600 border-blue-300'
};

const getWarningIcon = (type: WarningType) => {
  switch (type) {
    case '雷电': return Zap;
    case '大风': return Wind;
    case '雷雨大风': return CloudLightning;
    case '暴雨': return CloudRain;
    case '台风': return Tornado;
    case '暴雪': return Snowflake;
    case '强对流': return CloudLightning;
    default: return Zap;
  }
};

interface LightningRecord {
  id: number;
  time: string;
  current: number;
  strokeType: string;
  tower: string;
  distance: number;
  stations: number;
  line: string;
  region: string;
  hour: string;
}

const mockLightningData: LightningRecord[] = [
  { id: 1, time: '2025-03-14 01:20:10.712', current: 61.6, strokeType: '主放电(含1次后续...)', tower: '257', distance: 2728, stations: 34, line: '1000kV特高压线', region: '十堰市', hour: '12:00' },
  { id: 2, time: '2025-03-14 01:20:10.922', current: 50.9, strokeType: '后续第1次回击', tower: '263', distance: 241, stations: 31, line: '500kV二龙线', region: '宜昌市', hour: '13:00' },
  { id: 3, time: '2025-03-14 01:21:12.359', current: 42.8, strokeType: '单次回击', tower: '116', distance: 3734, stations: 10, line: '220kV汉川线', region: '武汉市', hour: '14:00' },
  { id: 4, time: '2025-03-14 02:05:44.103', current: -35.2, strokeType: '单次回击', tower: '084', distance: 1502, stations: 18, line: '1000kV特高压线', region: '十堰市', hour: '15:00' },
  { id: 5, time: '2025-03-14 02:40:19.510', current: 72.1, strokeType: '主放电(含2次后续...)', tower: '142', distance: 893, stations: 25, line: '500kV二龙线', region: '恩施州', hour: '16:00' },
  { id: 6, time: '2025-03-14 03:15:33.284', current: -15.4, strokeType: '云闪主放电', tower: '309', distance: 4120, stations: 12, line: '220kV汉川线', region: '荆门市', hour: '17:00' },
  { id: 7, time: '2025-03-14 04:02:11.902', current: 88.3, strokeType: '后续第2次回击', tower: '115', distance: 512, stations: 40, line: '1000kV特高压线', region: '宜昌市', hour: '18:00' },
  { id: 8, time: '2025-03-14 04:22:50.145', current: -28.4, strokeType: '单次回击', tower: '188', distance: 1980, stations: 15, line: '500kV二龙线', region: '武汉市', hour: '12:00' },
  { id: 9, time: '2025-03-14 05:10:05.331', current: 54.2, strokeType: '主放电', tower: '095', distance: 2310, stations: 22, line: '220kV汉川线', region: '十堰市', hour: '13:00' },
  { id: 10, time: '2025-03-14 05:55:18.883', current: -44.7, strokeType: '后续第1次回击', tower: '201', distance: 1205, stations: 28, line: '1000kV特高压线', region: '恩施州', hour: '14:00' },
  { id: 11, time: '2025-03-14 06:12:44.201', current: 63.9, strokeType: '单次回击', tower: '152', distance: 3450, stations: 19, line: '500kV二龙线', region: '荆门市', hour: '15:00' },
  { id: 12, time: '2025-03-14 06:48:30.952', current: -19.8, strokeType: '单次回击', tower: '042', distance: 180, stations: 14, line: '220kV汉川线', region: '武汉市', hour: '16:00' },
];

interface LightningLiveRecord {
  id: number;
  time: string;
  region: string;
  count: number;
}

// Sorted descending by time
const mockLightningLiveList: LightningLiveRecord[] = [
  { id: 1, time: '2026-07-09 19:32:05', region: '十堰保障区', count: 18 },
  { id: 2, time: '2026-07-09 19:28:44', region: '神农架核心区', count: 32 },
  { id: 3, time: '2026-07-09 19:15:30', region: '宜昌大老岭保护区', count: 14 },
  { id: 4, time: '2026-07-09 18:55:12', region: '恩施星斗山保护区', count: 25 },
  { id: 5, time: '2026-07-09 18:42:09', region: '十堰武当山核心区', count: 9 },
  { id: 6, time: '2026-07-09 18:20:55', region: '荆门大口保障区', count: 21 },
  { id: 7, time: '2026-07-09 17:58:14', region: '武汉府河保护区', count: 30 },
  { id: 8, time: '2026-07-09 17:35:40', region: '随州大洪山保护区', count: 16 },
];

export default function RightPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'query' | 'stats'>('query');
  const [timeRange, setTimeRange] = useState<string>('all'); // '1h' | '3h' | '6h' | '24h' | 'all'
  const [lineRange, setLineRange] = useState<string>('all'); // line name or 'all'
  const [region, setRegion] = useState<string>('all'); // region name or 'all'

  // Reactive filtering of lightning data based on user choices
  const filteredData = mockLightningData.filter(item => {
    // Simulated time ranges
    if (timeRange === '1h' && item.id > 3) return false;
    if (timeRange === '3h' && item.id > 5) return false;
    if (timeRange === '6h' && item.id > 8) return false;
    if (timeRange === '24h' && item.id > 12) return false;

    // Line selection
    if (lineRange !== 'all' && item.line !== lineRange) return false;

    // Region selection
    if (region !== 'all' && item.region !== region) return false;

    return true;
  });

  // Aggregate frequencies dynamically based on active filter results
  const hoursList = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const aggregatedChartData = hoursList.map(h => {
    const matchingRecords = filteredData.filter(item => item.hour === h);
    return {
      time: h,
      value: matchingRecords.length * 6 + (matchingRecords.length > 0 ? 8 : 0) // realistic stroke value
    };
  });

  const liveChartData = [...mockLightningLiveList]
    .reverse()
    .map(item => ({
      time: item.time.split(' ')[1].substring(0, 5), // 'HH:MM'
      count: item.count,
      region: item.region
    }));

  return (
    <div className="absolute top-24 right-6 bottom-6 z-40 w-80 flex flex-col gap-4 pointer-events-none">
      
      {/* Warning Summary Cards */}
      <div className="grid grid-cols-4 gap-2 pointer-events-auto">
        {warnings.map((w) => (
          <div key={w.level} className="bg-white/90 backdrop-blur-sm p-3 text-center shadow-md flex flex-col items-center justify-center rounded-sm">
            <span className="text-2xl font-bold text-slate-800">{w.count}</span>
            <span className={cn("text-xs font-medium", w.color)}>{w.label}</span>
          </div>
        ))}
      </div>

      {/* List Area */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pointer-events-auto hide-scrollbar">
        {listItems.map((item) => {
          const Icon = getWarningIcon(item.type);
          return (
            <div key={item.id} className="bg-white/90 backdrop-blur-sm p-3 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md hover:border-slate-300 transition-all cursor-pointer rounded-sm gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={cn("w-[48px] h-[54px] rounded flex flex-col items-center justify-center flex-shrink-0 border", levelStyles[item.level])}>
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold leading-none tracking-tighter whitespace-nowrap">{item.type}</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-slate-800 text-sm mb-1 truncate" title={item.title}>{item.title}</span>
                  <div className="flex items-center text-slate-500 text-xs truncate" title={item.loc}>
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{item.loc}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5 items-center text-slate-400 flex-shrink-0">
                <button className="p-1 hover:bg-slate-100 hover:text-blue-500 rounded transition-colors group/btn" title="定位">
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:bg-slate-100 hover:text-blue-500 rounded transition-colors group/btn" title="详情">
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightning Realtime Live Information Module */}
      <div className="bg-white/90 backdrop-blur-sm p-4 shadow-md pointer-events-auto flex flex-col h-[50%] rounded-sm border border-slate-100/80 animate-fade-in">
        <div className="flex items-center justify-between pb-0.5 mb-0.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-sm font-bold text-slate-800">闪电实况信息</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors"
            title="高级查询与统计分析"
          >
            <Maximize2 className="w-3 h-3" />
            <span>查询统计</span>
          </button>
        </div>

        {/* Realtime Live List in Descending Order */}
        <div className="flex-[1.2] min-h-[100px] overflow-y-auto hide-scrollbar border border-slate-100/60 rounded-sm bg-white/50 px-1 pb-1 mb-1">
          <table className="w-full border-collapse text-[11px] font-sans">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 py-1 px-1 text-left font-bold bg-slate-50 text-slate-500 border-b border-slate-100">发生时间</th>
                <th className="sticky top-0 z-10 py-1 px-2 text-left font-bold bg-slate-50 text-slate-500 border-b border-slate-100">所属保护区</th>
                <th className="sticky top-0 z-10 py-1 px-1 text-right font-bold bg-slate-50 text-slate-500 border-b border-slate-100">闪电次数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {mockLightningLiveList.map((live) => (
                <tr key={live.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-1.5 px-1 font-mono text-slate-500 whitespace-nowrap">
                    {live.time.split(' ')[1]}
                  </td>
                  <td className="py-1.5 px-2 text-slate-700 font-medium">
                    {live.region}
                  </td>
                  <td className="py-1.5 px-1 text-right font-bold text-blue-600 font-mono">
                    {live.count} 次
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Realtime Sequence Bar Chart */}
        <div className="flex-1 flex flex-col justify-between min-h-0 mt-1">
          <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between select-none mb-1 flex-shrink-0">
            <span>实况闪电频次时序图 (次)</span>
            <span className="text-blue-500 flex items-center gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              时序分布
            </span>
          </div>
          <div className="flex-1 w-full text-[9px] min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liveChartData} margin={{ top: 2, right: 0, left: 4, bottom: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 9}} dy={2} />
                <YAxis width={15} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 9}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{fontSize: '11px', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '6px'}} 
                  labelFormatter={(label) => `发生时间: ${label}`}
                  formatter={(value: any, name: any, props: any) => [`${value} 次`, `保护区: ${props.payload.region}`]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Fidelity Query & Statistics Central Overlay Dialog/Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/85 w-[760px] max-w-full flex flex-col max-h-[580px] relative animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-500 rounded-lg text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">闪电高级查询与统计分析</h3>
                  <p className="text-xs text-slate-500 mt-0.5">多维度检索电力线路及重要保护区的雷击分布与频次规律</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              {/* Shared Filters Row */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-150 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-500">时间范围</span>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-xs rounded-md px-2.5 py-1.5 text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
                  >
                    <option value="all">全部时间</option>
                    <option value="1h">最近1小时</option>
                    <option value="3h">最近3小时</option>
                    <option value="6h">最近6小时</option>
                    <option value="24h">最近24小时</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-500">线路范围</span>
                  <select
                    value={lineRange}
                    onChange={(e) => setLineRange(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-xs rounded-md px-2.5 py-1.5 text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
                  >
                    <option value="all">全部线路</option>
                    <option value="1000kV特高压线">1000kV特高压</option>
                    <option value="500kV二龙线">500kV二龙</option>
                    <option value="220kV汉川线">220kV汉川</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-500">所属区域</span>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-xs rounded-md px-2.5 py-1.5 text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
                  >
                    <option value="all">全部区域</option>
                    <option value="十堰市">十堰市</option>
                    <option value="宜昌市">宜昌市</option>
                    <option value="武汉市">武汉市</option>
                    <option value="恩施州">恩施州</option>
                    <option value="荆门市">荆门市</option>
                  </select>
                </div>
              </div>

              {/* Navigation Tabs and Count Indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mt-1">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab('query')}
                    className={cn(
                      "text-sm font-bold pb-2 transition-all relative flex items-center gap-1.5",
                      activeTab === 'query' 
                        ? "text-blue-600 border-b-2 border-blue-500 font-extrabold" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Search className="w-4 h-4" />
                    <span>闪电查询列表</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={cn(
                      "text-sm font-bold pb-2 transition-all relative flex items-center gap-1.5",
                      activeTab === 'stats' 
                        ? "text-blue-600 border-b-2 border-blue-500 font-extrabold" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>统计频次柱状图</span>
                  </button>
                </div>
                
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full select-none shadow-sm">
                  已匹配：{filteredData.length} 条闪电记录
                </span>
              </div>

              {/* Dynamic Tab Content Display */}
              {activeTab === 'query' ? (
                <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white shadow-inner max-h-[300px] scrollbar-none">
                  <table className="w-full border-collapse text-xs font-sans">
                    <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                      <tr>
                        <th className="py-2.5 px-2 text-center font-bold border-r border-slate-150 w-12 select-none">序号</th>
                        <th className="py-2.5 px-3 text-center font-bold border-r border-slate-150">时间</th>
                        <th className="py-2.5 px-2.5 text-center font-bold border-r border-slate-150">电流(kA)</th>
                        <th className="py-2.5 px-3 text-center font-bold border-r border-slate-150">回击</th>
                        <th className="py-2.5 px-2 text-center font-bold border-r border-slate-150">最近杆塔</th>
                        <th className="py-2.5 px-2.5 text-center font-bold border-r border-slate-150">距离(m)</th>
                        <th className="py-2.5 px-2 text-center font-bold">站数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.map((item, index) => (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-2.5 px-2 text-center font-bold text-slate-400 border-r border-slate-100 select-none">{index + 1}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600 border-r border-slate-100 whitespace-nowrap">{item.time}</td>
                          <td className={cn(
                            "py-2.5 px-2.5 text-center font-bold font-mono border-r border-slate-100",
                            item.current > 0 ? "text-amber-500" : "text-blue-500"
                          )}>
                            {item.current > 0 ? `+${item.current}` : item.current}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 border-r border-slate-100 truncate max-w-[120px]" title={item.strokeType}>{item.strokeType}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-600 border-r border-slate-100">{item.tower}</td>
                          <td className="py-2.5 px-2.5 text-center font-mono text-slate-600 border-r border-slate-100">{item.distance}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-600">{item.stations}</td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-slate-400 font-medium select-none">
                            未查询到符合筛选条件的闪电高级记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex-1 bg-white border border-slate-150 rounded-lg p-4 flex flex-col justify-between h-[300px] shadow-sm">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between select-none mb-2">
                    <span>小时级闪电次数统计 (次)</span>
                    <span className="text-blue-500 flex items-center gap-1 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      小时频次柱状分布
                    </span>
                  </div>
                  <div className="h-[230px] w-full text-xs"> 
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aggregatedChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={5} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50/50 flex justify-between items-center rounded-b-xl select-none">
              <span className="text-xs text-slate-400 font-medium">数据更新时间: 2026-07-09 19:34:31 (实时状态)</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                关闭窗口
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
