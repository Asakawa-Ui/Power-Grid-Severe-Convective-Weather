import React, { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';

const MOCK_MESSAGES = [
  "18:10, 姜祥村作业点准备就绪",
  "18:15, 姜祥村作业点作业开始，发射火箭弹8枚",
  "18:16, 姜祥村作业点作业完成",
  "18:20, 姜祥村作业点作业信息已上报",
  "18:25, 太山作业点准备就绪",
  "18:30, 太山作业点作业取消",
  "18:35, 沿湖生态园作业点准备就绪",
  "18:40, 沿湖生态园作业点作业开始，发射火箭弹6枚",
  "18:41, 沿湖生态园作业点作业完成",
  "18:45, 沿湖生态园作业点作业信息已上报"
];

const CASE_MESSAGES = [
  { minutes: 13, text: "15:13, 白沙作业点准备就绪" },
  { minutes: 18, text: "15:18, 白沙作业点作业开始" },
  { minutes: 19, text: "15:19, 白沙作业点作业完成" },
  { minutes: 22, text: "15:22, 白沙作业点作业信息已上报" },
  { minutes: 23, text: "15:23, 刘仁八作业点准备就绪" },
  { minutes: 28, text: "15:28, 刘仁八作业点作业开始" },
  { minutes: 29, text: "15:29, 刘仁八作业点作业完成" },
  { minutes: 32, text: "15:32, 刘仁八作业点作业信息已上报" },
  { minutes: 133, text: "17:13, 大冶金湖作业点准备就绪" },
  { minutes: 138, text: "17:18, 大冶金湖作业点作业开始" },
  { minutes: 139, text: "17:19, 大冶金湖作业点作业完成" },
  { minutes: 142, text: "17:22, 大冶金湖作业点作业信息已上报" }
];

interface ScrollingMessagesProps {
  isCaseMode?: boolean;
  playbackMinutes?: number;
  normalMinutes?: number;
}

export default function ScrollingMessages({ isCaseMode = false, playbackMinutes = 0, normalMinutes = 1080 }: ScrollingMessagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (isCaseMode) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_MESSAGES.length);
    }, 10000); // 10 seconds for the marquee to complete
    return () => clearInterval(timer);
  }, [isCaseMode]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  let activeMessage = '';
  if (isCaseMode) {
    const unlocked = CASE_MESSAGES.filter(m => m.minutes <= playbackMinutes);
    if (unlocked.length > 0) {
      activeMessage = unlocked[unlocked.length - 1].text;
    } else {
      activeMessage = "暂无最新作业动态";
    }
  } else {
    const timeStr = formatTime(normalMinutes);
    activeMessage = `${timeStr}, 姜祥村作业点已就绪`;
  }

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        setShouldScroll(textWidth > containerWidth);
      }
    };
    
    const timeoutId = setTimeout(checkScroll, 30);
    return () => clearTimeout(timeoutId);
  }, [activeMessage]);

  return (
    <div className="absolute top-44 left-1/2 -translate-x-1/2 z-40 w-[340px] pointer-events-none">
      <div className="bg-white/30 backdrop-blur-md shadow-lg px-4 py-2.5 rounded-full border border-slate-200/30 flex items-center gap-2.5 overflow-hidden">
        <Volume2 className="w-3.5 h-3.5 text-blue-500 shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        
        <div ref={containerRef} className="flex-1 overflow-hidden relative h-5 flex items-center justify-center">
          <div 
            ref={textRef}
            key={activeMessage}
            className={shouldScroll
              ? "absolute left-0 text-slate-800 text-[12.5px] font-medium whitespace-nowrap animate-marquee"
              : "relative text-slate-800 text-[12.5px] font-medium whitespace-nowrap text-center"
            }
          >
            {activeMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
