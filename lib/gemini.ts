declare global {
  interface Window {
    ai?: {
      canCreateTextSession?: () => Promise<string>;
      createTextSession?: (options?: any) => Promise<any>;
      languageModel?: {
        capabilities?: () => Promise<any>;
        create?: (options?: any) => Promise<any>;
      };
    };
  }
}

/**
 * Checks whether Chrome Built-in AI (Gemini Nano) is available on this client device.
 * Requires experimental flag enabled in Chrome: chrome://flags/#prompt-api-for-gemini-nano
 */
export async function checkGeminiNanoAvailability(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ai) return false;

  try {
    if (typeof window.ai.languageModel?.capabilities === 'function') {
      const caps = await window.ai.languageModel.capabilities();
      return caps.available === 'readily' || caps.available === 'after-download';
    }
    if (typeof window.ai.canCreateTextSession === 'function') {
      const status = await window.ai.canCreateTextSession();
      return status === 'readily' || status === 'after-download';
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Zero-cost on-device translation using Chrome Built-in AI (Gemini Nano).
 * Returns translated string or null if not supported/failed.
 */
export async function translateWithGeminiNano(text: string): Promise<string | null> {
  if (!text || typeof window === 'undefined' || !window.ai) return null;

  try {
    const systemPrompt =
      'Dịch câu tiếng Anh sau sang tiếng Việt tự nhiên, ngắn gọn làm phụ đề video. Chỉ trả về bản dịch, không giải thích:';

    // Modern Chrome Prompt API
    if (window.ai.languageModel?.create) {
      const session = await window.ai.languageModel.create({ systemPrompt });
      const result = await session.prompt(text);
      if (typeof session.destroy === 'function') session.destroy();
      return result?.trim() || null;
    }

    // Legacy experimental window.ai
    if (window.ai.createTextSession) {
      const session = await window.ai.createTextSession({ systemPrompt });
      const result = await session.prompt(text);
      if (typeof session.destroy === 'function') session.destroy();
      return result?.trim() || null;
    }

    return null;
  } catch (err) {
    console.warn('[Gemini Nano on-device AI]', err);
    return null;
  }
}
