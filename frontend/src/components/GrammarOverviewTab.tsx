import React, { useState, useEffect, useMemo } from 'react';
import type { GrammarRoadmapResponse, GrammarSubject } from '../types';
import {
  Sparkles,
  BookOpen,
  BookmarkCheck,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Layers,
  GraduationCap
} from 'lucide-react';
import { getPassageStartInfo, getGrammarStartInfo } from '../utils/passageMapper';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

export const GrammarOverviewTab: React.FC<Props> = ({ onOpenImage }) => {
  const [data, setData] = useState<GrammarRoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<'all' | '1학년' | '2학년' | '3학년'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

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

  // 전체 태그 목록 추출
  const allTags = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.subjects.forEach((subj) => {
      subj.units.forEach((unit) => {
        unit.points.forEach((pt) => {
          if (pt.tag) set.add(pt.tag);
        });
      });
    });
    return Array.from(set).sort();
  }, [data]);

  // 통계 계산
  const stats = useMemo(() => {
    if (!data) return { subjects: 0, units: 0, points: 0 };
    let units = 0;
    let points = 0;
    data.subjects.forEach((s) => {
      units += s.units.length;
      s.units.forEach((u) => {
        points += u.points.length;
      });
    });
    return {
      subjects: data.subjects.length,
      units,
      points,
    };
  }, [data]);

  // 필터링 적용
  const filteredSubjects: GrammarSubject[] = useMemo(() => {
    if (!data) return [];
    const q = searchQuery.trim().toLowerCase();

    return data.subjects
      .filter((subj) => {
        if (gradeFilter !== 'all' && subj.grade !== gradeFilter) return false;
        return true;
      })
      .map((subj) => {
        const matchedUnits = subj.units
          .map((unit) => {
            const matchedPoints = unit.points.filter((pt) => {
              if (selectedTag !== 'all' && pt.tag !== selectedTag) return false;
              if (q) {
                const full = `${pt.title} ${pt.tag} ${pt.key_sentence} ${pt.explanation} ${unit.unit_title} ${subj.subject}`.toLowerCase();
                return full.includes(q);
              }
              return true;
            });
            return { ...unit, points: matchedPoints };
          })
          .filter((unit) => unit.points.length > 0);

        return { ...subj, units: matchedUnits };
      })
      .filter((subj) => subj.units.length > 0);
  }, [data, gradeFilter, selectedTag, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-teal-600 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/15 backdrop-blur-xs w-fit px-3 py-1 rounded-full">
          <GraduationCap className="w-4 h-4 text-amber-300" />
          <span>의령여자고등학교 영어과 교육과정</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight">
          3개년 교과서 핵심 문법 한눈에 조망하기 📐
        </h2>
        <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
          공통영어1부터 세계문화와영어까지 6권 전 단원의 <strong>문법 파트 첫 페이지(Structures 원본)</strong>와 핵심 포인트를 체계적으로 비교·탐색하세요.
        </p>

        {/* 통계 배지 */}
        <div className="flex items-center gap-3 pt-2 text-xs text-blue-100 font-medium flex-wrap">
          <span className="bg-white/20 px-2.5 py-1 rounded-lg">교과서 <strong>{stats.subjects}</strong>권</span>
          <span className="bg-white/20 px-2.5 py-1 rounded-lg">수록 단원 <strong>{stats.units}</strong>개</span>
          <span className="bg-white/20 px-2.5 py-1 rounded-lg">핵심 문법 포인트 <strong>{stats.points}</strong>개</span>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs leading-relaxed flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>안내: </strong>
          {data?.notice || '본 로드맵은 교과서 문법 파트(Structures / Grammar in Reading)에 수록된 순서대로 정리되었으며 실제 수업 진도와는 차이가 있을 수 있습니다.'}
        </div>
      </div>

      {/* 필터 및 검색 바 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* 학년 필터 */}
          <div className="flex p-1 bg-slate-100 rounded-xl shrink-0">
            {(['all', '1학년', '2학년', '3학년'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  gradeFilter === g ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {g === 'all' ? '전체 학년' : g}
              </button>
            ))}
          </div>

          {/* 뷰 모드 토글 */}
          <div className="flex p-1 bg-slate-100 rounded-xl shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'matrix' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>조망 매트릭스</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>단원 카드뷰</span>
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="문법 개념, 태그, 예문 검색 (예: 관계사, 분사구문, 가정법, 도치)"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* 태그 칩 필터 */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-all cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 태그
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 로딩 표시 */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-500">
          교과서 문법 데이터를 불러오는 중입니다...
        </div>
      )}

      {/* 뷰 모드 1: 조망 매트릭스 (한눈에 단원별 문법 첫 페이지와 포인트 조망) */}
      {!loading && viewMode === 'matrix' && (
        <div className="space-y-4">
          {filteredSubjects.map((subj, sIdx) => (
            <div key={sIdx} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
              {/* 과목 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    {subj.grade} {subj.semester}
                  </span>
                  <h3 className="font-bold text-slate-800 text-base">{subj.subject}</h3>
                  <span className="text-xs text-slate-400 font-medium">({subj.publisher})</span>
                </div>
                <div className="text-xs text-slate-500">{subj.curriculum_type}</div>
              </div>

              {/* 단원 행 리스트 */}
              <div className="space-y-2.5">
                {subj.units.map((unit, uIdx) => {
                  const grammarInfo = getGrammarStartInfo(subj.subject, unit.unit_number);
                  const passageInfo = getPassageStartInfo(subj.subject, unit.unit_number);

                  return (
                    <div
                      key={uIdx}
                      className="p-3 rounded-xl border border-slate-150 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2"
                    >
                      {/* 단원 상단 및 첫페이지 열기 버튼 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {unit.unit_number}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800">
                              Unit {unit.unit_number}. {unit.unit_title}
                            </span>
                            {unit.theme && (
                              <span className="text-[11px] text-slate-400 ml-1.5 font-normal">
                                · {unit.theme}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 첫페이지 액션 버튼들 */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          {grammarInfo && (
                            <button
                              onClick={() =>
                                onOpenImage(
                                  `${subj.subject} Unit ${unit.unit_number} 문법 파트 · p.${grammarInfo.page} (${grammarInfo.firstPointTitle})`,
                                  `/${grammarInfo.imagePath}`
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>문법 파트 첫페이지 (p.{grammarInfo.page})</span>
                            </button>
                          )}

                          {passageInfo && (
                            <button
                              onClick={() =>
                                onOpenImage(
                                  `${subj.subject} Unit ${unit.unit_number} 본문 · p.${passageInfo.page} (${passageInfo.passageTitle})`,
                                  `/${passageInfo.imagePath}`
                                )
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 text-xs font-medium transition-all cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3 text-blue-500" />
                              <span>본문 p.{passageInfo.page}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 수록된 문법 포인트 목록 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {unit.points.map((pt, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() =>
                              pt.image_path &&
                              onOpenImage(
                                `${subj.subject} Unit ${unit.unit_number} Point ${pt.point_num} · p.${pt.page} (${pt.title})`,
                                `/${pt.image_path}`
                              )
                            }
                            className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer group space-y-1"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                Point {pt.point_num}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600">
                                p.{pt.page} ↗
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 line-clamp-1">
                              {pt.title}
                            </div>
                            <div className="text-[11px] text-blue-900 bg-blue-50/50 px-2 py-1 rounded font-mono truncate">
                              {pt.key_sentence}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 뷰 모드 2: 단원 카드뷰 (심층 설명 및 세부 내용 포함) */}
      {!loading && viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredSubjects.map((subj, sIdx) => (
            <div key={sIdx} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {subj.grade} {subj.semester}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{subj.publisher}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{subj.subject}</h3>
                </div>
              </div>

              <div className="space-y-3">
                {subj.units.map((unit, uIdx) => {
                  const grammarInfo = getGrammarStartInfo(subj.subject, unit.unit_number);

                  return (
                    <div key={uIdx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Unit {unit.unit_number}. {unit.unit_title}
                          </span>
                        </div>
                        {grammarInfo && (
                          <button
                            onClick={() =>
                              onOpenImage(
                                `${subj.subject} Unit ${unit.unit_number} 문법 파트 · p.${grammarInfo.page}`,
                                `/${grammarInfo.imagePath}`
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold cursor-pointer"
                          >
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>문법 파트 첫 페이지 (p.{grammarInfo.page})</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {unit.points.map((pt, pIdx) => (
                          <div key={pIdx} className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                  Point {pt.point_num}
                                </span>
                                <span className="text-xs font-bold text-slate-800">{pt.title}</span>
                                <span className="text-[10px] text-slate-400">#{pt.tag}</span>
                              </div>
                              <span className="text-[11px] text-slate-400">p.{pt.page}</span>
                            </div>
                            <div className="text-xs text-blue-900 bg-blue-50/50 p-2 rounded font-mono">
                              “{pt.key_sentence}”
                            </div>
                            <div className="text-xs text-slate-600 leading-relaxed">{pt.explanation}</div>
                            {pt.image_path && (
                              <button
                                onClick={() =>
                                  onOpenImage(
                                    `${subj.subject} Unit ${unit.unit_number} · p.${pt.page} (${pt.title})`,
                                    `/${pt.image_path}`
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer pt-1"
                              >
                                <span>교과서 원본 페이지 확인 (p.{pt.page})</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 결과 없음 */}
      {!loading && filteredSubjects.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-400">
          검색 조건에 맞는 교과서 문법 내용이 없습니다.
        </div>
      )}
    </div>
  );
};
