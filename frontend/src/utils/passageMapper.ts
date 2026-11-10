// 교과서 6권 전 단원의 순수 Reading 본문 첫 페이지 정밀 매핑 테이블
export interface PassageStartInfo {
  page: number;
  imagePath: string;
  passageTitle: string;
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

