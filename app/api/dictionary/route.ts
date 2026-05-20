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
    // 1. CHẾ ĐỘ ANH - ANH (Free Dictionary API)
    if (mode === 'en-en') {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!res.ok) throw new Error("Not found");
      
      const data = await res.json();
      return NextResponse.json({
        word: data[0].word,
        phonetic: data[0].phonetic || '',
        definition: data[0].meanings[0].definitions[0].definition
      });
    } 
    
    // 2. CHẾ ĐỘ ANH - VIỆT (Cào dữ liệu từ Soha)
    if (mode === 'en-vi') {
      const res = await fetch(`http://tratu.soha.vn/dict/en_vn/${word}`);
      const html = await res.text();
      
      // Khởi tạo cheerio để đọc HTML của Soha
      const $ = cheerio.load(html);
      
      // Soha thường giấu nghĩa chính trong thẻ <h5> thuộc khu vực nội dung
      let definition = $('#content-5 h5').first().text().trim();
      
      // Nếu cấu trúc HTML thay đổi, thử tìm ở class khác
      if (!definition) {
        definition = $('.section-h5').first().text().trim();
      }

      // Phương án dự phòng (Fallback): Nếu từ này Soha không có, dùng Google Translate API ngầm
      if (!definition) {
        const gtRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${word}`);
        const gtData = await gtRes.json();
        definition = gtData[0][0][0]; 
      }

      return NextResponse.json({
        word: word,
        phonetic: '', // Soha khó bóc tách phiên âm chuẩn, tạm để trống
        definition: definition || 'Không tìm thấy nghĩa của từ này.'
      });
    }

  } catch (error) {
    return NextResponse.json({ error: "Lỗi server khi tra từ" }, { status: 500 });
  }
}