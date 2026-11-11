import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, User, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import {
  AVATAR_PRESETS,
  DEFAULT_GUEST_AVATAR,
  saveUserProfile,
  isTeacherAccount,
  isOfficialAccount,
  TEACHER_PASSWORD,
  setAdminAuthenticated,
} from '../utils/userProfile';
import type { UserProfile } from '../utils/userProfile';
import { usePhotoPicker } from '../hooks/usePhotoPicker';
import { PhotoPickerButtons } from './PhotoPickerButtons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
}) => {
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

  // currentProfile이 변경될 때 상태 동기화
  useEffect(() => {
    if (currentProfile) {
      setUsername(currentProfile.username);
      setSelectedAvatar(currentProfile.avatar);
      // 기존 아바타가 프리셋에 없으면 커스텀 사진으로 간주
      const isPreset = AVATAR_PRESETS.some((av) => av.url === currentProfile.avatar);
      setIsCustomPhoto(!isPreset);
    } else {
      setUsername('');
      setSelectedAvatar(DEFAULT_GUEST_AVATAR);
      setIsCustomPhoto(false);
    }
    setTeacherPassword('');
    setPasswordError(false);
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  // 입력된 아이디가 사전 등록된 선생님 계정 또는 학교 공식 계정인지 확인
  const isTargetTeacher = isTeacherAccount(username);
  const isTargetOfficial = isOfficialAccount(username);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim().replace(/^@/, '');
    if (!trimmed) {
      alert('부스 활동에 사용할 1회용 아이디(닉네임)를 입력해 주세요!');
      return;
    }

    // 선생님 또는 공식 계정인 경우 비밀번호 검증 필수
    let isTeacherAuth = false;
    const isOfficialDept = isOfficialAccount(trimmed);

    if (isTargetTeacher) {
      if (teacherPassword.trim() !== TEACHER_PASSWORD) {
        setPasswordError(true);
        alert(isOfficialDept ? '공식 계정 비밀번호가 올바르지 않습니다.' : '선생님 비밀번호가 올바르지 않습니다.');
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

    if (isOfficialDept) {
      alert(`🏛️ 의령여고 영어과 공식 계정(@${trimmed})으로 로그인되었습니다.\n전체 게시물 관리 권한이 활성화됩니다.`);
    } else if (isTeacherAuth) {
      alert(`🛡️ 선생님 계정(@${trimmed})으로 인증되었습니다. 관리자 권한이 활성화됩니다.`);
    } else {
      alert(`🎉 @${trimmed} 계정이 생성되었습니다! 즐거운 부스 활동 되세요.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">내 계정 프로필 설정</h3>
              <p className="text-[11px] text-slate-500">부스 활동에 사용할 1회용 계정입니다</p>
            </div>
          </div>
          {currentProfile && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 폼 내용 */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {/* 📸 공통 숨겨진 카메라/갤러리 input */}
          {hiddenInputs}

          {/* 현재 선택된 아바타 프리뷰 & 직접 촬영/앨범 선택 버튼 */}
          <div className="flex flex-col items-center gap-2.5 py-1">
            <div className="relative w-22 h-22 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-md">
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

              {isTargetTeacher && (
                <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1 shadow-xs" title="선생님 인증">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* 닉네임 및 상태 안내 */}
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-bold text-slate-800">
                  {username ? `@${username}` : '@아이디를 입력하세요'}
                </span>
                {isTargetOfficial ? (
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                    🏛️ 영어과 공식 계정
                  </span>
                ) : isTargetTeacher ? (
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                    선생님
                  </span>
                ) : null}
              </div>
              {isCustomPhoto && (
                <p className="text-[10px] text-pink-600 font-bold flex items-center justify-center gap-1">
                  <span>📸 직접 촬영/선택한 프로필 사진 적용 중</span>
                </p>
              )}
            </div>

            {/* 📸 공통 사진 촬영 & 앨범 선택 버튼 */}
            <PhotoPickerButtons
              onCameraClick={openCamera}
              onGalleryClick={openGallery}
              isProcessing={isProcessing}
              cameraLabel="사진 촬영"
              galleryLabel="앨범에서 선택"
              size="sm"
              className="w-full max-w-[240px] pt-1"
            />
          </div>

          {/* 아이디 입력창 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>부스 활동에 사용할 1회용 아이디(닉네임)</span>
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
                placeholder="예: 2반_김민지, english_fan"
                maxLength={25}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                required
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400">
              * 로그인 없이 박람회 부스 체험 중에 사용되는 1회용 닉네임입니다.
            </p>
          </div>

          {/* 🛡️ 선생님 / 공식 계정 감지 시 비밀번호 입력창 동적 등장 */}
          {isTargetTeacher && (
            <div className={`p-3.5 rounded-2xl border space-y-2 animate-in slide-in-from-top-2 duration-200 ${
              isTargetOfficial ? 'bg-blue-50/80 border-blue-200' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Lock className={`w-3.5 h-3.5 ${isTargetOfficial ? 'text-blue-600' : 'text-purple-600'}`} />
                <span>{isTargetOfficial ? '의령여고 영어과 관리자 비밀번호 확인' : '선생님 전용 비밀번호 확인'}</span>
              </div>
              <input
                type="password"
                value={teacherPassword}
                onChange={(e) => {
                  setTeacherPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder={isTargetOfficial ? '영어과 관리자 비밀번호 입력' : '선생님 비밀번호를 입력하세요'}
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
                  ? '🏛️ 의령여고 영어과 공식 계정(uryeo-eng)은 전체 게시물 관리 및 공식 피드 작성 권한이 부여됩니다.'
                  : '선생님 계정(uryeo-lee, uryeo-kim, uryeo-sung)은 관리자 권한이 함께 부여됩니다.'}
              </p>
            </div>
          )}

          {/* 아바타 선택 그리드 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">또는 기본 캐릭터 아바타 선택</label>
              {isCustomPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(DEFAULT_GUEST_AVATAR);
                    setIsCustomPhoto(false);
                  }}
                  className="text-[10px] text-purple-600 hover:underline cursor-pointer"
                >
                  기본으로 초기화
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

          {/* 저장 버튼 */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white text-xs font-bold hover:opacity-95 active:scale-[0.98] transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{currentProfile ? '프로필 변경 완료' : '부스 체험 시작하기'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
