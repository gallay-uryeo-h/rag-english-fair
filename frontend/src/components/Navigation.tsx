import React from 'react';
import type { TabType } from '../types';
import { Sparkles, Map, MessageSquare, BookOpen } from 'lucide-react';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'recommend', label: 'My English Future', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'visual', label: '3개년 성장 로드맵', icon: <Map className="w-4 h-4" /> },
    { id: 'chat', label: '의령여고 생활 Q&A', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'grammar', label: '교과서 미리보기', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <nav className="flex gap-1.5 p-2 bg-white border-b border-slate-200 shrink-0 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              isActive
                ? 'bg-blue-50 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
