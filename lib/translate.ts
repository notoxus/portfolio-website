export interface TranslationJob {
  text: string;
}

export async function processTranslation(text: string, type: 'batch' | 'instant' = 'instant') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  // ĐỊNH TUYẾN MODEL: 'batch' dùng 70B siêu xịn, 'instant' dùng 8B siêu tốc
  const modelName = type === 'batch' ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelName, 
      messages: [
        { 
          role: "system", 
          content: "You are a professional translator. You MUST translate the user's text into VIETNAMESE. DO NOT leave any sentence in English. ONLY output the Vietnamese translation. DO NOT add conversational text or explanations. Maintain original line breaks and numbering if present." 
        },
        { role: "user", content: text }
      ],
      temperature: 0.1 
    })
  });

  if (!res.ok) {
    // Nếu lỗi thì âm thầm bỏ qua đối với instant để không làm giật màn hình
    return type === 'instant' ? "" : text; 
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}