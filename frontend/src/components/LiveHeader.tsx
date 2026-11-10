import React from 'react';
import { Sparkles, FlaskConical } from 'lucide-react';

interface Props {
  isLiveMode: boolean;
  onToggleMode: () => void;
}

export const LiveHeader: React.FC<Props> = ({ isLiveMode, onToggleMode }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shrink-0 shadow-xs">
      {/* 로고 & 타이틀 */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm tracking-tighter">
          UR
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
              의령여고 영어 페스티벌
            </span>
            {isLiveMode ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                운영 모드
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                전체 브레인스토밍
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {isLiveMode
              ? '중3 학생 & 학부모를 위한 공식 체험 코너'
              : '모든 실험적 기능 및 연구 모듈 (12개 탭 전체)'}
          </p>
        </div>
      </div>

      {/* 모드 전환 토글 버튼 (운영 모드 ⇄ 브레인스토밍 모드) */}
      <button
        onClick={onToggleMode}
        className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
          isLiveMode
            ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-100'
        }`}
      >
        {isLiveMode ? (
          <>
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">연구/전체보기</span>
            <span className="sm:hidden">전체</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>운영 화면으로</span>
          </>
        )}
      </button>
    </header>
  );
};
