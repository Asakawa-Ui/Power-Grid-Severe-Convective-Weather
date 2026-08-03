import React, { useState } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHistorySiteDetails } from './EffectEvaluationRight';

interface BottomProps {
  isCaseMode: boolean;
  playbackMinutes: number;
  setPlaybackMinutes: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  selectedHistoryId?: string;
}

export default function EffectEvaluationBottom({
  isCaseMode,
  playbackMinutes,
  setPlaybackMinutes,
  isPlaying,
  setIsPlaying,
  selectedHistoryId = 'h1'
}: BottomProps) {
  const [selectedStepOffset, setSelectedStepOffset] = useState<number>(0);

  const siteDetails = getHistorySiteDetails(selectedHistoryId, isCaseMode);
  const baseTimeStr = siteDetails.time;
  const [h, m] = baseTimeStr.split(':').map(Number);
  const baseMinutes = h * 60 + m;

  const getDynamicStepTimeStr = (offset: number) => {
    const totalMins = (baseMinutes + offset + 1440) % 1440;
    const hh = Math.floor(totalMins / 60).toString().padStart(2, '0');
    const mm = (totalMins % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const steps = [
    { offset: -15 },
    { offset: -10 },
    { offset: -5 },
    { offset: 0 },
    { offset: 5 },
    { offset: 10 },
    { offset: 15 },
    { offset: 20 }
  ];

  // Helper to render radar mock gradients
  const getRadarGradientStyle = (row: 'actual' | 'extrapolated', offset: number) => {
    if (row === 'actual') {
      switch (offset) {
        case -15:
          return 'radial-gradient(circle, #ef4444 20%, #eab308 45%, #22c55e 70%, #1e293b 100%)';
        case -10:
          return 'radial-gradient(circle, #ef4444 25%, #eab308 50%, #22c55e 75%, #1e293b 100%)';
        case -5:
          return 'radial-gradient(circle, #ef4444 18%, #eab308 45%, #22c55e 70%, #1e293b 100%)';
        case 0:
          return 'radial-gradient(circle, #ef4444 12%, #eab308 40%, #22c55e 65%, #1e293b 100%)';
        case 5:
          return 'radial-gradient(circle, #eab308 15%, #22c55e 55%, #3b82f6 80%, #1e293b 100%)';
        case 10:
          return 'radial-gradient(circle, #22c55e 20%, #3b82f6 60%, #1e293b 100%)';
        case 15:
          return 'radial-gradient(circle, #3b82f6 25%, #1e293b 90%)';
        case 20:
        default:
          return 'radial-gradient(circle, #3b82f6 10%, #1e293b 95%)';
      }
    } else {
      switch (offset) {
        case -15:
          return 'radial-gradient(circle, #ef4444 20%, #eab308 45%, #22c55e 70%, #1e293b 100%)';
        case -10:
          return 'radial-gradient(circle, #ef4444 25%, #eab308 50%, #22c55e 75%, #1e293b 100%)';
        case -5:
          return 'radial-gradient(circle, #ef4444 22%, #eab308 48%, #22c55e 72%, #1e293b 100%)';
        case 0:
          return 'radial-gradient(circle, #ef4444 24%, #eab308 50%, #22c55e 75%, #1e293b 100%)';
        case 5:
          return 'radial-gradient(circle, #f43f5e 28%, #ef4444 40%, #eab308 60%, #22c55e 80%, #1e293b 100%)';
        case 10:
          return 'radial-gradient(circle, #f43f5e 32%, #ef4444 45%, #eab308 65%, #22c55e 85%, #1e293b 100%)';
        case 15:
          return 'radial-gradient(circle, #ef4444 30%, #eab308 60%, #22c55e 80%, #1e293b 100%)';
        case 20:
        default:
          return 'radial-gradient(circle, #ef4444 28%, #eab308 55%, #22c55e 75%, #1e293b 100%)';
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center" id="eval-bottom-panel">
      {/* Comparative Matrix Grid */}
      <div className="flex items-stretch gap-4">
        {/* Row Labels */}
        <div className="flex flex-col justify-between py-1 w-16 text-xs font-bold text-slate-500 select-none">
          <div className="flex items-center justify-center h-14 bg-blue-50/50 rounded-lg text-blue-700 border border-blue-100/50">实际变化</div>
          <div className="flex items-center justify-center h-14 bg-slate-50 rounded-lg text-slate-600 border border-slate-100 mt-2">外推变化</div>
        </div>

        {/* Thumbnail matrix columns */}
        <div className="flex-1 grid grid-cols-8 gap-2">
          {steps.map((step) => {
            const isSelected = selectedStepOffset === step.offset;
            const timeStr = getDynamicStepTimeStr(step.offset);
            const displayText = step.offset === 0 ? `${timeStr} (作业)` : timeStr;

            return (
              <div
                key={step.offset}
                onClick={() => setSelectedStepOffset(step.offset)}
                className={`flex flex-col items-center p-1 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-400'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                {/* Actual radar thumbnail */}
                <div 
                  className="w-14 h-14 rounded-lg relative overflow-hidden border border-slate-700/20"
                  style={{ background: getRadarGradientStyle('actual', step.offset) }}
                >
                  <div className="absolute top-0.5 left-0.5 text-[8px] text-white/80 font-bold px-1 py-0.2 bg-slate-900/60 rounded backdrop-blur-[1px]">实</div>
                  {step.offset === 0 && (
                    <div className="absolute inset-0 border border-emerald-500 flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  )}
                </div>

                {/* Extrapolated radar thumbnail */}
                <div 
                  className="w-14 h-14 rounded-lg relative overflow-hidden border border-slate-700/20 mt-2"
                  style={{ background: getRadarGradientStyle('extrapolated', step.offset) }}
                >
                  <div className="absolute top-0.5 left-0.5 text-[8px] text-white/80 font-bold px-1 py-0.2 bg-slate-900/60 rounded backdrop-blur-[1px]">外</div>
                </div>

                <div className="mt-1 flex flex-col items-center text-center w-full min-w-0">
                  <span className={`text-[10px] font-bold leading-tight whitespace-nowrap ${isSelected ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {displayText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
