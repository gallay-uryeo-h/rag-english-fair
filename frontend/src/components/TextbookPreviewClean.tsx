import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  Layers,
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
  topic: string; // 주제 (예: 대인관계, 과학기술, 지속가능성)
  passageTitle: string; // 읽을거리 본문 제목
  passageSummary: string; // 친근하고 쉬운 한 줄 줄거리
  startPage: number;
  imagePath: string;
  careerTag: string; // 연계 진로
}

interface TextbookOverview {
  id: string;
  grade: string;
  semester: string;
  title: string;
  publisher: string;
  coverImage: string;
  badgeBg: string;
  overviewSentence: string; // 고등 영어를 처음 보는 사람을 위한 핵심 설명
  features: string[]; // 교과서 특징 키워드 3가지
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
    overviewSentence: '2학년 일반선택 대표 과목으로, 롤모델 탐색부터 동물 인지과학, 세대 통합 주거, 푸드 아트, 올림픽 난민 수영선수의 실화까지 흥미진진한 지문들이 가득합니다.',
    features: ['수능·모의고사형 독해 호흡', '인물 중심 감동 실화', '과학·사회 융합 지문'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Journey to the Future',
        topic: '진로와 롤모델',
        passageTitle: 'Who Is Your Role Model?',
        passageSummary: '해양 탐험가 자크 쿠스토, 파충류학자 조앤 프록터, 영화 애니메이터 김상진의 삶을 통해 나만의 롤모델을 찾습니다.',
        startPage: 16,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p16.jpg',
        careerTag: '진로탐색 · 미디어 · 생물학',
      },
      {
        unitNumber: 2,
        unitTitle: 'The Power of Good Habits',
        topic: '동물 행동학과 습관',
        passageTitle: 'Science Report: Animal Habits and Tool Use',
        passageSummary: '도구를 능숙하게 제작하고 사용하는 까마귀, 침팬지, 문어 등의 지능과 동물들의 놀라운 습관을 관찰합니다.',
        startPage: 42,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p42.jpg',
        careerTag: '동물생태 · 인지과학 · 심리',
      },
      {
        unitNumber: 3,
        unitTitle: 'Let’s Live in Harmony',
        topic: '사회 복지와 세대 통합',
        passageTitle: 'Humanitas: Intergenerational Living Program',
        passageSummary: '노인 요양 시설에 대학생들이 함께 거주하며 말벗이 되어주는 세대 공존 주거 모델의 감동적인 성과를 조명합니다.',
        startPage: 68,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p68.jpg',
        careerTag: '사회복지 · 도시재생 · 간호',
      },
      {
        unitNumber: 4,
        unitTitle: 'Spark Your Creativity',
        topic: '창의성과 융합 예술',
        passageTitle: 'Edible Art: Helga Stentzel & Giuseppe Arcimboldo',
        passageSummary: '빵, 채소, 과일 등 일상 식재료를 기발한 예술 작품으로 승화시킨 예술가들의 시각적 상상력을 탐험합니다.',
        startPage: 94,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p94.jpg',
        careerTag: '시각디자인 · 외식조리 · 순수미술',
      },
      {
        unitNumber: 5,
        unitTitle: 'Rise Above Challenges',
        topic: '도전과 인권',
        passageTitle: 'Yusra Mardini: An Olympic Refugee Swimmer’s Journey',
        passageSummary: '시리아 난민 보트가 침몰 위기에 처했을 때 3시간 넘게 헤엄쳐 승객을 구하고 올림픽 무대에 선 유스라 마르디니의 실화입니다.',
        startPage: 120,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p120.jpg',
        careerTag: '국제외교 · 인권 · 스포츠',
      },
      {
        unitNumber: 6,
        unitTitle: 'Special Lesson: The Open Window',
        topic: '영미 고전문학',
        passageTitle: 'The Open Window (by Saki)',
        passageSummary: '열린 창문을 둘러싸고 벌어지는 사키(Saki) 작가의 유쾌하고 반전 넘치는 정통 영미 단편소설을 원문으로 읽습니다.',
        startPage: 139,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p139.jpg',
        careerTag: '영문학 · 시나리오 · 문예창작',
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
    overviewSentence: '수능 빈출 분야인 행동경제학(미끼 효과, 디드로 효과), 예술과 천문학의 융합 추리, AI 로봇 윤리 등 세부적인 인문·사회·과학 논문을 영어로 읽는 고급 독해 과목입니다.',
    features: ['행동경제학·심리학 심층 분석', '과학·예술 융합 추론 독해', '수능 영어 1등급 연계 독해력'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Discover Who You Are',
        topic: '성장과 회복탄력성',
        passageTitle: 'Embrace Failure, Unlock Success (Maya Angelou)',
        passageSummary: '미국 시인 마야 안젤루의 삶과 여러 위인들의 실패 경험을 통해, 실수가 어떻게 성공의 열쇠가 되는지 분석합니다.',
        startPage: 16,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p16.jpg',
        careerTag: '상담심리 · 교육학 · 자기개발',
      },
      {
        unitNumber: 2,
        unitTitle: 'Embrace the Earth',
        topic: '환경과 자원순환',
        passageTitle: 'Upcycling for a Sustainable Future',
        passageSummary: '단순 재활용을 넘어 디자인과 가치를 더해 명품으로 재탄생시키는 글로벌 업사이클링 산업의 경제적 가능성을 탐구합니다.',
        startPage: 40,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p40.jpg',
        careerTag: '친환경소재 · 패션 · 제품디자인',
      },
      {
        unitNumber: 3,
        unitTitle: 'Think Critically',
        topic: '행동경제학과 소비심리',
        passageTitle: 'The Decoy Effect in Everyday Decisions',
        passageSummary: '영화관 팝콘 크기 선택이나 가격 책정에서 소비자가 특정 선택지를 고르도록 유도하는 ‘미끼 효과(Decoy Effect)’의 메커니즘을 배웁니다.',
        startPage: 64,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p64.jpg',
        careerTag: '경제학 · 소비자심리 · 마케팅',
      },
      {
        unitNumber: 4,
        unitTitle: 'Appreciate Art',
        topic: '천문학과 미술사 융합',
        passageTitle: 'Astronomy: How Science Solved an Art Mystery (Monet)',
        passageSummary: '모네의 유명 풍경화 속 안개와 태양 위치를 천문학적 행성 궤도 계산으로 역추적하여 그림이 그려진 정확한 날짜를 밝혀낸 명화 미스터리입니다.',
        startPage: 88,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p88.jpg',
        careerTag: '천문우주 · 미술사 · 과학수사',
      },
      {
        unitNumber: 5,
        unitTitle: 'Money in Our Lives',
        topic: '소비 욕망과 사회학',
        passageTitle: 'The Diderot Effect: Why We Buy Things We Don’t Need',
        passageSummary: '새 가운을 선물받은 후 그에 맞춰 가구와 집안 물건을 계속 바꾸다 과소비에 빠진 드니 디드로의 일화에서 인간의 소비 심리를 고찰합니다.',
        startPage: 112,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p112.jpg',
        careerTag: '사회학 · 행동경제 · 상담',
      },
      {
        unitNumber: 6,
        unitTitle: 'Explore the Future',
        topic: 'SF 문학과 AI 윤리',
        passageTitle: 'Imagine Living with AI: Robotics, Asimov & Klara and the Sun',
        passageSummary: '아이작 아시모프의 로봇 3원칙과 노벨문학상 수상작 ‘클라라와 태양’을 통해 인간과 감정을 나누는 인공지능의 미래 윤리를 고민합니다.',
        startPage: 136,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p136.jpg',
        careerTag: '로봇공학 · AI철학 · 문예창작',
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
    overviewSentence: '3학년 수능 연계 및 학업 심화 단계로, 백일해 백신 개발 역사, 시민 과학(은하수 분류 프로젝트), 투표의 다양한 수학적 원리 등 지적 호기심을 자극하는 깊이 있는 지문들을 만납니다.',
    features: ['대학 전공 연계 지문', '시민 참여 과학과 수학적 사고', '비판적 사고와 편견 극복'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Build a Better World',
        topic: '의학 혁신과 헌신',
        passageTitle: 'Two Heroes Who Fought a Deadly Disease',
        passageSummary: '수많은 아이들의 목숨을 앗아간 백일해(Pertussis) 백신을 개발하기 위해 평생을 바친 여성 과학자들의 감동적인 의학 연구 여정입니다.',
        startPage: 15,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p15.jpg',
        careerTag: '의학 · 간호보건 · 생명과학',
      },
      {
        unitNumber: 2,
        unitTitle: 'The World of Scientific Discovery',
        topic: '시민 과학과 천문학',
        passageTitle: 'Science Is for Everyone: Citizen Science & Galaxy Zoo',
        passageSummary: '수억 개의 은하 사진을 전 세계 일반 시민들이 직접 분류하며 새로운 천체를 함께 발견해 나가는 대규모 온라인 시민 과학 프로젝트를 소개합니다.',
        startPage: 41,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p41.jpg',
        careerTag: '우주천문 · 데이터사이언스 · 교육',
      },
      {
        unitNumber: 3,
        unitTitle: 'Life Is a Sum of Choices',
        topic: '정치와 투표 제도',
        passageTitle: 'There’s More than One Way to Vote',
        passageSummary: '단순 다수결뿐 아니라 선호투표제 등 수학적 공정성을 확보하기 위해 세계 각국에서 고안한 다양한 투표 방식의 원리를 배웁니다.',
        startPage: 67,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p67.jpg',
        careerTag: '정치외교 · 행정학 · 응용수학',
      },
      {
        unitNumber: 4,
        unitTitle: 'Create a Greener Tomorrow',
        topic: '전자 폐기물과 자원 관리',
        passageTitle: 'Breaking the Cycle: The Urgent Need to Manage E-Waste',
        passageSummary: '스마트폰, 컴퓨터 등 첨단 기기들이 폐기되며 발생하는 독성 물질과 환경 위기를 극복하기 위한 국제적 자원 순환 노력을 다룹니다.',
        startPage: 93,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p93.jpg',
        careerTag: '환경공학 · 자원순환 · 국제법',
      },
      {
        unitNumber: 5,
        unitTitle: 'Open Your Mind, Defeat Your Biases',
        topic: '고고학과 고정관념',
        passageTitle: 'The Colorful Truth of Ancient Statues',
        passageSummary: '순백색으로만 알려졌던 고대 그리스·로마 대리석 조각상이 자외선 분광 분석 결과 원래는 화려한 총천연색으로 칠해져 있었다는 놀라운 고고학적 진실입니다.',
        startPage: 119,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p119.jpg',
        careerTag: '고고학 · 역사학 · 보존과학',
      },
      {
        unitNumber: 6,
        unitTitle: 'Special Lesson: The Model Millionaire',
        topic: '영미 문학 명작',
        passageTitle: 'The Model Millionaire (by Oscar Wilde)',
        passageSummary: '오스카 와일드 특유의 위트와 따뜻한 반전이 담긴 명작으로, 진정한 나눔과 친절의 가치를 감동적으로 전합니다.',
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
    overviewSentence: '문법 암기에서 벗어나 6개 대륙(아시아, 아프리카, 유럽, 북미, 남미, 오세아니아)의 고유한 전통 스포츠, 미식, 예술, 스타트업, 워킹홀리데이 등 생생한 지구촌 문화를 여행하듯 읽는 진로선택 과목입니다.',
    features: ['6개 대륙 글로벌 문화 여행', '생생한 실생활 영어 표현', '글로벌 시민성과 국제 감각'],
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Asia: Old Traditions and New Lifestyles',
        topic: '아시아의 전통과 현대',
        passageTitle: 'Traditional Sports (Camel Racing) & East Asian Architecture',
        passageSummary: '중동의 낙타 경주 로봇 기수부터 한국·중국·일본의 자연 친화적 현대 목조 건축까지 아시아의 매력을 만납니다.',
        startPage: 26,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p26.jpg',
        careerTag: '건축디자인 · 아시아지역학',
      },
      {
        unitNumber: 2,
        unitTitle: 'Africa: Wildlife Conservation and Future Potential',
        topic: '아프리카의 잠재력',
        passageTitle: 'Wildlife Protection in Zimbabwe & Africa’s Innovation',
        passageSummary: '짐바브웨의 멸종 위기 야생동물 보호 프로젝트와 케냐 마라토너들의 성공 비결, 아프리카 대륙의 역동적 성장을 배웁니다.',
        startPage: 48,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p48.jpg',
        careerTag: '국제개발협력 · 생태관광',
      },
      {
        unitNumber: 3,
        unitTitle: 'Europe: Classical Art and Sports Culture',
        topic: '유럽의 예술과 스포츠',
        passageTitle: 'A Duel between Two Painters & European Football Culture',
        passageSummary: '피렌체 베키오 궁전에서 펼쳐진 다빈치와 미켈란젤로의 벽화 대결, 단순한 경기를 넘어 삶의 문화가 된 유럽 축구 이야기입니다.',
        startPage: 68,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p68.jpg',
        careerTag: '미술사 · 스포츠산업 · 유럽학',
      },
      {
        unitNumber: 4,
        unitTitle: 'North America: Innovation and Leisure',
        topic: '북미의 혁신과 라이프스타일',
        passageTitle: 'Ice Hockey & Curling, American Garage Startups',
        passageSummary: '캐나다와 미국의 빙상 스포츠 열기, 애플과 아마존처럼 허름한 차고에서 시작해 세계를 바꾼 실리콘밸리 창업 스토리입니다.',
        startPage: 90,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p90.jpg',
        careerTag: '벤처창업 · 글로벌비즈니스',
      },
      {
        unitNumber: 5,
        unitTitle: 'South America: Culture of Passion and Excitement',
        topic: '남미의 열정과 예술',
        passageTitle: 'Graffiti in Latin America & Rio Carnival Celebration',
        passageSummary: '남미 도시 곳곳을 수놓은 정치·사회적 거리 예술(Graffiti)과 지구촌 최대의 축제 브라질 리오 카니발의 열정을 전합니다.',
        startPage: 114,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p114.jpg',
        careerTag: '축제기획 · 중남미지역학 · 도시문화',
      },
      {
        unitNumber: 6,
        unitTitle: 'Oceania: Culture Life and New Horizon',
        topic: '오세아니아의 자연과 진로',
        passageTitle: 'Working Holiday in Australia & New Zealand in Avatar',
        passageSummary: '호주에서 일과 여행을 병행하는 워킹홀리데이 실전 경험담과 영화 아바타의 배경이 된 뉴질랜드의 웅장한 대자연을 조망합니다.',
        startPage: 136,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p136.jpg',
        careerTag: '관광경영 · 영상제작 · 해양생태',
      },
    ],
  },
];

// 영역(섹션)별 한글 라벨, 아이콘, 스타일 매핑
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

export const TextbookPreviewClean: React.FC<Props> = ({ onOpenImage }) => {
  // 선택된 교과서 (기본값: 공통영어1)
  const [selectedBookId, setSelectedBookId] = useState<string>('공통영어1');

  // 단원별 아코디언 열림 상태 관리 (key: "과목_단원번호", value: boolean)
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  const selectedBook =
    TEXTBOOK_OVERVIEW_DATA.find((b) => b.id === selectedBookId) || TEXTBOOK_OVERVIEW_DATA[0];

  const toggleUnit = (unitNum: number) => {
    const key = `${selectedBook.id}_${unitNum}`;
    setOpenUnits((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const setAllUnitsOpen = (open: boolean) => {
    const nextState = { ...openUnits };
    selectedBook.units.forEach((u) => {
      nextState[`${selectedBook.id}_${u.unitNumber}`] = open;
    });
    setOpenUnits(nextState);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
      {/* 📚 1. 상단: 6개 교과서 표지 한 줄(1행) 6분할 셀렉터 */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>교과서 선택 (표지를 누르면 단원 내용이 아래에 열립니다)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">총 6권</span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
          {TEXTBOOK_OVERVIEW_DATA.map((book) => {
            const isSelected = selectedBookId === book.id;
            return (
              <div
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
                className={`group relative rounded-lg sm:rounded-xl p-1 sm:p-2 transition-all cursor-pointer flex flex-col items-center text-center border-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* 교과서 표지 썸네일 이미지 */}
                <div className="relative w-full aspect-3/4 rounded sm:rounded-lg overflow-hidden bg-slate-100 shadow-xs mb-1 sm:mb-2 border border-slate-200/80">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1">
                    <span className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded shadow-xs ${book.badgeBg}`}>
                      {book.grade}
                    </span>
                  </div>

                  {/* 표지 원본 돋보기 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenImage(`${book.title} · 표지 (p.1)`, book.coverImage);
                    }}
                    title="표지 원본 보기"
                    className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 p-0.5 sm:p-1 rounded bg-black/60 hover:bg-blue-600 text-white backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </div>

                {/* 교과서 타이틀 & 출판사 */}
                <div className="w-full min-w-0">
                  <div className={`text-[10px] sm:text-xs font-bold truncate leading-tight ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                    {book.title}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-slate-400 truncate mt-0.5">
                    {book.publisher.split(' ')[0]}
                  </div>
                </div>

                {/* 선택 표시 인디케이터 바 */}
                {isSelected && (
                  <div className="w-5 sm:w-8 h-0.5 sm:h-1 bg-blue-600 rounded-full mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 📖 2. 선택된 교과서 전체적인 그림 & 단원별 읽을거리 아코디언 */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* 교과서 한 줄 그림 요약 카드 */}
        <div className="rounded-xl p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 border border-blue-100 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedBook.badgeBg}`}>
                {selectedBook.grade} {selectedBook.semester}
              </span>
              <h3 className="text-base md:text-lg font-bold text-slate-800">
                {selectedBook.title}
              </h3>
              <span className="text-xs text-slate-400 font-medium">({selectedBook.publisher})</span>
            </div>

            {/* 전체 펼치기 / 접기 */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setAllUnitsOpen(true)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                모두 펼치기
              </button>
              <button
                onClick={() => setAllUnitsOpen(false)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                모두 접기
              </button>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
            💡 {selectedBook.overviewSentence}
          </p>

          {/* 특징 키워드 3가지 칩 */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {selectedBook.features.map((feat, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/90 border border-blue-200/70 text-blue-700"
              >
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>

        {/* 단원별 읽을거리 & 영역별 첫 페이지 아코디언 목록 */}
        <div className="space-y-3">
          {selectedBook.units.map((unit, uIdx) => {
            const unitKey = `${selectedBook.id}_${unit.unitNumber}`;
            const isOpen = openUnits[unitKey] ?? (uIdx === 0);

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
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-blue-300 bg-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                {/* 📌 아코디언 헤더 바 (클릭 시 토글 - 제목 옆 읽기 버튼 완전히 제거됨) */}
                <div
                  onClick={() => toggleUnit(unit.unitNumber)}
                  className="flex items-center justify-between gap-2 p-3 sm:p-3.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {unit.unitNumber}
                    </span>

                    <div className="min-w-0">
                      {/* 1행: Unit 번호 및 제목 */}
                      <div className="text-xs md:text-sm font-bold text-slate-800 truncate">
                        Unit {unit.unitNumber}. {unitTitle}
                      </div>
                      {/* 2행: 본문 제목은 생략하고 단원 주제 배치 */}
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1.5">
                        <span className="text-blue-600 font-semibold">주제:</span>
                        <span>{unitTopic}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400 text-[10px]">진로: {careerTag}</span>
                      </div>
                    </div>
                  </div>

                  {/* 우측: 아코디언 열고 닫기 토글 버튼 */}
                  <div className="shrink-0 p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* 📌 아코디언 바디: 파트별 버튼 & 단원 실제 내용 설명 그리드 + 한 줄 스토리 */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-3">
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
                            {/* 파트 열기 버튼 (간단하게 '듣기', '말하기', '읽기' 등 + 실제 교과서 페이지 연동) */}
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

                            {/* 버튼 아래: 이 단원의 해당 파트에 실제로 어떤 내용이 있는지 설명 */}
                            <div className="mt-1.5 px-0.5 text-center sm:text-left">
                              <p className="text-[11px] text-slate-600 leading-tight">
                                {sec.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 친근한 단원 줄거리 요약 */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
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
    </div>
  );
};
