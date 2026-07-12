/**
 * app/api/analyze/route.ts — AI-1 Proxy (Sprint 2)
 * Input : POST { faceProfile, nasolabial, nasofrontal }
 * Output: { advice: string, usedFallback: boolean }
 *
 * Pipeline: kill switch → rate limit → KB lookup → Gemini call → guardrails → return
 * Không bao giờ throw 500 cho client — mọi lỗi đều fall back về sampleAdvice từ KB.
 * Không log advice text để tránh lộ nội dung y khoa vào server log.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  checkRateLimit,
  getClientIdentifier,
  RATE_LIMITS,
} from '@/lib/utils/rateLimit';
import {
  findMatchingCase,
  formatKBForPrompt,
  type FaceProfile,
} from '@/lib/ai/mini-kb';

/* ── Constants ── */

const MODEL_ID = 'gemini-2.5-flash';
const TIMEOUT_MS = 5_000;

// Chuẩn Á Đông (CLAUDE.md) — KHÔNG dùng chuẩn phương Tây
const NASOLABIAL_STANDARD = '90–100°';
const NASOFRONTAL_STANDARD = '115–130°';

// Text khi measurements chống chỉ định (findMatchingCase → null)
const FALLBACK_CONTRAINDICATION =
  'Số liệu của bạn cần bác sĩ đánh giá trực tiếp để có kết quả chính xác. ' +
  'Mời bạn đến AZ NOSE để khám và chụp CT 3D miễn phí cùng bác sĩ.';

/* ── Guardrails (prompt_library.md) ── */

const BLOCKED_PATTERNS: RegExp[] = [
  /chắc chắn/i,
  /cam kết/i,
  /100\s*%/,
  /chữa khỏi/i,
  /không đau/i,
  /không biến chứng/i,
  /đảm bảo (đẹp|thành công|kết quả)/i,
  /rẻ hơn (thẩm mỹ|phòng khám) \w+/i,
];

function passesGuardrails(text: string): boolean {
  return BLOCKED_PATTERNS.every((p) => !p.test(text));
}

/* ── Input validation ── */

const VALID_PROFILES = new Set<FaceProfile>([
  'ROUND', 'OVAL', 'LONG', 'SQUARE', 'HEART',
]);

interface AnalyzeBody {
  faceProfile: FaceProfile;
  nasolabial: number;
  nasofrontal: number;
}

function parseBody(raw: unknown): AnalyzeBody | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;
  if (
    typeof b.nasolabial !== 'number' ||
    typeof b.nasofrontal !== 'number' ||
    !VALID_PROFILES.has(b.faceProfile as FaceProfile)
  ) {
    return null;
  }
  return {
    faceProfile: b.faceProfile as FaceProfile,
    nasolabial: b.nasolabial,
    nasofrontal: b.nasofrontal,
  };
}

/* ── Prompt builder (AI-1 template, prompt_library.md) ── */

function buildSystemPrompt(kbContext: string): string {
  return `Bạn là trợ lý phân tích tỷ lệ khuôn mặt của phòng khám AZ NOSE.

QUY TẮC BẮT BUỘC:
1. CHỈ dùng thông tin từ [KHO TRI THỨC] bên dưới.
2. Nếu không có thông tin phù hợp → nói "cần bác sĩ đánh giá trực tiếp".
3. KHÔNG được: chẩn đoán y khoa, hứa hẹn, cam kết, dùng từ "chắc chắn", "chữa khỏi", "100%", "không đau".
4. Luôn nhắc user: đây là phân tích 2D sơ bộ, kết quả thực tế cần chụp CT 3D.
5. Ngôn ngữ ấm áp, không phán xét. Dùng "đặc điểm" thay cho "khuyết điểm".
6. Độ dài: 3–4 câu, tối đa 80 từ.

[KHO TRI THỨC]
${kbContext}`;
}

function buildUserMessage(
  faceProfile: string,
  nasolabial: number,
  nasofrontal: number,
  recommendedShape: string,
): string {
  return `[SỐ LIỆU KHÁCH HÀNG]
- Cấu trúc mặt: ${faceProfile}
- Góc mũi môi: ${nasolabial.toFixed(1)}° (chuẩn Á Đông: ${NASOLABIAL_STANDARD})
- Góc mũi trán: ${nasofrontal.toFixed(1)}° (chuẩn Á Đông: ${NASOFRONTAL_STANDARD})
- Dáng mũi đề xuất từ lookup table: ${recommendedShape}

Hãy viết 3–4 câu tư vấn cá nhân hoá theo phong cách trong kho tri thức.`;
}

/* ── Gemini call with timeout ── */

async function callGemini(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY không được cấu hình.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_ID,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 200,
    },
  });

  const geminiCall = model
    .generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    })
    .then((result) => result.response.text());

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini timeout sau ${TIMEOUT_MS}ms`)), TIMEOUT_MS),
  );

  return Promise.race([geminiCall, timeout]);
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

/* ── Handlers ── */

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();
  const origin = request.headers.get('origin');
  const corsH = buildCorsHeaders(origin);
  const jsonH = { ...corsH, 'Content-Type': 'application/json' };

  // ── 1. Maintenance mode ──
  if (process.env.MAINTENANCE_MODE === 'true') {
    return NextResponse.json(
      { error: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.' },
      { status: 503, headers: jsonH },
    );
  }

  // ── 2. Rate limit ──
  const clientKey = getClientIdentifier(request);
  const rl = checkRateLimit(
    `analyze:${clientKey}`,
    RATE_LIMITS.ANALYZE.max,
    RATE_LIMITS.ANALYZE.windowMs,
  );

  if (!rl.allowed) {
    const retryAfterSec = Math.ceil(rl.resetInMs / 1000);
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài giây.' },
      {
        status: 429,
        headers: {
          ...jsonH,
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + rl.resetInMs),
        },
      },
    );
  }

  // ── 3. Parse & validate body ──
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
      {
        error:
          'Tham số không hợp lệ. Yêu cầu: { faceProfile: ROUND|OVAL|LONG|SQUARE|HEART, nasolabial: number, nasofrontal: number }',
      },
      { status: 400, headers: jsonH },
    );
  }

  const { faceProfile, nasolabial, nasofrontal } = body;

  // ── 4. KB lookup — chống chỉ định ──
  const matchedCase = findMatchingCase(faceProfile, nasolabial, nasofrontal);

  if (!matchedCase) {
    console.log('[analyze] contraindicated', {
      faceProfile,
      nasolabial: nasolabial.toFixed(1),
      nasofrontal: nasofrontal.toFixed(1),
      latencyMs: Date.now() - t0,
      usedFallback: true,
    });
    return NextResponse.json(
      { advice: FALLBACK_CONTRAINDICATION, usedFallback: true },
      { status: 200, headers: jsonH },
    );
  }

  // ── 5. Kill switch AI-1 → dùng sampleAdvice ngay ──
  if (process.env.FEATURE_AI1_ENABLED !== 'true') {
    console.log('[analyze] AI-1 kill-switch active', {
      caseId: matchedCase.id,
      latencyMs: Date.now() - t0,
      usedFallback: true,
    });
    return NextResponse.json(
      { advice: matchedCase.sampleAdvice, usedFallback: true },
      { status: 200, headers: jsonH },
    );
  }

  // ── 6. Call Gemini ──
  let advice = matchedCase.sampleAdvice;
  let usedFallback = true;

  try {
    const kbContext = formatKBForPrompt(matchedCase);
    const systemPrompt = buildSystemPrompt(kbContext);
    const userMessage = buildUserMessage(
      faceProfile,
      nasolabial,
      nasofrontal,
      matchedCase.recommendedShape,
    );

    const rawText = await callGemini(systemPrompt, userMessage);

    // ── 7. Guardrails ──
    if (passesGuardrails(rawText)) {
      advice = rawText.trim();
      usedFallback = false;
    } else {
      // Không log nội dung vi phạm — chỉ log sự kiện
      console.warn('[analyze] guardrails blocked output', {
        caseId: matchedCase.id,
        latencyMs: Date.now() - t0,
        usedFallback: true,
      });
    }
  } catch (err) {
    // Không log advice text — chỉ log error message
    const errMsg = err instanceof Error ? err.message : 'unknown error';
    console.error('[analyze] Gemini error → fallback', {
      error: errMsg,
      caseId: matchedCase.id,
      latencyMs: Date.now() - t0,
      usedFallback: true,
    });
    // advice giữ nguyên = matchedCase.sampleAdvice
  }

  console.log('[analyze] complete', {
    caseId: matchedCase.id,
    latencyMs: Date.now() - t0,
    usedFallback,
  });

  return NextResponse.json({ advice, usedFallback }, { status: 200, headers: jsonH });
}
