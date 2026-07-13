/**
 * lib/utils/geminiKeys.ts — Multi-key rotation cho Gemini free tier
 * Khi key hiện tại bị 429 (quota hết) → tự động thử key tiếp theo.
 * Mỗi key phải từ tài khoản Google khác nhau.
 */

function loadKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter((k): k is string => Boolean(k));

  if (keys.length === 0) throw new Error('Không có GEMINI_API_KEY nào được cấu hình.');
  return keys;
}

let _currentIndex = 0;

/** Lấy key hiện tại. */
export function getCurrentKey(): string {
  const keys = loadKeys();
  return keys[_currentIndex % keys.length];
}

/**
 * Gọi Gemini với tự động retry sang key tiếp theo khi gặp 429.
 * fn nhận apiKey và trả về Promise<T>.
 */
export async function withKeyRotation<T>(
  fn: (apiKey: string) => Promise<T>,
): Promise<T> {
  const keys = loadKeys();
  let lastError: unknown;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(_currentIndex + attempt) % keys.length];
    try {
      const result = await fn(key);
      // Key này dùng được — giữ nguyên index
      return result;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : '';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      if (!isQuota) throw err; // lỗi khác (timeout, 400…) → không rotate
      // Quota hết → chuyển sang key tiếp
      _currentIndex = (_currentIndex + attempt + 1) % keys.length;
      console.warn(`[geminiKeys] Key ${attempt + 1}/${keys.length} hết quota → thử key tiếp theo`);
    }
  }

  throw lastError; // tất cả key đều hết quota
}
