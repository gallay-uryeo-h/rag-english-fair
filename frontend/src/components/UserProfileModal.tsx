import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, User, Lock, ShieldCheck, Loader2, LogOut, Shield } from 'lucide-react';
import {
  AVATAR_PRESETS,
  DEFAULT_GUEST_AVATAR,
  saveUserProfile,
  isTeacherAccount,
  isOfficialAccount,
  TEACHER_PASSWORD,
  setAdminAuthenticated,
  clearUserProfile,
} from '../utils/userProfile';
import type { UserProfile } from '../utils/userProfile';
import { usePhotoPicker } from '../hooks/usePhotoPicker';
import { PhotoPickerButtons } from './PhotoPickerButtons';
import { containsProfanity, PROFANITY_ALERT_MESSAGE } from '../utils/profanityFilter';
import { upsertUserSession } from '../services/firestoreService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile | null) => void;
  initialMode?: 'guest' | 'admin';
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
  initialMode = 'guest',
}) => {
  // 모드 탭: 'guest' (1회용 로그인) vs 'admin' (기존/관리자 로그인)
  const [authMode, setAuthMode] = useState<'guest' | 'admin'>(initialMode);
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile?.avatar || DEFAULT_GUEST_AVATAR);
  const [isCustomPhoto, setIsCustomPhoto] = useState<boolean>(false);
  const [teacherPassword, setTeacherPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // 📸 통일된 사진 촬영/업로드 훅 (프로필용: 720x720 정사각형 최적화)
  const {
    openCamera,
    openGallery,
    isProcessing,
    hiddenInputs,
  } = usePhotoPicker({
    maxWidth: 720,
    maxHeight: 720,
    quality: 0.85,
    onSuccess: (result) => {
      setSelectedAvatar(result.dataUrl);
      setIsCustomPhoto(true);
    },
  });

  // currentProfile 또는 isOpen 변경 시 상태 동기화
  useEffect(() => {
    if (isOpen) {
      if (currentProfile) {
        setUsername(currentProfile.username);
        setSelectedAvatar(currentProfile.avatar);
        const isPreset = AVATAR_PRESETS.some((av) => av.url === currentProfile.avatar);
        setIsCustomPhoto(!isPreset);
        setAuthMode(currentProfile.isTeacher ? 'admin' : 'guest');
      } else {
        setUsername(initialMode === 'admin' ? 'uryeo_eng' : '');
        setSelectedAvatar(DEFAULT_GUEST_AVATAR);
        setIsCustomPhoto(false);
        setAuthMode(initialMode);
      }
      setTeacherPassword('');
      setPasswordError(false);
    }
  }, [currentProfile, isOpen, initialMode]);

  if (!isOpen) return null;

  // 관리자 모드인지 여부
  const isAdminTab = authMode === 'admin';
  const isTargetTeacher = isTeacherAccount(username);
  const isTargetOfficial = isOfficialAccount(username);

  const handleLogout = () => {
    if (confirm('현재 계정에서 로그아웃하시겠습니까?')) {
      clearUserProfile();
      setAdminAuthenticated(false);
      onProfileUpdated(null);
      onClose();
      alert('로그아웃되었습니다.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim().replace(/^@/, '');
    if (!trimmed) {
      alert(isAdminTab ? '관리자 아이디를 선택 또는 입력해 주세요!' : '부스 활동에 사용할 1회용 닉네임을 입력해 주세요!');
      return;
    }

    if (!isAdminTab && containsProfanity(trimmed)) {
      alert(PROFANITY_ALERT_MESSAGE);
      return;
    }

    let isTeacherAuth = false;
    const isOfficialDept = isOfficialAccount(trimmed);

    // 관리자 탭이거나 선생님 계정 입력 시 비밀번호 검증
    if (isAdminTab || isTeacherAccount(trimmed)) {
      if (teacherPassword.trim() !== TEACHER_PASSWORD) {
        setPasswordError(true);
        alert(isOfficialDept ? '공식 관리자 비밀번호가 올바르지 않습니다.' : '선생님 비밀번호가 올바르지 않습니다.');
        return;
      }
      isTeacherAuth = true;
      setAdminAuthenticated(true);
    }

    const updated: UserProfile = {
      uid: currentProfile?.uid || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: trimmed,
      displayName: isOfficialDept
        ? '의령여고 영어과'
        : isTeacherAuth
          ? `선생님 (@${trimmed})`
          : trimmed,
      avatar: selectedAvatar,
      createdAt: currentProfile?.createdAt || Date.now(),
      isTeacher: isTeacherAuth,
    };

    saveUserProfile(updated);
    onProfileUpdated(updated);
    onClose();

    // 📦 user_session: 로그인 시 세션 초기화/갱신 (선생님 계정은 제외)
    if (!isTeacherAuth) {
      upsertUserSession({
        username: updated.username,
        displayName: updated.displayName,
        uid: updated.uid,
      }).catch(console.error);
    }

    if (isOfficialDept) {
      alert(`🏛️ 의령여고 영어과 공식 계정(@${trimmed})으로 로그인되었습니다.\n전체 게시물 관리 권한이 활성화됩니다.`);
    } else if (isTeacherAuth) {
      alert(`🛡️ 선생님 계정(@${trimmed})으로 인증되었습니다. 관리자 권한이 활성화됩니다.`);
    } else {
      alert(`🎉 @${trimmed} 1회용 계정으로 부스 활동을 시작합니다!`);
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

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
              isAdminTab 
                ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500'
            }`}>
              {isAdminTab ? <Shield className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {currentProfile ? '계정 관리 & 프로필' : (isAdminTab ? '관리자 로그인' : '부스체험 1회용 로그인')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAdminTab ? '의령여고 영어과 공식 및 교사 전용 계정' : '부스 활동에 사용할 1회용 닉네임입니다'}
              </p>
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

        {/* 로그인 모드 선택 탭 (부스체험 1회용 로그인 vs 관리자 로그인) */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1 m-3 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setAuthMode('guest');
              if (!currentProfile) {
                setUsername('');
                setSelectedAvatar(DEFAULT_GUEST_AVATAR);
              }
              setPasswordError(false);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'guest'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>부스체험 1회용 로그인</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('admin');
              if (!currentProfile || !currentProfile.isTeacher) {
                setUsername('uryeo_eng');
              }
              setPasswordError(false);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'admin'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>관리자 로그인</span>
          </button>
        </div>

        {/* 폼 내용 */}
        <form onSubmit={handleSave} className="p-4 pt-1 space-y-4 overflow-y-auto">
          {/* 📸 공통 숨겨진 카메라/갤러리 input */}
          {hiddenInputs}

          {/* 현재 선택된 아바타 프리뷰 & 직접 촬영/앨범 선택 버튼 */}
          <div className="flex flex-col items-center gap-2.5 py-1">
            <div className={`relative w-20 h-20 rounded-full p-1 shadow-md ${
              isAdminTab 
                ? 'bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600'
                : 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400'
            }`}>
              <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                <img
                  src={selectedAvatar}
                  alt="내 아바타"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* 사진 압축 처리 로딩 오버레이 */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-bold">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>처리 중...</span>
                </div>
              )}

              {isAdminTab && (
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-xs" title="관리자">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                </div>
              )}
            </div>

            <PhotoPickerButtons
              onCameraClick={openCamera}
              onGalleryClick={openGallery}
              isProcessing={isProcessing}
              cameraLabel="사진 촬영"
              galleryLabel="앨범에서 선택"
              size="sm"
              className="w-full max-w-[240px] pt-0.5"
            />
          </div>

          {/* 아이디 입력창 / 관리자 선택창 */}
          {isAdminTab ? (
            <div className="space-y-1.5 bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>관리자 / 선생님 계정 선택</span>
                <span className="text-[10px] text-blue-600 font-semibold">사전 등록 계정</span>
              </label>
              <select
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setPasswordError(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-blue-200 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="uryeo_eng">🏛️ @uryeo_eng (의령여고 영어과 공식)</option>
                <option value="uryeo_kim">👩‍🏫 @uryeo_kim (김선생님 계정)</option>
                <option value="uryeo_lee">👨‍🏫 @uryeo_lee (이선생님 계정)</option>
                <option value="uryeo_sung">👩‍🏫 @uryeo_sung (성선생님 계정)</option>
              </select>
              <p className="text-[10px] text-slate-500">
                선택한 계정으로 로그인하면 피드 관리 및 삭제 권한이 활성화됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>부스 활동에 사용할 1회용 닉네임</span>
                  <span className="text-pink-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setPasswordError(false);
                    }}
                    placeholder="예: 2반_영어짱, english_fan"
                    maxLength={25}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* 🔒 개인정보 안심 보호 안내 박스 */}
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>개인정보 안심 보호 안내</span>
                </div>
                <div className="text-[10px] text-amber-800/95 leading-relaxed font-medium space-y-0.5 pl-0.5">
                  <p>• <strong>실명 등 개인정보 입력은 권장하지 않습니다.</strong> 자유로운 별명이나 닉네임을 사용해 주세요.</p>
                  <p>• 부스 체험 중 수집된 모든 데이터는 <strong>당일 행사 종료 후 안전하게 전량 파기</strong>됩니다.</p>
                </div>
              </div>
            </div>
          )}

          {/* 🛡️ 관리자 모드이거나 선생님 계정일 때 비밀번호 입력창 */}
          {(isAdminTab || isTargetTeacher) && (
            <div className={`p-3 rounded-2xl border space-y-2 animate-in slide-in-from-top-2 duration-200 ${
              isTargetOfficial ? 'bg-blue-50/80 border-blue-200' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Lock className={`w-3.5 h-3.5 ${isTargetOfficial ? 'text-blue-600' : 'text-purple-600'}`} />
                <span>{isTargetOfficial ? '의령여고 영어과 관리자 비밀번호' : '선생님 전용 비밀번호'}</span>
              </div>
              <input
                type="password"
                value={teacherPassword}
                onChange={(e) => {
                  setTeacherPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="비밀번호를 입력하세요"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden bg-white transition-all ${
                  passwordError
                    ? 'border-red-400 bg-red-50/50'
                    : isTargetOfficial
                      ? 'border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                }`}
                required
              />
              {passwordError && (
                <p className="text-[10px] text-red-500 font-bold">
                  비밀번호가 올바르지 않습니다.
                </p>
              )}
              <p className={`text-[10px] ${isTargetOfficial ? 'text-blue-700 font-medium' : 'text-purple-600'}`}>
                {isTargetOfficial
                  ? '🏛️ 의령여고 영어과 공식 계정(uryeo_eng)은 전체 게시물 관리 권한이 부여됩니다.'
                  : '선생님 계정은 게시물 관리 및 삭제 권한이 함께 부여됩니다.'}
              </p>
            </div>
          )}

          {/* 아바타 선택 그리드 (1회용 로그인 탭일 때 추천) */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">기본 캐릭터 아바타 선택</label>
              {isCustomPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(DEFAULT_GUEST_AVATAR);
                    setIsCustomPhoto(false);
                  }}
                  className="text-[10px] text-purple-600 hover:underline cursor-pointer"
                >
                  기본 아바타로 복귀
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_PRESETS.map((av) => {
                const isSelected = !isCustomPhoto && selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av.url);
                      setIsCustomPhoto(false);
                    }}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 scale-105 shadow-sm ring-2 ring-purple-100'
                        : 'border-transparent hover:border-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-full h-full rounded-xl object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-3" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 버튼 영역 (저장/로그인 + 현재 로그인되어 있다면 로그아웃 버튼) */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white text-xs font-bold hover:opacity-95 active:scale-[0.98] transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                isAdminTab
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {currentProfile
                  ? (isAdminTab ? '관리자 계정으로 전환/로그인' : '프로필 저장하기')
                  : (isAdminTab ? '관리자 로그인' : '부스 체험 시작하기')}
              </span>
            </button>

            {currentProfile && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-600 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>계정 로그아웃</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
