import React, { useState } from 'react';
import { Heart, MessageCircle, ChevronDown, LayoutGrid, List } from 'lucide-react';

interface Props {
  isLiveMode?: boolean;
  onToggleMode?: () => void;
  viewMode?: 'feed' | 'grid';
  onToggleViewMode?: () => void;
  onOpenDm?: () => void;
}

export const LiveHeader: React.FC<Props> = ({
  viewMode = 'feed',
  onToggleViewMode,
  onOpenDm,
}) => {
  // 💖 사이트 전체에 대한 좋아요 상태 & 플로팅 +1 효과
  const [isSiteLiked, setIsSiteLiked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('site_liked_urgirlshigh') === 'true';
    } catch {
      return false;
    }
  });
  const [floatingPlusOne, setFloatingPlusOne] = useState<boolean>(false);

  const handleHeartClick = () => {
    const nextState = !isSiteLiked;
    setIsSiteLiked(nextState);

    try {
      localStorage.setItem('site_liked_urgirlshigh', String(nextState));
    } catch {
      // ignore
    }

    if (nextState) {
      setFloatingPlusOne(true);
      setTimeout(() => {
        setFloatingPlusOne(false);
      }, 900);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shrink-0 shadow-2xs">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* 인스타그램 감성 폰트 로고 & 드롭다운 화살표 */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none">
          <span className="font-serif italic text-2xl font-black tracking-tight text-slate-900">
            Urgirlshigh
          </span>
          <ChevronDown className="w-4 h-4 text-slate-700 stroke-[2.5] mt-1" />
          <span className="ml-1 text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            의령여고
          </span>
        </div>

        {/* 우측 인스타 아이콘 (계정별 그리드뷰/피드뷰 토글, 사이트 좋아요 하트, DM메시지) */}
        <div className="flex items-center gap-3 text-slate-900">
          {/* 🌟 피드 뷰 ↔ 계정별 그리드 뷰 토글 버튼 */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={viewMode === 'grid' ? '단일 피드뷰로 보기' : '계정별 그리드뷰로 모아보기'}
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </button>
          )}

          {/* 💖 사이트 전체에 대한 좋아요 하트 버튼 (+1 플로팅 효과) */}
          <div className="relative flex items-center">
            {floatingPlusOne && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[11px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shadow-sm pointer-events-none animate-in fade-in zoom-in-75 slide-in-from-bottom-2 duration-300">
                +1 ❤️
              </span>
            )}
            <button
              onClick={handleHeartClick}
              className="hover:scale-110 active:scale-90 transition-transform cursor-pointer p-0.5"
              title={isSiteLiked ? '좋아요 취소' : '의령여고 박람회 좋아요!'}
              aria-label="사이트 좋아요"
            >
              <Heart
                className={`w-6 h-6 stroke-[1.8] transition-colors duration-200 ${
                  isSiteLiked
                    ? 'fill-rose-500 text-rose-500 animate-in zoom-in-110 duration-200'
                    : 'text-slate-800 hover:text-rose-500'
                }`}
              />
            </button>
          </div>

          {/* 💬 1:1 Q&A DM 챗봇 버튼 */}
          <button
            onClick={() => {
              if (onOpenDm) {
                onOpenDm();
              } else {
                alert('부스 안내 교사 및 도우미 학생에게 언제든 질문해 주세요! 💬');
              }
            }}
            className="hover:opacity-70 transition-opacity cursor-pointer p-0.5 relative"
            title="의령여고 Q&A 챗봇 1:1 DM"
            aria-label="의령여고 Q&A 챗봇 1:1 DM"
          >
            <MessageCircle className="w-6 h-6 stroke-[1.8]" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
