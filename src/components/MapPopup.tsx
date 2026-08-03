import React from 'react';
import { X } from 'lucide-react';
import { WeatherPoint } from '../utils/weatherPoints';

export const getSiteDetails = (point: WeatherPoint) => {
  const name = point.name;
  let siteName = name.endsWith('作业点') ? name : `${name}作业点`;
  let siteCode = '1301270001';
  let region = '湖北省黄石市大冶市';
  let address = '湖北省黄石市大冶市金牛镇姜祥村';
  let equipment = point.type === 'gun' ? '高炮' : '火箭弹';
  let inventory = '24发';

  if (name.includes('姜祥村')) {
    siteCode = '1301270001';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市金牛镇姜祥村';
    equipment = '火箭弹';
    inventory = '24发';
  } else if (name.includes('金湖') || name.includes('大冶金湖')) {
    siteCode = '1301270002';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市金湖街道金湖大道';
    equipment = '火箭弹';
    inventory = '18发';
  } else if (name.includes('刘仁八')) {
    siteCode = '1301270003';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市刘仁八镇刘仁八村';
    equipment = '火箭弹';
    inventory = '24发';
  } else if (name.includes('铁山南')) {
    siteCode = '1301270004';
    region = '湖北省黄石市铁山区';
    address = '湖北省黄石市铁山区铁山南路28号';
    equipment = '高炮';
    inventory = '120发';
  } else if (name.includes('沿湖生态园')) {
    siteCode = '1301270005';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市沿湖生态园内';
    equipment = '火箭弹';
    inventory = '16发';
  } else if (name.includes('白沙')) {
    siteCode = '1301270006';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市白沙镇白沙村';
    equipment = '火箭弹';
    inventory = '24发';
  } else if (name.includes('太子')) {
    siteCode = '1301270007';
    region = '湖北省黄石市大冶市';
    address = '湖北省黄石市大冶市太子镇太子村';
    equipment = '火箭弹';
    inventory = '20发';
  } else {
    const numMatch = point.id.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0], 10) : 1;
    siteCode = `130127${String(num).padStart(4, '0')}`;

    if (point.region === '四川地块') {
      region = '四川省成都市龙泉驿区';
      address = `四川省成都市龙泉驿区${name}`;
    } else if (point.region === '安徽地块') {
      region = '安徽省合肥市蜀山区';
      address = `安徽省合肥市蜀山区${name}`;
    } else if (point.region === '江苏地块') {
      region = '江苏省南京市玄武区';
      address = `江苏省南京市玄武区${name}`;
    } else {
      region = '湖北省十堰市茅箭区';
      address = `湖北省十堰市茅箭区${name}`;
    }
    equipment = point.type === 'gun' ? '高炮' : '火箭弹';
    inventory = point.type === 'gun' ? '120发' : '24发';
  }

  return { siteName, siteCode, region, address, equipment, inventory };
};

export default function MapPopup({ point, onClose }: { point: WeatherPoint | null, onClose: () => void }) {
  if (!point) return null;

  const { siteName, siteCode, region, address, equipment, inventory } = getSiteDetails(point);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[130%] z-50 bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 rounded-lg w-[240px] p-3 text-xs text-slate-700 animate-fade-in select-text">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[13px]">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
          <span>{siteName}</span>
        </div>
        <button onClick={onClose} className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="space-y-1.5 text-[11.5px] leading-snug">
        <div className="flex items-start">
          <span className="text-slate-400 w-[60px] shrink-0 font-medium">站点名称:</span>
          <span className="text-slate-800 font-semibold">{siteName}</span>
        </div>
        <div className="flex items-center">
          <span className="text-slate-400 w-[60px] shrink-0 font-medium">站点编号:</span>
          <span className="text-slate-800 font-mono font-medium">{siteCode}</span>
        </div>
        <div className="flex items-start">
          <span className="text-slate-400 w-[60px] shrink-0 font-medium">所属区域:</span>
          <span className="text-slate-800 font-medium">{region}</span>
        </div>
        <div className="flex items-start">
          <span className="text-slate-400 w-[60px] shrink-0 font-medium">详细地址:</span>
          <span className="text-slate-800 font-medium break-all">{address}</span>
        </div>
        <div className="flex items-center">
          <span className="text-slate-400 w-[60px] shrink-0 font-medium">作业器具:</span>
          <span className="text-slate-800 font-medium">{equipment}</span>
        </div>
        <div className="flex items-center">
          <span className="text-slate-400 w-[60px] shrink-0 font-medium">弹药库存:</span>
          <span className="text-slate-800 font-semibold text-emerald-600">{inventory}</span>
        </div>
      </div>

      {/* Bubble pointer beak tip */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-white/95 filter drop-shadow(0 2px 1px rgba(0,0,0,0.06))" />
    </div>
  );
}

