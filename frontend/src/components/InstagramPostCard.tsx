import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface Props {
  accountName: string;
  badgeText: string;
  badgeColorClass?: string;
  avatarChar: string;
  avatarGradientClass?: string;
  locationText: string;
  heroImageSrc: string;
  stageBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageAlt?: string;
  initialLikes?: number;
  postCaption: string;
  children: React.ReactNode;
}

export const InstagramPostCard: React.FC<Props> = ({
  accountName,
  badgeText,
  badgeColorClass = 'text-blue-600 bg-blue-50',
  avatarChar,
  avatarGradientClass = 'from-pink-500 via-rose-500 to-amber-500',
  locationText,
  heroImageSrc,
  stageBadgeText,
  heroTitle,
  heroSubtitle,
  heroImageAlt = '피드 포스트 이미지',
  initialLikes = 320,
  postCaption,
  children,
}) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto bg-white border-y sm:border sm:rounded-2xl border-slate-200 overflow-hidden shadow-xs mb-6">
      {/* 1. 상단 인스타그램 계정 프로필 헤더 */}
      <div className="flex items-center justify-between px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr ${avatarGradientClass}`}>
            <div className="w-full h-full rounded-full bg-white p-0.5">
              <div className="w-full h-full rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                {avatarChar}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">{accountName}</span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${badgeColorClass}`}>
                {badgeText}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">{locationText}</p>
          </div>
        </div>
        <button className="text-slate-400 p-1 hover:text-slate-600 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. 고화질 사진 히어로 배너 */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between select-none overflow-hidden group">
        <img
          src={heroImageSrc}
          alt={heroImageAlt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.68]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white shadow-xs">
            {stageBadgeText}
          </span>
        </div>

        <div className="space-y-1.5 relative z-10">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            {heroTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow-sm">
            {heroSubtitle}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-white/20 relative z-10">
          <span className="text-[11px] text-slate-300 font-medium">
            인스타그램 피드 연동 버전
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-[11px] font-bold">
            Live Feed Match
          </span>
        </div>
      </div>

      {/* 3. 인스타그램 액션 버튼 (좋아요, 댓글, 공유, 북마크) */}
      <div className="px-3.5 pt-3 pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-800">
            <button
              onClick={() => setLiked((prev) => !prev)}
              className="transition-transform active:scale-125 cursor-pointer"
            >
              <Heart
                className={`w-6 h-6 ${
                  liked ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
                }`}
              />
            </button>
            <button className="hover:text-slate-600 cursor-pointer">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="hover:text-slate-600 cursor-pointer">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={() => setSaved((prev) => !prev)}
            className="transition-transform active:scale-125 cursor-pointer"
          >
            <Bookmark
              className={`w-6 h-6 ${
                saved ? 'fill-slate-900 text-slate-900' : 'hover:text-slate-600'
              }`}
            />
          </button>
        </div>
        <div className="pt-2 text-xs font-bold text-slate-900">
          좋아요 {(initialLikes + (liked ? 1 : 0)).toLocaleString()}개
        </div>
        <div className="pt-1 text-xs">
          <span className="font-bold text-slate-900 mr-2">{accountName}</span>
          <span className="text-slate-800">{postCaption}</span>
        </div>
      </div>

      {/* 4. 본문 컴포넌트 콘텐츠 인라인 렌더링 */}
      <div className="w-full bg-slate-50 border-t border-slate-200/60 p-0 sm:p-2">
        {children}
      </div>
    </div>
  );
};

