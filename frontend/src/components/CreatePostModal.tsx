import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Send,
  Tag,
  Camera,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Check,
} from 'lucide-react';
import type { UserProfile } from '../utils/userProfile';
import { addUserPost } from '../services/firestoreService';
import { compressImageFile } from '../utils/imageCompressor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

// 박람회 피드용 감성 사진 프리셋 목록 (선택 가능)
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사진 상태
  const [userUploadedPhoto, setUserUploadedPhoto] = useState<{
    dataUrl: string;
    sizeKb: number;
    fileName: string;
  } | null>(null);
  const [selectedPresetPhoto, setSelectedPresetPhoto] = useState<string>(POST_PHOTO_PRESETS[0].url);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
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

  // 스마트폰 앨범 또는 카메라 사진 선택 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // 브라우저 캔버스를 통해 스마트폰 고용량 사진을 960px/100KB 수준으로 고속 압축
      const { dataUrl, sizeKb } = await compressImageFile(file, {
        maxWidth: 960,
        maxHeight: 960,
        quality: 0.75,
      });

      setUserUploadedPhoto({
        dataUrl,
        sizeKb,
        fileName: file.name,
      });
      setUseUploadMode(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || '사진을 처리하는 도중 오류가 발생했습니다.');
    } finally {
      setIsCompressing(false);
      // 파일 인풋 리셋 (동일 파일 재선택 허용)
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      setUserUploadedPhoto(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* 숨김 처리된 실제 파일 인풋 (카메라 촬영 & 갤러리 지원) */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 1. 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-10">
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
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 작성 폼 영역 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
          {/* 사진 미리보기 박스 */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
            {isCompressing ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white bg-slate-900/90">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <span className="text-xs font-semibold">사진 고화질 최적화 중...</span>
              </div>
            ) : (
              <>
                <img
                  src={currentPhotoUrl}
                  alt="피드 사진"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* 선택된 태그 뱃지 */}
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-pink-400" />
                  <span>{selectedTag}</span>
                </div>
                {/* 내 사진 여부 표시 뱃지 */}
                {useUploadMode && userUploadedPhoto && (
                  <div className="absolute bottom-2.5 right-2.5 bg-emerald-600/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                    <span>내 사진 ({userUploadedPhoto.sizeKb} KB)</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 사진 선택 컨트롤: [내 사진 직접 올리기] vs [추천 테마 사진] */}
          <div className="space-y-2">
            {/* 📸 메인 버튼: 스마트폰 사진첩 / 카메라에서 바로 올리기 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
              className="w-full py-2.5 px-3.5 rounded-xl border-2 border-dashed border-purple-400 hover:border-purple-600 bg-purple-50/70 hover:bg-purple-100/70 transition-all flex items-center justify-center gap-2 text-xs font-bold text-purple-700 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <UploadCloud className="w-4 h-4 text-purple-600" />
              <span>{userUploadedPhoto ? '다른 사진으로 변경하기 📸' : '내 앨범에서 사진 선택 / 사진 촬영 📸'}</span>
            </button>

            {/* 추천 프리셋 사진 선택 영역 */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5 px-0.5">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>또는 추천 박람회 사진 선택</span>
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
                          : 'border-transparent opacity-70 hover:opacity-100'
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
