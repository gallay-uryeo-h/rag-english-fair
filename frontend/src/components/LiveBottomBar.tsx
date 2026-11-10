import React from 'react';
import { Home, Compass, Volume2, BookOpen, Lightbulb } from 'lucide-react';

export type LiveNavTab = 'home' | 'mbti' | 'vocab' | 'textbook' | 'seteuk';

interface Props {
  currentTab: LiveNavTab;
  onSelectTab: (tab: LiveNavTab) => void;
}

export const LiveBottomBar: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as const, label: '홈 피드', icon: Home },
    { id: 'mbti' as const, label: '본문 MBTI', icon: Compass },
    { id: 'vocab' as const, label: '단어 퀴즈', icon: Volume2 },
    { id: 'textbook' as const, label: '교과서 탐색', icon: BookOpen },
    { id: 'seteuk' as const, label: '세특 발전소', icon: Lightbulb },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg py-1.5 px-4">
      <div className="max-w-2xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-600 scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
