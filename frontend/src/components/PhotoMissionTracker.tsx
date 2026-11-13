import React, { useState, useEffect, useMemo } from 'react';
import { Camera, CheckCircle2, QrCode, Sparkles, ChevronRight, X, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { UserProfile } from '../utils/userProfile';
import type { FsUserPost, FsComment, MissionSettings, PhotoTicket } from '../services/firestoreService';
import {
  subscribeMissionSettings,
  subscribeUserTicket,
  issuePhotoTicket,
  DEFAULT_MISSION_SETTINGS,
} from '../services/firestoreService';

interface Props {
  currentUser: UserProfile | null;
  allPosts: FsUserPost[];
  allComments: FsComment[];
  onOpenQr?: () => void;
  onOpenPhotoboothKiosk?: () => void;
  onOpenAdminManager?: () => void;
  isAnyAdmin?: boolean;
}

export const PhotoMissionTracker: React.FC<Props> = ({
  currentUser,
  allPosts,
  allComments,
  onOpenQr,
  onOpenPhotoboothKiosk,
  onOpenAdminManager,
  isAnyAdmin,
}) => {
  const [settings, setSettings] = useState<MissionSettings>(DEFAULT_MISSION_SETTINGS);
  const [userTicket, setUserTicket] = useState<PhotoTicket | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  // 미션 설정 구독
  useEffect(() => {
    const unsub = subscribeMissionSettings((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsub();
  }, []);

  // 사용자 티켓 구독
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserTicket(null);
      return;
    }
    const unsub = subscribeUserTicket(currentUser.uid, (ticket) => {
      setUserTicket(ticket);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // 내 활동 카운트 계산
  const myPostCount = useMemo(() => {
    if (!currentUser) return 0;
    return allPosts.filter(
      (p) => p.authorId === currentUser.uid || p.authorName === currentUser.username
    ).length;
  }, [allPosts, currentUser]);

  const myCommentCount = useMemo(() => {
    if (!currentUser) return 0;
    return allComments.filter(
      (c) =>
        c.authorId === currentUser.uid ||
        c.author === currentUser.username ||
        c.author === `@${currentUser.username}`
    ).length;
  }, [allComments, currentUser]);

  const reqPosts = settings.requiredPosts;
  const reqComments = settings.requiredComments;

  const isPostComplete = myPostCount >= reqPosts;
  const isCommentComplete = myCommentCount >= reqComments;
  const isMissionAllComplete = isPostComplete && isCommentComplete;

  // 촬영권 발급 및 모달 열기 핸들러
  const handleOpenTicketModal = async () => {
    if (!currentUser) {
      alert('참여 닉네임으로 로그인 후 촬영권을 발급받을 수 있습니다.');
      return;
    }

    if (!userTicket && isMissionAllComplete) {
      try {
        setIsIssuing(true);
        const ticket = await issuePhotoTicket(currentUser.uid, currentUser.username, false);
        setUserTicket(ticket);
      } catch (e) {
        console.error('티켓 발급 실패:', e);
        alert('촬영권 발급 중 오류가 발생했습니다.');
        return;
      } finally {
        setIsIssuing(false);
      }
    }
    setIsQrModalOpen(true);
  };

  if (!settings.isEnabled && !isAnyAdmin) {
    return null;
  }

  return (
    <>
      {/* 📸 상단 인라인 미션 대시보드 배너 */}
      <div className="mx-4 my-2.5 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-amber-300/60 rounded-2xl p-3.5 shadow-xs backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-xs">
              <Camera className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  {settings.title}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  EVENT
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1">{settings.bannerNotice}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 🎫 학생 본인 여권 QR 열기 */}
            {onOpenQr && currentUser && (
              <button
                onClick={onOpenQr}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="인생네컷 연동용 여권 QR 열기"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-300" />
                <span>여권 QR</span>
              </button>
            )}

            {/* 관리자 전용: 부스 태블릿 키오스크 바로가기 */}
            {isAnyAdmin && onOpenPhotoboothKiosk && (
              <button
                onClick={onOpenPhotoboothKiosk}
                className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                title="포토부스 촬영 키오스크 모드 열기 (관리자/부스 운영용)"
              >
                <Camera className="w-3 h-3 text-pink-400" />
                <span>촬영기</span>
              </button>
            )}

            {/* 관리자 설정 열기 */}
            {isAnyAdmin && onOpenAdminManager && (
              <button
                onClick={onOpenAdminManager}
                className="text-[11px] font-medium px-2 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
                title="미션 기준 및 참여자 모니터링 관리"
              >
                ⚙️ 관리
              </button>
            )}
          </div>
        </div>

        {/* 미션 스탬프 바 */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-200/50">
          {/* 미션 1: 피드 작성 */}
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
              isPostComplete
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                : 'bg-white/80 text-slate-700 border border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isPostComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0" />
              )}
              <span>피드 등록</span>
            </div>
            <span className="font-bold text-[11px]">
              {myPostCount} / {reqPosts}
            </span>
          </div>

          {/* 미션 2: 댓글 작성 */}
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
              isCommentComplete
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                : 'bg-white/80 text-slate-700 border border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isCommentComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0" />
              )}
              <span>댓글 작성</span>
            </div>
            <span className="font-bold text-[11px]">
              {myCommentCount} / {reqComments}
            </span>
          </div>
        </div>

        {/* 달성 여부에 따른 버튼/안내 */}
        <div className="mt-2.5">
          {userTicket ? (
            <button
              onClick={() => setIsQrModalOpen(true)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                userTicket.status === 'used'
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white hover:brightness-105 active:scale-98 animate-pulse'
              }`}
            >
              <QrCode className="w-4 h-4" />
              {userTicket.status === 'used' ? (
                <span>🎉 촬영 완료된 티켓 (QR 확인)</span>
              ) : (
                <span>📸 포토부스 무료 촬영권 QR 열기 (인증 대기)</span>
              )}
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </button>
          ) : isMissionAllComplete ? (
            <button
              onClick={handleOpenTicketModal}
              disabled={isIssuing}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 active:scale-98 shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
              <span>미션 완료! 지금 즉시 촬영권 QR 받기 🎫</span>
            </button>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>미션 완료 시 부스 촬영권 QR이 즉시 발급됩니다!</span>
              <span className="text-amber-700 font-semibold">
                남은 조건: {Math.max(0, reqPosts - myPostCount)}개 피드 / {Math.max(0, reqComments - myCommentCount)}개 댓글
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 🎫 촬영권 QR 코드 팝업 모달 */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 헤더 */}
            <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-5 text-white text-center">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md mb-2 shadow-inner">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-extrabold tracking-tight">
                {settings.title}
              </h3>
              <p className="text-xs text-white/90 mt-0.5 font-medium">
                의령여고 영어과 인생네컷 무료 촬영권
              </p>
            </div>

            {/* 본문 QR 및 상태 */}
            <div className="p-6 text-center">
              {userTicket ? (
                <>
                  {/* QR 코드 컨테이너 */}
                  <div className="relative inline-block p-4 bg-white rounded-2xl border-2 border-dashed border-pink-300 shadow-md">
                    <QRCodeSVG
                      value={userTicket.ticketId}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />

                    {/* 이미 사용된 티켓 오버레이 */}
                    {userTicket.status === 'used' && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-3">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1" />
                        <span className="text-sm font-bold">촬영 완료</span>
                        <span className="text-[10px] text-slate-300 mt-1">
                          {userTicket.usedAt?.toLocaleTimeString()} 사용됨
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 계정 및 티켓 번호 */}
                  <div className="mt-4 space-y-1">
                    <div className="text-xs text-slate-500">
                      참여자 아이디: <span className="font-bold text-slate-800">@{userTicket.authorName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      티켓 번호: {userTicket.ticketId}
                    </div>
                  </div>

                  {/* 상태 배지 */}
                  <div className="mt-3">
                    {userTicket.status === 'used' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                        촬영이 완료된 티켓입니다
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        촬영 대기 중 (부스 태블릿에 비춰주세요)
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                    💡 부스에 비치된 <strong>태블릿 카메라</strong>에 이 화면을 비추면
                    인증 후 즉시 사진 촬영이 시작됩니다!
                  </p>
                </>
              ) : (
                <div className="py-6 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">아직 티켓이 발급되지 않았습니다.</p>
                </div>
              )}

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

