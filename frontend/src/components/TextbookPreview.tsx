import React, { useState, useEffect } from 'react';
import type { GrammarRoadmapResponse, GrammarSubject } from '../types';
import { Search, BookOpen, Loader2, Info, Image as ImageIcon } from 'lucide-react';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

export const TextbookPreview: React.FC<Props> = ({ onOpenImage }) => {
  const [data, setData] = useState<GrammarRoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<'all' | '1학년' | '2학년' | '3학년'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/grammar-roadmap');
        if (!res.ok) throw new Error('로드맵 데이터를 불러올 수 없습니다.');
        const json: GrammarRoadmapResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterSubjects = (): GrammarSubject[] => {
    if (!data) return [];
    const q = searchQuery.trim().toLowerCase();

    return data.subjects
      .filter((subj) => {
        if (gradeFilter !== 'all' && subj.grade !== gradeFilter) return false;
        return true;
      })
      .map((subj) => {
        if (!q) return subj;
        const matchedUnits = subj.units
          .map((unit) => {
            const matchedPoints = unit.points.filter((pt) => {
              const fullText = `${pt.title} ${pt.tag} ${pt.key_sentence} ${pt.explanation} ${unit.unit_title} ${subj.subject}`.toLowerCase();
              return fullText.includes(q);
            });
            return { ...unit, points: matchedPoints };
          })
          .filter((unit) => unit.points.length > 0);

        return { ...subj, units: matchedUnits };
      })
      .filter((subj) => subj.units.length > 0);
  };

  const filteredSubjects = filterSubjects();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
      {/* 헤더 및 안내 문구 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800">
              의령여고 영어 교과서 6권 단원별 미리보기 (E-Book)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              각 학년별 교과서의 핵심 단원 내용과 교과서 원본 문법 페이지를 직접 확인하세요.
            </p>
          </div>
        </div>

        {/* 사용자 지정 필수 안내 멘트 */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {data?.notice || '교과서 문법 파트에 나오는 순서대로 정리되었으며 실제 수업과는 차이가 있을 수 있습니다.'}
          </span>
        </div>

        {/* 학년 필터 & 검색창 */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="flex p-1 bg-slate-100 rounded-xl shrink-0">
            {(['all', '1학년', '2학년', '3학년'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  gradeFilter === g ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {g === 'all' ? '전체' : g}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="문법 개념, 단원명 검색 (예: 관계사, 분사구문, 가정법)"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* 로딩 표시 */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin mx-auto" />
          <div className="text-xs text-slate-500">교과서 로드맵 데이터를 불러오는 중...</div>
        </div>
      )}

      {/* 교과서 목록 */}
      {!loading && (
        <div className="space-y-4">
          {filteredSubjects.map((subj, sIdx) => (
            <div key={sIdx} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
              {/* 과목 헤더 */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {subj.grade} {subj.semester}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {subj.curriculum_type}
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-800">{subj.subject}</h3>
                </div>
                <div className="text-xs text-slate-400 font-medium">{subj.publisher}</div>
              </div>
              <p className="text-xs text-slate-600">{subj.summary}</p>

              {/* 단원 목록 */}
              <div className="space-y-3 pt-1">
                {subj.units.map((unit, uIdx) => (
                  <div key={uIdx} className="rounded-xl border border-slate-150 p-3 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span>Unit {unit.unit_number}. {unit.unit_title}</span>
                      </div>
                      {unit.theme && <span className="text-[11px] text-slate-400 font-normal">({unit.theme})</span>}
                    </div>

                    {/* 문법 포인트 목록 */}
                    <div className="space-y-2">
                      {unit.points.map((pt, pIdx) => (
                        <div key={pIdx} className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                Point {pt.point_num}
                              </span>
                              <span className="text-xs font-bold text-slate-800">{pt.title}</span>
                              <span className="text-[11px] text-slate-400">#{pt.tag}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 shrink-0">p.{pt.page}</span>
                          </div>

                          <div className="text-xs text-blue-900 bg-blue-50/40 px-2 py-1 rounded font-mono">
                            “{pt.key_sentence}”
                          </div>
                          <div className="text-xs text-slate-600 leading-relaxed">{pt.explanation}</div>

                          {pt.image_path && (
                            <button
                              onClick={() =>
                                onOpenImage(`${subj.subject} · p.${pt.page} (${pt.title})`, `/${pt.image_path}`)
                              }
                              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>교과서 문법 원본 페이지 확인 (p.{pt.page})</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredSubjects.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-400">
              일치하는 교과서 문법 내용이 없습니다. 다른 키워드로 검색해 보세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
