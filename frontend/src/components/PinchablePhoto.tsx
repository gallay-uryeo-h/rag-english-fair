/**
 * PinchablePhoto.tsx
 * 
 * 인스타그램식 사진 제스처 컴포넌트:
 * - 2지 핀치 줌 & 팬 (Portal을 통해 부모 overflow-hidden을 뚫고 화면 전체로 확대)
 * - 수학적 앵커 보정 (두 손가락 사이 핀치 지점이 손가락 밑에 정확히 고정)
 * - 60fps 무지연 DOM 제어 (React re-render 없이 직접 DOM 조작)
 * - 더블탭 감지 (지연 없는 즉각 반응) + 모바일 햅틱 진동 피드백 + 인스타 하트 애니메이션
 * - iOS 사파리 시스템 제스처(브라우저 전체 Viewport 확대) 충돌 격리
 * - 손가락 뗄 때 튀는 현상(Jitter) 방지 및 부드러운 스냅백 애니메이션
 * - 1지 세로 스와이프 시 네이티브 스크롤 100% 보장 (touch-action: pan-y)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Heart } from 'lucide-react';

export interface PinchablePhotoProps {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  /** 더블탭 콜백 (예: 인스타 하트 좋아요 등) */
  onDoubleTap?: () => void;
  /** 단일 클릭/탭 콜백 (확대 모달 열기 등) */
  onClick?: () => void;
  children?: React.ReactNode;
}

type Point = { clientX: number; clientY: number };
const dist = (a: Point, b: Point) =>
  Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
const mid = (a: Point, b: Point) => ({
  x: (a.clientX + b.clientX) / 2,
  y: (a.clientY + b.clientY) / 2,
});

export const PinchablePhoto: React.FC<PinchablePhotoProps> = ({
  src,
  alt = 'Photo',
  className = '',
  imageClassName = '',
  onDoubleTap,
  onClick,
  children,
}) => {
  // ── DOM refs ──────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const portalImgRef = useRef<HTMLImageElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // 핀치 줌 시에만 Portal을 DOM에 삽입 (메모리 & 렌더링 최적화)
  const [isPinching, setIsPinching] = useState(false);

  // 더블탭 인스타 하트 팝업 상태
  const [showHeart, setShowHeart] = useState(false);
  const heartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 제스처 상태 추적 refs (React state와 분리하여 60fps 보장) ─────────────
  const isPinchingRef = useRef(false);
  const isEndingRef = useRef(false); // 손가락 뗄 때 Jitter 방지 락
  const gestureRef = useRef({
    startDistance: 0,
    startCenter: { x: 0, y: 0 },
    focalOffset: { x: 0, y: 0 },
  });

  // ── 더블탭 & 스크롤 감지 refs ─────────────────────────────────────────────
  const lastTapTimeRef = useRef(0);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isScrollingRef = useRef(false);
  const hasPinchedRef = useRef(false);
  const snapbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── iOS Safari 시스템 줌(gesturestart) 차단 ───────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };
    el.addEventListener('gesturestart', preventGesture, { passive: false });
    el.addEventListener('gesturechange', preventGesture, { passive: false });
    return () => {
      el.removeEventListener('gesturestart', preventGesture);
      el.removeEventListener('gesturechange', preventGesture);
      if (snapbackTimerRef.current) clearTimeout(snapbackTimerRef.current);
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    };
  }, []);

  // ── 60fps 무지연 DOM 제어 함수 ────────────────────────────────────────────
  const applyTransform = (scale: number, x: number, y: number) => {
    if (portalImgRef.current) {
      portalImgRef.current.style.transform =
        `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }
    if (backdropRef.current) {
      const opacity = Math.min(Math.max((scale - 1) / 1.5, 0), 0.75);
      backdropRef.current.style.opacity = String(opacity);
    }
  };

  // ── 핀치 종료(스냅백) 처리 함수 ──────────────────────────────────────────
  const finishPinch = useCallback(() => {
    if (!isPinchingRef.current && !isEndingRef.current) return;
    isPinchingRef.current = false;
    isEndingRef.current = true;
    if (portalImgRef.current) {
      portalImgRef.current.style.transition =
        'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)';
      portalImgRef.current.style.transform =
        'translate3d(0,0,0) scale(1)';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'opacity 0.24s ease-out';
      backdropRef.current.style.opacity = '0';
    }
    if (snapbackTimerRef.current) clearTimeout(snapbackTimerRef.current);
    snapbackTimerRef.current = setTimeout(() => {
      setIsPinching(false);
      isEndingRef.current = false;
      snapbackTimerRef.current = null;
    }, 250);
  }, []);

  // ── 더블탭 시 하트 팝업 트리거 ──────────────────────────────────────────
  const triggerDoubleTap = () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(20); // 햅틱 진동 피드백
      }
    } catch {
      // ignore
    }

    setShowHeart(true);
    if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
    heartTimerRef.current = setTimeout(() => {
      setShowHeart(false);
      heartTimerRef.current = null;
    }, 900);

    onDoubleTap?.();
  };

  // ── 터치 이벤트 핸들러 ───────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEndingRef.current) return;

    // 1. 단일 터치: 스크롤 판별 시작
    if (e.touches.length === 1) {
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      isScrollingRef.current = false;
      hasPinchedRef.current = false;
      return;
    }

    // 2. 두 손가락 터치: 핀치 줌 시작
    if (e.touches.length === 2 && containerRef.current) {
      lastTapTimeRef.current = 0;
      touchStartPosRef.current = null;
      hasPinchedRef.current = true;
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const center = mid(t0, t1);
      gestureRef.current = {
        startDistance: dist(t0, t1),
        startCenter: center,
        focalOffset: {
          x: center.x - (rect.left + rect.width / 2),
          y: center.y - (rect.top + rect.height / 2),
        },
      };
      isPinchingRef.current = true;
      setIsPinching(true);
      requestAnimationFrame(() => {
        if (portalImgRef.current) {
          const s = portalImgRef.current.style;
          s.top = `${rect.top}px`;
          s.left = `${rect.left}px`;
          s.width = `${rect.width}px`;
          s.height = `${rect.height}px`;
          s.transition = 'none';
          s.transform = 'translate3d(0,0,0) scale(1)';
        }
        if (backdropRef.current) {
          backdropRef.current.style.transition = 'none';
          backdropRef.current.style.opacity = '0';
        }
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 1. 단일 터치: 상하 스크롤 발생 감지 (절대 preventDefault 하지 않음)
    if (e.touches.length === 1 && touchStartPosRef.current) {
      const dx = e.touches[0].clientX - touchStartPosRef.current.x;
      const dy = e.touches[0].clientY - touchStartPosRef.current.y;
      if (Math.hypot(dx, dy) > 10) isScrollingRef.current = true;
      return;
    }

    // 2. 핀치 중 손가락 하나를 뗐을 때 Jitter 방지: 즉시 복귀
    if (isPinchingRef.current && e.touches.length < 2) {
      finishPinch();
      return;
    }

    // 3. 두 손가락 핀치 줌 & 팬
    if (isPinchingRef.current && e.touches.length === 2) {
      if (e.cancelable) e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const { startDistance, startCenter, focalOffset } = gestureRef.current;
      const scale = Math.min(Math.max(dist(t0, t1) / startDistance, 1), 4.5);
      const currentCenter = mid(t0, t1);
      const dx = currentCenter.x - startCenter.x;
      const dy = currentCenter.y - startCenter.y;
      // 표준 핀치 줌 & 팬 통합 앵커 공식
      const x = dx + (1 - scale) * focalOffset.x;
      const y = dy + (1 - scale) * focalOffset.y;
      applyTransform(scale, x, y);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinchingRef.current) {
      finishPinch();
      touchStartPosRef.current = null;
      return;
    }
    if (isEndingRef.current || hasPinchedRef.current) {
      touchStartPosRef.current = null;
      return;
    }

    // 더블탭 감지 (300ms 이내 재탭 시 발동)
    if (
      e.changedTouches.length === 1 &&
      touchStartPosRef.current &&
      !isScrollingRef.current
    ) {
      const now = Date.now();
      const timeSinceLast = now - lastTapTimeRef.current;

      if (timeSinceLast < 320 && timeSinceLast > 40) {
        // 더블탭 성공!
        lastTapTimeRef.current = 0;
        if (singleTapTimerRef.current) {
          clearTimeout(singleTapTimerRef.current);
          singleTapTimerRef.current = null;
        }
        triggerDoubleTap();
      } else {
        lastTapTimeRef.current = now;
        // 단일 탭 처리 (더블탭이 안 일어났을 때 onClick 호출)
        if (onClick) {
          if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
          singleTapTimerRef.current = setTimeout(() => {
            onClick();
            singleTapTimerRef.current = null;
          }, 320);
        }
      }
    }
    touchStartPosRef.current = null;
  };

  // 데스크톱 마우스 더블클릭 지원
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = null;
    }
    triggerDoubleTap();
  };

  const handleClick = () => {
    // 터치 디바이스는 touchEnd에서 타이머로 처리
    if (typeof window !== 'undefined' && 'ontouchstart' in window) return;
    onClick?.();
  };

  return (
    <>
      {/* 기본 피드 사진 컨테이너 (touchAction: pan-y 필수) */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={`relative overflow-hidden select-none ${className}`}
        style={{ touchAction: 'pan-y' }}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover pointer-events-none ${imageClassName}`}
          style={{ opacity: isPinching ? 0 : 1 }}
          loading="lazy"
        />

        {/* 💖 인스타그램 더블탭 팝업 하트 애니메이션 */}
        {showHeart && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-200">
            <div className="relative flex items-center justify-center">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center scale-150 animate-ping opacity-75">
                <Heart className="w-16 h-16 text-rose-400 fill-rose-400" />
              </div>
            </div>
          </div>
        )}

        {children}
      </div>

      {/* 핀치 줌 시에만 마운트되는 가벼운 경량 포털 */}
      {isPinching &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] pointer-events-none select-none"
            style={{ touchAction: 'none' }}
          >
            {/* 어두운 배경 */}
            <div
              ref={backdropRef}
              className="absolute inset-0 bg-black/85"
              style={{ opacity: 0 }}
            />
            {/* 화면 밖으로 튀어나오는 확대 이미지 */}
            <img
              ref={portalImgRef}
              src={src}
              alt={alt}
              className="absolute object-contain shadow-2xl"
              style={{
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
