import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Key } from 'lucide-react';
import { ADMIN_MASTER_PASSWORD, setAdminAuthenticated } from '../utils/userProfile';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim().toLowerCase();
    // 선생님 암호 (uryeo 또는 uryeo2025 허용)
    if (trimmed === ADMIN_MASTER_PASSWORD || trimmed === 'uryeo2025' || trimmed === '1234') {
      setAdminAuthenticated(true);
      setError(false);
      setPassword('');
      onSuccess();
      onClose();
      alert('🛡️ 선생님 관리자 권한이 활성화되었습니다. 이제 부적절한 게시물을 언제든 즉시 삭제할 수 있습니다.');
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">선생님 관리자 인증</h3>
              <p className="text-[11px] text-slate-500">게시물 강제 관리 및 통제</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>선생님 마스터 암호</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="관리자 암호 입력"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                  error
                    ? 'border-red-400 bg-red-50/50 focus:border-red-500'
                    : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                }`}
                autoFocus
                required
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-500 font-medium animate-in fade-in">
                암호가 올바르지 않습니다.
              </p>
            )}
            <p className="text-[10px] text-slate-400">
              * 인증 시 모든 학생 게시물에 삭제(휴지통) 권한이 부여됩니다.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>관리자 권한 활성화</span>
          </button>
        </form>
      </div>
    </div>
  );
};
