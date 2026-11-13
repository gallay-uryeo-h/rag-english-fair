import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  subscribeLikes,
  toggleLikeRemote,
  subscribeUserPosts,
  deleteUserPost,
  deleteUserAccountAndAllPosts,
  toggleUserPostLike,
} from '../services/firestoreService';
import type { FsUserPost } from '../services/firestoreService';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Shield,
  Sparkles,
  Bot,
  ChevronRight,
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
  isOfficialAccount,
} from '../utils/userProfile';
import type { UserProfile } from '../utils/userProfile';
import { UserProfileModal } from './UserProfileModal';
import { CreatePostModal } from './CreatePostModal';
import { UserProfileViewModal } from './UserProfileViewModal';
import type { ProfileViewData, OfficialPostItem } from './UserProfileViewModal';
import { InstagramDmChatModal } from './InstagramDmChatModal';

import { PostCommentsSection } from './PostCommentsSection';
import { PinchablePhoto } from './PinchablePhoto';
import { AiCustomSeteukLab } from './AiCustomSeteukLab';

interface Props {
  onOpenImage: (title: string, imageUrl: string) => void;
  viewMode?: 'feed' | 'grid';
  onSelectGridPost?: (key: 'mbti' | 'vocab' | 'textbook' | 'seteuk' | 'aiSeteuk') => void;
  isDmOpen?: boolean;
  onOpenDm?: () => void;
  onCloseDm?: () => void;
  // 외부 앵커 참조
  feedRefs: {
    homeRef: React.RefObject<HTMLDivElement | null>;
    mbtiRef: React.RefObject<HTMLDivElement | null>;
    vocabRef: React.RefObject<HTMLDivElement | null>;
    textbookRef: React.RefObject<HTMLDivElement | null>;
    seteukRef: React.RefObject<HTMLDivElement | null>;
    aiSeteukRef?: React.RefObject<HTMLDivElement | null>;
  };
  expandedSections: {
    mbti: boolean;
    vocab: boolean;
    textbook: boolean;
    seteuk: boolean;
    aiSeteuk?: boolean;
  };
  onToggleSection: (key: 'mbti' | 'vocab' | 'textbook' | 'seteuk' | 'aiSeteuk') => void;
  onScrollTo: (key: 'home' | 'mbti' | 'vocab' | 'textbook' | 'seteuk' | 'aiSeteuk') => void;
}

export const LiveHomeFeed: React.FC<Props> = ({
  onOpenImage,
  viewMode = 'feed',
  onSelectGridPost,
  feedRefs,
  expandedSections,
  onToggleSection,
  onScrollTo,
  isDmOpen: externalDmOpen,
  onOpenDm,
  onCloseDm,
}) => {
  // ─── 🤖 인스타그램 DM 챗봇 모달 상태 ────────────────────────────────────
  const [internalDmOpen, setInternalDmOpen] = useState(false);
  const isDmModalOpen = externalDmOpen !== undefined ? externalDmOpen : internalDmOpen;
  const handleOpenDmModal = () => {
    if (onOpenDm) onOpenDm();
    else setInternalDmOpen(true);
  };
  const handleCloseDmModal = () => {
    if (onCloseDm) onCloseDm();
    else setInternalDmOpen(false);
  };

  // ─── 👤 사용자 개별 프로필 (최초 방문 시 계정 없음: null) ────────────────
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getUserProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalInitialMode, setProfileModalInitialMode] = useState<'guest' | 'admin'>('guest');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated);

  // 선생님 계정인 경우 관리자 권한 동기화
  useEffect(() => {
    if (currentUser?.isTeacher) {
      setIsAdmin(true);
      setAdminAuthenticated(true);
    } else if (!currentUser) {
      setIsAdmin(false);
      setAdminAuthenticated(false);
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

  // 🏛️ 의령여고 공식 최고 관리자(uryeo_eng) 전용: 모든 계정 및 피드/댓글 일괄 영구 삭제 권한
  const isOfficialAdmin = Boolean(currentUser && currentUser.username.trim().toLowerCase() === 'uryeo_eng');

  // 🛡️ uryeo_eng 포함 관리자/교사 모두에게 부여되는 관리 권한 (개별 댓글 삭제, 게시물 관리 등)
  const isAnyAdmin = Boolean(
    isOfficialAdmin ||
    isAdmin ||
    currentUser?.isTeacher ||
    (currentUser && isTeacherAccount(currentUser.username))
  );

  const handleDeleteUserAccount = async (targetUsername: string) => {
    if (!isOfficialAdmin) {
      alert('계정 삭제 권한은 @uryeo_eng 최고 관리자에게만 부여되어 있습니다.');
      return;
    }
    const cleanTarget = targetUsername.trim().replace(/^@/, '');
    if (cleanTarget.toLowerCase() === 'uryeo_eng') {
      alert('공식 마스터 관리자 계정(@uryeo_eng)은 삭제할 수 없습니다.');
      return;
    }

    const postCount = userPosts.filter(
      (p) => p.authorName === cleanTarget || p.authorName === `@${cleanTarget}`
    ).length;

    const ok = window.confirm(
      `[🚨 의령여고 영어과 최고 관리자 권한]\n` +
      `@${cleanTarget} 계정을 영구 삭제하시겠습니까?\n\n` +
      `• 작성된 피드: ${postCount}개\n` +
      `• 해당 계정의 모든 피드 및 댓글 일괄 영구 삭제\n\n` +
      `※ 계정과 해당 계정이 작성한 모든 피드 및 댓글이 데이터베이스에서 즉시 영구 삭제되며 복구할 수 없습니다.`
    );
    if (!ok) return;

    try {
      const result = await deleteUserAccountAndAllPosts(cleanTarget);
      alert(`@${cleanTarget} 계정과 작성 피드 ${result.postsCount}개, 댓글 ${result.commentsCount}개가 성공적으로 영구 삭제되었습니다.`);
      if (isProfileViewModalOpen && viewingProfile?.username === cleanTarget) {
        setIsProfileViewModalOpen(false);
      }
    } catch (err) {
      console.error('계정 삭제 실패:', err);
      alert('계정 삭제 중 오류가 발생했습니다.');
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

  // ─── Firestore 실시간 좋아요 카운트 ──────────────────────────────────────
  const POST_IDS = ['mbti', 'vocab', 'textbook', 'seteuk', 'aiSeteuk'] as const;
  const BASE_LIKES: Record<string, number> = { mbti: 384, vocab: 295, textbook: 512, seteuk: 647, aiSeteuk: 729 };
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
    mbti: false, vocab: false, textbook: false, seteuk: false, aiSeteuk: false,
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
      id: 'textbook',
      title: '3개년 교과서 7권 대공개',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1000&q=80',
      tag: '1부스',
      likes: remoteLikes.textbook,
    },
    {
      id: 'vocab',
      title: '소리로 배우는 영단어',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      tag: '2부스',
      likes: remoteLikes.vocab,
    },
    {
      id: 'mbti',
      title: 'MBTI별 본문 추천',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
      tag: '3부스',
      likes: remoteLikes.mbti,
    },
    {
      id: 'seteuk',
      title: '진로별 세특 발전소',
      imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80',
      tag: '4부스',
      likes: remoteLikes.seteuk,
    },
    {
      id: 'aiSeteuk',
      title: 'AI 자유 탐구 세특 스튜디오',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      tag: 'AI연구소',
      likes: remoteLikes.aiSeteuk,
    },
  ], [remoteLikes]);

  // ─── 🏛️ 1. uryeo_eng 공식 계정 그리드 그룹 (4대 부스) ────────────────────────
  const officialGridGroup = useMemo(() => ({
    username: 'uryeo_eng',
    displayName: '의령여고 영어과 공식',
    avatar: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=200&q=80',
    isOfficial: true,
    isTeacher: true,
    posts: [
      {
        id: 'textbook',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
        title: '교과서 7권 대공개',
        tag: '#1부스',
        likes: remoteLikes.textbook,
        onClick: () => (onSelectGridPost ? onSelectGridPost('textbook') : onScrollTo('textbook')),
      },
      {
        id: 'vocab',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        title: '단어 미리보기',
        tag: '#2부스',
        likes: remoteLikes.vocab,
        onClick: () => (onSelectGridPost ? onSelectGridPost('vocab') : onScrollTo('vocab')),
      },
      {
        id: 'mbti',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
        title: 'MBTI별 본문 추천',
        tag: '#3부스',
        likes: remoteLikes.mbti,
        onClick: () => (onSelectGridPost ? onSelectGridPost('mbti') : onScrollTo('mbti')),
      },
      {
        id: 'seteuk',
        imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
        title: '세특 발전소',
        tag: '#4부스',
        likes: remoteLikes.seteuk,
        onClick: () => (onSelectGridPost ? onSelectGridPost('seteuk') : onScrollTo('seteuk')),
      },
      {
        id: 'aiSeteuk',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        title: 'AI 자유 세특',
        tag: '#AI랩',
        likes: remoteLikes.aiSeteuk,
        onClick: () => (onSelectGridPost ? onSelectGridPost('aiSeteuk') : onScrollTo('aiSeteuk')),
      },
    ],
  }), [remoteLikes, onSelectGridPost, onScrollTo]);

  // ─── 👥 2. 참여자 라이브 피드 - 개인 계정들의 피드 모음 (계정별 그리드) ───────────
  const participantGridGroups = useMemo(() => {
    const byAuthor: Record<string, typeof userPosts> = {};
    userPosts.forEach((p) => {
      const author = p.authorName || '익명_체험자';
      if (!byAuthor[author]) byAuthor[author] = [];
      byAuthor[author].push(p);
    });

    const groups: Array<{
      username: string;
      displayName: string;
      avatar: string;
      isTeacher?: boolean;
      isOfficial?: boolean;
      posts: Array<{
        id: string;
        imageUrl: string;
        title: string;
        tag?: string;
        likes?: number;
        onClick?: () => void;
      }>;
    }> = [];

    Object.entries(byAuthor).forEach(([author, posts]) => {
      if (author.toLowerCase() === 'uryeo_eng') return;
      const firstPost = posts[0];
      const isTeacher = isTeacherAccount(author);
      const isOfficial = isOfficialAccount(author);

      groups.push({
        username: author,
        displayName: firstPost.displayName || author,
        avatar: firstPost.avatar,
        isTeacher,
        isOfficial,
        posts: posts.map((post) => ({
          id: post.id,
          imageUrl: post.photoUrl,
          title: post.caption || `${author}님의 부스 인증`,
          tag: post.tag,
          likes: post.likesCount,
        })),
      });
    });

    return groups;
  }, [userPosts]);

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
        : '🎓 2026 의령여자고등학교 고교학점제 박람회 참가자 ✨',
    });
    setIsProfileViewModalOpen(true);
  };

  // 하단 바 계정 아이콘 클릭 이벤트 수신 (LiveBottomBar → open-my-profile)
  useEffect(() => {
    const handler = () => handleOpenMyProfile();
    window.addEventListener('open-my-profile', handler);
    return () => window.removeEventListener('open-my-profile', handler);
  });

  // 의령여고 영어과 공식 프로필 열기
  const handleOpenOfficialProfile = () => {
    setViewingProfile({
      username: 'uryeo_eng',
      displayName: '의령여고 영어과',
      avatar: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=200&q=80',
      isTeacher: true,
      isOfficial: true,
      bio: '🏛️ 2026 의령여자고등학교 고교학점제 박람회 영어과 공식 계정\n📍 4대 부스 체험 & 학종 맞춤형 교육과정 전시관',
    });
    setIsProfileViewModalOpen(true);
  };

  // 다른 학생/선생님 참가자 프로필 열기
  const handleOpenParticipantProfile = (authorName: string, avatar: string) => {
    if (isOfficialAccount(authorName)) {
      handleOpenOfficialProfile();
      return;
    }
    const isTeacher = isTeacherAccount(authorName);
    setViewingProfile({
      username: authorName,
      displayName: authorName,
      avatar,
      isTeacher,
      isOfficial: false,
      bio: isTeacher
        ? '👩‍🏫 의령여고 영어과 지도교사'
        : '🎓 2026 의령여고 고교학점제 박람회 참가자\n✨ 함께 부스를 즐기고 멋진 피드를 공유해요!',
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
      <section className="bg-white border-b border-slate-200/60 pt-2.5 pb-1 overflow-hidden">
        {/* 스크롤 컨테이너: pb-2 → 라벨과 스크롤바 사이 여백 확보 */}
        <div className="flex items-start gap-3 overflow-x-auto no-scrollbar px-3 pb-2">

          {/* 🌟 1. ➕ 새 피드 올리기 버튼 (로그인 전: 로그인 유도 / 후: 바로 작성) */}
          <div
            onClick={() => {
              if (!currentUser) {
                setProfileModalInitialMode('guest');
                setIsProfileModalOpen(true);
              } else {
                setIsCreatePostModalOpen(true);
              }
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
          >
            <div className="relative w-[52px] h-[52px] rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-[1.5px] border-slate-200 group-hover:border-slate-400 flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-95 shadow-sm">
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-slate-800 transition-colors stroke-[1.8]" />
            </div>
            <div className="flex flex-col items-center w-[60px] text-center">
              <span className="text-[9.5px] font-semibold leading-tight text-slate-500 tracking-tight truncate w-full group-hover:text-slate-800 transition-colors">
                {currentUser ? '피드 올리기' : '로그인'}
              </span>
            </div>
          </div>

          {/* 🌟 2. 의령여고 영어과 공식 계정 */}
          <div
            onClick={handleOpenOfficialProfile}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
          >
            <div className="relative w-[52px] h-[52px] rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-600 shadow-sm transition-transform duration-200 group-hover:scale-110 active:scale-95">
              <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=200&q=80" alt="의령여고 영어과 공식" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 border-[1.5px] border-white flex items-center justify-center text-white text-[8px] font-black shadow-sm">★</div>
            </div>
            <div className="flex flex-col items-center w-[60px] text-center">
              <span className="text-[9.5px] font-semibold leading-tight text-slate-700 tracking-tight truncate w-full group-hover:text-rose-600 transition-colors">의령여고 공식</span>
              <span className="text-[8.5px] leading-tight text-rose-500 font-medium truncate w-full">@uryeo_eng</span>
            </div>
          </div>

          {/* 🌟 2-1. Q&A 챗봇 */}
          <div
            onClick={handleOpenDmModal}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
            title="의령여고 영어과 Q&A AI 챗봇 1:1 대화"
          >
            <div className="relative w-[52px] h-[52px] rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-600 shadow-sm transition-transform duration-200 group-hover:scale-110 active:scale-95">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <Bot className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-600 border-[1.5px] border-white flex items-center justify-center text-white text-[6.5px] font-black shadow-sm">AI</div>
            </div>
            <div className="flex flex-col items-center w-[60px] text-center">
              <span className="text-[9.5px] font-semibold leading-tight text-slate-700 tracking-tight truncate w-full group-hover:text-violet-600 transition-colors">질문 챗봇</span>
              <span className="text-[8.5px] leading-tight text-violet-500 font-medium truncate w-full">@uryeo_qa_bot</span>
            </div>
          </div>

          {/* 🌟 3. 실시간 참여자 스토리 */}
          {studentStoryList.map((st) => (
            <div
              key={st.postId}
              onClick={() => handleOpenParticipantProfile(st.authorName, st.avatar)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
            >
              <div className="relative w-[52px] h-[52px] rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 shadow-sm transition-transform duration-200 group-hover:scale-110 active:scale-95">
                <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                  <img src={st.avatar} alt={st.authorName} className="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col items-center w-[60px] text-center">
                <span className="text-[9.5px] font-semibold leading-tight text-slate-700 tracking-tight truncate w-full group-hover:text-teal-600 transition-colors">참여자</span>
                <span className="text-[8.5px] leading-tight text-slate-400 font-medium truncate w-full">@{st.authorName.replace(/^@/, '')}</span>
              </div>
            </div>
          ))}

          {/* 🌟 4. 참여자 피드 없을 때 안내 */}
          {studentStoryList.length === 0 && (
            <div
              onClick={() => { if (!currentUser) setIsProfileModalOpen(true); else setIsCreatePostModalOpen(true); }}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer select-none opacity-60 hover:opacity-90 transition-opacity"
            >
              <div className="w-[52px] h-[52px] rounded-full border-[1.5px] border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50/80">
                <span className="text-base leading-none">✍️</span>
                <span className="text-[7.5px] font-bold mt-0.5 text-slate-400">첫 피드</span>
              </div>
              <div className="flex flex-col items-center w-[60px] text-center">
                <span className="text-[9.5px] font-semibold leading-tight text-slate-400">참여자 피드</span>
                <span className="text-[8.5px] leading-tight text-slate-300">대기 중</span>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* 🌟 2. 인스타그램 3열 그리드 뷰 모드 */}
      {viewMode === 'grid' ? (
        <section className="bg-slate-100/70 border-y border-slate-200 p-2 sm:p-3 space-y-4 animate-in fade-in duration-300">
          {/* =========================================================================
              🏛️ 1. uryeo_eng 피드 모음 (그리드뷰)
              ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <h3 className="text-xs font-black text-slate-900 tracking-tight">
                  uryeo_eng 의령여고 공식 피드
                </h3>
              </div>
            </div>

            {/* uryeo_eng 공식 계정 카드 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs space-y-2.5 p-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div
                  onClick={handleOpenOfficialProfile}
                  className="flex items-center gap-2.5 cursor-pointer group select-none"
                >
                  <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-xs">
                    <img
                      src={officialGridGroup.avatar}
                      alt="uryeo_eng"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                        @{officialGridGroup.username}
                      </span>
                      <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.2 rounded-full">
                        ★ 공식
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-medium">
                      {officialGridGroup.displayName} · 4개 부스 코너
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenOfficialProfile}
                  className="text-[11px] font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-0.5 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full transition-colors"
                >
                  <span>프로필</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3열 그리드 (4대 공식 부스) */}
              <div className="grid grid-cols-3 gap-1.5">
                {officialGridGroup.posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={post.onClick}
                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-slate-100 shadow-2xs border border-slate-100 hover:opacity-90 active:scale-95 transition-all"
                    title={post.title}
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1">
                      <span className="text-[10px] font-bold text-center line-clamp-2">
                        {post.title}
                      </span>
                    </div>
                    {post.tag && (
                      <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-2xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        {post.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              👥 2. 참여자 라이브 피드 - 개인 계정들의 피드 모음 (계정별 그리드뷰)
              ========================================================================= */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <div>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight">
                    참여자 라이브 피드
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">개인 계정들의 피드 모음 (계정별 그리드뷰)</p>
                </div>
              </div>
              <span className="text-[10px] text-pink-700 font-semibold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                {participantGridGroups.length}개 계정 ({userPosts.length}개 피드)
              </span>
            </div>

            {/* 각 개인 계정별 카드 & 3열 그리드 */}
            {participantGridGroups.map((grp) => (
              <div
                key={grp.username}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs space-y-2.5 p-3.5"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div
                    onClick={() => handleOpenParticipantProfile(grp.username, grp.avatar)}
                    className="flex items-center gap-2.5 cursor-pointer group select-none"
                  >
                    <div className="relative w-9 h-9 rounded-full p-[1.5px] bg-slate-200 shadow-2xs">
                      <img
                        src={grp.avatar}
                        alt={grp.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                          @{grp.username}
                        </span>
                        {grp.isTeacher && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.2 rounded-full">
                            🛡️ 교사
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {grp.displayName} · 피드 {grp.posts.length}개
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isOfficialAdmin && grp.username.toLowerCase() !== 'uryeo_eng' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUserAccount(grp.username);
                        }}
                        className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                        title="공식 최고 관리자: 계정 및 모든 글/댓글 영구 삭제"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span>계정삭제</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenParticipantProfile(grp.username, grp.avatar)}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-0.5 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full transition-colors"
                    >
                      <span>프로필</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {grp.posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={post.onClick}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-slate-100 shadow-2xs border border-slate-100 hover:opacity-90 active:scale-95 transition-all"
                      title={post.title}
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1">
                        <span className="text-[10px] font-bold text-center line-clamp-2">
                          {post.title}
                        </span>
                      </div>
                      {post.tag && (
                        <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-2xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          {post.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {participantGridGroups.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center text-slate-400 space-y-1.5 border border-slate-200">
                <p className="text-xs font-bold text-slate-600">아직 등록된 참여자 피드가 없습니다.</p>
                <p className="text-[11px] text-slate-400">부스 체험 후 첫 인증 피드를 남겨보세요! ✨</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* =========================================================================
              🏛️ 1. uryeo_eng 피드 모음 (목록 뷰)
              ========================================================================= */}
          <div className="flex items-center justify-between px-3.5 pt-3 pb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <h3 className="text-xs font-black text-slate-900 tracking-tight">
                uryeo_eng 의령여고 공식 피드
              </h3>
            </div>
          </div>

          {/* =========================================================================
              📸 3. 단일 무한 피드 모드 (인라인 아코디언)
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
                      171개 섹션 정밀 검증
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">3개년 교육과정 전시관 · 7권 교과서</p>
                </div>
              </div>
              <button className="text-slate-400 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* 포스트 메인 히어로 카드 (2지 핀치 줌 & 더블탭 좋아요) */}
            <div onClick={() => onToggleSection('textbook')} className="cursor-pointer">
            <PinchablePhoto
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1000&q=80"
              alt="도서관 교과서"
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between group select-none overflow-hidden"
              imageClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.65]"
              onDoubleTap={() => {
                if (!likedPosts.textbook) toggleLike('textbook');
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 pointer-events-none" />

              <div className="space-y-1 relative z-10 pt-4 pointer-events-none">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  의령여고 3개년 교과서 7권 대공개!
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 font-light">
                  표지를 누르면 단원 안으로 쏙! 듣기·말하기·읽기·문법·쓰기 원본 E-Book을 바로 열람하세요.
                </p>
              </div>
            </PinchablePhoto>
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
                  공통영어부터 심화영어까지, 171개 모든 파트의 학습 내용이 100% 정밀 검증되어 있습니다.
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
                      {expandedSections.textbook ? '7권 교과서 뷰어 접기' : '의령여고 3개년 교과서 열람하기'}
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

              {/* 💬 단일 공통 댓글 모듈 */}
              <PostCommentsSection
                postId="textbook"
                currentUser={currentUser}
                isAnyAdmin={isAnyAdmin}
                onOpenProfile={handleOpenParticipantProfile}
                onRequireLogin={() => setIsProfileModalOpen(true)}
                avatarGradient="from-emerald-500 to-teal-500"
              />
            </div>
          </article>

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
                  <p className="text-[10px] text-slate-500">어휘 레벨 측정 스테이션 · 7권 35세트</p>
                </div>
              </div>
              <button className="text-slate-400 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* 포스트 메인 히어로 카드 (2지 핀치 줌 & 더블탭 좋아요) */}
            <div onClick={() => onToggleSection('vocab')} className="cursor-pointer">
            <PinchablePhoto
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
              alt="영어 듣기와 단어 퀴즈"
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between group select-none overflow-hidden"
              imageClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.68]"
              onDoubleTap={() => {
                if (!likedPosts.vocab) toggleLike('vocab');
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 pointer-events-none" />

              <div className="space-y-1.5 relative z-10 pt-4 pointer-events-none">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                  단어 미리보기
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow-sm">
                  1~4번 문맥 어휘 확인 + 5번 문제는 단어를 가리고 오직 소리만 듣고 맞추기!
                </p>
              </div>
            </PinchablePhoto>
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

              {/* 💬 단일 공통 댓글 모듈 */}
              <PostCommentsSection
                postId="vocab"
                currentUser={currentUser}
                isAnyAdmin={isAnyAdmin}
                onOpenProfile={handleOpenParticipantProfile}
                onRequireLogin={() => setIsProfileModalOpen(true)}
                avatarGradient="from-purple-500 to-indigo-500"
              />
            </div>
          </article>

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

            {/* 포스트 메인 히어로 카드 (2지 핀치 줌 & 더블탭 좋아요) */}
            <div onClick={() => onToggleSection('mbti')} className="cursor-pointer">
            <PinchablePhoto
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80"
              alt="영어 공부와 성향 탐색"
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between group select-none overflow-hidden"
              imageClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.72]"
              onDoubleTap={() => {
                if (!likedPosts.mbti) toggleLike('mbti');
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 pointer-events-none" />

              <div className="space-y-1.5 relative z-10 pt-4 pointer-events-none">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                  MBTI별 본문 추천
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow-sm">
                  나의 성향과 꼭 맞는 의령여고 영어 교과서 본문을 찾아보세요!
                </p>
              </div>
            </PinchablePhoto>
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

              {/* 💬 단일 공통 댓글 모듈 */}
              <PostCommentsSection
                postId="mbti"
                currentUser={currentUser}
                isAnyAdmin={isAnyAdmin}
                onOpenProfile={handleOpenParticipantProfile}
                onRequireLogin={() => setIsProfileModalOpen(true)}
                avatarGradient="from-pink-500 via-purple-500 to-indigo-500"
              />
            </div>
          </article>

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

            {/* 포스트 메인 히어로 카드 (2지 핀치 줌 & 더블탭 좋아요) */}
            <div onClick={() => onToggleSection('seteuk')} className="cursor-pointer">
            <PinchablePhoto
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80"
              alt="노트 공부 세특"
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between group select-none overflow-hidden"
              imageClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.60]"
              onDoubleTap={() => {
                if (!likedPosts.seteuk) toggleLike('seteuk');
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 pointer-events-none" />

              <div className="space-y-1 relative z-10 pt-4 pointer-events-none">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  교과서 지문이 나만의 세특 치트키로 변신!
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 font-light">
                  희망 진로(의학·AI·미디어·교육) 맞춤형 탐구 주제와 학생부 기재 예시를 확인하세요.
                </p>
              </div>
            </PinchablePhoto>
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

              {/* 💬 단일 공통 댓글 모듈 */}
              <PostCommentsSection
                postId="seteuk"
                currentUser={currentUser}
                isAnyAdmin={isAnyAdmin}
                onOpenProfile={handleOpenParticipantProfile}
                onRequireLogin={() => setIsProfileModalOpen(true)}
                avatarGradient="from-amber-500 to-orange-500"
              />
            </div>
          </article>

          {/* =========================================================================
          📸 6. 인피드 아코디언 포스트 5: AI 자유 탐구 세특 스튜디오 (AI Custom Seteuk Lab)
          ========================================================================= */}
          <article
            ref={feedRefs.aiSeteukRef}
            className="bg-white border-y border-slate-200/90 overflow-hidden shadow-2xs scroll-mt-14"
          >
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-violet-500 via-indigo-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white p-0.5 flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">ur_ai_seteuk_lab</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.2 rounded">
                      ✨ 생성형 AI 세특
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">자유 진로 RAG 스튜디오 · 7권 교과서 실시간 연계</p>
                </div>
              </div>
              <button className="text-slate-400 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* 포스트 메인 히어로 카드 (2지 핀치 줌 & 더블탭 좋아요) */}
            <div onClick={() => onToggleSection('aiSeteuk')} className="cursor-pointer">
              <PinchablePhoto
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80"
                alt="AI 맞춤형 세특 연구소"
                className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between group select-none overflow-hidden"
                imageClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.7]"
                onDoubleTap={() => {
                  if (!likedPosts.aiSeteuk) toggleLike('aiSeteuk');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 pointer-events-none" />

                <div className="space-y-1 relative z-10 pt-4 pointer-events-none">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                    어떤 꿈이든 100% 매칭! 나만의 AI 자유 탐구 세특 🚀
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 font-light">
                    나만의 관심 키워드(우주항공·뇌과학·웹툰 등)를 입력하면, 7권 교과서에서 딱 맞는 지문을 찾아 세특 초안을 완성합니다.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 relative z-10 pointer-events-none">
                  <span className="flex items-center gap-1.5 text-violet-300 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    Gemini 3.5 AI × 7권 교과서 RAG
                  </span>
                  <span className="text-[11px] bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full font-bold">
                    터치하여 AI 세특 생성 ▾
                  </span>
                </div>
              </PinchablePhoto>
            </div>

            {/* 인스타그램 액션 바 */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLike('aiSeteuk')} className="transition-transform active:scale-125 cursor-pointer">
                    <Heart
                      className={`w-6 h-6 ${likedPosts.aiSeteuk ? 'text-red-500 fill-red-500 stroke-red-500' : 'text-slate-800'}`}
                    />
                  </button>
                  <button onClick={() => onToggleSection('aiSeteuk')} className="cursor-pointer">
                    <MessageCircle className="w-6 h-6 text-slate-800" />
                  </button>
                  <button className="cursor-pointer">
                    <Send className="w-6 h-6 text-slate-800" />
                  </button>
                </div>
                <button onClick={() => toggleSave('aiSeteuk')} className="cursor-pointer">
                  <Bookmark
                    className={`w-6 h-6 ${savedPosts.aiSeteuk ? 'text-slate-900 fill-slate-900' : 'text-slate-800'}`}
                  />
                </button>
              </div>

              {/* 좋아요 카운트 */}
              <div className="text-xs font-bold text-slate-900">
                좋아요 {remoteLikes.aiSeteuk.toLocaleString()}개
              </div>

              {/* 본문 캡션 & 인라인 열람 버튼 */}
              <div className="pt-1 text-xs">
                <span className="font-bold text-slate-900 mr-2">ur_ai_seteuk_lab</span>
                <span className="text-slate-800">
                  정형화된 8대 진로를 넘어, 학생 한 명 한 명의 고유한 꿈과 호기심을 의령여고 영어 교육과정과 1:1로 실시간 융합합니다. ✨
                </span>

                <button
                  onClick={() => onToggleSection('aiSeteuk')}
                  className="w-full mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-violet-50/60 border border-slate-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-violet-600">
                      {expandedSections.aiSeteuk ? 'AI 세특 스튜디오 접기' : 'AI 자유 탐구 세특 생성기 열기'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-violet-600">
                    <span>{expandedSections.aiSeteuk ? '닫기' : '펼쳐보기'}</span>
                    {expandedSections.aiSeteuk ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
              </div>

              {/* 🌟 아코디언 인라인 AI 세특 스튜디오창 */}
              {expandedSections.aiSeteuk && (
                <div className="mt-2.5 border border-violet-200 rounded-2xl overflow-hidden bg-slate-50 animate-in slide-in-from-top-2 duration-300">
                  <AiCustomSeteukLab onOpenImage={onOpenImage} />
                </div>
              )}

              {/* 💬 단일 공통 댓글 모듈 */}
              <PostCommentsSection
                postId="aiSeteuk"
                currentUser={currentUser}
                isAnyAdmin={isAnyAdmin}
                onOpenProfile={handleOpenParticipantProfile}
                onRequireLogin={() => setIsProfileModalOpen(true)}
                avatarGradient="from-violet-500 to-purple-600"
              />
            </div>
          </article>

          {/* 🌟 2. 참여자 라이브 피드 - 개인 계정들의 피드 모음 (User Live Feed Stream) */}
      {userPosts.length > 0 && (
        <section className="space-y-4 pt-3">
          <div className="flex items-center justify-between px-3.5 pt-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <div>
                <h3 className="text-xs font-black text-slate-800 tracking-tight">
                  참여자 라이브 피드 ({userPosts.length})
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">개인 계정들의 피드 모음</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!currentUser) {
                  setProfileModalInitialMode('guest');
                  setIsProfileModalOpen(true);
                  alert('피드를 작성하려면 먼저 부스 활동에 사용할 아이디(닉네임)를 설정해 주세요!');
                } else {
                  setIsCreatePostModalOpen(true);
                }
              }}
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
                        {isOfficialAccount(post.authorName) ? (
                          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            ★ 공식
                          </span>
                        ) : isTeacherAccount(post.authorName) ? (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                            교사
                          </span>
                        ) : null}
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

                  <div className="flex items-center gap-1.5">
                    {/* 최고 관리자(uryeo_eng): 계정 및 피드/댓글 일괄 영구 삭제 */}
                    {isOfficialAdmin && post.authorName.toLowerCase() !== 'uryeo_eng' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUserAccount(post.authorName)}
                        title="공식 최고 관리자 권한: 작성자 계정 및 모든 글/댓글 영구 삭제"
                        className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>계정삭제</span>
                      </button>
                    )}

                    {/* 단일 게시물 삭제 버튼 (본인 또는 선생님 관리자 권한) */}
                    {canDelete ? (
                      <button
                        type="button"
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
                </div>

                {/* 피드 사진: 인스타그램 2지 핀치 줌 & 더블탭 좋아요 */}
                <div
                  className="relative w-full max-h-[580px] min-h-[220px] bg-slate-950 flex items-center justify-center overflow-hidden group select-none"
                  style={{ touchAction: 'pan-y' }}
                >
                  <PinchablePhoto
                    src={post.photoUrl}
                    alt="게시물 사진"
                    className="w-full max-h-[580px] flex items-center justify-center"
                    imageClassName="max-h-[580px] object-contain"
                    onDoubleTap={() => {
                      if (!isLiked) {
                        toggleUserPostLikeHandler(post.id);
                      }
                    }}
                  >
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white/95 text-[10px] rounded-full font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                      <span>핀치 확대 · 더블탭 ❤️</span>
                    </div>
                  </PinchablePhoto>
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
                          className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-red-500 stroke-red-500' : 'hover:text-slate-600'
                            }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          const inputEl = document.querySelector<HTMLInputElement>(`#user_post_${post.id} input`);
                          inputEl?.focus();
                        }}
                        className="hover:text-slate-600 transition-colors cursor-pointer"
                        title="댓글 달기"
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

                  {/* 💬 참여자 피드 단일 공통 댓글 모듈 */}
                  <div className="pt-1">
                    <PostCommentsSection
                      postId={post.id}
                      currentUser={currentUser}
                      isAnyAdmin={isAnyAdmin}
                      onOpenProfile={handleOpenParticipantProfile}
                      onRequireLogin={() => setIsProfileModalOpen(true)}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  )}

      {/* 피드 최하단 안내 */}
      <div className="text-center py-6 space-y-1.5">
        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto text-xs font-bold">
          ✨
        </div>
        <p className="text-xs font-bold text-slate-700">모든 소식을 다 확인했습니다</p>
        <p className="text-[10px] text-slate-400">
          2026 의령여자고등학교 고교학점제 박람회 영어과 인피드 앱
        </p>
      </div>

      {/* ─── 팝업 모달 ─────────────────────────────────────────────────── */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={currentUser}
        initialMode={profileModalInitialMode}
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
        canManageAccounts={isOfficialAdmin}
        onDeleteAccount={handleDeleteUserAccount}
      />

      {/* 🤖 인스타그램 1:1 DM 스타일 Q&A 챗봇 모달 */}
      <InstagramDmChatModal
        isOpen={isDmModalOpen}
        onClose={handleCloseDmModal}
      />
    </div>
  );
};
