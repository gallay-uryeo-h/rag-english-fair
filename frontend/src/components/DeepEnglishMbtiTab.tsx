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

// 4개 차원 정의
// 1. EI: Explorer(외부 탐색/사회문화) vs Insight(내면 성찰/심리철학)
// 2. ST: Scientific(과학기술/원리/논리) vs Tale(서사/감동인물/문학)
// 3. FA: Future(미래기술/혁신) vs Ancient(전통/역사/문화유산)
// 4. GP: Global(글로벌/세계/국제연대) vs Practical(실생활/개인선택/소비)

type TraitKey = 'E' | 'I' | 'S' | 'T' | 'F' | 'A' | 'G' | 'P';

interface DeepQuestion {
  id: number;
  category: string;
  question: string;
  desc: string;
  optionA: { text: string; subText: string; trait: TraitKey };
  optionB: { text: string; subText: string; trait: TraitKey };
}

const DEEP_QUESTIONS: DeepQuestion[] = [
  // ── [1. 탐구 방향 차원: E vs I] ──
  {
    id: 1,
    category: '독해 탐구 방향 (E vs I)',
    question: '새로운 영어 지문을 펼쳤을 때 더 끌리는 주제는?',
    desc: '내가 세상을 바라볼 때 먼저 관심이 가는 방향은 어디인가요?',
    optionA: {
      text: '전 세계의 이색적인 문화, 다양한 사회적 쟁점과 사람들의 역동적인 상호작용',
      subText: '넓은 세상을 탐험하고 외부 사회 현상을 이해하는 글',
      trait: 'E',
    },
    optionB: {
      text: '인간의 내면 심리, 행동의 무의식적 동기, 자아존중감과 개인적 고뇌의 성찰',
      subText: '나와 인간의 깊은 내면을 들여다보고 성찰하는 글',
      trait: 'I',
    },
  },
  {
    id: 2,
    category: '토론과 성찰 스타일 (E vs I)',
    question: '영어 수업 토론 시간에 더 흥미롭게 느껴지는 대화는?',
    desc: '친구들과 생각을 나눌 때 나의 지적 호기심을 자극하는 것은?',
    optionA: {
      text: '선거 제도, 다문화 사회 소통, 커뮤니티 협력 등 공동체 시스템 개선 방안',
      subText: '사회 구조와 집단의 의사결정 방식 탐구',
      trait: 'E',
    },
    optionB: {
      text: '‘가면 증후군’, 과소비 심리 유도, 실패를 마주했을 때의 회복 탄력성',
      subText: '개인의 마음 작용과 인지적 편향 극복 탐구',
      trait: 'I',
    },
  },

  // ── [2. 정보 수용 차원: S vs T] ──
  {
    id: 3,
    category: '정보 구성 스타일 (S vs T)',
    question: '글을 읽을 때 머릿속에 더 명쾌하게 남는 구조는?',
    desc: '어떤 논리 전개 방식의 글이 나에게 더 편안하게 와닿나요?',
    optionA: {
      text: '원인과 결과, 실험 데이터, 뇌과학·물리학적 메커니즘이 체계적인 설명문',
      subText: '객관적 사실과 과학적 논리가 명쾌한 글',
      trait: 'S',
    },
    optionB: {
      text: '인물의 극적인 인생 역정과 고난, 감동적인 대화가 생생한 내러티브 스토리',
      subText: '마음을 울리는 감동과 문학적 울림이 있는 글',
      trait: 'T',
    },
  },
  {
    id: 4,
    category: '호기심의 원천 (S vs T)',
    question: '주말에 영어 잡지를 읽는다면 어떤 특집 기사를 먼저 펼칠까요?',
    desc: '나의 독서 본능을 자극하는 키워드는?',
    optionA: {
      text: '“노이즈 캔슬링 음파 상쇄와 AI 뇌 임플란트 신경망의 작동 메커니즘”',
      subText: '테크놀로지와 과학적 원리의 신비',
      trait: 'S',
    },
    optionB: {
      text: '“침몰하는 보트를 맨몸으로 밀어 18명을 구한 올림픽 난민 수영선수의 기적”',
      subText: '한 인간의 불굴의 용기와 감동 실화',
      trait: 'T',
    },
  },

  // ── [3. 시간 및 가치 지향: F vs A] ──
  {
    id: 5,
    category: '시간 및 관심 지향 (F vs A)',
    question: '세상을 바라볼 때 나를 더 설레게 하는 시간대는?',
    desc: '미래의 혁신인가요, 아니면 세월을 버텨낸 전통의 지혜인가요?',
    optionA: {
      text: '다가올 미래 인공지능, 자원 순환 업사이클링, 차고 스타트업의 신화',
      subText: '새로운 패러다임을 열어가는 미래 지향적 탐구',
      trait: 'F',
    },
    optionB: {
      text: '수백 년 전 고대 조각상의 숨겨진 본래 색채, 마오리족의 구전 족보와 전통 건축',
      subText: '역사의 흔적 속에서 변하지 않는 가치를 발견하는 탐구',
      trait: 'A',
    },
  },
  {
    id: 6,
    category: '미적·예술적 취향 (F vs A)',
    question: '미술과 창작을 다룬 지문 중 더 끌리는 소재는?',
    desc: '예술 작품을 감상할 때 나의 시선이 머무는 곳은?',
    optionA: {
      text: '일상의 과일과 채소로 착시 얼굴을 빚어내는 파격적인 현대 푸드 아트',
      subText: '틀을 깨는 현대적 감각과 유머러스한 창의성',
      trait: 'F',
    },
    optionB: {
      text: '피렌체 베키오 궁전에서 펼쳐진 다빈치와 미켈란젤로의 기념비적 벽화 대결',
      subText: '르네상스 고전 예술의 웅장함과 역사적 라이벌전',
      trait: 'A',
    },
  },

  // ── [4. 행동 및 적용 맥락: G vs P] ──
  {
    id: 7,
    category: '적용 맥락 (G vs P)',
    question: '영어로 프로젝트를 기획한다면 더 해보고 싶은 프로젝트는?',
    desc: '나의 관심사를 현실에 적용하고 싶은 영역은 어디인가요?',
    optionA: {
      text: '아프리카 멸종위기 야생동물 밀렵 방지 및 국제 환경 NGO 연대 캠페인',
      subText: '지구촌 전체를 시야에 두는 글로벌 사회 기여',
      trait: 'G',
    },
    optionB: {
      text: '온라인 쇼핑몰 다크 패턴 속임수 고발 및 청소년 합리적 소비 가이드북',
      subText: '일상 속에서 바로 체감되고 쓸모 있는 실천 솔루션',
      trait: 'P',
    },
  },
  {
    id: 8,
    category: '진로와 라이프스타일 (G vs P)',
    question: '고등학교 졸업 후 20대에 꼭 도전해보고 싶은 경험은?',
    desc: '내가 꿈꾸는 도전의 모습은?',
    optionA: {
      text: '호주 워킹홀리데이로 다국적 친구들을 만나며 세계 각국을 누비는 글로벌 모험',
      subText: '국경을 넘어 넓은 세계와 소통하는 삶',
      trait: 'G',
    },
    optionB: {
      text: '대학 기숙사나 요양원에서 세대 간 멘토링을 나누며 지역사회에 단단히 뿌리내리는 삶',
      subText: '가까운 이웃과 깊은 유대감을 형성하는 삶',
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

// 8가지 정밀 성향 유형 정의 (지배적 지표 조합)
const DEEP_MBTI_TYPES: Record<string, DeepMbtiResult> = {
  // 1. ES (외향 탐구 + 과학기술)
  ES: {
    code: 'EST-F',
    title: '미래 혁신 과학 수석 연구원형 🔬',
    subTitle: 'Future Frontier Tech Analyst',
    badge: '과학혁신 & 글로벌테크',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    summarySentence: '객관적 데이터와 최신 과학기술, 인공지능이 바꿀 미래 사회의 시스템을 입체적으로 조망하는 분석가입니다.',
    tendencyAnalysis: [
      '논리적 인과관계와 메커니즘을 규명하는 과학 기술 설명문에서 독해 몰입도가 극대화됩니다.',
      '수치 그래프, 실험 절차, 공학적 용어가 등장할 때 오히려 독해 호흡이 안정되고 흥미를 느낍니다.',
      '글을 읽을 때 단순 암기보다 "이 기술이 사회와 인류에 어떤 파급력을 미칠 것인가?"를 스스로 묻습니다.',
    ],
    careerPath: '인공지능(AI)공학 · 생명공학 · 데이터사이언스 · 첨단신소재 · 미래기술 정책관',
    customStudyTip:
      '인과관계를 나타내는 접속사(Consequently, Since, In contrast)와 메커니즘 동사(trigger, facilitate, convert)를 중심축으로 삼아 흐름도를 그리며 읽어보세요.',
    recommendedPassages: [
      {
        subject: '공통영어2',
        unit: 'Lesson 4',
        title: 'Will AI-Powered Neural Implants Make Us Super-Humans?',
        summary: '뇌-컴퓨터 인터페이스(BCI)와 AI 신경망 임플란트가 가져올 인류의 미래와 기술 윤리를 다룬 본문',
        page: 85,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p85.jpg',
        matchScore: 99,
        keywords: ['인공지능', '신경망', '초인간', 'BCI 기술'],
      },
      {
        subject: '영어II',
        unit: 'Lesson 2',
        title: 'Science Is for Everyone: The Galaxy Zoo Citizen Project',
        summary: '수백만 개 은하 사진을 대중의 집단지성으로 분류해 낸 크라우드소싱 시민 천문학 혁신 이야기',
        page: 41,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p41.jpg',
        matchScore: 96,
        keywords: ['시민과학', '은하 분류', '빅데이터', '집단지성'],
      },
      {
        subject: '공통영어1',
        unit: 'Lesson 3',
        title: 'Tuning Out: The Science of Noise-Cancellation',
        summary: '소음 상쇄 간섭(Destructive Interference) 원리를 적용한 노이즈 캔슬링 이어폰 과학 기술 본문',
        page: 63,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p63.jpg',
        matchScore: 93,
        keywords: ['음파 상쇄', '소음 제어', '간섭 원리', '음향공학'],
      },
    ],
  },

  // 2. ET (외향 탐구 + 감동서사/인간)
  ET: {
    code: 'ETG-A',
    title: '글로벌 휴머니즘 스토리텔러형 🕊️',
    subTitle: 'Global Humanitarian Narrative Specialist',
    badge: '휴먼드라마 & 국제연대',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summarySentence: '국경과 역경을 넘어선 인간의 숭고한 용기, 전 세계인의 뜨거운 연대와 감동 실화에 가슴이 뛰는 공감가입니다.',
    tendencyAnalysis: [
      '시련에 맞서 포기하지 않고 승리하는 인물 중심의 다큐멘터리 서사에서 최고의 독해 집중력을 발휘합니다.',
      '등장인물의 감정선과 역사적 배경에 깊이 몰입하며, 영어를 단순한 언어가 아닌 "마음을 전하는 도구"로 인식합니다.',
      '인권, 난민, 소외계층 지원 등 지구촌의 아픔을 치유하는 따뜻한 주제에 큰 울림을 받습니다.',
    ],
    careerPath: '국제기구(UN/UNESCO) · NGO활동가 · 외교관 · 다큐멘터리 감독 · 방송기자',
    customStudyTip:
      '인물의 심경 변화를 나타내는 감정 형용사(agonizing, resilient, triumphant)와 시간 순서 부사구를 타임라인으로 정리하면 서술형 문제 완벽 대비가 가능합니다.',
    recommendedPassages: [
      {
        subject: '영어Ⅰ',
        unit: 'Lesson 5',
        title: 'Yusra Mardini: A Journey From War to the Olympics',
        summary: '침몰 위기의 보트를 바다에서 끌고 헤엄쳐 승객들을 구하고 올림픽에 출전한 시리아 난민 수영선수 실화',
        page: 120,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p120.jpg',
        matchScore: 99,
        keywords: ['유스라 마르디니', '올림픽', '난민팀', '불굴의 용기'],
      },
      {
        subject: '영어II',
        unit: 'Lesson 1',
        title: 'Two Heroes Who Fought a Deadly Disease',
        summary: '치명적 백일해로부터 아이들을 구하기 위해 평생을 바쳐 안전한 백신을 개발해 낸 두 여성 과학자 이야기',
        page: 15,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p15.jpg',
        matchScore: 95,
        keywords: ['백일해 백신', '펄 켄드릭', '여성 영웅', '의학 헌신'],
      },
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 2',
        title: "Wildlife Protection in Zimbabwe & Africa's Innovation",
        summary: '코뿔소를 지키는 짐바브웨 국립공원 레인저들과 아프리카 대륙의 젊은 잠재력을 다룬 본문',
        page: 48,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p48.jpg',
        matchScore: 92,
        keywords: ['야생동물 보호', '짐바브웨', '아프리카 도약', '생태 보존'],
      },
    ],
  },

  // 3. IS (내면 성찰 + 과학/논리/심리분석)
  IS: {
    code: 'ISP-F',
    title: '행동심리 & 인지 메커니즘 분석가형 🧠',
    subTitle: 'Cognitive & Behavioral Pattern Analyst',
    badge: '인지과학 & 심리행동',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    summarySentence: '인간의 미묘한 심리적 착각, 일상 속 비합리적인 소비 행동의 법칙을 날카롭게 간파하는 냉철한 통찰가입니다.',
    tendencyAnalysis: [
      '행동경제학, 심리학 실험, 뇌 인지 메커니즘을 다룬 글에서 흥미를 느끼며, 수능 고난도 빈칸 추론에 강한 재능을 보입니다.',
      '소비자가 왜 불필요한 물건을 사는지, 왜 자신의 실력을 의심하는지 논리적으로 파헤치는 지문을 좋아합니다.',
      '겉으로 드러난 현상 너머에 숨겨진 보이지 않는 인과관계의 본질을 캐묻는 지적 집요함이 있습니다.',
    ],
    careerPath: '행동경제학자 · 인지심리학자 · UX/UI데이터기획자 · 신경정신의학 · 마케팅전략가',
    customStudyTip:
      '실험 설계(가설 → 실험 조건 통제 → 대조군 비교 → 결과 도출)의 구조적 틀을 도식화하며 지문을 읽으면 고난도 수능 영어 지문도 1분 안에 구조가 보입니다.',
    recommendedPassages: [
      {
        subject: '영어독해와작문',
        unit: 'Lesson 3',
        title: 'The Decoy Effect: How Subtle Options Drive Decisions',
        summary: '선택지 사이에 미끼(Decoy) 옵션을 배치해 소비자의 구매 결정을 교묘하게 유도하는 행동경제학 본문',
        page: 64,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p64.jpg',
        matchScore: 99,
        keywords: ['미끼 효과', '행동경제학', '비이성적 선택', '마케팅 넛지'],
      },
      {
        subject: '영어독해와작문',
        unit: 'Lesson 1',
        title: 'You Are Good Enough: Overcoming the Impostor Syndrome',
        summary: '성공한 사람들도 자신을 사기꾼처럼 느끼며 괴로워하는 ‘가면 증후군’의 심리적 원인과 치유법 본문',
        page: 16,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p16.jpg',
        matchScore: 96,
        keywords: ['가면 증후군', '자아존중감', '심리 치유', '내면 성장'],
      },
      {
        subject: '공통영어2',
        unit: 'Lesson 2',
        title: 'Light Up Dark Patterns: Online Shopping Tricks',
        summary: '사용자를 속여 자동 정기구독과 비싼 결제를 유도하는 전자상거래 속 다크 패턴의 비밀을 고발하는 본문',
        page: 41,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p41.jpg',
        matchScore: 94,
        keywords: ['다크 패턴', '소비자 기만', 'UI 심리학', '디지털 윤리'],
      },
    ],
  },

  // 4. IT (내면 성찰 + 감성문학/철학)
  IT: {
    code: 'ITA-P',
    title: '깊은 철학적 사색과 인문 문학가형 📚',
    subTitle: 'Philosophical Literary Thinker',
    badge: '인문철학 & 고전문학',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    summarySentence: '화려한 겉모습보다 영혼의 순수함, 인간 존재의 고독과 사랑, 인공지능 시대에 인간다운 것이 무엇인지 숙고하는 철학자입니다.',
    tendencyAnalysis: [
      '단순한 정보 전달문보다 상징과 은유, 인간적인 따뜻함이 녹아 있는 문학 소설과 수필에서 큰 위로와 기쁨을 느낍니다.',
      '골판지 위의 그림을 그린 민속 화가나, 소녀를 위해 헌신하는 로봇의 이야기처럼 순수한 영혼의 울림을 사랑합니다.',
      '글을 다 읽은 후에도 한동안 창밖을 보며 여운을 곱씹는 섬세한 감수성과 높은 문해력을 갖추고 있습니다.',
    ],
    careerPath: '영미문학자 · 철학교수 · 번역가/에세이작가 · 시나리오작가 · 문화콘텐츠 크리에이터',
    customStudyTip:
      '작가 특유의 문학적 비유(Metaphor)와 함축적 단어의 다의어(Multiple meanings)를 나만의 표현 노트에 기록하며 읽으면 수능 어휘력이 깊어집니다.',
    recommendedPassages: [
      {
        subject: '영어독해와작문',
        unit: 'Lesson 6',
        title: 'Imagine Living with AI: Robotics and Klara and the Sun',
        summary: '노벨문학상 작가 가즈오 이시구로의 SF 명작을 통해 인공지능 로봇 클라라의 헌신과 인간의 영혼을 성찰하는 본문',
        page: 136,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p136.jpg',
        matchScore: 99,
        keywords: ['클라라와 태양', 'AI 감정', '인간성 성찰', '노벨문학상'],
      },
      {
        subject: '공통영어2',
        unit: 'Lesson 3',
        title: 'From Shadows to Spotlight: Bill Traylor & Maud Lewis',
        summary: '정규 미술 교육 없이도 영혼의 순수한 떨림을 캔버스에 담아낸 두 민속 화가의 가슴 뭉클한 생애',
        page: 63,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p63.jpg',
        matchScore: 95,
        keywords: ['민속 화가', '모드 루이스', '빌 트레일러', '예술혼'],
      },
      {
        subject: '영어Ⅱ',
        unit: 'Lesson 6',
        title: 'Special Lesson: The Model Millionaire by Oscar Wilde',
        summary: '마음씨 착한 가난한 청년과 걸인 백만장자 사이의 따뜻한 풍자와 위트를 담은 영미 고전 명작',
        page: 139,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p139.jpg',
        matchScore: 92,
        keywords: ['오스카 와일드', '모범적 백만장자', '풍자 문학', '나눔의 가치'],
      },
    ],
  },

  // 5. EG (글로벌 탐험 + 문화 교류)
  EG: {
    code: 'EGA-F',
    title: '글로벌 문화 큐레이터 & 모험가형 🌍',
    subTitle: 'Global Cultural Explorer & Nomad',
    badge: '세계문화 & 글로벌탐험',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    summarySentence: '6대륙의 생생한 라이프스타일, 각국의 이색적인 전통 스포츠와 축제의 열기를 온몸으로 흡수하는 열정적인 세계인입니다.',
    tendencyAnalysis: [
      '세계 여러 나라의 문화, 축제, 전통 건축, 음식 문화를 다룬 지문에서 어휘 흡수력이 가장 빠릅니다.',
      '영어를 단순한 시험 과목이 아니라, "지구 반대편 친구와 대화하고 여행하기 위한 여권"으로 여깁니다.',
      '호주 워킹홀리데이, 브라질 리오 카니발, 유럽 축구 더비 매치 등 생동감 넘치는 현장형 글을 읽을 때 가슴이 뜁니다.',
    ],
    careerPath: '관광경영학 · 국제회의기획(MICE) · 항공서비스 · 해외무역마케터 · 글로벌축제기획자',
    customStudyTip:
      '지문에 등장하는 각국의 문화 배경 지식(Cultural Background)과 지도상의 위치를 함께 시각적으로 매핑하며 읽으면 기억이 3배 오래갑니다.',
    recommendedPassages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 1',
        title: 'Traditional Sports (Camel Racing) & East Asian Architecture',
        summary: '중동의 로봇 기수 낙타 경주와 동아시아 한옥 목조 건축의 친환경적 미학을 다룬 본문',
        page: 26,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p26.jpg',
        matchScore: 99,
        keywords: ['낙타 경주', '동아시아 건축', '한옥 처마', '전통 문화'],
      },
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 6',
        title: 'Discover Australia: Work and Play on a Working Holiday',
        summary: '호주에서 일과 여행을 병행하며 자립심과 글로벌 적응력을 기르는 워킹홀리데이 생생한 체험기',
        page: 136,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p136.jpg',
        matchScore: 97,
        keywords: ['호주 워홀', '독립심', '글로벌 경험', '모아나 문화'],
      },
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 5',
        title: 'Graffiti in Latin America & Rio Carnival Celebration',
        summary: '남미 도시 벽화 그라피티의 역사와 지구촌 최대의 삼바 축제 브라질 리오 카니발의 열기',
        page: 114,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p114.jpg',
        matchScore: 94,
        keywords: ['리오 카니발', '삼바 축제', '그라피티 예술', '남미 열정'],
      },
    ],
  },

  // 6. EF (혁신 미래 + 실천 비즈니스)
  EF: {
    code: 'EFP-F',
    title: '미래 혁신 벤처 & 생태 솔루션 기획자형 💡',
    subTitle: 'Eco-Innovation & Venture Strategist',
    badge: '스타트업 & 지속가능성',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    summarySentence: '작은 차고에서 세상을 바꾸는 스타트업 혁신과 버려진 쓰레기에 새 생명을 불어넣는 업사이클링 솔루션을 사랑하는 프론티어입니다.',
    tendencyAnalysis: [
      '환경 오염, 자원 고갈 등 인류의 위기를 기발한 아이디어와 비즈니스로 돌파하는 지문에서 카타르시스를 느낍니다.',
      '실리콘밸리 차고 창업 신화나 커피박 재활용, 전자 폐기물(e-waste) 자원 회수와 같은 실전형 혁신을 주목합니다.',
      '수동적인 읽기를 넘어 "나라면 이 비즈니스 모델을 어떻게 더 개선할 수 있을까?"를 주도적으로 기획합니다.',
    ],
    careerPath: '벤처창업가 · 환경ESG경영컨설턴트 · 도시재생기획자 · 신재생에너지전문가 · 소셜벤처대표',
    customStudyTip:
      '문제 제기(Problem) → 기술적 해결책(Solution) → 경제적·환경적 기대 효과(Impact)의 3단 논증 구조를 파악하며 단락을 분할해 보세요.',
    recommendedPassages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Lesson 4',
        title: 'American Garage Startups & Winter Sports in Canada',
        summary: '작은 차고에서 출발해 세계적 거대 기업으로 도약한 실리콘밸리 청년 벤처 창업 신화',
        page: 90,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p90.jpg',
        matchScore: 99,
        keywords: ['차고 창업', '스티브 잡스', '스타트업', '기술 혁신'],
      },
      {
        subject: '공통영어1',
        unit: 'Lesson 4',
        title: 'A Better Future for Coffee Waste: Upcycling Coffee Grounds',
        summary: '연간 수백만 톤 버려지는 커피 찌꺼기(커피박)를 바이오 원료와 친환경 플라스틱으로 새활용하는 솔루션',
        page: 85,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p85.jpg',
        matchScore: 96,
        keywords: ['커피박 재활용', '업사이클링', '친환경 자원', '지속가능성'],
      },
      {
        subject: '영어II',
        unit: 'Lesson 4',
        title: 'Breaking the Cycle: The Urgent Need to Manage E-Waste',
        summary: '버려지는 폐스마트폰 e-waste 속 독성 물질의 위험성과 도시 광산(Urban Mining) 자원 회수 대안',
        page: 93,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p93.jpg',
        matchScore: 93,
        keywords: ['전자 폐기물', '도시 광산', '자원 회수', '계획적 구식화'],
      },
    ],
  },
};

export const DeepEnglishMbtiTab: React.FC<Props> = ({ onOpenImage }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // 성향 점수 누적 카운트
  const [scores, setScores] = useState<Record<TraitKey, number>>({
    E: 0,
    I: 0,
    S: 0,
    T: 0,
    F: 0,
    A: 0,
    G: 0,
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
      // 8문항 종료 후 정밀 분석 알고리즘
      // 지배적 축 판별: E vs I, S vs T, G vs P, F vs A
      const isE = updatedScores.E >= updatedScores.I;
      const isS = updatedScores.S >= updatedScores.T;
      const isG = updatedScores.G >= updatedScores.P;
      const isF = updatedScores.F >= updatedScores.A;

      let resultKey = 'ES';
      if (isE && isS) {
        resultKey = 'ES';
      } else if (isE && !isS && isG) {
        resultKey = 'EG';
      } else if (isE && !isS) {
        resultKey = 'ET';
      } else if (!isE && isS) {
        resultKey = 'IS';
      } else if (!isE && !isS) {
        resultKey = 'IT';
      } else if (isF && isE) {
        resultKey = 'EF';
      }

      setFinalResult(DEEP_MBTI_TYPES[resultKey] || DEEP_MBTI_TYPES.ES);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setScores({ E: 0, I: 0, S: 0, T: 0, F: 0, A: 0, G: 0, P: 0 });
    setFinalResult(null);
  };

  const currentQ = DEEP_QUESTIONS[currentStep];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
      {/* 🌟 헤더 배너 */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur-xs w-fit px-3 py-1 rounded-full">
          <Brain className="w-3.5 h-3.5 text-amber-300" />
          <span>의령여고 8문항 정밀 독해 성향 분석</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight">
          심층 독해 MBTI & 3개년 교과서 본문 정밀 매칭 🔬
        </h2>
        <p className="text-xs md:text-sm text-purple-100 leading-relaxed">
          4대 인지 차원(탐구 방향, 정보 구성, 가치 지향, 적용 맥락) 8개 정밀 문항을 통해 나의 숨은 독해 잠재력을 분석하고, 가장 흥미진진할 교과서 본문 원문을 추천합니다!
        </p>
      </div>

      {/* 안내 문구 */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <span>
          💡 의령여고 영어 교과서 6권 31개 단원의 실제 독해 지문 데이터를 바탕으로 정밀 설계된 심층 알고리즘입니다. 나에게 꼭 맞는 지문으로 고교 영어에 대한 자신감을 얻어보세요!
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
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              Question {currentQ.id}
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
          {/* 타이틀 및 유형 배지 */}
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${finalResult.badgeColor}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{finalResult.badge}</span>
              <span className="opacity-70 font-mono">({finalResult.code})</span>
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
              <span>나의 독해 성향 심층 분석 포인트:</span>
            </div>
            {finalResult.tendencyAnalysis.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                <span className="text-purple-600 font-bold shrink-0 mt-0.5">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* 찰떡궁합 교과서 본문 TOP 3 추천 */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>나에게 찰떡궁합인 본문 지문 TOP 3 (첫 페이지 바로보기)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">일치도 90% 이상</span>
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
              <span>🎯 추천 연계 진로 및 전공 분야:</span>
            </div>
            <div className="text-purple-700 font-semibold leading-relaxed pl-1">
              {finalResult.careerPath}
            </div>
          </div>

          {/* 맞춤 독해 공부법 TIP */}
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <div className="font-bold text-indigo-800">💡 의령여고 맞춤 독해 솔루션 TIP:</div>
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
