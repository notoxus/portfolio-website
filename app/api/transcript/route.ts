import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) return NextResponse.json({ error: "Thiếu Video ID" }, { status: 400 });
  const langPriority = ['en', 'en-US', 'en-GB', 'vi', ''];
  for (const lang of langPriority) {
    try {
      const opts = lang ? { lang } : {};
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, opts);
      
      if (!transcript || transcript.length === 0) continue;

      const formattedTranscript = transcript.map((item, index) => ({
        id: index,
        start: item.offset / 1000,
        end: (item.offset + item.duration) / 1000,
        text: item.text
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/\[.*?\]/g, '')
          .trim(),
      })).filter(item => item.text.length > 0);

      return NextResponse.json(formattedTranscript);
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: "Couldn't get Video Subtitle (its CC might be off)" },
    { status: 500 }
  );
}