import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Sparkles, Compass, Target } from 'lucide-react';
import type { UserProfile } from '../utils/userProfile';
import { getRecommendedStickers } from '../utils/life4cutStickers';
import { subscribeUserActivity, type UserActivityDoc } from '../services/firestoreService';

interface UserQrModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onClose: () => void;
}

export const UserQrModal: React.FC<UserQrModalProps> = ({
  isOpen,
  currentUser,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activity, setActivity] = useState<UserActivityDoc | null>(null);

  // Firestore에서 현재 사용자의 활동 데이터 실시간 구독
  useEffect(() => {
    if (!isOpen || !currentUser) {
      setActivity(null);
      return;
    }
    const unsub = subscribeUserActivity(currentUser.username, (data) => {
      setActivity(data);
    });
    return () => unsub();
  }, [isOpen, currentUser]);

  // QR 코드 렌더링
  useEffect(() => {
    if (!isOpen || !currentUser || !canvasRef.current) return;

    // QR에 담길 값: 순수 username (인생네컷 기기에서 key로 즉시 Firestore 조회)
    const qrValue = currentUser.username.trim().toLowerCase();

    QRCode.toCanvas(
      canvasRef.current,
      qrValue,
      {
        width: 220,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err: Error | null | undefined) => {
        if (err) console.error('QR code generation error:', err);
      }
    );
  }, [isOpen, currentUser]);

  // 추천 스티커 목록 자동 계산
  const recommendedStickers = getRecommendedStickers(activity);

  if (!isOpen || !currentUser) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
        {/* 상단 여권(Passport) 스타일 헤더 */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-widest uppercase font-extrabold px-2 py-0.5 rounded-full bg-white/20 border border-white/20">
              MY ENGLISH PASSPORT
            </span>
            <span className="text-[10px] text-blue-200 font-medium">
              인생네컷 연동
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="w-12 h-12 rounded-full p-0.5 bg-white/30 shrink-0">
              <img
                src={currentUser.avatar}
                alt=""
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base truncate">
                {currentUser.displayName || currentUser.username}
              </h3>
              <p className="text-xs text-blue-100 font-mono">
                @{currentUser.username}
              </p>
            </div>
          </div>
        </div>

        {/* 중앙: QR 코드 캔버스 영역 */}
        <div className="p-5 flex flex-col items-center bg-slate-50/60 border-b border-slate-100">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center">
            <canvas ref={canvasRef} className="rounded-xl w-[190px] h-[190px]" />
            <p className="text-[11px] font-mono text-slate-400 mt-2 tracking-wide font-semibold">
              ID: {currentUser.username}
            </p>
          </div>
          <p className="text-xs font-bold text-slate-700 mt-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            인생네컷 부스에서 이 QR을 스캔하세요!
          </p>
          <p className="text-[11px] text-slate-500 text-center mt-0.5">
            부스 활동 내역을 인식하여 추천 스티커를 자동 로드합니다.
          </p>
        </div>

        {/* 내 활동 현황 요약 칩 */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 mb-2">
            📍 현재 기록된 나의 부스 활동
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-blue-600 block font-medium">성향 진단</span>
                <span className="font-bold text-slate-800 text-xs">
                  {activity?.mbti || '미진단 (1부스)'}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-purple-600 block font-medium">관심 진로</span>
                <span className="font-bold text-slate-800 text-xs truncate block">
                  {activity?.careerField || '미탐색 (4부스)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 인생네컷 맞춤 스티커 자동 추천 (태블릿에서 자동 로드) */}
        <div className="p-5 bg-white">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
              ✨ 인생네컷 자동 추천 스티커 ({recommendedStickers.length}종)
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              QR 스캔 시 태블릿 자동 로드
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {recommendedStickers.map((sticker, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                  idx === 0
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {sticker}
              </span>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 mt-3 text-center">
            부스 활동(MBTI·진로)에 따라 스티커 문구가 실시간으로 자동 변경됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
