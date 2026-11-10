import React, { useState } from 'react';
import { Compass, Sparkles, BookOpen, RotateCcw, Info, ExternalLink } from 'lucide-react';

interface Props {
  onOpenImage: (title: string, url: string) => void;
}

interface Question {
  id: number;
  question: string;
  desc: string;
  optionA: { text: string; trait: 'story' | 'science' | 'culture' | 'insight' };
  optionB: { text: string; trait: 'story' | 'science' | 'culture' | 'insight' };
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '영어 지문을 읽을 때 내가 더 몰입하게 되는 이야기는?',
    desc: '어떤 유형의 글을 읽을 때 호기심이 생기나요?',
    optionA: { text: '인물의 감동적인 성장 스토리나 일상 속 따뜻한 경험담', trait: 'story' },
    optionB: { text: '최신 과학 기술의 발전, 환경 보호, 자연의 놀라운 비밀', trait: 'science' },
  },
  {
    id: 2,
    question: '내가 흥미를 느끼는 탐구 주제는?',
    desc: '글을 읽고 더 깊이 파고들고 싶은 분야는?',
    optionA: { text: '세계 여러 나라 사람들의 독특한 생활 풍습과 축제, 음식 문화', trait: 'culture' },
    optionB: { text: '우리가 미처 몰랐던 인간의 심리, 행동의 비밀과 철학적 질문', trait: 'insight' },
  },
  {
    id: 3,
    question: '영어 독해 수업에서 친구들과 토론해보고 싶은 내용은?',
    desc: '나의 관심사를 이끄는 키워드는?',
    optionA: { text: '어려운 역경을 극복한 예술가나 운동선수의 열정과 도전 정신', trait: 'story' },
    optionB: { text: '기후 위기 극복을 위한 친환경 발명품과 미래 테크놀로지', trait: 'science' },
  },
  {
    id: 4,
    question: '영어 시간에 에세이를 쓴다면 어떤 주제를 쓰고 싶나요?',
    desc: '나만의 생각을 담아보고 싶은 글의 성격은?',
    optionA: { text: '다양성을 존중하는 글로벌 시민 의식과 세계 문화 교류', trait: 'culture' },
    optionB: { text: '현대 사회의 문제점(SNS 피로도, 올바른 소비 습관)에 대한 통찰', trait: 'insight' },
  },
];

interface MatchedPassage {
  subject: string;
  unit: string;
  title: string;
  summary: string;
  page: number;
  imagePath: string;
}

interface ResultType {
  title: string;
  subTitle: string;
  badge: string;
  desc: string;
  passages: MatchedPassage[];
  readingTip: string;
}

const RESULTS: Record<string, ResultType> = {
  story: {
    title: '따뜻한 감동과 스토리텔러형 📖',
    subTitle: 'Empathetic Storyteller',
    badge: '휴먼 & 스토리',
    desc: '사람들의 감정과 삶의 여정, 따뜻한 성장 이야기에 깊이 공감하는 능력을 지녔습니다. 생생한 묘사와 대화가 담긴 내러티브 지문을 읽을 때 가장 빠른 독해 속도와 높은 이해도를 보여줍니다.',
    passages: [
      {
        subject: '공통영어1',
        unit: 'Lesson 1',
        title: 'New School, New Start',
        summary: '새로운 고등학교 생활을 시작하는 주인공의 두근거림과 우정, 도전 이야기',
        page: 14,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p14.jpg',
      },
      {
        subject: '영어II',
        unit: 'Lesson 3',
        title: 'Music That Touched the World',
        summary: '음악을 통해 사람들의 마음에 위로를 건넨 예술가의 감동 실화',
        page: 54,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p54.jpg',
      },
    ],
    readingTip: '등장인물의 감정 변화를 나타내는 형용사와 부사를 정리하며 읽으면 어휘력과 서술형 실력이 쑥쑥 늘어납니다.',
  },
  science: {
    title: '미래 과학과 테크 탐구형 🔬',
    subTitle: 'Future Science Explorer',
    badge: '과학 & 미래기술',
    desc: '논리적인 인과관계와 최신 기술, 자연과학적 원리를 설명하는 글에서 흥미를 크게 느낍니다. 도표와 객관적 근거가 포함된 설명문과 논설문을 명쾌하게 분석해내는 능력이 뛰어납니다.',
    passages: [
      {
        subject: '공통영어2',
        unit: 'Lesson 2',
        title: 'Nature-Inspired Inventions',
        summary: '자연의 동식물에게서 영감을 얻어 탄생한 놀라운 생체 모방 과학 기술',
        page: 36,
        imagePath: 'pages_cache/1학년_2학기_공통영어2_미래엔_p36.jpg',
      },
      {
        subject: '영어I',
        unit: 'Lesson 4',
        title: 'Smart Technologies Changing Our Lives',
        summary: '인공지능과 사물인터넷(IoT)이 바꾸어 놓을 스마트 미래 사회의 모습',
        page: 78,
        imagePath: 'pages_cache/2학년_1학기_영어Ⅰ_엔이능률_p78.jpg',
      },
    ],
    readingTip: '‘원인과 결과(Cause & Effect)’ 연결사(Therefore, However, As a result)를 중심으로 문맥의 흐름을 짚어보세요.',
  },
  culture: {
    title: '글로벌 문화 탐험가형 🌍',
    subTitle: 'Global Culture Explorer',
    badge: '세계문화 & 소통',
    desc: '다양한 나라의 역사, 축제, 음식, 의사소통 방식에 대한 열린 호기심을 가지고 있습니다. 문화적 배경지식이 풍부하여 낯선 어휘가 나와도 글의 전체적인 맥락을 센스 있게 유추해냅니다.',
    passages: [
      {
        subject: '세계 문화와 영어',
        unit: 'Unit 1',
        title: 'Table Manners Around the Globe',
        summary: '대륙별·국가별로 서로 다른 독특하고 흥미로운 식사 예절과 식문화 이야기',
        page: 18,
        imagePath: 'pages_cache/3학년_1학기_세계_문화와_영어_비상_p18.jpg',
      },
      {
        subject: '공통영어1',
        unit: 'Lesson 4',
        title: 'Festivals That Color the World',
        summary: '세계 곳곳의 이색적인 축제와 그 속에 담긴 공동체의 역사적 의미',
        page: 76,
        imagePath: 'pages_cache/1학년_1학기_공통영어1_미래엔_p76.jpg',
      },
    ],
    readingTip: '각 문화권의 독특한 관용 표현(Idiom)을 우리말 문화와 비교하며 읽어보면 흥미와 성적이 동시에 올라갑니다.',
  },
  insight: {
    title: '깊이 있는 통찰과 인문 사색형 💡',
    subTitle: 'Insightful Thinker',
    badge: '심리 & 인문통찰',
    desc: '우리가 일상에서 무심코 지나치는 인간 행동의 심리적 법칙, 사회적 현상의 이면을 분석하는 깊이 있는 글에 매력을 느낍니다. 수능 고난도 빈칸 추론이나 주제 파악에 강한 잠재력을 지녔습니다.',
    passages: [
      {
        subject: '영어 독해와 작문',
        unit: 'Lesson 2',
        title: 'The Psychology of Decision Making',
        summary: '우리가 일상에서 비합리적인 결정을 내리는 이유와 뇌의 인지적 오류 탐구',
        page: 42,
        imagePath: 'pages_cache/2학년_2학기_영어독해와작문_미래엔_p42.jpg',
      },
      {
        subject: '영어II',
        unit: 'Lesson 1',
        title: 'The Power of Habit',
        summary: '작은 습관이 뇌 신경망을 재구성하여 삶의 커다란 변화를 만들어내는 과정',
        page: 16,
        imagePath: 'pages_cache/3학년_1학기_영어Ⅱ_능률_p16.jpg',
      },
    ],
    readingTip: '각 문단의 중심 문장(Topic Sentence)을 찾아 밑줄을 긋고, 글쓴이의 숨겨진 핵심 의도를 파악하는 훈련이 잘 맞습니다.',
  },
};

export const EnglishMbtiTab: React.FC<Props> = ({ onOpenImage }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    story: 0,
    science: 0,
    culture: 0,
    insight: 0,
  });
  const [finalResult, setFinalResult] = useState<ResultType | null>(null);

  const handleSelect = (trait: 'story' | 'science' | 'culture' | 'insight') => {
    const newScores = { ...scores, [trait]: scores[trait] + 1 };
    setScores(newScores);

    if (currentStep + 1 < QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      let bestTrait: 'story' | 'science' | 'culture' | 'insight' = 'story';
      let maxScore = -1;
      (Object.keys(newScores) as Array<'story' | 'science' | 'culture' | 'insight'>).forEach((key) => {
        if (newScores[key] > maxScore) {
          maxScore = newScores[key];
          bestTrait = key;
        }
      });
      setFinalResult(RESULTS[bestTrait]);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setScores({ story: 0, science: 0, culture: 0, insight: 0 });
    setFinalResult(null);
  };

  const q = QUESTIONS[currentStep];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white rounded-2xl p-4 md:p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 w-fit px-2.5 py-1 rounded-full mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>My Textbook Passage Match</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1">
          나의 독해 성향 & 의령여고 맞춤 본문 지문 찾기 🧪
        </h2>
        <p className="text-xs md:text-sm text-teal-100 leading-relaxed">
          4문항으로 알아보는 나의 독해 취향! 의령여고 3개년 교과서 속에서 나에게 가장 흥미로울 본문 지문을 매칭해 드립니다.
        </p>
      </div>

      {/* 사용자 지정 필수 안내 문구 */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          단순 설문으로 파악한 성향 분석이므로 실제 수업 내용이나 본인의 개인별 흥미와는 차이가 있을 수 있습니다. 재미있는 참고용으로 활용해 주세요! 😊
        </span>
      </div>

      {!finalResult ? (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
          {/* 진행도 */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>질문 {currentStep + 1} / {QUESTIONS.length}</span>
            <span className="text-emerald-600 font-bold">{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% 완료</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* 질문 본문 */}
          <div className="space-y-1.5 py-2">
            <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">
              {q.question}
            </h3>
            <p className="text-xs text-slate-400">{q.desc}</p>
          </div>

          {/* 선택지 2개 */}
          <div className="space-y-3">
            <button
              onClick={() => handleSelect(q.optionA.trait)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group space-y-1"
            >
              <div className="text-xs font-bold text-emerald-600">A 선택지</div>
              <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900 leading-relaxed">
                {q.optionA.text}
              </div>
            </button>

            <button
              onClick={() => handleSelect(q.optionB.trait)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group space-y-1"
            >
              <div className="text-xs font-bold text-emerald-600">B 선택지</div>
              <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900 leading-relaxed">
                {q.optionB.text}
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* 결과 화면 */
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
          <div className="text-center space-y-2 border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>독해 스타일: {finalResult.badge}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">
              {finalResult.title}
            </h3>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{finalResult.subTitle}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs md:text-sm text-slate-700 leading-relaxed">
            {finalResult.desc}
          </div>

          {/* 나에게 찰떡궁합인 의령여고 교과서 본문 지문 */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>나에게 찰떡궁합인 의령여고 교과서 본문 지문 (원문 확인)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {finalResult.passages.map((ps, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/20 transition-all space-y-2 group shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                          {ps.subject}
                        </span>
                        <span className="text-[11px] text-slate-400">{ps.unit}</span>
                      </div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 mt-1 line-clamp-1">
                        {ps.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {ps.summary}
                  </p>

                  <button
                    onClick={() => onOpenImage(`${ps.subject} ${ps.unit} · p.${ps.page} (${ps.title})`, `/${ps.imagePath}`)}
                    className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>교과서 본문 원본 보기 (p.{ps.page})</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 맞춤 독해 학습 꿀팁 */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold text-blue-800">💡 의령여고 선생님의 맞춤 독해 TIP:</div>
            <div className="leading-relaxed">{finalResult.readingTip}</div>
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>테스트 다시 해보기</span>
          </button>
        </div>
      )}
    </div>
  );
};
