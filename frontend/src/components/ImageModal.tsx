import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface BookMeta {
  prefix: string;
  name: string;
  maxPage: number;
}

const TEXTBOOK_METAS: BookMeta[] = [
  { prefix: '1학년_1학기_공통영어1_미래엔', name: '공통영어1 (1학년 1학기 · 미래엔)', maxPage: 128 },
  { prefix: '1학년_2학기_공통영어2_미래엔', name: '공통영어2 (1학년 2학기 · 미래엔)', maxPage: 128 },
  { prefix: '2학년_1학기_영어Ⅰ_엔이능률', name: '영어Ⅰ (2학년 1학기 · 엔이능률)', maxPage: 164 },
  { prefix: '2학년_2학기_영어독해와작문_미래엔', name: '영어독해와작문 (2학년 2학기 · 미래엔)', maxPage: 192 },
  { prefix: '3학년_1학기_영어Ⅱ_능률', name: '영어Ⅱ (3학년 1학기 · 능률)', maxPage: 168 },
  { prefix: '3학년_1학기_세계_문화와_영어_비상', name: '세계 문화와 영어 (3학년 1학기 · 비상)', maxPage: 172 },
];

function parseUrlToBookInfo(url: string): { prefix: string; page: number; bookName: string; maxPage: number } | null {
  if (!url) return null;
  const decoded = decodeURI(url);
  const match = decoded.match(/([^\/\\]+)_p(\d+)\.jpg/);
  if (!match) return null;

  const rawPrefix = match[1];
  const page = parseInt(match[2], 10);

  const found = TEXTBOOK_METAS.find((m) => m.prefix === rawPrefix || rawPrefix.includes(m.prefix) || m.prefix.includes(rawPrefix));
  if (found) {
    return {
      prefix: found.prefix,
      page,
      bookName: found.name,
      maxPage: found.maxPage,
    };
  }

  return {
    prefix: rawPrefix,
    page,
    bookName: rawPrefix.replace(/_/g, ' '),
    maxPage: 200,
  };
}

interface Props {
  isOpen: boolean;
  title: string;
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<Props> = ({ isOpen, title, imageUrl, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState<string>(imageUrl);
  const [displayTitle, setDisplayTitle] = useState<string>(title);

  // E-Book Reader State
  const [bookPrefix, setBookPrefix] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(128);
  const [bookName, setBookName] = useState<string>('');

  // Zoom / Pan / Fullscreen State
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Touch State for Simultaneous Mobile Pinch Zoom & Pan
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const touchStartCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchPanStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Loading & Error State
  const [imgLoading, setImgLoading] = useState<boolean>(true);
  const [imgError, setImgError] = useState<boolean>(false);

  // Jump page input
  const [pageInput, setPageInput] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerAreaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync state when opened or url changed
  useEffect(() => {
    if (isOpen && imageUrl) {
      setCurrentUrl(imageUrl);
      setDisplayTitle(title);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImgLoading(true);
      setImgError(false);

      const parsed = parseUrlToBookInfo(imageUrl);
      if (parsed) {
        setBookPrefix(parsed.prefix);
        setCurrentPage(parsed.page);
        setMaxPage(parsed.maxPage);
        setBookName(parsed.bookName);
        setPageInput(String(parsed.page));
      }
    }
  }, [isOpen, imageUrl, title]);

  // ================= 📱 모바일 기기 뒤로가기 버튼 처리 (History State) =================
  useEffect(() => {
    if (!isOpen) return;

    // 모달이 열릴 때 history state를 푸시하여 뒤로가기 버튼을 가로챔
    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = () => {
      // 사용자가 안드로이드 뒤로가기 또는 브라우저 뒤로가기 클릭 시 모달 닫기
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // 모달이 정상 닫힐 때(X버튼, Esc 등) 불필요한 forward 히스토리 방지
      if (window.history.state && window.history.state.modalOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  const goToPage = useCallback(
    (page: number) => {
      if (!bookPrefix) return;
      const targetPage = Math.max(1, Math.min(page, maxPage));
      const nextUrl = `/pages_cache/${bookPrefix}_p${targetPage}.jpg`;
      setCurrentPage(targetPage);
      setPageInput(String(targetPage));
      setCurrentUrl(nextUrl);
      setDisplayTitle(`${bookName} · p.${targetPage}`);
      setImgLoading(true);
      setImgError(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    },
    [bookPrefix, bookName, maxPage]
  );

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const nextPage = useCallback(() => {
    if (currentPage < maxPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, maxPage, goToPage]);

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.3, 4.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.3, 0.6));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard Navigation: Left/Right arrow for prev/next page, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === '+' || e.key === '=') {
        setScale((prev) => Math.min(prev + 0.2, 4.0));
      } else if (e.key === '-') {
        setScale((prev) => Math.max(prev - 0.2, 0.6));
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, prevPage, nextPage]);

  // Mouse drag handlers for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
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

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setScale((prev) => Math.max(0.6, Math.min(prev + delta, 4.0)));
    }
  };

  // ================= Touch Pinch & Pan & Swipe Handlers =================
  const getTouchDistance = (t1: React.Touch | Touch, t2: React.Touch | Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (t1: React.Touch | Touch, t2: React.Touch | Touch) => {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 finger pinch + pan simultaneous start
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
      touchStartCenterRef.current = center;
      touchStartPosRef.current = { ...position };
      touchSwipeStartRef.current = null;
    } else if (e.touches.length === 1) {
      // 1 finger touch: either pan (if zoomed) or swipe (if 1x) or double-tap
      const touch = e.touches[0];
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        // Double tap: toggle 1x and 2.2x
        if (scale > 1.2) {
          handleResetZoom();
        } else {
          setScale(2.2);
        }
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;

      touchPanStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      };
      touchSwipeStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // 🔥 두 손가락으로 확대/축소와 이동(Pan)을 동시에 자연스럽게 반영
      e.preventDefault();
      const newDist = getTouchDistance(e.touches[0], e.touches[1]);
      const newCenter = getTouchCenter(e.touches[0], e.touches[1]);
      
      const factor = newDist / touchStartDistRef.current;
      const targetScale = Math.max(0.7, Math.min(touchStartScaleRef.current * factor, 4.5));
      setScale(targetScale);

      // 중심점 이동 계산을 통해 두 손가락을 벌리며 움직일 때도 위치가 함께 추적됨
      const deltaX = newCenter.x - touchStartCenterRef.current.x;
      const deltaY = newCenter.y - touchStartCenterRef.current.y;
      setPosition({
        x: touchStartPosRef.current.x + deltaX,
        y: touchStartPosRef.current.y + deltaY,
      });
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (scale > 1.05) {
        // 1 finger pan when zoomed
        e.preventDefault();
        setPosition({
          x: touch.clientX - touchPanStartRef.current.x,
          y: touch.clientY - touchPanStartRef.current.y,
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStartDistRef.current = null;
    }

    // Check horizontal swipe if not zoomed
    if (scale <= 1.05 && touchSwipeStartRef.current && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchSwipeStartRef.current.x;
      const deltaY = touch.clientY - touchSwipeStartRef.current.y;

      // Horizontal swipe threshold: 50px, and horizontal travel must be > 1.5 * vertical
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          nextPage(); // swipe left -> next page
        } else {
          prevPage(); // swipe right -> prev page
        }
      }
    }

    if (e.touches.length === 0) {
      touchSwipeStartRef.current = null;
    }
  };

  if (!isOpen) return null;

  const safeUrl = currentUrl ? encodeURI(currentUrl) : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-6 bg-black/85 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className={`relative flex flex-col w-full bg-slate-900 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border-0 sm:border border-slate-700 select-none ${
          isFullscreen ? 'w-screen h-screen rounded-none max-w-none max-h-none border-none' : 'max-w-4xl max-h-[100dvh] sm:max-h-[94vh] h-[100dvh] sm:h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 툴바 */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2 sm:py-2.5 bg-slate-800 border-b border-slate-700 text-white shrink-0">
          {/* 교과서 정보 및 페이지 점프 */}
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="truncate">
              <h3 className="text-xs md:text-sm font-bold truncate text-slate-100">{displayTitle}</h3>
              {bookName && (
                <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  총 {maxPage}쪽 · 핀치 줌 & 이동 지원
                </div>
              )}
            </div>
          </div>

          {/* 중앙: 확대/축소 및 전체화면 컨트롤 */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-700/80 px-1.5 sm:px-2 py-1 rounded-xl shrink-0">
            <button
              onClick={handleZoomOut}
              title="축소 (-)"
              className="p-1 rounded-lg hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold w-9 sm:w-10 text-center text-slate-200">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="확대 (+)"
              className="p-1 rounded-lg hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="배율 초기화 (0)"
              className="p-1 rounded-lg hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer ml-0.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-slate-600 mx-0.5 hidden sm:block" />
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
              className="p-1 rounded-lg hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            title="닫기 (Esc)"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0 ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메인 교과서 뷰어 영역 (마우스 드래그 & 터치 핀치/팬/스와이프 지원) */}
        <div
          ref={viewerAreaRef}
          className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-950 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 이전 페이지 버튼 (좌측 오버레이) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPage();
            }}
            disabled={currentPage <= 1}
            title="이전 페이지 (←)"
            className="absolute left-2 md:left-4 z-20 p-2 md:p-3 rounded-full bg-slate-800/80 hover:bg-blue-600 text-white shadow-lg backdrop-blur-xs transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* 다음 페이지 버튼 (우측 오버레이) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPage();
            }}
            disabled={currentPage >= maxPage}
            title="다음 페이지 (→)"
            className="absolute right-2 md:right-4 z-20 p-2 md:p-3 rounded-full bg-slate-800/80 hover:bg-blue-600 text-white shadow-lg backdrop-blur-xs transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer group"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 로딩 표시 */}
          {imgLoading && !imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 z-10">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="text-xs text-slate-400 font-medium">교과서 페이지(p.{currentPage})를 불러오는 중...</span>
            </div>
          )}

          {/* 에러 표시 */}
          {imgError ? (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-300 z-10">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <div className="text-sm font-bold text-slate-200">해당 페이지 이미지를 불러오지 못했습니다.</div>
              <div className="text-xs text-slate-400">
                의령여고 부스에 비치된 실제 실물 교과서에서 확인하실 수 있습니다! 📖
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-full h-full p-1 sm:p-2 transition-transform duration-75 ease-out"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center center',
              }}
            >
              <img
                ref={imgRef}
                src={safeUrl}
                alt={displayTitle}
                draggable={false}
                onLoad={() => setImgLoading(false)}
                onError={() => {
                  setImgLoading(false);
                  setImgError(true);
                }}
                className={`max-h-[82vh] w-auto max-w-full object-contain rounded-md shadow-2xl transition-opacity duration-200 select-none ${
                  imgLoading ? 'opacity-0' : 'opacity-100'
                }`}
                loading="eager"
              />
            </div>
          )}
        </div>

        {/* 하단 페이지 내비게이션 바 */}
        <div className="flex items-center justify-between px-3 md:px-5 py-2 sm:py-2.5 bg-slate-800 border-t border-slate-700 text-white shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            키보드 <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-slate-300">←</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-slate-300">→</kbd> 또는 모바일 좌우 스와이프로 책장을 넘길 수 있습니다.
          </div>

          {/* 페이지 이동 컨트롤러 */}
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <button
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold cursor-pointer transition-colors"
            >
              이전 쪽
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const p = parseInt(pageInput, 10);
                if (!isNaN(p)) goToPage(p);
              }}
              className="flex items-center gap-1"
            >
              <span className="text-xs text-slate-400 font-medium">p.</span>
              <input
                type="number"
                min={1}
                max={maxPage}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => {
                  const p = parseInt(pageInput, 10);
                  if (!isNaN(p)) goToPage(p);
                }}
                className="w-14 px-1.5 py-0.5 text-center text-xs font-bold rounded bg-slate-900 border border-slate-600 text-white focus:outline-hidden focus:border-blue-400"
              />
              <span className="text-xs text-slate-400">/ {maxPage}</span>
            </form>

            <button
              onClick={nextPage}
              disabled={currentPage >= maxPage}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold cursor-pointer transition-colors"
            >
              다음 쪽
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
