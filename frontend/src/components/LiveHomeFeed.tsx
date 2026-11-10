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
  ArrowRight,
} from 'lucide-react';

interface Props {
  onNavigate: (tab: 'mbti' | 'vocab' | 'textbook' | 'seteuk') => void;
  onOpenImage?: (title: string, imageUrl: string) => void;
}

interface StoryItem {
  id: string;
  tabKey: 'mbti' | 'vocab' | 'textbook' | 'seteuk';
  title: string;
  tag: string;
  color: string;
  icon: React.ReactNode;
}

interface FeedPost {
  id: string;
  tabKey: 'mbti' | 'vocab' | 'textbook' | 'seteuk';
  accountName: string;
  badge: string;
  location: string;
  profileImgText: string;
  categoryTag: string;
  title: string;
  subtitle: string;
  summary: string;
  actionText: string;
  actionIcon: React.ReactNode;
  bgGradient: string;
  heroEmoji: string;
  likesCount: number;
  initialLiked?: boolean;
  caption: string;
  tags: string[];
  commentsCount: number;
  timeAgo: string;
  previewImage?: string;
  previewTitle?: string;
}

export const LiveHomeFeed: React.FC<Props> = ({ onNavigate }) => {
  // 인스타그램 좋아요 상태 관리
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    post1: true,
    post2: false,
    post3: false,
    post4: false,
  });

  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({
    post1: true,
    post3: false,
  });

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. 상단 인스타그램 스토리 목록
  const stories: StoryItem[] = [
    {
      id: 'story-mbti',
      tabKey: 'mbti',
      title: '본문 MBTI',
      tag: '성향진단',
      color: 'from-pink-500 via-rose-500 to-amber-500',
      icon: <Compass className="w-5 h-5 text-white" />,
    },
    {
      id: 'story-vocab',
      tabKey: 'vocab',
      title: '소리 퀴즈',
      tag: '단어듣기',
      color: 'from-purple-600 via-indigo-600 to-blue-500',
      icon: <Volume2 className="w-5 h-5 text-white" />,
    },
    {
      id: 'story-textbook',
      tabKey: 'textbook',
      title: '교과서 6권',
      tag: '3×2뷰어',
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      icon: <BookOpen className="w-5 h-5 text-white" />,
    },
    {
      id: 'story-seteuk',
      tabKey: 'seteuk',
      title: '세특 치트키',
      tag: '학종보고서',
      color: 'from-amber-500 via-orange-500 to-yellow-500',
      icon: <Lightbulb className="w-5 h-5 text-white" />,
    },
  ];

  // 2. 인스타그램 메인 피드 포스트 (핵심 4대 코너)
  const posts: FeedPost[] = [
    {
      id: 'post1',
      tabKey: 'mbti',
      accountName: 'ur_english_mbti',
      badge: '성향 진단 공식',
      location: '의령여고 영어 페스티벌 1부스',
      profileImgText: '🧭',
      categoryTag: '16 MBTI × 31개 단원 매칭',
      title: 'E vs I, S vs N, T vs F, J vs P',
      subtitle: '8문항 정밀 검사로 나만의 교과서 본문을 찾아보세요!',
      summary:
        '‘다정함의 진화론’, ‘다크 패턴의 진실’, ‘소음 차단 과학’ 중 나와 가장 케미가 폭발하는 지문은 무엇일까요? 검사 후 실제 본문 E-Book 페이지가 바로 열립니다.',
      actionText: '나의 본문 MBTI 테스트하기',
      actionIcon: <Compass className="w-4 h-4" />,
      bgGradient: 'from-blue-600 via-indigo-700 to-purple-800',
      heroEmoji: '🧭',
      likesCount: 384,
      initialLiked: true,
      caption:
        '고등학교 영어가 어렵게만 느껴지나요? 나의 성격과 딱 맞는 매력적인 지문을 만나면 독해가 즐거운 탐구로 바뀝니다. 지금 바로 8문항을 풀고 내 영어 영혼의 짝꿍 지문을 찾아보세요! ✨',
      tags: ['#의령여고', '#영어MBTI', '#2025선택과목', '#맞춤본문', '#영어페어'],
      commentsCount: 42,
      timeAgo: '12분 전',
    },
    {
      id: 'post2',
      tabKey: 'vocab',
      accountName: 'ur_audio_vocab',
      badge: '원어민 TTS 챌린지',
      location: '어휘력 레벨 측정 스테이션',
      profileImgText: '🎧',
      categoryTag: '6권 × 5세트 (150문항)',
      title: '단어가 뜰 때 원어민 소리가 팡팡!',
      subtitle: '마지막 5번 문제는 단어를 가리고 오직 소리만 듣고 맞추기!',
      summary:
        '시각과 청각을 동시에 자극하는 3지선다 어휘 퀴즈! 교과서 핵심 어휘의 문맥적 쓰임과 실전 수능 빈출 어휘력을 즉석에서 측정하고 성취도 배지를 받아가세요.',
      actionText: '단어 소리 퀴즈 시작하기',
      actionIcon: <Volume2 className="w-4 h-4" />,
      bgGradient: 'from-purple-700 via-indigo-800 to-slate-900',
      heroEmoji: '🎧',
      likesCount: 295,
      caption:
        '눈으로만 외우는 단어는 이제 그만! 화면을 보며 발음을 듣고, 마지막 5번 문제는 오직 소리에만 집중해 맞추는 리스닝 챌린지 🎧 친구와 함께 만점에 도전해보세요!',
      tags: ['#어휘레벨테스트', '#원어민발음', '#소리듣고맞추기', '#고교어휘완성'],
      commentsCount: 19,
      timeAgo: '45분 전',
    },
    {
      id: 'post3',
      tabKey: 'textbook',
      accountName: 'ur_textbook_viewer',
      badge: '144개 섹션 전수 검증',
      location: '3개년 교육과정 전시관',
      profileImgText: '📚',
      categoryTag: '3×2 표지 그리드 ➔ 2레이어 단원 탐색',
      title: '의령여고 3개년 교과서 6권 대공개!',
      subtitle: '공통영어1·2부터 영어Ⅰ·Ⅱ, 독해와작문, 세계문화와 영어까지',
      summary:
        '각 교과서의 표지를 터치하면 단원 목록으로 쏙! 듣기, 말하기, 읽기, 문법, 쓰기 버튼을 누르면 실제 교과서 고화질 원본 페이지가 팝업되어 입학 전 내용을 미리 엿볼 수 있습니다.',
      actionText: '3×2 교과서 쇼케이스 열기',
      actionIcon: <BookOpen className="w-4 h-4" />,
      bgGradient: 'from-emerald-700 via-teal-800 to-slate-900',
      heroEmoji: '📚',
      likesCount: 512,
      caption:
        '의령여고에서 배우는 6권의 교과서를 2레이어로 깔끔하게 정리했습니다. 144개 모든 파트(듣기, 말하기, 읽기, 문법, 쓰기)의 실제 학습 내용이 100% 정밀 반영되어 있습니다.',
      tags: ['#의령여고교과서', '#공통영어', '#영어독해와작문', '#세계문화와영어', '#EBook뷰어'],
      commentsCount: 68,
      timeAgo: '2시간 전',
    },
    {
      id: 'post4',
      tabKey: 'seteuk',
      accountName: 'ur_seteuk_powerhouse',
      badge: '대입 학생부 종합 대비',
      location: '진로 & 세특 전략 연구소',
      profileImgText: '💡',
      categoryTag: '교과서 본문 연계 탐구보고서',
      title: '교과서 지문이 나만의 세특 치트키로 변신!',
      subtitle: '희망 진로(의학·AI·미디어·교육) 맞춤형 탐구 주제 & 보고서 예시',
      summary:
        '수업 시간에 배운 교과서 본문을 나의 진로와 어떻게 연결할까요? 8대 전공 분야별 심화 탐구 질문과 실제 학교생활기록부 교과세특 기재 예시 문구를 바로 확인하세요.',
      actionText: '진로별 세특 아이디어 보기',
      actionIcon: <Lightbulb className="w-4 h-4" />,
      bgGradient: 'from-amber-600 via-orange-700 to-slate-900',
      heroEmoji: '💡',
      likesCount: 647,
      caption:
        '단순한 해석을 넘어선 깊이 있는 탐구! 의령여고의 탄탄한 학생부종합전형 노하우를 담은 세특 치트키를 공개합니다. 내 꿈과 관련된 교과서 단원을 지금 확인해 보세요.',
      tags: ['#학생부종합', '#세특치트키', '#의령여고대입', '#탐구보고서', '#진로연계'],
      commentsCount: 84,
      timeAgo: '3시간 전',
    },
  ];

  return (
    <div className="w-full space-y-3 pb-8">
      {/* =========================================================================
          📸 1. 인스타그램 스토리 캐러셀 (Instagram Story Carousel) - 좌우 여백 0
          ========================================================================= */}
      <section className="bg-white border-b border-slate-200 py-3 px-3 overflow-hidden shadow-2xs">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-1">
          {/* 공식 계정 프로필 스토리 */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer">
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-black text-xs shadow-inner">
                  의령여고
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 tracking-tight">내 스토리</span>
          </div>

          {/* 4대 코너 스토리 원형 버튼 */}
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => onNavigate(story.tabKey)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className={`w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr ${story.color} transition-transform group-hover:scale-105 active:scale-95`}>
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

      {/* =========================================================================
          📸 2. 인스타그램 메인 피드 포스트 목록 (좌우 여백 0, border-b로 구분)
          ========================================================================= */}
      <div className="space-y-3">
        {posts.map((post) => {
          const isLiked = likedPosts[post.id] ?? false;
          const isSaved = savedPosts[post.id] ?? false;
          const currentLikes = isLiked ? post.likesCount + 1 : post.likesCount;

          return (
            <article
              key={post.id}
              className="bg-white border-y border-slate-200/90 overflow-hidden shadow-2xs"
            >
              {/* 포스트 상단: 프로필 정보 + 더보기 아이콘 */}
              <div className="flex items-center justify-between px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500">
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                        {post.profileImgText}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{post.accountName}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                        {post.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{post.location}</p>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* 포스트 메인 미디어 영역: 인스타그램 4:5 비율 인터랙티브 카드 */}
              <div
                onClick={() => onNavigate(post.tabKey)}
                className={`relative w-full aspect-[4/3] sm:aspect-[16/10] bg-gradient-to-br ${post.bgGradient} text-white p-6 sm:p-8 flex flex-col justify-between cursor-pointer group overflow-hidden select-none`}
              >
                {/* 배경 조명 효과 */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                {/* 카드 상단: 태그 */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                    {post.categoryTag}
                  </span>
                  <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                    {post.heroEmoji}
                  </span>
                </div>

                {/* 카드 중앙: 대형 타이틀 & 서브타이틀 */}
                <div className="space-y-2 relative z-10 max-w-md">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight group-hover:text-blue-100 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
                    {post.subtitle}
                  </p>
                </div>

                {/* 카드 하단: 인터랙티브 액션 버튼 (호버 시 하이라이트) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/15 relative z-10">
                  <div className="text-[11px] text-slate-300 font-medium truncate max-w-[240px]">
                    {post.summary}
                  </div>
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
                    {post.actionIcon}
                    <span>{post.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* 포스트 액션 바: 좋아요, 댓글, 공유, 북마크 (인스타 동일) */}
              <div className="px-3.5 pt-3 pb-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-slate-800">
                    {/* 좋아요 하트 */}
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="transition-transform active:scale-125 cursor-pointer"
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          isLiked
                            ? 'text-red-500 fill-red-500 stroke-red-500 animate-in zoom-in-75 duration-150'
                            : 'hover:text-slate-600'
                        }`}
                      />
                    </button>

                    {/* 댓글 아이콘 */}
                    <button
                      onClick={() => onNavigate(post.tabKey)}
                      className="hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-6 h-6" />
                    </button>

                    {/* 공유 아이콘 */}
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: post.title,
                            text: post.subtitle,
                            url: window.location.href,
                          }).catch(() => {});
                        } else {
                          navigator.clipboard?.writeText(window.location.href);
                          alert('의령여고 영어 페스티벌 링크가 복사되었습니다!');
                        }
                      }}
                      className="hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>

                  {/* 북마크 아이콘 */}
                  <button
                    onClick={() => toggleSave(post.id)}
                    className="transition-transform active:scale-125 cursor-pointer text-slate-800"
                  >
                    <Bookmark
                      className={`w-6 h-6 ${
                        isSaved ? 'text-slate-900 fill-slate-900' : 'hover:text-slate-600'
                      }`}
                    />
                  </button>
                </div>

                {/* 좋아요 수 */}
                <div className="pt-2 text-xs font-bold text-slate-900">
                  좋아요 {currentLikes.toLocaleString()}개
                </div>

                {/* 본문 캡션 및 해시태그 */}
                <div className="pt-1.5 space-y-1 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 mr-2">{post.accountName}</span>
                    <span className="text-slate-800 leading-relaxed">{post.caption}</span>
                  </div>

                  {/* 해시태그 */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {post.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-blue-700 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 댓글 n개 모두 보기 & 시간 */}
                <button
                  onClick={() => onNavigate(post.tabKey)}
                  className="pt-1.5 text-xs text-slate-400 font-medium block text-left hover:text-slate-600"
                >
                  댓글 {post.commentsCount}개 모두 보기
                </button>
                <div className="pt-0.5 text-[10px] text-slate-400 uppercase tracking-tight">
                  {post.timeAgo}
                </div>
              </div>

              {/* 포스트 하단 간이 댓글 입력창 느낌 */}
              <div className="border-t border-slate-100 px-3.5 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>😊</span>
                  <span>의령여고 축제 소감이나 질문 남기기...</span>
                </div>
                <button
                  onClick={() => onNavigate(post.tabKey)}
                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer text-xs"
                >
                  참여하기
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* 피드 최하단: 의령여고 공식 안내 푸터 */}
      <div className="text-center py-6 space-y-2">
        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto text-sm font-bold">
          ✨
        </div>
        <p className="text-xs font-bold text-slate-700">모든 소식을 다 확인했습니다</p>
        <p className="text-[11px] text-slate-400">
          2025 의령여자고등학교 영어과 교육과정 박람회 공식 피드
        </p>
      </div>
    </div>
  );
};
