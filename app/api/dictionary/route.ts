import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');
  const mode = searchParams.get('mode') || 'en-vi';

  if (!word) return NextResponse.json({ error: "Missing keyword" }, { status: 400 });

  try {
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
    
    if (mode === 'en-vi') {
      const res = await fetch(`http://tratu.soha.vn/dict/en_vn/${word}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await res.text();
      const $ = cheerio.load(html);
      
      let definitionArr: string[] = [];
      
      // Scan all elements holding a definition (Soha usually puts them in h5, or in li tags with class margin25)
      $('#content-5 h5, #content-5 .margin25').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text && !definitionArr.includes(text)) {
          definitionArr.push(`- ${text}`);
        }
      });

      let finalDefinition = definitionArr.join('\n');

      // If Soha returns nothing or the word is too rare, fall back to Google Translate
      if (!finalDefinition || finalDefinition.length === 0) {
        const gtRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(word)}`);
        const gtData = await gtRes.json();
        finalDefinition = gtData[0][0][0]; 
      }

      return NextResponse.json({
        word: word,
        phonetic: '', 
        definition: finalDefinition || 'No definition found for this word.'
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error while looking up the word" }, { status: 500 });
  }
}