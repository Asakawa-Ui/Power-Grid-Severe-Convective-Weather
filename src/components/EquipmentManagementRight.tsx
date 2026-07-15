import React from 'react';
import { 
  CloudLightning, 
  Zap, 
  Compass, 
  Radar, 
  Satellite, 
  ChevronRight, 
  Crosshair, 
  Rocket, 
  Camera 
} from 'lucide-react';

interface EquipmentManagementRightProps {
  activeRegion: string;
}

// Interface for status record
interface StatusRecord {
  id: string;
  name: string;
  online: number;
  maintenance: number;
  offline: number;
  icon: React.ElementType;
}

const getMonitoringStatus = (region: string): StatusRecord[] => {
  switch (region) {
    case '江苏地块':
      return [
        { id: 'lightning', name: '雷电探测装置', online: 39, maintenance: 4, offline: 2, icon: CloudLightning },
        { id: 'electric_field', name: '大气电场装置', online: 26, maintenance: 2, offline: 2, icon: Zap },
        { id: 'sounding', name: '三维探空装置', online: 13, maintenance: 1, offline: 1, icon: Compass },
        { id: 'radar_station', name: '气象雷达站', online: 11, maintenance: 1, offline: 0, icon: Radar },
        { id: 'satellite_receiver', name: '卫星云图接收机', online: 7, maintenance: 1, offline: 0, icon: Satellite },
      ];
    case '四川地块':
      return [
        { id: 'lightning', name: '雷电探测装置', online: 24, maintenance: 2, offline: 2, icon: CloudLightning },
        { id: 'electric_field', name: '大气电场装置', online: 15, maintenance: 2, offline: 1, icon: Zap },
        { id: 'sounding', name: '三维探空装置', online: 7, maintenance: 1, offline: 0, icon: Compass },
        { id: 'radar_station', name: '气象雷达站', online: 5, maintenance: 1, offline: 0, icon: Radar },
        { id: 'satellite_receiver', name: '卫星云图接收机', online: 4, maintenance: 0, offline: 0, icon: Satellite },
      ];
    case '安徽地块':
      return [
        { id: 'lightning', name: '雷电探测装置', online: 28, maintenance: 2, offline: 2, icon: CloudLightning },
        { id: 'electric_field', name: '大气电场装置', online: 19, maintenance: 2, offline: 1, icon: Zap },
        { id: 'sounding', name: '三维探空装置', online: 9, maintenance: 1, offline: 0, icon: Compass },
        { id: 'radar_station', name: '气象雷达站', online: 7, maintenance: 1, offline: 0, icon: Radar },
        { id: 'satellite_receiver', name: '卫星云图接收机', online: 4, maintenance: 0, offline: 1, icon: Satellite },
      ];
    case '湖北地块':
    default:
      return [
        { id: 'lightning', name: '雷电探测装置', online: 31, maintenance: 3, offline: 2, icon: CloudLightning },
        { id: 'electric_field', name: '大气电场装置', online: 20, maintenance: 2, offline: 2, icon: Zap },
        { id: 'sounding', name: '三维探空装置', online: 10, maintenance: 1, offline: 1, icon: Compass },
        { id: 'radar_station', name: '气象雷达站', online: 8, maintenance: 1, offline: 0, icon: Radar },
        { id: 'satellite_receiver', name: '卫星云图接收机', online: 5, maintenance: 0, offline: 1, icon: Satellite },
      ];
  }
};

const getOperationStatus = (region: string) => {
  switch (region) {
    case '江苏地块':
      return {
        gun: { name: '高炮 装备', online: 16, maintenance: 2, offline: 2 },
        rocket: { name: '火箭 装备', online: 95, maintenance: 9, offline: 8 }
      };
    case '四川地块':
      return {
        gun: { name: '高炮 装备', online: 9, maintenance: 1, offline: 2 },
        rocket: { name: '火箭 装备', online: 55, maintenance: 4, offline: 6 }
      };
    case '安徽地块':
      return {
        gun: { name: '高炮 装备', online: 11, maintenance: 1, offline: 2 },
        rocket: { name: '火箭 装备', online: 63, maintenance: 5, offline: 7 }
      };
    case '湖北地块':
    default:
      return {
        gun: { name: '高炮 装备', online: 12, maintenance: 2, offline: 2 },
        rocket: { name: '火箭 装备', online: 75, maintenance: 6, offline: 8 }
      };
  }
};

const liveSceneInfo = {
  imageUrl: 'https://images.unsplash.com/photo-1601901140613-25501fb75ee0?auto=format&fit=crop&w=400&q=80'
};

export default function EquipmentManagementRight({ activeRegion }: EquipmentManagementRightProps) {
  const monitoringData = getMonitoringStatus(activeRegion);
  const operationData = getOperationStatus(activeRegion);

  return (
    <div className="absolute top-[76px] right-6 bottom-6 z-40 w-[360px] pointer-events-auto flex flex-col gap-4 select-none animate-fade-in">
      
      {/* 1. 监测装置运行状态 Container */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col overflow-hidden shrink-0">
        {/* Title */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
            <h3 className="text-xs font-bold text-slate-800">监测装置运行状态</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Rows exactly mirroring the design list with 3 status dots */}
        <div className="flex flex-col gap-2">
          {monitoringData.map((device) => {
            const Icon = device.icon;
            return (
              <div 
                key={device.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-2.5 shadow-sm transition-all duration-200 hover:border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200/50 shadow-sm text-slate-500 shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-[11.5px] font-bold text-slate-700">{device.name}</span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  {/* Online */}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9.5px] text-slate-400 font-bold">在线</span>
                    <span className="text-xs font-bold text-emerald-600">{device.online}</span>
                  </div>
                  {/* Maintenance */}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-[9.5px] text-slate-400 font-bold">维护</span>
                    <span className="text-xs font-bold text-amber-600">{device.maintenance}</span>
                  </div>
                  {/* Offline */}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-[9.5px] text-slate-400 font-bold">离线</span>
                    <span className="text-xs font-bold text-rose-600">{device.offline}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 作业装备运行状态 Container */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col overflow-hidden shrink-0">
        {/* Title */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
            <h3 className="text-xs font-bold text-slate-800">作业装备运行状态</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 2 Grid cards with 3 status columns: 正常, 维护, 离线 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: 高炮装备 */}
          <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col">
            <div className="flex items-center gap-1.5 mb-2.5 border-b border-slate-100 pb-1.5">
              <Crosshair className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">{operationData.gun.name}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-center font-mono">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-emerald-600 leading-tight">{operationData.gun.online}</span>
                <span className="text-[9px] text-slate-400 font-bold">正常</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-amber-500 leading-tight">{operationData.gun.maintenance}</span>
                <span className="text-[9px] text-slate-400 font-bold">维护</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-rose-500 leading-tight">{operationData.gun.offline}</span>
                <span className="text-[9px] text-slate-400 font-bold">离线</span>
              </div>
            </div>
          </div>

          {/* Card 2: 火箭装备 */}
          <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col">
            <div className="flex items-center gap-1.5 mb-2.5 border-b border-slate-100 pb-1.5">
              <Rocket className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">{operationData.rocket.name}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-center font-mono">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-emerald-600 leading-tight">{operationData.rocket.online}</span>
                <span className="text-[9px] text-slate-400 font-bold">正常</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-amber-500 leading-tight">{operationData.rocket.maintenance}</span>
                <span className="text-[9px] text-slate-400 font-bold">维护</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-rose-500 leading-tight">{operationData.rocket.offline}</span>
                <span className="text-[9px] text-slate-400 font-bold">离线</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 现场实景 Container (Static Image without Overlay text) */}
      <div className="flex-1 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 rounded-xl p-4 flex flex-col overflow-hidden min-h-0">
        {/* Title */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-800">现场实景</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Static Image Display without overlays */}
        <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-100 min-h-[140px]">
          <img 
            src={liveSceneInfo.imageUrl} 
            alt="现场实景"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

    </div>
  );
}
