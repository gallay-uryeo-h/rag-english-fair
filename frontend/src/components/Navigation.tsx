import React from 'react';
import type { TabType } from '../types';
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  Compass,
  Brain,
  Lightbulb,
  Award,
  Layers,
  Map,
  MessageSquare,
  Camera,
  Volume2
} from 'lucide-react';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  // 🌟 1. 인스타그램 일관성 4대 코너 탭 (피드 포스트 복제본)
  const instaTabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'insta-mbti', label: '📸 [인스타] MBTI 추천', icon: <Compass className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'insta-vocab', label: '📸 [인스타] 단어 미리보기', icon: <Volume2 className="w-3.5 h-3.5 text-purple-500" /> },
    { id: 'insta-textbook', label: '📸 [인스타] 교과서 6권', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'insta-seteuk', label: '📸 [인스타] 세특 발전소', icon: <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> },
  ];

  // 🧪 2. 기존 연구 & 브레인스토밍 13대 탭
  const labTabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'recommend', label: '✨ My English Future', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'textbook-preview', label: '📖 교과서 미리보기 (1행)', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'textbook-2layer', label: '📚 교과서 탐색 (3×2 2레이어)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'vocab-test', label: '🎯 단어 레벨 진단', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
    { id: 'vocab-listen', label: '🎧 단어 듣기 진단 (소리+퀴즈)', icon: <BrainCircuit className="w-3.5 h-3.5 text-purple-600" /> },
    { id: 'mbti', label: '🧪 본문 MBTI (기본)', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'deep-mbti', label: '🔬 심층 본문 MBTI (정밀)', icon: <Brain className="w-3.5 h-3.5" /> },
    { id: 'seteuk', label: '💡 세특 치트키', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: 'grammar-overview', label: '📐 문법 한눈에 조망', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'passport', label: '🎫 5부스 여권 스탬프', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'visual', label: '🗺️ 3개년 로드맵', icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'chat', label: '💬 의령여고 Q&A', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'grammar', label: '📚 교과서 E-Book', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="flex flex-col bg-white border-b border-slate-200 shrink-0">
      {/* 상단: 인스타그램 일관성 탭 섹션 바 */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-pink-50/70 via-purple-50/70 to-indigo-50/70 border-b border-pink-100 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-pink-200 shadow-2xs shrink-0 mr-1">
          <Camera className="w-3 h-3 text-pink-600" />
          <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            인스타 뷰
          </span>
        </div>
        {instaTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs'
                  : 'text-slate-700 bg-white/90 hover:bg-white border border-pink-200/80 shadow-2xs'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 하단: 전체 실험/브레인스토밍 13개 랩 탭 */}
      <div className="flex gap-1.5 px-2.5 py-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 shrink-0 mr-1 text-[10px] font-bold text-slate-600">
          <span>🔬 랩 뷰</span>
        </div>
        {labTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
