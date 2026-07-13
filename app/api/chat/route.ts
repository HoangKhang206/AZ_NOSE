/**
 * app/api/chat/route.ts — AI-2 Proxy (Sprint 2, Demo)
 * Input : POST { messages: ChatMessage[], context: ChatContext }
 * Output: { reply, handoff, zaloLink?, usedFallback }
 *
 * Pipeline: maintenance → rate limit → kill switch → parse → handoff check
 *           → RAG retrieval → Gemini → guardrails → return
 * Không throw 500 cho client — mọi lỗi fall back về FALLBACK_MESSAGE.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/utils/rateLimit';
import {
  shouldHandoff,
  findRelevantFAQs,
  formatKBForChatPrompt,
} from '@/lib/ai/mini-kb-business';
import { withKeyRotation } from '@/lib/utils/geminiKeys';

/* ── Constants ── */

const MODEL_ID = 'gemini-2.5-flash'; // gemini-1.5-flash trả 404 với API key này
const TIMEOUT_MS = 6_000;

const ZALO_LINK = process.env.NEXT_PUBLIC_ZALO_LINK ?? 'https://zalo.me/aznose';

const HANDOFF_REPLY =
  `Câu hỏi này mình cần chuyển cho chuyên viên giải đáp cho chính xác. ` +
  `Bạn để lại SĐT nhé, chuyên viên sẽ gọi trong 15 phút. Hoặc chat qua Zalo: ${ZALO_LINK}`;

const FALLBACK_MESSAGE =
  `Câu hỏi của bạn khá đặc thù. Bạn để chuyên viên tư vấn kỹ hơn nhé, chat qua Zalo: ${ZALO_LINK}`;

/* ── Guardrails ── */

const BLOCKED_PATTERNS: RegExp[] = [
  /chắc chắn/i,
  /cam kết/i,
  /100\s*%/,
  /không đau/i,
  /chữa khỏi/i,
  /rẻ hơn/i,
];

function passesGuardrails(text: string): boolean {
  return BLOCKED_PATTERNS.every((p) => !p.test(text));
}

/* ── CORS ── */

const ALLOWED_ORIGINS = [
  'https://aznose.vn',
  'https://www.aznose.vn',
  'http://localhost:3000',
  'http://localhost:3001',
];

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/* ── Types ── */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  faceProfile: string;
  recommendedShape: string;
  nasolabial: number;
  nasofrontal: number;
}

interface ChatBody {
  messages: ChatMessage[];
  context: ChatContext;
}

/* ── Input validation ── */

function parseBody(raw: unknown): ChatBody | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;

  if (!Array.isArray(b.messages) || typeof b.context !== 'object' || !b.context) return null;

  const ctx = b.context as Record<string, unknown>;
  if (
    typeof ctx.faceProfile !== 'string' ||
    typeof ctx.recommendedShape !== 'string' ||
    typeof ctx.nasolabial !== 'number' ||
    typeof ctx.nasofrontal !== 'number'
  ) return null;

  const valid = (b.messages as unknown[]).every(
    (m) =>
      m &&
      typeof m === 'object' &&
      typeof (m as Record<string, unknown>).role === 'string' &&
      typeof (m as Record<string, unknown>).content === 'string',
  );
  if (!valid) return null;

  return b as unknown as ChatBody;
}

/* ── Prompt builder ── */

function buildSystemPrompt(kbContext: string, ctx: ChatContext): string {
  return `Bạn là "Ánh" — trợ lý AI của phòng khám AZ NOSE (chuyên sâu nâng mũi).

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên [KHO TRI THỨC] bên dưới.
2. Nếu không tìm thấy thông tin → nói "Để chuyên viên gọi lại cho bạn, để lại SĐT nhé".
3. KHÔNG: cam kết kết quả, so sánh với đối thủ, dùng từ "chắc chắn"/"100%"/"không đau"/"chữa khỏi".
4. Tone: ấm áp, chuyên nghiệp, KHÔNG hối thúc.
5. Độ dài: 2-3 câu, tối đa 60 từ mỗi lượt.
6. Minh bạch là AI nếu user hỏi "bạn là ai".

[KHO TRI THỨC]
${kbContext}

[NGỮ CẢNH KHÁCH HÀNG]
- Vừa quét mặt xong
- Cấu trúc mặt: ${ctx.faceProfile}
- Góc mũi môi: ${ctx.nasolabial.toFixed(1)}°
- Dáng AI đề xuất: ${ctx.recommendedShape}`;
}

/* ── Gemini call with timeout ── */

type GeminiContent = { role: 'user' | 'model'; parts: [{ text: string }] };

async function callGemini(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  return withKeyRotation(async (apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 400, // Vietnamese cần nhiều tokens hơn English
      },
    });

    const contents: GeminiContent[] = messages.slice(-10).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const geminiCall = model
      .generateContent({ contents })
      .then((result) => result.response.text());

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini timeout ${TIMEOUT_MS}ms`)), TIMEOUT_MS),
    );

    return Promise.race([geminiCall, timeout]);
  });
}

/* ── Handlers ── */

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();
  const origin = request.headers.get('origin');
  const corsH = buildCorsHeaders(origin);
  const jsonH = { ...corsH, 'Content-Type': 'application/json' };

  // ── 1. Maintenance ──
  if (process.env.MAINTENANCE_MODE === 'true') {
    return NextResponse.json(
      { error: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.' },
      { status: 503, headers: jsonH },
    );
  }

  // ── 2. Rate limit ──
  const clientKey = getClientIdentifier(request);
  const rl = checkRateLimit(
    `chat:${clientKey}`,
    RATE_LIMITS.CHAT.max,
    RATE_LIMITS.CHAT.windowMs,
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài giây.' },
      {
        status: 429,
        headers: {
          ...jsonH,
          'Retry-After': String(Math.ceil(rl.resetInMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // ── 3. Kill switch AI-2 ──
  if (process.env.FEATURE_AI2_ENABLED !== 'true') {
    console.log('[chat] AI-2 kill-switch active');
    return NextResponse.json(
      { reply: HANDOFF_REPLY, handoff: true, zaloLink: ZALO_LINK, usedFallback: true },
      { status: 200, headers: jsonH },
    );
  }

  // ── 4. Parse & validate body ──
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body không hợp lệ JSON.' },
      { status: 400, headers: jsonH },
    );
  }

  const body = parseBody(rawBody);
  if (!body) {
    return NextResponse.json(
      { error: 'Tham số không hợp lệ. Yêu cầu: { messages, context }' },
      { status: 400, headers: jsonH },
    );
  }

  const { messages, context } = body;
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // ── 5. Handoff detection ──
  if (shouldHandoff(lastUserMsg)) {
    console.log('[chat] handoff triggered', { latencyMs: Date.now() - t0 });
    return NextResponse.json(
      { reply: HANDOFF_REPLY, handoff: true, zaloLink: ZALO_LINK, usedFallback: false },
      { status: 200, headers: jsonH },
    );
  }

  // ── 6. RAG retrieval ──
  const relevantFAQs = findRelevantFAQs(lastUserMsg, 4);
  const kbContext = formatKBForChatPrompt(relevantFAQs);
  const systemPrompt = buildSystemPrompt(kbContext, context);

  // ── 7. Call Gemini ──
  let reply = FALLBACK_MESSAGE;
  let usedFallback = true;

  try {
    const rawText = await callGemini(systemPrompt, messages);

    // ── 8. Guardrails ──
    if (passesGuardrails(rawText)) {
      reply = rawText.trim();
      usedFallback = false;
    } else {
      console.warn('[chat] guardrails blocked output', { latencyMs: Date.now() - t0 });
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'unknown';
    console.error('[chat] Gemini error → fallback', { error: errMsg, latencyMs: Date.now() - t0 });
  }

  console.log('[chat] complete', { latencyMs: Date.now() - t0, usedFallback });

  return NextResponse.json({ reply, handoff: false, usedFallback }, { status: 200, headers: jsonH });
}
