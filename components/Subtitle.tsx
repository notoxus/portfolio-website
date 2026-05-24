'use client'

import { useState, useRef, useEffect, useCallback } from 'react';

interface SubSettings {
  fontSize: number;
  color: string;
}

// 1. Thêm frameWidth vào interface SubtitleSettings
interface SubtitleSettings {
  eng: SubSettings;
  viet: SubSettings;
  bgColor: string;
  bgOpacity: number;
  fontFamily: string;
  frameWidth: number; 
}

interface Props {
  engText: string;
  vietText: string;
  showEng: boolean;
  showViet: boolean;
  visible: boolean;
  onClose: () => void;
}

const FONTS = ['Inter', 'monospace', 'Georgia', 'Arial'];

// 2. Thêm frameWidth vào DEFAULT_SETTINGS
const DEFAULT_SETTINGS: SubtitleSettings = {
  eng:  { fontSize: 15, color: '#ffffff' },
  viet: { fontSize: 20, color: '#ffffff' },
  bgColor: '#000000',
  bgOpacity: 75,
  fontFamily: 'Inter',
  frameWidth: 600, 
};

export default function Subtitle({ engText, vietText, showEng, showViet, visible, onClose }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SubtitleSettings>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<SubtitleSettings>(DEFAULT_SETTINGS);

  const subRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 }); 

  useEffect(() => {
    if (ready || !subRef.current) return;
    const x = (window.innerWidth - subRef.current.offsetWidth) / 2;
    const y = window.innerHeight - subRef.current.offsetHeight - 100;
    posRef.current = { x, y };
    setPos({ x, y });
    setReady(true);
  }, []); 

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.settings-panel')) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const newPos = {
        x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y)),
      };
      posRef.current = newPos;
      setPos(newPos);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragOffset.current = { x: touch.clientX - posRef.current.x, y: touch.clientY - posRef.current.y };
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newPos = {
        x: Math.max(0, Math.min(window.innerWidth - 200, touch.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, touch.clientY - dragOffset.current.y)),
      };
      posRef.current = newPos;
      setPos(newPos);
    };
    const onEnd = () => setIsDragging(false);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging]);

  const hasContent = (showEng && !!engText) || (showViet && !!vietText);
  if (!visible || !hasContent) return null;

  const bgRgb = settings.bgColor.replace('#', '').match(/.{2}/g)!
    .map(h => parseInt(h, 16)).join(', ');

  const openSettings = () => {
    setDraft(settings); 
    setShowSettings(true);
  };

  const applySettings = () => {
    setSettings(draft);
    setShowSettings(false);
  };

  return (
    <div
      ref={subRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none', maxWidth: '80vw',
      }}
    >
      {/* 3. Cập nhật Sub text container */}
      <div style={{
        background: `rgba(${bgRgb}, ${settings.bgOpacity / 100})`,
        backdropFilter: settings.bgOpacity > 0 ? 'blur(4px)' : 'none',
        boxShadow: settings.bgOpacity > 0 ? '0 2px 12px rgba(0,0,0,0.4)' : 'none',
        borderRadius: 10,
        width: settings.frameWidth,
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '8px 20px',
        textAlign: 'center',
        lineHeight: 1.4,
        overflow: 'hidden',
      }}>
        {showEng && engText && (
          <div style={{
            fontSize: settings.eng.fontSize,
            color: settings.eng.color,
            opacity: 0.85,
            fontFamily: settings.fontFamily,
            width: '100%',
            textShadow: settings.bgOpacity < 30 ? '1px 1px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7)' : 'none',
          }}>
            {engText}
          </div>
        )}
        {showViet && vietText && (
          <div style={{
            fontSize: settings.viet.fontSize,
            color: settings.viet.color,
            fontFamily: settings.fontFamily,
            fontWeight: 600,
            width: '100%',
            textShadow: settings.bgOpacity < 30 ? '1px 1px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7)' : 'none',
          }}>
            {vietText}
          </div>
        )}
      </div>

      {/* Nút ⚙ settings */}
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={() => showSettings ? setShowSettings(false) : openSettings()}
        style={{
          position: 'absolute', top: -10, right: 16,
          width: 22, height: 22, borderRadius: '50%',
          background: '#374151', border: '1px solid #6b7280',
          color: '#fff', fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Customize"
      >⚙</button>

      {/* Nút ✕ close */}
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={onClose}
        style={{
          position: 'absolute', top: -10, right: -10,
          width: 22, height: 22, borderRadius: '50%',
          background: '#ef4444', border: '1px solid #f87171',
          color: '#fff', fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, lineHeight: 1,
        }}
        title="Close"
      >✕</button>

      {/* Settings panel */}
      {showSettings && (
        <div
          className="settings-panel"
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%',
            transform: 'translateX(-50%)', background: '#1f2937',
            border: '1px solid #374151', borderRadius: 10,
            padding: '14px 16px', width: 260,
            display: 'flex', flexDirection: 'column', gap: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 10000,
          }}
        >
          {/* Header */}
          <p style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Subtitle Settings
          </p>

          {/* EN sub */}
          <div style={{ borderTop: '1px solid #374151', paddingTop: 8 }}>
            <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 600, margin: '0 0 6px' }}>EN Sub</p>
            <label style={{ color: '#d1d5db', fontSize: 12 }}>
              Size: <strong style={{ color: '#fff' }}>{draft.eng.fontSize}px</strong>
              <input type="range" min={10} max={36} value={draft.eng.fontSize}
                onChange={e => setDraft(d => ({ ...d, eng: { ...d.eng, fontSize: +e.target.value } }))}
                style={{ width: '100%', marginTop: 4 }} />
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ color: '#d1d5db', fontSize: 12 }}>Color</span>
              <input type="color" value={draft.eng.color}
                onChange={e => setDraft(d => ({ ...d, eng: { ...d.eng, color: e.target.value } }))}
                style={{ width: 36, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
            </div>
          </div>

          {/* VI sub */}
          <div style={{ borderTop: '1px solid #374151', paddingTop: 8 }}>
            <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 600, margin: '0 0 6px' }}>VI Sub</p>
            <label style={{ color: '#d1d5db', fontSize: 12 }}>
              Size: <strong style={{ color: '#fff' }}>{draft.viet.fontSize}px</strong>
              <input type="range" min={10} max={48} value={draft.viet.fontSize}
                onChange={e => setDraft(d => ({ ...d, viet: { ...d.viet, fontSize: +e.target.value } }))}
                style={{ width: '100%', marginTop: 4 }} />
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ color: '#d1d5db', fontSize: 12 }}>Color</span>
              <input type="color" value={draft.viet.color}
                onChange={e => setDraft(d => ({ ...d, viet: { ...d.viet, color: e.target.value } }))}
                style={{ width: 36, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
            </div>
          </div>

          {/* Background & Frame Width */}
          <div style={{ borderTop: '1px solid #374151', paddingTop: 8 }}>
            <p style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, margin: '0 0 6px' }}>Layout & Background</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db', fontSize: 12 }}>Color</span>
              <input type="color" value={draft.bgColor}
                onChange={e => setDraft(d => ({ ...d, bgColor: e.target.value }))}
                style={{ width: 36, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
            </div>
            <label style={{ color: '#d1d5db', fontSize: 12, marginTop: 6, display: 'block' }}>
              Opacity: <strong style={{ color: '#fff' }}>{draft.bgOpacity}%</strong>
              <input type="range" min={0} max={100} value={draft.bgOpacity}
                onChange={e => setDraft(d => ({ ...d, bgOpacity: +e.target.value }))}
                style={{ width: '100%', marginTop: 4 }} />
            </label>
            {/* 4. Thêm thanh trượt cho Frame Width */}
            <label style={{ color: '#d1d5db', fontSize: 12, marginTop: 6, display: 'block' }}>
              Frame width: <strong style={{ color: '#fff' }}>{draft.frameWidth}px</strong>
              <input type="range" min={300} max={1000} step={10} value={draft.frameWidth}
                onChange={e => setDraft(d => ({ ...d, frameWidth: +e.target.value }))}
                style={{ width: '100%', marginTop: 4 }} />
            </label>
          </div>

          {/* Font */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #374151', paddingTop: 8 }}>
            <span style={{ color: '#d1d5db', fontSize: 12 }}>Font</span>
            <select value={draft.fontFamily}
              onChange={e => setDraft(d => ({ ...d, fontFamily: e.target.value }))}
              style={{ background: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: 6, padding: '2px 6px', fontSize: 12 }}
            >
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button
              onClick={() => setDraft(DEFAULT_SETTINGS)}
              style={{
                flex: 1, padding: '5px 0', background: '#374151', color: '#9ca3af',
                border: '1px solid #4b5563', borderRadius: 6, fontSize: 11, cursor: 'pointer',
              }}
            >Reset</button>
            <button
              onClick={applySettings}
              style={{
                flex: 1, padding: '5px 0', background: '#3b82f6', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600,
              }}
            >Save</button>
          </div>
        </div>
      )}
    </div>
  );
}