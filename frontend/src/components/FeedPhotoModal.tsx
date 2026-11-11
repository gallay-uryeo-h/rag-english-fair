import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface FeedPhotoModalProps {
  isOpen: boolean;
  imageUrl: string;
  authorName?: string;
  authorAvatar?: string;
  caption?: string;
  isOfficial?: boolean;
  onClose: () => void;
}

export const FeedPhotoModal: React.FC<FeedPhotoModalProps> = ({
  isOpen,
  imageUrl,
  authorName,
  authorAvatar,
  caption,
  isOfficial,
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch & Pinch Zoom Refs
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const touchStartCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchPanStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapTimeRef = useRef<number>(0);

  // 모달 열릴 때마다 줌 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, imageUrl]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 확대 / 축소 / 리셋 핸들러
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 마우스 휠 줌
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // 더블 클릭/더블 탭 토글
  const handleDoubleTap = () => {
    if (scale > 1.2) {
      handleResetZoom();
    } else {
      setScale(2.2);
    }
  };

  // 마우스 드래그 (패닝)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 모바일 터치 제스처 (핀치 줌 & 팬)
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    if (e.touches.length === 1) {
      // 더블탭 감지
      if (now - lastTapTimeRef.current < 300) {
        handleDoubleTap();
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;

      if (scale > 1) {
        touchPanStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    } else if (e.touches.length === 2) {
      // 핀치 줌 시작
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartScaleRef.current = scale;
      touchStartCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      touchStartPosRef.current = { ...position };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      // 1손가락 드래그 (확대된 상태)
      setPosition({
        x: e.touches[0].clientX - touchPanStartRef.current.x,
        y: e.touches[0].clientY - touchPanStartRef.current.y,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // 2손가락 핀치 줌
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = currentDist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(touchStartScaleRef.current * ratio, 1), 4);
      setScale(newScale);

      // 중심점 이동 보정
      const currentCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const moveX = currentCenterX - touchStartCenterRef.current.x;
      const moveY = currentCenterY - touchStartCenterRef.current.y;
      setPosition({
        x: touchStartPosRef.current.x + moveX,
        y: touchStartPosRef.current.y + moveY,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // 이미지 다운로드
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `uryeo-fair-photo-${Date.now()}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col select-none animate-fadeIn"
      onClick={(e) => {
        // 배경 클릭 시 닫기 (축소 상태일 때)
        if (e.target === e.currentTarget && scale <= 1.05) {
          onClose();
        }
      }}
    >
      {/* ─── 상단 헤더 바 ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-2.5 min-w-0">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
              {authorName?.[0] || '📸'}
            </div>
          )}
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm truncate text-white">
                {authorName || '사진 보기'}
              </span>
              {isOfficial && (
                <span className="text-[10px] bg-blue-500/80 text-white font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  ★ 공식
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/60">
              {scale > 1 ? `${Math.round(scale * 100)}% 확대됨` : '더블클릭/더블탭 시 확대'}
            </p>
          </div>
        </div>

        {/* 줌 컨트롤 & 닫기 버튼 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            aria-label="축소"
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-all cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            disabled={scale === 1}
            aria-label="100% 원복"
            className="px-2 py-1 text-xs font-semibold rounded-full hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-all cursor-pointer"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 4}
            aria-label="확대"
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-all cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {scale > 1 && (
            <button
              onClick={handleResetZoom}
              title="원래 크기로"
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleDownload}
            title="사진 다운로드"
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            aria-label="닫기"
            className="ml-1 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── 메인 뷰포트 (이미지 줌 & 패닝) ────────────────────────── */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-default"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget && scale <= 1.05) {
            onClose();
          }
        }}
      >
        <div
          className="relative max-w-full max-h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onDoubleClick={handleDoubleTap}
        >
          <img
            src={imageUrl}
            alt={caption || '피드 사진'}
            className="max-h-[82vh] max-w-[96vw] object-contain rounded-sm shadow-2xl pointer-events-none select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* ─── 하단 캡션 바 (있을 때만) ───────────────────────────────── */}
      {caption && (
        <div className="px-4 py-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white z-10 max-h-28 overflow-y-auto">
          <p className="text-xs text-white/90 leading-relaxed whitespace-pre-line line-clamp-3">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};
