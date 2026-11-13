import React, { useState, useEffect } from 'react';
import { Trash2, Send, Loader2 } from 'lucide-react';
import {
  addComment,
  subscribeComments,
  deleteComment,
  appendCommentToSession,
} from '../services/firestoreService';
import type { FsComment } from '../services/firestoreService';
import { containsProfanity, PROFANITY_ALERT_MESSAGE } from '../utils/profanityFilter';
import type { UserProfile } from '../utils/userProfile';
import { DEFAULT_GUEST_AVATAR } from '../utils/userProfile';

interface Props {
  postId: string;
  currentUser: UserProfile | null;
  isAnyAdmin: boolean;
  onOpenProfile: (authorName: string, avatar: string) => void;
  onRequireLogin: () => void;
  avatarGradient?: string; // 옵션: 아바타 테두리 그라데이션
}

export const PostCommentsSection: React.FC<Props> = ({
  postId,
  currentUser,
  isAnyAdmin,
  onOpenProfile,
  onRequireLogin,
  avatarGradient = 'from-pink-500 via-purple-500 to-indigo-500',
}) => {
  const [comments, setComments] = useState<FsComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 실시간 댓글 구독
  useEffect(() => {
    if (!postId) return;
    const unsub = subscribeComments(postId, (fetched) => {
      setComments(fetched);
    });
    return () => unsub();
  }, [postId]);

  // 댓글 등록 핸들러
  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      onRequireLogin();
      alert('댓글을 작성하려면 먼저 부스 활동에 사용할 아이디(닉네임)를 설정해 주세요!');
      return;
    }

    const text = commentText.trim();
    if (!text) return;

    // 🛡️ 비속어 및 부적절한 언어 감지 차단
    if (containsProfanity(text)) {
      alert(PROFANITY_ALERT_MESSAGE);
      return;
    }

    try {
      setIsSubmitting(true);
      await addComment(postId, text, currentUser.username, currentUser.uid);
      setCommentText('');
      // 새 댓글 등록 시 자동으로 펼쳐서 볼 수 있게 처리
      setIsExpanded(true);
      // 📦 user_session: 댓글 기록
      appendCommentToSession(currentUser.username, postId).catch(console.error);
    } catch (err) {
      console.error('댓글 등록 실패:', err);
      alert('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 삭제 핸들러 (관리자 전체 또는 본인)
  const handleDelete = async (comment: FsComment) => {
    const isOwner = Boolean(
      currentUser &&
      (comment.author === currentUser.username || comment.author === `@${currentUser.username}`)
    );
    const canDelete = isAnyAdmin || isOwner;
    if (!canDelete) {
      alert('본인이 작성한 댓글이거나 관리자만 삭제할 수 있습니다.');
      return;
    }

    const confirmMsg = isAnyAdmin && !isOwner
      ? `[관리자 권한] @${comment.author} 님의 댓글을 강제 삭제하시겠습니까?\n내용: "${comment.text}"`
      : '댓글을 삭제하시겠습니까?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteComment(comment.id);
      alert('댓글이 삭제되었습니다.');
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const displayedComments = isExpanded ? comments : comments.slice(-2);

  return (
    <div className="space-y-2">
      {/* 💬 댓글 목록 */}
      {comments.length > 0 && (
        <div className="pt-2 space-y-1">
          {comments.length > 2 && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-[11px] text-slate-400 font-medium hover:text-slate-600 cursor-pointer block text-left transition-colors"
            >
              {isExpanded
                ? '댓글 접기'
                : `댓글 ${comments.length}개 모두 보기`}
            </button>
          )}

          {displayedComments.map((c) => {
            const isOwner = Boolean(
              currentUser &&
              (c.author === currentUser.username || c.author === `@${currentUser.username}`)
            );
            const canDelete = isAnyAdmin || isOwner;

            return (
              <div
                key={c.id}
                className="text-xs flex items-baseline justify-between gap-2 group/c py-0.5"
              >
                <div className="flex-1 min-w-0 flex items-baseline flex-wrap">
                  <button
                    type="button"
                    onClick={() => onOpenProfile(c.author, DEFAULT_GUEST_AVATAR)}
                    className="font-bold text-slate-900 mr-1.5 hover:text-purple-600 hover:underline cursor-pointer"
                    title={`@${c.author} 프로필 보기 및 관리`}
                  >
                    @{c.author.replace(/^@/, '')}
                  </button>
                  <span className="text-slate-700 break-words">{c.text}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-400">
                    {c.timestamp
                      ? new Date(c.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '방금 전'}
                  </span>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      title={isAnyAdmin && !isOwner ? '선생님/관리자 권한 댓글 삭제' : '내 댓글 삭제'}
                      className="text-slate-300 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 💬 인스타그램 스타일 실시간 댓글 입력창 */}
      <form onSubmit={handleAdd} className="pt-2.5 pb-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* 아바타 아이콘 */}
          <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${avatarGradient} p-0.5 shrink-0 shadow-2xs`}>
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                'U'
              )}
            </div>
          </div>

          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder={currentUser ? `${currentUser.username}(으)로 댓글 달기...` : '댓글 달기...'}
            maxLength={150}
            disabled={isSubmitting}
            className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden py-1"
          />

          {commentText.trim().length > 0 && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 disabled:opacity-40 transition-colors cursor-pointer px-1.5 flex items-center gap-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>게시</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

