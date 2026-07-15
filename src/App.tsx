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
import MapLayersPanel from './components/MapLayersPanel';
import OperationCommandLeft from './components/OperationCommandLeft';
import OperationCommandRight from './components/OperationCommandRight';
import ScrollingMessages from './components/ScrollingMessages';
import MapPopup from './components/MapPopup';
import { WeatherPoint, weatherPoints } from './utils/weatherPoints';
import EffectEvaluationLeft from './components/EffectEvaluationLeft';
import EffectEvaluationRight, { EffectEvaluationRightCharts, EffectEvaluationHistoryList, getHistorySiteDetails, RadarReflectivityStatChange } from './components/EffectEvaluationRight';
import EffectEvaluationBottom from './components/EffectEvaluationBottom';
import EquipmentManagementLeft from './components/EquipmentManagementLeft';
import EquipmentManagementRight from './components/EquipmentManagementRight';

export default function App() {
  const [activeRegion, setActiveRegion] = useState('湖北地块');
  const [activeNav, setActiveNav] = useState('作业指挥'); // default to the newly requested view for easy viewing
  const [selectedPoint, setSelectedPoint] = useState<WeatherPoint | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('h1');
  
  // Case Study Mode playback states
  const [isCaseMode, setIsCaseMode] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState('2026-06-18');
  const [playbackMinutes, setPlaybackMinutes] = useState(90);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Normal / Real-time Mode states
  const [normalMinutes, setNormalMinutes] = useState(1080); // defaults to 18:00 (18 * 60 = 1080)
  const [normalIsPlaying, setNormalIsPlaying] = useState(false);

  // Reset case mode to false when activeNav is '监测预警'
  useEffect(() => {
    if (activeNav === '监测预警') {
      setIsCaseMode(false);
    }
  }, [activeNav]);

  // Sync map playback times with the selected history site's operation time when evaluating
  useEffect(() => {
    if (activeNav === '效果评估') {
      const siteDetails = getHistorySiteDetails(selectedHistoryId, isCaseMode, activeCaseId);
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
  }, [selectedHistoryId, isCaseMode, activeNav, activeCaseId]);

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
    if (caseMode) {
      const targetId = activeCaseId === '2026-07-02' ? 'n1' : 'c1';
      setSelectedHistoryId(targetId);
      if (activeCaseId === '2026-07-02') {
        setActiveRegion('江苏地块');
      } else {
        setActiveRegion('湖北地块');
      }
      setNormalIsPlaying(false);
      setPlaybackMinutes(90);
      setIsPlaying(false); // DO NOT autoplay when entering Case Study mode
    } else {
      setSelectedHistoryId('h1');
      setActiveRegion('湖北地块');
      setIsPlaying(false);
      setNormalIsPlaying(false);
    }
  };

  const handleCaseChange = (caseId: string) => {
    setActiveCaseId(caseId);
    setSelectedHistoryId(caseId === '2026-07-02' ? 'n1' : 'c1');
    if (caseId === '2026-07-02') {
      setActiveRegion('江苏地块');
    } else {
      setActiveRegion('湖北地块');
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
        activeCaseId={activeCaseId}
        setActiveCaseId={handleCaseChange}
      />
      
      {activeNav === '作业指挥' && (
        <ScrollingMessages 
          isCaseMode={isCaseMode} 
          playbackMinutes={playbackMinutes} 
          normalMinutes={normalMinutes} 
        />
      )}
      
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
            <EffectEvaluationLeft activeRegion={activeRegion} isCaseMode={isCaseMode} activeCaseId={activeCaseId} />
          </div>

          {/* Column 2: Center Map + Bottom Matrix */}
          <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">
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
                  activeCaseId={activeCaseId}
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

          {/* Column 3: Right Panel with History list on top and Radar statistical changes at bottom */}
          <div className="w-[380px] shrink-0 flex flex-col gap-3 h-full overflow-hidden">
            {/* Historical operation list (top) */}
            <div className="flex-1 min-h-0 bg-white border border-slate-200/50 rounded-xl p-3.5 flex flex-col shadow-sm overflow-hidden">
              <EffectEvaluationHistoryList selectedHistoryId={selectedHistoryId} setSelectedHistoryId={setSelectedHistoryId} isCaseMode={isCaseMode} activeCaseId={activeCaseId} />
            </div>
            {/* Radar reflectivity statistical changes (bottom) */}
            <div className="h-[240px] shrink-0">
              <RadarReflectivityStatChange selectedHistoryId={selectedHistoryId} isCaseMode={isCaseMode} />
            </div>
          </div>
        </div>
      )}

      {activeNav === '装备管理' && (
        <>
          <EquipmentManagementLeft 
            activeRegion={activeRegion} 
            setActiveRegion={setActiveRegion} 
            isCaseMode={isCaseMode}
          />
          <EquipmentManagementRight 
            activeRegion={activeRegion}
          />
        </>
      )}

      {activeNav !== '效果评估' && activeNav !== '装备管理' && (
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
      {activeNav !== '效果评估' && (
        <MapLayersPanel 
          activeNav={activeNav}
          isCaseMode={isCaseMode}
          playbackMinutes={playbackMinutes}
          normalMinutes={normalMinutes}
        />
      )}


    </div>
  );
}
