import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) return NextResponse.json({ error: "Thiếu Video ID" }, { status: 400 });

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const formattedTranscript = transcript.map((item, index) => ({
      id: index,
      start: item.offset / 1000,
      end: (item.offset + item.duration) / 1000,
      text: item.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'")
    }));
    return NextResponse.json(formattedTranscript);
  } catch (error) {
    return NextResponse.json({ error: "Không thể lấy phụ đề video này (có thể video không có sub)" }, { status: 500 });
  }
}