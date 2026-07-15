import React, { useState } from 'react';
import { 
  CloudLightning, 
  Zap, 
  Compass, 
  Radar, 
  Satellite, 
  Crosshair, 
  Rocket, 
  Truck, 
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import RegionSelector from './RegionSelector';

interface EquipmentManagementLeftProps {
  activeRegion: string;
  setActiveRegion: (region: string) => void;
  isCaseMode: boolean;
}

// Sub-modules data structure matching the user's uploaded mock values exactly for Hubei region
const getEquipmentStats = (region: string) => {
  switch (region) {
    case '江苏地块':
      return {
        monitoring: [
          { id: 'lightning', name: '雷电探测装置', count: 45, icon: CloudLightning, color: 'text-amber-500', bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-200/40', unit: '套' },
          { id: 'electric_field', name: '大气电场装置', count: 30, icon: Zap, color: 'text-blue-500', bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-200/40', unit: '套' },
          { id: 'sounding', name: '三维探空装置', count: 15, icon: Compass, color: 'text-indigo-500', bg: 'from-indigo-500/10 to-indigo-500/5', border: 'border-indigo-200/40', unit: '套' },
          { id: 'radar_station', name: '气象雷达站', count: 12, icon: Radar, color: 'text-emerald-500', bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-200/40', unit: '站' },
          { id: 'satellite_receiver', name: '卫星云图接收机', count: 8, icon: Satellite, color: 'text-purple-500', bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-200/40', unit: '台' },
        ],
        operation: [
          { id: 'gun', name: '高炮 装备', count: 20, icon: Crosshair, color: 'text-emerald-600', unit: '门' },
          { id: 'rocket', name: '火箭弹 装备', count: 112, icon: Rocket, color: 'text-blue-600', unit: '枚' },
          { id: 'vehicle', name: '移动作业车', count: 42, icon: Truck, color: 'text-orange-600', unit: '辆' },
        ]
      };
    case '四川地块':
      return {
        monitoring: [
          { id: 'lightning', name: '雷电探测装置', count: 28, icon: CloudLightning, color: 'text-amber-500', bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-200/40', unit: '套' },
          { id: 'electric_field', name: '大气电场装置', count: 18, icon: Zap, color: 'text-blue-500', bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-200/40', unit: '套' },
          { id: 'sounding', name: '三维探空装置', count: 8, icon: Compass, color: 'text-indigo-500', bg: 'from-indigo-500/10 to-indigo-500/5', border: 'border-indigo-200/40', unit: '套' },
          { id: 'radar_station', name: '气象雷达站', count: 6, icon: Radar, color: 'text-emerald-500', bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-200/40', unit: '站' },
          { id: 'satellite_receiver', name: '卫星云图接收机', count: 4, icon: Satellite, color: 'text-purple-500', bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-200/40', unit: '台' },
        ],
        operation: [
          { id: 'gun', name: '高炮 装备', count: 12, icon: Crosshair, color: 'text-emerald-600', unit: '门' },
          { id: 'rocket', name: '火箭弹 装备', count: 65, icon: Rocket, color: 'text-blue-600', unit: '枚' },
          { id: 'vehicle', name: '移动作业车', count: 24, icon: Truck, color: 'text-orange-600', unit: '辆' },
        ]
      };
    case '安徽地块':
      return {
        monitoring: [
          { id: 'lightning', name: '雷电探测装置', count: 32, icon: CloudLightning, color: 'text-amber-500', bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-200/40', unit: '套' },
          { id: 'electric_field', name: '大气电场装置', count: 22, icon: Zap, color: 'text-blue-500', bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-200/40', unit: '套' },
          { id: 'sounding', name: '三维探空装置', count: 10, icon: Compass, color: 'text-indigo-500', bg: 'from-indigo-500/10 to-indigo-500/5', border: 'border-indigo-200/40', unit: '套' },
          { id: 'radar_station', name: '气象雷达站', count: 8, icon: Radar, color: 'text-emerald-500', bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-200/40', unit: '站' },
          { id: 'satellite_receiver', name: '卫星云图接收机', count: 5, icon: Satellite, color: 'text-purple-500', bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-200/40', unit: '台' },
        ],
        operation: [
          { id: 'gun', name: '高炮 装备', count: 14, icon: Crosshair, color: 'text-emerald-600', unit: '门' },
          { id: 'rocket', name: '火箭弹 装备', count: 75, icon: Rocket, color: 'text-blue-600', unit: '枚' },
          { id: 'vehicle', name: '移动作业车', count: 28, icon: Truck, color: 'text-orange-600', unit: '辆' },
        ]
      };
    case '湖北地块':
    default:
      return {
        monitoring: [
          { id: 'lightning', name: '雷电探测装置', count: 36, icon: CloudLightning, color: 'text-amber-500', bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-200/40', unit: '套' },
          { id: 'electric_field', name: '大气电场装置', count: 24, icon: Zap, color: 'text-blue-500', bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-200/40', unit: '套' },
          { id: 'sounding', name: '三维探空装置', count: 12, icon: Compass, color: 'text-indigo-500', bg: 'from-indigo-500/10 to-indigo-500/5', border: 'border-indigo-200/40', unit: '套' },
          { id: 'radar_station', name: '气象雷达站', count: 9, icon: Radar, color: 'text-emerald-500', bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-200/40', unit: '站' },
          { id: 'satellite_receiver', name: '卫星云图接收机', count: 6, icon: Satellite, color: 'text-purple-500', bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-200/40', unit: '台' },
        ],
        operation: [
          { id: 'gun', name: '高炮 装备', count: 16, icon: Crosshair, color: 'text-emerald-600', unit: '门' },
          { id: 'rocket', name: '火箭弹 装备', count: 14, icon: Rocket, color: 'text-blue-600', unit: '枚' },
          { id: 'vehicle', name: '移动作业车', count: 2, icon: Truck, color: 'text-orange-600', unit: '辆' },
        ]
      };
  }
};

// Ammunition detailed storage data
const getAmmunitionStats = (region: string) => {
  switch (region) {
    case '江苏地块':
      return {
        gunShells: { total: 1200, used: 240, safe: 1000, warning: 300, unit: '发' },
        rockets: { total: 280, used: 45, safe: 200, warning: 80, unit: '枚' }
      };
    case '四川地块':
      return {
        gunShells: { total: 850, used: 110, safe: 800, warning: 200, unit: '发' },
        rockets: { total: 190, used: 32, safe: 150, warning: 50, unit: '枚' }
      };
    case '安徽地块':
      return {
        gunShells: { total: 1100, used: 180, safe: 900, warning: 250, unit: '发' },
        rockets: { total: 240, used: 55, safe: 180, warning: 60, unit: '枚' }
      };
    case '湖北地块':
    default:
      return {
        gunShells: { total: 1450, used: 310, safe: 1200, warning: 400, unit: '发' },
        rockets: { total: 350, used: 78, safe: 250, warning: 90, unit: '枚' }
      };
  }
};

// Mock physical units detailed inventory
const mockInventory: Record<string, Array<{ id: string, name: string, status: 'online' | 'offline' | 'maintenance', location: string, info: string }>> = {
  lightning: [
    { id: 'LD-01', name: '黄石铁山雷电监测点', status: 'online', location: '大冶铁山区', info: '放电峰值探测仪 (15A)' },
    { id: 'LD-02', name: '大冶白沙雷电监测站', status: 'online', location: '白沙镇北路', info: '三维定位辐射探测器' },
    { id: 'LD-03', name: '大冶金湖雷电探测仪', status: 'online', location: '金湖生态区', info: '甚高频脉冲计数仪' },
    { id: 'LD-04', name: '咸宁咸安雷电接收端', status: 'maintenance', location: '咸安高新区', info: '天线馈线检修中' },
    { id: 'LD-05', name: '阳新三溪雷电预警仪', status: 'online', location: '三溪镇中段', info: '多频电磁落雷探测仪' },
  ],
  electric_field: [
    { id: 'EF-01', name: '金湖大气电场监测点', status: 'online', location: '金湖湿地公园', info: '旋转叶轮式静电场仪' },
    { id: 'EF-02', name: '沿湖村电场诊断探头', status: 'online', location: '沿湖林地东', info: '高空防雷电位探头' },
    { id: 'EF-03', name: '白沙变电站电场网点', status: 'offline', location: '白沙特高压站', info: '无线传输通信异常' },
    { id: 'EF-04', name: '大冶陈贵电场分析站', status: 'online', location: '陈贵镇西山', info: '地表垂直电场监测探头' },
  ],
  sounding: [
    { id: 'SD-01', name: '铁山南三维探空释放站', status: 'online', location: '铁山南部山区', info: '无线电高空数字探空仪' },
    { id: 'SD-02', name: '大冶金湖垂直对流探针', status: 'online', location: '金湖湿地管理处', info: '激光毫米波微波辐射计' },
    { id: 'SD-03', name: '阳新龙港高空探空基地', status: 'online', location: '龙港镇红色景区', info: '北斗导航GPS声学探空仪' },
  ],
  radar_station: [
    { id: 'RD-01', name: '黄石多普勒双偏振雷达', status: 'online', location: '大冶风鸣顶', info: 'CINRAD/SA-D C波段雷达' },
    { id: 'RD-02', name: '咸宁九宫山精细天气雷达', status: 'online', location: '九宫山主峰', info: 'X波段相控阵脉冲雷达' },
    { id: 'RD-03', name: '湖北鄂州边界层风廓线仪', status: 'online', location: '花湖机场雷达区', info: '高低空声电风廓线雷达' },
  ],
  satellite_receiver: [
    { id: 'SR-01', name: '风云四号B星超高接收站', status: 'online', location: '国网湖北信通中心', info: 'FY-4B超精细图像直收天线' },
    { id: 'SR-02', name: '葵花九号快速传输卫星端', status: 'online', location: '防灾科研所五楼', info: 'Himawari-9 2.4米抛物面直收站' },
  ],
  gun: [
    { id: 'GP-01', name: '铁山南37mm高炮作业点', status: 'online', location: '铁山南山一号位', info: '双管37毫米高射炮 / 待命' },
    { id: 'GP-02', name: '沿湖生态园37mm高炮点', status: 'online', location: '生态园大门西50米', info: '车载全自动遥控防雹高炮' },
    { id: 'GP-03', name: '姜祥村防雹高炮基站', status: 'online', location: '姜祥村委会后山', info: '国网定制抗强对流干预高炮' },
    { id: 'GP-04', name: '太子镇移动高炮战车', status: 'online', location: '太子镇加油站旁', info: '机动履带式遥控火箭高炮' },
  ],
  rocket: [
    { id: 'HJ-01', name: '大冶金湖火箭发射基地', status: 'online', location: '金湖生态林边缘', info: 'WR-98型人工防雹火箭发射架' },
    { id: 'HJ-02', name: '刘仁八人工干预火箭点', status: 'online', location: '刘仁八镇水库大坝', info: '数字化多管固定火箭架' },
    { id: 'HJ-03', name: '白沙防暴两用火箭发射点', status: 'online', location: '白沙镇东茶厂', info: '车载双向遥控火箭弹机位' },
  ],
  vehicle: [
    { id: 'VH-01', name: '应急一号强对流发射车', status: 'online', location: '大冶市住建局', info: '特种防护车载火箭发射平台' },
    { id: 'VH-02', name: '移动式雷达探测指挥车', status: 'online', location: '白沙高速出口', info: '搭载X波段移动相控阵雷达' },
    { id: 'VH-03', name: '特高压抢险应急机动车', status: 'online', location: '咸宁南变电站', info: '国网特高压突发事件多功能车' },
  ],
};

export default function EquipmentManagementLeft({
  activeRegion,
  setActiveRegion,
  isCaseMode
}: EquipmentManagementLeftProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = getEquipmentStats(activeRegion);
  const ammoStats = getAmmunitionStats(activeRegion);

  // Find currently selected category details
  const currentCategoryDetail = 
    stats.monitoring.find(m => m.id === selectedCategory) || 
    stats.operation.find(o => o.id === selectedCategory);

  const inventoryList = selectedCategory ? (mockInventory[selectedCategory] || []) : [];
  
  // Filter inventory list based on search query
  const filteredInventory = inventoryList.filter(item => 
    item.name.includes(searchQuery) || 
    item.id.includes(searchQuery) || 
    item.location.includes(searchQuery)
  );

  const totalMonitoring = stats.monitoring.reduce((sum, item) => sum + item.count, 0);
  const totalOperation = stats.operation.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="absolute top-[76px] bottom-6 left-6 z-40 flex flex-col gap-4 w-[360px] pointer-events-auto select-none">
      
      {/* Region Selector placed first */}
      <RegionSelector activeRegion={activeRegion} setActiveRegion={setActiveRegion} inline />

      {!selectedCategory ? (
        /* LEVEL 1: Overview List - Split into three containers */
        <>
          {/* Card 1: 气象监测装置 (Meteorological Monitoring Devices) */}
          <div className="flex-[4.2] bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                <h3 className="text-xs font-bold text-slate-800">气象监测装置</h3>
              </div>
            </div>

            {/* Grid exactly mirroring the 3-column platform cards layout in the design */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-none">
              <div className="grid grid-cols-3 gap-2">
                {stats.monitoring.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCategory(item.id)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] bg-gradient-to-b overflow-hidden",
                        item.bg,
                        item.border,
                        "hover:border-blue-300"
                      )}
                    >
                      {/* Top floating count exactly like in the design */}
                      <div className="text-base font-bold text-slate-800 font-mono tracking-tight leading-none mb-1">
                        {item.count}
                      </div>

                      {/* Icon Container with glowing base pedestal platform look */}
                      <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 mb-1 group-hover:scale-110 transition-transform duration-300">
                        <Icon className={cn("w-4 h-4", item.color)} />
                        {/* Pedestal shadow overlay */}
                        <div className="absolute bottom-0 left-1 right-1 h-1 bg-slate-100 rounded-full blur-[1px] opacity-60"></div>
                      </div>

                      {/* Device label */}
                      <div className="text-[9px] font-bold text-slate-600 text-center leading-tight tracking-tight">
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: 作业装备 (Operation Equipment) */}
          <div className="flex-[3] bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                <h3 className="text-xs font-bold text-slate-800">作业装备</h3>
              </div>
            </div>

            {/* Grid layout showing parallel small boards ("并列的三个小板板") */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-none">
              <div className="grid grid-cols-3 gap-2">
                {stats.operation.map((item) => {
                  const Icon = item.icon;
                  // Map specific background and border colors for each item to look rich and premium
                  let bg = 'from-emerald-500/10 to-emerald-500/5';
                  let border = 'border-emerald-200/40 hover:border-emerald-300';
                  if (item.id === 'rocket') {
                    bg = 'from-blue-500/10 to-blue-500/5';
                    border = 'border-blue-200/40 hover:border-blue-300';
                  } else if (item.id === 'vehicle') {
                    bg = 'from-orange-500/10 to-orange-500/5';
                    border = 'border-orange-200/40 hover:border-orange-300';
                  }
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCategory(item.id)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] bg-gradient-to-b overflow-hidden",
                        bg,
                        border
                      )}
                    >
                      {/* Top count and unit */}
                      <div className="text-base font-bold text-slate-800 font-mono tracking-tight leading-none mb-1">
                        {item.count}
                        <span className="text-[9px] text-slate-400 font-bold ml-0.5">{item.unit}</span>
                      </div>

                      {/* Icon Container with glowing base pedestal platform look */}
                      <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 mb-1 group-hover:scale-110 transition-transform duration-300">
                        <Icon className={cn("w-4 h-4", item.color)} />
                        {/* Pedestal shadow overlay */}
                        <div className="absolute bottom-0 left-1 right-1 h-1 bg-slate-100 rounded-full blur-[1px] opacity-60"></div>
                      </div>

                      {/* Name label */}
                      <div className="text-[9.5px] font-bold text-slate-600 text-center leading-tight tracking-tight">
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 3: 弹药储备统计 (Ammunition Inventory Statistics) */}
          <div className="flex-[2.8] bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-indigo-500 rounded-full" />
                <h3 className="text-xs font-bold text-slate-800">人影弹药储备统计</h3>
              </div>
            </div>

            {/* Ammunition progress bars in parallel cards */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-none flex items-center">
              <div className="grid grid-cols-2 gap-2 w-full">
                {/* Gun shells */}
                <div className="relative flex flex-col p-2.5 rounded-xl border border-emerald-200/40 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100">
                      <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-right font-mono leading-none">
                      <span className="text-sm font-bold text-slate-800">{ammoStats.gunShells.total}</span>
                      <span className="text-[9px] text-slate-400 font-bold ml-0.5">{ammoStats.gunShells.unit}</span>
                    </div>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-600 mb-1.5">
                    高炮弹储备
                  </div>

                  {/* Clean progress bar */}
                  <div className="w-full h-1 bg-slate-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (ammoStats.gunShells.total / ammoStats.gunShells.safe) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Rockets */}
                <div className="relative flex flex-col p-2.5 rounded-xl border border-blue-200/40 bg-gradient-to-b from-blue-500/10 to-blue-500/5 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100">
                      <Rocket className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="text-right font-mono leading-none">
                      <span className="text-sm font-bold text-slate-800">{ammoStats.rockets.total}</span>
                      <span className="text-[9px] text-slate-400 font-bold ml-0.5">{ammoStats.rockets.unit}</span>
                    </div>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-600 mb-1.5">
                    火箭弹储备
                  </div>

                  {/* Clean progress bar */}
                  <div className="w-full h-1 bg-slate-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (ammoStats.rockets.total / ammoStats.rockets.safe) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* LEVEL 2: Detailed Equipment List */
        <div className="flex-1 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
            
            {/* Nav Back Button */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-bold mb-3 shrink-0 self-start transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              返回装备大厅
            </button>

            {/* Category Banner Title */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl mb-3.5 shrink-0">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200/60">
                {currentCategoryDetail && React.createElement(currentCategoryDetail.icon, { 
                  className: cn("w-5 h-5", currentCategoryDetail.color) 
                })}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800 leading-tight">
                  {currentCategoryDetail?.name} 详情
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  全省部署共 <span className="font-bold text-slate-700">{currentCategoryDetail?.count}</span> {currentCategoryDetail?.unit}
                </p>
              </div>
            </div>

            {/* Search Input Filter */}
            <div className="relative mb-3.5 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索装备名称、编号或安装地点..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder-slate-400"
              />
            </div>

            {/* Physical list section */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-none flex flex-col gap-2">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((unit) => {
                  return (
                    <div
                      key={unit.id}
                      className="group bg-white hover:bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-200 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {unit.id}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {unit.name}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-1">
                          {unit.status === 'online' && (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-[10px] text-emerald-600 font-bold">在线</span>
                            </>
                          )}
                          {unit.status === 'offline' && (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-[10px] text-rose-600 font-bold">离线</span>
                            </>
                          )}
                          {unit.status === 'maintenance' && (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[10px] text-amber-600 font-bold">维护</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Extra info metrics */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>地点: <strong className="text-slate-600">{unit.location}</strong></span>
                        <span className="text-slate-500 italic font-sans">{unit.info}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
                  <Search className="w-8 h-8 text-slate-300 mb-2" />
                  没有找到符合条件的装备
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
