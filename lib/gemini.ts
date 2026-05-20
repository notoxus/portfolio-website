declare global {
  interface Window {
    ai: any;
  }
}

export async function checkGeminiNanoAvailability() {
  if (typeof window === 'undefined' || !('ai' in window)) return false;
  
  try {    
    const capabilities = await window.ai.canCreateTextSession();
    return capabilities === 'readily' || capabilities === 'after-download';
  } catch (error) {
    return false;
  }
}

export async function translateSentence(text: string): Promise<string> {
  if (!text) return "";
  
  try {
    const session = await window.ai.createTextSession({
      systemPrompt: "Dịch câu tiếng Anh sau sang tiếng Việt tự nhiên, ngắn gọn để làm phụ đề. Chỉ trả lời bằng tiếng Việt, không giải thích."
    });
    
    const result = await session.prompt(text);
    session.destroy();
    return result;
  } catch (error) {
    console.error("Lỗi Gemini Nano:", error);
    return "Đang dịch hoặc AI chưa sẵn sàng...";
  }
}