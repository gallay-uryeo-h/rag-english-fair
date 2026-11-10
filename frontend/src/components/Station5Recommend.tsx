import React, { useState } from 'react';
import type { RecommendResponse } from '../types';
import { Sparkles, Camera, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { marked } from 'marked';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

const CAREER_CHIPS = [
  { label: '간호 · 보건 · 의학', icon: '🩺' },
  { label: 'AI · 컴퓨터 · SW', icon: '💻' },
  { label: '미디어 · 영상 · 웹툰', icon: '🎬' },
  { label: '경영 · 마케팅 · 경제', icon: '📈' },
  { label: '교육 · 심리 · 상담', icon: '📚' },
  { label: '경찰 · 공공 · 사회정의', icon: '⚖️' },
  { label: '환경 · 생태 · 바이오', icon: '🌱' },
  { label: '세계문화 · 글로벌외교', icon: '🌍' },
];

export const Station5Recommend: React.FC<Props> = ({ onOpenImage }) => {
  const [careerInput, setCareerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setCareerInput(q);

    try {
      const res = await fetch(`/api/recommend-passages?career=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`추천 생성 실패 (상태 코드: ${res.status})`);
      const data: RecommendResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || '추천 결과를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
      {/* 부스 5 안내 배너 */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-4 md:p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur-xs w-fit px-2.5 py-1 rounded-full mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>Station 5 · My English Future</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1">
          나의 미래 꿈과 의령여고 영어 교과서의 만남!
        </h2>
        <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
          관심 있는 진로를 선택하면 의령여고 3개년 교과서 속 맞춤 본문과 탐구 주제를 제안해 드립니다. 인생 네컷 촬영 전 나만의 키워드를 찾아보세요! 📸
        </p>
      </div>

      {/* 진로 칩 선택기 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          관심 분야 / 진로를 선택해 보세요
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CAREER_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSearch(chip.label)}
              className="flex items-center gap-1.5 p-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs md:text-sm font-medium hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 transition-all text-left cursor-pointer"
            >
              <span className="text-base">{chip.icon}</span>
              <span className="truncate">{chip.label}</span>
            </button>
          ))}
        </div>

        {/* 직접 입력창 */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={careerInput}
            onChange={(e) => setCareerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(careerInput)}
            placeholder="직접 입력: 예) 게임 기획자, 승무원, 로봇공학, 패션디자이너"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button
            onClick={() => handleSearch(careerInput)}
            disabled={loading || !careerInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>탐색</span>
          </button>
        </div>
      </div>

      {/* 로딩 표시 */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-700">
            의령여고 3개년 교과서에서 &apos;{careerInput}&apos; 맞춤 본문을 분석하고 있습니다...
          </div>
          <div className="text-xs text-slate-400">
            교과서 지문과 학생부 연계 탐구 주제를 구성 중입니다.
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs md:text-sm">
          {error}
        </div>
      )}

      {/* 추천 결과 영역 */}
      {result && !loading && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                탐색 완료
              </span>
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                &apos;{result.career}&apos; 맞춤 미래 성장 리포트
              </h3>
            </div>
          </div>

          {/* 마크다운 렌더링 리포트 */}
          <div
            className="prose prose-sm prose-slate max-w-none leading-relaxed text-slate-700 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-3 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-slate-800 [&>h3]:mt-4"
            dangerouslySetInnerHTML={{ __html: marked.parse(result.report) }}
          />

          {/* 연계 교과서 본문 카드 */}
          {result.sources && result.sources.length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>연계 교과서 추천 본문 확인 (원문 E-Book)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.sources.map((src, i) => (
                  <div
                    key={i}
                    onClick={() => onOpenImage(`${src.title} · p.${src.page} 본문`, src.image_url)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-blue-600 mb-0.5">{src.title}</div>
                      <div className="text-xs text-slate-800 font-medium line-clamp-1">{src.unit_title}</div>
                      <div className="text-[11px] text-slate-400 mt-1">시작 페이지: p.{src.page}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
