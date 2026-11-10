import { useState } from 'react';
import type { TabType } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Station5Recommend } from './components/Station5Recommend';
import { TextbookPreviewClean } from './components/TextbookPreviewClean';
import { VocabTestTab } from './components/VocabTestTab';
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

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-slate-100 border-x border-slate-200 shadow-sm overflow-hidden">
      {/* 상단 공통 헤더 */}
      <Header />

      {/* 7개 서비스 탭 내비게이션 */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* 탭 본문 영역 */}
      <main className="flex-1 overflow-hidden flex flex-col bg-slate-50">
        {currentTab === 'recommend' && <Station5Recommend onOpenImage={handleOpenImage} />}
        {currentTab === 'textbook-preview' && <TextbookPreviewClean onOpenImage={handleOpenImage} />}
        {currentTab === 'vocab-test' && <VocabTestTab />}
        {currentTab === 'mbti' && <EnglishMbtiTab onOpenImage={handleOpenImage} />}
        {currentTab === 'deep-mbti' && <DeepEnglishMbtiTab onOpenImage={handleOpenImage} />}
        {currentTab === 'seteuk' && <SeteukGeneratorTab onOpenImage={handleOpenImage} />}
        {currentTab === 'grammar-overview' && <GrammarOverviewTab onOpenImage={handleOpenImage} />}
        {currentTab === 'passport' && <DigitalPassportTab />}
        {currentTab === 'visual' && <GrowthRoadmap onOpenImage={handleOpenImage} />}
        {currentTab === 'chat' && <SchoolLifeQA onOpenImage={handleOpenImage} />}
        {currentTab === 'grammar' && <TextbookPreview onOpenImage={handleOpenImage} />}
      </main>

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
