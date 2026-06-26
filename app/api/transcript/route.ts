import { NextResponse } from 'next/server';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

interface CaptionTrack {
  baseUrl: string;
  name: { simpleText: string };
  languageCode: string;
  kind?: string;
}

interface TimedTextEvent {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: { utf8: string }[];
}

async function getCaptionTracks(videoId: string): Promise<CaptionTrack[]> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) throw new Error('Failed to fetch YouTube page');

  const html = await res.text();

  const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/s);
  if (!match) throw new Error('Could not find player response');

  const playerResponse = JSON.parse(match[1]);
  const tracks: CaptionTrack[] =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  return tracks;
}

function pickBestTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  // Prefer manual EN, then any manual, then ASR EN, then any ASR
  const priority = [
    (t: CaptionTrack) => !t.kind && t.languageCode.startsWith('en'),
    (t: CaptionTrack) => !t.kind,
    (t: CaptionTrack) => t.kind === 'asr' && t.languageCode.startsWith('en'),
    (t: CaptionTrack) => t.kind === 'asr',
  ];
  for (const predicate of priority) {
    const found = tracks.find(predicate);
    if (found) return found;
  }
  return tracks[0] ?? null;
}

async function fetchCaptionData(track: CaptionTrack) {
  const url = new URL(track.baseUrl);
  url.searchParams.set('fmt', 'json3');

  const res = await fetch(url.toString(), { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error('Failed to fetch caption data');

  const data = await res.json();
  const events: TimedTextEvent[] = data.events ?? [];

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

  try {
    const tracks = await getCaptionTracks(videoId);

    if (tracks.length === 0) {
      return NextResponse.json(
        { error: 'This video has no captions available' },
        { status: 404 }
      );
    }

    const track = pickBestTrack(tracks);
    if (!track) {
      return NextResponse.json({ error: 'No suitable caption track found' }, { status: 404 });
    }

    const items = await fetchCaptionData(track);

    if (items.length === 0) {
      return NextResponse.json({ error: 'Caption track is empty' }, { status: 404 });
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error('[transcript]', err);
    return NextResponse.json(
      { error: "Couldn't get transcript" },
      { status: 500 }
    );
  }
}
