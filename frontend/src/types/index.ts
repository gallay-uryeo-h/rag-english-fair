export type TabType = 
  | 'recommend'   // 1. My English Future (진로 8대 분야 & 본문 추천)
  | 'mbti'        // 2. 영어 성향 MBTI (과목 매칭)
  | 'seteuk'      // 3. 세특 아이디어 발전소 (교과서 기반 탐구보고서)
  | 'passport'    // 4. 디지털 여권 & 5부스 스탬프 투어
  | 'visual'      // 5. 3개년 성장 로드맵 (연계도 & 4대 계통도)
  | 'chat'        // 6. 의령여고 생활 Q&A (중3/학부모 추천 질문 & 챗봇)
  | 'grammar';    // 7. 교과서 미리보기 (6권 E-Book & 문법 검색)

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  sources?: Array<{
    title: string;
    page: number;
    image_url: string;
    section: string;
  }>;
}

export interface GrammarPoint {
  point_num: number;
  title: string;
  tag: string;
  key_sentence: string;
  explanation: string;
  page: number;
  image_path: string;
}

export interface GrammarUnit {
  unit_number: number;
  unit_title: string;
  theme?: string;
  points: GrammarPoint[];
}

export interface GrammarSubject {
  subject: string;
  grade: string;
  semester: string;
  curriculum_type: string;
  publisher: string;
  summary: string;
  units: GrammarUnit[];
}

export interface GrammarRoadmapResponse {
  subjects: GrammarSubject[];
  notice: string;
}

export interface RecommendResponse {
  career: string;
  report: string;
  sources: Array<{
    title: string;
    page: number;
    image_url: string;
    unit_title: string;
    section: string;
  }>;
}
