import React, { useState } from 'react';
import { Network, GitFork, BookOpen, ExternalLink, Sparkles } from 'lucide-react';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

export const GrowthRoadmap: React.FC<Props> = ({ onOpenImage }) => {
  const [mode, setMode] = useState<'flow' | 'lineage'>('flow');

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
      {/* 상단 탭 헤더 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800">
              의령여고 3개년 영어 성장 로드맵
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              중학교 문법 기초에서 수능·수시 실전 독해까지의 3년 연결 흐름을 확인하세요.
            </p>
          </div>
        </div>

        {/* 뷰 모드 토글 스위치 */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMode('flow')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${mode === 'flow' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Network className="w-4 h-4" />
            <span>3개년 교육과정 연계도</span>
          </button>
          <button
            onClick={() => setMode('lineage')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${mode === 'lineage' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <GitFork className="w-4 h-4" />
            <span>4대 핵심 문법 계통도</span>
          </button>
        </div>
      </div>

      {/* 모드 1: 3개년 교육과정 연계도 */}
      {mode === 'flow' && (
        <div className="space-y-4">
          {/* 1학년 카드 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  1학년 · 공통 기본
                </span>
                <span className="font-bold text-slate-800 text-sm md:text-base">
                  고교 기본 문해력 & 어휘·구문 다지기
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              중학교 문법을 고등학교 수능·내신형 긴 문장 구조에 맞게 체계화하고 기본 어휘력과 서술형 기초를 탄탄히 다집니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>공통영어1 (1학기)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '가정법 과거', page: 23, path: 'pages_cache/1학년_1학기_공통영어1_미래엔_p23.jpg' },
                    { tag: '사역·지각동사 5형식', page: 45, path: 'pages_cache/1학년_1학기_공통영어1_미래엔_p45.jpg' },
                    { tag: 'with 분사구문', page: 67, path: 'pages_cache/1학년_1학기_공통영어1_미래엔_p67.jpg' },
                    { tag: '수동태', page: 89, path: 'pages_cache/1학년_1학기_공통영어1_미래엔_p89.jpg' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenImage(`공통영어1 · p.${item.page} (${item.tag})`, `/${item.path}`)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span>{item.tag}</span>
                      <span className="text-[10px] text-slate-400">p.{item.page}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>공통영어2 (2학기)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '복합관계대명사', page: 25, path: 'pages_cache/1학년_2학기_공통영어2_미래엔_p25.jpg' },
                    { tag: 'It~that 강조구문', page: 47, path: 'pages_cache/1학년_2학기_공통영어2_미래엔_p47.jpg' },
                    { tag: '과거완료진행', page: 69, path: 'pages_cache/1학년_2학기_공통영어2_미래엔_p69.jpg' },
                    { tag: '동격의 that', page: 91, path: 'pages_cache/1학년_2학기_공통영어2_미래엔_p91.jpg' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenImage(`공통영어2 · p.${item.page} (${item.tag})`, `/${item.path}`)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span>{item.tag}</span>
                      <span className="text-[10px] text-slate-400">p.{item.page}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2학년 카드 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  2학년 · 일반선택 심화
                </span>
                <span className="font-bold text-slate-800 text-sm md:text-base">
                  복합 수식 구조 독해 & 수능 빈출 어법
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              긴 호흡의 문장을 빠르고 정확하게 분석하는 분사구문, 관계사절, 도치 등 고급 구문을 체화합니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>영어I (1학기)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '완료 분사구문', page: 23, path: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p23.jpg' },
                    { tag: '도치 구문', page: 47, path: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p47.jpg' },
                    { tag: '관계부사', page: 71, path: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p71.jpg' },
                    { tag: '조동사 have p.p.', page: 95, path: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p95.jpg' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenImage(`영어I · p.${item.page} (${item.tag})`, `/${item.path}`)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <span>{item.tag}</span>
                      <span className="text-[10px] text-slate-400">p.{item.page}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>영어II (2학기)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '혼합가정법', page: 23, path: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p23.jpg' },
                    { tag: '목적격보어 분사', page: 47, path: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p47.jpg' },
                    { tag: 'so ~ that 구문', page: 71, path: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p71.jpg' },
                    { tag: '부분부정·특수부정', page: 95, path: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p95.jpg' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenImage(`영어II · p.${item.page} (${item.tag})`, `/${item.path}`)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <span>{item.tag}</span>
                      <span className="text-[10px] text-slate-400">p.{item.page}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3학년 카드 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  3학년 · 진로선택 & 융합
                </span>
                <span className="font-bold text-slate-800 text-sm md:text-base">
                  진로 맞춤 심화 영어 & 글로벌 역량
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              수능 연계 심화 독해와 함께 다양한 세계 문화와 글로벌 사회 이슈를 영어로 토론·탐구하는 진로 연계 수업입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                  <span>영어 독해와 작문</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '무생물 주어구문', page: 25, path: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p25.jpg' },
                    { tag: '원형부정사 보어', page: 49, path: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p49.jpg' },
                    { tag: '전치사+관계대명사', page: 73, path: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p73.jpg' },
                    { tag: '독립분사구문', page: 97, path: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p97.jpg' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenImage(`영어 독해와 작문 · p.${item.page} (${item.tag})`, `/${item.path}`)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 hover:border-purple-400 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      <span>{item.tag}</span>
                      <span className="text-[10px] text-slate-400">p.{item.page}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/60">
                <div className="text-xs font-bold text-purple-800 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>세계 문화와 영어 (부스 2번 연계 🌍)</span>
                </div>
                <p className="text-[11px] text-purple-900 leading-relaxed mb-2">
                  세계 여러 나라의 문화 탐험 및 글로벌 커뮤니케이션 중심 과목입니다.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '글로벌 에티켓 표현', page: 25, path: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p25.jpg' },
                    { tag: '다문화 관용표현', page: 49, path: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p49.jpg' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenImage(`세계 문화와 영어 · p.${item.page} (${item.tag})`, `/${item.path}`)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-purple-200 text-xs text-purple-700 hover:border-purple-400 transition-colors cursor-pointer"
                    >
                      <span>{item.tag}</span>
                      <span className="text-[10px] text-purple-400">p.{item.page}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모드 2: 4대 핵심 문법 계통도 */}
      {mode === 'lineage' && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
            💡 하나의 문법 개념이 1학년부터 3학년까지 어떻게 심화되는지 한눈에 살펴보세요. 각 노드를 클릭하면 해당 학년 교과서 원본 사진이 열립니다.
          </div>

          {[
            {
              title: '1. 관계사 (Relative Clauses) 계통도',
              nodes: [
                { grade: '1학년', name: '복합관계대명사 (whatever/whoever)', book: '공통영어2 p.25', path: 'pages_cache/1학년_2학기_공통영어2_미래엔_p25.jpg' },
                { grade: '2학년', name: '관계부사 (where, when, why)', book: '영어I p.71', path: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p71.jpg' },
                { grade: '3학년', name: '전치사 + 관계대명사 (in which/to whom)', book: '독해와작문 p.73', path: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p73.jpg' },
              ],
            },
            {
              title: '2. 분사 및 분사구문 (Participles) 계통도',
              nodes: [
                { grade: '1학년', name: 'with + 목적어 + 분사 (동시동작)', book: '공통영어1 p.67', path: 'pages_cache/1학년_1학기_공통영어1_미래엔_p67.jpg' },
                { grade: '2학년', name: '완료 분사구문 (Having p.p.)', book: '영어I p.23', path: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p23.jpg' },
                { grade: '3학년', name: '독립분사구문 & 관용 분사표현', book: '독해와작문 p.97', path: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p97.jpg' },
              ],
            },
            {
              title: '3. 5형식 문장구조 (Sentence Patterns) 계통도',
              nodes: [
                { grade: '1학년', name: '사역·지각동사 + 원형부정사', book: '공통영어1 p.45', path: 'pages_cache/1학년_1학기_공통영어1_미래엔_p45.jpg' },
                { grade: '2학년', name: '목적격보어로 쓰이는 현재/과거분사', book: '영어II p.47', path: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p47.jpg' },
                { grade: '3학년', name: '원형부정사 보어 관용패턴', book: '독해와작문 p.49', path: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p49.jpg' },
              ],
            },
            {
              title: '4. 특수구문 (도치 / 강조 / 가정법) 계통도',
              nodes: [
                { grade: '1학년', name: 'It ~ that 강조구문 & 가정법 과거', book: '공통영어1 p.23', path: 'pages_cache/1학년_1학기_공통영어1_미래엔_p23.jpg' },
                { grade: '2학년', name: '부정어 도치 & 혼합가정법', book: '영어II p.23', path: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p23.jpg' },
                { grade: '3학년', name: '무생물 주어구문 (물주구문 독해)', book: '독해와작문 p.25', path: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p25.jpg' },
              ],
            },
          ].map((tree, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-2">
                {tree.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {tree.nodes.map((node, nIdx) => (
                  <button
                    key={nIdx}
                    onClick={() => onOpenImage(`${node.name} (${node.book})`, `/${node.path}`)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold text-blue-600 mb-1">{node.grade}</div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 leading-snug">
                      {node.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <span>{node.book}</span>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
