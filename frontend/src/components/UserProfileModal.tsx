import React, { useState } from 'react';
import { X, Check, Sparkles, User, Shield } from 'lucide-react';
import { AVATAR_PRESETS, saveUserProfile } from '../utils/userProfile';
import type { UserProfile } from '../utils/userProfile';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenAdminAuth: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
  onOpenAdminAuth,
  isAdmin,
  onLogoutAdmin,
}) => {
  const [username, setUsername] = useState(currentProfile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile.avatar);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim().replace(/^@/, '');
    if (!trimmed) {
      alert('아이디(닉네임)를 입력해 주세요!');
      return;
    }

    const updated: UserProfile = {
      ...currentProfile,
      username: trimmed,
      displayName: trimmed,
      avatar: selectedAvatar,
    };

    saveUserProfile(updated);
    onProfileUpdated(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">내 계정 프로필 설정</h3>
              <p className="text-[11px] text-slate-500">박람회에서 피드와 댓글에 표시됩니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 내용 */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {/* 현재 선택된 아바타 프리뷰 */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-md">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <img
                  src={selectedAvatar}
                  alt="내 아바타"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700">@{username || '아이디'}</span>
          </div>

          {/* 아이디 입력창 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>내 인스타 아이디 (닉네임)</span>
              <span className="text-pink-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm font-bold text-slate-400">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="예: 2반_김민지, ur_english"
                maxLength={20}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400">한글, 영문, 숫자, 밑줄(_) 20자 이내</p>
          </div>

          {/* 아바타 선택 그리드 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">프로필 사진 선택</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_PRESETS.map((av) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 scale-105 shadow-sm'
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

          {/* 선생님 관리자 모드 토글 링크 */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">선생님 전용 관리</span>
            {isAdmin ? (
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="text-red-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                <span>관리자 모드 끄기</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminAuth();
                }}
                className="text-purple-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                <span>선생님 인증하기</span>
              </button>
            )}
          </div>

          {/* 저장 버튼 */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-bold hover:opacity-95 active:scale-[0.98] transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>설정 완료하고 시작하기</span>
          </button>
        </form>
      </div>
    </div>
  );
};
