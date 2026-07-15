import React from 'react';
import { X } from 'lucide-react';
import { WeatherPoint } from '../utils/weatherPoints';

const getPointLocationAndAddress = (point: WeatherPoint) => {
  const name = point.name;
  if (name.includes('铁山南')) {
    return { location: '湖北省 黄石市', address: '黄石市铁山区铁山南路28号' };
  }
  if (name.includes('金湖') || name.includes('大冶金湖')) {
    return { location: '湖北省 黄石市', address: '黄石市大冶市金湖街道金湖大道' };
  }
  if (name.includes('刘仁八')) {
    return { location: '湖北省 黄石市', address: '黄石市大冶市刘仁八镇刘仁八村' };
  }
  if (name.includes('沿湖生态园')) {
    return { location: '湖北省 黄石市', address: '黄石市大冶市沿湖生态园内' };
  }
  if (name.includes('姜祥村')) {
    return { location: '湖北省 黄石市', address: '黄石市大冶市汪仁镇姜祥村' };
  }
  if (name.includes('白沙')) {
    return { location: '湖北省 黄石市', address: '黄石市大冶市白沙镇白沙村' };
  }
  if (name.includes('太子')) {
    return { location: '湖北省 黄石市', address: '黄石市大冶市太子镇太子村' };
  }

  // Default fallbacks based on region
  if (point.region === '湖北地块') {
    if (name.includes('十堰') || name.includes('武当山')) {
      return { location: '湖北省 十堰市', address: `十堰市茅箭区${name}内` };
    }
    return { location: '湖北省 十堰市', address: `十堰市${name}内` };
  }
  if (point.region === '四川地块') {
    return { location: '四川省 成都市', address: `成都市龙泉驿区${name}内` };
  }
  if (point.region === '安徽地块') {
    return { location: '安徽省 合肥市', address: `合肥市蜀山区${name}内` };
  }
  if (point.region === '江苏地块') {
    return { location: '江苏省 南京市', address: `南京市玄武区${name}内` };
  }

  return { location: '湖北省 十堰市', address: `十堰市${name}内` };
};

export default function MapPopup({ point, onClose }: { point: WeatherPoint | null, onClose: () => void }) {
  if (!point) return null;

  const { location, address } = getPointLocationAndAddress(point);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-[200px] -translate-y-1/2 z-50 bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/80 rounded-xl w-[460px] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-50 to-white px-4 py-3 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
          <span className="text-slate-800 text-[14px] font-bold tracking-wider">作业点详情</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors ml-auto">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 flex gap-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 flex-1 items-start content-start">
          <div className="flex text-xs items-center border-b border-slate-50 pb-1 col-span-2">
            <span className="w-[60px] text-slate-500 mr-2 font-medium shrink-0">编号:</span>
            <span className="text-slate-800 font-medium font-mono">{point.id.replace('wp-', '1301270')}</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1 col-span-2">
            <span className="w-[60px] text-slate-500 mr-2 font-medium shrink-0">名称:</span>
            <span className="text-slate-800 font-medium truncate" title={point.name}>{point.name}</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1 col-span-2">
            <span className="w-[60px] text-slate-500 mr-2 font-medium shrink-0">地理位置:</span>
            <span className="text-slate-800 font-medium truncate">{location}</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1 col-span-2">
            <span className="w-[60px] text-slate-500 mr-2 font-medium shrink-0">详细地址:</span>
            <span className="text-slate-800 font-medium truncate" title={address}>{address}</span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1">
            <span className="w-[40px] text-slate-500 mr-2 font-medium shrink-0">类型:</span>
            <span className="text-slate-800 font-medium truncate">
              {(() => {
                const matchNum = point.id.match(/\d+/);
                const numVal = matchNum ? parseInt(matchNum[0], 10) : 0;
                const siteClass = point.type === 'vehicle' ? 'temporary' : (numVal % 2 === 1 ? 'fixed' : 'mobile');
                if (siteClass === 'temporary') return '临时点';
                const prefix = siteClass === 'fixed' ? '固定' : '移动';
                const suffix = point.type === 'rocket' ? '火箭' : '高炮';
                return `${prefix}${suffix}`;
              })()}
            </span>
          </div>
          <div className="flex text-xs items-center border-b border-slate-50 pb-1">
            <span className="w-[40px] text-slate-500 mr-2 font-medium shrink-0">装备:</span>
            <span className="text-slate-800 font-medium truncate" title="WR-98型">WR-98型</span>
          </div>
        </div>
        
        <div className="w-[140px] h-[105px] bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-200/80 shadow-inner group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=300" 
            alt="实时监控画面" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
            <span className="text-[10px] text-slate-700 bg-white/90 px-2 py-1 rounded-full font-medium shadow-sm">点击放大</span>
          </div>
          <div className="absolute bottom-1 right-1 bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white/90 font-mono">
            实时画面
          </div>
        </div>
      </div>
    </div>
  );
}
