import { NextResponse } from 'next/server';
import { processTranslation } from '@/lib/translate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { texts, type } = body;

    if (!texts || texts.length === 0) {
      return NextResponse.json({ error: "Didn't have transcript to translate" }, { status: 400 });
    }

    // Pass the type down to the processing function
    const translatedText = await processTranslation(texts[0], type);

    return NextResponse.json({
      choices: [
        { message: { content: translatedText } }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Translation error" }, { status: 500 });
  }
}