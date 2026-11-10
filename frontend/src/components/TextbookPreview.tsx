import React, { useState, useEffect } from 'react';
import type { GrammarRoadmapResponse, GrammarSubject } from '../types';
import {
  Search,
  Loader2,
  Info,
  Image as ImageIcon,
  ExternalLink,
  BookmarkCheck,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { getPassageStartInfo, getGrammarStartInfo } from '../utils/passageMapper';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

// 6권 교과서 표지(p1) 및 기본 정보 매핑
const TEXTBOOK_COVERS = [
  {
    key: '공통영어1',
    grade: '1학년',
    semester: '1학기',
    title: '공통영어1',
    publisher: '미래엔 (김선영)',
    coverImage: '/pages_cache/1학년_1학기_공통영어1_미래엔_p1.jpg',
    color: 'from-blue-600 to-indigo-700',
    badgeBg: 'bg-blue-100 text-blue-700',
    unitsCount: 4,
  },
  {
    key: '공통영어2',
    grade: '1학년',
    semester: '2학기',
    title: '공통영어2',
    publisher: '미래엔 (김선영)',
    coverImage: '/pages_cache/1학년_2학기_공통영어2_미래엔_p1.jpg',
    color: 'from-cyan-600 to-blue-700',
    badgeBg: 'bg-cyan-100 text-cyan-800',
    unitsCount: 4,
  },
  {
    key: '영어Ⅰ',
    grade: '2학년',
    semester: '1학기',
    title: '영어Ⅰ',
    publisher: '엔이능률 (김성곤)',
    coverImage: '/pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p1.jpg',
    color: 'from-emerald-600 to-teal-700',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    unitsCount: 5,
  },
  {
    key: '영어 독해와 작문',
    grade: '2학년',
    semester: '2학기',
    title: '영어독해와작문',
    publisher: '미래엔 (김대진)',
    coverImage: '/pages_cache/2학년_2학기_영어독해와작문_미래엔_p1.jpg',
    color: 'from-amber-600 to-orange-700',
    badgeBg: 'bg-amber-100 text-amber-800',
    unitsCount: 6,
  },
  {
    key: '영어Ⅱ',
    grade: '3학년',
    semester: '1학기',
    title: '영어Ⅱ',
    publisher: '능률 (김성곤)',
    coverImage: '/pages_cache/3학년_1학기_영어Ⅱ_능률_p1.jpg',
    color: 'from-purple-600 to-violet-700',
    badgeBg: 'bg-purple-100 text-purple-800',
    unitsCount: 5,
  },
  {
    key: '세계 문화와 영어',
    grade: '3학년',
    semester: '1학기',
    title: '세계 문화와 영어',
    publisher: '비상 (권혁승)',
    coverImage: '/pages_cache/3학년_1학기_세계_문화와_영어_비상_p1.jpg',
    color: 'from-rose-600 to-pink-700',
    badgeBg: 'bg-rose-100 text-rose-800',
    unitsCount: 6,
  },
];

export const TextbookPreview: React.FC<Props> = ({ onOpenImage }) => {
  const [data, setData] = useState<GrammarRoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<'all' | '1학년' | '2학년' | '3학년'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 선택된 교과서 (기본값: 공통영어1)
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('공통영어1');

  // 단원별 아코디언 열림 상태 관리 (key: "과목_단원번호", value: boolean)
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

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

  // 아코디언 토글
  const toggleUnit = (subjSubject: string, unitNum: number) => {
    const key = `${subjSubject}_${unitNum}`;
    setOpenUnits((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 모든 단원 열기/닫기
  const setAllUnitsOpen = (subj: GrammarSubject, open: boolean) => {
    const nextState = { ...openUnits };
    subj.units.forEach((u) => {
      nextState[`${subj.subject}_${u.unit_number}`] = open;
    });
    setOpenUnits(nextState);
  };

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

  // 검색어가 있을 때는 검색 결과 모두 보여주고, 검색어가 없을 때는 선택된 교과서만 집중 표시
  const displayedSubjects = searchQuery.trim()
    ? filteredSubjects
    : filteredSubjects.filter((s) => s.subject.includes(selectedSubjectKey));

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
      {/* 헤더 및 안내 문구 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800">
            의령여고 영어 교과서 6권 E-Book 미리보기 📖
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            교과서 표지를 선택하면 단원별 아코디언이 펼쳐지며, 본문 및 문법 첫 페이지를 앞뒤로 넘겨보실 수 있습니다.
          </p>
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
                {g === 'all' ? '전체 학년' : g}
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

      {/* 📚 6권 교과서 표지 캐러셀 / 그리드 셀렉터 */}
      {!searchQuery && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>교과서 선택 (표지를 누르면 단원 내용이 아래에 열립니다)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {TEXTBOOK_COVERS.filter(
              (c) => gradeFilter === 'all' || c.grade === gradeFilter
            ).map((cover) => {
              const isSelected = selectedSubjectKey === cover.key;
              return (
                <div
                  key={cover.key}
                  onClick={() => setSelectedSubjectKey(cover.key)}
                  className={`group relative rounded-xl p-2 transition-all cursor-pointer flex flex-col items-center text-center border-2 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-md scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* 교과서 표지 썸네일 이미지 */}
                  <div className="relative w-full aspect-3/4 rounded-lg overflow-hidden bg-slate-100 shadow-xs mb-2 border border-slate-200/80">
                    <img
                      src={cover.coverImage}
                      alt={cover.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-1 left-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${cover.badgeBg}`}>
                        {cover.grade}
                      </span>
                    </div>

                    {/* 표지 원본 돋보기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenImage(`${cover.title} · 표지 (p.1)`, cover.coverImage);
                      }}
                      title="표지 원본 보기"
                      className="absolute bottom-1 right-1 p-1 rounded-md bg-black/60 hover:bg-blue-600 text-white backdrop-blur-xs transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 교과서 타이틀 & 출판사 */}
                  <div className="w-full min-w-0">
                    <div className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                      {cover.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {cover.publisher.split(' ')[0]} · {cover.unitsCount}개 단원
                    </div>
                  </div>

                  {/* 선택 표시 인디케이터 바 */}
                  {isSelected && (
                    <div className="w-8 h-1 bg-blue-600 rounded-full mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin mx-auto" />
          <div className="text-xs text-slate-500">교과서 로드맵 데이터를 불러오는 중...</div>
        </div>
      )}

      {/* 📖 단원별 아코디언 내용 영역 */}
      {!loading && (
        <div className="space-y-4">
          {displayedSubjects.map((subj, sIdx) => {
            return (
              <div
                key={sIdx}
                className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3 transition-all"
              >
                {/* 교과서 헤더 & 전체 펼치기/접기 버튼 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {subj.grade} {subj.semester}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {subj.curriculum_type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{subj.publisher}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-800">{subj.subject}</h3>
                    <p className="text-xs text-slate-600">{subj.summary}</p>
                  </div>

                  {/* 일괄 펼치기/접기 버튼 */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setAllUnitsOpen(subj, true)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    >
                      모두 펼치기
                    </button>
                    <button
                      onClick={() => setAllUnitsOpen(subj, false)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    >
                      모두 접기
                    </button>
                  </div>
                </div>

                {/* 단원별 아코디언 리스트 */}
                <div className="space-y-2.5 pt-1">
                  {subj.units.map((unit, uIdx) => {
                    const unitKey = `${subj.subject}_${unit.unit_number}`;
                    // 기본적으로 첫 번째 단원만 열어두거나 사용자가 클릭한 상태
                    const isOpen = searchQuery.trim() ? true : (openUnits[unitKey] ?? (uIdx === 0));
                    const passageInfo = getPassageStartInfo(subj.subject, unit.unit_number);
                    const grammarInfo = getGrammarStartInfo(subj.subject, unit.unit_number);

                    return (
                      <div
                        key={uIdx}
                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                          isOpen ? 'border-blue-200 bg-white shadow-xs' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                        }`}
                      >
                        {/* 아코디언 헤더 바 (클릭 시 토글) */}
                        <div
                          onClick={() => toggleUnit(subj.subject, unit.unit_number)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                              isOpen ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {unit.unit_number}
                            </span>

                            <div className="truncate">
                              <span className="text-xs md:text-sm font-bold text-slate-800">
                                Unit {unit.unit_number}. {unit.unit_title}
                              </span>
                              {unit.theme && (
                                <span className="text-[11px] text-slate-400 ml-1.5 font-normal hidden sm:inline">
                                  ({unit.theme})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 우측: 첫 페이지 퀵 버튼 및 아코디언 화살표 */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                            {grammarInfo && (
                              <button
                                onClick={() =>
                                  onOpenImage(
                                    `${subj.subject} Unit ${unit.unit_number} 문법 파트 · p.${grammarInfo.page} (${grammarInfo.firstPointTitle})`,
                                    `/${grammarInfo.imagePath}`
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                                <span>문법 p.{grammarInfo.page}</span>
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
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <span>본문 p.{passageInfo.page}</span>
                                <ExternalLink className="w-3 h-3 text-blue-500" />
                              </button>
                            )}

                            {/* 아코디언 펼침/접힘 화살표 */}
                            <button
                              onClick={() => toggleUnit(subj.subject, unit.unit_number)}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors ml-0.5 cursor-pointer"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                                  isOpen ? 'rotate-180 text-blue-600' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* 아코디언 바디 (부드러운 애니메이션) */}
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 space-y-2 bg-slate-50/40">
                            {/* 문법 포인트 목록 */}
                            <div className="space-y-2">
                              {unit.points.map((pt, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                        Point {pt.point_num}
                                      </span>
                                      <span className="text-xs font-bold text-slate-800">{pt.title}</span>
                                      <span className="text-[11px] text-slate-400 font-medium">#{pt.tag}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                                      p.{pt.page}
                                    </span>
                                  </div>

                                  <div className="text-xs text-blue-900 bg-blue-50/50 px-2.5 py-1.5 rounded-lg font-mono">
                                    “{pt.key_sentence}”
                                  </div>
                                  <div className="text-xs text-slate-600 leading-relaxed pl-1">
                                    {pt.explanation}
                                  </div>

                                  {pt.image_path && (
                                    <div className="pt-1 flex items-center justify-end">
                                      <button
                                        onClick={() =>
                                          onOpenImage(
                                            `${subj.subject} Unit ${unit.unit_number} Point ${pt.point_num} · p.${pt.page} (${pt.title})`,
                                            `/${pt.image_path}`
                                          )
                                        }
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                                      >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>해당 문법 원본 페이지 열기 (p.{pt.page})</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {displayedSubjects.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-400">
              일치하는 교과서 내용이 없습니다. 다른 검색어로 검색해 보세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
