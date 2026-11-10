import React from 'react';
import { Home, Compass, Volume2, BookOpen, Lightbulb } from 'lucide-react';

export type LiveNavTab = 'home' | 'mbti' | 'vocab' | 'textbook' | 'seteuk';

interface Props {
  currentTab: LiveNavTab;
  onSelectTab: (tab: LiveNavTab) => void;
}

export const LiveBottomBar: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as const, label: '피드', icon: Home },
    { id: 'mbti' as const, label: 'MBTI', icon: Compass },
    { id: 'vocab' as const, label: '단어릴스', icon: Volume2 },
    { id: 'textbook' as const, label: '교과서', icon: BookOpen },
    { id: 'seteuk' as const, label: '프로필', icon: Lightbulb },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg py-1 px-4">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-transform active:scale-90 cursor-pointer ${
                isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'stroke-[2.5] text-slate-900 fill-slate-900' : 'stroke-[1.8]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-900" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-slate-900' : 'font-normal text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
