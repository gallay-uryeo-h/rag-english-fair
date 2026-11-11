import React, { useState } from 'react';
import { X, Image as ImageIcon, Send, Sparkles, Check, Tag } from 'lucide-react';
import type { UserProfile } from '../utils/userProfile';
import { addUserPost } from '../services/firestoreService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

// 박람회 피드용 감성 사진 프리셋 목록
const POST_PHOTO_PRESETS = [
  {
    id: 'p1',
    label: '친구들과 함께',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p2',
    label: '영어 공부와 열정',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p3',
    label: '음악과 오디오 퀴즈',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p4',
    label: '도서관과 교과서',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p5',
    label: '미래 진로와 세특 노트',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p6',
    label: '따뜻한 캠퍼스 풍경',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  },
];

const PRESET_TAGS = [
  '#의령여고영어박람회',
  '#MBTI본문추천',
  '#단어소리퀴즈100점',
  '#3개년교과서대공개',
  '#세특치트키발전소',
  '#영어과부스체험',
];

export const CreatePostModal: React.FC<Props> = ({ isOpen, onClose, currentUser }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(POST_PHOTO_PRESETS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isUsingCustom, setIsUsingCustom] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedTag, setSelectedTag] = useState(PRESET_TAGS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentPhotoUrl = isUsingCustom && customPhotoUrl.trim() ? customPhotoUrl.trim() : selectedPhoto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      alert('피드 내용을 입력해 주세요!');
      return;
    }

    try {
      setIsSubmitting(true);
      await addUserPost({
        authorId: currentUser.uid,
        authorName: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        photoUrl: currentPhotoUrl,
        caption: caption.trim(),
        tag: selectedTag,
      });

      setCaption('');
      onClose();
      alert('📸 피드가 성공적으로 공유되었습니다!');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('피드 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">새 피드 만들기</h3>
              <p className="text-[11px] text-slate-500">@{currentUser.username} 계정으로 게시</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 작성 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
          {/* 사진 프리뷰 */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
            <img
              src={currentPhotoUrl}
              alt="피드 사진"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Tag className="w-3 h-3 text-pink-400" />
              <span>{selectedTag}</span>
            </div>
          </div>

          {/* 사진 프리셋 선택 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>박람회 사진 선택</span>
              </span>
              <button
                type="button"
                onClick={() => setIsUsingCustom(!isUsingCustom)}
                className="text-[11px] text-purple-600 hover:underline cursor-pointer"
              >
                {isUsingCustom ? '프리셋에서 고르기' : '직접 URL 입력'}
              </button>
            </div>

            {isUsingCustom ? (
              <input
                type="url"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="이미지 웹 주소(URL)를 입력하세요"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500"
              />
            ) : (
              <div className="grid grid-cols-6 gap-1.5">
                {POST_PHOTO_PRESETS.map((p) => {
                  const isSelected = selectedPhoto === p.url && !isUsingCustom;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(p.url);
                        setIsUsingCustom(false);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected
                          ? 'border-pink-500 scale-105 shadow-xs ring-2 ring-pink-200'
                          : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-pink-500/25 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white stroke-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 태그 선택 */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">인기 해시태그</label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${selectedTag === tag
                      ? 'bg-pink-50 text-pink-600 border-pink-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 본문 입력창 */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">문구 입력</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="박람회 체험 소감이나 친구들에게 남길 메시지를 적어보세요! ✨"
              rows={3}
              maxLength={300}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
              required
            />
            <div className="flex justify-end text-[10px] text-slate-400">
              {caption.length} / 300자
            </div>
          </div>

          {/* 게시 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || !caption.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-bold hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? '게시 중...' : '피드 공유하기'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
