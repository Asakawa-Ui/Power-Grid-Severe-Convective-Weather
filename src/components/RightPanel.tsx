import React from 'react';
import { 
  MapPin, 
  Zap, 
  Wind, 
  CloudLightning, 
  CloudRain, 
  Tornado, 
  Snowflake,
  Crosshair,
  FileText
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

const chartData = [
  { time: '12:00', value: 28 },
  { time: '13:00', value: 15 },
  { time: '14:00', value: 32 },
  { time: '15:00', value: 20 },
  { time: '16:00', value: 18 },
  { time: '17:00', value: 24 },
  { time: '18:00', value: 35 },
];

export default function RightPanel() {
  return (
    <div className="absolute top-24 right-6 bottom-24 z-40 w-80 flex flex-col gap-4 pointer-events-none">
      
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

      {/* Chart Area */}
      <div className="bg-white/90 backdrop-blur-sm p-4 shadow-md pointer-events-auto flex-shrink-0 h-64 rounded-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-bold border-b-2 border-blue-500 pb-1">保障区统计</span>
        </div>
        <div className="flex gap-2 mb-4">
          <button className="px-3 py-1 bg-white border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors rounded-sm">雷电</button>
          <button className="px-3 py-1 bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium rounded-sm">对流体</button>
        </div>
        <div className="h-32 w-full text-xs"> 
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{fontSize: '12px'}} />
              <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
