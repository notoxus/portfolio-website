'use client'

import { useState, useRef, useEffect } from 'react';
import { translateSentence, checkGeminiNanoAvailability } from '@/lib/gemini';

// Dữ liệu giả lập Transcript (Sau này bạn fetch từ API)
const mockTranscript = [
  { id: 1, start: 0, end: 4, text: "Welcome back to another exciting tutorial." },
  { id: 2, start: 4, end: 8, text: "Today we are going to build an amazing application." },
  { id: 3, start: 8, end: 12, text: "Let's dive right into the code." }
];

export default function StudyHub({ videoId = "dQw4w9WgXcQ" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSubRef = useRef<HTMLDivElement>(null);
  
  // States quản lý Layout & Video
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // States quản lý Subtitle & Dịch thuật
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [vietSub, setVietSub] = useState("Đang tải phụ đề tiếng Việt...");
  
  // States quản lý Từ điển
  const [dictResult, setDictResult] = useState<{ word: string, phonetic: string, definition: string } | null>(null);
  const [isDictLoading, setIsDictLoading] = useState(false);
  
  // Caches
  const translationCache = useRef(new Map<string, string>());
  const dictCache = useRef(new Map<string, any>());

  // Logic: Theo dõi thời gian video giả lập (Nếu dùng react-youtube, thay bằng sự kiện onStateChange)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => (prev >= 12 ? 0 : prev + 1)); // Lặp lại sau 12s cho demo
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Logic: Đồng bộ sub và gọi Gemini dịch câu
  useEffect(() => {
    const currentSubIndex = mockTranscript.findIndex(
      sub => currentTime >= sub.start && currentTime < sub.end
    );

    if (currentSubIndex !== -1 && currentSubIndex !== activeSubIndex) {
      setActiveSubIndex(currentSubIndex);
      const engText = mockTranscript[currentSubIndex].text;
      
      // Auto scroll transcript trong chế độ Theater
      if (activeSubRef.current && isTheaterMode) {
        activeSubRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Xử lý dịch câu
      if (translationCache.current.has(engText)) {
        setVietSub(translationCache.current.get(engText)!);
      } else {
        checkGeminiNanoAvailability().then(available => {
          if (available) {
            translateSentence(engText).then(translated => {
              translationCache.current.set(engText, translated);
              setVietSub(translated);
            });
          } else {
            setVietSub("(Gemini Nano chưa sẵn sàng)");
          }
        });
      }
    }
  }, [currentTime, activeSubIndex, isTheaterMode]);

  // Logic: Toàn màn hình
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Logic: Tra từ điển khi click vào từ
  const handleWordClick = async (word: string) => {
    const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
    
    if (dictCache.current.has(cleanWord)) {
      setDictResult(dictCache.current.get(cleanWord));
      return;
    }

    setIsDictLoading(true);
    try {
      const res = await fetch(`/api/dictionary?word=${cleanWord}`);
      if (res.ok) {
        const data = await res.json();
        dictCache.current.set(cleanWord, data);
        setDictResult(data);
      } else {
        setDictResult({ word: cleanWord, phonetic: "", definition: "Không tìm thấy nghĩa." });
      }
    } catch (error) {
      console.error(error);
    }
    setIsDictLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col gap-4 text-neutral-900 dark:text-neutral-100">
      
      {/* Thanh điều khiển */}
      <div className="flex justify-between items-center bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
        <h2 className="font-bold text-xl uppercase tracking-tighter">Study Hub</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {isTheaterMode ? 'Chế độ Chuẩn' : 'Chế độ Rạp Chiếu'}
          </button>
        </div>
      </div>

      {/* Vùng Layout Chính */}
      <div className={`grid gap-4 ${isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        
        {/* 1. CỘT VIDEO (Chiếm 7 cột chuẩn / Chiếm Full ở Theater) */}
        <div 
          ref={containerRef}
          className={`relative bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center
            ${isTheaterMode ? 'w-full aspect-video' : 'lg:col-span-7 aspect-video'}
            ${isFullscreen ? 'h-screen w-screen rounded-none' : ''}
          `}
        >
          <iframe
            className="w-full h-full pointer-events-auto"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&controls=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
          
          {/* Subtitle Overlay */}
          <div className="absolute bottom-[15%] w-[90%] text-center pointer-events-none">
            <span className="bg-black/70 text-yellow-400 font-bold text-lg md:text-2xl px-4 py-1 rounded shadow-lg backdrop-blur-sm">
              {vietSub}
            </span>
          </div>

          <button 
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded z-10 transition pointer-events-auto"
          >
            {isFullscreen ? 'Thoát Toàn Màn' : 'Toàn Màn Hình'}
          </button>
        </div>

        {/* 2. CỘT TRANSCRIPT (Chiếm 3 cột chuẩn / Nằm dưới ở Theater) */}
        <div className={`bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg overflow-y-auto custom-scrollbar
          ${isTheaterMode ? 'max-h-32 flex flex-col gap-2' : 'lg:col-span-3 max-h-[500px]'}
        `}>
          <h3 className="font-semibold mb-2 sticky top-0 bg-neutral-100 dark:bg-neutral-800 z-10 py-1">Transcript</h3>
          <div className="flex flex-col gap-3">
            {mockTranscript.map((sub, index) => {
              const isActive = index === activeSubIndex;
              return (
                <div 
                  key={sub.id} 
                  ref={isActive ? activeSubRef : null}
                  className={`p-2 rounded transition-colors ${isActive ? 'bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-500' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                >
                  <p className="leading-relaxed">
                    {sub.text.split(' ').map((word, wIdx) => (
                      <span 
                        key={wIdx} 
                        onClick={() => handleWordClick(word)}
                        className="cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-600 hover:text-black rounded px-[2px] transition-colors"
                      >
                        {word}{' '}
                      </span>
                    ))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CỘT TỪ ĐIỂN (Chiếm 2 cột chuẩn / Ẩn hoặc Modal ở Theater) */}
        {!isTheaterMode && (
          <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg lg:col-span-2">
            <h3 className="font-semibold mb-4 border-b border-neutral-300 dark:border-neutral-600 pb-2">Dictionary</h3>
            
            {isDictLoading ? (
              <p className="text-sm text-neutral-500 animate-pulse">Đang tra từ...</p>
            ) : dictResult ? (
              <div>
                <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 capitalize">{dictResult.word}</h4>
                <p className="text-sm text-neutral-500 mb-3">{dictResult.phonetic}</p>
                <p className="text-sm">{dictResult.definition}</p>
              </div>
            ) : (
              <p className="text-sm text-neutral-500 italic">Click vào một từ trong transcript để tra nghĩa.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}