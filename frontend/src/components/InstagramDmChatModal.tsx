import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { marked } from 'marked';
import { getUserProfile } from '../utils/userProfile';
import { logChatQuery } from '../services/firestoreService';

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

// 🌟 질문별 지능형 후속 질문 매핑 (Follow-up Questions)
const FOLLOWUP_MAP: Record<string, string[]> = {
  default: [
    '2022 개정 고교 영어과는 어떤 과목들을 배우나요?',
    '고교학점제에서 영어 과목 학점 이수 기준(미이수 제도)은 무엇인가요?',
    '2028 대입 개편안(내신 5등급제)에서 고교 영어 평가는 어떻게 산출되나요?',
    '일반선택, 진로선택, 융합선택 과목은 어떤 기준으로 골라야 하나요?',
  ],
  과목: [
    '일반선택과 진로선택 영어 과목의 평가 방식 차이가 궁금해요.',
    '진로선택 과목(심화 영어 등)을 많이 들으면 대입에 유리한가요?',
    '영어Ⅰ을 안 듣고 심화 영어나 영어Ⅱ를 바로 들을 수도 있나요?',
  ],
  학점: [
    '만약 영어 과목에서 미이수(I등급) 위기가 오면 어떻게 도와주나요?',
    '고교 3년 동안 영어는 총 몇 학점까지 필수로 들어야 하나요?',
    '수업 출석률 2/3 기준은 어떻게 계산하나요?',
  ],
  등급: [
    '사회·과학 융합선택은 절대평가라는데 영어는 왜 5등급이 나오나요?',
    '내신 5등급제에서 1등급(상위 10%)을 받기 위한 준비 전략은?',
    '성적표에 표준편차가 빠지고 성취도별 분포비율만 나오는 이유는?',
  ],
  수행평가: [
    '학생부 세특(세부능력특기사항)에는 주로 어떤 내용이 적히나요?',
    '말하기 발표 수행평가가 두려운 학생은 어떻게 대비하면 좋을까요?',
    '지필평가와 수행평가 비율은 학교마다 다른가요?',
  ],
  공통영어: [
    '중학교 때 영어 B~C 성취도였어도 고1 영어에서 1~2등급 도약이 가능한가요?',
    '기본영어1·2는 공통영어1·2와 어떤 점이 다른가요?',
    '고1 첫 시험 전 겨울방학에는 문법과 단어 중 무엇이 더 급한가요?',
  ],
  세특: [
    '의학/보건 계열 진로를 희망할 때 추천하는 영어 선택과목과 세특 주제는?',
    'IT/AI/소프트웨어 진로와 영어 교과서를 연결하는 탐구 주제 예시가 있나요?',
    '수업 중 영어 보고서나 에세이 작성은 어떤 과정으로 진행되나요?',
  ],
};

function getFollowupSuggestions(lastQuery?: string): string[] {
  if (!lastQuery) return FOLLOWUP_MAP.default;
  const q = lastQuery.toLowerCase();
  if (q.includes('과목') || q.includes('선택') || q.includes('체계') || q.includes('편제')) {
    return FOLLOWUP_MAP.과목;
  }
  if (q.includes('학점') || q.includes('미이수') || q.includes('이수') || q.includes('출석')) {
    return FOLLOWUP_MAP.학점;
  }
  if (q.includes('5등급') || q.includes('등급') || q.includes('상대평가') || q.includes('내신') || q.includes('대입')) {
    return FOLLOWUP_MAP.등급;
  }
  if (q.includes('수행평가') || q.includes('지필') || q.includes('발표') || q.includes('에세이')) {
    return FOLLOWUP_MAP.수행평가;
  }
  if (q.includes('공통영어') || q.includes('중학교') || q.includes('난이도') || q.includes('기초')) {
    return FOLLOWUP_MAP.공통영어;
  }
  if (q.includes('세특') || q.includes('학생부') || q.includes('진로') || q.includes('학종')) {
    return FOLLOWUP_MAP.세특;
  }
  return FOLLOWUP_MAP.default;
}

export const InstagramDmChatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialQuestion,
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>(FOLLOWUP_MAP.default);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: '안녕하세요! 2026 고교학점제 박람회 영어과 부스 Q&A AI 도우미 **@uryeo_qa_bot** 입니다. 🤖✨\n\n2022 개정 고교 영어 교육과정, 선택과목(일반·진로·융합), 2028 내신 5등급제, 교과서 특성 및 세특 준비 등 무엇이든 편하게 물어보세요! 하단 추천 질문을 누르시면 바로 답변을 확인하실 수 있습니다.\n\n*(ℹ️ **안내**: 본 챗봇의 정보는 2022 개정 국가 교육과정과 일반 검색으로 확인 가능한 공통 기준을 바탕으로 안내되며, 특정 학교의 고유 규정이 아닙니다. 실제 개설 과목과 세부 운영은 진학하시는 각 고등학교의 교육과정 편제표를 확인하시기 바랍니다)*\n\n*(💡 입력하신 질문과 관심 키워드는 인생네컷 부스 연동 및 통계 분석에 활용됩니다)*',
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
    // 모바일/태블릿 키패드 자동 닫기 (blur 처리하여 응답 읽기 편하도록 함)
    inputRef.current?.blur();

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

      const botReply = data.answer || data.reply || '답변을 불러오지 못했습니다.';

      setMessages([
        ...newMessages,
        {
          role: 'bot',
          text: botReply,
          sources: sourceLabels,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // 💡 후속 추천 질문 갱신
      setCurrentSuggestions(getFollowupSuggestions(q));

      // 📊 질문 수집: 4컷사진 부스 및 분석/통계용 로깅
      const user = getUserProfile();
      logChatQuery({
        username: user?.username,
        displayName: user?.displayName,
        targetGroup: 'student',
        query: q,
        answerSnippet: botReply,
      });
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
    setCurrentSuggestions(FOLLOWUP_MAP.default);
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
                <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden">
                  <img
                    src="/bot_avatar.jpg"
                    alt="@uryeo_qa_bot"
                    className="w-full h-full object-cover"
                  />
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
            <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden">
                <img
                  src="/bot_avatar.jpg"
                  alt="@uryeo_qa_bot"
                  className="w-full h-full object-cover"
                />
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

          {/* 대화 메시지 렌더링 */}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-2.5 items-end ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 overflow-hidden shrink-0 mb-1 shadow-2xs border border-purple-200">
                    <img
                      src="/bot_avatar.jpg"
                      alt=""
                      className="w-full h-full object-cover"
                    />
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
              <div className="w-7 h-7 rounded-full bg-slate-900 overflow-hidden shrink-0 mb-1 border border-purple-200">
                <img
                  src="/bot_avatar.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
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
            3. 하단 추천 후속 질문 칩 & 인스타그램 DM 입력창
            ========================================================================= */}
        <div className="border-t border-slate-100 bg-white shrink-0">
          {/* 가로 스크롤 추천 질문 칩 (답변 기반 지능형 후속 질문) */}
          <div className="px-3 pt-2 pb-1 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg shrink-0 flex items-center gap-1 border border-purple-100">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>추천 질문</span>
            </span>
            {currentSuggestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 text-[11px] font-semibold text-slate-700 bg-slate-100/90 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200/80 px-3 py-1.5 rounded-full transition-all cursor-pointer disabled:opacity-40 active:scale-95 shadow-3xs"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 pt-2"
          >
            <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-100/90 focus-within:bg-white focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 rounded-full px-3.5 py-2 border border-slate-200 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="고교 영어 교육과정, 과목 선택, 5등급제 등 질문하기..."
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
            <p className="text-[10px] text-slate-400 text-center mt-1.5 leading-tight">
              본 정보는 2022 개정 교육과정 공통 기준이며 특정 고교 고유 규정이 아닙니다. (질문은 통계 분석에 활용됩니다)
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
