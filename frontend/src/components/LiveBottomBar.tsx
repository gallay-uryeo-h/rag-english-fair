import React, { useState, useEffect } from 'react';
import { Home, Compass, Volume2, BookOpen, Lightbulb, UserPlus } from 'lucide-react';
import { getUserProfile } from '../utils/userProfile';
import type { UserProfile } from '../utils/userProfile';

export type LiveNavTab = 'home' | 'mbti' | 'vocab' | 'textbook' | 'seteuk';

interface Props {
  currentTab: LiveNavTab;
  onSelectTab: (tab: LiveNavTab) => void;
  onOpenProfile?: () => void; // 프로필 탭 클릭 시 콜백 (선택적)
}

export const LiveBottomBar: React.FC<Props> = ({ currentTab, onSelectTab, onOpenProfile }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getUserProfile);

  // 로그인/로그아웃 감지: storage 이벤트로 동기화
  useEffect(() => {
    const sync = () => setCurrentUser(getUserProfile());
    window.addEventListener('storage', sync);
    // 300ms 폴링으로 같은 탭 내 변경도 감지
    const timer = setInterval(sync, 500);
    return () => { window.removeEventListener('storage', sync); clearInterval(timer); };
  }, []);

  const mainTabs = [
    { id: 'home' as const, label: '피드', icon: Home },
    { id: 'mbti' as const, label: 'MBTI', icon: Compass },
    { id: 'vocab' as const, label: '단어릴스', icon: Volume2 },
    { id: 'textbook' as const, label: '교과서', icon: BookOpen },
    { id: 'seteuk' as const, label: '세특', icon: Lightbulb },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg py-1 px-2">
      <div className="max-w-md mx-auto flex items-center justify-around">

        {/* 메인 4개 탭 */}
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 transition-transform active:scale-90 cursor-pointer ${
                isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-all ${
                    isActive ? 'stroke-[2.2] text-slate-900 fill-slate-900' : 'stroke-[1.6]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-900" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${
                isActive ? 'font-bold text-slate-900' : 'font-normal text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 계정 동그라미 (인스타그램 프로필 탭 위치) */}
        <button
          onClick={() => {
            // 커스텀 이벤트로 LiveHomeFeed 내 프로필 모달 오픈
            window.dispatchEvent(new CustomEvent('open-my-profile'));
            if (onOpenProfile) onOpenProfile();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-3 transition-transform active:scale-90 cursor-pointer group"
        >
          <div className="relative">
            {currentUser ? (
              <div className={`w-[26px] h-[26px] rounded-full p-[1.5px] transition-all ${
                currentTab === 'home' && false /* 프로필은 별도 탭 아님 */
                  ? 'bg-slate-900'
                  : 'bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-600'
              } group-hover:scale-110`}>
                <div className="w-full h-full rounded-full bg-white p-[1.5px] overflow-hidden">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="w-[26px] h-[26px] rounded-full border-[1.5px] border-dashed border-slate-300 group-hover:border-purple-400 flex items-center justify-center bg-slate-50 transition-all group-hover:scale-110">
                <UserPlus className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors" />
              </div>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-normal text-slate-400 group-hover:text-slate-700 transition-colors">
            {currentUser ? (currentUser.isTeacher ? '선생님' : '계정') : '로그인'}
          </span>
        </button>

      </div>
    </nav>
  );
};
