import React, { useState } from 'react';
import { Lightbulb, BookOpen, FileText, ExternalLink } from 'lucide-react';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

interface SeteukTopic {
  title: string;
  book: string;
  page: number;
  imagePath: string;
  researchTopic: string;
  outline: string;
}

interface CareerCategory {
  name: string;
  icon: string;
  topics: SeteukTopic[];
}

const SETEUK_DATA: CareerCategory[] = [
  {
    name: '간호 · 보건 · 의학',
    icon: '🩺',
    topics: [
      {
        title: '신체 언어와 비언어적 소통이 환자 치료 만족도에 미치는 영향',
        book: '공통영어1 Unit 3 본문',
        page: 63,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p63.jpg',
        researchTopic: '의료 현장에서의 효과적인 공감적 소통(Empathic Communication) 전략 탐구',
        outline: '본문의 신체 언어 및 심리적 표현을 바탕으로, 간호사의 비언어적 피드백이 환자의 심리적 안정에 미치는 긍정적 효과를 영문 사례 연구로 분석 및 발표함.',
      },
      {
        title: '글로벌 보건 격차와 다문화 의료 통역 지원 시스템',
        book: '세계 문화와 영어 Unit 2 본문',
        page: 48,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p48.jpg',
        researchTopic: '다문화 가정 및 외국인 환자를 위한 병원 내 의료 영어 프로토콜 개선 방안',
        outline: '세계 문화별 건강에 대한 인식 차이를 조사하고, 문화적 차이로 인해 발생할 수 있는 진료 오해를 방지하는 의료진 가이드라인 작성 프로젝트를 수행함.',
      },
    ],
  },
  {
    name: 'AI · 컴퓨터 · SW · 데이터',
    icon: '💻',
    topics: [
      {
        title: '인공지능의 윤리적 딜레마와 알고리즘 편향성 비판적 읽기',
        book: '영어I Unit 4 본문',
        page: 94,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p94.jpg',
        researchTopic: '생성형 AI 언어 모델의 편향 방지를 위한 프롬프트 엔지니어링 탐구',
        outline: '지문에 등장하는 기술 발전의 명암을 분석하여, 글로벌 IT 기업들의 AI 윤리 헌장을 영문으로 비교 대조하고 공정한 알고리즘 설계를 위한 제언 에세이를 작성함.',
      },
      {
        title: '데이터 기반 미래 예측과 디지털 트윈 기술의 응용',
        book: '영어 독해와 작문 Unit 1 본문',
        page: 16,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p16.jpg',
        researchTopic: '스마트 시티 구축을 위한 영문 데이터셋 분석 및 시각화 연구',
        outline: '무생물 주어구문과 복합 문장을 정밀 분석하여 해외 스마트 시티 백서를 독해하고, 의령 지역의 지능형 교통 시스템 적용 가능성을 영어 보고서로 발표함.',
      },
    ],
  },
  {
    name: '미디어 · 콘텐츠 · 웹툰 · 방송',
    icon: '🎬',
    topics: [
      {
        title: '스토리텔링 기법과 글로벌 OTT 플랫폼 속 K-콘텐츠의 현지화',
        book: '영어II Unit 2 본문',
        page: 41,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p41.jpg',
        researchTopic: '한국 관용표현의 영문 자막 번역 과정에서 나타나는 문화적 번역(Cultural Translation) 연구',
        outline: '영어II의 목적격보어 분사 표현을 활용해 영화 대본의 극적 긴장감 형성 구조를 분석하고, 한국어 감정 형용사를 해외 관객에게 효과적으로 전달하는 자막 제작 실습을 진행함.',
      },
    ],
  },
  {
    name: '경영 · 마케팅 · 공공정책',
    icon: '📈',
    topics: [
      {
        title: '지속 가능한 소비와 기업의 ESG 마케팅 전략 분석',
        book: '공통영어2 Unit 2 본문',
        page: 41,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p41.jpg',
        researchTopic: '친환경 위장술(Greenwashing) 방지를 위한 영문 소비자 보호 규약 비교',
        outline: '강조구문과 인과관계 연결사를 정밀하게 적용하여 글로벌 소비재 기업의 지속가능성 리포트를 심층 분석하고, 청소년 친환경 소비 권장 영문 카드뉴스를 제작함.',
      },
    ],
  },
];

export const SeteukGeneratorTab: React.FC<Props> = ({ onOpenImage }) => {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const cat = SETEUK_DATA[selectedCategory];

  return (
    <div className="flex-1 overflow-y-auto space-y-3 w-full">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-5 shadow-sm border-b border-amber-800">
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 w-fit px-2.5 py-1 rounded-full mb-2">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>학생부 세특 치트키</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1">
          의령여고 영어과 세특 아이디어 발전소 💡
        </h2>
        <p className="text-xs md:text-sm text-amber-100 leading-relaxed">
          &quot;고등학교 가서 영어 세특 어떻게 채우지?&quot; 중3 학생과 학부모님의 가장 큰 고민! 의령여고 3개년 교과서 본문 첫 페이지와 진로를 1:1로 엮은 실전형 탐구 주제를 제안합니다.
        </p>
      </div>

      {/* 진로 분야 선택 */}
      <div className="bg-white p-3 border-y border-slate-200 overflow-x-auto no-scrollbar flex gap-2">
        {SETEUK_DATA.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCategory(idx)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              selectedCategory === idx
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* 탐구보고서 주제 카드 목록 */}
      <div className="space-y-3">
        {cat.topics.map((tp, idx) => (
          <div
            key={idx}
            className="bg-white border-y border-slate-200/90 p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  추천 세특 주제 {idx + 1}
                </span>
                <h3 className="font-bold text-slate-800 text-sm md:text-base mt-1">
                  {tp.researchTopic}
                </h3>
              </div>
              <button
                onClick={() => onOpenImage(`${tp.book} (p.${tp.page})`, `/${tp.imagePath}`)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-700 text-xs font-medium transition-colors shrink-0 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>본문 첫 페이지 (p.{tp.page})</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-slate-700">연계 교과서 단원:</span>
                <span className="text-blue-600 font-bold">{tp.book}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 space-y-1">
                <div className="font-bold text-slate-700">📝 학생부 세특 기록 예시 문구:</div>
                <div className="text-slate-600 leading-relaxed font-mono">
                  &ldquo;{tp.outline}&rdquo;
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
