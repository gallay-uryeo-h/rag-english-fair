import { useState, useRef, useEffect } from 'react';
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
  // 🌟 운영 모드 (true: 인스타그램 무한 피드 & 아코디언, false: 브레인스토밍 12개 탭)
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);

  // 🌟 하단 바 활성 탭 (현재 화면 위치 표시용)
  const [activeNavTab, setActiveNavTab] = useState<LiveNavTab>('home');

  // 🌟 인피드 아코디언 열림/닫힘 상태
  const [expandedSections, setExpandedSections] = useState({
    mbti: false,
    vocab: false,
    textbook: false,
    seteuk: false,
  });

  // 🌟 피드 내 각 포스트 앵커 참조 (스크롤 점프용)
  const homeRef = useRef<HTMLDivElement | null>(null);
  const mbtiRef = useRef<HTMLDivElement | null>(null);
  const vocabRef = useRef<HTMLDivElement | null>(null);
  const textbookRef = useRef<HTMLDivElement | null>(null);
  const seteukRef = useRef<HTMLDivElement | null>(null);

  // 브레인스토밍 탭
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

  // 🌟 스크롤 위치 감지: 현재 화면에 위치한 섹션에 맞추어 하단 탭 자동 하이라이트
  useEffect(() => {
    if (!isLiveMode) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // 헤더 높이 등을 감안한 감지 오프셋
          const offset = 180;

          if (scrollY < 120) {
            setActiveNavTab('home');
            ticking = false;
            return;
          }

          const sections: { key: LiveNavTab; ref: React.RefObject<HTMLDivElement | null> }[] = [
            { key: 'mbti', ref: mbtiRef },
            { key: 'vocab', ref: vocabRef },
            { key: 'textbook', ref: textbookRef },
            { key: 'seteuk', ref: seteukRef },
          ];

          // 역순으로 탐색하여 화면 상단(offset)보다 위 또는 걸쳐 있는 가장 아래 섹션 찾기
          let active: LiveNavTab = 'home';
          for (let i = sections.length - 1; i >= 0; i--) {
            const el = sections[i].ref.current;
            if (el) {
              const top = el.getBoundingClientRect().top;
              if (top <= offset) {
                active = sections[i].key;
                break;
              }
            }
          }

          // 맨 아래 끝까지 스크롤된 경우 마지막 탭 활성화
          if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
            active = 'seteuk';
          }

          setActiveNavTab(active);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLiveMode]);

  // 아코디언 토글 함수
  const handleToggleSection = (key: 'mbti' | 'vocab' | 'textbook' | 'seteuk') => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 🎯 스마트 북마크 스크롤 (부드럽게 이동하고 해당 아코디언 자동 오픈!)
  const handleScrollTo = (key: 'home' | 'mbti' | 'vocab' | 'textbook' | 'seteuk') => {
    setActiveNavTab(key);

    if (key === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 대상 아코디언을 자동으로 펼침
    setExpandedSections((prev) => ({
      ...prev,
      [key]: true,
    }));

    // 약간의 딜레이 후 해당 요소로 스크롤
    setTimeout(() => {
      const refMap = {
        mbti: mbtiRef,
        vocab: vocabRef,
        textbook: textbookRef,
        seteuk: seteukRef,
      };

      const targetRef = refMap[key];
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 🌟 1. 최상단 인스타그램 Urgirlshigh 헤더 (연구 모드 토글 내장) */}
      <LiveHeader
        isLiveMode={isLiveMode}
        onToggleMode={() => setIsLiveMode((prev) => !prev)}
      />

      {isLiveMode ? (
        /* =========================================================================
           [안 1 혁신형] 단일 무한 피드 + 인라인 아코디언 확장 + 하단 스마트 북마크
           ========================================================================= */
        <div className="flex-1 flex flex-col w-full bg-slate-50 pb-20">
          <main className="flex-1 w-full max-w-xl mx-auto px-0 py-0">
            <LiveHomeFeed
              onOpenImage={handleOpenImage}
              feedRefs={{
                homeRef,
                mbtiRef,
                vocabRef,
                textbookRef,
                seteukRef,
              }}
              expandedSections={expandedSections}
              onToggleSection={handleToggleSection}
              onScrollTo={handleScrollTo}
            />
          </main>

          {/* 하단 스마트 북마크 네비게이션 바 */}
          <LiveBottomBar
            currentTab={activeNavTab}
            onSelectTab={handleScrollTo}
          />
        </div>
      ) : (
        /* =========================================================================
           [기존] 브레인스토밍 모드: 12개 전체 실험적 탭 & 모바일 프레임 유지
           ========================================================================= */
        <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto bg-slate-100 border-x border-slate-200 shadow-sm overflow-hidden">
          <Header />
          <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

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
