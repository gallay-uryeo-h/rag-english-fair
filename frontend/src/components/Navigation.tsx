import React from 'react';
import type { TabType } from '../types';
import {
  Sparkles,
  Compass,
  Lightbulb,
  Award,
  Map,
  MessageSquare,
  BookOpen
} from 'lucide-react';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'recommend', label: '📸 My English Future', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'mbti', label: '🧪 본문 MBTI', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'seteuk', label: '💡 세특 치트키', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: 'passport', label: '🎫 5부스 여권 스탬프', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'visual', label: '🗺️ 3개년 로드맵', icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'chat', label: '💬 의령여고 Q&A', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'grammar', label: '📖 교과서 E-Book', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="flex gap-1.5 px-2.5 py-2 bg-white border-b border-slate-200 shrink-0 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
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
