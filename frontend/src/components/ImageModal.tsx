import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<Props> = ({ isOpen, title, imageUrl, onClose }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImgLoading(true);
      setImgError(false);
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 안전한 URL 인코딩 처리
  const safeUrl = imageUrl ? encodeURI(imageUrl) : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm md:text-base font-bold text-slate-800 truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50 min-h-[300px] relative">
          {imgLoading && !imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50">
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
              <span className="text-xs text-slate-400 font-medium">교과서 원본 사진을 불러오는 중...</span>
            </div>
          )}

          {imgError ? (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <div className="text-sm font-bold text-slate-700">해당 페이지 이미지를 불러오지 못했습니다.</div>
              <div className="text-xs text-slate-400">
                의령여고 부스에 비치된 실제 실물 교과서에서 확인하실 수 있습니다! 📖
              </div>
            </div>
          ) : (
            <img
              src={safeUrl}
              alt={title}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgLoading(false);
                setImgError(true);
              }}
              className={`max-h-[75vh] w-auto object-contain rounded-lg shadow-sm border border-slate-200 transition-opacity duration-200 ${
                imgLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
};
