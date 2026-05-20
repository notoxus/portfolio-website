import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');
  const mode = searchParams.get('mode') || 'en-vi';

  if (!word) {
    return NextResponse.json({ error: "Thiếu từ khóa" }, { status: 400 });
  }

  try {
    if (mode === 'en-en') {
      const res = await fetch(`http://tratu.soha.vn/dict/en_vn/${word}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        }
      });
    } 

    if (mode === 'en-vi') {
      const res = await fetch(`http://tratu.soha.vn/dict/en_vn/${word}`);
      const html = await res.text();

      const $ = cheerio.load(html);
      
      let definition = $('#content-5 h5').first().text().trim();

      if (!definition) {
        definition = $('.section-h5').first().text().trim();
      }

      if (!definition) {
        const gtRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${word}`);
        const gtData = await gtRes.json();
        definition = gtData[0][0][0]; 
      }

      return NextResponse.json({
        word: word,
        phonetic: '',
        definition: definition || 'Không tìm thấy nghĩa của từ này.'
      });
    }

  } catch (error) {
    return NextResponse.json({ error: "Lỗi server khi tra từ" }, { status: 500 });
  }
}