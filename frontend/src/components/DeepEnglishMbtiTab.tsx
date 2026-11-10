import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  RotateCcw,
  Info,
  ExternalLink,
  TrendingUp,
  Brain,
  Sliders
} from 'lucide-react';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

// 4대 정통 MBTI 차원: E vs I, S vs N, T vs F, J vs P
export type TraitKey = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

interface DeepQuestion {
  id: number;
  category: string;
  axis: string;
  question: string;
  desc: string;
  optionA: { text: string; subText: string; trait: TraitKey };
  optionB: { text: string; subText: string; trait: TraitKey };
}

const DEEP_QUESTIONS: DeepQuestion[] = [
  // ── [1. 에너지와 탐구 방향: E vs I] ──
  {
    id: 1,
    category: '독해 에너지와 탐구 방향',
    axis: 'E (외향적 사회탐구) vs I (내면적 성찰사색)',
    question: '새로운 영어 지문을 펼쳤을 때 나를 더 설레게 하는 글은?',
    desc: '글을 읽을 때 나의 호기심이 향하는 주된 방향은?',
    optionA: {
      text: '세계 여러 나라의 문화, 올림픽 축제, 다문화 소통과 사회적 상호작용',
      subText: '넓은 세상을 탐험하고 사람들과의 관계·활동에 주목하는 글 (E)',
      trait: 'E',
    },
    optionB: {
      text: '인간의 미묘한 내면 심리, 가면 증후군 극복, 고독과 자아존중감의 성찰',
      subText: '나 자신의 내면을 들여다보고 깊은 생각을 자극하는 글 (I)',
      trait: 'I',
    },
  },
  {
    id: 2,
    category: '수업 참여와 생각 나누기',
    axis: 'E (외향적 토론) vs I (내면적 숙고)',
    question: '영어 수업 시간에 더 흥미를 느끼는 학습 방식은?',
    desc: '내가 배운 내용을 소화하고 표현하는 방식은?',
    optionA: {
      text: '모둠 친구들과 다양한 의견을 활발히 주고받으며 토론하고 발표하는 활동',
      subText: '대화와 상호작용을 통해 생각을 확장하기 (E)',
      trait: 'E',
    },
    optionB: {
      text: '조용히 혼자 본문을 꼼꼼히 음미하며 나만의 단어장과 감상 노트를 정리하는 활동',
      subText: '스스로 깊이 있게 곱씹으며 내면화하기 (I)',
      trait: 'I',
    },
  },

  // ── [2. 인식과 정보 수용: S vs N] ──
  {
    id: 3,
    category: '정보 수용과 독해 스타일',
    axis: 'S (구체적 사실·데이터) vs N (직관적 의미·미래가능성)',
    question: '글을 읽을 때 더 신뢰가 가고 흥미로운 지문은?',
    desc: '나의 뇌가 정보를 받아들이는 선호 방식은?',
    optionA: {
      text: '구체적인 실험 데이터, 역사적 연도, 과학적 팩트와 명확한 사건 기록',
      subText: '눈에 보이고 검증 가능한 구체적 사실 중심의 글 (S)',
      trait: 'S',
    },
    optionB: {
      text: '인공지능과 미래 인간의 운명, 문학적 은유, 보이지 않는 패러다임의 변화',
      subText: '전체적인 큰 그림과 새로운 가능성을 상상하게 하는 글 (N)',
      trait: 'N',
    },
  },
  {
    id: 4,
    category: '글의 핵심 파악 방식',
    axis: 'S (현실적 팩트) vs N (통찰적 비전)',
    question: '독해 후 친구에게 글을 설명한다면 주로 어떻게 말하나요?',
    desc: '내가 지문에서 가장 먼저 캐치하는 부분은?',
    optionA: {
      text: '“이 글은 커피박 찌꺼기 몇 톤이 어떤 화학 공정으로 비료가 되는지 자세히 나와 있어.”',
      subText: '세부적인 디테일과 단계별 팩트를 정확히 전달 (S)',
      trait: 'S',
    },
    optionB: {
      text: '“이 글은 인간의 끝없는 욕망과 미래 기술의 윤리적 딜레마에 대한 이야기야.”',
      subText: '글 이면에 담긴 거시적인 의미와 철학적 메시지를 전달 (N)',
      trait: 'N',
    },
  },

  // ── [3. 판단과 의사결정: T vs F] ──
  {
    id: 5,
    category: '판단과 논리 평가',
    axis: 'T (논리적 분석·객관성) vs F (가치 중심·인간 공감)',
    question: '논설문이나 칼럼을 읽을 때 더 설득력 있게 다가오는 부분은?',
    desc: '글의 옳고 그름을 판단하는 나의 기준은?',
    optionA: {
      text: '철저한 인과관계, 과학적 반박 논리, 수치적 효율성과 합리적 근거',
      subText: '객관적인 논리와 인과율이 엄밀한 주장 (T)',
      trait: 'T',
    },
    optionB: {
      text: '사람에 대한 배려, 소외된 이웃에 대한 공감, 공동체의 따뜻한 윤리적 가치',
      subText: '사람의 마음을 움직이고 인간적인 온기를 지닌 주장 (F)',
      trait: 'F',
    },
  },
  {
    id: 6,
    category: '지문 속 인물 평가',
    axis: 'T (원칙과 성과) vs F (헌신과 동기)',
    question: '지문에 등장하는 훌륭한 인물을 볼 때 더 존경스러운 점은?',
    desc: '내가 인물에게 감동받는 핵심 포인트는?',
    optionA: {
      text: '철저한 계획과 뛰어난 지적 능력으로 불가능해 보였던 기술적 문제를 해결해 낸 능력',
      subText: '탁월한 역량과 문제 해결의 객관적 성과 (T)',
      trait: 'T',
    },
    optionB: {
      text: '자신의 안위를 돌보지 않고 타인을 위해 바다에 뛰어들거나 평생을 바친 이타적인 헌신',
      subText: '순수한 마음과 타인을 향한 따뜻한 사랑 (F)',
      trait: 'F',
    },
  },

  // ── [4. 생활양식과 계획성: J vs P] ──
  {
    id: 7,
    category: '독해 과업 수행 스타일',
    axis: 'J (체계적 구조화) vs P (유연한 적응·탐색)',
    question: '긴 영어 장문 독해를 읽을 때 나의 스타일은?',
    desc: '과업을 처리할 때 더 편안함을 느끼는 방식은?',
    optionA: {
      text: '문단별로 번호를 매기고 중심 문장에 밑줄을 그어가며 단계별로 완벽히 정복하기',
      subText: '체계적인 계획과 구조화된 정리 선호 (J)',
      trait: 'J',
    },
    optionB: {
      text: '흥미로운 문장과 표현에 자연스럽게 빠져들며 글의 흐름을 자유롭게 따라가기',
      subText: '틀에 얽매이지 않고 유연하게 맥락을 탐색하기 (P)',
      trait: 'P',
    },
  },
  {
    id: 8,
    category: '시험 대비와 영어 학습 습관',
    axis: 'J (계획적 관리) vs P (몰입형 스퍼트)',
    question: '교과서 본문 시험공부를 할 때 나의 모습은?',
    desc: '내가 학습 목표를 달성하는 방식은?',
    optionA: {
      text: '시험 3주 전부터 단원별로 하루 분량을 정해두고 규칙적으로 끝마치기',
      subText: '예측 가능하고 안정적인 루틴 선호 (J)',
      trait: 'J',
    },
    optionB: {
      text: '관심이 가는 재미있는 단원부터 먼저 깊게 파고들며 집중력이 발휘될 때 몰아치기',
      subText: '자유로운 몰입과 순발력 있는 에너지 발휘 선호 (P)',
      trait: 'P',
    },
  },
];

interface MatchedPassage {
  subject: string;
  unit: string;
  title: string;
  summary: string;
  page: number;
  imagePath: string;
  matchScore: number;
  keywords: string[];
}

interface DeepMbtiResult {
  code: string;
  title: string;
  subTitle: string;
  badge: string;
  badgeColor: string;
  summarySentence: string;
  tendencyAnalysis: string[];
  recommendedPassages: MatchedPassage[];
  careerPath: string;
  customStudyTip: string;
}

// 16대 정통 MBTI 성향별 지문 매칭 데이터베이스
const MBTI_16_DATABASE: Record<string, DeepMbtiResult> = {
  INTJ: {
    code: 'INTJ',
    title: '용의주도한 전략가 & 미래 시스템 설계자 🏛️',
    subTitle: 'The Mastermind Architect',
    badge: '전략분석 & 미래기술',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    summarySentence: '거시적인 안목으로 기술의 원리와 미래 사회 시스템의 패러다임을 꿰뚫어 보는 통찰력의 소유자입니다.',
    tendencyAnalysis: [
      '논리적 비약이 없는 정교한 과학 기술 지문과 미래 사회 예측문에서 독해력이 가장 빛납니다.',
      '글의 구조를 한눈에 파악하며, 저자가 숨겨둔 논리적 맹점을 날카롭게 분석해냅니다.',
      '수능 고난도 빈칸 추론이나 문장 삽입 유형에서 압도적인 정답률을 자랑합니다.',
    ],
    careerPath: 'AI 시스템 아키텍트 · 뇌과학 연구원 · 정책분석관 · 첨단 기술 전략가',
    customStudyTip: '글 전체의 거시적 명제(Main Thesis)와 각 문단의 인과적 논증 체계를 도식화하며 읽는 방식이 완벽히 맞습니다.',
    recommendedPassages: [
      {
        subject: '공통영어2',
        unit: 'Lesson 4',
        title: 'Will AI-Powered Neural Implants Make Us Super-Humans?',
        summary: '인간의 뇌와 컴퓨터를 연결하는 신경망 임플란트 기술의 원리와 미래 시스템 윤리 지문',
        page: 85,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p85.jpg',
        matchScore: 99,
        keywords: ['신경망', 'AI 임플란트', '초인간', '미래 시스템'],
      },
      {
        subject: '영어독해와작문',
        unit: 'Lesson 4',
        title: 'Astronomy Solves an Art Mystery',
        summary: '천문학 알고리즘과 조수 데이터로 명화 속 태양 위치를 역추적해 낸 과학적 융합 분석 지문',
        page: 88,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p88.jpg',
        matchScore: 96,
        keywords: ['천문학 궤적', '명화 검증', '알고리즘', '논리 추론'],
      },
    ],
  },
  INTP: {
    code: 'INTP',
    title: '논리적인 사색가 & 지적 원리 탐구자 💡',
    subTitle: 'The Theoretical Thinker',
    badge: '원리탐구 & 과학이론',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    summarySentence: '“왜 그럴까?”라는 근원적인 호기심으로 현상의 기저에 흐르는 과학적 원리를 자유롭게 탐색하는 사색가입니다.',
    tendencyAnalysis: [
      '소음 상쇄 간섭이나 동물 인지과학처럼 눈에 보이지 않는 법칙을 규명하는 글을 즐깁니다.',
      '틀에 얽매이지 않고 자유롭게 사고할 때 독해 속도가 빨라지며, 지적 유희를 느낍니다.',
      '지문 속 개념의 정의와 원리를 파고드는 깊이 있는 문해력을 가지고 있습니다.',
    ],
    careerPath: '물리학자 · 인지과학자 · 데이터 분석가 · 알고리즘 개발자',
    customStudyTip: '핵심 개념의 학술적 어원과 메커니즘을 마인드맵으로 연결하며 읽어보세요.',
    recommendedPassages: [
      {
        subject: '공통영어1',
        unit: 'Lesson 3',
        title: 'Tuning Out: The Science of Noise-Cancellation',
        summary: '반대 위상의 음파를 생성해 주변 소음을 완벽히 지워버리는 소음 상쇄 간섭 과학 원리 본문',
        page: 63,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p63.jpg',
        matchScore: 99,
        keywords: ['음파 간섭', '노이즈 캔슬링', '주파수', '물리 법칙'],
      },
      {
        subject: '영어Ⅰ',
        unit: 'Lesson 2',
        title: 'Science Report: Animal Habits and Tool Use',
        summary: '까마귀의 도구 제작과 문제 해결 능력을 체계적인 실험으로 입증한 동물 인지과학 지문',
        page: 42,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p42.jpg',
        matchScore: 95,
        keywords: ['까마귀 지능', '인지과학', '도구 사용', '가설 검증'],
      },
    ],
  },
  ENTJ: {
    code: 'ENTJ',
    title: '대담한 지도자 & 혁신 벤처 총괄가 🚀',
    subTitle: 'The Visionary Leader',
    badge: '혁신리더 & 글로벌사업',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    summarySentence: '작은 차고에서 출발해 세상을 바꾸는 스타트업 혁신과 효율적인 시스템 개혁을 주도하는 리더입니다.',
    tendencyAnalysis: [
      '목표 지향적이고 추진력이 돋보이는 기업가 스토리나 거대 프로젝트 지문에 가슴이 뜁니다.',
      '문제 해결(Problem-Solving) 중심의 명쾌한 구성에서 빠른 독해 속도를 발휘합니다.',
      '지문을 읽으면서 "현실에서 이 아이디어를 어떻게 실현할 것인가?"를 전략적으로 구상합니다.',
    ],
    careerPath: '벤처 창업가 · 글로벌 경영 컨설턴트 · 도시계획가 · 기업 CEO',
    customStudyTip: '문제 제기 → 해결 전략 → 기대 효과의 3단계 비즈니스 로직으로 단락을 나누어 요약해 보세요.',
    recommendedPassages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 4',
        title: 'American Garage Startups & Silicon Valley',
        summary: '스티브 잡스와 아마존 등 차고에서 시작해 세계를 바꾼 청년 테크 스타트업 창업 신화',
        page: 90,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p90.jpg',
        matchScore: 99,
        keywords: ['차고 창업', '실리콘밸리', '혁신 벤처', '스티브 잡스'],
      },
      {
        subject: '영어II',
        unit: 'Lesson 3',
        title: 'There’s More than One Way to Vote',
        summary: '다양한 선호투표제를 통해 사회적 의사결정의 공정성과 효율성을 극대화하는 제도 개혁 지문',
        page: 67,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p67.jpg',
        matchScore: 95,
        keywords: ['선거 개혁', '선호투표제', '의사결정', '사회 시스템'],
      },
    ],
  },
  ENTP: {
    code: 'ENTP',
    title: '뜨거운 변론가 & 행동경제학 통찰가 🎭',
    subTitle: 'The Innovative Debater',
    badge: '심리통찰 & 창의적발상',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    summarySentence: '통념을 깨는 기발한 시선으로 인간의 비합리적 선택 심리와 미끼 효과를 파헤치는 지적 모험가입니다.',
    tendencyAnalysis: [
      '행동경제학, 마케팅 트릭, 소비자의 심리적 허점을 유쾌하고 예리하게 짚어내는 글을 사랑합니다.',
      '기존의 규칙에 의문을 제기하고 다각도로 비판적으로 읽는 능력이 탁월합니다.',
      '일상의 익숙한 사물을 뒤집어 생각하는 창의적인 역발상 지문에서 큰 즐거움을 얻습니다.',
    ],
    careerPath: '행동경제학자 · 광고기획 디렉터 · 스타트업 마케터 · 방송 크리에이터',
    customStudyTip: '글쓴이의 주장과 반대되는 반론(Counter-argument)을 스스로 세워보며 읽으면 논리력이 극대화됩니다.',
    recommendedPassages: [
      {
        subject: '영어독해와작문',
        unit: 'Lesson 3',
        title: 'The Decoy Effect in Everyday Decisions',
        summary: '소비자를 교묘하게 조종하는 미끼 옵션의 배치와 비이성적 선택 심리를 파헤친 행동경제학 본문',
        page: 64,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p64.jpg',
        matchScore: 99,
        keywords: ['미끼 효과', '행동경제학', '비합리적 소비', '심리 넛지'],
      },
      {
        subject: '공통영어2',
        unit: 'Lesson 2',
        title: 'Light Up Dark Patterns: Online Shopping Tricks',
        summary: '사용자를 속여 자동 결제를 유도하는 전자상거래 속 교묘한 다크 패턴의 속임수 고발 지문',
        page: 41,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p41.jpg',
        matchScore: 96,
        keywords: ['다크 패턴', 'UI 속임수', '소비자 기만', '비판적 사고'],
      },
    ],
  },
  INFJ: {
    code: 'INFJ',
    title: '선의의 옹호자 & 깊은 인문 통찰가 🌟',
    subTitle: 'The Insightful Advocate',
    badge: '인간성찰 & 감성철학',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summarySentence: '인간 내면의 상처를 보듬고, 인공지능 시대에 진정한 영혼과 사랑의 가치를 묵묵히 탐색하는 철학자입니다.',
    tendencyAnalysis: [
      '가면 증후군 치유, 감정을 지닌 AI 로봇 소설처럼 인간의 존엄성을 다룬 글에 깊이 공감합니다.',
      '글의 행간(Between the lines)에 담긴 은유와 상징을 남들보다 직관적으로 읽어내는 재능이 있습니다.',
      '조용하지만 확고한 윤리적 신념을 가지고 따뜻한 세상을 꿈꾸는 지문을 선호합니다.',
    ],
    careerPath: '임상심리상담사 · 문학 번역가 · 생명윤리학자 · 시나리오 작가',
    customStudyTip: '문학적 비유와 감정 형용사의 미묘한 어감 차이를 나만의 단어장에 정리하며 읽어보세요.',
    recommendedPassages: [
      {
        subject: '영어독해와작문',
        unit: 'Lesson 6',
        title: 'Imagine Living with AI: Robotics & Klara and the Sun',
        summary: '노벨문학상 작가 가즈오 이시구로의 SF 명작을 통해 로봇 클라라의 헌신과 인간성을 성찰하는 본문',
        page: 136,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p136.jpg',
        matchScore: 99,
        keywords: ['클라라와 태양', 'AI 감정', '인간성 회복', '노벨문학상'],
      },
      {
        subject: '영어독해와작문',
        unit: 'Lesson 1',
        title: 'You Are Good Enough: Overcoming the Impostor Syndrome',
        summary: '자신의 능력을 끊임없이 의심하는 가면 증후군을 딛고 자아를 찾아가는 심리학 지문',
        page: 16,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p16.jpg',
        matchScore: 97,
        keywords: ['가면 증후군', '자아존중감', '내면 성장', '심리 치유'],
      },
    ],
  },
  INFP: {
    code: 'INFP',
    title: '열정적인 중재자 & 순수 예술 낭만가 🎨',
    subTitle: 'The Idealistic Poet',
    badge: '순수문학 & 예술감동',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
    summarySentence: '세상의 편견에 흔들리지 않고 순수한 영혼으로 감동적인 예술과 이야기를 빚어내는 낭만주의자입니다.',
    tendencyAnalysis: [
      '정규 교육 없이도 마음의 떨림을 캔버스에 담은 민속 화가나 고전 단편소설을 사랑합니다.',
      '자신의 내면 가치관과 일치하는 글을 읽을 때 엄청난 감정적 몰입과 어휘 흡수력을 보여줍니다.',
      '삭막한 지식 전달보다 따뜻한 인간미와 문학적 여운이 길게 남는 지문을 선호합니다.',
    ],
    careerPath: '예술기획자 · 동화/에세이 작가 · 문화인류학자 · 일러스트레이터',
    customStudyTip: '마음에 와닿는 명문장을 필사(Copying)하고 나만의 한 줄 소감을 영어로 적어보는 습관이 효과적입니다.',
    recommendedPassages: [
      {
        subject: '공통영어2',
        unit: 'Lesson 3',
        title: 'From Shadows to Spotlight: Bill Traylor & Maud Lewis',
        summary: '골판지와 작은 판잣집에서 피어난 민속 화가들의 순수한 열정과 감동적인 삶을 다룬 본문',
        page: 63,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p63.jpg',
        matchScore: 99,
        keywords: ['민속 화가', '모드 루이스', '순수 예술', '감동 실화'],
      },
      {
        subject: '영어Ⅱ',
        unit: 'Lesson 6',
        title: 'Special Lesson: The Model Millionaire by Oscar Wilde',
        summary: '오스카 와일드의 따뜻하고 위트 넘치는 영미 고전 단편소설 원문',
        page: 139,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p139.jpg',
        matchScore: 95,
        keywords: ['오스카 와일드', '모범적 백만장자', '풍자 문학', '인간미'],
      },
    ],
  },
  ENFJ: {
    code: 'ENFJ',
    title: '정의로운 주인공 & 세대 통합 촉진자 🤝',
    subTitle: 'The Inspiring Protagonist',
    badge: '세대통합 & 사회복지',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    summarySentence: '청년과 노인이 함께 웃는 따뜻한 공동체, 다정함이 지닌 힘으로 세상을 연결하는 화합의 리더입니다.',
    tendencyAnalysis: [
      '세대 간의 교류(Humanitas)나 사람들의 마음을 하나로 모으는 친절함의 지문에서 큰 보람을 느낍니다.',
      '타인의 감정을 민감하게 포착하며, 소통과 공감에 관한 주제를 설득력 있게 풀어냅니다.',
      '팀 프로젝트나 토론에서 모두가 행복한 결론을 이끌어내는 데 탁월합니다.',
    ],
    careerPath: '사회복지 전문가 · 교육행정가 · 청소년 상담사 · 사회적기업가',
    customStudyTip: '등장인물 간의 관계성과 대화 표현(Interpersonal Expressions)에 주목하며 글을 읽어보세요.',
    recommendedPassages: [
      {
        subject: '영어Ⅰ',
        unit: 'Lesson 3',
        title: 'Humanitas: Living in Harmony Across Generations',
        summary: '네덜란드 대학생들이 노인 요양원에서 말벗이 되어주며 무료로 거주하는 감동적인 세대 공존 프로젝트',
        page: 68,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p68.jpg',
        matchScore: 99,
        keywords: ['휴머니타스', '세대 통합', '노인 복지', '공동체 상생'],
      },
      {
        subject: '공통영어1',
        unit: 'Lesson 1',
        title: 'The Power of Friendliness: Soft but Strong',
        summary: '다정함과 협력이 약육강식을 이기고 인류 생존의 열쇠가 된 진화론적 힘을 다룬 본문',
        page: 19,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p19.jpg',
        matchScore: 96,
        keywords: ['다정함의 힘', '협력', '소통', '인간관계'],
      },
    ],
  },
  ENFP: {
    code: 'ENFP',
    title: '재기발랄한 활동가 & 창의적 모험가 🎈',
    subTitle: 'The Enthusiastic Campaigner',
    badge: '창의발상 & 푸드아트',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    summarySentence: '일상의 과일 하나에서도 예술을 발견하고, 세계 각국을 누비며 새로운 영감을 퍼뜨리는 아이디어 뱅크입니다.',
    tendencyAnalysis: [
      '음식 재료로 얼굴을 만드는 기발한 푸드 아트나 글로벌 워킹홀리데이 지문에 즉각 반응합니다.',
      '호기심이 풍부하여 다양한 관심사를 넘나들며 지문 속 새로운 아이디어를 빠르게 수용합니다.',
      '틀에 박힌 문법 암기보다 영어를 통해 신선한 영감을 얻을 때 학습 효율이 극대화됩니다.',
    ],
    careerPath: '창의 디렉터 · 축제 기획자 · 여행 작가 · 글로벌 마케터',
    customStudyTip: '지문의 내용을 나만의 그림이나 마인드맵, 카드뉴스로 시각화하며 공부하면 성적이 쑥쑥 오릅니다.',
    recommendedPassages: [
      {
        subject: '영어Ⅰ',
        unit: 'Lesson 4',
        title: 'Edible Art: Transforming Food into Visual Wonders',
        summary: '과일과 채소 등 일상의 식재료를 유머러스하고 감각적인 예술로 바꾼 현대 푸드 아티스트들의 창의력',
        page: 94,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p94.jpg',
        matchScore: 99,
        keywords: ['푸드 아트', '착시 예술', '창의성', '일상의 재발견'],
      },
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 6',
        title: 'Discover Australia: Work and Play on a Working Holiday',
        summary: '호주에서 일과 여행을 병행하며 자립심과 열린 시야를 기르는 워킹홀리데이 도전기',
        page: 136,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p136.jpg',
        matchScore: 96,
        keywords: ['워킹홀리데이', '호주 모험', '글로벌 진로', '자립심'],
      },
    ],
  },
  ISTJ: {
    code: 'ISTJ',
    title: '청렴결백한 관리자 & 역사적 진실 고증가 📋',
    subTitle: 'The Dedicated Inspector',
    badge: '철저고증 & 과학검증',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    summarySentence: '철저한 과학적 증거와 기록을 바탕으로 역사 속 편견을 깨뜨리고 진실을 규명하는 원칙주의자입니다.',
    tendencyAnalysis: [
      '고대 조각상의 숨겨진 다채색을 자외선 분광학으로 검증해 낸 엄밀한 학술 지문에서 큰 신뢰를 느낍니다.',
      '문장 구조가 명확하고 사실 관계가 뚜렷한 글을 꼼꼼히 완독하는 끈기가 뛰어납니다.',
      '교과서 본문을 문단별로 빈틈없이 분석하고 기출 어법을 완벽히 정복하는 실력파입니다.',
    ],
    careerPath: '고고학 연구원 · 문화재 보존과학자 · 법조인 · 회계사',
    customStudyTip: '구문 분석(문장 성분 표시)과 어법 규칙을 꼼꼼한 체크리스트로 만들어 학습하는 방식이 가장 유리합니다.',
    recommendedPassages: [
      {
        subject: '영어Ⅱ',
        unit: 'Lesson 5',
        title: 'The Colorful Truth of Ancient Statues',
        summary: '순백색으로 알려졌던 고대 그리스 조각상이 원래 자외선 분석 결과 화려한 다채색이었음을 밝혀낸 고고학적 진실',
        page: 119,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p119.jpg',
        matchScore: 99,
        keywords: ['고대 조각상', '색채 과학', '자외선 분광학', '편견 극복'],
      },
      {
        subject: '공통영어1',
        unit: 'Lesson 2',
        title: 'Gathering of the Whakapapa: Maori Genealogy',
        summary: '마오리족의 족보와 조상의 역사를 기록하며 문화적 뿌리를 엄격히 지켜낸 문학 지문',
        page: 41,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p41.jpg',
        matchScore: 94,
        keywords: ['마오리 족보', '문화 유산', '기록의 힘', '전통 보존'],
      },
    ],
  },
  ISFJ: {
    code: 'ISFJ',
    title: '용감한 수호자 & 묵묵한 생명 지킴이 🛡️',
    subTitle: 'The Compassionate Protector',
    badge: '생명보호 & 헌신구호',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    summarySentence: '상처 입은 코끼리를 돌보고 아픈 아이들을 위해 묵묵히 백신을 개발하는 따뜻하고 성실한 수호자입니다.',
    tendencyAnalysis: [
      '야생동물 보호소 봉사나 헌신적인 의학 실화 지문에서 깊은 감동과 책임감을 느낍니다.',
      '묵묵히 계획을 실천하며, 글에 담긴 디테일과 따뜻한 배려의 표현을 놓치지 않습니다.',
      '신뢰할 수 있고 교훈이 분명한 글을 차분하게 끝까지 읽어내는 안정감이 돋보입니다.',
    ],
    careerPath: '수의사 · 간호학/보건의료 · 동물생태 보존가 · 초등교육',
    customStudyTip: '지문 속 인물의 헌신적 행동을 단계별 순서(Chronological Order)로 정리해 두면 내용 일치 문제를 틀리지 않습니다.',
    recommendedPassages: [
      {
        subject: '공통영어2',
        unit: 'Lesson 1',
        title: 'Caring for Animals: Elephant Rescue Camp',
        summary: '상처받은 코끼리를 구호하고 야생으로 돌려보내는 보호소 자원봉사자들의 따뜻한 생명 사랑 실화',
        page: 19,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p19.jpg',
        matchScore: 99,
        keywords: ['코끼리 구조', '동물 복지', '생명 존중', '자원봉사'],
      },
      {
        subject: '영어II',
        unit: 'Lesson 1',
        title: 'Two Heroes Who Fought a Deadly Disease',
        summary: '백일해로부터 어린이들의 생명을 지키기 위해 헌신한 펄 켄드릭과 그레이스 엘더링의 연구 이야기',
        page: 15,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p15.jpg',
        matchScore: 96,
        keywords: ['백신 영웅', '생명 수호', '의학사', '이타적 헌신'],
      },
    ],
  },
  ESTJ: {
    code: 'ESTJ',
    title: '엄격한 관리자 & 자원순환 정책가 📊',
    subTitle: 'The Resource Strategist',
    badge: '자원순환 & 정책관리',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    summarySentence: '쏟아지는 전자 폐기물(e-waste)과 수자원 고갈을 방지하기 위해 구체적 관리 시스템을 구축하는 실천가입니다.',
    tendencyAnalysis: [
      '환경 통계 수치, 자원 관리 시스템, 제도적 규제를 다룬 현실적인 글에서 높은 이해도를 보입니다.',
      '명확한 규칙과 데이터에 근거한 주장을 선호하며, 논리 전개가 깔끔한 지문을 빠르게 파악합니다.',
      '시간 관리가 철저하여 시험 시간 안배에 강점을 지니고 있습니다.',
    ],
    careerPath: '환경공학 연구원 · 자원순환 정책관 · 행정고시 · 기업 ESG 경영실',
    customStudyTip: '통계 그래프와 도표를 텍스트와 1:1로 매핑하여 팩트 체크하며 읽는 훈련이 완벽하게 맞습니다.',
    recommendedPassages: [
      {
        subject: '영어II',
        unit: 'Lesson 4',
        title: 'Breaking the Cycle: The Urgent Need to Manage E-Waste',
        summary: '연간 수천만 톤의 전자 폐기물 속 독성 물질과 도시 광산 자원 회수 시스템을 구축하는 환경 관리 지문',
        page: 93,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p93.jpg',
        matchScore: 99,
        keywords: ['전자 폐기물', '도시 광산', '자원 관리', '제도적 규제'],
      },
      {
        subject: '영어독해와작문',
        unit: 'Lesson 2',
        title: 'Mind Your Water Footprint & Upcycling',
        summary: '제품 생산에 들어가는 물 발자국 소비 총량을 데이터로 분석하고 자원을 아끼는 산업 솔루션',
        page: 40,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p40.jpg',
        matchScore: 96,
        keywords: ['물 발자국', '자원 절약', '업사이클링', '환경 데이터'],
      },
    ],
  },
  ESFJ: {
    code: 'ESFJ',
    title: '사교적인 외교관 & 손님 환대의 문화가 ☕',
    subTitle: 'The Hospitable Ambassador',
    badge: '문화교류 & 손님환대',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    summarySentence: '손님을 따뜻하게 대접하는 사막의 환대(Hospitality) 문화와 사람 사이의 온기를 전파하는 친선 대사입니다.',
    tendencyAnalysis: [
      '전통 음식, 축제 문화, 사람들의 따뜻한 환영 의식을 다룬 글을 편안하고 즐겁게 읽어냅니다.',
      '타인과의 조화와 예의를 중시하며, 실생활 영어 회화와 의사소통 표현에 뛰어난 센스를 보입니다.',
      '공동체의 화합과 친근한 인간미가 묻어나는 지문에서 가장 밝은 에너지를 냅니다.',
    ],
    careerPath: '호텔관광경영 · 항공서비스 승무원 · 국제문화교류원 · 외교관',
    customStudyTip: '실제 상황에서 쓰이는 회화 표현(Colloquial Expressions)과 문화적 에티켓 어휘를 중심으로 학습해 보세요.',
    recommendedPassages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 1',
        title: 'Traditional Sports & East Asian Architecture',
        summary: '사막 유목민들의 감동적인 손님 환대(Hospitality) 전통과 자연 친화적 동아시아 목조 가옥 문화',
        page: 26,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p26.jpg',
        matchScore: 99,
        keywords: ['손님 환대', '전통 문화', '한옥 건축', '아시아 교류'],
      },
      {
        subject: '공통영어1',
        unit: 'Lesson 4',
        title: 'A Better Future for Coffee Waste',
        summary: '전 세계인이 사랑하는 커피 문화의 이면과 버려지는 커피박의 친환경 자원 재탄생 이야기',
        page: 85,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p85.jpg',
        matchScore: 94,
        keywords: ['커피 문화', '친환경 새활용', '지속가능성', '일상 나눔'],
      },
    ],
  },
  ISTP: {
    code: 'ISTP',
    title: '만능 재주꾼 & 장인 기술자 🛠️',
    subTitle: 'The Master Artisan',
    badge: '장인기술 & 기계공학',
    badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    summarySentence: '못 없이 맞물리는 전통 목조 가옥의 짜맞춤 기법과 기계의 내부 회로를 직관적으로 꿰뚫어 보는 장인입니다.',
    tendencyAnalysis: [
      '도구의 원리, 전자 기기의 회로, 손으로 만드는 공학적 메커니즘을 다룬 글에 몰입합니다.',
      '군더더기 없는 실용적인 정보를 빠르게 훑어내며, 실질적인 문제 해결에 관심이 많습니다.',
      '장황한 이론보다 "이 장치가 실제로 어떻게 작동하는가?"를 보여주는 지문을 선호합니다.',
    ],
    careerPath: '기계공학자 · 로봇 엔지니어 · 건축설계사 · 정밀 기술 전문가',
    customStudyTip: '원리 설명문의 도해(Diagram)와 부품별 명칭을 매칭하며 핵심 동사(assemble, align, operate)를 암기해 보세요.',
    recommendedPassages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 1',
        title: 'East Asian Architecture & Craftsmanship',
        summary: '쇠못 하나 쓰지 않고 수백 년을 버티는 정교한 전통 목조 짜맞춤 건축 기술과 로봇 낙타 기수 이야기',
        page: 26,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p26.jpg',
        matchScore: 99,
        keywords: ['목조 건축', '짜맞춤 기법', '로봇 기수', '장인 정신'],
      },
      {
        subject: '공통영어1',
        unit: 'Lesson 3',
        title: 'The Circuitry of Noise-Cancelling Headphones',
        summary: '마이크와 마이크로칩 회로가 외부 소음을 실시간으로 감지하고 반대 파동을 쏘아주는 기계 공학 지문',
        page: 63,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p63.jpg',
        matchScore: 95,
        keywords: ['전자 회로', '센서 감지', '공학 기술', '기계 원리'],
      },
    ],
  },
  ISFP: {
    code: 'ISFP',
    title: '호기심 많은 예술가 & 자연의 관찰자 🌿',
    subTitle: 'The Peaceful Naturalist',
    badge: '자연생태 & 소박한미학',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-300',
    summarySentence: '자연과 동물의 아름다움, 소박한 일상 풍경에서 예술적 영감을 발견하는 감성적인 탐험가입니다.',
    tendencyAnalysis: [
      '아름다운 뉴질랜드 대자연이나 동물 보호, 소박한 자연주의 화가의 글에서 평온함을 느낍니다.',
      '글 속의 시각적 묘사와 감각적인 텍스처를 생생하게 상상하며 읽는 능력이 탁월합니다.',
      '경쟁적인 분위기보다 편안한 환경에서 자신만의 속도로 독해할 때 깊은 이해를 이끌어냅니다.',
    ],
    careerPath: '생태 사진작가 · 조경 디자이너 · 식물원 큐레이터 · 친환경 디자이너',
    customStudyTip: '지문에 묘사된 풍경을 머릿속에 한 폭의 수채화처럼 시각화(Visualization)하며 읽어보세요.',
    recommendedPassages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 6',
        title: 'Oceania: Nature and Avatar’s Inspiration',
        summary: '영화 아바타의 모티브가 된 뉴질랜드의 웅장한 대자연과 폴리네시아 해양 생태를 감상하는 본문',
        page: 136,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p136.jpg',
        matchScore: 99,
        keywords: ['뉴질랜드 자연', '영화 아바타', '해양 생태', '자연주의'],
      },
      {
        subject: '공통영어2',
        unit: 'Lesson 3',
        title: 'Maud Lewis: Painting the Simple Joys of Nature',
        summary: '가난과 질병 속에서도 창밖의 꽃과 새, 눈 덮인 언덕을 밝은 색채로 그려낸 모드 루이스 이야기',
        page: 63,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p63.jpg',
        matchScore: 96,
        keywords: ['모드 루이스', '자연 풍경화', '소박한 행복', '순수 예술'],
      },
    ],
  },
  ESTP: {
    code: 'ESTP',
    title: '모험을 즐기는 사업가 & 스포츠 승부사 ⚡',
    subTitle: 'The Dynamic Competitor',
    badge: '익스트림스포츠 & 승부근성',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    summarySentence: '빙판 위의 번개 같은 아이스하키와 유럽 프리미어리그 더비 매치의 역동적인 승부에 피가 끓는 승부사입니다.',
    tendencyAnalysis: [
      '스피드와 박진감이 넘치는 동계 스포츠, 치열한 라이벌전 다큐멘터리 지문에서 최고의 집중력을 발휘합니다.',
      '행동 지향적이고 순발력이 뛰어나 시험 실전에서 빠르게 결단을 내리고 문제를 풀어나갑니다.',
      '이론적인 사색보다 현실의 도전과 에너지 넘치는 액티비티 글에 강하게 반응합니다.',
    ],
    careerPath: '스포츠 마케터 · 전문 경기 해설가 · 벤처 투자자 · 이벤트 프로듀서',
    customStudyTip: '역동적인 동작 동사(sprint, tackle, maneuver, rival)와 긴박한 상황 묘사 어휘를 집중 공략해 보세요.',
    recommendedPassages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 4',
        title: 'Ice Hockey and Curling: Canada’s Winter Passion',
        summary: '시속 160km의 퍽이 날아다니는 빙판 위의 격렬한 아이스하키와 정밀한 컬링 승부의 세계',
        page: 90,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p90.jpg',
        matchScore: 99,
        keywords: ['아이스하키', '동계 스포츠', '캐나다', '승부 근성'],
      },
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 3',
        title: 'A Duel between Two Painters & European Football Derby',
        summary: '피렌체 베키오 궁전의 벽화 대결과 심장을 뛰게 하는 유럽 프로축구 라이벌 더비 매치 본문',
        page: 68,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p68.jpg',
        matchScore: 95,
        keywords: ['축구 더비', '라이벌 대결', '다빈치 벽화', '스포츠 열정'],
      },
    ],
  },
  ESFP: {
    code: 'ESFP',
    title: '자유로운 영혼의 연예인 & 카니발 페스티벌러 💃',
    subTitle: 'The Vibrant Entertainer',
    badge: '거리축제 & 삼바열정',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    summarySentence: '삼바 음악이 울려 퍼지는 브라질 리오 카니발과 도시 벽면의 화려한 그라피티 축제에 흠뻑 빠져드는 열정가입니다.',
    tendencyAnalysis: [
      '라틴아메리카의 카니발 축제나 음악, 거리 예술을 다룬 글을 읽을 때 에너지가 넘칩니다.',
      '주변 사람들을 기분 좋게 만드는 밝은 성격으로, 언어를 통해 즐거움을 나눌 때 학습 효과가 배가됩니다.',
      '시각적이고 감각적인 묘사가 가득한 생동감 넘치는 글을 가장 빠르게 소화합니다.',
    ],
    careerPath: '공연 예술 기획자 · 페스티벌 디렉터 · 방송 MC · 인플루언서 마케터',
    customStudyTip: '지문에 나오는 축제 음악이나 현장 영상을 함께 떠올리며 리듬감 있게 소리 내어 읽기(Read Aloud)를 해보세요.',
    recommendedPassages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 5',
        title: 'Graffiti in Latin America & Rio Carnival Celebration',
        summary: '화려한 삼바 춤과 음악이 밤을 지새우는 지구촌 최대의 축제 브라질 리오 카니발의 심장 뛰는 열기',
        page: 114,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p114.jpg',
        matchScore: 99,
        keywords: ['리오 카니발', '삼바 퍼레이드', '그라피티 예술', '남미 열정'],
      },
      {
        subject: '영어Ⅰ',
        unit: 'Lesson 4',
        title: 'Edible Art: Food as a Celebration of Creativity',
        summary: '일상의 파스타와 과일로 재치 있는 표정을 만들어내 관객을 웃음 짓게 하는 유쾌한 푸드 아트',
        page: 94,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p94.jpg',
        matchScore: 95,
        keywords: ['푸드 아트', '유쾌한 창작', '시각 축제', '웃음과 예술'],
      },
    ],
  },
};

export const DeepEnglishMbtiTab: React.FC<Props> = ({ onOpenImage }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // 성향 점수 누적 카운트 (E, I, S, N, T, F, J, P)
  const [scores, setScores] = useState<Record<TraitKey, number>>({
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  });

  const [finalResult, setFinalResult] = useState<DeepMbtiResult | null>(null);

  const handleSelect = (trait: TraitKey) => {
    const updatedScores = {
      ...scores,
      [trait]: scores[trait] + 1,
    };
    setScores(updatedScores);

    if (currentStep + 1 < DEEP_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // 8문항 종료 후 정통 16대 MBTI 판별 알고리즘
      // 1. E vs I
      const letter1 = updatedScores.E >= updatedScores.I ? 'E' : 'I';
      // 2. S vs N
      const letter2 = updatedScores.S >= updatedScores.N ? 'S' : 'N';
      // 3. T vs F
      const letter3 = updatedScores.T >= updatedScores.F ? 'T' : 'F';
      // 4. J vs P
      const letter4 = updatedScores.J >= updatedScores.P ? 'J' : 'P';

      const mbtiCode = `${letter1}${letter2}${letter3}${letter4}`;
      const matched = MBTI_16_DATABASE[mbtiCode] || MBTI_16_DATABASE.INTJ;
      setFinalResult(matched);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setFinalResult(null);
  };

  const currentQ = DEEP_QUESTIONS[currentStep];

  return (
    <div className="flex-1 overflow-y-auto space-y-4 w-full">
      {/* 🌟 헤더 배너 */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur-xs w-fit px-3 py-1 rounded-full">
          <Brain className="w-3.5 h-3.5 text-amber-300" />
          <span>의령여고 정통 16대 MBTI 독해 성향 분석</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight">
          심층 독해 MBTI & 3개년 교과서 본문 정밀 매칭 🔬
        </h2>
        <p className="text-xs md:text-sm text-purple-100 leading-relaxed">
          E/I (외향/내향), S/N (감각/직관), T/F (사고/감정), J/P (판단/인식) 정통 4대 축 8문항을 통해 나의 16가지 MBTI 독해 유형을 도출하고 찰떡궁합 교과서 본문을 찾아드립니다!
        </p>
      </div>

      {/* 안내 문구 */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <span>
          💡 의령여고 영어 교과서 6권 31개 단원의 실제 본문 지문 데이터를 바탕으로 정통 MBTI 16가지 성향(INTJ, ENFP, ISTJ 등)과 1:1 정밀 매칭되는 심층 진단 알고리즘입니다.
        </span>
      </div>

      {!finalResult ? (
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-xs space-y-5">
          {/* 진행도 */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-purple-700 font-bold">
              <Sliders className="w-3.5 h-3.5" />
              <span>{currentQ.category}</span>
            </span>
            <span>
              질문 {currentStep + 1} / {DEEP_QUESTIONS.length} (
              {Math.round(((currentStep + 1) / DEEP_QUESTIONS.length) * 100)}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / DEEP_QUESTIONS.length) * 100}%`,
              }}
            />
          </div>

          {/* 질문 본문 */}
          <div className="space-y-1.5 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                Question {currentQ.id}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {currentQ.axis}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">
              {currentQ.question}
            </h3>
            <p className="text-xs text-slate-500">{currentQ.desc}</p>
          </div>

          {/* 선택지 2개 */}
          <div className="space-y-3 pt-1">
            <button
              onClick={() => handleSelect(currentQ.optionA.trait)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-left transition-all cursor-pointer group space-y-1.5 shadow-2xs"
            >
              <div className="text-xs font-bold text-purple-600 flex items-center justify-between">
                <span>[A 선택지]</span>
                <span className="text-[11px] font-normal text-slate-400 group-hover:text-purple-600 transition-colors">
                  클릭하여 선택
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 group-hover:text-purple-950 leading-relaxed">
                {currentQ.optionA.text}
              </div>
              <div className="text-xs text-slate-500 font-normal">
                ↳ {currentQ.optionA.subText}
              </div>
            </button>

            <button
              onClick={() => handleSelect(currentQ.optionB.trait)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-left transition-all cursor-pointer group space-y-1.5 shadow-2xs"
            >
              <div className="text-xs font-bold text-purple-600 flex items-center justify-between">
                <span>[B 선택지]</span>
                <span className="text-[11px] font-normal text-slate-400 group-hover:text-purple-600 transition-colors">
                  클릭하여 선택
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 group-hover:text-purple-950 leading-relaxed">
                {currentQ.optionB.text}
              </div>
              <div className="text-xs text-slate-500 font-normal">
                ↳ {currentQ.optionB.subText}
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* 🏆 결과 화면 */
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-300">
          {/* 타이틀 및 정통 4글자 MBTI 배지 */}
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${finalResult.badgeColor}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{finalResult.badge}</span>
              <span className="font-mono text-sm tracking-wider font-black">[{finalResult.code}]</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {finalResult.title}
            </h3>
            <p className="text-xs font-mono text-purple-600 uppercase tracking-widest font-semibold">
              {finalResult.subTitle}
            </p>
          </div>

          {/* 한 줄 핵심 요약 카드 */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-blue-50 border border-purple-200 text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
            💡 {finalResult.summarySentence}
          </div>

          {/* 세세한 성향 분석 3가지 포인트 */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>[{finalResult.code}] 독해 성향 심층 분석 포인트:</span>
            </div>
            {finalResult.tendencyAnalysis.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                <span className="text-purple-600 font-bold shrink-0 mt-0.5">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* 찰떡궁합 교과서 본문 추천 */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>[{finalResult.code}]에게 찰떡궁합인 본문 지문 (첫 페이지 바로보기)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">일치도 95% 이상</span>
            </div>

            <div className="space-y-3">
              {finalResult.recommendedPassages.map((ps, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50/20 transition-all space-y-2.5 shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {ps.subject}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{ps.unit}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          일치도 {ps.matchScore}%
                        </span>
                      </div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 mt-1 truncate">
                        {ps.title}
                      </h4>
                    </div>

                    <button
                      onClick={() =>
                        onOpenImage(
                          `${ps.subject} ${ps.unit} 본문 (p.${ps.page}) · ${ps.title}`,
                          `/${ps.imagePath}`
                        )
                      }
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs group-hover:scale-105"
                    >
                      <span>본문 원본 보기 (p.{ps.page})</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-0.5">
                    {ps.summary}
                  </p>

                  {/* 지문 연계 키워드 태그 */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {ps.keywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 연계 진로 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>🎯 [{finalResult.code}] 추천 연계 진로 및 전공 분야:</span>
            </div>
            <div className="text-purple-700 font-semibold leading-relaxed pl-1">
              {finalResult.careerPath}
            </div>
          </div>

          {/* 맞춤 독해 공부법 TIP */}
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <div className="font-bold text-indigo-800">💡 [{finalResult.code}] 맞춤형 영어 독해 솔루션 TIP:</div>
            <div className="leading-relaxed pl-1">{finalResult.customStudyTip}</div>
          </div>

          {/* 다시 테스트하기 */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>심층 MBTI 테스트 다시 하기</span>
          </button>
        </div>
      )}
    </div>
  );
};
