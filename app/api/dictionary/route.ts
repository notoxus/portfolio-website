import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: "Thiếu từ khóa" }, { status: 400 });
  }

  try {
    // Tạm thời dùng API Anh-Anh. Có thể tích hợp logic Cheerio cào dữ liệu Soha tại đây.
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    
    if (Array.isArray(data)) {
      return NextResponse.json({
        word: data[0].word,
        phonetic: data[0].phonetic,
        definition: data[0].meanings[0].definitions[0].definition
      });
    }
    return NextResponse.json({ error: "Không tìm thấy từ" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}