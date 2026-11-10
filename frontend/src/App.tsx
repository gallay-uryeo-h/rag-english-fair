import { useState } from 'react';
import type { TabType } from './types';
import { Header } from './components/Header';
import { LiveHeader } from './components/LiveHeader';
import { LiveHomeFeed } from './components/LiveHomeFeed';
import { LiveBottomBar, type LiveNavTab } from './components/LiveBottomBar';
import { Navigation } from './components/Navigation';
import { Station5Recommend } from './components/Station5Recommend';
import { TextbookPreviewClean } from './components/TextbookPreviewClean';
import { TextbookBrowse2Layer } from './components/TextbookBrowse2Layer';
import { VocabTestTab } from './components/VocabTestTab';
import { VocabListenTab } from './components/VocabListenTab';
import { EnglishMbtiTab } from './components/EnglishMbtiTab';
import { DeepEnglishMbtiTab } from './components/DeepEnglishMbtiTab';
import { SeteukGeneratorTab } from './components/SeteukGeneratorTab';
import { DigitalPassportTab } from './components/DigitalPassportTab';
import { GrammarOverviewTab } from './components/GrammarOverviewTab';
import { GrowthRoadmap } from './components/GrowthRoadmap';
import { SchoolLifeQA } from './components/SchoolLifeQA';
import { TextbookPreview } from './components/TextbookPreview';
import { ImageModal } from './components/ImageModal';

export function App() {
  // 🌟 운영 모드 (true: 인스타그램 풀위드 안1, false: 전체 브레인스토밍 아카이브)
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);

  // 🌟 운영 모드 내 5개 내비게이션 탭 ('home' | 'mbti' | 'vocab' | 'textbook' | 'seteuk')
  const [liveTab, setLiveTab] = useState<LiveNavTab>('home');

  // 기존 브레인스토밍 탭
  const [currentTab, setCurrentTab] = useState<TabType>('recommend');

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl: string;
  }>({
    isOpen: false,
    title: '',
    imageUrl: '',
  });

  const handleOpenImage = (title: string, imageUrl: string) => {
    setModalState({
      isOpen: true,
      title,
      imageUrl,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // 피드 배너나 카드에서 특정 코너로 바로가기
  const handleLiveNavigate = (tab: 'mbti' | 'vocab' | 'textbook' | 'seteuk') => {
    setLiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 🌟 1. 상단 글로벌 헤더 (운영 모드 ⇄ 브레인스토밍 토글 내장) */}
      <LiveHeader
        isLiveMode={isLiveMode}
        onToggleMode={() => setIsLiveMode((prev) => !prev)}
      />

      {isLiveMode ? (
        /* =========================================================================
           [안 1] 실전 운영 모드: 시원시원한 Full Width & 모바일 앱형 하단 바 레이아웃
           ========================================================================= */
        <div className="flex-1 flex flex-col w-full bg-slate-50 pb-20">
          <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 md:py-6">
            {liveTab === 'home' && (
              <LiveHomeFeed
                onNavigate={handleLiveNavigate}
                onOpenImage={handleOpenImage}
              />
            )}
            {liveTab === 'mbti' && (
              <div className="w-full max-w-3xl mx-auto">
                <DeepEnglishMbtiTab onOpenImage={handleOpenImage} />
              </div>
            )}
            {liveTab === 'vocab' && (
              <div className="w-full max-w-3xl mx-auto">
                <VocabListenTab />
              </div>
            )}
            {liveTab === 'textbook' && (
              <div className="w-full">
                <TextbookBrowse2Layer onOpenImage={handleOpenImage} />
              </div>
            )}
            {liveTab === 'seteuk' && (
              <div className="w-full max-w-3xl mx-auto">
                <SeteukGeneratorTab onOpenImage={handleOpenImage} />
              </div>
            )}
          </main>

          {/* 인스타그램 스타일 하단 고정 내비게이션 바 */}
          <LiveBottomBar currentTab={liveTab} onSelectTab={setLiveTab} />
        </div>
      ) : (
        /* =========================================================================
           [기존] 브레인스토밍 모드: 12개 전체 실험적 탭 & 모바일 프레임 유지
           ========================================================================= */
        <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto bg-slate-100 border-x border-slate-200 shadow-sm overflow-hidden">
          {/* 브레인스토밍 서브헤더 */}
          <Header />

          {/* 전체 12개 탭 내비게이션 */}
          <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

          {/* 탭 본문 */}
          <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50 p-2">
            {currentTab === 'recommend' && <Station5Recommend onOpenImage={handleOpenImage} />}
            {currentTab === 'textbook-preview' && <TextbookPreviewClean onOpenImage={handleOpenImage} />}
            {currentTab === 'textbook-2layer' && <TextbookBrowse2Layer onOpenImage={handleOpenImage} />}
            {currentTab === 'vocab-test' && <VocabTestTab />}
            {currentTab === 'vocab-listen' && <VocabListenTab />}
            {currentTab === 'mbti' && <EnglishMbtiTab onOpenImage={handleOpenImage} />}
            {currentTab === 'deep-mbti' && <DeepEnglishMbtiTab onOpenImage={handleOpenImage} />}
            {currentTab === 'seteuk' && <SeteukGeneratorTab onOpenImage={handleOpenImage} />}
            {currentTab === 'grammar-overview' && <GrammarOverviewTab onOpenImage={handleOpenImage} />}
            {currentTab === 'passport' && <DigitalPassportTab />}
            {currentTab === 'visual' && <GrowthRoadmap onOpenImage={handleOpenImage} />}
            {currentTab === 'chat' && <SchoolLifeQA onOpenImage={handleOpenImage} />}
            {currentTab === 'grammar' && <TextbookPreview onOpenImage={handleOpenImage} />}
          </main>
        </div>
      )}

      {/* 교과서 원본 E-Book 팝업 모달 */}
      <ImageModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        imageUrl={modalState.imageUrl}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
