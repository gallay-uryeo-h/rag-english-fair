import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Compass,
  Volume2,
  BookOpen,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DeepEnglishMbtiTab } from './DeepEnglishMbtiTab';
import { VocabListenTab } from './VocabListenTab';
import { TextbookBrowse2Layer } from './TextbookBrowse2Layer';
import { SeteukGeneratorTab } from './SeteukGeneratorTab';

interface Props {
  onOpenImage: (title: string, imageUrl: string) => void;
  viewMode?: 'feed' | 'grid';
  onSelectGridPost?: (key: 'mbti' | 'vocab' | 'textbook' | 'seteuk') => void;
  // 외부 앵커 참조
  feedRefs: {
    homeRef: React.RefObject<HTMLDivElement | null>;
    mbtiRef: React.RefObject<HTMLDivElement | null>;
    vocabRef: React.RefObject<HTMLDivElement | null>;
    textbookRef: React.RefObject<HTMLDivElement | null>;
    seteukRef: React.RefObject<HTMLDivElement | null>;
  };
  expandedSections: {
    mbti: boolean;
    vocab: boolean;
    textbook: boolean;
    seteuk: boolean;
  };
  onToggleSection: (key: 'mbti' | 'vocab' | 'textbook' | 'seteuk') => void;
  onScrollTo: (key: 'home' | 'mbti' | 'vocab' | 'textbook' | 'seteuk') => void;
}

interface StoryItem {
  id: string;
  key: 'mbti' | 'vocab' | 'textbook' | 'seteuk';
  title: string;
  tag: string;
  color: string;
  icon: React.ReactNode;
}

export const LiveHomeFeed: React.FC<Props> = ({
  onOpenImage,
  viewMode = 'feed',
  onSelectGridPost,
  feedRefs,
  expandedSections,
  onToggleSection,
  onScrollTo,
}) => {
  // 인스타그램 좋아요 상태 관리
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    mbti: true,
    vocab: false,
    textbook: true,
    seteuk: false,
  });

  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({
    mbti: true,
    textbook: true,
  });

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 💬 인스타그램 스타일 댓글 관리 (초기 실감나는 학생 댓글 포함)
  const [comments, setComments] = useState<Record<string, Array<{ id: string; user: string; text: string; time: string }>>>({
    mbti: [
      { id: 'c1', user: 'ur_student_jenny', text: 'ENFP 나왔는데 여행 영어 지문 완전 찰떡이네요!! ✈️', time: '12분 전' },
      { id: 'c2', user: 'english_lover_08', text: '친구랑 같이 해봤는데 둘 다 너무 잘 맞아서 소름돋음 ㅋㅋㅋ', time: '5분 전' },
    ],
    vocab: [
      { id: 'c3', user: 'quiz_master_kim', text: '5번 문제 소리만 듣기 진짜 스릴 넘쳐요 🎧 백점 맞았습니다!', time: '20분 전' },
    ],
    textbook: [
      { id: 'c4', user: 'study_with_me_ur', text: '교과서 표지 누르니까 뷰어 바로 뜨는 거 완전 신기해요 👍', time: '35분 전' },
      { id: 'c5', user: 'future_doctor_25', text: '3학년 세계문화와 영어 지문 퀄리티 대박이네요!', time: '18분 전' },
    ],
    seteuk: [
      { id: 'c6', user: 'dream_nurse_h', text: '간호 보건 탐구 주제 보고서 작성할 때 큰 도움 됐어요 감사합니다 🩺', time: '40분 전' },
    ],
  });

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({
    mbti: '',
    vocab: '',
    textbook: '',
    seteuk: '',
  });

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const newComment = {
      id: `comm_${Date.now()}`,
      user: 'ur_guest_visitor',
      text,
      time: '방금 전',
    };
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // 상단 스토리 목록
  const stories: StoryItem[] = [
    {
      id: 'story-mbti',
      key: 'mbti',
      title: '본문 MBTI',
      tag: '성향진단',
      color: 'from-pink-500 via-rose-500 to-amber-500',
      icon: <Compass className="w-5 h-5 text-white" />,
    },
    {
      id: 'story-vocab',
      key: 'vocab',
      title: '소리 퀴즈',
      tag: '단어듣기',
      color: 'from-purple-600 via-indigo-600 to-blue-500',
      icon: <Volume2 className="w-5 h-5 text-white" />,
    },
    {
      id: 'story-textbook',
      key: 'textbook',
      title: '교과서 6권',
      tag: '3×2뷰어',
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      icon: <BookOpen className="w-5 h-5 text-white" />,
    },
    {
      id: 'story-seteuk',
      key: 'seteuk',
      title: '세특 치트키',
      tag: '학종보고서',
      color: 'from-amber-500 via-orange-500 to-yellow-500',
      icon: <Lightbulb className="w-5 h-5 text-white" />,
    },
  ];

  return (
    <div ref={feedRefs.homeRef} className="w-full space-y-4 pb-12">
      {/* =========================================================================
          📸 1. 인스타그램 스토리 캐러셀 (Instagram Story Bar)
          ========================================================================= */}
      <section className="bg-white border-b border-slate-200 py-3 px-3 overflow-hidden shadow-2xs">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-1">
          {/* 의령여고 공식 스토리 */}
          <div
            onClick={() => onScrollTo('home')}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-black text-xs shadow-inner">
                  의령여고
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 tracking-tight">내 스토리</span>
          </div>

          {/* 4대 코너 스토리 버튼 (터치 시 해당 피드로 스크롤 + 자동 아코디언 오픈) */}
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => onScrollTo(story.key)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div
                className={`w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr ${story.color} transition-transform group-hover:scale-105 active:scale-95`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    {story.icon}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-800 tracking-tight">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 🌟 2. 인스타그램 3열 그리드 뷰 모드 (Instagram Profile / Explore Grid View) */}
      {viewMode === 'grid' ? (
        <section className="bg-white border-y border-slate-200 p-2 sm:p-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>📸 포스트 탐색 그리드 (4대 코너)</span>
            </span>
            <span className="text-[11px] text-slate-400">사진을 터치하면 바로 해당 코너로 이동</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 그리드 1: MBTI */}
            <div
              onClick={() => {
                if (onSelectGridPost) onSelectGridPost('mbti');
                else onScrollTo('mbti');
              }}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-2xs border border-slate-100"
            >
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80"
                alt="MBTI 포스트"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                <div className="flex items-center justify-end">
                  <Heart className="w-4 h-4 text-white fill-white/80" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white leading-tight">MBTI별 본문 추천</h4>
                  <p className="text-[11px] text-slate-200 truncate mt-0.5">8문항 성향 정밀 진단</p>
                </div>
              </div>
            </div>

            {/* 그리드 2: 단어 릴스 */}
            <div
              onClick={() => {
                if (onSelectGridPost) onSelectGridPost('vocab');
                else onScrollTo('vocab');
              }}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-2xs border border-slate-100"
            >
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
                alt="단어 소리 퀴즈 포스트"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                <div className="flex items-center justify-end">
                  <Volume2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white leading-tight">단어 미리보기</h4>
                  <p className="text-[11px] text-slate-200 truncate mt-0.5">TTS 소리만 듣기 퀴즈</p>
                </div>
              </div>
            </div>

            {/* 그리드 3: 교과서 6권 */}
            <div
              onClick={() => {
                if (onSelectGridPost) onSelectGridPost('textbook');
                else onScrollTo('textbook');
              }}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-2xs border border-slate-100"
            >
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80"
                alt="교과서 6권 대공개 포스트"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                <div className="flex items-center justify-end">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white leading-tight">교과서 6권 대공개</h4>
                  <p className="text-[11px] text-slate-200 truncate mt-0.5">3×2 표지 ➔ 단원 레이어</p>
                </div>
              </div>
            </div>

            {/* 그리드 4: 세특 발전소 */}
            <div
              onClick={() => {
                if (onSelectGridPost) onSelectGridPost('seteuk');
                else onScrollTo('seteuk');
              }}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-2xs border border-slate-100"
            >
              <img
                src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80"
                alt="세특 발전소 포스트"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                <div className="flex items-center justify-end">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white leading-tight">세특 치트키 발전소</h4>
                  <p className="text-[11px] text-slate-200 truncate mt-0.5">8대 진로 학생부 가이드</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* =========================================================================
              📸 3. 단일 무한 피드 모드 (인라인 아코디언)
              ========================================================================= */}
      <article
        ref={feedRefs.mbtiRef}
        className="bg-white border-y border-slate-200/90 overflow-hidden shadow-2xs scroll-mt-14"
      >
        {/* 포스트 상단 계정 정보 */}
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                  🧭
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">ur_english_mbti</span>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                  성향 진단 공식
                </span>
              </div>
              <p className="text-[10px] text-slate-500">의령여고 1부스 · 16 MBTI 매칭</p>
            </div>
          </div>
          <button className="text-slate-400 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 포스트 메인 히어로 카드 (실제 고화질 배경 사진 적용) */}
        <div
          onClick={() => onToggleSection('mbti')}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between cursor-pointer group select-none overflow-hidden"
        >
          {/* 고화질 사진 배경 + 어두운 오버레이 */}
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80"
            alt="영어 공부와 성향 탐색"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.72]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />

          <div className="space-y-1.5 relative z-10 pt-4">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              MBTI별 본문 추천
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow-sm">
              나의 성향과 꼭 맞는 의령여고 영어 교과서 본문을 찾아보세요!
            </p>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-white/20 relative z-10">
            <span className="text-[11px] text-slate-300 font-medium">
              {expandedSections.mbti ? '▲ 탭하여 테스트 창 접기' : '▼ 탭하여 바로 테스트 시작하기'}
            </span>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
              <span>{expandedSections.mbti ? '진단창 접기' : '진단 펼치기'}</span>
              {expandedSections.mbti ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* 🌟 아코디언 인라인 진단창 (피드 안에서 바로 열림) */}
        {expandedSections.mbti && (
          <div className="border-t border-blue-200 bg-slate-50 animate-in slide-in-from-top-2 duration-300">
            <DeepEnglishMbtiTab onOpenImage={onOpenImage} />
          </div>
        )}

        {/* 포스트 소셜 바 */}
        <div className="px-3.5 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-800">
              <button onClick={() => toggleLike('mbti')} className="transition-transform active:scale-125">
                <Heart
                  className={`w-6 h-6 ${
                    likedPosts.mbti ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
                  }`}
                />
              </button>
              <button onClick={() => onToggleSection('mbti')} className="hover:text-slate-600">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('링크가 복사되었습니다!');
                }}
                className="hover:text-slate-600"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button onClick={() => toggleSave('mbti')}>
              <Bookmark className={`w-6 h-6 ${savedPosts.mbti ? 'fill-slate-900 text-slate-900' : ''}`} />
            </button>
          </div>
          <div className="pt-2 text-xs font-bold text-slate-900">
            좋아요 {(384 + (likedPosts.mbti ? 1 : 0)).toLocaleString()}개
          </div>
          <div className="pt-1 text-xs">
            <span className="font-bold text-slate-900 mr-2">ur_english_mbti</span>
            <span className="text-slate-800">
              나의 성격과 딱 맞는 교과서 지문을 만나면 독해가 즐거운 탐구로 바뀝니다. 지금 바로 진단해 보세요! ✨
            </span>
          </div>

          {/* 💬 댓글 목록 미리보기 */}
          {comments.mbti && comments.mbti.length > 0 && (
            <div className="pt-2 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">
                댓글 {comments.mbti.length}개 모두 보기
              </span>
              {comments.mbti.map((c) => (
                <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 mr-1.5">{c.user}</span>
                    <span className="text-slate-700">{c.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* 💬 인스타그램 스타일 실시간 댓글 입력창 */}
          <div className="pt-3 pb-1 border-t border-slate-100 mt-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                  U
                </div>
              </div>
              <input
                type="text"
                value={commentInputs.mbti || ''}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, mbti: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment('mbti');
                  }
                }}
                placeholder="댓글 달기..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              />
              {commentInputs.mbti?.trim() && (
                <button
                  onClick={() => handleAddComment('mbti')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
                >
                  게시
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* =========================================================================
          📸 3. 인피드 아코디언 포스트 2: 소리 단어 퀴즈 (Vocab Listen)
          ========================================================================= */}
      <article
        ref={feedRefs.vocabRef}
        className="bg-white border-y border-slate-200/90 overflow-hidden shadow-2xs scroll-mt-14"
      >
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-purple-500 via-indigo-600 to-blue-500">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                  🎧
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">ur_audio_vocab</span>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded">
                  원어민 TTS 챌린지
                </span>
              </div>
              <p className="text-[10px] text-slate-500">어휘 레벨 측정 스테이션 · 6권 30세트</p>
            </div>
          </div>
          <button className="text-slate-400 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 포스트 메인 히어로 카드 (헤드폰/오디오 고화질 사진 배경) */}
        <div
          onClick={() => onToggleSection('vocab')}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between cursor-pointer group select-none overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
            alt="영어 듣기와 단어 퀴즈"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.68]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />

          <div className="space-y-1.5 relative z-10 pt-4">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              단어 미리보기
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow-sm">
              1~4번 문맥 어휘 확인 + 5번 문제는 단어를 가리고 오직 소리만 듣고 맞추기!
            </p>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-white/20 relative z-10">
            <span className="text-[11px] text-slate-300 font-medium">
              {expandedSections.vocab ? '▲ 탭하여 퀴즈 창 접기' : '▼ 탭하여 단어 퀴즈 풀기'}
            </span>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
              <span>{expandedSections.vocab ? '퀴즈 접기' : '퀴즈 풀기'}</span>
              {expandedSections.vocab ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* 🌟 아코디언 인라인 단어 퀴즈창 */}
        {expandedSections.vocab && (
          <div className="border-t border-purple-200 bg-slate-50 animate-in slide-in-from-top-2 duration-300">
            <VocabListenTab />
          </div>
        )}

        <div className="px-3.5 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-800">
              <button onClick={() => toggleLike('vocab')} className="transition-transform active:scale-125">
                <Heart
                  className={`w-6 h-6 ${
                    likedPosts.vocab ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
                  }`}
                />
              </button>
              <button onClick={() => onToggleSection('vocab')} className="hover:text-slate-600">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('링크가 복사되었습니다!');
                }}
                className="hover:text-slate-600"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button onClick={() => toggleSave('vocab')}>
              <Bookmark className={`w-6 h-6 ${savedPosts.vocab ? 'fill-slate-900 text-slate-900' : ''}`} />
            </button>
          </div>
          <div className="pt-2 text-xs font-bold text-slate-900">
            좋아요 {(295 + (likedPosts.vocab ? 1 : 0)).toLocaleString()}개
          </div>
          <div className="pt-1 text-xs">
            <span className="font-bold text-slate-900 mr-2">ur_audio_vocab</span>
            <span className="text-slate-800">
              눈으로만 외우는 단어는 이제 그만! 원어민 발음을 듣고 만점에 도전해 보세요. 🎧
            </span>
          </div>

          {/* 💬 댓글 목록 미리보기 */}
          {comments.vocab && comments.vocab.length > 0 && (
            <div className="pt-2 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">
                댓글 {comments.vocab.length}개 모두 보기
              </span>
              {comments.vocab.map((c) => (
                <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 mr-1.5">{c.user}</span>
                    <span className="text-slate-700">{c.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* 💬 인스타그램 스타일 실시간 댓글 입력창 */}
          <div className="pt-3 pb-1 border-t border-slate-100 mt-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                  U
                </div>
              </div>
              <input
                type="text"
                value={commentInputs.vocab || ''}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, vocab: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment('vocab');
                  }
                }}
                placeholder="댓글 달기..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              />
              {commentInputs.vocab?.trim() && (
                <button
                  onClick={() => handleAddComment('vocab')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
                >
                  게시
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* =========================================================================
          📸 4. 인피드 아코디언 포스트 3: 3×2 교과서 탐색 (Textbook Showcase)
          ========================================================================= */}
      <article
        ref={feedRefs.textbookRef}
        className="bg-white border-y border-slate-200/90 overflow-hidden shadow-2xs scroll-mt-14"
      >
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                  📚
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">ur_textbook_viewer</span>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  144개 섹션 정밀 검증
                </span>
              </div>
              <p className="text-[10px] text-slate-500">3개년 교육과정 전시관 · 6권 교과서</p>
            </div>
          </div>
          <button className="text-slate-400 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div
          onClick={() => onToggleSection('textbook')}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between cursor-pointer group select-none overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1000&q=80"
            alt="도서관 교과서"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.65]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />

          <div className="space-y-1 relative z-10 pt-4">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              의령여고 3개년 교과서 6권 대공개!
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-light">
              표지를 누르면 단원 안으로 쏙! 듣기·말하기·읽기·문법·쓰기 원본 E-Book을 바로 열람하세요.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 relative z-10">
            <span className="text-[11px] text-slate-300">
              {expandedSections.textbook ? '▲ 탭하여 교과서 뷰어 접기' : '▼ 탭하여 6권 교과서 펼쳐보기'}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <span>{expandedSections.textbook ? '뷰어 접기' : '교과서 열람'}</span>
              {expandedSections.textbook ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* 🌟 아코디언 인라인 교과서 뷰어 */}
        {expandedSections.textbook && (
          <div className="border-t border-emerald-200 bg-slate-50 animate-in slide-in-from-top-2 duration-300">
            <TextbookBrowse2Layer onOpenImage={onOpenImage} />
          </div>
        )}

        <div className="px-3.5 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-800">
              <button onClick={() => toggleLike('textbook')} className="transition-transform active:scale-125">
                <Heart
                  className={`w-6 h-6 ${
                    likedPosts.textbook ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
                  }`}
                />
              </button>
              <button onClick={() => onToggleSection('textbook')} className="hover:text-slate-600">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('링크가 복사되었습니다!');
                }}
                className="hover:text-slate-600"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button onClick={() => toggleSave('textbook')}>
              <Bookmark className={`w-6 h-6 ${savedPosts.textbook ? 'fill-slate-900 text-slate-900' : ''}`} />
            </button>
          </div>
          <div className="pt-2 text-xs font-bold text-slate-900">
            좋아요 {(512 + (likedPosts.textbook ? 1 : 0)).toLocaleString()}개
          </div>
          <div className="pt-1 text-xs">
            <span className="font-bold text-slate-900 mr-2">ur_textbook_viewer</span>
            <span className="text-slate-800">
              공통영어부터 세계문화와 영어까지, 144개 모든 파트의 학습 내용이 100% 정밀 검증되어 있습니다.
            </span>
          </div>

          {/* 💬 댓글 목록 미리보기 */}
          {comments.textbook && comments.textbook.length > 0 && (
            <div className="pt-2 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">
                댓글 {comments.textbook.length}개 모두 보기
              </span>
              {comments.textbook.map((c) => (
                <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 mr-1.5">{c.user}</span>
                    <span className="text-slate-700">{c.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* 💬 인스타그램 스타일 실시간 댓글 입력창 */}
          <div className="pt-3 pb-1 border-t border-slate-100 mt-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                  U
                </div>
              </div>
              <input
                type="text"
                value={commentInputs.textbook || ''}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, textbook: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment('textbook');
                  }
                }}
                placeholder="댓글 달기..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              />
              {commentInputs.textbook?.trim() && (
                <button
                  onClick={() => handleAddComment('textbook')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
                >
                  게시
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* =========================================================================
          📸 5. 인피드 아코디언 포스트 4: 세특 발전소 (Seteuk Generator)
          ========================================================================= */}
      <article
        ref={feedRefs.seteukRef}
        className="bg-white border-y border-slate-200/90 overflow-hidden shadow-2xs scroll-mt-14"
      >
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                  💡
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">ur_seteuk_powerhouse</span>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                  대입 학생부 종합 대비
                </span>
              </div>
              <p className="text-[10px] text-slate-500">진로 & 세특 전략 연구소 · 8대 전공</p>
            </div>
          </div>
          <button className="text-slate-400 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div
          onClick={() => onToggleSection('seteuk')}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between cursor-pointer group select-none overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80"
            alt="노트 공부 세특"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.60]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />

          <div className="space-y-1 relative z-10 pt-4">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              교과서 지문이 나만의 세특 치트키로 변신!
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-light">
              희망 진로(의학·AI·미디어·교육) 맞춤형 탐구 주제와 학생부 기재 예시를 확인하세요.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 relative z-10">
            <span className="text-[11px] text-slate-300">
              {expandedSections.seteuk ? '▲ 탭하여 세특 발전소 접기' : '▼ 탭하여 진로별 세특 아이디어 보기'}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md group-hover:bg-amber-500 group-hover:text-white transition-all">
              <span>{expandedSections.seteuk ? '아이디어 접기' : '세특 보기'}</span>
              {expandedSections.seteuk ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* 🌟 아코디언 인라인 세특 발전소창 */}
        {expandedSections.seteuk && (
          <div className="border-t border-amber-200 bg-slate-50 animate-in slide-in-from-top-2 duration-300">
            <SeteukGeneratorTab onOpenImage={onOpenImage} />
          </div>
        )}

        <div className="px-3.5 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-800">
              <button onClick={() => toggleLike('seteuk')} className="transition-transform active:scale-125">
                <Heart
                  className={`w-6 h-6 ${
                    likedPosts.seteuk ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
                  }`}
                />
              </button>
              <button onClick={() => onToggleSection('seteuk')} className="hover:text-slate-600">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('링크가 복사되었습니다!');
                }}
                className="hover:text-slate-600"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button onClick={() => toggleSave('seteuk')}>
              <Bookmark className={`w-6 h-6 ${savedPosts.seteuk ? 'fill-slate-900 text-slate-900' : ''}`} />
            </button>
          </div>
          <div className="pt-2 text-xs font-bold text-slate-900">
            좋아요 {(647 + (likedPosts.seteuk ? 1 : 0)).toLocaleString()}개
          </div>
          <div className="pt-1 text-xs">
            <span className="font-bold text-slate-900 mr-2">ur_seteuk_powerhouse</span>
            <span className="text-slate-800">
              단순한 해석을 넘어선 깊이 있는 탐구! 의령여고의 탄탄한 대입 학종 노하우를 담았습니다.
            </span>
          </div>

          {/* 💬 댓글 목록 미리보기 */}
          {comments.seteuk && comments.seteuk.length > 0 && (
            <div className="pt-2 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">
                댓글 {comments.seteuk.length}개 모두 보기
              </span>
              {comments.seteuk.map((c) => (
                <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 mr-1.5">{c.user}</span>
                    <span className="text-slate-700">{c.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* 💬 인스타그램 스타일 실시간 댓글 입력창 */}
          <div className="pt-3 pb-1 border-t border-slate-100 mt-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                  U
                </div>
              </div>
              <input
                type="text"
                value={commentInputs.seteuk || ''}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, seteuk: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment('seteuk');
                  }
                }}
                placeholder="댓글 달기..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              />
              {commentInputs.seteuk?.trim() && (
                <button
                  onClick={() => handleAddComment('seteuk')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
                >
                  게시
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
      </>
      )}

      {/* 피드 최하단 안내 */}
      <div className="text-center py-6 space-y-1.5">
        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto text-xs font-bold">
          ✨
        </div>
        <p className="text-xs font-bold text-slate-700">모든 소식을 다 확인했습니다</p>
        <p className="text-[10px] text-slate-400">
          2025 의령여자고등학교 영어과 교육과정 박람회 인피드 앱
        </p>
      </div>
    </div>
  );
};
