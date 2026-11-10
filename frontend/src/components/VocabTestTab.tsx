import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Trophy
} from 'lucide-react';

interface VocabQuestion {
  id: number;
  word: string;
  pronunciation?: string;
  contextSentence: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip: string;
}

interface TextbookVocabQuiz {
  subjectKey: string;
  title: string;
  grade: string;
  semester: string;
  difficulty: '기초 (고1 입문)' | '기본 (고1 심화)' | '실전 (고2 일반)' | '고급 (고2·3 심화)' | '수능 완성 (고3)' | '실용 글로벌 (진로)';
  color: string;
  description: string;
  questions: VocabQuestion[];
}

const VOCAB_QUIZ_DATA: TextbookVocabQuiz[] = [
  {
    subjectKey: '공통영어1',
    title: '공통영어1',
    grade: '1학년 1학기',
    semester: '미래엔',
    difficulty: '기초 (고1 입문)',
    color: 'from-blue-600 to-indigo-600',
    description: '고등학교에 첫발을 디딘 학생들을 위한 중·고교 필수 핵심 어휘 테스트입니다.',
    questions: [
      {
        id: 1,
        word: 'encounter',
        contextSentence: 'Media literacy is the ability to critically assess perspectives we encounter.',
        options: ['(우연히) 마주치다, 접하다', '포기하다, 그만두다', '축하하다, 기념하다'],
        correctIndex: 0,
        explanation: "'encounter'는 예상치 못하게 마주치거나 접할 때 쓰는 고1 핵심 빈출 동사입니다.",
        tip: 'Unit 1 본문 수록 어휘',
      },
      {
        id: 2,
        word: 'pretend',
        contextSentence: 'He is surprised at how easy it is to pretend to be something else.',
        options: ['기억해 내다', '~인 체하다, 가장하다', '불평하다'],
        correctIndex: 1,
        explanation: "'pretend'는 사실이 아닌 것을 사실인 것처럼 꾸며 행동할 때 씁니다.",
        tip: 'Unit 2 본문 수록 어휘',
      },
      {
        id: 3,
        word: 'pollutant',
        contextSentence: 'This electric car produces fewer pollutants than a gasoline-fueled one.',
        options: ['오염 물질', '보호 장비', '화석 연료'],
        correctIndex: 0,
        explanation: "'pollute(오염시키다)'의 명사형으로 환경 분야 지문에서 빠지지 않는 단어입니다.",
        tip: 'Unit 4 본문 수록 어휘',
      },
      {
        id: 4,
        word: 'inspire',
        contextSentence: 'The athlete has inspired other young players around the world.',
        options: ['영감을 주다, 고무하다', '방해하다, 가로막다', '비판하다, 지적하다'],
        correctIndex: 0,
        explanation: "'inspire'는 다른 사람에게 깊은 영감이나 의욕을 불어넣을 때 사용하는 단어입니다.",
        tip: 'Unit 1 본문 수록 어휘',
      },
      {
        id: 5,
        word: 'sustainable',
        contextSentence: 'We need to create a sustainable future for our environment.',
        options: ['일시적인, 순간의', '지속 가능한', '예측 불가능한'],
        correctIndex: 1,
        explanation: "'sustain(유지하다)' + '-able(~할 수 있는)'의 결합으로 생태·환경 분야 필수 단어입니다.",
        tip: 'Unit 4 본문 수록 어휘',
      },
    ],
  },
  {
    subjectKey: '공통영어2',
    title: '공통영어2',
    grade: '1학년 2학기',
    semester: '미래엔',
    difficulty: '기본 (고1 심화)',
    color: 'from-cyan-600 to-blue-600',
    description: '디지털 소비 윤리, 동물 복지, AI 기술 등 1학년 2학기 교과서 속 심화 어휘를 점검합니다.',
    questions: [
      {
        id: 1,
        word: 'manipulate',
        contextSentence: 'Dark patterns are sneaky tricks in websites designed to manipulate users.',
        options: ['조작하다, 교묘하게 다루다', '보호하다, 지키다', '칭찬하다, 격려하다'],
        correctIndex: 0,
        explanation: "'manipulate'는 사용자의 심리를 교묘히 유도하거나 기계를 능숙하게 조작할 때 쓰입니다.",
        tip: 'Unit 2 다크패턴 본문 수록 어휘',
      },
      {
        id: 2,
        word: 'neural',
        contextSentence: 'Will AI-powered neural implants turn us into super-humans?',
        options: ['신경의, 신경계의', '중립적인', '도덕적인'],
        correctIndex: 0,
        explanation: "'nerve(신경)'의 형용사형으로 뇌과학과 인공지능 지문에 자주 등장합니다.",
        tip: 'Unit 4 AI 신경망 본문 수록 어휘',
      },
      {
        id: 3,
        word: 'rescue',
        contextSentence: 'Volunteers worked hard to rescue injured elephants in Thailand.',
        options: ['구조하다, 구출하다', '조사하다, 탐문하다', '길들이다, 훈련하다'],
        correctIndex: 0,
        explanation: "'rescue'는 위험에 처한 동물이나 사람을 구해낼 때 쓰는 기본 필수 동사입니다.",
        tip: 'Unit 1 동물 보호 본문 수록 어휘',
      },
      {
        id: 4,
        word: 'deceptive',
        contextSentence: 'Consumers should be aware of deceptive design patterns when shopping online.',
        options: ['기만적인, 현혹하는', '창의적인, 독창적인', '투명한, 솔직한'],
        correctIndex: 0,
        explanation: "'deceive(속이다)'의 파생어로 소비자를 속이는 행위를 표현할 때 널리 쓰입니다.",
        tip: 'Unit 2 다크패턴 본문 수록 어휘',
      },
      {
        id: 5,
        word: 'coexist',
        contextSentence: 'Humans must learn how to coexist peacefully with wild animals.',
        options: ['경쟁하다, 다투다', '공존하다, 함께 살아가다', '지배하다, 다스리다'],
        correctIndex: 1,
        explanation: "'co-(함께)' + 'exist(존재하다)'로 자연과 인간의 공존을 다루는 핵심 어휘입니다.",
        tip: 'Unit 1 본문 수록 어휘',
      },
    ],
  },
  {
    subjectKey: '영어Ⅰ',
    title: '영어Ⅰ',
    grade: '2학년 1학기',
    semester: '엔이능률',
    difficulty: '실전 (고2 일반)',
    color: 'from-emerald-600 to-teal-600',
    description: '수능 모의고사 2~3등급의 관문이 되는 2학년 대표 필수 학술·실화 어휘를 평가합니다.',
    questions: [
      {
        id: 1,
        word: 'intergenerational',
        contextSentence: 'Humanitas is an innovative intergenerational living project in the Netherlands.',
        options: ['세대 간의, 세대를 아우르는', '국제적인, 다국적의', '내면적인, 정신적인'],
        correctIndex: 0,
        explanation: "'inter-(사이)' + 'generation(세대)' + '-al'로 세대 간 화합을 다루는 고난도 어휘입니다.",
        tip: 'Unit 3 세대 공존 주거 본문 수록 어휘',
      },
      {
        id: 2,
        word: 'refugee',
        contextSentence: 'Yusra Mardini competed at the Olympics as a member of the Refugee Team.',
        options: ['외교관', '난민, 망명자', '후원자, 기부자'],
        correctIndex: 1,
        explanation: "'refuge(피난처)'에서 유래한 단어로 시리아 난민 출신 수영선수의 실화 지문에 등장합니다.",
        tip: 'Unit 5 유스라 마르디니 본문 수록 어휘',
      },
      {
        id: 3,
        word: 'edible',
        contextSentence: 'The artist creates extraordinary portraits using only edible food items.',
        options: ['먹을 수 있는, 식용의', '값비싼, 사치스러운', '썩기 쉬운, 부패하는'],
        correctIndex: 0,
        explanation: "'eat'과 어원이 같으며 음식을 예술 재료로 쓰는 푸드 아트 본문에 등장합니다.",
        tip: 'Unit 4 푸드 아트 본문 수록 어휘',
      },
      {
        id: 4,
        word: 'cognitive',
        contextSentence: 'Crows possess remarkable cognitive abilities for solving complex puzzles.',
        options: ['인지적인, 인식의', '육체적인, 신체의', '원시적인, 미개의'],
        correctIndex: 0,
        explanation: "'cognition(인지)'의 형용사형으로 동물의 지능 및 심리학 수능 단골 어휘입니다.",
        tip: 'Unit 2 동물 지능 본문 수록 어휘',
      },
      {
        id: 5,
        word: 'persevere',
        contextSentence: 'Athletes who persevere through hardships can achieve great accomplishments.',
        options: ['포기하다, 물러서다', '인내하다, 끈기 있게 계속하다', '의심하다, 주저하다'],
        correctIndex: 1,
        explanation: "'persevere'는 고난에도 굴하지 않고 끈기 있게 버텨 나가는 역경 극복 핵심 동사입니다.",
        tip: 'Unit 5 도전과 인권 본문 수록 어휘',
      },
    ],
  },
  {
    subjectKey: '영어 독해와 작문',
    title: '영어독해와작문',
    grade: '2학년 2학기',
    semester: '미래엔',
    difficulty: '고급 (고2·3 심화)',
    color: 'from-amber-600 to-orange-600',
    description: '행동경제학, 천문학적 미술 감정, 인공지능 로봇 철학 등 수능 고난도 비문학 어휘입니다.',
    questions: [
      {
        id: 1,
        word: 'decoy',
        contextSentence: 'A decoy option is introduced to make another choice look more attractive.',
        options: ['미끼, 유인물', '결함, 하자', '보상, 혜택'],
        correctIndex: 0,
        explanation: "'decoy'는 사냥에서 미끼 새를 뜻하던 단어로, 행동경제학의 '미끼 효과' 핵심 개념입니다.",
        tip: 'Unit 3 미끼 효과 본문 수록 어휘',
      },
      {
        id: 2,
        word: 'astronomy',
        contextSentence: 'How astronomy solved an art mystery regarding Claude Monet’s painting.',
        options: ['점성술', '천문학', '지질학'],
        correctIndex: 1,
        explanation: "'astro-(별)' + 'nomy(학문)'로 모네 명화의 비밀을 밝혀낸 융합 지문에 등장합니다.",
        tip: 'Unit 4 모네 명화 미스터리 본문 수록 어휘',
      },
      {
        id: 3,
        word: 'spiral',
        contextSentence: 'The Diderot Effect causes an endless spiral of consumption and purchases.',
        options: ['소용돌이, 급격한 나선형 상승/하강', '정체, 멈춤', '절약, 검소'],
        correctIndex: 0,
        explanation: "'spiral'은 꼬리에 꼬리를 무는 과소비의 나선형 굴레를 묘사할 때 사용됩니다.",
        tip: 'Unit 5 디드로 효과 본문 수록 어휘',
      },
      {
        id: 4,
        word: 'upcycling',
        contextSentence: 'Upcycling transforms discarded materials into higher-value products.',
        options: ['단순 소각', '새활용(가치를 더한 재활용)', '자연 분해'],
        correctIndex: 1,
        explanation: "'upgrade'와 'recycling'의 합성어로 친환경 디자인의 핵심 키워드입니다.",
        tip: 'Unit 2 환경과 자원순환 수록 어휘',
      },
      {
        id: 5,
        word: 'sentient',
        contextSentence: 'Will artificial intelligence ever become sentient like human beings?',
        options: ['느각·지각 능력이 있는', '오류가 없는, 완벽한', '통제 가능한'],
        correctIndex: 0,
        explanation: "'sentient'는 단순 연산을 넘어 감정과 자의식을 지닌 상태를 뜻하는 고급 철학·SF 어휘입니다.",
        tip: 'Unit 6 클라라와 태양 본문 수록 어휘',
      },
    ],
  },
  {
    subjectKey: '영어Ⅱ',
    title: '영어Ⅱ',
    grade: '3학년 1학기',
    semester: '능률',
    difficulty: '수능 완성 (고3)',
    color: 'from-purple-600 to-violet-600',
    description: '백신 개발 의학사, 시민 천문학, 고고학적 과학 검증 등 대학 전공 수준의 수능 완성 어휘입니다.',
    questions: [
      {
        id: 1,
        word: 'vaccine',
        contextSentence: 'They dedicated their entire lives to developing a pertussis vaccine.',
        options: ['백신, 예방 접종약', '항생제', '소독제'],
        correctIndex: 0,
        explanation: "'vaccine'은 질병 예방의 핵심 약물로 백일해를 극복한 여성 과학자 실화에 등장합니다.",
        tip: 'Unit 1 백일해 백신 본문 수록 어휘',
      },
      {
        id: 2,
        word: 'classify',
        contextSentence: 'Volunteers helped classify millions of distant galaxy images on Galaxy Zoo.',
        options: ['분류하다, 구분하다', '삭제하다, 없애다', '확대하다'],
        correctIndex: 0,
        explanation: "'class(등급, 분류)'에서 파생된 동사로 데이터 과학 및 시민 과학 필수 어휘입니다.",
        tip: 'Unit 2 은하 분류 시민과학 본문 수록 어휘',
      },
      {
        id: 3,
        word: 'pigment',
        contextSentence: 'Ultraviolet light revealed microscopic traces of colorful pigment on ancient statues.',
        options: ['안료, 색소', '균열, 틈새', '조각 도구'],
        correctIndex: 0,
        explanation: "'pigment'는 물감이나 조각상의 색채를 나타내는 고고학 및 미술 보존과학 어휘입니다.",
        tip: 'Unit 5 고대 조각상의 진실 본문 수록 어휘',
      },
      {
        id: 4,
        word: 'e-waste',
        contextSentence: 'Discarded electronic equipment creates tons of hazardous e-waste annually.',
        options: ['전자 폐기물', '온라인 쇼핑', '가상 화폐'],
        correctIndex: 0,
        explanation: "'electronic waste'의 줄임말로 스마트폰 등 첨단 기기 폐기물 문제를 다룹니다.",
        tip: 'Unit 4 전자 폐기물 본문 수록 어휘',
      },
      {
        id: 5,
        word: 'ballot',
        contextSentence: 'Alternative voting systems require voters to rank candidates on the ballot.',
        options: ['투표용지, 투표', '당선 증서', '의회 의사당'],
        correctIndex: 0,
        explanation: "'ballot'은 비밀 투표용지를 뜻하며 민주주의 선거 제도 지문에 자주 나옵니다.",
        tip: 'Unit 3 투표의 원리 본문 수록 어휘',
      },
    ],
  },
  {
    subjectKey: '세계 문화와 영어',
    title: '세계 문화와 영어',
    grade: '3학년 1학기',
    semester: '비상',
    difficulty: '실용 글로벌 (진로)',
    color: 'from-rose-600 to-pink-600',
    description: '6개 대륙의 문화, 글로벌 스타트업, 워킹홀리데이, 축제 등 생생한 실용 영어 어휘입니다.',
    questions: [
      {
        id: 1,
        word: 'hospitality',
        contextSentence: 'Central Asian people are renowned for their warm and generous hospitality.',
        options: ['환대, 친절한 대접', '적대감, 반감', '호기심, 궁금증'],
        correctIndex: 0,
        explanation: "'hospitality'는 손님을 따뜻하게 맞아 대접하는 문화적 미덕을 뜻하는 단어입니다.",
        tip: 'Lesson 1 중앙아시아 문화 본문 수록 어휘',
      },
      {
        id: 2,
        word: 'graffiti',
        contextSentence: 'In Latin America, graffiti has evolved from vandalism into powerful street art.',
        options: ['거리 벽화 (그래피티)', '기념 조각상', '무형 문화재'],
        correctIndex: 0,
        explanation: "'graffiti'는 공공장소 벽면에 스프레이 등으로 표현하는 도시 거리 예술을 의미합니다.",
        tip: 'Lesson 5 남미 거리예술 본문 수록 어휘',
      },
      {
        id: 3,
        word: 'working holiday',
        contextSentence: 'Many young adults choose Australia for their working holiday adventures.',
        options: ['워킹홀리데이 (취업 관광)', '패키지 해외여행', '공식 유학 연수'],
        correctIndex: 0,
        explanation: "'working holiday'는 청년들이 현지에서 일하며 여행할 수 있는 비자 프로그램입니다.",
        tip: 'Lesson 6 호주 워홀 본문 수록 어휘',
      },
      {
        id: 4,
        word: 'startup',
        contextSentence: 'Famous tech companies began as modest garage startups in Silicon Valley.',
        options: ['신생 벤처기업 (스타트업)', '대기업 지사', '전통 제조업체'],
        correctIndex: 0,
        explanation: "'startup'은 혁신적 아이디어로 급성장을 꾀하는 초기 창업 기업을 일컫습니다.",
        tip: 'Lesson 4 북미 차고 창업 본문 수록 어휘',
      },
      {
        id: 5,
        word: 'carnival',
        contextSentence: 'The Rio Carnival features dazzling samba parades and vibrant street parties.',
        options: ['축제, 카니발', '학술 토론회', '종교 금식일'],
        correctIndex: 0,
        explanation: "'carnival'은 화려한 퍼레이드와 춤이 어우러지는 전 세계적 축제를 뜻합니다.",
        tip: 'Lesson 5 브라질 카니발 본문 수록 어휘',
      },
    ],
  },
];

export const VocabTestTab: React.FC = () => {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('공통영어1');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<boolean>(false);

  const currentQuiz =
    VOCAB_QUIZ_DATA.find((q) => q.subjectKey === selectedSubjectKey) || VOCAB_QUIZ_DATA[0];

  const currentQ = currentQuiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  const handleSelectAnswer = (optionIdx: number) => {
    if (isAnswered) return; // 이미 답변했으면 고정
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleResetQuiz = (subjectKey?: string) => {
    if (subjectKey) setSelectedSubjectKey(subjectKey);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
  };

  // 점수 계산
  const score = Object.entries(selectedAnswers).reduce((acc, [qIdx, ans]) => {
    const q = currentQuiz.questions[Number(qIdx)];
    return acc + (q && q.correctIndex === ans ? 1 : 0);
  }, 0);

  const totalQuestions = currentQuiz.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // 성취도 평가 멘트
  const getFeedbackMessage = () => {
    if (score === totalQuestions) {
      return {
        level: '완벽 마스터! (100점)',
        comment: `축하합니다! ${currentQuiz.title} 교과서의 핵심 단어를 완벽하게 파악하고 있습니다. 다음 학년 교과서 단어에도 도전해 보세요!`,
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    } else if (score >= 3) {
      return {
        level: '우수 (고교 실력 탄탄)',
        comment: `${currentQuiz.title}의 주요 문맥 어휘를 잘 이해하고 있습니다. 틀린 단어 1~2개만 복습하면 실전 독해가 훨씬 수월해집니다!`,
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    } else {
      return {
        level: '성장 진행 중 (도전 환영)',
        comment: `고등학교 영어 지문은 문맥 속 어휘 활용이 핵심입니다. 지금 틀린 단어들을 눈에 익혀두면 입학 후 큰 힘이 됩니다!`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }
  };

  const feedback = getFeedbackMessage();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
      {/* 🌟 상단 인트로 배너 */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-teal-600 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur-xs w-fit px-3 py-1 rounded-full">
          <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
          <span>의령여고 단어 실력 진단</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight">
          나의 영어 단어는 어디쯤 왔을까? 🎯
        </h2>
        <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
          의령여고 3개년 6권 교과서 본문 속 핵심 어휘를 3지 선다형 5문항 퀴즈로 가볍게 풀어보며 나의 현재 어휘 수준을 확인해 보세요!
        </p>
      </div>

      {/* 📚 교과서 6권 탭 셀렉터 */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {VOCAB_QUIZ_DATA.map((quiz) => {
          const isSelected = selectedSubjectKey === quiz.subjectKey;
          return (
            <button
              key={quiz.subjectKey}
              onClick={() => handleResetQuiz(quiz.subjectKey)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{quiz.title}</span>
            </button>
          );
        })}
      </div>

      {/* 📝 퀴즈 카드 영역 */}
      {!showResult ? (
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-xs space-y-4">
          {/* 퀴즈 헤더 */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {currentQuiz.title}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                난이도: {currentQuiz.difficulty}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-500">
              문제 {currentQuestionIndex + 1} / {totalQuestions}
            </div>
          </div>

          {/* 진행도 게이지 바 */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>

          {/* 단어 및 예문 박스 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-center">
            <div className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase">
              Target Vocabulary
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              {currentQ.word}
            </h3>
            <p className="text-xs md:text-sm text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-200/60 leading-relaxed text-left">
              “{currentQ.contextSentence}”
            </p>
          </div>

          {/* 3지 선다 보기 버튼 */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-500 mb-1">
              위 문맥에서 가장 알맞은 뜻을 골라보세요:
            </div>
            {currentQ.options.map((opt, idx) => {
              const selectedThis = selectedAnswers[currentQuestionIndex] === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-slate-800';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                } else if (selectedThis) {
                  btnStyle = 'border-red-500 bg-red-50 text-red-900';
                } else {
                  btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs md:text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && selectedThis && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 해설 및 다음 문제 버튼 (답변 후 표시) */}
          {isAnswered && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 leading-relaxed">
                  <span className="font-bold">해설: </span>
                  {currentQ.explanation}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-blue-100">
                <span className="text-[11px] text-blue-600 font-semibold">{currentQ.tip}</span>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <span>{currentQuestionIndex < totalQuestions - 1 ? '다음 문제' : '결과 확인하기'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 🏆 결과 화면 */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentQuiz.title} 단어 진단 완료
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800">
              {totalQuestions}문제 중 <span className="text-blue-600">{score}문제</span> 정답! ({percentage}점)
            </h3>
          </div>

          {/* 평가 등급 배지 및 코멘트 */}
          <div className={`p-4 rounded-xl border ${feedback.badgeColor} text-left space-y-1.5`}>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>진단 결과: {feedback.level}</span>
            </div>
            <p className="text-xs leading-relaxed">{feedback.comment}</p>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => handleResetQuiz()}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>이 교과서 다시 풀기</span>
            </button>
            <button
              onClick={() => {
                const currentIndex = VOCAB_QUIZ_DATA.findIndex(
                  (q) => q.subjectKey === selectedSubjectKey
                );
                const nextQuiz =
                  VOCAB_QUIZ_DATA[(currentIndex + 1) % VOCAB_QUIZ_DATA.length];
                handleResetQuiz(nextQuiz.subjectKey);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <span>다음 교과서 퀴즈 도전</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

