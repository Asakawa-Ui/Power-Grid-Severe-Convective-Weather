import React from 'react';
import { cn } from '../lib/utils';

const regions = ['湖北地块', '四川地块', '安徽地块', '江苏地块'];

interface Props {
  activeRegion: string;
  setActiveRegion: (region: string) => void;
}

export default function RegionSelector({ activeRegion, setActiveRegion }: Props) {
  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 flex gap-4">
      {regions.map((region) => {
        const isActive = activeRegion === region;
        return (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={cn(
              "px-6 py-4 bg-white/90 backdrop-blur-sm shadow-md border border-slate-200 text-sm font-medium transition-colors flex flex-col items-center min-w-[100px]",
              isActive ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {region}
            {isActive && <span className="text-xs font-normal opacity-60 mt-1">(选中)</span>}
          </button>
        );
      })}
    </div>
  );
}
