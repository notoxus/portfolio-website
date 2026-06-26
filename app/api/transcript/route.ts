import { NextResponse } from 'next/server';

interface TimedTextEvent {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: { utf8: string }[];
}

interface TimedTextResponse {
  events?: TimedTextEvent[];
}

function buildUrl(videoId: string, lang: string, kind?: string) {
  const params = new URLSearchParams({ v: videoId, lang, fmt: 'json3' });
  if (kind) params.set('kind', kind);
  return `https://www.youtube.com/api/timedtext?${params}`;
}

async function fetchTimedText(url: string): Promise<TimedTextResponse | null> {
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text || text.trim() === '') return null;
  try {
    return JSON.parse(text) as TimedTextResponse;
  } catch {
    return null;
  }
}

function parseEvents(data: TimedTextResponse) {
  const events = data.events ?? [];
  return events
    .filter((e) => e.segs && e.tStartMs !== undefined)
    .map((e, i) => ({
      id: i,
      start: (e.tStartMs ?? 0) / 1000,
      end: ((e.tStartMs ?? 0) + (e.dDurationMs ?? 0)) / 1000,
      text: (e.segs ?? [])
        .map((s) => s.utf8)
        .join('')
        .replace(/\n/g, ' ')
        .replace(/\[.*?\]/g, '')
        .trim(),
    }))
    .filter((e) => e.text.length > 0);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing Video ID' }, { status: 400 });
  }

  // Try order: manual EN → manual VI → auto EN → auto VI → auto (any)
  const attempts = [
    buildUrl(videoId, 'en'),
    buildUrl(videoId, 'vi'),
    buildUrl(videoId, 'en', 'asr'),
    buildUrl(videoId, 'vi', 'asr'),
    buildUrl(videoId, 'en-US', 'asr'),
    buildUrl(videoId, '', 'asr'),
  ];

  for (const url of attempts) {
    const data = await fetchTimedText(url);
    if (!data) continue;
    const items = parseEvents(data);
    if (items.length > 0) return NextResponse.json(items);
  }

  return NextResponse.json(
    { error: "Couldn't get transcript — video may have captions disabled" },
    { status: 404 }
  );
}
