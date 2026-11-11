import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Send, Loader2, Sparkles, User, GraduationCap, School } from 'lucide-react';
import { marked } from 'marked';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

const STUDENT_QUESTIONS = [
  '중학교 영어랑 고등학교 영어는 어떻게 다른가요?',
  '중학교 때 영어를 잘 못했어도 의령여고에서 잘할 수 있을까요?',
  '수행평가는 주로 어떤 방식으로 진행되나요?',
  '영어 관련 동아리나 재미있는 학교 행사가 있나요?',
];

const PARENT_QUESTIONS = [
  '2028 대입 개편안(내신 5등급제)에서 영어과는 어떻게 대비하나요?',
  '학생부 세특(세부능력 및 특기사항)은 어떻게 밀착 관리되나요?',
  '수능 절대평가 1등급을 위한 의령여고의 커리큘럼은 어떤가요?',
  '일반선택과 진로선택 과목의 평가 방식 차이가 궁금합니다.',
];

export const SchoolLifeQA: React.FC<Props> = ({ onOpenImage }) => {
  const [targetGroup, setTargetGroup] = useState<'student' | 'parent'>('student');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: '안녕하세요! 2026 의령여고 고교학점제 박람회 영어과 부스 생활 & 진로 Q&A 도우미입니다. ✈️\n\n중3 학생과 학부모님께서 의령여고 영어과 수업, 평가, 학교생활에 대해 궁금하신 점을 무엇이든 편하게 물어보세요! 위의 추천 질문 칩을 누르시면 바로 답변을 확인하실 수 있습니다.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: q }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });

      if (!res.ok) throw new Error('응답을 가져오지 못했습니다.');
      const data = await res.json();

      setMessages([
        ...newMessages,
        {
          role: 'bot',
          text: data.reply || '답변을 불러오지 못했습니다.',
          sources: data.sources,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'bot',
          text: '죄송합니다. 서버 통신 중 오류가 발생했습니다. 부스에 계신 의령여고 영어과 선생님께 직접 문의하시면 더욱 상세하고 친절한 상담을 받으실 수 있습니다! 😊',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden max-w-3xl mx-auto w-full">
      {/* 중3 학생 vs 학부모 질문 칩 서브탭 */}
      <div className="p-3 bg-white border-b border-slate-200 shrink-0 space-y-2">
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTargetGroup('student')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              targetGroup === 'student' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>🎒 중3 학생 추천 질문</span>
          </button>
          <button
            onClick={() => setTargetGroup('parent')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              targetGroup === 'parent' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>🎓 학부모 추천 질문</span>
          </button>
        </div>

        {/* 칩 목록 */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(targetGroup === 'student' ? STUDENT_QUESTIONS : PARENT_QUESTIONS).map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-all shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 채팅 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
              }`}
            >
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <div
                  className="prose prose-xs md:prose-sm prose-slate max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-2 [&>strong]:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                />
              )}

              {/* 출처 카드 (FAQ 참고자료) */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-150 space-y-1">
                  <div className="text-[11px] font-bold text-slate-400">참고 자료 및 출처:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => src.image_url && onOpenImage(`${src.title} · p.${src.page}`, src.image_url)}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <span>{src.title}</span>
                        {src.page > 0 && <span>(p.{src.page})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs text-slate-500 shadow-xs flex items-center gap-1.5">
              <span>의령여고 학교생활 Q&A 데이터베이스를 검색 중입니다...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="의령여고 영어과나 학교생활에 대해 질문하세요..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

