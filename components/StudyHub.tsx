'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';

interface TranscriptItem {
  id: number;
  start: number;
  end: number;
  text: string;
}

async function batchTranslateWithGroq(texts: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (texts.length === 0) return result;

  // Đánh số thứ tự các câu để Groq trả về đúng cấu trúc
  const numbered = texts.map((t, idx) => `${idx + 1}. ${t}`).join('\n');

  try {
    const res = await fetch('/api/groq-translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Chú ý: Gửi biến numbered vào mảng để API nội bộ đọc được
      body: JSON.stringify({
        texts: [numbered], 
      }),
    });

    if (!res.ok) return result;

    const data = await res.json();
    const rawText: string = data.choices?.[0]?.message?.content || '';
    const lines = rawText.split('\n').filter((l: string) => l.trim());

    // Bóc tách kết quả từ AI (dựa theo số thứ tự)
    lines.forEach((line: string) => {
      const match = line.match(/^(\d+)\.\s+(.+)$/);
      if (match) {
        const idx = parseInt(match[1]) - 1;
        if (idx >= 0 && idx < texts.length) {
          result.set(texts[idx], match[2].trim());
        }
      }
    });
  } catch (error) {
    console.error("Lỗi khi dịch lô:", error);
  }

  return result;
}

async function translateSingleWithGroq(text: string): Promise<string> {
  try {
    const res = await fetch('/api/groq-translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [text],
      }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    let rawText = data.choices?.[0]?.message?.content?.trim() || text;
    const match = rawText.match(/^1\.\s+(.+)$/);
    return match ? match[1] : rawText;
  } catch {
    return text;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudyHub() {
  const activeSubRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const [inputUrl, setInputUrl] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeSubIndex, setActiveSubIndex] = useState(-1);
  const [vietSub, setVietSub] = useState('');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState(0);
  const [dictionaryMode, setDictionaryMode] = useState<'en-vi' | 'en-en'>('en-vi');
  const [dictResult, setDictResult] = useState<{ word: string; phonetic: string; definition: string } | null>(null);
  const [isDictLoading, setIsDictLoading] = useState(false);

  const translationCache = useRef(new Map<string, string>());
  const dictCache = useRef(new Map<string, any>());

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleLoadVideo = async () => {
    const id = extractVideoId(inputUrl);
    if (!id) return alert('URL YouTube không hợp lệ!');

    setCurrentVideoId(id);
    setHasStarted(false);
    setIsTranscriptLoading(true);
    setTranscript([]);
    setActiveSubIndex(-1);
    setVietSub('');
    translationCache.current.clear();

    try {
      const res = await fetch(`/api/transcript?videoId=${id}`);
      if (!res.ok) {
        alert('Video này không có phụ đề (CC) để hiển thị.');
        setIsTranscriptLoading(false);
        return;
      }
      const data: TranscriptItem[] = await res.json();
      setTranscript(data);
      setIsTranscriptLoading(false);

      const textsToTranslate = data
        .map(item => item.text)
        .filter(t => !translationCache.current.has(t));

      if (textsToTranslate.length > 0) {
        setIsTranslating(true);
        setTranslateProgress(0);

        const BATCH = 40;
        let done = 0;
        for (let i = 0; i < textsToTranslate.length; i += BATCH) {
          const batch = textsToTranslate.slice(i, i + BATCH);
          const batchResult = await batchTranslateWithGroq(batch);
          batchResult.forEach((v, k) => translationCache.current.set(k, v));
          done += batch.length;
          setTranslateProgress(Math.round((done / textsToTranslate.length) * 100));
          if (i + BATCH < textsToTranslate.length) {
            await new Promise(r => setTimeout(r, 200));
          }
        }
        setIsTranslating(false);
        setTranslateProgress(100);
      }
    } catch (err) {
      console.error(err);
      setIsTranscriptLoading(false);
      setIsTranslating(false);
    }
  };

  // 1. VÒNG LẶP SYNC VIDEO (Quét bằng requestAnimationFrame siêu mượt)
  useEffect(() => {
    let animationFrameId: number;
    const TIME_OFFSET = 0.3; // Bù trễ để chữ khớp sát với tiếng

    const updateTime = () => {
      if (hasStarted && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime();
        const adjustedTime = time + TIME_OFFSET;

        if (transcript.length > 0) {
          const currentSubIndex = transcript.findIndex((sub, index) => {
            const nextSub = transcript[index + 1];
            if (nextSub) {
              return adjustedTime >= sub.start && adjustedTime < nextSub.start;
            }
            return adjustedTime >= sub.start && adjustedTime <= sub.end + 1.0;
          });

          setActiveSubIndex(prev => prev !== currentSubIndex ? currentSubIndex : prev);
        }
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };

    if (hasStarted) {
      animationFrameId = requestAnimationFrame(updateTime);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, transcript]);

  // 2. CẬP NHẬT SUB TIẾNG VIỆT (Fix dứt điểm lỗi Race Condition)
  useEffect(() => {
    if (activeSubIndex === -1) { 
      setVietSub(''); 
      return; 
    }
    
    const engText = transcript[activeSubIndex]?.text;
    if (!engText) return;

    if (translationCache.current.has(engText)) {
      setVietSub(translationCache.current.get(engText)!);
    } else {
      setVietSub(engText); 

      let isCurrent = true;

      translateSingleWithGroq(engText).then(translated => {
        translationCache.current.set(engText, translated);
        if (isCurrent) {
          setVietSub(translated);
        }
      }).catch(() => {
         if (isCurrent) setVietSub(engText);
      });
      return () => {
        isCurrent = false;
      };
    }
  }, [activeSubIndex, transcript]);

  useEffect(() => {
    if (activeSubRef.current && transcriptContainerRef.current) {
      const container = transcriptContainerRef.current;
      const activeItem = activeSubRef.current;
      
      container.scrollTo({
        top: activeItem.offsetTop - container.clientHeight / 2 + activeItem.clientHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [activeSubIndex]);

  // Dictionary
  const handleWordClick = useCallback(async (word: string) => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').toLowerCase();
    if (!cleanWord) return;
    const cacheKey = `${dictionaryMode}-${cleanWord}`;
    if (dictCache.current.has(cacheKey)) {
      setDictResult(dictCache.current.get(cacheKey));
      return;
    }
    setIsDictLoading(true);
    try {
      const res = await fetch(`/api/dictionary?word=${cleanWord}&mode=${dictionaryMode}`);
      if (res.ok) {
        const data = await res.json();
        dictCache.current.set(cacheKey, data);
        setDictResult(data);
      }
    } catch {}
    setIsDictLoading(false);
  }, [dictionaryMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTranscriptLoading) handleLoadVideo();
  };

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Paste Youtube URL here..."
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="
              flex-1 px-4 py-2.5 rounded-lg text-sm
              bg-neutral-100 dark:bg-neutral-800/80
              border border-neutral-200 dark:border-neutral-700
              text-neutral-900 dark:text-neutral-100
              placeholder-neutral-400 dark:placeholder-neutral-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition
            "
          />
          <button
            onClick={handleLoadVideo}
            disabled={isTranscriptLoading}
            className="
              px-5 py-2.5 rounded-lg text-sm font-semibold
              bg-blue-600 hover:bg-blue-500 active:bg-blue-700
              text-white transition disabled:opacity-50 disabled:cursor-not-allowed
              whitespace-nowrap shadow-sm
            "
          >
            {isTranscriptLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Loading...
              </span>
            ) : 'Play video'}
          </button>
        </div>

        {hasStarted && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsTheaterMode(v => !v)}
              className="
                px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide
                bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600
                text-neutral-700 dark:text-neutral-200 transition
              "
            >
              {isTheaterMode ? 'Standard' : 'Movie Theatre'}
            </button>
            <button
              onClick={() => setDictionaryMode(prev => prev === 'en-vi' ? 'en-en' : 'en-vi')}
              className="
                px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide
                bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600
                text-neutral-700 dark:text-neutral-200 transition
              "
            >
              {dictionaryMode === 'en-vi' ? 'Eng → Vie' : 'Eng → Eng'}
            </button>
          </div>
        )}
      </div>
      {isTranslating && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
              Waiting for seconds...
            </span>
            <span className="font-mono font-semibold text-green-600 dark:text-green-400">{translateProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${translateProgress}%` }}
            />
          </div>
        </div>
      )}

      {!currentVideoId && (
        <div className="
          w-full h-64 rounded-xl
          border-2 border-dashed border-neutral-200 dark:border-neutral-700
          flex flex-col items-center justify-center gap-3
          text-neutral-400 dark:text-neutral-500
        ">
          <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm">Click "Play video" button or <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs font-mono">Enter</kbd> to start!</p>
        </div>
      )}

      {/* MAIN LAYOUT */}
      {currentVideoId && (
        <div className={`grid gap-4 ${isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-12'}`}>

          {/* VIDEO */}
          <div className={`relative bg-black rounded-xl overflow-hidden ${isTheaterMode ? 'w-full aspect-video max-h-[80vh]' : 'xl:col-span-8 aspect-video'}`}>
            <YouTube
              videoId={currentVideoId}
              className="w-full h-full"
              opts={{ width: '100%', height: '100%', playerVars: { rel: 0, controls: 1, modestbranding: 1 } }}
              onReady={e => { playerRef.current = e.target; }}
              onPlay={() => setHasStarted(true)}
            />

            {hasStarted && vietSub && (
              <div className="absolute bottom-[12%] left-0 right-0 flex justify-center pointer-events-none px-6 z-10">
                <span className="
                  bg-black/80 backdrop-blur-sm text-white font-semibold
                  text-base md:text-lg lg:text-xl
                  px-5 py-2 rounded-lg shadow-xl leading-snug text-center
                  max-w-[90%] inline-block
                ">
                  {vietSub}
                </span>
              </div>
            )}

            {isTranslating && hasStarted && (
              <div className="absolute top-3 right-3 z-10">
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full">
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Đang dịch {translateProgress}%
                </div>
              </div>
            )}
          </div>

          {/* TRANSCRIPT */}
          {hasStarted && (
            <div
              ref={transcriptContainerRef}
              className={`
                relative /*
                bg-neutral-50 dark:bg-neutral-800/60
                border border-neutral-200 dark:border-neutral-700/60
                rounded-xl overflow-y-auto
                ${isTheaterMode ? 'max-h-52 p-4' : 'xl:col-span-4 h-[calc(100vh-280px)] max-h-[640px] p-4'}
              `}
            >
              <div className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-800/60 backdrop-blur-sm pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-700/60">
                <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                  Transcript
                </h3>
              </div>

              <div className="flex flex-col gap-1">
                {transcript.length > 0 ? transcript.map((sub, index) => (
                  <div
                    key={sub.id}
                    ref={index === activeSubIndex ? activeSubRef : null}
                    className={`
                      px-3 py-2 rounded-lg text-[14px] leading-relaxed transition-all duration-200
                      ${index === activeSubIndex
                        ? 'bg-blue-500/15 border-l-[3px] border-blue-500 text-blue-900 dark:text-blue-100 font-medium'
                        : 'text-neutral-600 dark:text-neutral-400 border-l-[3px] border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                      }
                    `}
                  >
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600 mr-2 select-none">
                      {Math.floor(sub.start / 60).toString().padStart(2, '0')}:{Math.floor(sub.start % 60).toString().padStart(2, '0')}
                    </span>
                    {(sub.text.match(/\S+\s*/g) || []).map((word, wIdx) => (
                      <span
                        key={wIdx}
                        onClick={() => handleWordClick(word)}
                        className="cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-500/30 hover:text-amber-900 dark:hover:text-amber-200 rounded px-[2px] transition-colors"
                      >
                        {word}{' '}
                      </span>
                    ))}
                  </div>
                )) : (
                  <p className="text-sm text-neutral-500 italic px-3">Không lấy được kịch bản.</p>
                )}
              </div>
            </div>
          )}

          {/* DICTIONARY */}
          {hasStarted && (
            <div className={`
              bg-neutral-50 dark:bg-neutral-800/60
              border border-neutral-200 dark:border-neutral-700/60
              rounded-xl p-5
              ${isTheaterMode ? '' : 'xl:col-span-12'}
            `}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500 mb-4">
                Từ điển
              </h3>

              {isDictLoading ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Đang tra từ...
                </div>
              ) : dictResult ? (
                <div className="flex flex-col sm:flex-row gap-5 sm:items-start">
                  <div className="min-w-[160px]">
                    <h4 className="text-2xl font-bold text-blue-600 dark:text-blue-400 capitalize tracking-tight">
                      {dictResult.word}
                    </h4>
                    {dictResult.phonetic && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-mono mt-1">
                        {dictResult.phonetic}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 sm:border-l-2 border-neutral-200 dark:border-neutral-700 sm:pl-5">
                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                      {dictResult.definition}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm italic text-neutral-400 dark:text-neutral-500">
                  Nhấp vào từ bất kỳ trên transcript để tra nghĩa →
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}