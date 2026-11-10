import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  ChevronRight,
  Headphones,
  Mic,
  PenTool,
  Bookmark,
  FileText
} from 'lucide-react';
import accurateMetadata from '../utils/textbook_sections_metadata.json';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

interface UnitOverview {
  unitNumber: number;
  unitTitle: string;
  topic: string;
  passageTitle: string;
  passageSummary: string;
  startPage: number;
  imagePath: string;
  careerTag: string;
}

interface TextbookOverview {
  id: string;
  grade: string;
  semester: string;
  title: string;
  publisher: string;
  coverImage: string;
  badgeBg: string;
  accentColor: string;
  overviewSentence: string;
  features: string[];
  unitsCount: number;
  units: UnitOverview[];
}

const TEXTBOOK_OVERVIEW_DATA: TextbookOverview[] = [
  {
    id: '공통영어1',
    grade: '1학년',
    semester: '1학기',
    title: '공통영어1',
    publisher: '미래엔 (김선영)',
    coverImage: '/pages_cache/1학년_1학기_공통영어1_미래엔_p1.jpg',
    badgeBg: 'bg-blue-100 text-blue-700',
    accentColor: 'from-blue-600 to-indigo-600',
    unitsCount: 4,
    overviewSentence: '고등학교에 갓 입학한 학생들이 대인관계, 독서, 과학기술, 환경 등 친근한 일상 주제를 통해 긴 영어 지문에 대한 자신감을 키우는 기본 교과서입니다.',
    features: ['중·고교 징검다리 지문', '스토리텔링과 쉬운 설명문', '실생활 연계 인포그래픽'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'You and I Become “We”',
        topic: '대인관계와 소통',
        passageTitle: 'The Power of Friendliness: Soft but Strong',
        passageSummary: '친절함과 다정함이 개인과 집단의 소통에서 어떤 놀라운 힘을 발휘하는지 다양한 사례를 통해 배웁니다.',
        startPage: 19,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p19.jpg',
        careerTag: '심리 · 교육 · 미디어',
      },
      {
        unitNumber: 2,
        unitTitle: 'Open a Book, Open the World',
        topic: '문학과 공감',
        passageTitle: 'Gathering of the Whakapapa',
        passageSummary: '마오리족의 지혜와 이야기를 담은 문학 작품을 읽으며 책을 통해 더 넓은 세상을 바라보는 시야를 기릅니다.',
        startPage: 41,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p41.jpg',
        careerTag: '인문 · 문학 · 사회학',
      },
      {
        unitNumber: 3,
        unitTitle: 'Free Yourself with Science',
        topic: '과학 원리와 발명',
        passageTitle: 'Noise-Cancelling Headphones / Sound Technology',
        passageSummary: '우리가 일상에서 흔히 쓰는 노이즈 캔슬링 이어폰 속 음파 상쇄 과학 기술의 원리를 흥미롭게 풀어냅니다.',
        startPage: 63,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p63.jpg',
        careerTag: '전자공학 · 컴퓨터 · 물리',
      },
      {
        unitNumber: 4,
        unitTitle: 'Let It Be Green',
        topic: '생태와 지속가능성',
        passageTitle: 'A Better Future for Coffee Waste',
        passageSummary: '버려지는 커피 찌꺼기(커피박)를 새로운 친환경 자원과 바이오 연료로 재탄생시키는 업사이클링 이야기입니다.',
        startPage: 85,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p85.jpg',
        careerTag: '환경공학 · 바이오 · 신재생',
      },
    ],
  },
  {
    id: '공통영어2',
    grade: '1학년',
    semester: '2학기',
    title: '공통영어2',
    publisher: '미래엔 (김선영)',
    coverImage: '/pages_cache/1학년_2학기_공통영어2_미래엔_p1.jpg',
    badgeBg: 'bg-cyan-100 text-cyan-800',
    accentColor: 'from-cyan-600 to-blue-600',
    unitsCount: 4,
    overviewSentence: '동물 보호, 디지털 소비 윤리, 민속 미술, 인공지능(AI) 신경망 등 1학기보다 깊이 있는 현대 사회 쟁점을 영어로 탐색합니다.',
    features: ['현대 사회 이슈 비판적 읽기', '디지털 리터러시 함양', '진로 연계 탐구 주제 풍부'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'We Share, We Care',
        topic: '동물 복지와 공존',
        passageTitle: 'Caring for Animals / Elephant Rescue Camp',
        passageSummary: '상처 입은 코끼리를 구호하고 야생으로 돌려보내는 사람들의 이야기를 통해 인간과 자연의 따뜻한 공존을 배웁니다.',
        startPage: 19,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p19.jpg',
        careerTag: '수의학 · 동물생태 · 보건',
      },
      {
        unitNumber: 2,
        unitTitle: 'Be a Wise Consumer',
        topic: '미디어와 소비 윤리',
        passageTitle: 'Light Up the Truth Behind Dark Patterns',
        passageSummary: '쇼핑몰과 앱 화면에서 사용자를 교묘하게 속여 원치 않는 구매를 유도하는 ‘다크 패턴(Dark Pattern)’의 속임수를 파헤칩니다.',
        startPage: 41,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p41.jpg',
        careerTag: '경영마케팅 · IT개발 · 법학',
      },
      {
        unitNumber: 3,
        unitTitle: 'The True Art Lovers',
        topic: '예술과 삶',
        passageTitle: 'Folk Artists: Bill Traylor & Maud Lewis',
        passageSummary: '정식 미술 교육을 받지 않았지만 순수한 열정으로 영혼을 울리는 작품을 남긴 민속 화가들의 감동적인 삶을 전합니다.',
        startPage: 63,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p63.jpg',
        careerTag: '예술기획 · 디자인 · 문화콘텐츠',
      },
      {
        unitNumber: 4,
        unitTitle: 'Sink or Swim in the Digital Ocean',
        topic: '인공지능과 미래 기술',
        passageTitle: 'Will AI-Powered Neural Implants Make Us Super-Humans?',
        passageSummary: '인간의 뇌와 컴퓨터를 연결하는 AI 뉴럴 임플란트 기술이 우리를 초인간으로 만들 것인지, 과학적 가능성과 윤리적 질문을 던집니다.',
        startPage: 85,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p85.jpg',
        careerTag: 'AI인공지능 · 뇌과학 · 컴퓨터',
      },
    ],
  },
  {
    id: '영어Ⅰ',
    grade: '2학년',
    semester: '1학기',
    title: '영어Ⅰ',
    publisher: '엔이능률 (김성곤)',
    coverImage: '/pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p1.jpg',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    accentColor: 'from-emerald-600 to-teal-600',
    unitsCount: 6,
    overviewSentence: '2학년 일반선택 대표 과목으로, 롤모델 탐색부터 동물 인지과학, 세대 통합 주거, 푸드 아트, 올림픽 난민 수영선수의 실화까지 흥미진진한 지문들이 가득합니다.',
    features: ['수능·모의고사형 독해 호흡', '인물 중심 감동 실화', '과학·사회 융합 지문'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Journey to the Future',
        topic: '진로와 롤모델',
        passageTitle: 'Who Is Your Role Model?',
        passageSummary: '해양학자 자크 쿠스토와 애니메이터 등 진로 탐색에 영감을 주는 롤모델들의 이야기를 통해 나의 꿈을 구체화합니다.',
        startPage: 16,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p16.jpg',
        careerTag: '진로교육 · 다큐멘터리 · 심리상담',
      },
      {
        unitNumber: 2,
        unitTitle: 'The Power of Good Habits',
        topic: '동물 지능과 습관 과학',
        passageTitle: 'Science Report: Animal Habits and Tool Use',
        passageSummary: '까마귀의 놀라운 도구 사용과 문제 해결 지능을 과학 리포트로 읽으며 좋은 습관 형성의 원리를 배웁니다.',
        startPage: 42,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p42.jpg',
        careerTag: '인지과학 · 심리학 · 동물행동학',
      },
      {
        unitNumber: 3,
        unitTitle: 'Let’s Live in Harmony',
        topic: '세대 통합과 상생',
        passageTitle: 'Humanitas: Intergenerational Living Program',
        passageSummary: '네덜란드 대학생들이 노인 요양원에서 함께 생활하며 서로의 말벗이 되어주는 세대 공존 주거 프로젝트 실화입니다.',
        startPage: 68,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p68.jpg',
        careerTag: '사회복지 · 도시재생 · 노인학',
      },
      {
        unitNumber: 4,
        unitTitle: 'Spark Your Creativity',
        topic: '푸드 아트와 발상의 전환',
        passageTitle: 'Edible Art: Helga Stentzel & Giuseppe Arcimboldo',
        passageSummary: '주변의 음식 재료를 기발한 상상력으로 예술 작품으로 바꾼 현대 푸드 아티스트들의 창의적 시선을 만납니다.',
        startPage: 94,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p94.jpg',
        careerTag: '식품영양 · 시각디자인 · 광고기획',
      },
      {
        unitNumber: 5,
        unitTitle: 'Rise Above Challenges',
        topic: '난민 수영선수의 도전',
        passageTitle: 'Yusra Mardini: An Olympic Refugee Swimmer’s Journey',
        passageSummary: '시리아 난민으로 침몰하는 보트를 끌고 헤엄쳐 승객들을 구하고 올림픽 무대에 선 유스라 마르디니의 감동 실화입니다.',
        startPage: 120,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p120.jpg',
        careerTag: '스포츠외교 · 국제인권 · NGO',
      },
      {
        unitNumber: 6,
        unitTitle: 'Special Lesson: The Open Window',
        topic: '영미 고전 명작 단편소설',
        passageTitle: 'The Open Window by Saki',
        passageSummary: '사키(Saki)의 단편소설 ‘열린 창문’의 기막힌 반전과 재치 있는 대화를 원문 그대로 음미합니다.',
        startPage: 139,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p139.jpg',
        careerTag: '영미문학 · 번역 · 시나리오',
      },
    ],
  },
  {
    id: '영어 독해와 작문',
    grade: '2학년',
    semester: '2학기',
    title: '영어독해와작문',
    publisher: '미래엔 (김대진)',
    coverImage: '/pages_cache/2학년_2학기_영어독해와작문_미래엔_p1.jpg',
    badgeBg: 'bg-amber-100 text-amber-800',
    accentColor: 'from-amber-600 to-orange-600',
    unitsCount: 6,
    overviewSentence: '수능 고난도 비문학(인문, 사회, 과학, 예술, 경제, 미래기술) 지문 독해와 논리적 영작문을 집중 훈련하는 심화 교과서입니다.',
    features: ['대학 전공 연계 심층 제재', '행동경제학·천문학 융합', '논리적 서술형 영작 강화'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Discover Who You Are',
        topic: '가면 증후군과 자아존중감',
        passageTitle: 'Embrace Failure, Unlock Success (Maya Angelou)',
        passageSummary: '자신의 능력을 의심하는 ‘가면 증후군(Impostor Syndrome)’을 극복하고 실패를 성장의 발판으로 삼는 심리학 지문입니다.',
        startPage: 16,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p16.jpg',
        careerTag: '임상심리 · 상담치료 · 뇌과학',
      },
      {
        unitNumber: 2,
        unitTitle: 'Embrace the Earth',
        topic: '물 발자국과 자원 보존',
        passageTitle: 'Mind Your Water Footprint & Upcycling',
        passageSummary: '우리가 입는 옷 한 벌에 들어가는 보이지 않는 가상수(Water Footprint)를 계산하고 지속 가능한 업사이클링을 분석합니다.',
        startPage: 40,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p40.jpg',
        careerTag: '환경공학 · 수자원관리 · 지속가능성',
      },
      {
        unitNumber: 3,
        unitTitle: 'Think Critically',
        topic: '행동경제학과 미끼 효과',
        passageTitle: 'The Decoy Effect in Everyday Decisions',
        passageSummary: '소비자가 더 비싼 상품을 선택하도록 유도하는 행동경제학의 ‘미끼 효과(Decoy Effect)’와 넛지 마케팅을 다룹니다.',
        startPage: 64,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p64.jpg',
        careerTag: '경제학 · 마케팅 · 소비자심리',
      },
      {
        unitNumber: 4,
        unitTitle: 'Appreciate Art',
        topic: '천문학으로 푼 모네 명화의 비밀',
        passageTitle: 'Astronomy: How Science Solved an Art Mystery',
        passageSummary: '인상주의 화가 모네의 그림 속 태양의 위치와 조수 간만을 현대 천문학 소프트웨어로 분석해 그림이 그려진 정확한 날짜를 밝힙니다.',
        startPage: 88,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p88.jpg',
        careerTag: '천문학 · 미술사 · 포렌식과학',
      },
      {
        unitNumber: 5,
        unitTitle: 'Money in Our Lives',
        topic: '디드로 효과와 과소비의 굴레',
        passageTitle: 'The Diderot Effect: Why We Buy Things We Don’t Need',
        passageSummary: '프랑스 철학자 디드로가 빨간 가운을 선물받은 후 집안 가구를 모두 바꾸다 파산한 일화로 과소비의 심리적 굴레를 경고합니다.',
        startPage: 112,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p112.jpg',
        careerTag: '소비자경제 · 사회학 · 재무관리',
      },
      {
        unitNumber: 6,
        unitTitle: 'Explore the Future',
        topic: '로봇 공학과 감정의 지각',
        passageTitle: 'Imagine Living with AI: Robotics & Klara and the Sun',
        passageSummary: '노벨문학상 수상 작가 가즈오 이시구로의 SF 소설 ‘클라라와 태양’을 통해 인공지능 로봇의 감정과 공감의 본질을 고찰합니다.',
        startPage: 136,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p136.jpg',
        careerTag: 'AI로봇 · SF문학 · 인지철학',
      },
    ],
  },
  {
    id: '영어Ⅱ',
    grade: '3학년',
    semester: '1학기',
    title: '영어Ⅱ',
    publisher: '능률 (김성곤)',
    coverImage: '/pages_cache/3학년_1학기_영어Ⅱ_능률_p1.jpg',
    badgeBg: 'bg-purple-100 text-purple-800',
    accentColor: 'from-purple-600 to-violet-600',
    unitsCount: 6,
    overviewSentence: '수능 완성 대비 교과서로, 백일해 백신 개발사, 시민 천문학, 선호투표제, 전자 폐기물, 고대 조각상의 숨겨진 색채 등 대학 전공 수준의 지문을 수록했습니다.',
    features: ['EBS 연계 수능 완성 지문', '과학·사회 비판적 담론', '학술 논문형 문체 습득'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Build a Better World',
        topic: '백일해 백신 개발의 여성 영웅들',
        passageTitle: 'Two Heroes Who Fought a Deadly Disease',
        passageSummary: '영유아에게 치명적이던 백일해 백신을 연구실과 가정을 누비며 개발해 낸 두 여성 과학자 펄 켄드릭과 그레이스 엘더링의 헌신입니다.',
        startPage: 15,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p15.jpg',
        careerTag: '의예과 · 약학연구 · 생명과학',
      },
      {
        unitNumber: 2,
        unitTitle: 'The World of Scientific Discovery',
        topic: '시민 천문학과 갤럭시 주',
        passageTitle: 'Science Is for Everyone: Citizen Science & Galaxy Zoo',
        passageSummary: '전 세계 자원봉사자 수십만 명이 온라인으로 은하 사진을 분류해 새로운 천체를 발견해 낸 집단지성 시민과학 프로젝트입니다.',
        startPage: 41,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p41.jpg',
        careerTag: '천체물리 · 빅데이터 · 크라우드소싱',
      },
      {
        unitNumber: 3,
        unitTitle: 'Life Is a Sum of Choices',
        topic: '민주주의와 다양한 투표 제도',
        passageTitle: 'There’s More than One Way to Vote',
        passageSummary: '선호투표제 등 유권자의 의사를 더 정확하게 반영하기 위한 다양한 대안적 선거 제도의 장단점을 탐구합니다.',
        startPage: 67,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p67.jpg',
        careerTag: '정치외교 · 행정학 · 통계수학',
      },
      {
        unitNumber: 4,
        unitTitle: 'Create a Greener Tomorrow',
        topic: '전자 폐기물(E-Waste)의 역습',
        passageTitle: 'Breaking the Cycle: The Urgent Need to Manage E-Waste',
        passageSummary: '스마트폰 등 쏟아져 나오는 전자 폐기물의 유독 물질 위험과 도시 광산(Urban Mining)을 통한 자원 회수의 시급성을 짚습니다.',
        startPage: 93,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p93.jpg',
        careerTag: '환경공학 · 자원순환 · 도시광산',
      },
      {
        unitNumber: 5,
        unitTitle: 'Open Your Mind, Defeat Your Biases',
        topic: '고대 조각상의 숨겨진 색채 과학',
        passageTitle: 'The Colorful Truth of Ancient Statues',
        passageSummary: '순백색으로 알려졌던 고대 그리스·로마 조각상들이 원래는 눈부시게 다채로운 원색으로 채색되어 있었다는 고고학적 진실입니다.',
        startPage: 119,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p119.jpg',
        careerTag: '고고학 · 미술보존학 · 분광학',
      },
      {
        unitNumber: 6,
        unitTitle: 'Special Lesson: The Model Millionaire',
        topic: '오스카 와일드의 풍자 문학',
        passageTitle: 'The Model Millionaire by Oscar Wilde',
        passageSummary: '오스카 와일드 특유의 위트와 휴머니즘이 빛나는 단편소설로, 진정한 부와 인간미에 대한 교훈을 전합니다.',
        startPage: 139,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p139.jpg',
        careerTag: '영문학 · 연극영화 · 창작',
      },
    ],
  },
  {
    id: '세계 문화와 영어',
    grade: '3학년',
    semester: '1학기',
    title: '세계 문화와 영어',
    publisher: '비상 (권혁승)',
    coverImage: '/pages_cache/3학년_1학기_세계_문화와_영어_비상_p1.jpg',
    badgeBg: 'bg-rose-100 text-rose-800',
    accentColor: 'from-rose-600 to-pink-600',
    unitsCount: 6,
    overviewSentence: '아시아, 아프리카, 유럽, 북미, 남미, 오세아니아 6대륙의 문화, 스포츠, 스타트업, 축제, 워킹홀리데이를 다루는 생생한 진로선택 과목입니다.',
    features: ['6대륙 문화 기행', '글로벌 진로·직업 탐색', '실용 영문 이력서·기획서 영작'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Asia & Middle East',
        topic: '중동 스포츠와 동아시아 건축',
        passageTitle: 'Traditional Sports (Camel Racing) & East Asian Architecture',
        passageSummary: '중동의 낙타 경주 로봇 기수부터 한국·중국·일본의 자연 친화적 현대 목조 건축까지 아시아의 매력을 만납니다.',
        startPage: 26,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p26.jpg',
        careerTag: '건축디자인 · 아시아지역학 · 글로벌교류',
      },
      {
        unitNumber: 2,
        unitTitle: 'Africa: Unlocking Its Potential',
        topic: '아프리카 야생동물 보존과 마라톤',
        passageTitle: 'Wildlife Protection in Zimbabwe & Africa’s Innovation',
        passageSummary: '짐바브웨의 멸종 위기 야생동물 보호 프로젝트와 케냐 마라토너들의 성공 비결, 아프리카 대륙의 역동적 성장을 배웁니다.',
        startPage: 48,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p48.jpg',
        careerTag: '국제개발 · 스포츠과학 · 생태관광',
      },
      {
        unitNumber: 3,
        unitTitle: 'Europe: Classical Art and Sports',
        topic: '르네상스 명화 대결과 유럽 축구',
        passageTitle: 'A Duel between Two Painters & European Football Culture',
        passageSummary: '피렌체 베키오 궁전에서 펼쳐진 다빈치와 미켈란젤로의 벽화 대결, 단순한 경기를 넘어 삶의 문화가 된 유럽 축구 이야기입니다.',
        startPage: 68,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p68.jpg',
        careerTag: '서양사 · 미술관큐레이터 · 스포츠산업',
      },
      {
        unitNumber: 4,
        unitTitle: 'North America: High School & Startup',
        topic: '차고 창업 혁신과 동계 스포츠',
        passageTitle: 'Ice Hockey & Curling, American Garage Startups',
        passageSummary: '캐나다와 미국의 빙상 스포츠 열기, 애플과 아마존처럼 허름한 차고에서 시작해 세계를 바꾼 실리콘밸리 창업 스토리입니다.',
        startPage: 90,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p90.jpg',
        careerTag: '벤처창업 · IT비즈니스 · 스포츠마케팅',
      },
      {
        unitNumber: 5,
        unitTitle: 'South America: Flags & Carnival',
        topic: '남미 거리 예술과 카니발 열정',
        passageTitle: 'Graffiti in Latin America & Rio Carnival Celebration',
        passageSummary: '남미 도시 곳곳을 수놓은 정치·사회적 거리 예술(Graffiti)과 지구촌 최대의 축제 브라질 리오 카니발의 열정을 전합니다.',
        startPage: 114,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p114.jpg',
        careerTag: '축제기획 · 중남미지역학 · 도시문화예술',
      },
      {
        unitNumber: 6,
        unitTitle: 'Oceania: Nature & Marine',
        topic: '오세아니아 대자연과 워킹홀리데이',
        passageTitle: 'Working Holiday in Australia & New Zealand in Avatar',
        passageSummary: '호주에서 일과 여행을 병행하는 워킹홀리데이 실전 경험담과 영화 아바타의 배경이 된 뉴질랜드의 웅장한 대자연을 조망합니다.',
        startPage: 136,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p136.jpg',
        careerTag: '관광경영 · 해양생태 · 국제교류',
      },
    ],
  },
];

const SECTION_STYLE_MAP: Record<
  string,
  { icon: React.FC<{ className?: string }>; color: string }
> = {
  listening: {
    icon: Headphones,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300',
  },
  speaking: {
    icon: Mic,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300',
  },
  reading: {
    icon: BookOpen,
    color: 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-xs',
  },
  grammar: {
    icon: Bookmark,
    color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300',
  },
  writing: {
    icon: PenTool,
    color: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300',
  },
  vocab: {
    icon: FileText,
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300',
  },
};

export const TextbookBrowse2Layer: React.FC<Props> = ({ onOpenImage }) => {
  // 레이어 상태: null이면 1단계(교과서 3*2 그리드), bookId가 있으면 2단계(해당 교과서 단원 상세)
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  // 단원별 아코디언 열림 상태 관리 (key: "단원번호", value: boolean)
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  const selectedBook =
    TEXTBOOK_OVERVIEW_DATA.find((b) => b.id === activeBookId) || null;

  const toggleUnit = (unitNum: number) => {
    setOpenUnits((prev) => ({
      ...prev,
      [unitNum]: !prev[unitNum],
    }));
  };

  const setAllUnitsOpen = (open: boolean) => {
    if (!selectedBook) return;
    const nextState: Record<string, boolean> = {};
    selectedBook.units.forEach((u) => {
      nextState[u.unitNumber] = open;
    });
    setOpenUnits(nextState);
  };

  // 1단계: 교과서 선택 시 2단계로 진입
  const handleSelectBook = (bookId: string) => {
    setActiveBookId(bookId);
    setOpenUnits({ 1: true }); // 첫 단원 기본 펼침
  };

  // 2단계에서 1단계로 뒤로가기
  const handleBackToBooks = () => {
    setActiveBookId(null);
    setOpenUnits({});
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
      {/* ─────────────────────────────────────────────────────────────
          [LAYER 1] 교과서 표지 3*2 배치 그리드 (교과서 선택 화면)
      ───────────────────────────────────────────────────────────── */}
      {!selectedBook ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 헤더 카드 */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur-xs w-fit px-3 py-1 rounded-full">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>교과서 탐색 2-Layer</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">
              의령여고 영어 교과서 6권 전체 둘러보기 📚
            </h2>
            <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
              원하는 교과서 표지 카드를 클릭하면 교과서 속으로 들어가 단원별 학습 내용과 파트별 원본 페이지를 살펴볼 수 있습니다.
            </p>
          </div>

          {/* 3 * 2 교과서 표지 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {TEXTBOOK_OVERVIEW_DATA.map((book) => (
              <div
                key={book.id}
                onClick={() => handleSelectBook(book.id)}
                className="group bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-600 hover:shadow-md transition-all duration-200 p-3.5 flex flex-col cursor-pointer overflow-hidden relative"
              >
                {/* 상단 학년 및 출판사 배지 */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${book.badgeBg}`}>
                    {book.grade} {book.semester}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    총 {book.unitsCount}개 단원
                  </span>
                </div>

                {/* 교과서 표지 썸네일 (비율 3:4) */}
                <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-3 shadow-xs">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-md">
                      <span>단원 살펴보기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* 교과서 제목 & 출판사 */}
                <div className="space-y-1 mt-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium truncate">
                    {book.publisher}
                  </div>
                </div>

                {/* 교과서 핵심 설명 한 줄 */}
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 pt-2 border-t border-slate-100 leading-relaxed font-normal">
                  {book.overviewSentence}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            [LAYER 2] 특정 교과서 내부 상세 화면 (뒤로가기 + 단원 아코디언)
        ───────────────────────────────────────────────────────────── */
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
          {/* 뒤로가기 네비게이션 바 */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
            <button
              onClick={handleBackToBooks}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>교과서 목록으로 (3×2 그리드)</span>
            </button>

            {/* 모두 펼치기 / 접기 버튼 */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setAllUnitsOpen(true)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              >
                모두 펼치기
              </button>
              <button
                onClick={() => setAllUnitsOpen(false)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              >
                모두 접기
              </button>
            </div>
          </div>

          {/* 선택된 교과서 정보 헤더 카드 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-4">
              {/* 표지 작은 썸네일 */}
              <div
                onClick={() => onOpenImage(`${selectedBook.title} · 표지`, selectedBook.coverImage)}
                className="relative w-16 sm:w-20 aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs cursor-pointer group"
                title="표지 원본 보기"
              >
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* 교과서 메타 정보 */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedBook.badgeBg}`}>
                    {selectedBook.grade} {selectedBook.semester}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">({selectedBook.publisher})</span>
                  <span className="text-xs text-blue-600 font-semibold">총 {selectedBook.unitsCount}개 단원</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                  {selectedBook.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
                  💡 {selectedBook.overviewSentence}
                </p>

                {/* 특징 키워드 */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {selectedBook.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 단원 목록 아코디언 */}
          <div className="space-y-3">
            {selectedBook.units.map((unit, uIdx) => {
              const isOpen = openUnits[unit.unitNumber] ?? (uIdx === 0);

              // 정밀 설계된 메타데이터에서 해당 단원의 모든 파트(듣기, 말하기, 읽기, 문법, 쓰기 등)와 단원 정보 가져오기
              const unitMeta =
                (accurateMetadata as any)[selectedBook.id]?.[String(unit.unitNumber)] || {};
              const sections: Array<{
                key: string;
                label: string;
                page: number;
                imagePath: string;
                desc: string;
              }> = unitMeta.sections || [];

              const unitTopic = unitMeta.topic || unit.topic;
              const unitTitle = unitMeta.unitTitle || unit.unitTitle;
              const careerTag = unitMeta.careerTag || unit.careerTag;
              const passageSummary = unitMeta.passageSummary || unit.passageSummary;

              return (
                <div
                  key={uIdx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-blue-400 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                  }`}
                >
                  {/* 단원 아코디언 헤더 */}
                  <div
                    onClick={() => toggleUnit(unit.unitNumber)}
                    className="flex items-center justify-between gap-2 p-3.5 sm:p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 transition-colors shadow-2xs ${
                          isOpen ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {unit.unitNumber}
                      </span>

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          Unit {unit.unitNumber}. {unitTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1.5">
                          <span className="text-blue-600 font-semibold">주제:</span>
                          <span>{unitTopic}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-400 text-[10px]">진로: {careerTag}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                          isOpen ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* 단원 아코디언 바디 */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-3">
                      {/* 파트별 버튼 및 단원 실제 학습 내용 설명 카드 그리드 */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                        {sections.map((sec) => {
                          const styleInfo = SECTION_STYLE_MAP[sec.key] || {
                            icon: BookOpen,
                            color: 'bg-slate-100 border-slate-200 text-slate-700',
                          };
                          const IconComponent = styleInfo.icon;

                          return (
                            <div
                              key={sec.key}
                              className="flex flex-col bg-white rounded-xl border border-slate-200/80 p-2 shadow-2xs hover:border-slate-300 transition-all"
                            >
                              <button
                                onClick={() =>
                                  onOpenImage(
                                    `${selectedBook.title} Unit ${unit.unitNumber} ${sec.label} (p.${sec.page})`,
                                    `/${sec.imagePath}`
                                  )
                                }
                                className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${styleInfo.color}`}
                              >
                                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                                <span>{sec.label}</span>
                                <span className="text-[10px] font-normal opacity-85">(p.{sec.page})</span>
                              </button>

                              <div className="mt-1.5 px-0.5 text-center sm:text-left">
                                <p className="text-[11px] text-slate-600 leading-tight">
                                  {sec.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 단원 줄거리 요약 */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-600 leading-relaxed min-w-0">
                          <span className="font-semibold text-slate-800 mr-1.5">단원 스토리:</span>
                          <span>{passageSummary}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
