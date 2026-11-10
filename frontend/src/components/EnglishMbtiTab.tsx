import React, { useState } from 'react';
import { Compass, Sparkles, BookOpen, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  desc: string;
  optionA: { text: string; trait: 'analysis' | 'culture' | 'expression' | 'practical' };
  optionB: { text: string; trait: 'analysis' | 'culture' | 'expression' | 'practical' };
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '영어를 공부할 때 나는 어떤 순간이 더 흥미롭나요?',
    desc: '내가 영어에 몰입하는 스타일을 선택해 보세요.',
    optionA: { text: '문장 구조와 문법 규칙을 파악해서 깔끔하게 해석될 때', trait: 'analysis' },
    optionB: { text: '외국의 다양한 문화, 최신 해외 트렌드 이야기를 접할 때', trait: 'culture' },
  },
  {
    id: 2,
    question: '영어 수업 시간에 프로젝트를 한다면?',
    desc: '더 재미있게 참여할 수 있는 활동은?',
    optionA: { text: '내 생각과 진로 관심사를 담은 영어 스피치나 카드뉴스 제작', trait: 'expression' },
    optionB: { text: '수능·모의고사 고난도 지문을 깊이 있게 분석하고 독해하기', trait: 'practical' },
  },
  {
    id: 3,
    question: '영어 단어를 외우거나 문장을 접할 때 나의 스타일은?',
    desc: '기억에 남는 학습 방식은?',
    optionA: { text: '어원(Etymology)과 숙어 구문 법칙을 체계적으로 정리하기', trait: 'analysis' },
    optionB: { text: '영화 대사나 팝송, 실제 해외 일상 표현을 통해 익히기', trait: 'culture' },
  },
  {
    id: 4,
    question: '고등학교에서 영어를 통해 가장 얻고 싶은 것은?',
    desc: '나의 최종 고교 영어 목표는?',
    optionA: { text: '자유롭게 세계인과 소통하고 나만의 진로 세특을 차별화하기', trait: 'expression' },
    optionB: { text: '흔들리지 않는 내신 1등급과 수능 1등급의 실전 경쟁력', trait: 'practical' },
  },
];

interface ResultType {
  title: string;
  subTitle: string;
  badge: string;
  desc: string;
  bestSubjects: string[];
  stationLink: string;
  tips: string;
}

const RESULTS: Record<string, ResultType> = {
  analysis: {
    title: '정교한 논리 마스터형 🔍',
    subTitle: 'Analytical Thinker',
    badge: '논리 분석가',
    desc: '복잡한 문장 구조도 수학 공식처럼 명쾌하게 분석해내는 능력을 지녔습니다. 고난도 어법과 수능 빈출 구문에 특히 강점을 보일 잠재력이 뛰어납니다.',
    bestSubjects: ['공통영어1·2', '영어I·II (2학년)', '영어 독해와 작문 (3학년)'],
    stationLink: '부스 3번 (Mystery Box - 영어 단서 추리하기)와 찰떡궁합!',
    tips: '의령여고 2학년 영어II의 도치 구문과 혼합가정법을 정복하면 모의고사 1등급은 기본입니다!',
  },
  culture: {
    title: '글로벌 문화 탐험가형 🌍',
    subTitle: 'Global Explorer',
    badge: '세계문화 탐험가',
    desc: '언어를 단순 시험용이 아닌 살아있는 세계 문화와 소통의 도구로 바라보는 열린 시야를 가졌습니다. 배경지식이 풍부해 긴 지문도 흥미롭게 읽어냅니다.',
    bestSubjects: ['세계 문화와 영어 (3학년 진로선택)', '공통영어1 (문화 파트)'],
    stationLink: '부스 2번 (World Culture Passport - 세계 생활문화 탐험)의 주인공!',
    tips: '의령여고 3학년 <세계 문화와 영어>에서 다양한 글로벌 에티켓과 다문화 관용표현을 탐구해보세요.',
  },
  expression: {
    title: '창의적 글로벌 스토리텔러형 🎨',
    subTitle: 'Creative Communicator',
    badge: '표현 & 전달자',
    desc: '자신의 생각과 진로 꿈을 영어로 멋지게 표현하고 다른 사람과 나누는 것을 좋아합니다. 학생부 세특과 수행평가에서 독보적인 창의성을 발휘합니다.',
    bestSubjects: ['영어 독해와 작문 (3학년)', '공통영어2 (프로젝트 수업)'],
    stationLink: '부스 4번 (This or That? - 영어로 생각 표현하기)에서 재능 발휘!',
    tips: '수행평가 에세이 및 영어 발표 활동에서 본인 진로와 엮은 독창적인 세특을 만들 수 있습니다.',
  },
  practical: {
    title: '실전 성과 마스터형 🎯',
    subTitle: 'Strategic Achiever',
    badge: '실전 전략가',
    desc: '목표 지향적이며 효율적인 학습을 선호합니다. 핵심 어휘와 시간 단축 독해 스킬을 빠르게 체득하여 내신과 수능 모두에서 가장 안정적인 결과를 만듭니다.',
    bestSubjects: ['공통영어1·2 (내신 기본)', '영어I·II', '영어 독해와 작문'],
    stationLink: '부스 1번 (Emoji Challenge) & 5번 (My English Future) 필수 코스!',
    tips: '1학년 때부터 의령여고 3개년 교과서의 50대 핵심 문법을 선점하면 고교 영어는 걱정 없습니다.',
  },
};

export const EnglishMbtiTab: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    analysis: 0,
    culture: 0,
    expression: 0,
    practical: 0,
  });
  const [finalResult, setFinalResult] = useState<ResultType | null>(null);

  const handleSelect = (trait: 'analysis' | 'culture' | 'expression' | 'practical') => {
    const newScores = { ...scores, [trait]: scores[trait] + 1 };
    setScores(newScores);

    if (currentStep + 1 < QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // 결과 산출
      let bestTrait: 'analysis' | 'culture' | 'expression' | 'practical' = 'practical';
      let maxScore = -1;
      (Object.keys(newScores) as Array<'analysis' | 'culture' | 'expression' | 'practical'>).forEach((key) => {
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
    setScores({ analysis: 0, culture: 0, expression: 0, practical: 0 });
    setFinalResult(null);
  };

  const q = QUESTIONS[currentStep];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl p-4 md:p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 w-fit px-2.5 py-1 rounded-full mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>English Type Finder</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1">
          나의 영어 학습 성향 & 의령여고 추천 과목 진단 🧪
        </h2>
        <p className="text-xs md:text-sm text-teal-100 leading-relaxed">
          4문항으로 알아보는 나의 고교 영어 DNA! 내 스타일에 딱 맞는 의령여고 선택과목을 추천해 드립니다.
        </p>
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
              <span>진단 결과: {finalResult.badge}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">
              {finalResult.title}
            </h3>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{finalResult.subTitle}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs md:text-sm text-slate-700 leading-relaxed">
            {finalResult.desc}
          </div>

          {/* 의령여고 추천 과목 */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>나에게 딱 맞는 의령여고 추천 과목</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {finalResult.bestSubjects.map((subj, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>

          {/* 박람회 부스 연계 안내 */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <span>✈️ English Passport 부스 추천 팁:</span>
            </div>
            <div>{finalResult.stationLink}</div>
          </div>

          {/* 의령여고 영어과 선생님 조언 */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold text-blue-800">🎓 의령여고 선생님의 맞춤 조언:</div>
            <div>{finalResult.tips}</div>
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
