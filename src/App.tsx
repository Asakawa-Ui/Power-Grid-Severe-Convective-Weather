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
import OperationCommandLeft from './components/OperationCommandLeft';
import OperationCommandRight from './components/OperationCommandRight';
import ScrollingMessages from './components/ScrollingMessages';
import MapPopup from './components/MapPopup';
import { WeatherPoint } from './utils/weatherPoints';

export default function App() {
  const [activeRegion, setActiveRegion] = useState('湖北地块');
  const [activeNav, setActiveNav] = useState('作业指挥'); // default to the newly requested view for easy viewing
  const [selectedPoint, setSelectedPoint] = useState<WeatherPoint | null>(null);
  
  // Visual debug logger to capture and display iframe logs/errors
  const [logs, setLogs] = useState<{ type: 'log' | 'error' | 'warn'; text: string; time: string }[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: 'log' | 'error' | 'warn', ...args: any[]) => {
      const text = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      const time = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-99), { type, text, time }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };
    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };
    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    const handleWindowError = (event: ErrorEvent) => {
      addLog('error', `[Unhandled Error] ${event.message} at ${event.filename}:${event.lineno}`);
    };

    window.addEventListener('error', handleWindowError);

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleWindowError);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-200 font-sans text-slate-800">
      <Map3D activeRegion={activeRegion} onPointClick={setSelectedPoint} />
      <Header activeNav={activeNav} setActiveNav={setActiveNav} />
      
      <RegionSelector activeRegion={activeRegion} setActiveRegion={setActiveRegion} />
      {activeNav === '作业指挥' && <ScrollingMessages />}
      
      {activeNav === '监测预警' && (
        <>
          <LeftPanel />
          <RightPanel />
        </>
      )}

      {activeNav === '作业指挥' && (
        <>
          <OperationCommandLeft />
          <OperationCommandRight />
          {selectedPoint && <MapPopup point={selectedPoint} onClose={() => setSelectedPoint(null)} />}
        </>
      )}

      <BottomPanel />
      <WeatherLegend />

      {/* Floating Debug Toggle Button */}
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="absolute bottom-4 left-4 z-50 bg-slate-900/90 text-white text-xs font-mono px-2.5 py-1 rounded shadow-md border border-slate-700/50 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${logs.some(l => l.type === 'error') ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
        调试日志 ({logs.length})
      </button>

      {/* Collapsible Debug Panel */}
      {showDebug && (
        <div className="absolute bottom-12 left-4 z-50 w-[420px] h-[250px] bg-slate-950/95 border border-slate-800 rounded-lg shadow-xl font-mono text-xs flex flex-col overflow-hidden">
          <div className="bg-slate-900 px-3 py-1.5 flex justify-between items-center border-b border-slate-800">
            <span className="text-slate-300 font-bold">系统控制台输出</span>
            <button 
              onClick={() => setLogs([])}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              清空
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 text-[11px]">
            {logs.length === 0 ? (
              <span className="text-slate-600">暂无任何日志输出...</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`flex gap-1.5 border-b border-slate-900/50 pb-0.5 last:border-0 ${
                  log.type === 'error' ? 'text-red-400 bg-red-950/20' : 
                  log.type === 'warn' ? 'text-yellow-400' : 'text-slate-300'
                }`}>
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className="break-all whitespace-pre-wrap">{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
