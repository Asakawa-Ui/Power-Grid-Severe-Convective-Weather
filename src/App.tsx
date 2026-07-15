/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import BottomPanel from './components/BottomPanel';
import RegionSelector from './components/RegionSelector';
import Map3D from './components/Map3D';
import WeatherLegend from './components/WeatherLegend';
import DataLayersPanel from './components/DataLayersPanel';
import OperationCommandLeft from './components/OperationCommandLeft';
import OperationCommandRight from './components/OperationCommandRight';
import ScrollingMessages from './components/ScrollingMessages';
import MapPopup from './components/MapPopup';
import { WeatherPoint, weatherPoints } from './utils/weatherPoints';
import EffectEvaluationLeft from './components/EffectEvaluationLeft';
import EffectEvaluationRight, { EffectEvaluationRightCharts, EffectEvaluationHistoryList, getHistorySiteDetails } from './components/EffectEvaluationRight';
import EffectEvaluationBottom from './components/EffectEvaluationBottom';

export default function App() {
  const [activeRegion, setActiveRegion] = useState('四川地块');
  const [activeNav, setActiveNav] = useState('作业指挥'); // default to the newly requested view for easy viewing
  const [selectedPoint, setSelectedPoint] = useState<WeatherPoint | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('h1');
  
  // Case Study Mode playback states
  const [isCaseMode, setIsCaseMode] = useState(false);
  const [playbackMinutes, setPlaybackMinutes] = useState(90);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Normal / Real-time Mode states
  const [normalMinutes, setNormalMinutes] = useState(1080); // defaults to 18:00 (18 * 60 = 1080)
  const [normalIsPlaying, setNormalIsPlaying] = useState(false);

  // Sync map playback times with the selected history site's operation time when evaluating
  useEffect(() => {
    if (activeNav === '效果评估') {
      const siteDetails = getHistorySiteDetails(selectedHistoryId, isCaseMode);
      if (siteDetails) {
        const [h, m] = siteDetails.time.split(':').map(Number);
        const siteMinutes = h * 60 + m;
        if (isCaseMode) {
          const pm = siteMinutes - 900;
          setPlaybackMinutes(pm);
        } else {
          setNormalMinutes(siteMinutes);
        }
      }
    }
  }, [selectedHistoryId, isCaseMode, activeNav]);

  // Playback timer ticker for Case Study Mode
  useEffect(() => {
    if (!isCaseMode || !isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackMinutes((prev) => {
        if (prev >= 120) {
          setIsPlaying(false);
          return 120;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isCaseMode, isPlaying, playbackSpeed]);

  // Playback timer ticker for Normal/Real-time Mode
  useEffect(() => {
    if (isCaseMode || !normalIsPlaying) return;
    const interval = setInterval(() => {
      setNormalMinutes((prev) => (prev + 1 >= 1110 ? 1050 : prev + 1)); // loops inside 1-hour window [1050, 1110]
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isCaseMode, normalIsPlaying, playbackSpeed]);

  // Handle switching between Real-time (实况) and Case Study (个例) modes
  const handleModeChange = (caseMode: boolean) => {
    setIsCaseMode(caseMode);
    setSelectedHistoryId(caseMode ? 'c1' : 'h1');
    if (caseMode) {
      setNormalIsPlaying(false);
      setPlaybackMinutes(90);
      setIsPlaying(false); // DO NOT autoplay when entering Case Study mode
    } else {
      setIsPlaying(false);
      setNormalIsPlaying(false);
    }
  };



  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {activeNav !== '效果评估' && (
        <Map3D activeRegion={activeRegion} onPointClick={setSelectedPoint} isCaseMode={isCaseMode} playbackMinutes={playbackMinutes} normalMinutes={normalMinutes} activeNav={activeNav} />
      )}
      <Header 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        isCaseMode={isCaseMode}
        onModeChange={handleModeChange}
        playbackMinutes={playbackMinutes}
        normalMinutes={normalMinutes}
      />
      
      {activeNav === '作业指挥' && <ScrollingMessages isCaseMode={isCaseMode} playbackMinutes={playbackMinutes} />}
      
      {activeNav === '监测预警' && (
        <>
          <LeftPanel activeRegion={activeRegion} setActiveRegion={setActiveRegion} />
          <RightPanel />
        </>
      )}

      {activeNav === '作业指挥' && (
        <>
          <OperationCommandLeft 
            isCaseMode={isCaseMode} 
            playbackMinutes={playbackMinutes} 
            activeRegion={activeRegion}
            setActiveRegion={setActiveRegion}
          />
          <OperationCommandRight isCaseMode={isCaseMode} playbackMinutes={playbackMinutes} />
          {selectedPoint && <MapPopup point={selectedPoint} onClose={() => setSelectedPoint(null)} />}
        </>
      )}

      {activeNav === '效果评估' && (
        <div className="absolute top-16 left-0 right-0 bottom-0 bg-[#f1f5f9] flex p-3 gap-3 overflow-hidden select-none z-30 animate-fade-in">
          {/* Column 1: Left Panel */}
          <div className="w-[360px] shrink-0 flex flex-col gap-3 h-full">
            <EffectEvaluationLeft activeRegion={activeRegion} isCaseMode={isCaseMode} />
          </div>

          {/* Center Area: Map + Right Charts + Bottom Matrix */}
          <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">
            {/* Top part: Map & Center-Right Charts */}
            <div className="flex-1 flex gap-3 min-h-0 min-w-0">
              {/* Map Box */}
              <div className="flex-1 bg-white border border-slate-200/50 rounded-xl flex flex-col shadow-sm relative min-w-0 overflow-hidden">
                <div className="flex-1 relative overflow-hidden bg-slate-50">
                  <Map3D 
                    activeRegion={activeRegion} 
                    onPointClick={setSelectedPoint} 
                    isCaseMode={isCaseMode} 
                    playbackMinutes={playbackMinutes} 
                    normalMinutes={normalMinutes}
                    activeNav={activeNav} 
                    selectedHistoryId={selectedHistoryId}
                  />
                  <BottomPanel 
                    isCaseMode={isCaseMode}
                    playbackMinutes={playbackMinutes}
                    setPlaybackMinutes={setPlaybackMinutes}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                    normalMinutes={normalMinutes}
                    setNormalMinutes={setNormalMinutes}
                    normalIsPlaying={normalIsPlaying}
                    setNormalIsPlaying={setNormalIsPlaying}
                    variant="inline"
                    selectedHistoryId={selectedHistoryId}
                  />
                </div>
              </div>

              {/* Center-Right Charts */}
              <div className="w-[380px] shrink-0 flex flex-col gap-0 h-full">
                <EffectEvaluationRightCharts selectedHistoryId={selectedHistoryId} isCaseMode={isCaseMode} />
              </div>
            </div>

            {/* Bottom matrix */}
            <div className="h-[175px] shrink-0 bg-white border border-slate-200/50 rounded-xl p-3 shadow-sm flex flex-col justify-center overflow-x-auto scrollbar-none">
              <EffectEvaluationBottom
                isCaseMode={isCaseMode}
                playbackMinutes={playbackMinutes}
                setPlaybackMinutes={setPlaybackMinutes}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                selectedHistoryId={selectedHistoryId}
              />
            </div>
          </div>

          {/* Column 4: History list */}
          <div className="w-[280px] shrink-0 bg-white border border-slate-200/50 rounded-xl p-3.5 flex flex-col shadow-sm overflow-hidden h-full">
            <EffectEvaluationHistoryList selectedHistoryId={selectedHistoryId} setSelectedHistoryId={setSelectedHistoryId} isCaseMode={isCaseMode} />
          </div>
        </div>
      )}

      {activeNav !== '效果评估' && (
        <BottomPanel 
          isCaseMode={isCaseMode}
          playbackMinutes={playbackMinutes}
          setPlaybackMinutes={setPlaybackMinutes}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          normalMinutes={normalMinutes}
          setNormalMinutes={setNormalMinutes}
          normalIsPlaying={normalIsPlaying}
          setNormalIsPlaying={setNormalIsPlaying}
        />
      )}
      {activeNav !== '效果评估' && <WeatherLegend activeNav={activeNav} />}
      {activeNav === '监测预警' && (
        <DataLayersPanel 
          activeNav={activeNav}
          isCaseMode={isCaseMode}
          playbackMinutes={playbackMinutes}
          normalMinutes={normalMinutes}
        />
      )}


    </div>
  );
}
