// 교과서 6권 전 단원의 순수 Reading 본문 첫 페이지 정밀 매핑 테이블
export interface PassageStartInfo {
  page: number;
  imagePath: string;
  passageTitle: string;
}

// 단원별 핵심 문법 파트 첫 페이지 메타데이터
export interface GrammarStartInfo {
  page: number;
  imagePath: string;
  firstPointTitle: string;
  allPoints: string[];
}

export const PURE_PASSAGE_MAP: Record<string, Record<number, PassageStartInfo>> = {
  // 1. 공통영어1 (미래엔)
  '공통영어1': {
    1: { page: 19, imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p19.jpg', passageTitle: "The Power of Friendliness: Soft but Strong" },
    2: { page: 41, imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p41.jpg', passageTitle: "Gathering of the Whakapapa" },
    3: { page: 63, imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p63.jpg', passageTitle: "Noise-Cancelling Headphones / Sound Technology" },
    4: { page: 85, imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p85.jpg', passageTitle: "A Better Future for Coffee Waste" },
  },
  // 2. 공통영어2 (미래엔)
  '공통영어2': {
    1: { page: 19, imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p19.jpg', passageTitle: "Caring for Animals / Elephant Rescue Camp" },
    2: { page: 41, imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p41.jpg', passageTitle: "Light Up the Truth Behind Dark Patterns" },
    3: { page: 63, imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p63.jpg', passageTitle: "Folk Artists: Bill Traylor & Maud Lewis" },
    4: { page: 85, imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p85.jpg', passageTitle: "Will AI-Powered Neural Implants Make Us Super-Humans?" },
  },
  // 3. 영어I (엔이능률)
  '영어I': {
    1: { page: 16, imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p16.jpg', passageTitle: "Who Is Your Role Model?" },
    2: { page: 42, imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p42.jpg', passageTitle: "Science Report: Animal Habits and Tool Use" },
    3: { page: 68, imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p68.jpg', passageTitle: "Humanitas: Intergenerational Living Program" },
    4: { page: 94, imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p94.jpg', passageTitle: "Edible Art: Helga Stentzel & Giuseppe Arcimboldo" },
    5: { page: 120, imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p120.jpg', passageTitle: "Yusra Mardini: An Olympic Refugee Swimmer's Journey" },
    6: { page: 139, imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p139.jpg', passageTitle: "Special Lesson: The Open Window" },
  },
  // 4. 영어II (능률)
  '영어II': {
    1: { page: 15, imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p15.jpg', passageTitle: "Two Heroes Who Fought a Deadly Disease" },
    2: { page: 41, imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p41.jpg', passageTitle: "Science Is for Everyone: Citizen Science & Galaxy Zoo" },
    3: { page: 67, imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p67.jpg', passageTitle: "There's More than One Way to Vote" },
    4: { page: 93, imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p93.jpg', passageTitle: "Breaking the Cycle: The Urgent Need to Manage E-Waste" },
    5: { page: 119, imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p119.jpg', passageTitle: "The Colorful Truth of Ancient Statues" },
    6: { page: 139, imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p139.jpg', passageTitle: "Special Lesson: The Model Millionaire" },
  },
  // 5. 영어 독해와 작문 (미래엔)
  '영어 독해와 작문': {
    1: { page: 16, imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p16.jpg', passageTitle: "Embrace Failure, Unlock Success (Maya Angelou)" },
    2: { page: 40, imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p40.jpg', passageTitle: "Upcycling for a Sustainable Future" },
    3: { page: 64, imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p64.jpg', passageTitle: "The Decoy Effect in Everyday Decisions" },
    4: { page: 88, imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p88.jpg', passageTitle: "Astronomy: How Science Solved an Art Mystery" },
    5: { page: 112, imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p112.jpg', passageTitle: "The Diderot Effect: Why We Buy Things We Don't Need" },
    6: { page: 136, imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p136.jpg', passageTitle: "Imagine Living with AI: Robotics & Klara and the Sun" },
  },
  // 6. 세계 문화와 영어 (비상)
  '세계 문화와 영어': {
    1: { page: 26, imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p26.jpg', passageTitle: "Traditional Sports & East Asian Architecture" },
    2: { page: 48, imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p48.jpg', passageTitle: "Wildlife Protection in Zimbabwe & Africa's Innovation" },
    3: { page: 68, imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p68.jpg', passageTitle: "A Duel between Two Painters & European Football Culture" },
    4: { page: 90, imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p90.jpg', passageTitle: "Ice Hockey, Curling & American Garage Startups" },
    5: { page: 114, imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p114.jpg', passageTitle: "Graffiti in Latin America & Rio Carnival Celebration" },
    6: { page: 136, imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p136.jpg', passageTitle: "Working Holiday in Australia & New Zealand in Avatar" },
  },
};

// 단원별 핵심 문법 파트(Structures / Grammar) 첫 페이지 매핑 테이블
export const GRAMMAR_START_MAP: Record<string, Record<number, GrammarStartInfo>> = {
  // 1. 공통영어1 (미래엔)
  '공통영어1': {
    1: {
      page: 26,
      imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p26.jpg',
      firstPointTitle: '관계대명사의 역할과 생략 (주격 / 목적격)',
      allPoints: ['관계대명사의 역할과 생략', '분사구문 (현재분사 / 과거분사)'],
    },
    2: {
      page: 48,
      imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p48.jpg',
      firstPointTitle: 'as if 가정법 (마치 ~인 것처럼)',
      allPoints: ['as if 가정법', 'how + 형용사/부사 + S + V'],
    },
    3: {
      page: 70,
      imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p70.jpg',
      firstPointTitle: '부정어구 및 장소부사구 도치',
      allPoints: ['부정어구 및 장소부사구 도치', '가주어 It ~ 의미상 주어 for ~ to부정사'],
    },
    4: {
      page: 92,
      imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p92.jpg',
      firstPointTitle: 'with + 명사 + 분사 (부대상황 동시동작)',
      allPoints: ['with + 명사 + 분사', '상관접속사와 병렬 구조'],
    },
  },
  // 2. 공통영어2 (미래엔)
  '공통영어2': {
    1: {
      page: 26,
      imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p26.jpg',
      firstPointTitle: '5형식 목적격 보어로 to부정사를 취하는 동사',
      allPoints: ['5형식 목적격 보어 to부정사', '과거완료 시제 (had + p.p.)'],
    },
    2: {
      page: 48,
      imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p48.jpg',
      firstPointTitle: '조동사 + have p.p. (과거 추측과 후회)',
      allPoints: ['조동사 + have p.p.', '주장·제안·요구 동사 뒤 that절 (should) + 동원'],
    },
    3: {
      page: 70,
      imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p70.jpg',
      firstPointTitle: '접속사 vs 전치사 구분 (because vs because of)',
      allPoints: ['접속사 vs 전치사 구분', '관계대명사의 계속적 용법 (, which)'],
    },
    4: {
      page: 92,
      imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p92.jpg',
      firstPointTitle: '가목적어-진목적어 구문 (find/make it ... to-v)',
      allPoints: ['가목적어-진목적어 구문', '동격의 접속사 that'],
    },
  },
  // 3. 영어I (엔이능률)
  '영어I': {
    1: {
      page: 25,
      imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p25.jpg',
      firstPointTitle: 'to부정사를 목적격 보어로 취하는 동사',
      allPoints: ['to부정사 목적격 보어', 'so ~ that ... 구문 (결과의 부사절)'],
    },
    2: {
      page: 51,
      imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p51.jpg',
      firstPointTitle: '조건 부사절의 시제 (현재시제가 미래 대용)',
      allPoints: ['조건 부사절 시제', '전치사 + 동명사 관용 표현'],
    },
    3: {
      page: 77,
      imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p77.jpg',
      firstPointTitle: '의문사 + to부정사 (명사구 역할)',
      allPoints: ['의문사 + to부정사', '관계대명사 who / that 수식절'],
    },
    4: {
      page: 103,
      imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p103.jpg',
      firstPointTitle: '접속사가 생략되지 않은 분사구문 (when asked)',
      allPoints: ['접속사가 명시된 분사구문', '대동사 구문 (do so)'],
    },
    5: {
      page: 129,
      imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p129.jpg',
      firstPointTitle: '준사역동사 help + 목적어 + (to) 동사원형',
      allPoints: ['준사역동사 help 구문', '간접화법 전환 및 ask if/whether'],
    },
  },
  // 4. 영어II (능률)
  '영어II': {
    1: {
      page: 25,
      imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p25.jpg',
      firstPointTitle: '과거완료 수동태 (had been + p.p.)',
      allPoints: ['과거완료 수동태', '주절 과거 - 목적절 대과거 시제 일치'],
    },
    2: {
      page: 51,
      imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p51.jpg',
      firstPointTitle: '전치사구/방법 강조 구문 (It is by ~ that ...)',
      allPoints: ['전치사구 방법 강조 구문', '장소·시간 부사구 강조 구문'],
    },
    3: {
      page: 77,
      imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p77.jpg',
      firstPointTitle: '복합관계대명사 (whoever / whatever)',
      allPoints: ['복합관계대명사 구문', '전치사 + 관계대명사'],
    },
    4: {
      page: 103,
      imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p103.jpg',
      firstPointTitle: '요구·제안 동사 뒤 that절의 (should) + 동원',
      allPoints: ['당위성 (should V) 구문', '당위성 vs 사실 주장 구별'],
    },
    5: {
      page: 129,
      imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p129.jpg',
      firstPointTitle: '동격의 접속사 that (the news / rumor / fact that)',
      allPoints: ['동격의 접속사 that', '전치사가 남는 관계대명사의 생략'],
    },
  },
  // 5. 영어 독해와 작문 (미래엔)
  '영어 독해와 작문': {
    1: {
      page: 26,
      imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p26.jpg',
      firstPointTitle: '원인·권유 5형식 동사 (encourage / allow + O + to-v)',
      allPoints: ['원인·권유 5형식 동사', '양보·조건 접속사 (even though, unless)'],
    },
    2: {
      page: 50,
      imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p50.jpg',
      firstPointTitle: '동격의 접속사 that (the belief / fact that)',
      allPoints: ['동격의 접속사 that', '명사 수식 분사구 (현재분사 / 과거분사)'],
    },
    3: {
      page: 74,
      imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p74.jpg',
      firstPointTitle: '현재완료 수동태 (have/has been + p.p.)',
      allPoints: ['현재완료 수동태', '동시동작·결과 분사구문'],
    },
    4: {
      page: 98,
      imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p98.jpg',
      firstPointTitle: '관계대명사의 계속적 용법 (, who / , which)',
      allPoints: ['관계대명사 계속적 용법', '강조 구문 (It is ~ that ...)'],
    },
    5: {
      page: 122,
      imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p122.jpg',
      firstPointTitle: '전치사의 목적어로 쓰인 의문사 + to부정사',
      allPoints: ['전치사 + 의문사 to부정사', '조동사 + have p.p.'],
    },
    6: {
      page: 146,
      imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p146.jpg',
      firstPointTitle: '상관접속사와 다중 병렬 구조 (either A or B)',
      allPoints: ['상관접속사와 다중 병렬 구조', '간접의문문 및 whether/if 명사절'],
    },
  },
  // 6. 세계 문화와 영어 (비상)
  '세계 문화와 영어': {
    1: {
      page: 8,
      imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p8.jpg',
      firstPointTitle: '실용 의사소통 및 상호문화 소통 표현 (World Englishes)',
      allPoints: ['World Englishes 소통 표현', '문화 간 의사소통 활동'],
    },
    2: {
      page: 6,
      imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p6.jpg',
      firstPointTitle: '탐구 보고서 작성 및 정보 시각화 프로젝트',
      allPoints: ['탐구 보고서 작성', '영문 인포그래픽 프로젝트'],
    },
  },
};

export function getPassageStartInfo(subjectName: string, unitNumber: number): PassageStartInfo | null {
  for (const key of Object.keys(PURE_PASSAGE_MAP)) {
    if (subjectName.includes(key)) {
      const unitMap = PURE_PASSAGE_MAP[key];
      if (unitMap && unitMap[unitNumber]) {
        return unitMap[unitNumber];
      }
    }
  }
  return null;
}

export function getGrammarStartInfo(subjectName: string, unitNumber: number): GrammarStartInfo | null {
  for (const key of Object.keys(GRAMMAR_START_MAP)) {
    if (subjectName.includes(key)) {
      const unitMap = GRAMMAR_START_MAP[key];
      if (unitMap && unitMap[unitNumber]) {
        return unitMap[unitNumber];
      }
    }
  }
  return null;
}
