'use client';

/**
 * Chatbot.tsx — AI-2 "Ánh" floating chat panel (Sprint 2, Demo)
 * Input : context { faceProfile, recommendedShape, nasolabial, nasofrontal }
 * Output: floating bubble → panel với lịch sử chat + typing animation
 *
 * Bubble xuất hiện sau 15 giây. Drag handle Esc đóng panel.
 * Handoff → hiện nút "Chat Zalo ngay".
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

/* ── Types ── */

export interface ChatContext {
  faceProfile: string;
  recommendedShape: string;
  nasolabial: number;
  nasofrontal: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  handoff?: boolean;
  zaloLink?: string;
}

interface ChatReply {
  reply: string;
  handoff: boolean;
  zaloLink?: string;
  usedFallback: boolean;
}

interface ChatbotProps {
  context: ChatContext;
  onUserMessage?: () => void;
}

/* ── Constants ── */

const BUBBLE_DELAY_MS = 15_000;
const TYPING_MS = 15;
const FETCH_TIMEOUT_MS = 8_000;

const QUICK_REPLIES = [
  'Giá dáng này bao nhiêu?',
  'Có đau không?',
  'Bao lâu hồi phục?',
  'Ăn kiêng gì?',
];

/* ── Fetch helper with 1 retry ── */

async function fetchChatReply(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context: ChatContext,
  attempt = 0,
): Promise<ChatReply> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
      signal: controller.signal,
    });
    clearTimeout(tid);
    if (!res.ok) throw new Error(`http:${res.status}`);
    return (await res.json()) as ChatReply;
  } catch (err) {
    clearTimeout(tid);
    const isNetwork = !(err instanceof Error && err.message.startsWith('http:'));
    if (isNetwork && attempt === 0) return fetchChatReply(messages, context, 1);
    throw err;
  }
}

/* ── ID generator ── */
let _seq = 0;
const nextId = () => `msg-${Date.now()}-${_seq++}`;

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */

export default function Chatbot({ context, onUserMessage }: ChatbotProps) {
  const greeting = `Chào bạn! Mình là Ánh — trợ lý AI của AZ NOSE. Mình vừa xem kết quả AI đề xuất dáng ${context.recommendedShape} cho bạn. Bạn muốn hỏi thêm gì không?`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'assistant', content: greeting },
  ]);
  const [isOpen, setIsOpen]               = useState(false);
  const [isTyping, setIsTyping]           = useState(false);
  const [inputValue, setInputValue]       = useState('');
  const [showBubble, setShowBubble]       = useState(false);
  const [hasUnread, setHasUnread]         = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const inputRef      = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mountedRef    = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  /* ── Bubble delay ── */
  useEffect(() => {
    const tid = setTimeout(() => setShowBubble(true), BUBBLE_DELAY_MS);
    return () => clearTimeout(tid);
  }, []);

  /* ── Esc key ── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  /* ── Auto-focus input on open ── */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen]);

  /* ── Auto-scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Handlers ── */

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleSend = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || isTyping) return;

      const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text };
      const updatedMessages = [...messages, userMsg];

      setMessages(updatedMessages);
      setInputValue('');
      setShowQuickReplies(false);
      setIsTyping(true);
      onUserMessage?.();

      // API payload: 10 tin gần nhất
      const historyForAPI = updatedMessages
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const result = await fetchChatReply(historyForAPI, context);
        if (!mountedRef.current) return;

        setIsTyping(false);

        if (result.handoff) {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: 'assistant',
              content: result.reply,
              handoff: true,
              zaloLink: result.zaloLink,
            },
          ]);
        } else {
          // Typing animation
          const msgId = nextId();
          setMessages((prev) => [...prev, { id: msgId, role: 'assistant', content: '' }]);

          let idx = 0;
          const interval = setInterval(() => {
            if (!mountedRef.current) { clearInterval(interval); return; }
            idx++;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId ? { ...m, content: result.reply.slice(0, idx) } : m,
              ),
            );
            if (idx >= result.reply.length) clearInterval(interval);
          }, TYPING_MS);
        }
      } catch {
        if (!mountedRef.current) return;
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: 'Xin lỗi, mình đang gặp vấn đề. Bạn thử lại sau ít phút nhé!',
          },
        ]);
      }
    },
    [messages, isTyping, context, onUserMessage],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(inputValue);
      }
    },
    [handleSend, inputValue],
  );

  /* ══════════════════════════════ RENDER ══════════════════════════════ */

  return (
    <>
      {/* ── Floating bubble ── */}
      {!isOpen && showBubble && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Mở chat với Ánh — Trợ lý AI AZ NOSE"
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center"
        >
          {/* Badge unread */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              1
            </span>
          )}
          <MessageCircleIcon />
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat với Ánh — Trợ lý AI AZ NOSE"
          className={[
            'fixed z-50 flex flex-col bg-white shadow-2xl',
            // Mobile: fullscreen
            'inset-0',
            // Desktop: bottom-right panel
            'md:inset-auto md:bottom-6 md:right-6 md:w-[380px] md:h-[500px] md:rounded-2xl',
          ].join(' ')}
        >
          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 shrink-0">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 leading-none">Ánh</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">AI Trợ lý AZ NOSE</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Đóng chat"
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* ── Messages area ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[80%] space-y-2">
                  <div
                    className={[
                      'px-3 py-2 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-brand-100 text-brand-800 rounded-tr-sm'
                        : 'bg-neutral-100 text-neutral-800 rounded-tl-sm',
                    ].join(' ')}
                  >
                    {msg.content}
                    {/* Blinking cursor for empty last assistant msg (typing in progress) */}
                    {msg.role === 'assistant' && msg.content === '' && (
                      <span className="inline-block w-0.5 h-[13px] bg-brand-400 ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>

                  {/* Zalo CTA for handoff messages */}
                  {msg.handoff && msg.zaloLink && (
                    <a
                      href={msg.zaloLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0068FF] hover:bg-[#0055CC] text-white text-xs font-semibold transition-colors"
                    >
                      <ZaloIcon />
                      Chat Zalo ngay
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick replies — chỉ hiện sau lời chào đầu */}
            {showQuickReplies && !isTyping && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 rounded-full border border-brand-200 text-brand-600 text-xs hover:bg-brand-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input area ── */}
          <div className="shrink-0 border-t border-neutral-100 px-3 py-2.5 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isTyping}
              placeholder="Nhập câu hỏi… (Enter để gửi)"
              rows={1}
              aria-label="Nhập tin nhắn"
              className={[
                'flex-1 resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm leading-relaxed',
                'focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent',
                'placeholder:text-neutral-400 max-h-28',
                isTyping ? 'bg-neutral-50 text-neutral-400' : 'bg-white text-neutral-800',
              ].join(' ')}
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => handleSend(inputValue)}
              disabled={isTyping || !inputValue.trim()}
              aria-label="Gửi tin nhắn"
              className={[
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
                isTyping || !inputValue.trim()
                  ? 'bg-neutral-100 text-neutral-300'
                  : 'bg-brand-500 hover:bg-brand-600 text-white active:scale-95',
              ].join(' ')}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   Icons
══════════════════════════════════════════ */

function MessageCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <text x="2" y="18" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Z</text>
    </svg>
  );
}
