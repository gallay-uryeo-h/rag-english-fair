import React, { useState } from 'react';
import { Sparkles, Search, BookOpen, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  onOpenImage?: (title: string, url: string) => void;
}

interface Candidate {
  subject: string;
  unit_title?: string;
  passage_title?: string;
  page_label?: string;
  page?: number;
  text: string;
  image_url?: string;
}

interface RecommendResponse {
  report: string;
  candidates: Candidate[];
}

const PRESET_TAGS = [
  '우주항공 · 로켓공학',
  '뇌과학 · 신경심리',
  '친환경 · 신재생에너지',
  '웹툰 · 글로벌 번역',
  '반려동물 행동치료',
  '사이버보안 · 양자암호',
  '건축디자인 · 스마트시티',
  '의료AI · 바이오신약',
];

export const AiCustomSeteukLab: React.FC<Props> = ({ onOpenImage }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('전체');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (targetKeyword?: string) => {
    const query = (targetKeyword ?? keyword).trim();
    if (!query) return;

    if (targetKeyword) setKeyword(targetKeyword);
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interest: query,
          grade: selectedGrade,
        }),
      });

      if (!res.ok) {
        throw new Error(`서버 응답 오류 (${res.status})`);
      }

      const data: RecommendResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('AI 세특 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result?.report) return;
    navigator.clipboard.writeText(result.report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-50/50 p-4 sm:p-5 space-y-4 rounded-b-2xl border-t border-slate-100">
      {/* 🚀 상단 인트로 배너 */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-violet-200">
            Gemini 3.5 AI × 7권 교과서 RAG
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
          어떤 진로든 100% 매칭! 나만의 AI 자유 탐구 세특 스튜디오
        </h3>
        <p className="text-xs text-violet-100 font-light leading-relaxed">
          정해진 전공 분류에 얽매이지 마세요. 본인의 희망 학과나 호기심 있는 단어 하나만 입력해도, 의령여고 3개년 교과서 7권(1,326개 청크)을 실시간 분석하여 최적의 학생부 세특 리포트를 생성합니다.
        </p>
      </div>

      {/* 🔍 검색 컨트롤 (입력창 + 학년 선택 + 태그 칩) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">과정 선택:</span>
          {['전체', '1학년', '2학년', '3학년'].map((gr) => (
            <button
              key={gr}
              type="button"
              onClick={() => setSelectedGrade(gr)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${selectedGrade === gr
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
            >
              {gr}
            </button>
          ))}
        </div>

        {/* 인풋 & 생성 버튼 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 우주항공, 뇌과학, 반려동물 치료, 웹툰 스토리텔링..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 font-medium placeholder:text-slate-400 text-slate-800"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 세특 생성</span>
              </>
            )}
          </button>
        </form>

        {/* 🏷️ 빠른 추천 진로 칩 */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold text-slate-500">인기 탐구 키워드 추천:</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleGenerate(tag)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ⏳ 로딩 스켈레톤 상태 */}
      {isLoading && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-200 rounded-full" />
            <div className="h-4 bg-violet-100 rounded w-48" />
          </div>
          <div className="space-y-2.5">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
            <div className="h-3 bg-slate-100 rounded w-4/6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="h-24 bg-slate-100 rounded-xl" />
            <div className="h-24 bg-slate-100 rounded-xl" />
          </div>
        </div>
      )}

      {/* ❌ 에러 메시지 */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {/* 🎯 생성 결과 리포트 */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* 1. 연결된 교과서 지문 원문 카드들 */}
          {result.candidates && result.candidates.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <BookOpen className="w-3.5 h-3.5 text-violet-600" />
                <h4 className="text-xs font-black text-slate-800 tracking-tight">
                  연계 교과서 지문 ({result.candidates.length}건 정밀 검색)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.candidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2 hover:border-violet-300 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                          후보 {idx + 1} · {cand.page_label || `p.${cand.page}`}
                        </span>
                        {cand.image_url && onOpenImage && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenImage(
                                `${cand.subject} (${cand.page_label || `p.${cand.page}`})`,
                                cand.image_url!
                              )
                            }
                            className="text-[10px] font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>원문 보기</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {cand.subject} {cand.unit_title ? `· ${cand.unit_title}` : ''}
                      </p>
                      {cand.passage_title && (
                        <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                          본문: &ldquo;{cand.passage_title}&rdquo;
                        </p>
                      )}
                      <p className="text-[10.5px] text-slate-500 line-clamp-2 mt-1.5 font-light leading-relaxed">
                        {cand.text}
                      </p>
                    </div>

                    {cand.image_url && onOpenImage && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenImage(
                            `${cand.subject} (${cand.page_label || `p.${cand.page}`})`,
                            cand.image_url!
                          )
                        }
                        className="w-full py-1.5 rounded-lg bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-700 text-[11px] font-bold border border-slate-200/70 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>교과서 E-Book 페이지 펼치기</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. AI 큐레이션 세특 리포트 본문 */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-violet-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  의령여고 AI 맞춤형 학생부(세특) 큐레이션 리포트
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>리포트 복사</span>
                  </>
                )}
              </button>
            </div>

            {/* 마크다운 형태 본문 출력 */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-2 font-normal font-sans">
              {result.report}
            </div>

            {/* 하단 팁 */}
            <div className="p-3 bg-violet-50/70 rounded-xl border border-violet-100 text-[11px] text-violet-800 leading-relaxed">
              💡 <strong>작성 팁:</strong> 생성된 세특 탐구 제안을 바탕으로 고등학교 입학 후 본문과 관련된 영문 학술 아티클을 1편 추가 독해하고 보고서로 제출하면, 학종 평가에서 <strong>&lsquo;전공적합성&rsquo;</strong>과 <strong>&lsquo;자기주도성&rsquo;</strong> 최고 등급을 획득할 수 있습니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};