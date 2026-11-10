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
import { InstagramPostCard } from './components/InstagramPostCard';

export function App() {
  // 🌟 운영 모드 (true: 인스타그램 무한 피드 & 아코디언, false: 브레인스토밍 12개 탭)
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);

  // 🌟 피드 뷰 모드 ('feed': 단일 무한 피드, 'grid': 인스타 3열 그리드 탐색)
  const [feedViewMode, setFeedViewMode] = useState<'feed' | 'grid'>('feed');

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
        viewMode={feedViewMode}
        onToggleViewMode={() => setFeedViewMode((prev) => (prev === 'feed' ? 'grid' : 'feed'))}
      />

      {isLiveMode ? (
        /* =========================================================================
           [안 1 혁신형] 단일 무한 피드 + 인라인 아코디언 확장 + 하단 스마트 북마크
           ========================================================================= */
        <div className="flex-1 flex flex-col w-full bg-slate-50 pb-20">
          <main className="flex-1 w-full max-w-xl mx-auto px-0 py-0">
            <LiveHomeFeed
              onOpenImage={handleOpenImage}
              viewMode={feedViewMode}
              onSelectGridPost={(key) => {
                setFeedViewMode('feed');
                setTimeout(() => handleScrollTo(key), 80);
              }}
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
            {/* 📸 1. 인스타그램 일관성 복제본 탭들 */}
            {currentTab === 'insta-mbti' && (
              <InstagramPostCard
                accountName="ur_english_mbti"
                badgeText="성향 진단 공식"
                badgeColorClass="text-blue-600 bg-blue-50"
                avatarChar="🧭"
                avatarGradientClass="from-pink-500 via-rose-500 to-amber-500"
                locationText="의령여고 1부스 · 16 MBTI 매칭"
                heroImageSrc="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80"
                stageBadgeText="STAGE 01 · 8문항 정밀 검사"
                heroTitle="MBTI별 본문 추천"
                heroSubtitle="나의 성향과 꼭 맞는 의령여고 영어 교과서 본문을 찾아보세요!"
                heroImageAlt="영어 공부와 성향 탐색"
                initialLikes={482}
                postCaption="친구와 나의 학습 성향을 비교하고 최적의 교과서 단원을 발견하세요! 🧭"
              >
                <DeepEnglishMbtiTab onOpenImage={handleOpenImage} />
              </InstagramPostCard>
            )}

            {currentTab === 'insta-vocab' && (
              <InstagramPostCard
                accountName="ur_audio_vocab"
                badgeText="TTS 원어민 음성 탑재"
                badgeColorClass="text-purple-600 bg-purple-50"
                avatarChar="🎧"
                avatarGradientClass="from-purple-500 via-indigo-500 to-pink-500"
                locationText="의령여고 2부스 · 소리 퀴즈"
                heroImageSrc="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                stageBadgeText="STAGE 02 · 소리만 듣고 맞추기 포함"
                heroTitle="단어 미리보기"
                heroSubtitle="1~4번 문맥 어휘 확인 + 5번 문제는 단어를 가리고 오직 소리만 듣고 맞추기!"
                heroImageAlt="헤드폰 음악 소리 단어"
                initialLikes={295}
                postCaption="눈으로만 외우는 단어는 이제 그만! 원어민 발음을 듣고 만점에 도전해 보세요. 🎧"
              >
                <VocabListenTab />
              </InstagramPostCard>
            )}

            {currentTab === 'insta-textbook' && (
              <InstagramPostCard
                accountName="ur_textbook_viewer"
                badgeText="144개 섹션 정밀 검증"
                badgeColorClass="text-emerald-600 bg-emerald-50"
                avatarChar="📚"
                avatarGradientClass="from-emerald-500 via-teal-500 to-cyan-500"
                locationText="3개년 교육과정 전시관 · 6권 교과서"
                heroImageSrc="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1000&q=80"
                stageBadgeText="STAGE 03 · 3×2 표지 그리드 ➔ 단원 레이어"
                heroTitle="의령여고 3개년 교과서 6권 대공개!"
                heroSubtitle="표지를 누르면 단원 안으로 쏙! 듣기·말하기·읽기·문법·쓰기 원본 E-Book을 바로 열람하세요."
                heroImageAlt="도서관 교과서"
                initialLikes={512}
                postCaption="공통영어부터 세계문화와 영어까지, 144개 모든 파트의 학습 내용이 100% 정밀 검증되어 있습니다. 📚"
              >
                <TextbookBrowse2Layer onOpenImage={handleOpenImage} />
              </InstagramPostCard>
            )}

            {currentTab === 'insta-seteuk' && (
              <InstagramPostCard
                accountName="ur_seteuk_powerhouse"
                badgeText="대입 학생부 종합 대비"
                badgeColorClass="text-amber-600 bg-amber-50"
                avatarChar="💡"
                avatarGradientClass="from-amber-500 via-orange-500 to-rose-500"
                locationText="진로 & 세특 전략 연구소 · 8대 전공"
                heroImageSrc="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80"
                stageBadgeText="STAGE 04 · 교과서 본문 연계 탐구보고서"
                heroTitle="교과서 지문이 나만의 세특 치트키로 변신!"
                heroSubtitle="희망 진로(의학·AI·미디어·교육) 맞춤형 탐구 주제와 학생부 기재 예시를 확인하세요."
                heroImageAlt="노트 공부 세특"
                initialLikes={389}
                postCaption="단순한 지문 읽기를 넘어 나의 꿈과 진로를 학생부 세특 보고서로 완성하는 마법! 💡"
              >
                <SeteukGeneratorTab onOpenImage={handleOpenImage} />
              </InstagramPostCard>
            )}

            {/* 🔬 2. 기존 브레인스토밍 랩 뷰 탭들 */}
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
