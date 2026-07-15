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
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

// Dynamic warnings counts for Line and Area modes
const lineWarnings = [
  { level: 'red', count: 1, label: '红色预警', color: 'text-red-600' },
  { level: 'orange', count: 5, label: '橙色预警', color: 'text-orange-600' },
  { level: 'yellow', count: 44, label: '黄色预警', color: 'text-amber-600' },
];

const areaWarnings = [
  { level: 'red', count: 1, label: '红色预警', color: 'text-red-600' },
  { level: 'orange', count: 2, label: '橙色预警', color: 'text-orange-600' },
  { level: 'yellow', count: 12, label: '黄色预警', color: 'text-amber-600' },
];

type Level = 'red' | 'orange' | 'yellow';

interface WarningItem {
  id: string;
  lineName: string;
  sections: string;
  levelText: '红色预警' | '橙色预警' | '黄色预警';
  level: Level;
  time: string;
}

// 50 High-fidelity warning items to support 10 pages of pagination
const listItems: WarningItem[] = [
  // Page 1 - Exactly matching the user's uploaded image
  { id: '1', lineName: '五卓 I 路', sections: '(56#~67#)', levelText: '橙色预警', level: 'orange', time: '2026-07-13 15:20:00' },
  { id: '2', lineName: '贺罗 II 线', sections: '(275#~294#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:20:00' },
  { id: '3', lineName: '牛从甲线', sections: '(2374#~2381#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:20:00' },
  { id: '4', lineName: '五卓 I 路', sections: '(52#~87#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:20:00' },
  { id: '5', lineName: '桂山甲线', sections: '(106#~113#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:20:00' },

  // Page 2
  { id: '6', lineName: '九三甲线', sections: '(142#~175#)', levelText: '红色预警', level: 'red', time: '2026-07-13 15:15:00' },
  { id: '7', lineName: '汉川三回线', sections: '(45#~78#)', levelText: '橙色预警', level: 'orange', time: '2026-07-13 15:10:00' },
  { id: '8', lineName: '随州极线', sections: '(12#~43#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:08:00' },
  { id: '9', lineName: '十堰 I 线', sections: '(156#~189#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:05:00' },
  { id: '10', lineName: '二龙乙线', sections: '(88#~124#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:00:00' },

  // Page 3
  { id: '11', lineName: '葛随双线', sections: '(210#~235#)', levelText: '橙色预警', level: 'orange', time: '2026-07-13 14:55:00' },
  { id: '12', lineName: '三峡外送线', sections: '(312#~350#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:50:00' },
  { id: '13', lineName: '江夏变分支', sections: '(8#~24#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:45:00' },
  { id: '14', lineName: '黄冈大别山线', sections: '(89#~115#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:40:00' },
  { id: '15', lineName: '咸宁九宫山线', sections: '(67#~92#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:35:00' },

  // Page 4
  { id: '16', lineName: '孝感双峰线', sections: '(34#~56#)', levelText: '橙色预警', level: 'orange', time: '2026-07-13 14:30:00' },
  { id: '17', lineName: '武昌保合线', sections: '(123#~145#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:25:00' },
  { id: '18', lineName: '鄂州樊口线', sections: '(12#~35#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:20:00' },
  { id: '19', lineName: '黄石磁湖线', sections: '(56#~78#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:15:00' },
  { id: '20', lineName: '仙桃陈港线', sections: '(90#~112#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:10:00' },

  // Page 5
  { id: '21', lineName: '潜江浩口线', sections: '(45#~67#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:05:00' },
  { id: '22', lineName: '天门竟陵线', sections: '(112#~134#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:00:00' },
  { id: '23', lineName: '神农架木鱼线', sections: '(23#~45#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:55:00' },
  { id: '24', lineName: '恩施清江线', sections: '(156#~178#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:50:00' },
  { id: '25', lineName: '宜昌当阳线', sections: '(78#~98#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:45:00' },

  // Page 6
  { id: '26', lineName: '荆州纪南线', sections: '(34#~56#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:40:00' },
  { id: '27', lineName: '十堰竹山线', sections: '(89#~112#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:35:00' },
  { id: '28', lineName: '襄阳古城线', sections: '(12#~34#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:30:00' },
  { id: '29', lineName: '随州曾都线', sections: '(56#~78#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:25:00' },
  { id: '30', lineName: '荆门京山线', sections: '(90#~112#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:20:00' },

  // Page 7
  { id: '31', lineName: '咸宁通山线', sections: '(23#~45#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:15:00' },
  { id: '32', lineName: '黄冈麻城线', sections: '(67#~89#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:10:00' },
  { id: '33', lineName: '武汉汉口线', sections: '(112#~134#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:05:00' },
  { id: '34', lineName: '二龙甲线', sections: '(45#~67#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 13:00:00' },
  { id: '35', lineName: '九三乙线', sections: '(89#~112#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:55:00' },

  // Page 8
  { id: '36', lineName: '葛随单线', sections: '(23#~45#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:50:00' },
  { id: '37', lineName: '五卓 II 路', sections: '(56#~78#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:45:00' },
  { id: '38', lineName: '孝感大悟线', sections: '(12#~34#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:40:00' },
  { id: '39', lineName: '随州随县线', sections: '(56#~78#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:35:00' },
  { id: '40', lineName: '荆门沙洋线', sections: '(90#~112#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:30:00' },

  // Page 9
  { id: '41', lineName: '咸宁赤壁线', sections: '(23#~45#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:25:00' },
  { id: '42', lineName: '黄冈红安线', sections: '(67#~89#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:20:00' },
  { id: '43', lineName: '武汉青山线', sections: '(112#~134#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:15:00' },
  { id: '44', lineName: '二龙丙线', sections: '(45#~67#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:10:00' },
  { id: '45', lineName: '九三丙线', sections: '(89#~112#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:05:00' },

  // Page 10
  { id: '46', lineName: '葛随丁线', sections: '(23#~45#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 12:00:00' },
  { id: '47', lineName: '五卓 III 路', sections: '(56#~78#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 11:55:00' },
  { id: '48', lineName: '孝感云梦线', sections: '(12#~34#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 11:50:00' },
  { id: '49', lineName: '随州广水线', sections: '(56#~78#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 11:45:00' },
  { id: '50', lineName: '荆门钟祥线', sections: '(90#~112#)', levelText: '黄色预警', level: 'yellow', time: '2026-07-12 11:40:00' }
];

// Area-based High-fidelity warning items (District/Substation grids)
const areaListItems: WarningItem[] = [
  { id: 'a1', lineName: '随州市 曾都区', sections: '', levelText: '橙色预警', level: 'orange', time: '2026-07-13 15:18:00' },
  { id: 'a2', lineName: '孝感市 大悟县', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:15:00' },
  { id: 'a3', lineName: '十堰市 丹江口市', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:10:00' },
  { id: 'a4', lineName: '武汉市 黄陂区', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:05:00' },
  { id: 'a5', lineName: '荆门市 京山市', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 15:00:00' },
  { id: 'a6', lineName: '咸宁市 通山县', sections: '', levelText: '红色预警', level: 'red', time: '2026-07-13 14:55:00' },
  { id: 'a7', lineName: '黄冈市 麻城市', sections: '', levelText: '橙色预警', level: 'orange', time: '2026-07-13 14:50:00' },
  { id: 'a8', lineName: '宜昌市 当阳市', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:45:00' },
  { id: 'a9', lineName: '恩施州 利川市', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:40:00' },
  { id: 'a10', lineName: '襄阳市 谷城县', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:35:00' },
  { id: 'a11', lineName: '孝感市 孝昌县', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:30:00' },
  { id: 'a12', lineName: '随州市 广水市', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:25:00' },
  { id: 'a13', lineName: '神农架林区', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:20:00' },
  { id: 'a14', lineName: '荆州市 洪湖市', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:15:00' },
  { id: 'a15', lineName: '天门市 竟陵区', sections: '', levelText: '黄色预警', level: 'yellow', time: '2026-07-13 14:10:00' }
];

interface HourlyLightningRecord {
  hour: number;
  count: number;
  color: string;
}

const hourlyLightningData: HourlyLightningRecord[] = [
  { hour: 0, count: 3760, color: 'bg-[#00f0ff]' }, // Cyan
  { hour: 1, count: 6952, color: 'bg-[#00f0ff]' },
  { hour: 2, count: 7670, color: 'bg-[#00f0ff]' },
  { hour: 3, count: 8562, color: 'bg-[#7c2222]' }, // Dark Red / Brown
  { hour: 4, count: 8148, color: 'bg-[#7c2222]' },
  { hour: 5, count: 4378, color: 'bg-[#7c2222]' },
  { hour: 6, count: 3617, color: 'bg-[#ff00ff]' }, // Magenta
  { hour: 7, count: 3000, color: 'bg-[#ff00ff]' },
  { hour: 8, count: 3071, color: 'bg-[#ff00ff]' },
  { hour: 9, count: 3304, color: 'bg-[#10ff10]' }, // Green
  { hour: 10, count: 3310, color: 'bg-[#10ff10]' },
  { hour: 11, count: 2470, color: 'bg-[#10ff10]' },
  { hour: 12, count: 5690, color: 'bg-[#0022ff]' }, // Blue
  { hour: 13, count: 16714, color: 'bg-[#0022ff]' },
  { hour: 14, count: 22218, color: 'bg-[#0022ff]' },
  { hour: 15, count: 20447, color: 'bg-[#ffcc00]' }, // Yellow
  { hour: 16, count: 23921, color: 'bg-[#ffcc00]' },
  { hour: 17, count: 22297, color: 'bg-[#ffcc00]' },
  { hour: 18, count: 18699, color: 'bg-[#ff7f00]' }, // Orange
  { hour: 19, count: 19622, color: 'bg-[#ff7f00]' },
  { hour: 20, count: 13423, color: 'bg-[#ff7f00]' },
  { hour: 21, count: 11501, color: 'bg-[#ff2222]' }, // Red
  { hour: 22, count: 10333, color: 'bg-[#ff2222]' },
  { hour: 23, count: 11532, color: 'bg-[#ff2222]' }
];

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<'line' | 'area'>('line');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const currentList = activeTab === 'line' ? listItems : areaListItems;
  const currentWarnings = activeTab === 'line' ? lineWarnings : areaWarnings;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);

  // Sliced items for the current page
  const displayedItems = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="absolute top-[76px] right-6 bottom-6 z-40 w-80 flex flex-col gap-4 pointer-events-none">
      
      {/* 实时预警监测 Module */}
      <div className="bg-white/90 backdrop-blur-sm p-3 shadow-md pointer-events-auto flex flex-col flex-1 min-h-0 rounded-sm border border-slate-100/80 animate-fade-in relative">
        
        {/* Bookmark tabs sticking out from the left */}
        <div className="absolute -left-[28px] top-6 flex flex-col gap-1.5 z-40 pointer-events-auto">
          <button
            onClick={() => {
              setActiveTab('line');
              setCurrentPage(1);
            }}
            className={cn(
              "w-[28px] py-3.5 flex flex-col items-center justify-center text-[10px] font-bold tracking-wider rounded-l-md transition-all cursor-pointer select-none border-l border-y",
              activeTab === 'line'
                ? "bg-white text-blue-600 border-slate-200/80 shadow-[-2px_1px_3px_rgba(0,0,0,0.06)] translate-x-[1px] z-10"
                : "bg-slate-100/90 text-slate-500 border-slate-200/40 hover:bg-slate-50 hover:text-slate-700 hover:translate-x-[0.5px] z-0"
            )}
          >
            <div className="flex flex-col items-center justify-center gap-0.5 leading-none">
              <span>线</span>
              <span>路</span>
              <span>预</span>
              <span>警</span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('area');
              setCurrentPage(1);
            }}
            className={cn(
              "w-[28px] py-3.5 flex flex-col items-center justify-center text-[10px] font-bold tracking-wider rounded-l-md transition-all cursor-pointer select-none border-l border-y",
              activeTab === 'area'
                ? "bg-white text-blue-600 border-slate-200/80 shadow-[-2px_1px_3px_rgba(0,0,0,0.06)] translate-x-[1px] z-10"
                : "bg-slate-100/90 text-slate-500 border-slate-200/40 hover:bg-slate-50 hover:text-slate-700 hover:translate-x-[0.5px] z-0"
            )}
          >
            <div className="flex flex-col items-center justify-center gap-0.5 leading-none">
              <span>区</span>
              <span>域</span>
              <span>预</span>
              <span>警</span>
            </div>
          </button>
        </div>

        {/* Warning Summary Cards - Adjusted to 3 cols for Red, Orange, Yellow */}
        <div className="grid grid-cols-3 gap-1.5 mb-2 flex-shrink-0">
          {currentWarnings.map((w) => (
            <div key={w.level} className="bg-slate-50 border border-slate-100/80 p-2 text-center flex flex-col items-center justify-center rounded-sm shadow-sm">
              <span className="text-base font-bold text-slate-800 leading-none mb-1">{w.count}</span>
              <span className={cn("text-[10px] font-bold whitespace-nowrap", w.color)}>{w.label}</span>
            </div>
          ))}
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-1.5">
          {displayedItems.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "border rounded p-2 flex flex-row items-center justify-between transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-100 duration-200 gap-2.5",
                item.level === 'red' && "bg-red-50/90 border-red-200/60 hover:bg-red-100/90",
                item.level === 'orange' && "bg-orange-50/90 border-orange-200/60 hover:bg-orange-100/90",
                item.level === 'yellow' && "bg-amber-50/80 border-amber-200/50 hover:bg-amber-100/80"
              )}
              title={activeTab === 'line' ? "点击定位线路" : "点击定位区域"}
              onClick={() => {
                if (activeTab === 'line') {
                  console.log(`Focusing on line: ${item.lineName}`);
                  const event = new CustomEvent('focus-line', { detail: { lineName: item.lineName } });
                  window.dispatchEvent(event);
                } else {
                  console.log(`Focusing on area: ${item.lineName}`);
                  const event = new CustomEvent('focus-area', { detail: { areaName: item.lineName } });
                  window.dispatchEvent(event);
                }
              }}
            >
              {/* Left part: text which can wrap */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-[11px] leading-snug font-normal",
                  item.level === 'red' && "text-red-950",
                  item.level === 'orange' && "text-orange-950",
                  item.level === 'yellow' && "text-amber-950"
                )}>
                  {activeTab === 'line' ? (
                    <>{item.lineName} {item.sections}区段将发生雷电活动</>
                  ) : (
                    <>{item.lineName}将发生雷电活动</>
                  )}
                  <span className={cn(
                    "ml-1 font-semibold",
                    item.level === 'red' && "text-red-600",
                    item.level === 'orange' && "text-orange-600",
                    item.level === 'yellow' && "text-amber-600"
                  )}>
                    {item.levelText}
                  </span>
                </div>
              </div>

              {/* Right part: fixed-width, neutral, vertically aligned time */}
              <div className="w-10 shrink-0 text-right font-mono text-[11px] font-medium text-slate-700">
                {item.time.split(' ')[1].substring(0, 5)}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls - Beautifully styled to match the image */}
        <div className="flex items-center justify-center gap-1 mt-2.5 pt-2.5 border-t border-slate-100 flex-shrink-0 select-none">
          {/* Previous Arrow */}
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "w-5 h-5 flex items-center justify-center text-[10px] rounded border transition-colors",
              currentPage === 1 
                ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" 
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 cursor-pointer"
            )}
          >
            &lt;
          </button>

          {/* Dynamic Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={cn(
                "w-5 h-5 flex items-center justify-center text-[10px] rounded transition-all font-semibold font-mono",
                currentPage === p
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100/80 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
              )}
            >
              {p}
            </button>
          ))}

          {/* Next Arrow */}
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "w-5 h-5 flex items-center justify-center text-[10px] rounded border transition-colors",
              currentPage === totalPages 
                ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" 
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 cursor-pointer"
            )}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* 过去24小时雷电监测 Module */}
      <div className="bg-white/90 backdrop-blur-sm p-3 shadow-md pointer-events-auto flex flex-col h-[48%] rounded-sm border border-slate-100/80 animate-fade-in">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-800">过去24小时雷电监测</span>
          </div>
        </div>

        {/* Hourly chart body placed directly in the module */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="flex flex-col">
            {hourlyLightningData.map((item) => (
              <div key={item.hour} className="flex items-center gap-2 py-0.5 hover:bg-slate-50/50 rounded px-1 transition-colors">
                {/* Hour */}
                <span className="text-slate-400 font-sans text-[11px] w-4 text-left shrink-0">{item.hour}</span>
                {/* Horizontal Rounded capsule bar */}
                <div className="flex-1 bg-transparent h-2 flex items-center">
                  <div 
                    className={cn("h-1.5 rounded-full transition-all duration-500", item.color)} 
                    style={{ width: `${(item.count / 23921) * 100}%` }}
                  />
                </div>
                {/* Count value */}
                <span className="text-slate-500 font-sans text-[11px] font-medium w-10 text-right shrink-0 font-mono">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
