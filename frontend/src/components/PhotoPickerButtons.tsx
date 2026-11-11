import React from 'react';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Props {
  onCameraClick: () => void;
  onGalleryClick: () => void;
  isProcessing?: boolean;
  cameraLabel?: string;
  galleryLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * 인스타그램 감성의 일관된 카메라 촬영 & 앨범 선택 버튼 쌍
 */
export const PhotoPickerButtons: React.FC<Props> = ({
  onCameraClick,
  onGalleryClick,
  isProcessing = false,
  cameraLabel = '카메라로 촬영',
  galleryLabel = '앨범에서 선택',
  size = 'md',
  className = '',
}) => {
  const isSm = size === 'sm';

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {/* 📷 카메라 직접 촬영 버튼 */}
      <button
        type="button"
        onClick={onCameraClick}
        disabled={isProcessing}
        className={`flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
          isSm
            ? 'py-2 px-2.5 text-[11px]'
            : 'py-2.5 px-3 text-xs'
        } bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-transparent hover:opacity-95 active:scale-95 shadow-2xs disabled:opacity-50`}
        title="스마트폰 후면 카메라를 켜서 직접 촬영합니다"
      >
        {isProcessing ? (
          <Loader2 className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} animate-spin`} />
        ) : (
          <Camera className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        )}
        <span>{cameraLabel}</span>
      </button>

      {/* 🖼️ 앨범/갤러리 선택 버튼 */}
      <button
        type="button"
        onClick={onGalleryClick}
        disabled={isProcessing}
        className={`flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
          isSm
            ? 'py-2 px-2.5 text-[11px]'
            : 'py-2.5 px-3 text-xs'
        } bg-slate-100 hover:bg-slate-200/90 text-slate-800 border-slate-200 active:scale-95 disabled:opacity-50`}
        title="기기 사진 앨범(갤러리)에서 사진을 선택합니다"
      >
        {isProcessing ? (
          <Loader2 className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} animate-spin`} />
        ) : (
          <ImageIcon className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        )}
        <span>{galleryLabel}</span>
      </button>
    </div>
  );
};

