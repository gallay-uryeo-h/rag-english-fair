import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  addComment,
  subscribeComments,
  subscribeLikes,
  toggleLikeRemote,
  subscribeUserPosts,
  deleteUserPost,
  toggleUserPostLike,
} from '../services/firestoreService';
import type { FsComment, FsUserPost } from '../services/firestoreService';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Volume2,
  BookOpen,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { DeepEnglishMbtiTab } from './DeepEnglishMbtiTab';
import { VocabListenTab } from './VocabListenTab';
import { TextbookBrowse2Layer } from './TextbookBrowse2Layer';
import { SeteukGeneratorTab } from './SeteukGeneratorTab';
import {
  getUserProfile,
  isAdminAuthenticated,
  setAdminAuthenticated,
  clearUserProfile,
  isTeacherAccount,
} from '../utils/userProfile';
import type { UserProfile } from '../utils/userProfile';
import { UserProfileModal } from './UserProfileModal';
import { CreatePostModal } from './CreatePostModal';
import { UserProfileViewModal } from './UserProfileViewModal';
import type { ProfileViewData, OfficialPostItem } from './UserProfileViewModal';

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

export const LiveHomeFeed: React.FC<Props> = ({
  onOpenImage,
  viewMode = 'feed',
  onSelectGridPost,
  feedRefs,
  expandedSections,
  onToggleSection,
  onScrollTo,
}) => {
  // ─── 👤 사용자 개별 프로필 (최초 방문 시 계정 없음: null) ────────────────
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getUserProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated);

  // 선생님 계정인 경우 관리자 권한 동기화
  useEffect(() => {
    if (currentUser?.isTeacher) {
      setIsAdmin(true);
      setAdminAuthenticated(true);
    }
  }, [currentUser]);

  // ─── 📸 실시간 학생 피드 목록 (Firestore 'user_post' 구독) ─────────────────
  const [userPosts, setUserPosts] = useState<FsUserPost[]>([]);

  useEffect(() => {
    return subscribeUserPosts((fetched) => {
      setUserPosts(fetched);
    });
  }, []);

  // 피드 삭제 핸들러 (본인 글이거나 선생님 관리자일 때)
  const handleDeletePost = async (post: FsUserPost) => {
    const isOwner = currentUser && post.authorId === currentUser.uid;
    const canDelete = isOwner || isAdmin;
    if (!canDelete) {
      alert('본인이 작성한 게시물만 삭제할 수 있습니다.');
      return;
    }

    const confirmMsg = isAdmin && !isOwner
      ? `[선생님 관리자 권한] @${post.authorName} 님의 게시물을 강제 삭제하시겠습니까?`
      : '게시물을 삭제하시겠습니까?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteUserPost(post.id);
      alert('게시물이 삭제되었습니다.');
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 학생 피드 좋아요 토글
  const [likedUserPosts, setLikedUserPosts] = useState<Record<string, boolean>>({});
  const toggleUserPostLikeHandler = async (postId: string) => {
    const next = !likedUserPosts[postId];
    setLikedUserPosts((prev) => ({ ...prev, [postId]: next }));
    try {
      await toggleUserPostLike(postId, next ? 1 : -1);
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Firestore 실시간 댓글 (rag-english-fair 컬렉션) ───────────────────────
  const POST_IDS = ['mbti', 'vocab', 'textbook', 'seteuk'] as const;

  const [comments, setComments] = useState<Record<string, FsComment[]>>({
    mbti: [], vocab: [], textbook: [], seteuk: [],
  });

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({
    mbti: '', vocab: '', textbook: '', seteuk: '',
  });

  // 모든 포스트 댓글을 onSnapshot으로 구독
  useEffect(() => {
    const unsubs = POST_IDS.map((postId) =>
      subscribeComments(postId, (fetched) => {
        setComments((prev) => ({ ...prev, [postId]: fetched }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  const handleAddComment = useCallback(async (postId: string) => {
    if (!currentUser) {
      setIsProfileModalOpen(true);
      alert('댓글을 작성하려면 먼저 부스 활동에 사용할 아이디(닉네임)를 설정해 주세요!');
      return;
    }
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    // 내 아이디로 댓글 등록
    await addComment(postId, text, currentUser.username);
  }, [commentInputs, currentUser]);

  // ─── Firestore 실시간 좋아요 카운트 ──────────────────────────────────────
  // 좋아요 기본 카운트 (초기 디스플레이용 - Firestore에서 덮어씌워짐)
  const BASE_LIKES: Record<string, number> = { mbti: 384, vocab: 295, textbook: 512, seteuk: 647 };
  const [remoteLikes, setRemoteLikes] = useState<Record<string, number>>(BASE_LIKES);

  useEffect(() => {
    const unsubs = POST_IDS.map((postId) =>
      subscribeLikes(postId, (count) => {
        setRemoteLikes((prev) => ({ ...prev, [postId]: BASE_LIKES[postId] + count }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  // ─── 로컬 좋아요 토글 (낙관적 UI + Firestore 카운터 동기화) ─────────────
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    mbti: false, vocab: false, textbook: false, seteuk: false,
  });

  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({
    mbti: true, textbook: true,
  });

  const toggleLike = useCallback((id: string) => {
    const nextLiked = !likedPosts[id];
    setLikedPosts((prev) => ({ ...prev, [id]: nextLiked }));
    // Firestore에 +1 / -1 반영
    toggleLikeRemote(id, nextLiked).catch(console.error);
  }, [likedPosts]);

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 실시간 학생 피드 작성자들 추출 (중복 제거)
  const studentStoryList = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ authorName: string; avatar: string; postId: string }> = [];
    userPosts.forEach((p) => {
      if (!seen.has(p.authorName) && (!currentUser || p.authorName !== currentUser.username)) {
        seen.add(p.authorName);
        list.push({ authorName: p.authorName, avatar: p.avatar, postId: p.id });
      }
    });
    return list;
  }, [userPosts, currentUser]);

  // ─── 🖼️ 인스타그램 스타일 프로필 모아보기 팝업 모달 상태 ───────────────────
  const [viewingProfile, setViewingProfile] = useState<ProfileViewData | null>(null);
  const [isProfileViewModalOpen, setIsProfileViewModalOpen] = useState<boolean>(false);

  // 현재 열람 중인 프로필의 작성 게시물들 필터링
  const postsForViewingProfile = useMemo(() => {
    if (!viewingProfile) return [];
    return userPosts.filter(
      (p) => p.authorName.toLowerCase() === viewingProfile.username.toLowerCase()
    );
  }, [userPosts, viewingProfile]);

  // 공식 4대 부스 포스트 그리드 데이터
  const officialPostsList: OfficialPostItem[] = useMemo(() => [
    {
      id: 'mbti',
      title: 'MBTI별 본문 추천',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
      tag: '1부스',
      likes: remoteLikes.mbti,
    },
    {
      id: 'vocab',
      title: '소리로 배우는 영단어',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      tag: '2부스',
      likes: remoteLikes.vocab,
    },
    {
      id: 'textbook',
      title: '3개년 교과서 6권 대공개',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1000&q=80',
      tag: '3부스',
      likes: remoteLikes.textbook,
    },
    {
      id: 'seteuk',
      title: '진로별 세특 발전소',
      imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80',
      tag: '4부스',
      likes: remoteLikes.seteuk,
    },
  ], [remoteLikes]);

  // 내 프로필 모아보기 열기
  const handleOpenMyProfile = () => {
    if (!currentUser) {
      setIsProfileModalOpen(true);
      return;
    }
    setViewingProfile({
      username: currentUser.username,
      displayName: currentUser.displayName || currentUser.username,
      avatar: currentUser.avatar,
      isTeacher: currentUser.isTeacher,
      isOfficial: false,
      bio: currentUser.isTeacher
        ? '👩‍🏫 의령여고 영어과 지도교사 (게시물 관리 권한)'
        : '🎓 2026 의령여고 영어 교육과정 박람회 참가자 ✨',
    });
    setIsProfileViewModalOpen(true);
  };

  // 의령여고 영어과 공식 프로필 열기
  const handleOpenOfficialProfile = () => {
    setViewingProfile({
      username: 'uryeo_english_fair',
      displayName: '의령여고 영어과',
      avatar: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=200&q=80',
      isTeacher: false,
      isOfficial: true,
      bio: '🏛️ 2026 의령여자고등학교 영어 교육과정 박람회 공식 피드\n📍 4대 부스 체험 & 학종 맞춤형 교육과정 전시관',
    });
    setIsProfileViewModalOpen(true);
  };

  // 다른 학생/선생님 참가자 프로필 열기
  const handleOpenParticipantProfile = (authorName: string, avatar: string) => {
    const isTeacher = isTeacherAccount(authorName);
    setViewingProfile({
      username: authorName,
      displayName: authorName,
      avatar,
      isTeacher,
      isOfficial: false,
      bio: isTeacher
        ? '👩‍🏫 의령여고 영어과 지도교사'
        : '🎓 의령여고 영어 교육과정 박람회 부스 참가자\n✨ 함께 부스를 즐기고 멋진 피드를 공유해요!',
    });
    setIsProfileViewModalOpen(true);
  };

  // 모아보기 팝업에서 특정 피드 클릭 시 스크롤 이동 및 하이라이트
  const handleSelectPostFromProfile = (postId: string) => {
    setIsProfileViewModalOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`user_post_${postId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-purple-500', 'shadow-xl', 'transition-all', 'duration-500');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-purple-500', 'shadow-xl');
        }, 2200);
      }
    }, 120);
  };

  // 공식 부스 선택 시 해당 부스로 이동
  const handleSelectOfficialPostFromProfile = (boothId: string) => {
    setIsProfileViewModalOpen(false);
    setTimeout(() => {
      onScrollTo(boothId as any);
    }, 120);
  };

  // 새 피드 작성 완료 후 해당 피드로 스크롤 이동 및 하이라이트
  const handlePostCreated = useCallback((postId: string) => {
    setIsCreatePostModalOpen(false);
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById(`user_post_${postId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-purple-500', 'shadow-xl', 'transition-all', 'duration-500');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-purple-500', 'shadow-xl');
        }, 2200);
      } else if (attempts < 12) {
        setTimeout(() => tryScroll(attempts + 1), 150);
      }
    };
    setTimeout(() => tryScroll(), 200);
  }, []);

  return (
    <div ref={feedRefs.homeRef} className="w-full space-y-4 pb-12">
      {/* 🛡️ 선생님 관리자 모드 활성화 알림 배너 */}
      {isAdmin && (
        <div className="bg-purple-900 text-purple-100 px-3.5 py-2 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold">
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>선생님 관리자 모드 작동 중 (게시물 삭제 권한 활성화)</span>
          </div>
          <button
            onClick={() => {
              clearUserProfile();
              setAdminAuthenticated(false);
              setIsAdmin(false);
              setCurrentUser(null);
              alert('선생님 계정에서 로그아웃되었습니다.');
            }}
            className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded font-medium cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      )}

      {/* =========================================================================
          📸 1. 부스 활동 스토리 캐러셀 (Story Bar)
          ========================================================================= */}
      <section className="bg-white border-b border-slate-200 py-3 px-3 overflow-hidden shadow-2xs">
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar px-1">
          {/* 🌟 1. 내 스토리 (최초 방문 시 계정 만들기 유도, 설정 후 내 프로필 표시) */}
          {currentUser ? (
            <div
              onClick={handleOpenMyProfile}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
            >
              <div className="relative w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 transition-transform group-hover:scale-105 active:scale-95 shadow-xs">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* 내 스토리 플러스 뱃지 */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatePostModalOpen(true);
                  }}
                  title="새 피드 올리기"
                  className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shadow-xs cursor-pointer"
                >
                  +
                </div>
              </div>
              <div className="flex flex-col items-center max-w-[70px]">
                <span className="text-[11px] font-bold text-slate-900 tracking-tight truncate w-full text-center group-hover:text-purple-600 transition-colors">
                  {currentUser.isTeacher ? '선생님 계정' : '내 계정'}
                </span>
                <span className="text-[9px] text-slate-500 truncate w-full text-center">
                  @{currentUser.username}
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
            >
              <div className="relative w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-purple-400 hover:border-purple-600 transition-all flex items-center justify-center bg-purple-50/50 group-hover:scale-105 active:scale-95">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-lg font-bold">
                  ?
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
                  +
                </div>
              </div>
              <div className="flex flex-col items-center max-w-[70px]">
                <span className="text-[11px] font-bold text-purple-700 tracking-tight truncate w-full text-center">
                  계정 만들기
                </span>
                <span className="text-[9px] text-slate-400 truncate w-full text-center">
                  1회용 아이디
                </span>
              </div>
            </div>
          )}

          {/* 🌟 2. 의령여고 영어과 공식 계정 스토리 */}
          <div
            onClick={handleOpenOfficialProfile}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
          >
            <div className="relative w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 transition-transform group-hover:scale-105 active:scale-95 shadow-xs">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <img
                  src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=200&q=80"
                  alt="의령여고 영어과 공식"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-xs">
                ★
              </div>
            </div>
            <div className="flex flex-col items-center max-w-[70px]">
              <span className="text-[11px] font-bold text-slate-900 tracking-tight truncate w-full text-center group-hover:text-pink-600 transition-colors">
                의령여고 영어과
              </span>
              <span className="text-[9px] text-pink-600 font-medium truncate w-full text-center">
                공식 교육과정
              </span>
            </div>
          </div>

          {/* 🌟 3. 실시간으로 피드를 올린 실제 참여자들 스토리 (클릭 시 프로필 모아보기 팝업) */}
          {studentStoryList.map((st) => (
            <div
              key={st.postId}
              onClick={() => handleOpenParticipantProfile(st.authorName, st.avatar)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
            >
              <div className="relative w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-emerald-400 via-teal-500 to-blue-500 transition-transform group-hover:scale-105 active:scale-95 shadow-xs">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={st.avatar}
                    alt={st.authorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-700 tracking-tight max-w-[68px] truncate group-hover:text-purple-600 transition-colors">
                @{st.authorName}
              </span>
            </div>
          ))}

          {/* 🌟 4. 아직 참여자 피드가 없을 때 안내 칩 */}
          {studentStoryList.length === 0 && (
            <div
              onClick={() => {
                if (!currentUser) setIsProfileModalOpen(true);
                else setIsCreatePostModalOpen(true);
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer select-none opacity-80 hover:opacity-100 transition-opacity"
            >
              <div className="w-16 h-16 rounded-full border border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs">
                <span>✍️</span>
                <span className="text-[9px] font-bold mt-0.5">첫 피드</span>
              </div>
              <span className="text-[10px] text-slate-400">참여자 대기</span>
            </div>
          )}
        </div>
      </section>

      {/* 🌟 1-1. 내 계정 요약 및 새 글 작성 빠른 액션 바 */}
      <section className="bg-white border-y border-slate-200 px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        {currentUser ? (
          <div
            onClick={handleOpenMyProfile}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-purple-600 group-hover:scale-105 transition-transform">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  @{currentUser.username}
                </span>
                {currentUser.isTeacher && (
                  <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full">
                    선생님 🛡️
                  </span>
                )}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileModalOpen(true);
                  }}
                  className="text-[10px] text-slate-400 hover:text-purple-600 hover:underline cursor-pointer"
                >
                  · 프로필 수정
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
              ?
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-purple-700 group-hover:underline">
                  부스 활동용 1회용 아이디 만들기
                </span>
                <span className="text-[10px] text-slate-400">➔ 터치</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (!currentUser) {
              setIsProfileModalOpen(true);
              alert('피드를 작성하려면 먼저 부스 활동에 사용할 아이디(닉네임)를 설정해 주세요!');
            } else {
              setIsCreatePostModalOpen(true);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-3" />
          <span>피드 올리기</span>
        </button>
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
        </div>

            {/* 포스트 소셜 바 */}
            <div className="px-3.5 pt-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-800">
                  <button onClick={() => toggleLike('mbti')} className="transition-transform active:scale-125">
                    <Heart
                      className={`w-6 h-6 ${likedPosts.mbti ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
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
                좋아요 {remoteLikes.mbti.toLocaleString()}개
              </div>
              <div className="pt-1 text-xs">
                <span className="font-bold text-slate-900 mr-2">ur_english_mbti</span>
                <span className="text-slate-800">
                  나의 성격과 딱 맞는 교과서 지문을 만나면 독해가 즐거운 탐구로 바뀝니다. 지금 바로 진단해 보세요! ✨
                </span>
              </div>

          {/* 🌟 설명 텍스트 아래에 배치된 내용 펼치기(아코디언 토글) 바 */}
          <div className="pt-2.5 pb-1">
            <button
              onClick={() => onToggleSection('mbti')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                  {expandedSections.mbti ? 'MBTI 테스트 뷰어 접기' : 'MBTI 테스트 바로 시작하기'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-blue-600">
                <span>{expandedSections.mbti ? '닫기' : '펼쳐보기'}</span>
                {expandedSections.mbti ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
          </div>

          {/* 🌟 아코디언 인라인 진단창 (설명 텍스트 및 토글 버튼 아래에서 열림) */}
          {expandedSections.mbti && (
            <div className="mt-2.5 border border-blue-200 rounded-2xl overflow-hidden bg-slate-50 animate-in slide-in-from-top-2 duration-300">
              <DeepEnglishMbtiTab onOpenImage={onOpenImage} />
            </div>
          )}

              {/* 💬 댓글 목록 미리보기 */}
              {comments.mbti && comments.mbti.length > 0 && (
                <div className="pt-2 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    댓글 {comments.mbti.length}개 모두 보기
                  </span>
                  {comments.mbti.map((c) => (
                    <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 mr-1.5">{c.author}</span>
                        <span className="text-slate-700">{c.text}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {c.timestamp ? new Date(c.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                      </span>
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
        </div>

            <div className="px-3.5 pt-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-800">
                  <button onClick={() => toggleLike('vocab')} className="transition-transform active:scale-125">
                    <Heart
                      className={`w-6 h-6 ${likedPosts.vocab ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
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
                좋아요 {remoteLikes.vocab.toLocaleString()}개
              </div>
              <div className="pt-1 text-xs">
                <span className="font-bold text-slate-900 mr-2">ur_audio_vocab</span>
                <span className="text-slate-800">
                  눈으로만 외우는 단어는 이제 그만! 원어민 발음을 듣고 만점에 도전해 보세요. 🎧
                </span>
              </div>

          {/* 🌟 설명 텍스트 아래에 배치된 내용 펼치기(아코디언 토글) 바 */}
          <div className="pt-2.5 pb-1">
            <button
              onClick={() => onToggleSection('vocab')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-bold text-slate-800 group-hover:text-purple-600">
                  {expandedSections.vocab ? '단어 퀴즈 뷰어 접기' : '단어 소리 퀴즈 시작하기'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-purple-600">
                <span>{expandedSections.vocab ? '닫기' : '펼쳐보기'}</span>
                {expandedSections.vocab ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
          </div>

          {/* 🌟 아코디언 인라인 단어 퀴즈창 (설명 텍스트 및 토글 버튼 아래에서 열림) */}
          {expandedSections.vocab && (
            <div className="mt-2.5 border border-purple-200 rounded-2xl overflow-hidden bg-slate-50 animate-in slide-in-from-top-2 duration-300">
              <VocabListenTab />
            </div>
          )}

              {/* 💬 댓글 목록 미리보기 */}
              {comments.vocab && comments.vocab.length > 0 && (
                <div className="pt-2 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    댓글 {comments.vocab.length}개 모두 보기
                  </span>
                  {comments.vocab.map((c) => (
                    <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 mr-1.5">{c.author}</span>
                        <span className="text-slate-700">{c.text}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {c.timestamp ? new Date(c.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                      </span>
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
        </div>

            <div className="px-3.5 pt-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-800">
                  <button onClick={() => toggleLike('textbook')} className="transition-transform active:scale-125">
                    <Heart
                      className={`w-6 h-6 ${likedPosts.textbook ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
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
                좋아요 {remoteLikes.textbook.toLocaleString()}개
              </div>
              <div className="pt-1 text-xs">
                <span className="font-bold text-slate-900 mr-2">ur_textbook_viewer</span>
                <span className="text-slate-800">
                  공통영어부터 세계문화와 영어까지, 144개 모든 파트의 학습 내용이 100% 정밀 검증되어 있습니다.
                </span>
              </div>

          {/* 🌟 설명 텍스트 아래에 배치된 내용 펼치기(아코디언 토글) 바 */}
          <div className="pt-2.5 pb-1">
            <button
              onClick={() => onToggleSection('textbook')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">
                  {expandedSections.textbook ? '6권 교과서 뷰어 접기' : '의령여고 3개년 교과서 열람하기'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-emerald-600">
                <span>{expandedSections.textbook ? '닫기' : '펼쳐보기'}</span>
                {expandedSections.textbook ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
          </div>

          {/* 🌟 아코디언 인라인 교과서 뷰어 (설명 텍스트 및 토글 버튼 아래에서 열림) */}
          {expandedSections.textbook && (
            <div className="mt-2.5 border border-emerald-200 rounded-2xl overflow-hidden bg-slate-50 animate-in slide-in-from-top-2 duration-300">
              <TextbookBrowse2Layer onOpenImage={onOpenImage} />
            </div>
          )}

              {/* 💬 댓글 목록 미리보기 */}
              {comments.textbook && comments.textbook.length > 0 && (
                <div className="pt-2 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    댓글 {comments.textbook.length}개 모두 보기
                  </span>
                  {comments.textbook.map((c) => (
                    <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 mr-1.5">{c.author}</span>
                        <span className="text-slate-700">{c.text}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {c.timestamp ? new Date(c.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                      </span>
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
        </div>

            <div className="px-3.5 pt-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-800">
                  <button onClick={() => toggleLike('seteuk')} className="transition-transform active:scale-125">
                    <Heart
                      className={`w-6 h-6 ${likedPosts.seteuk ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
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
                좋아요 {remoteLikes.seteuk.toLocaleString()}개
              </div>
              <div className="pt-1 text-xs">
                <span className="font-bold text-slate-900 mr-2">ur_seteuk_powerhouse</span>
                <span className="text-slate-800">
                  단순한 해석을 넘어선 깊이 있는 탐구! 의령여고의 탄탄한 대입 학종 노하우를 담았습니다.
                </span>
              </div>

          {/* 🌟 설명 텍스트 아래에 배치된 내용 펼치기(아코디언 토글) 바 */}
          <div className="pt-2.5 pb-1">
            <button
              onClick={() => onToggleSection('seteuk')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600">
                  {expandedSections.seteuk ? '세특 발전소 뷰어 접기' : '진로별 세특 보고서 탐색하기'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-amber-600">
                <span>{expandedSections.seteuk ? '닫기' : '펼쳐보기'}</span>
                {expandedSections.seteuk ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
          </div>

          {/* 🌟 아코디언 인라인 세특 발전소창 (설명 텍스트 및 토글 버튼 아래에서 열림) */}
          {expandedSections.seteuk && (
            <div className="mt-2.5 border border-amber-200 rounded-2xl overflow-hidden bg-slate-50 animate-in slide-in-from-top-2 duration-300">
              <SeteukGeneratorTab onOpenImage={onOpenImage} />
            </div>
          )}

              {/* 💬 댓글 목록 미리보기 */}
              {comments.seteuk && comments.seteuk.length > 0 && (
                <div className="pt-2 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    댓글 {comments.seteuk.length}개 모두 보기
                  </span>
                  {comments.seteuk.map((c) => (
                    <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 mr-1.5">{c.author}</span>
                        <span className="text-slate-700">{c.text}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {c.timestamp ? new Date(c.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                      </span>
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

      {/* 🌟 4. 실시간 학생 참여 피드 목록 (User Live Feed Stream) */}
      {userPosts.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-3 pt-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-extrabold text-slate-800">
                학생 라이브 피드 ({userPosts.length})
              </span>
            </div>
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full transition-colors"
            >
              <Plus className="w-3 h-3 stroke-3" />
              <span>나도 피드 쓰기</span>
            </button>
          </div>

          {userPosts.map((post) => {
            const isOwner = currentUser ? post.authorId === currentUser.uid : false;
            const canDelete = isOwner || isAdmin;
            const isLiked = likedUserPosts[post.id] || false;
            const totalLikes = (post.likesCount || 0) + (isLiked ? 1 : 0);

            return (
              <article
                key={post.id}
                id={`user_post_${post.id}`}
                className="bg-white border-y border-slate-200/90 overflow-hidden shadow-2xs scroll-mt-14"
              >
                {/* 포스트 상단 계정 정보 (클릭 시 프로필 모아보기 팝업) */}
                <div className="flex items-center justify-between px-3.5 py-3">
                  <div
                    onClick={() => handleOpenParticipantProfile(post.authorName, post.avatar)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                    title={`@${post.authorName} 프로필 보기`}
                  >
                    <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-purple-600 group-hover:scale-105 transition-transform">
                      <img
                        src={post.avatar}
                        alt={post.authorName}
                        className="w-full h-full rounded-full object-cover bg-white p-0.5"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-purple-600 group-hover:underline transition-colors">
                          @{post.authorName}
                        </span>
                        {post.tag && (
                          <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-1.5 py-0.2 rounded">
                            {post.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {post.timestamp ? new Date(post.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                      </p>
                    </div>
                  </div>

                  {/* 삭제 버튼 (본인 또는 선생님 관리자 권한) */}
                  {canDelete ? (
                    <button
                      onClick={() => handleDeletePost(post)}
                      title={isAdmin && !isOwner ? "선생님 권한 강제 삭제" : "내 게시물 삭제"}
                      className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAdmin && !isOwner ? "강제삭제" : "삭제"}</span>
                    </button>
                  ) : (
                    <button className="text-slate-400 p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 피드 사진: 인스타그램 스타일 (원본 비율 보존, 크롭/줌인 없는 선명한 고화질 표시) */}
                <div className="relative w-full max-h-[580px] min-h-[220px] bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={post.photoUrl}
                    alt="게시물 사진"
                    className="w-full max-h-[580px] object-contain"
                    loading="lazy"
                  />
                </div>

                {/* 소셜 액션 바 */}
                <div className="px-3.5 pt-3 pb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-800">
                      <button
                        onClick={() => toggleUserPostLikeHandler(post.id)}
                        className="transition-transform active:scale-125"
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            isLiked ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => alert('댓글은 포스트 하단에 작성해 보세요!')}
                        className="hover:text-slate-600"
                      >
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
                  </div>

                  <div className="text-xs font-bold text-slate-900">
                    좋아요 {totalLikes.toLocaleString()}개
                  </div>

                  <div className="text-xs">
                    <span className="font-bold text-slate-900 mr-2">@{post.authorName}</span>
                    <span className="text-slate-800 whitespace-pre-line">{post.caption}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
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

      {/* ─── 팝업 모달 ─────────────────────────────────────────────────── */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={currentUser}
        onProfileUpdated={(updated) => setCurrentUser(updated)}
      />

      {currentUser && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          currentUser={currentUser}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* 🌟 인스타그램 스타일 프로필 모아보기 팝업 모달 */}
      <UserProfileViewModal
        isOpen={isProfileViewModalOpen}
        onClose={() => setIsProfileViewModalOpen(false)}
        profile={viewingProfile}
        posts={postsForViewingProfile}
        officialPosts={officialPostsList}
        isOwnProfile={Boolean(
          currentUser &&
            viewingProfile &&
            !viewingProfile.isOfficial &&
            viewingProfile.username.toLowerCase() === currentUser.username.toLowerCase()
        )}
        onSelectPost={handleSelectPostFromProfile}
        onSelectOfficialPost={handleSelectOfficialPostFromProfile}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onCreatePost={() => {
          if (!currentUser) {
            setIsProfileModalOpen(true);
          } else {
            setIsCreatePostModalOpen(true);
          }
        }}
      />
    </div>
  );
};
