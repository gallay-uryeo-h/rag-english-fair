export type TabType = 'recommend' | 'visual' | 'chat' | 'grammar';

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
