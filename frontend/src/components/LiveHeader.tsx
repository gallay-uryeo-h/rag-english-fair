import React from 'react';
import { Heart, MessageCircle, ChevronDown, FlaskConical, Sparkles } from 'lucide-react';

interface Props {
  isLiveMode: boolean;
  onToggleMode: () => void;
}

export const LiveHeader: React.FC<Props> = ({ isLiveMode, onToggleMode }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shrink-0 shadow-2xs">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* 인스타그램 감성 폰트 로고 & 드롭다운 화살표 */}
        <div className="flex items-center gap-1.5 cursor-pointer select-none">
          <span className="font-serif italic text-2xl font-black tracking-tight text-slate-900">
            Urgirlshigh
          </span>
          <ChevronDown className="w-4 h-4 text-slate-700 stroke-[2.5] mt-1" />
          <span className="ml-1 text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            의령여고
          </span>
        </div>

        {/* 우측 인스타 아이콘 (하트, DM메시지, 연구모드 토글) */}
        <div className="flex items-center gap-3.5 text-slate-900">
          <button
            onClick={() => alert('의령여고 영어 페스티벌에 오신 것을 환영합니다! ❤️')}
            className="hover:opacity-70 transition-opacity cursor-pointer p-0.5"
            title="알림"
          >
            <Heart className="w-6 h-6 stroke-[1.8]" />
          </button>

          <button
            onClick={() => alert('부스 안내 교사 및 도우미 학생에게 언제든 질문해 주세요! 💬')}
            className="hover:opacity-70 transition-opacity cursor-pointer p-0.5"
            title="DM 메시지"
          >
            <MessageCircle className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* 연구/브레인스토밍 모드 전환 스위치 (인스타 필터 느낌) */}
          <button
            onClick={onToggleMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              isLiveMode
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-purple-600 text-white border-purple-600 shadow-xs'
            }`}
            title="전체 브레인스토밍 12개 탭 보기"
          >
            {isLiveMode ? (
              <>
                <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[11px]">연구</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px]">피드로</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
