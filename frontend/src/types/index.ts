export type TabType =
  | 'recommend'   // 1. My English Future (진로 8대 분야 & 본문 추천)
  | 'mbti'        // 2. 영어 성향 MBTI (과목 매칭)
  | 'seteuk'      // 3. 세특 아이디어 발전소 (교과서 기반 탐구보고서)
  | 'passport'    // 4. 디지털 여권 & 5부스 스탬프 투어
  | 'grammar-overview' // 5. 문법 한눈에 조망 (3개년 문법 파트 첫페이지 & 매트릭스)
  | 'visual'      // 6. 3개년 성장 로드맵 (연계도 & 4대 계통도)
  | 'chat'        // 7. 의령여고 생활 Q&A (중3/학부모 추천 질문 & 챗봇)
  | 'grammar';    // 8. 교과서 미리보기 (6권 E-Book & 문법 검색)

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

export interface RecommendCandidate {
  subject: string;
  unit_number: number;
  unit_title: string;
  passage_title: string;
  grade: string;
  semester: string;
  page: number | string;
  page_label: string;
  publisher: string;
  topic: string;
  text: string;
  image_url: string;
}

export interface RecommendResponse {
  report: string;
  candidates: RecommendCandidate[];
}

