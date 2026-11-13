import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Send,
  Tag,
  Camera,
  Loader2,
  Check,
} from 'lucide-react';
import type { UserProfile } from '../utils/userProfile';
import { addUserPost, saveUserActivity, appendFeedToSession } from '../services/firestoreService';
import { usePhotoPicker } from '../hooks/usePhotoPicker';
import { PhotoPickerButtons } from './PhotoPickerButtons';
import { containsProfanity, PROFANITY_ALERT_MESSAGE } from '../utils/profanityFilter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onPostCreated?: (postId: string) => void;
}

// 🌟 고화질 & 감성적인 박람회 테마 사진 프리셋 (에디토리얼 매거진 감성 6종)
const POST_PHOTO_PRESETS = [
  {
    id: 'p1',
    label: '부스 페스티벌',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'p2',
    label: '친구들과 추억',
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'p3',
    label: '원어민 오디오 챌린지',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'p4',
    label: '감성 북카페 & 원서',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'p5',
    label: '세특 & 스터디 탐구',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'p6',
    label: '글로벌 캠퍼스 비전',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85',
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

export const CreatePostModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onPostCreated,
}) => {
  // 📸 통일된 사진 촬영/업로드 훅 (피드용: 1080x1350 고품질)
  const {
    openCamera,
    openGallery,
    isProcessing: isCompressing,
    photo: userUploadedPhoto,
    clearPhoto,
    hiddenInputs,
  } = usePhotoPicker({
    maxWidth: 1080,
    maxHeight: 1350,
    quality: 0.84,
    onSuccess: () => {
      setUseUploadMode(true);
    },
  });

  const [selectedPresetPhoto, setSelectedPresetPhoto] = useState<string>(POST_PHOTO_PRESETS[0].url);
  const [useUploadMode, setUseUploadMode] = useState<boolean>(true); // 기본: 내 사진 올리기 모드
  const [caption, setCaption] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>(PRESET_TAGS[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // 현재 표시할 최종 사진 URL (업로드된 사진 우선)
  const currentPhotoUrl =
    useUploadMode && userUploadedPhoto
      ? userUploadedPhoto.dataUrl
      : selectedPresetPhoto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      alert('피드 내용을 입력해 주세요!');
      return;
    }

    if (containsProfanity(caption)) {
      alert(PROFANITY_ALERT_MESSAGE);
      return;
    }

    try {
      setIsSubmitting(true);
      const newPostId = await addUserPost({
        authorId: currentUser.uid,
        authorName: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        photoUrl: currentPhotoUrl,
        caption: caption.trim(),
        tag: selectedTag,
      });

      setCaption('');
      clearPhoto();
      // 🌟 alert 팝업 없이 즉시 모달 닫기 & 해당 피드로 부드럽게 스크롤
      onClose();
      onPostCreated?.(newPostId);

      // 활동 기록: 마지막 선택 태그를 Firestore에 저장
      saveUserActivity(currentUser.username, {
        lastTag: selectedTag,
        displayName: currentUser.displayName,
      }).catch(console.error);
      // 📦 user_session: 피드 등록 기록
      appendFeedToSession(currentUser.username, newPostId).catch(console.error);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('피드 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-slate-100 flex flex-col max-h-[92vh] sm:max-h-[88vh] cursor-default animate-in slide-in-from-bottom duration-300 ease-out"
      >
        {/* 📱 모바일 인스타 감성 드래그 핸들 바 */}
        <div className="w-full flex justify-center pt-2.5 pb-1 bg-white cursor-pointer" onClick={onClose} title="터치하여 닫기">
          <div className="w-10 h-1 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>

        {/* 📸 공통 숨겨진 카메라/앨범 input 엘리먼트 */}
        {hiddenInputs}

        {/* 1. 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">새 피드 만들기</h3>
              <p className="text-[11px] text-slate-500">@{currentUser.username} 계정으로 게시</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 작성 폼 영역 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
          {/* 사진 미리보기 박스 (원본 비율 유지하여 크롭/줌인 없는 선명한 뷰) */}
          <div className="relative w-full max-h-[360px] min-h-[220px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner group">
            {isCompressing ? (
              <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-2 text-white bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <span className="text-xs font-semibold">1080px 고화질 최적화 중...</span>
              </div>
            ) : (
              <>
                <img
                  src={currentPhotoUrl}
                  alt="피드 사진"
                  className="w-full max-h-[360px] object-contain transition-transform duration-300"
                />
                {/* 선택된 태그 뱃지 */}
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-pink-400" />
                  <span>{selectedTag}</span>
                </div>
              </>
            )}
          </div>

          {/* 사진 선택 컨트롤: [📸 카메라로 촬영] & [🖼️ 앨범에서 선택] (공통 컴포넌트 재사용) */}
          <div className="space-y-2">
            <PhotoPickerButtons
              onCameraClick={openCamera}
              onGalleryClick={openGallery}
              isProcessing={isCompressing}
            />

            {/* 추천 프리셋 사진 선택 영역 (감성 6선) */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5 px-0.5">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>또는 감성 추천 사진 선택</span>
                </span>
                {userUploadedPhoto && (
                  <button
                    type="button"
                    onClick={() => setUseUploadMode(false)}
                    className="text-[10px] text-purple-600 hover:underline cursor-pointer"
                  >
                    추천 사진으로 전환
                  </button>
                )}
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                {POST_PHOTO_PRESETS.map((p) => {
                  const isSelected = !useUploadMode && selectedPresetPhoto === p.url;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetPhoto(p.url);
                        setUseUploadMode(false);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-pink-500 scale-105 shadow-xs ring-2 ring-pink-200'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      title={p.label}
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
            </div>
          </div>

          {/* 해시태그 선택 */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">부스 해시태그</label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                    selectedTag === tag
                      ? 'bg-pink-50 text-pink-600 border-pink-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 본문 캡션 작성 */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">소감 및 메시지</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="부스 체험 소감이나 친구들에게 남길 메시지를 적어보세요! ✨"
              rows={3}
              maxLength={300}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
              required
            />
            <div className="flex justify-end text-[10px] text-slate-400">
              {caption.length} / 300자
            </div>
          </div>

          {/* 최종 게시 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || isCompressing || !caption.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-bold hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? '파이어스토어 저장 중...' : '피드 공유하기'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
