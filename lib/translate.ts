export async function processTranslation(text: string, type: 'batch' | 'instant' = 'instant') {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey) {
    try {
      const isInstant = type === 'instant';
      const prompt = isInstant
        ? `Translate this English text to Vietnamese. Return ONLY the translation, nothing else:\n${text}`
        : `Translate each line to Vietnamese. Keep the numbering format exactly.\nReturn ONLY translations:\n${text}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`Groq error: ${res.status}`);

      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || text;

    } catch (err) {
      console.warn('[translate] Groq failed, falling back to Google Translate:', err);
    }
  }
  return await googleTranslateFallback(text, type);
}

async function googleTranslateFallback(text: string, type: 'batch' | 'instant'): Promise<string> {
  if (type === 'instant') {
    return await translateChunk(text);
  }
  const lines = text.split('\n').filter(l => l.trim());
  const results: string[] = [];

  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      const translated = await translateChunk(match[2]);
      results.push(`${match[1]}. ${translated}`);
    } else {
      results.push(line);
    }
  }

  return results.join('\n');
}

async function translateChunk(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Google Translate failed');
    const data = await res.json();
    return data[0]?.map((chunk: any[]) => chunk[0]).join('') || text;
  } catch {
    return text;
  }
}