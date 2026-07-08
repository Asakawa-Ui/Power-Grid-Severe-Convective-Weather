import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

const MOCK_MESSAGES = [
  "11:40, 林家村火箭点准备作业",
  "11:41, 林家村火箭点开始作业",
  "11:45, 林家村火箭点完成作业，本次共发射火箭弹8枚，作业区域降水明显增强。",
  "12:05, 沙河铺高炮站请求作业，空域协调中...",
  "12:15, 沙河铺高炮站空域已获批，开始作业"
];

export default function ScrollingMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_MESSAGES.length);
    }, 10000); // 10 seconds for the marquee to complete
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-44 left-1/2 -translate-x-1/2 z-40 w-[420px] pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md shadow-lg px-6 py-3.5 rounded-full border border-slate-200/80 flex items-center gap-3 overflow-hidden">
        <Volume2 className="w-4 h-4 text-blue-500 shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        
        <div className="flex-1 overflow-hidden relative h-6">
          <div 
            key={currentIndex}
            className="absolute left-0 text-slate-800 text-[15px] font-medium whitespace-nowrap animate-marquee"
          >
            {MOCK_MESSAGES[currentIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}
