import { NextResponse } from 'next/server';
import { processTranslation } from '@/lib/translate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { texts } = body;

    if (!texts || texts.length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    const translatedText = await processTranslation(texts[0]);

    return NextResponse.json({
      choices: [
        { message: { content: translatedText } }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}