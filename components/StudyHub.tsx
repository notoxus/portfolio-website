'use client'

import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { translateSentence, checkGeminiNanoAvailability } from '@/lib/gemini';

// Khai báo kiểu dữ liệu Transcript
interface TranscriptItem {
  id: number;
  start: number;
  end: number;
  text: string;
}

export default function StudyHub() {
  const activeSubRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // States quản lý Trạng thái Khởi tạo
  const [inputUrl, setInputUrl] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // States quản lý Layout & Đồng bộ
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [vietSub, setVietSub] = useState("Waiting for video...");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

  // States quản lý Từ điển
  const [dictionaryMode, setDictionaryMode] = useState<'en-vi' | 'en-en'>('en-vi');
  const [dictResult, setDictResult] = useState<{ word: string, phonetic: string, definition: string } | null>(null);
  const [isDictLoading, setIsDictLoading] = useState(false);

  // Caches tối ưu tài nguyên
  const translationCache = useRef(new Map<string, string>());
  const dictCache = useRef(new Map<string, any>());

  // Hàm trích xuất Video ID từ URL YouTube bất kỳ
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleLoadVideo = () => {
    const id = extractVideoId(inputUrl);
    if (id) {
      setCurrentVideoId(id);
      setHasStarted(false); // Reset lại cho đến khi nhấn Play thực sự
      setTranscript([]);    // Xóa transcript cũ
      
      // Giả lập nạp dữ liệu Transcript mới tương ứng với Video (Sau này thay bằng gọi API fetch)
      setTranscript([
        { id: 1, start: 0, end: 4, text: "Welcome back to another exciting tutorial." },
        { id: 2, start: 4, end: 8, text: "Today we are going to build an amazing application." },
        { id: 3, start: 8, end: 12, text: "Let's dive right into the code." }
      ]);
    } else {
      alert('URL YouTube không hợp lệ, vui lòng thử lại!');
    }
  };

  // Tự động lắng nghe chế độ Toàn màn hình từ hệ thống của trình duyệt/YouTube
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsTheaterMode(isFull); // Khi full màn hình, kích hoạt giao diện mở rộng layout chữ xuống dưới
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Theo dõi tiến trình thời gian thực của Video YouTube khi đang chạy
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasStarted && playerRef.current) {
      interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }, 500); // Cập nhật mỗi 0.5s để phụ đề mượt mà
    }
    return () => clearInterval(interval);
  }, [hasStarted]);

  // Đồng bộ Subtitle Overlay và kích hoạt Gemini Nano dịch tự động
  useEffect(() => {
    if (transcript.length === 0) return;

    const currentSubIndex = transcript.findIndex(
      sub => currentTime >= sub.start && currentTime < sub.end
    );

    if (currentSubIndex !== -1 && currentSubIndex !== activeSubIndex) {
      setActiveSubIndex(currentSubIndex);
      const engText = transcript[currentSubIndex].text;

      // Auto scroll đoạn Text phụ đề vào giữa vùng nhìn thấy khi học
      if (activeSubRef.current) {
        activeSubRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Xử lý bộ nhớ đệm Cache + Gemini Nano dịch thuật
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
            setVietSub("(Gemini Nano local AI is offline)");
          }
        });
      }
    }
  }, [currentTime, activeSubIndex, transcript]);

  // Gọi API Tra từ điển (Đọc động theo chế độ Anh-Anh hoặc Anh-Việt)
  const handleWordClick = async (word: string) => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").toLowerCase();
    const cacheKey = `${dictionaryMode}-${cleanWord}`;

    if (dictCache.current.has(cacheKey)) {
      setDictResult(dictCache.current.get(cacheKey));
      return;
    }

    setIsDictLoading(true);
    try {
      // Endpoint xử lý định tuyến nguồn từ điển của bạn
      const res = await fetch(`/api/dictionary?word=${cleanWord}&mode=${dictionaryMode}`);
      if (res.ok) {
        const data = await res.json();
        dictCache.current.set(cacheKey, data);
        setDictResult(data);
      } else {
        setDictResult({ word: cleanWord, phonetic: "", definition: "Không tìm thấy dữ liệu từ điển." });
      }
    } catch (error) {
      console.error(error);
    }
    setIsDictLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col gap-4 text-neutral-900 dark:text-neutral-100">
      
      {/* 1. THANH ĐIỀU KHIỂN & NHẬP URL */}
      <div className="flex flex-col md:flex-row gap-2 justify-between items-stretch md:items-center bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Dán link video YouTube vào đây (e.g., https://www.youtube.com/watch?v=...)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLoadVideo}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition text-sm whitespace-nowrap"
          >
            Phát Video
          </button>
        </div>

        {/* Nút chuyển đổi Từ điển thay thế nút Chọn chế độ cũ */}
        {hasStarted && (
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Từ điển:</span>
            <button
              onClick={() => setDictionaryMode(prev => prev === 'en-vi' ? 'en-en' : 'en-vi')}
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 font-bold rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition text-xs uppercase"
            >
              {dictionaryMode === 'en-vi' ? '🇬🇧🇺🇸 Anh - Việt (Soha)' : '🌐 Anh - Anh (Oxford)'}
            </button>
          </div>
        )}
      </div>

      {/* 2. KHÔNG GIAN PHÁT VIDEO VÀ HỌC TẬP */}
      {!currentVideoId ? (
        <div className="w-full h-64 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg flex flex-col items-center justify-center text-center p-6 bg-neutral-50/50 dark:bg-neutral-900/20">
          <p className="text-neutral-500 text-sm">Chưa có dữ liệu. Vui lòng nhập link YouTube bên trên để bắt đầu không gian học tập.</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${isTheaterMode || !hasStarted ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
          
          {/* CỘT VIDEO */}
          <div className={`relative bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center
            ${isTheaterMode || !hasStarted ? 'w-full aspect-video' : 'lg:col-span-7 aspect-video'}
          `}>
            <YouTube
              videoId={currentVideoId}
              className="w-full h-full"
              opts={{
                width: '100%',
                height: '100%',
                playerVars: { rel: 0, controls: 1, modestbranding: 1 }
              }}
              onReady={(e) => { playerRef.current = e.target; }}
              onPlay={() => setHasStarted(true)} // CHỈ BẬT TRANSCRIPT KHI ẤN PHÁT VIDEO
            />
            
            {/* Dòng chữ Sub phụ đề Việt nhỏ đè trên Video */}
            {hasStarted && (
              <div className="absolute bottom-[14%] w-[85%] text-center pointer-events-none z-10">
                <span className="bg-black/75 text-yellow-400 font-bold text-sm md:text-xl px-3 py-1 rounded shadow-md backdrop-blur-xs select-none">
                  {vietSub}
                </span>
              </div>
            )}
          </div>

          {/* HIỂN THỊ TRANSCRIPT & DICTIONARY (CHỈ HIỆN KHI ẤN PHÁT VIDEO) */}
          {hasStarted && (
            <>
              {/* CỘT TRANSCRIPT */}
              <div className={`bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg overflow-y-auto custom-scrollbar transition-all
                ${isTheaterMode ? 'max-h-28 flex flex-col gap-1' : 'lg:col-span-3 max-h-[480px]'}
              `}>
                <h3 className="font-bold text-xs uppercase tracking-wider mb-2 sticky top-0 bg-neutral-100 dark:bg-neutral-800 z-10 py-1 opacity-70">Transcript</h3>
                <div className="flex flex-col gap-2">
                  {transcript.map((sub, index) => {
                    const isActive = index === activeSubIndex;
                    return (
                      <div
                        key={sub.id}
                        ref={isActive ? activeSubRef : null}
                        className={`p-2 rounded text-sm transition-colors ${isActive ? 'bg-blue-500/10 border-l-4 border-blue-500 font-medium' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                      >
                        <p className="leading-relaxed">
                          {sub.text.split(' ').map((word, wIdx) => (
                            <span
                              key={wIdx}
                              onClick={() => handleWordClick(word)}
                              className="cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-500/80 hover:text-black rounded px-[2px]"
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

              {/* CỘT TỪ ĐIỂN */}
              {!isTheaterMode && (
                <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg lg:col-span-2 max-h-[480px] overflow-y-auto">
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-3 border-b border-neutral-300 dark:border-neutral-700 pb-2 opacity-70">Dictionary</h3>
                  {isDictLoading ? (
                    <p className="text-xs text-neutral-500 animate-pulse">Đang tra từ...</p>
                  ) : dictResult ? (
                    <div className="flex flex-col gap-1">
                      <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 capitalize break-all">{dictResult.word}</h4>
                      {dictResult.phonetic && <p className="text-xs text-neutral-500 font-mono">{dictResult.phonetic}</p>}
                      <p className="text-xs leading-relaxed mt-2 text-neutral-700 dark:text-neutral-300">{dictResult.definition}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">Nhấp vào từ bất kỳ ở phụ đề để tra cứu nghĩa nhanh.</p>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
}