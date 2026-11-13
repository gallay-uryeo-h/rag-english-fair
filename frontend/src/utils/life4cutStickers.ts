/**
 * life4cutStickers.ts
 *
 * 2026 의령여고 고교학점제 박람회 — 인생네컷 스티커 문구 자동 추천
 * 참여자 활동 데이터(MBTI, 진로, 태그)를 기반으로 'Carpe Diem' 스타일의
 * 짧은 문구(1~2단어, 약 10자 이내) 개인화 스티커 목록을 반환합니다.
 */

export interface UserActivity {
  username: string;
  displayName?: string;
  mbti?: string;           // 예: "ENFP", "INTJ"
  careerField?: string;    // 예: "의료·보건", "AI·데이터", "교육·상담"
  favoriteCourse?: string; // 예: "영어권문화", "진로영어"
  lastTag?: string;        // 예: "#대학진학전략"
  feedCount?: number;      // 작성 피드 수
  updatedAt?: unknown;
}

// ── 1. MBTI별 짧은 스티커 문구 (1~2단어) ──────────────────────────────────────
export const MBTI_STICKERS: Record<string, string[]> = {
  ENFP: ['Dreamer ✨', 'Sparkle', 'Free Spirit'],
  INFP: ['Poet 🌸', 'Soft Heart', 'Daydream'],
  ENTP: ['Visionary', 'Game Changer', 'Spark 💡'],
  INTP: ['Thinker 🔭', 'Deep Logic', 'Curious'],
  ESFP: ['Spotlight 🎤', 'Good Vibes', 'Pop Star'],
  ISFP: ['Artist 🎨', 'Stay Pure', 'Chillin'],
  ESTP: ['Action! 🏄', 'Fearless', 'Top Tier'],
  ISTP: ['Ace 🛠️', 'Cool Head', 'Fixer'],
  ENFJ: ['Protagonist', 'Bright Voice', 'Shine On'],
  INFJ: ['Insight 🔮', 'Pure Soul', 'Warm Mind'],
  ENTJ: ['Boss Mode', 'Commander', 'Leading 🚀'],
  INTJ: ['Mastermind', 'Focus On 🎯', 'Deep Mind'],
  ESFJ: ['Sweetie 🍭', 'Warm Heart', 'Bestie'],
  ISFJ: ['Guardian 🛡️', 'Gentle', 'Faithful'],
  ESTJ: ['Power Up', 'On Time ⏱️', 'Solid'],
  ISTJ: ['Classic 🏆', 'Perfection', 'True Blue'],
};

// ── 2. 진로 분야별 짧은 스티커 문구 (1~2단어) ──────────────────────────────────
export const CAREER_STICKERS: Record<string, string[]> = {
  '의료': ['Healer 💊', 'Cure', 'Dr. Future'],
  '보건': ['Healer 💊', 'Cure', 'Care Plus'],
  '간호': ['Angel 💊', 'Warm Hands', 'Cure'],
  '미디어': ['On Air 🎬', 'Scene #1', 'Creator'],
  '예술': ['On Air 🎬', 'Spotlight', 'Story'],
  '디자인': ['Artistic 🎨', 'Muse', 'Masterpiece'],
  '공예': ['Design It', 'Color Palette', 'Craft'],
  'IT': ['Next Gen 💻', 'Code Clean', 'Future AI'],
  '공학': ['Engineer 🔧', 'Build Up', 'Tech Nova'],
  'AI': ['Future AI 🤖', 'Deep Tech', 'Algorithm'],
  '데이터': ['Future AI 🤖', 'Deep Tech', 'Algorithm'],
  '교육': ['Inspire 🌟', 'Mentor', 'Bright Mind'],
  '교사': ['Inspire 🌟', 'Leading Mind', 'Mentor'],
  '경영': ['Global Mind 🌐', 'Top Pick', 'CEO Mode'],
  '경제': ['Market Maker', 'Insight', 'Value Up'],
  '외교': ['Passport 🌍', 'Diplomat', 'World Wide'],
  '언어': ['Fluent 🗣️', 'Global Voice', 'Polyglot'],
  '사회': ['Justice ⚖️', 'Change Maker', 'Voice'],
  '인문': ['Think Deep', 'Heritage', 'Wordsmith'],
};

// ── 3. 활동 무관 기본 스티커(기본 출력) ────────────────────────────────────────
export const DEFAULT_STICKERS = [
  'Carpe Diem',
  'Glow Up ✨',
  'Level Up 🚀',
  'Stay Wild',
  'My Future 🌟',
  'Uryeo 2026',
];

/**
 * 활동 데이터를 기반으로 추천할 최대 6개의 짧은 스티커 문구 목록을 반환합니다.
 */
export function getRecommendedStickers(activity?: Partial<UserActivity> | null): string[] {
  const result: string[] = [];

  if (activity) {
    // 1. MBTI 기반 스티커 추가
    if (activity.mbti) {
      const upper = activity.mbti.trim().toUpperCase();
      const mbtiList = MBTI_STICKERS[upper];
      if (mbtiList && mbtiList.length > 0) {
        result.push(mbtiList[0]);
        if (mbtiList[1]) result.push(mbtiList[1]);
      }
    }

    // 2. 진로 기반 스티커 추가
    if (activity.careerField) {
      const field = activity.careerField;
      for (const [key, stickers] of Object.entries(CAREER_STICKERS)) {
        if (field.includes(key)) {
          if (stickers[0] && !result.includes(stickers[0])) {
            result.push(stickers[0]);
          }
          break;
        }
      }
    }

    // 3. 피드 작성자에게 스티커 추가
    if (activity.feedCount && activity.feedCount > 0) {
      result.push('Best Cut 📸');
    }
  }

  // 부족한 경우 기본 스티커로 채워 최대 6개
  for (const s of DEFAULT_STICKERS) {
    if (!result.includes(s)) {
      result.push(s);
    }
    if (result.length >= 6) break;
  }

  return result.slice(0, 6);
}

