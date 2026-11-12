import React from 'react';
import {
  X,
  Grid,
  Heart,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Camera,
  ExternalLink,
} from 'lucide-react';
import type { FsUserPost } from '../services/firestoreService';

export interface ProfileViewData {
  username: string;
  displayName?: string;
  avatar: string;
  isTeacher?: boolean;
  isOfficial?: boolean;
  bio?: string;
}

export interface OfficialPostItem {
  id: string; // 'mbti' | 'vocab' | 'textbook' | 'seteuk'
  title: string;
  imageUrl: string;
  tag: string;
  likes: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileViewData | null;
  posts: FsUserPost[];
  officialPosts?: OfficialPostItem[];
  isOwnProfile: boolean;
  onSelectPost: (postId: string) => void;
  onSelectOfficialPost?: (postId: string) => void;
  onEditProfile?: () => void;
  onCreatePost?: () => void;
}

export const UserProfileViewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  posts,
  officialPosts = [],
  isOwnProfile,
  onSelectPost,
  onSelectOfficialPost,
  onEditProfile,
  onCreatePost,
}) => {
  if (!isOpen || !profile) return null;

  // 총 받은 좋아요 수 계산
  const totalLikes = profile.isOfficial
    ? officialPosts.reduce((sum, p) => sum + p.likes, 0)
    : posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);

  const postCount = profile.isOfficial ? officialPosts.length : posts.length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-slate-100 animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* =========================================================================
            1. 인스타그램 스타일 상단 네비게이션 바
            ========================================================================= */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="w-8" /> {/* 좌측 밸런서 */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
              @{profile.username}
            </span>
            {profile.isOfficial && (
              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
            )}
            {profile.isTeacher && (
              <span className="flex items-center gap-0.5 bg-purple-100 text-purple-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                <ShieldCheck className="w-3 h-3 text-purple-600" /> 교사
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            2. 프로필 요약 헤더 (아바타 + 통계 숫자 + 소개글)
            ========================================================================= */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 space-y-3.5 bg-slate-50/50">
          {/* 아바타 & 3대 통계 */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* 인스타그램 무지개 그라데이션 링 아바타 */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-sm">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              {profile.isOfficial && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-[11px] shadow-xs">
                  ★
                </div>
              )}
            </div>

            {/* 통계 3열 (게시물, 좋아요, 활동) */}
            <div className="flex-1 flex items-center justify-around text-center">
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {postCount}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">게시물</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {totalLikes.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">받은 좋아요</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-purple-600">
                  {profile.isOfficial
                    ? '공식'
                    : profile.isTeacher
                      ? '마스터'
                      : postCount > 0
                        ? '체험러'
                        : '탐색중'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">활동 뱃지</div>
              </div>
            </div>
          </div>

          {/* 닉네임 & 소개 문구 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {profile.displayName || profile.username}
              </h3>
              {profile.isOfficial ? (
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  🏛️ 공식 교육과정
                </span>
              ) : profile.isTeacher ? (
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  👩‍🏫 영어과 지도교사
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  🎓 의령여고 부스 참가자
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {profile.bio ||
                (profile.isOfficial
                  ? '🏛️ 2026 의령여자고등학교 고교학점제 박람회 영어과 공식 피드\n📍 4대 부스 체험 & 학종 맞춤형 교육과정 전시관'
                  : '오늘 영어 박람회 부스에서 나만의 영어 미래를 발견하는 중! ✨')}
            </p>
          </div>

          {/* 인스타그램 액션 버튼 (내 계정 vs 다른 참가자) */}
          <div className="pt-1 flex items-center gap-2">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onCreatePost?.();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold text-xs shadow-xs hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-3" />
                  <span>새 피드 올리기</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onEditProfile?.();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>프로필 수정</span>
                </button>
              </>
            ) : profile.isOfficial ? (
              <button
                onClick={() => {
                  onClose();
                  onSelectOfficialPost?.('mbti');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>4대 부스 타임라인 보러가기</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (posts.length > 0) {
                    onSelectPost(posts[0].id);
                  } else {
                    onClose();
                  }
                }}
                disabled={posts.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>최신 피드로 이동</span>
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. 인스타그램 스타일 탭 바 ([▦ 게시물])
            ========================================================================= */}
        <div className="flex items-center justify-center border-b border-slate-200 bg-white">
          <div className="flex items-center gap-1.5 py-2.5 px-6 border-b-2 border-slate-900 text-xs font-bold text-slate-900">
            <Grid className="w-3.5 h-3.5" />
            <span>게시물</span>
            <span className="text-[11px] text-slate-400 font-normal">({postCount})</span>
          </div>
        </div>

        {/* =========================================================================
            4. 게시물 모아보기 3열 그리드 (인스타그램 3열 썸네일 바둑판)
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-1.5 sm:p-2">
          {/* 의령여고 공식 계정 4개 부스 그리드 */}
          {profile.isOfficial && (
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
              {officialPosts.map((op) => (
                <div
                  key={op.id}
                  onClick={() => {
                    onClose();
                    onSelectOfficialPost?.(op.id);
                  }}
                  className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-slate-900 shadow-2xs"
                  title={`${op.title} 부스로 이동`}
                >
                  <img
                    src={op.imageUrl}
                    alt={op.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                    {op.tag}
                  </div>
                  {/* 인스타그램 스타일 호버 오버레이 */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white font-bold text-xs transition-opacity p-1 text-center">
                    <span className="text-[10px] text-amber-200 truncate w-full px-1">
                      {op.title}
                    </span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <Heart className="w-3 h-3 fill-white text-white" />
                      <span>{op.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 일반 학생/선생님 참가자 게시물 그리드 */}
          {!profile.isOfficial && posts.length > 0 && (
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    onClose();
                    onSelectPost(post.id);
                  }}
                  className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-slate-900 shadow-2xs"
                  title="클릭하여 해당 피드로 이동"
                >
                  <img
                    src={post.photoUrl}
                    alt={post.caption || '피드 사진'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {post.tag && (
                    <div className="absolute bottom-1 left-1 bg-black/65 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.5 rounded truncate max-w-[85%]">
                      {post.tag}
                    </div>
                  )}
                  {/* 인스타그램 스타일 호버/터치 정보 오버레이 */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 text-white font-bold text-xs transition-opacity">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-white text-white" />
                      <span>{(post.likesCount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 게시물이 없을 때의 인스타그램 빈 상태 */}
          {!profile.isOfficial && posts.length === 0 && (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400">
                <Camera className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">게시물 없음</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  {isOwnProfile
                    ? '아직 올린 부스 인증샷이 없습니다.\n첫 번째 활동 피드를 남겨보세요!'
                    : `@${profile.username} 님이 아직 올린 게시물이 없습니다.`}
                </p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => {
                    onClose();
                    onCreatePost?.();
                  }}
                  className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  첫 부스 피드 작성하기 📸
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

