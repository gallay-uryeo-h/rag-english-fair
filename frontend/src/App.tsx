import { useState } from 'react';
import type { TabType } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Station5Recommend } from './components/Station5Recommend';
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
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-slate-50 border-x border-slate-200 shadow-sm overflow-hidden">
      {/* 고정 헤더 */}
      <Header />

      {/* 내비게이션 바 */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* 탭 뷰 본문 */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {currentTab === 'recommend' && <Station5Recommend onOpenImage={handleOpenImage} />}
        {currentTab === 'visual' && <GrowthRoadmap onOpenImage={handleOpenImage} />}
        {currentTab === 'chat' && <SchoolLifeQA onOpenImage={handleOpenImage} />}
        {currentTab === 'grammar' && <TextbookPreview onOpenImage={handleOpenImage} />}
      </main>

      {/* 교과서 원본 사진 팝업 모달 */}
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
