import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  School,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { marked } from 'marked';

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  sources?: string[];
  timestamp?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

const STUDENT_QUESTIONS = [
  '중학교 영어랑 고등학교 영어는 어떻게 다른가요?',
  '중학교 때 영어를 잘 못했어도 의령여고에서 잘할 수 있을까요?',
  '수행평가는 주로 어떤 방식으로 진행되나요?',
  '영어 관련 동아리나 재미있는 학교 행사가 있나요?',
  '의령여고 영어 교과서 6권은 어떤 과목들인가요?',
];

const PARENT_QUESTIONS = [
  '2028 대입 개편안(내신 5등급제)에서 영어과는 어떻게 대비하나요?',
  '학생부 세특(세부능력 및 특기사항)은 어떻게 밀착 관리되나요?',
  '수능 절대평가 1등급을 위한 의령여고의 커리큘럼은 어떤가요?',
  '일반선택과 진로선택 과목의 평가 방식 차이가 궁금합니다.',
  '영어 시수가 고교 3개년간 어떻게 배정되나요?',
];

export const InstagramDmChatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialQuestion,
}) => {
  const [targetGroup, setTargetGroup] = useState<'student' | 'parent'>('student');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: '안녕하세요! 의령여고 영어 교육과정 Q&A AI 도우미 **@uryeo_qa_bot** 입니다. 🤖✨\n\n의령여고 3개년 영어 교과서, 2028 내신 5등급제 대비, 수행평가, 세특 보고서, 학교생활 등 무엇이든 편하게 물어보세요! 아래 추천 질문을 누르시면 바로 답변을 들으실 수 있습니다.',
      timestamp: '방금',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages, loading]);

  useEffect(() => {
    if (isOpen && initialQuestion) {
      handleSend(initialQuestion);
    }
  }, [isOpen, initialQuestion]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput('');
    const nowTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', text: q, timestamp: nowTime },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, target_db: 'faq' }),
      });

      if (!res.ok) throw new Error('응답을 가져오지 못했습니다.');
      const data = await res.json();

      const sourceLabels: string[] = Array.isArray(data.sources)
        ? data.sources
            .map((s: any) => (typeof s === 'string' ? s : s.title || s.subject_name || s.unit || ''))
            .filter(Boolean)
        : [];

      setMessages([
        ...newMessages,
        {
          role: 'bot',
          text: data.answer || data.reply || '답변을 불러오지 못했습니다.',
          sources: sourceLabels,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'bot',
          text: '죄송합니다. 서버 통신 중 일시적인 오류가 발생했습니다. 부스에 계신 의령여고 영어과 선생님께 직접 문의하시면 더욱 상세하고 친절한 상담을 받으실 수 있습니다! 😊',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'bot',
        text: '대화가 초기화되었습니다. 궁금하신 점을 언제든 다시 질문해 주세요! 🤖',
        timestamp: '방금',
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] sm:h-[85vh] border-t sm:border border-slate-100 animate-in slide-in-from-bottom duration-300 ease-out cursor-default"
      >
        {/* 📱 모바일 인스타 감성 드래그 핸들 바 */}
        <div className="w-full flex justify-center pt-2.5 pb-1 bg-white cursor-pointer" onClick={onClose} title="터치하여 닫기">
          <div className="w-10 h-1 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>

        {/* =========================================================================
            1. 인스타그램 DM 스타일 헤더 (계정 프로필 + 활동 중 표시)
            ========================================================================= */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* 봇 아바타 (인스타그램 DM 서클) */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 shadow-xs">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
              {/* 활동 중 초록불 */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            {/* 계정 정보 */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                  @uryeo_qa_bot
                </span>
                <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-purple-600" /> AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <span>의령여고 영어과 Q&A AI 도우미</span>
                <span>·</span>
                <span className="text-emerald-600 font-medium">활동 중</span>
              </p>
            </div>
          </div>

          {/* 우측 도구 (초기화, 닫기) */}
          <div className="flex items-center gap-1 text-slate-500">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="대화 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-700 hover:text-slate-900"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. 메시지 본문 영역
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/60 to-white">
          {/* 인스타그램 DM 프로필 인트로 카드 */}
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 border-b border-slate-100 mb-2">
            <div className="w-18 h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                <Bot className="w-9 h-9 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="text-base font-black text-slate-900 flex items-center justify-center gap-1">
                <span>의령여고 영어과 Q&A 챗봇</span>
                <Sparkles className="w-4 h-4 text-purple-600 fill-purple-600" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                @uryeo_qa_bot · Instagram AI 도우미
              </p>
            </div>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed bg-slate-100/80 px-3 py-1.5 rounded-full">
              📍 2026 선택과목 & 고교학점제 질문 전용 1:1 DM 창구
            </p>
          </div>

          {/* 질문 칩 카테고리 탭 (중3 학생 / 학부모) */}
          <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-purple-600" />
                <span>원클릭 추천 질문 리스트</span>
              </span>
              <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setTargetGroup('student')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-0.5 ${
                    targetGroup === 'student'
                      ? 'bg-white text-purple-700 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <School className="w-3 h-3" />
                  <span>중3 학생</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetGroup('parent')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-0.5 ${
                    targetGroup === 'parent'
                      ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>학부모</span>
                </button>
              </div>
            </div>

            {/* 가로 스크롤 추천 질문 칩 */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {(targetGroup === 'student' ? STUDENT_QUESTIONS : PARENT_QUESTIONS).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="shrink-0 text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 hover:border-purple-300 px-3 py-1.5 rounded-full transition-all cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* 대화 메시지 렌더링 */}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-2.5 items-end ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 mb-1 shadow-2xs">
                    <Bot className="w-4 h-4 text-cyan-300" />
                  </div>
                )}

                <div className={`max-w-[82%] sm:max-w-[78%] space-y-1`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60 shadow-2xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div
                        className="prose prose-xs sm:prose-sm max-w-none text-slate-800 [&_p]:my-1.5 [&_ul]:my-1.5 [&_li]:my-0.5 [&_strong]:text-purple-900 [&_a]:text-blue-600"
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(msg.text, { breaks: true }) as string,
                        }}
                      />
                    )}
                  </div>

                  {/* 타임스탬프 & 참고 문서 뱃지 */}
                  <div
                    className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.timestamp && <span>{msg.timestamp}</span>}
                    {msg.sources && msg.sources.length > 0 && (
                      <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-semibold border border-purple-100">
                        📚 {msg.sources.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI 응답 대기 로딩 인디케이터 (인스타그램 스타일 점 3개 바운스) */}
          {loading && (
            <div className="flex gap-2.5 items-end justify-start">
              <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 mb-1">
                <Bot className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="bg-slate-100 border border-slate-200/60 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="text-[11px] text-slate-500 font-medium ml-1.5">
                  AI 답변 생성 중...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================================
            3. 인스타그램 DM 스타일 하단 입력창
            ========================================================================= */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-100 shrink-0"
        >
          <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-100/90 focus-within:bg-white focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 rounded-full px-3.5 py-2 border border-slate-200 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="의령여고 영어과에 대해 메시지 보내기..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-30 disabled:from-slate-300 disabled:to-slate-300 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
              title="메시지 전송"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            의령여고 영어과 FAQ 및 2028 교육과정 자료를 바탕으로 Gemini AI가 실시간 답변합니다.
          </p>
        </form>
      </div>
    </div>
  );
};
