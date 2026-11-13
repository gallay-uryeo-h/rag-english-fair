import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  QrCode,
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyAndUseTicket } from '../services/firestoreService';
import type { PhotoTicket } from '../services/firestoreService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const PhotoboothKioskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title = '2026 의령여고 영어과 인생네컷 포토부스',
}) => {
  // 스텝: 'scan' (QR 스캔) -> 'countdown' (카운트다운) -> 'preview' (사진 확인 및 인쇄/다운로드)
  const [step, setStep] = useState<'scan' | 'countdown' | 'preview'>('scan');
  const [currentTicket, setCurrentTicket] = useState<PhotoTicket | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 카메라 촬영 관련
  const [countdown, setCountdown] = useState(3);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. QR 스캐너 시작/종료 처리
  useEffect(() => {
    if (!isOpen || step !== 'scan') {
      stopQrScanner();
      return;
    }

    let isSubscribed = true;
    const scannerElementId = 'qr-reader-container';

    const startScanner = async () => {
      try {
        // 기존 실행 인스턴스 정리
        await stopQrScanner();
        if (!isSubscribed) return;

        const qrCodeScanner = new Html5Qrcode(scannerElementId);
        qrReaderRef.current = qrCodeScanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await qrCodeScanner.start(
          { facingMode: 'user' }, // 전면 태블릿 카메라 우선 (없으면 환경 카메라)
          config,
          (decodedText) => {
            // QR 인식 성공 시
            handleVerifyTicket(decodedText);
          },
          () => {
            // 스캔 실패(프레임별 미검출)는 조용히 무시
          }
        );
      } catch (err) {
        console.warn('전면 카메라 시작 실패, 후면 카메라로 재시도:', err);
        try {
          if (!qrReaderRef.current) return;
          await qrReaderRef.current.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => handleVerifyTicket(decodedText),
            () => {}
          );
        } catch (e2) {
          console.error('카메라 권한 또는 장치 에러:', e2);
          setScanError('카메라를 시작할 수 없습니다. 수동으로 티켓 번호를 입력해 주세요.');
        }
      }
    };

    const timer = setTimeout(startScanner, 300);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      stopQrScanner();
    };
  }, [isOpen, step]);

  const stopQrScanner = async () => {
    if (qrReaderRef.current) {
      try {
        if (qrReaderRef.current.isScanning) {
          await qrReaderRef.current.stop();
        }
        qrReaderRef.current.clear();
      } catch (e) {
        // 무시
      }
      qrReaderRef.current = null;
    }
  };

  // 2. 티켓 검증 및 사용 처리
  const handleVerifyTicket = async (token: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    setScanError(null);

    try {
      await stopQrScanner();
      const res = await verifyAndUseTicket(token);

      if (!res.success) {
        setScanError(res.message);
        setIsVerifying(false);
        return;
      }

      // 검증 성공!
      setCurrentTicket(res.ticket || null);
      startPhotoCapture();
    } catch (e) {
      console.error('티켓 검증 오류:', e);
      setScanError('티켓 검증 중 오류가 발생했습니다.');
      setIsVerifying(false);
    }
  };

  // 3. 카메라 사진 촬영 준비 & 3초 카운트다운
  const startPhotoCapture = async () => {
    setStep('countdown');
    setCountdown(3);

    try {
      // 촬영용 고화질 웹캠 스트림 열기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // 카운트다운 타이머
      let timeLeft = 3;
      const interval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(interval);
          takeSnapshot();
        }
      }, 1000);
    } catch (err) {
      console.error('촬영용 카메라 시작 실패:', err);
      alert('촬영용 카메라를 열 수 없습니다.');
      setStep('scan');
      setIsVerifying(false);
    }
  };

  // 4. 스냅샷 촬영 및 의령여고 인생네컷 프레임 합성
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 960;

    // 프레임 규격: 상하단 여백이 있는 인스타/인생네컷 스타일 (너비: 1000px, 높이: 1300px)
    const targetWidth = 1000;
    const headerHeight = 90;
    const footerHeight = 160;
    const photoWidth = 900;
    const photoHeight = Math.round((photoWidth * vHeight) / vWidth);
    const targetHeight = headerHeight + photoHeight + footerHeight;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 배경: 의령여고 감성 파스텔 웜 베이지/아이보리
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // 상단 헤더 텍스트
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 30px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2026 의령여자고등학교 고교학점제 박람회', targetWidth / 2, 55);

    // 사진 테두리 그림자 효과
    const photoX = (targetWidth - photoWidth) / 2;
    const photoY = headerHeight;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
    ctx.restore();

    // 웹캠 사진 그리기 (좌우반전 적용하여 거울 보듯 자연스럽게)
    ctx.save();
    ctx.translate(photoX + photoWidth, photoY);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, photoWidth, photoHeight);
    ctx.restore();

    // 하단 인생네컷 브랜딩 & 날짜 푸터
    const footerY = photoY + photoHeight + 35;
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 36px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('English Passport | My English Future', photoX + 10, footerY + 25);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 22px "Noto Sans KR", sans-serif';
    const authorTag = currentTicket ? `@${currentTicket.authorName}` : '@guest';
    const dateStr = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillText(`${authorTag} · ${dateStr} · 의령여고 영어과 특별부스`, photoX + 10, footerY + 65);

    // 우측 하단 귀여운 박람회 스탬프
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 26px "Noto Sans KR", sans-serif';
    ctx.fillText('URYEO 2026 ★', targetWidth - photoX - 10, footerY + 45);

    // DataURL 생성
    const finalPhoto = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPhotoUrl(finalPhoto);

    // 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setStep('preview');
    setIsVerifying(false);
  };

  // 모달 닫기 시 카메라 완전 정리
  const handleCloseAll = () => {
    stopQrScanner();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStep('scan');
    setCapturedPhotoUrl(null);
    setCurrentTicket(null);
    setScanError(null);
    onClose();
  };

  // 사진 다운로드
  const handleDownloadPhoto = () => {
    if (!capturedPhotoUrl) return;
    const a = document.createElement('a');
    a.href = capturedPhotoUrl;
    a.download = `의령여고_영어박람회_인생네컷_${currentTicket?.authorName || 'guest'}_${Date.now()}.jpg`;
    a.click();
  };

  // 사진 인쇄 (포토프린터 연결 시 즉시 인쇄 가능)
  const handlePrintPhoto = () => {
    if (!capturedPhotoUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('팝업 차단을 해제해 주세요.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>의령여고 영어과 포토부스 인쇄</title>
          <style>
            @page { margin: 0; size: auto; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; background: #fff; height: 100vh; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${capturedPhotoUrl}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 다음 학생 촬영 준비 (리셋)
  const handleNextStudent = () => {
    setCapturedPhotoUrl(null);
    setCurrentTicket(null);
    setScanError(null);
    setManualToken('');
    setStep('scan');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border border-slate-700">
        {/* 상단 키오스크 바 */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-pink-500 text-white">
              <Camera className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-sm tracking-tight">{title}</span>
          </div>

          <button
            onClick={handleCloseAll}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메인 화면 영역 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          {/* 1. QR 스캔 모드 */}
          {step === 'scan' && (
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold border border-pink-200 mb-3 animate-pulse">
                <QrCode className="w-4 h-4" />
                <span>스마트폰 촬영권 QR을 카메라에 비춰주세요!</span>
              </div>

              {/* QR 카메라 뷰파인더 */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-slate-800 flex items-center justify-center">
                <div id="qr-reader-container" className="w-full h-full object-cover"></div>

                {isVerifying && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                    <Sparkles className="w-8 h-8 text-amber-300 animate-spin mb-2" />
                    <span className="text-sm font-bold">촬영권 인증 중...</span>
                  </div>
                )}
              </div>

              {/* 에러 메시지 알림 */}
              {scanError && (
                <div className="mt-3.5 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* 수동 토큰 번호 입력 (카메라 인식 어려울 때 백업용) */}
              <div className="mt-5 w-full pt-4 border-t border-slate-200">
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">
                  QR 인식이 잘 안 될 경우 티켓 번호 직접 입력
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="예: tk_17315..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-slate-800"
                  />
                  <button
                    onClick={() => manualToken.trim() && handleVerifyTicket(manualToken.trim())}
                    disabled={!manualToken.trim() || isVerifying}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. 카운트다운 & 촬영 중 */}
          {step === 'countdown' && (
            <div className="w-full max-w-lg flex flex-col items-center">
              <div className="relative w-full aspect-4/3 bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-500">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* 거대 카운트다운 숫자 오버레이 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-xs">
                  <div className="text-8xl font-black text-white drop-shadow-2xl animate-bounce">
                    {countdown}
                  </div>
                  <div className="text-sm font-bold text-white/90 mt-2 bg-black/40 px-4 py-1 rounded-full">
                    카메라를 보고 활짝 웃어주세요! 😊
                  </div>
                </div>
              </div>

              {currentTicket && (
                <div className="mt-3 text-xs text-slate-600 font-semibold">
                  참여자: <span className="text-pink-600 font-bold">@{currentTicket.authorName}</span>
                </div>
              )}
            </div>
          )}

          {/* 3. 사진 확인 & 인쇄 / 다운로드 */}
          {step === 'preview' && capturedPhotoUrl && (
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>예쁜 사진이 완성되었습니다! 🎉</span>
              </div>

              {/* 완성된 포토 프레임 이미지 */}
              <div className="w-72 sm:w-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200">
                <img
                  src={capturedPhotoUrl}
                  alt="인생네컷 완성본"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* 조작 버튼 그룹 */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-4">
                <button
                  onClick={handleDownloadPhoto}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>사진 다운로드</span>
                </button>
                <button
                  onClick={handlePrintPhoto}
                  className="py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>즉시 인쇄하기</span>
                </button>
              </div>

              <button
                onClick={handleNextStudent}
                className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다음 학생 QR 스캔 대기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
