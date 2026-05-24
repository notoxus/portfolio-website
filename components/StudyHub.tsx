// components/StudyHub.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';
import Subtitle from './Subtitle';
import ToggleSwitch from './ToggleSwitch';

interface TranscriptItem {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface CacheEntry {
  videoId: string;
  url: string;
  transcript: TranscriptItem[];
  translations: Map<string, string>;
  timestamp: number;
}

async function translateSingleWithGroq(text: string): Promise<string> {
  try {
    const res = await fetch('/api/groq-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text], type: 'instant' }),
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
  const [showEngSub, setShowEngSub] = useState(true);
  const [showVietSub, setShowVietSub] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);
  const [syncOffset, setSyncOffset] = useState(0);

  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

  const [dictionaryMode, setDictionaryMode] = useState<'en-vi' | 'en-en'>('en-vi');
  const [dictResult, setDictResult] = useState<{ word: string; phonetic: string; definition: string } | null>(null);
  const [isDictLoading, setIsDictLoading] = useState(false);

  const historyCache = useRef<Map<string, CacheEntry>>(new Map());
  const [historyList, setHistoryList] = useState<{ videoId: string; url: string; time: number }[]>([]);
  const translationCache = useRef(new Map<string, string>());
  const dictCache = useRef(new Map<string, any>());

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleLoadVideo = async (forceUrl?: string) => {
    const targetUrl = forceUrl || inputUrl;
    const id = extractVideoId(targetUrl);
    if (!id) return alert('YouTube URL is invalid!');

    if (forceUrl) setInputUrl(forceUrl);
    setCurrentVideoId(id);
    setHasStarted(false);
    setActiveSubIndex(-1);
    setVietSub('');
    setShowSubtitle(true);
    setShowTranscript(true);

    const cached = historyCache.current.get(id);
    if (cached && Date.now() - cached.timestamp < 1800000) {
      setTranscript(cached.transcript);
      translationCache.current = cached.translations;
      setIsTranscriptLoading(false);
      return;
    }

    setIsTranscriptLoading(true);
    setTranscript([]);
    translationCache.current.clear();

    try {
      const res = await fetch(`/api/transcript?videoId=${id}`);
      if (!res.ok) {
        alert("That video didn't have subtitles (CC) to show.");
        setIsTranscriptLoading(false);
        return;
      }
      const data: TranscriptItem[] = await res.json();
      setTranscript(data);
      setIsTranscriptLoading(false);

      historyCache.current.set(id, {
        videoId: id,
        url: targetUrl,
        transcript: data,
        translations: translationCache.current,
        timestamp: Date.now(),
      });

      setHistoryList(
        Array.from(historyCache.current.values())
          .map(c => ({ videoId: c.videoId, url: c.url, time: c.timestamp }))
          .sort((a, b) => b.time - a.time)
      );
    } catch (err) {
      console.error(err);
      setIsTranscriptLoading(false);
    }
  };

  // Sync loop
  useEffect(() => {
    if (!hasStarted) return;
    let animationFrameId: number;
    let cancelled = false;

    const updateTime = () => {
      if (cancelled) return;
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime();
        const adjustedTime = time + syncOffset;
        if (transcript.length > 0) {
          const currentSubIndex = transcript.findIndex((sub, index) => {
            const nextSub = transcript[index + 1];
            if (nextSub) return adjustedTime >= sub.start && adjustedTime < nextSub.start;
            return adjustedTime >= sub.start && adjustedTime <= sub.end + 0.5;
          });
          setActiveSubIndex(prev => prev !== currentSubIndex ? currentSubIndex : prev);
        }
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);
    return () => { cancelled = true; cancelAnimationFrame(animationFrameId); };
  }, [hasStarted, transcript, syncOffset]);

  // Lazy translation + prefetch
  useEffect(() => {
    if (activeSubIndex === -1) { setVietSub(''); return; }
    const engText = transcript[activeSubIndex]?.text;
    if (!engText) return;

    // Prefetch ±5 dòng
    const start = Math.max(0, activeSubIndex - 2);
    const end = Math.min(transcript.length - 1, activeSubIndex + 5);
    for (let i = start; i <= end; i++) {
      const t = transcript[i]?.text;
      if (t && !translationCache.current.has(t)) {
        translationCache.current.set(t, '__pending__');
        translateSingleWithGroq(t).then(translated => {
          translationCache.current.set(t, translated);
        });
      }
    }

    // Hiển thị sub hiện tại
    if (translationCache.current.has(engText)) {
      const cached = translationCache.current.get(engText)!;
      if (cached !== '__pending__') { setVietSub(cached); return; }
    }

    setVietSub('');
    let isCurrent = true;
    translateSingleWithGroq(engText).then(translated => {
      translationCache.current.set(engText, translated);
      if (isCurrent) setVietSub(translated);
    }).catch(() => { if (isCurrent) setVietSub(''); });
    return () => { isCurrent = false; };
  }, [activeSubIndex, transcript]);

  // Auto-scroll transcript
  useEffect(() => {
    if (activeSubRef.current && transcriptContainerRef.current) {
      const container = transcriptContainerRef.current;
      const activeItem = activeSubRef.current;
      container.scrollTo({
        top: activeItem.offsetTop - container.clientHeight / 2 + activeItem.clientHeight / 2,
        behavior: 'smooth',
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
        let finalDef = data.definition;
        finalDef = finalDef.replace(/\b(noun|verb|adjective|adverb|pronoun|preposition|conjunction)\s+\1\b/gi, '$1');
        finalDef = finalDef.replace(/(danh từ|động từ|tính từ|trạng từ|phó từ|đại từ)\s+\1/gi, '$1');
        const cleanedData = { ...data, definition: finalDef };
        dictCache.current.set(cacheKey, cleanedData);
        setDictResult(cleanedData);
      }
    } catch {}
    setIsDictLoading(false);
  }, [dictionaryMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTranscriptLoading) handleLoadVideo();
  };

  return (
    <div className="w-full flex flex-col gap-5 font-sans">

      {/* Sub rời */}
      <Subtitle
        engText={transcript[activeSubIndex]?.text || ''}
        vietText={vietSub}
        showEng={showEngSub}
        showViet={showVietSub}
        visible={hasStarted && showSubtitle}
        onClose={() => setShowSubtitle(false)}
      />

      {/* Thanh controls */}
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
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
            "
          />
          <button
            onClick={() => handleLoadVideo()}
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsTheaterMode(v => !v)}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition"
            >
              {isTheaterMode ? 'Standard' : 'Movie Theatre'}
            </button>
            <button
              onClick={() => setDictionaryMode(prev => prev === 'en-vi' ? 'en-en' : 'en-vi')}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition"
            >
              {dictionaryMode === 'en-vi' ? 'Eng → Vie' : 'Eng → Eng'}
            </button>

            {/* Sync */}
            <div className="flex items-center bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
              <span className="px-2 text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400">Sync:</span>
              <button onClick={() => setSyncOffset(p => Number((p - 0.1).toFixed(1)))}
                className="px-2 py-2.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 font-bold transition">−</button>
              <span className="text-xs font-mono w-7 text-center font-bold text-blue-600 dark:text-blue-400">
                {syncOffset > 0 ? `+${syncOffset}` : syncOffset}
              </span>
              <button onClick={() => setSyncOffset(p => Number((p + 0.1).toFixed(1)))}
                className="px-2 py-2.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 font-bold transition">+</button>
            </div>

            {/* Sub toggles */}
            <div className="flex items-center gap-3 bg-neutral-200 dark:bg-neutral-700 rounded-lg px-3 py-2">
              <ToggleSwitch label="EN" checked={showEngSub} onChange={setShowEngSub} activeColor="#3b82f6" />
              <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
              <ToggleSwitch label="VI" checked={showVietSub} onChange={setShowVietSub} activeColor="#22c55e" />
            </div>

            {/* Nút mở lại sub rời nếu đã đóng */}
            {!showSubtitle && (
              <button
                onClick={() => setShowSubtitle(true)}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition"
              >
                + Sub
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lịch sử */}
      {historyList.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-2">Đã xem:</span>
          {historyList.map((item, idx) => (
            <button
              key={item.videoId}
              onClick={() => handleLoadVideo(item.url)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition
                ${currentVideoId === item.videoId
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-transparent'
                }`}
            >
              Video {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Placeholder */}
      {!currentVideoId && (
        <div className="w-full h-64 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center gap-3 text-neutral-400 dark:text-neutral-500">
          <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm">Click "Play video" or press <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs font-mono">Enter</kbd></p>
        </div>
      )}

      {/* Main layout */}
      {currentVideoId && (
        <div className={`grid gap-4 ${isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-12'}`}>

          {/* Video */}
          <div className={`relative bg-black rounded-xl overflow-hidden ${isTheaterMode ? 'w-full aspect-video max-h-[80vh]' : 'xl:col-span-8 aspect-video'}`}>
            <YouTube
              videoId={currentVideoId}
              className="w-full h-full"
              opts={{ width: '100%', height: '100%', playerVars: { rel: 0, controls: 1, modestbranding: 1 } }}
              onReady={e => { playerRef.current = e.target; }}
              onPlay={() => setHasStarted(true)}
            />
          </div>

          {/* Transcript */}
          {hasStarted && showTranscript && (
            <div
              ref={transcriptContainerRef}
              className={`
                relative bg-neutral-50 dark:bg-neutral-800/60
                border border-neutral-200 dark:border-neutral-700/60
                rounded-xl overflow-y-auto
                ${isTheaterMode ? 'max-h-52 p-4' : 'xl:col-span-4 h-[calc(100vh-280px)] max-h-[640px] p-4'}
              `}
            >
              {!isTheaterMode && (
                <div className="sticky top-0 z-10 bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-lg px-3 py-2 mb-3 border-b border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                    Transcript
                  </h3>
                  <button
                    onClick={() => setShowTranscript(false)}
                    className="text-neutral-400 hover:text-red-500 transition text-sm font-bold leading-none"
                    title="Close transcript"
                  >✕</button>
                </div>
              )}
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
                  <p className="text-sm text-neutral-500 italic px-3">Couldn't get transcript</p>
                )}
              </div>
            </div>
          )}

          {/* Nút mở lại transcript */}
          {hasStarted && !showTranscript && !isTheaterMode && (
            <button
              onClick={() => setShowTranscript(true)}
              className="xl:col-span-4 h-16 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:border-neutral-400 transition"
            >
              + Show Transcript
            </button>
          )}

          {/* Dictionary */}
          {hasStarted && (
            <div className={`
              bg-neutral-50 dark:bg-neutral-800/60
              border border-neutral-200 dark:border-neutral-700/60
              rounded-xl p-5
              ${isTheaterMode ? '' : 'xl:col-span-12'}
            `}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500 mb-4">
                Dictionary
              </h3>
              {isDictLoading ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Looking up...
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
                  Click any word in transcript to look up →
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}