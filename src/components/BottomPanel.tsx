import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Calendar, Clock, ChevronDown } from 'lucide-react';
import { getHistorySiteDetails } from './EffectEvaluationRight';
import { cachedSelectedProductKey, cachedActiveMain, cachedSelectedProductKeys } from './LeftPanel';

interface BottomPanelProps {
  activeNav?: string;
  isCaseMode?: boolean;
  playbackMinutes?: number;
  setPlaybackMinutes?: (val: number | ((prev: number) => number)) => void;
  isPlaying?: boolean;
  setIsPlaying?: (val: boolean) => void;
  playbackSpeed?: number;
  setPlaybackSpeed?: (val: number) => void;
  normalMinutes?: number;
  setNormalMinutes?: (val: number | ((prev: number) => number)) => void;
  normalIsPlaying?: boolean;
  setNormalIsPlaying?: (val: boolean) => void;
  variant?: 'global' | 'inline';
  selectedHistoryId?: string;
}

const FORECAST_STEPS = [1, 2, 3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 60, 72];

export default function BottomPanel({
  activeNav,
  isCaseMode = false,
  playbackMinutes = 0,
  setPlaybackMinutes,
  isPlaying = false,
  setIsPlaying,
  playbackSpeed = 1,
  setPlaybackSpeed,
  normalMinutes = 1080,
  setNormalMinutes,
  normalIsPlaying = false,
  setNormalIsPlaying,
  variant = 'global',
  selectedHistoryId,
}: BottomPanelProps) {
  
  // Speed selection menu state
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  // Step selection menu state
  const [showStepMenu, setShowStepMenu] = useState(false);
  const [stepMinutes, setStepMinutes] = useState(isCaseMode ? 5 : 10);

  // NWP (Numerical Weather Prediction) / Extrapolation Timeline state for 监测预警
  const [initDate, setInitDate] = useState('2026-07-07');
  const [initTimeOfDay, setInitTimeOfDay] = useState('08:00');
  const initTime = `${initDate} ${initTimeOfDay}`;

  const [forecastIsPlaying, setForecastIsPlaying] = useState(false);

  const getForecastConfig = (productKeys: string[]) => {
    const fcKey = productKeys.find((k) => typeof k === 'string' && (k.startsWith('forecast|') || k.includes('外推')));
    if (fcKey && fcKey.includes('外推')) {
      return {
        type: 'extrapolation',
        stepMinutes: 6,
        minMinutes: 0,
        maxMinutes: 120, // 2h
        // 等时间间距：每 30 分钟一个刻度
        ticks: [0, 30, 60, 90, 120]
      };
    }
    if (fcKey && fcKey.includes('短临')) {
      return {
        type: 'shortRange',
        stepMinutes: 15,
        minMinutes: 0,
        maxMinutes: 1440, // 24h
        // 等时间间距：每 3 小时 (180 分钟) 一个刻度
        ticks: [0, 180, 360, 540, 720, 900, 1080, 1260, 1440]
      };
    }
    // Default for 全国3x3, 高精度网格, EC数值预报 (1h step, 72h max)
    return {
      type: 'grid72h',
      stepMinutes: 60,
      minMinutes: 0,
      maxMinutes: 4320, // 72h
      // 等时间间距：每 6 小时 (360 分钟) 一个刻度
      ticks: [0, 360, 720, 1080, 1440, 1800, 2160, 2520, 2880, 3240, 3600, 3960, 4320]
    };
  };

  const [forecastConfig, setForecastConfig] = useState(() => {
    return getForecastConfig(cachedSelectedProductKeys || []);
  });

  const [forecastMinutes, setForecastMinutes] = useState(60); // default offset

  const [isForecastProduct, setIsForecastProduct] = useState(() => {
    const keys = cachedSelectedProductKeys || [];
    const key = cachedSelectedProductKey || '';
    return (
      (key && (key.startsWith('forecast|') || key.includes('外推'))) ||
      keys.some((k: string) => typeof k === 'string' && (k.startsWith('forecast|') || k.includes('外推'))) ||
      cachedActiveMain === 'forecast'
    );
  });

  useEffect(() => {
    const handleProductChange = (e: CustomEvent) => {
      const keys = e.detail;
      if (Array.isArray(keys) && keys.length > 0) {
        const isFc = keys.some((k: string) => typeof k === 'string' && (k.startsWith('forecast|') || k.includes('外推')));
        setIsForecastProduct(isFc);
        const cfg = getForecastConfig(keys);
        setForecastConfig(cfg);
        setForecastMinutes((prev) => Math.max(cfg.minMinutes, Math.min(cfg.maxMinutes, prev)));
      } else {
        const isFc = (cachedSelectedProductKey && (cachedSelectedProductKey.startsWith('forecast|') || cachedSelectedProductKey.includes('外推'))) || cachedActiveMain === 'forecast';
        setIsForecastProduct(isFc);
        const cfg = getForecastConfig(cachedSelectedProductKeys || []);
        setForecastConfig(cfg);
      }
    };

    window.addEventListener('product-select-changed', handleProductChange as EventListener);
    return () => {
      window.removeEventListener('product-select-changed', handleProductChange as EventListener);
    };
  }, []);

  // Forecast autoplay timer
  useEffect(() => {
    if (!forecastIsPlaying) return;
    const timer = setInterval(() => {
      setForecastMinutes((prev) => {
        const next = prev + forecastConfig.stepMinutes;
        if (next > forecastConfig.maxMinutes) {
          return forecastConfig.minMinutes;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [forecastIsPlaying, forecastConfig]);

  const isNwpMode = activeNav === '监测预警' && isForecastProduct;

  const formatForecastTime = (initStr: string, minutesAhead: number, formatType: 'tick' | 'bubble' = 'tick') => {
    try {
      const [datePart, timePart] = initStr.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      const d = new Date(year, month - 1, day, hour, minute + minutesAhead);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      const hStr = String(d.getHours()).padStart(2, '0');
      const minStr = String(d.getMinutes()).padStart(2, '0');

      if (formatType === 'bubble') {
        return `${mStr}-${dStr} ${hStr}:${minStr}`;
      }
      return `${hStr}:${minStr}`;
    } catch {
      return `+${minutesAhead}m`;
    }
  };

  const handleForecastStepPrev = () => {
    setForecastMinutes((prev) => Math.max(forecastConfig.minMinutes, prev - forecastConfig.stepMinutes));
  };

  const handleForecastStepNext = () => {
    setForecastMinutes((prev) => Math.min(forecastConfig.maxMinutes, prev + forecastConfig.stepMinutes));
  };

  // Handle play/pause toggle
  const togglePlay = () => {
    if (isCaseMode) {
      setIsPlaying?.(!isPlaying);
    } else {
      setNormalIsPlaying?.(!normalIsPlaying);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (isCaseMode) {
      setPlaybackMinutes?.(variant === 'inline' ? 90 : 0);
      setIsPlaying?.(false); // Do not autoplay on reset
    } else {
      setNormalMinutes?.(1080); // reset to 18:00
      setNormalIsPlaying?.(false);
    }
  };

  // Handle step backward/forward
  const handleStepPrev = () => {
    if (isCaseMode) {
      const minVal = variant === 'inline' ? 60 : 0;
      setPlaybackMinutes?.((prev) => Math.max(minVal, prev - stepMinutes));
    } else {
      const minVal = variant === 'inline' ? 1050 : 960;
      setNormalMinutes?.((prev) => Math.max(minVal, prev - stepMinutes));
    }
  };

  const handleStepNext = () => {
    if (isCaseMode) {
      const maxVal = variant === 'inline' ? 120 : 180;
      setPlaybackMinutes?.((prev) => Math.min(maxVal, prev + stepMinutes)); // Step forward stepMinutes
    } else {
      const maxVal = variant === 'inline' ? 1110 : 1140;
      setNormalMinutes?.((prev) => Math.min(maxVal, prev + stepMinutes)); // Step forward stepMinutes
    }
  };

  // Formatted date and time strings
  let formattedDate = '2026-07-07';
  let formattedTime = '18:00';
  let percentage = 0;

  if (variant === 'inline' && selectedHistoryId) {
    const siteDetails = getHistorySiteDetails(selectedHistoryId, isCaseMode);
    formattedDate = siteDetails.date.substring(0, 10);
    
    const [sh, sm] = siteDetails.time.split(':').map(Number);
    const siteMinutes = sh * 60 + sm;
    
    const currentAbs = isCaseMode ? (playbackMinutes + 900) : normalMinutes;
    const clampedAbs = Math.max(siteMinutes - 30, Math.min(siteMinutes + 30, currentAbs));
    
    const ch = Math.floor(clampedAbs / 60) % 24;
    const cm = clampedAbs % 60;
    formattedTime = `${ch.toString().padStart(2, '0')}:${cm.toString().padStart(2, '0')}`;
    
    percentage = ((clampedAbs - (siteMinutes - 30)) / 60) * 100;
  } else if (isCaseMode) {
    formattedDate = '2026-06-18';
    const baseHour = 15;
    const h = Math.floor(playbackMinutes / 60) + baseHour;
    const m = playbackMinutes % 60;
    formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    percentage = (playbackMinutes / 180) * 100;
  } else {
    formattedDate = '2026-07-07';
    const h = Math.floor(normalMinutes / 60) % 24;
    const m = normalMinutes % 60;
    formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    // Clamp normalMinutes to [960, 1140] range for percentage
    const clampedMinutes = Math.max(960, Math.min(1140, normalMinutes));
    percentage = ((clampedMinutes - 960) / 180) * 100;
  }

  // Ticks calculation
  const caseTicks = [0, 30, 60, 90, 120, 150, 180];
  // 3-hour window ticks: 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00
  const normalTicks = [960, 990, 1020, 1050, 1080, 1110, 1140];

  const siteDetails = (variant === 'inline' && selectedHistoryId) ? getHistorySiteDetails(selectedHistoryId, isCaseMode) : null;
  const siteMinutes = siteDetails ? (() => {
    const [sh, sm] = siteDetails.time.split(':').map(Number);
    return sh * 60 + sm;
  })() : 0;

  const sliderValue = variant === 'inline' && selectedHistoryId
    ? (isCaseMode ? ((playbackMinutes ?? 0) + 900) : (normalMinutes ?? 1080))
    : (isCaseMode ? (playbackMinutes ?? 0) : (normalMinutes ?? 1080));

  let sliderMin = isCaseMode ? 0 : 960;
  let sliderMax = isCaseMode ? 180 : 1140;
  let displayPercentage = percentage;
  let ticksToRender: number[] = [];

  if (variant === 'inline') {
    if (selectedHistoryId && siteMinutes) {
      sliderMin = siteMinutes - 30;
      sliderMax = siteMinutes + 30;
      displayPercentage = ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100;
      ticksToRender = [siteMinutes - 30, siteMinutes - 15, siteMinutes, siteMinutes + 15, siteMinutes + 30];
    } else {
      sliderMin = isCaseMode ? 60 : 1050; // 16:00 or 17:30
      sliderMax = isCaseMode ? 120 : 1110; // 17:00 or 18:30
      displayPercentage = ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100;
      ticksToRender = isCaseMode ? [60, 90, 120] : [1050, 1080, 1110];
    }
  } else {
    ticksToRender = isCaseMode ? caseTicks : normalTicks;
    displayPercentage = percentage;
  }

  const containerClasses = variant === 'global' 
    ? `absolute bottom-6 left-6 ${activeNav === '作业指挥' ? 'right-[392px]' : 'right-[380px]'} z-50 bg-white/80 backdrop-blur-md shadow-2xl px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-slate-200/80`
    : "absolute bottom-2 left-2 right-2 z-50 bg-white/75 backdrop-blur-md shadow-lg px-3 py-2 rounded-xl flex items-center gap-2.5 border border-slate-200/80";

  // NWP Mode percentage calculation
  const forecastPercentage = ((forecastMinutes - forecastConfig.minMinutes) / (forecastConfig.maxMinutes - forecastConfig.minMinutes)) * 100;

  return (
    <div className={containerClasses}>
      
      {/* Date & Time Compact Pill Container / NWP Init Time Selector */}
      {isNwpMode ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[12px] font-sans font-semibold text-slate-700 select-none whitespace-nowrap">起报时间:</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-50 border border-slate-200 h-8 px-2 rounded-lg shadow-inner">
              <input
                type="date"
                value={initDate}
                onChange={(e) => setInitDate(e.target.value)}
                className="bg-transparent text-[12px] font-sans font-bold text-slate-800 outline-none cursor-pointer border-none p-0 w-[105px]"
              />
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 h-8 px-2 rounded-lg shadow-inner">
              <input
                type="time"
                value={initTimeOfDay}
                onChange={(e) => setInitTimeOfDay(e.target.value)}
                className="bg-transparent text-[12px] font-sans font-bold text-slate-800 outline-none cursor-pointer border-none p-0 w-[55px]"
              />
            </div>
          </div>
        </div>
      ) : variant === 'global' && (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 h-8 px-2.5 rounded-lg shadow-inner shrink-0">
          <span className="text-[12px] font-sans font-medium text-slate-700 select-none whitespace-nowrap leading-none">{formattedDate}</span>
          <div className="w-[1px] h-3 bg-slate-200 mx-0.5" />
          <span className="text-[12px] font-sans font-medium text-slate-700 select-none whitespace-nowrap leading-none">{formattedTime}</span>
        </div>
      )}

      {/* Media Controls */}
      {isNwpMode ? (
        <div className="flex items-center gap-[1.5px] shrink-0">
          <button 
            onClick={handleForecastStepPrev}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="上一个预报步长"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setForecastIsPlaying(!forecastIsPlaying)}
            className="w-7 h-7 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-all active:scale-95"
            title={forecastIsPlaying ? "暂停" : "播放预报演变"}
          >
            {forecastIsPlaying ? (
              <Pause className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
          </button>
          <button 
            onClick={handleForecastStepNext}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="下一个预报步长"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Compact Media Controls & Switchers grouped together with gap-[1.5px] */
        <div className="flex items-center gap-[1.5px] shrink-0">
          {/* Compact Media Controls */}
          <div className="flex items-center gap-[1.5px] shrink-0">
            <button 
              onClick={handleStepPrev}
              className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
              title={`后退${stepMinutes}分钟`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-7 h-7 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-all active:scale-95"
              title={(isCaseMode ? isPlaying : normalIsPlaying) ? "暂停" : "播放"}
            >
              {(isCaseMode ? isPlaying : normalIsPlaying) ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
            </button>
            <button 
              onClick={handleStepNext}
              className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
              title={`前进${stepMinutes}分钟`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {variant !== 'inline' && (
              <button 
                onClick={handleReset}
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                title="重置时刻"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Step size switcher */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowStepMenu(!showStepMenu)}
              className="h-8 w-14 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 text-xs font-bold flex items-center justify-center transition-all select-none active:scale-95"
              title="选择步进步长"
            >
              <span className="font-sans whitespace-nowrap">{stepMinutes}min</span>
            </button>
            
            {showStepMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setShowStepMenu(false)} 
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl p-1 shadow-xl flex flex-col gap-0.5 min-w-[56px] z-50 animate-fade-in">
                  {[1, 5, 6, 10, 30, 60].map((step) => (
                    <button
                      key={step}
                      onClick={() => {
                        setStepMinutes(step);
                        setShowStepMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-sans font-bold text-center transition-all ${
                        stepMinutes === step
                          ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {step}m
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Playback speed switcher */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="h-8 w-10 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 text-xs font-bold flex items-center justify-center transition-all select-none active:scale-95"
              title="选择回放速度"
            >
              <span className="font-sans">{playbackSpeed}x</span>
            </button>
            
            {showSpeedMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setShowSpeedMenu(false)} 
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl p-1 shadow-xl flex flex-col gap-0.5 min-w-[40px] z-50 animate-fade-in">
                  {[1, 2, 3, 5, 10].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed?.(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-sans font-bold text-center transition-all ${
                        playbackSpeed === speed
                          ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Adaptive Timeline Bar */}
      <div className="flex-1 relative flex items-center h-8 mx-1 min-w-[200px]">
        {/* Native range input slider */}
        {isNwpMode ? (
          <input
            type="range"
            min={forecastConfig.minMinutes}
            max={forecastConfig.maxMinutes}
            step={forecastConfig.stepMinutes}
            value={forecastMinutes}
            onChange={(e) => {
              setForecastMinutes(parseInt(e.target.value, 10));
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0 p-0 z-30"
          />
        ) : (
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            value={sliderValue}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (variant === 'inline' && selectedHistoryId) {
                if (isCaseMode) {
                  setPlaybackMinutes?.(val - 900);
                } else {
                  setNormalMinutes?.(val);
                }
              } else {
                if (isCaseMode) {
                  const clamped = Math.max(60, Math.min(120, val));
                  setPlaybackMinutes?.(variant === 'inline' ? clamped : Math.max(0, Math.min(180, val)));
                } else {
                  const clamped = Math.max(1050, Math.min(1110, val));
                  setNormalMinutes?.(variant === 'inline' ? clamped : Math.max(960, Math.min(1140, val)));
                }
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0 p-0 z-30"
          />
        )}

        {/* Custom Rendered Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full shadow-inner z-10 overflow-hidden border border-slate-300/20">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.2)]" 
            style={{ width: `${isNwpMode ? forecastPercentage : displayPercentage}%` }}
          />
        </div>

        {/* Tick Marks */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0 flex justify-between px-1 pointer-events-none z-10">
          {isNwpMode ? (
            forecastConfig.ticks.map((tick) => {
              const tickPercentage = ((tick - forecastConfig.minMinutes) / (forecastConfig.maxMinutes - forecastConfig.minMinutes)) * 100;
              const isPassed = forecastMinutes >= tick;
              const tickLabel = formatForecastTime(initTime, tick, 'tick');
              return (
                <div 
                  key={tick} 
                  className="absolute flex flex-col items-center -translate-x-1/2" 
                  style={{ left: `${tickPercentage}%` }}
                >
                  <div className={`w-[1px] h-1 transition-colors mt-1 ${isPassed ? 'bg-blue-500/80' : 'bg-slate-300'}`} />
                  <span className={`absolute top-2.5 text-[9px] font-sans select-none transition-colors whitespace-nowrap ${isPassed ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                    {tickLabel}
                  </span>
                </div>
              );
            })
          ) : variant === 'inline' ? (
            ticksToRender.map((tick) => {
              if (!selectedHistoryId) {
                const isOutOfAbsoluteBounds = isCaseMode
                  ? (tick < 0 || tick > 180)
                  : (tick < 960 || tick > 1140);
                if (isOutOfAbsoluteBounds) return null;
              }

              const tickPercentage = ((tick - sliderMin) / (sliderMax - sliderMin)) * 100;
              
              let tickLabel = '';
              if (selectedHistoryId) {
                const th = Math.floor(tick / 60) % 24;
                const tm = tick % 60;
                tickLabel = `${th.toString().padStart(2, '0')}:${tm.toString().padStart(2, '0')}`;
              } else if (isCaseMode) {
                const th = Math.floor(tick / 60) + 15;
                const tm = tick % 60;
                tickLabel = `${th.toString().padStart(2, '0')}:${tm.toString().padStart(2, '0')}`;
              } else {
                const th = Math.floor(tick / 60) % 24;
                const tm = tick % 60;
                tickLabel = `${th.toString().padStart(2, '0')}:${tm.toString().padStart(2, '0')}`;
              }

              const isPassed = sliderValue >= tick;
              return (
                <div 
                  key={tick} 
                  className="absolute flex flex-col items-center -translate-x-1/2" 
                  style={{ left: `${tickPercentage}%` }}
                >
                  <div className={`w-[1px] h-1 transition-colors mt-1 ${isPassed ? 'bg-blue-500/80' : 'bg-slate-300'}`} />
                  <span className={`absolute top-2.5 text-[9px] font-sans select-none transition-colors whitespace-nowrap ${isPassed ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                    {tickLabel}
                  </span>
                </div>
              );
            })
          ) : isCaseMode ? (
            caseTicks.map((tick) => {
              const tickPercentage = (tick / 180) * 100;
              const th = Math.floor(tick / 60) + 15;
              const tm = tick % 60;
              const tickLabel = `${th.toString().padStart(2, '0')}:${tm.toString().padStart(2, '0')}`;
              const isPassed = playbackMinutes >= tick;
              return (
                <div 
                  key={tick} 
                  className="absolute flex flex-col items-center -translate-x-1/2" 
                  style={{ left: `${tickPercentage}%` }}
                >
                  <div className={`w-[1px] h-1 transition-colors mt-1 ${isPassed ? 'bg-blue-500/80' : 'bg-slate-300'}`} />
                  <span className={`absolute top-2.5 text-[9px] font-sans select-none transition-colors whitespace-nowrap ${isPassed ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                    {tickLabel}
                  </span>
                </div>
              );
            })
          ) : (
            normalTicks.map((tick) => {
              const tickPercentage = ((tick - 960) / 180) * 100;
              const th = Math.floor(tick / 60) % 24;
              const tm = tick % 60;
              const tickLabel = `${th.toString().padStart(2, '0')}:${tm.toString().padStart(2, '0')}`;
              const isPassed = normalMinutes >= tick;
              return (
                <div 
                  key={tick} 
                  className="absolute flex flex-col items-center -translate-x-1/2" 
                  style={{ left: `${tickPercentage}%` }}
                >
                  <div className={`w-[1px] h-1 transition-colors mt-1 ${isPassed ? 'bg-blue-500/80' : 'bg-slate-300'}`} />
                  <span className={`absolute top-2.5 text-[9px] font-sans select-none transition-colors whitespace-nowrap ${isPassed ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                    {tickLabel}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Indicator Handle & Tag */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20"
          style={{ left: `${isNwpMode ? forecastPercentage : displayPercentage}%` }}
        >
          <div className="absolute bottom-3 bg-blue-600 text-white text-[10px] font-sans font-bold px-1.5 py-0.5 rounded shadow-[0_2px_5px_rgba(37,99,235,0.2)] whitespace-nowrap">
            {isNwpMode ? formatForecastTime(initTime, forecastMinutes, 'bubble') : formattedTime}
          </div>
          <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(37,99,235,0.35)] border-2 border-white">
            <div className="w-0.5 h-0.5 bg-white rounded-full animate-ping" />
          </div>
        </div>
      </div>
    </div>
  );
}

