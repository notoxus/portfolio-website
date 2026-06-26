import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

function toSeconds(value: number, valuesAreMilliseconds: boolean) {
  return valuesAreMilliseconds ? value / 1000 : value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing Video ID' }, { status: 400 });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const valuesAreMilliseconds = transcript.some((item) => item.duration > 100);

    const items = transcript
      .map((item, id) => {
        const start = toSeconds(item.offset, valuesAreMilliseconds);
        const duration = toSeconds(item.duration, valuesAreMilliseconds);

        return {
          id,
          start,
          end: start + duration,
          text: item.text.replace(/\n/g, ' ').replace(/\[.*?\]/g, '').trim(),
        };
      })
      .filter((item) => item.text.length > 0);

    if (items.length === 0) {
      return NextResponse.json({ error: 'Caption track is empty' }, { status: 404 });
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error('[transcript]', err);
    return NextResponse.json({ error: "Couldn't get transcript" }, { status: 500 });
  }
}
