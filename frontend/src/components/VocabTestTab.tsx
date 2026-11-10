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
  Trophy,
  Layers,
  ChevronRight
} from 'lucide-react';
import vocabDataRaw from '../utils/vocab_quiz_data.json';

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

interface VocabSet {
  setId: number;
  setName: string;
  description: string;
  questions: VocabQuestion[];
}

interface TextbookVocabQuiz {
  subjectKey: string;
  title: string;
  grade: string;
  publisher: string;
  difficulty: string;
  color: string;
  description: string;
  sets: VocabSet[];
}

const VOCAB_QUIZ_DATA: TextbookVocabQuiz[] = vocabDataRaw as TextbookVocabQuiz[];

export const VocabTestTab: React.FC = () => {
  // 선택된 교과서 (기본값: 공통영어1)
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('공통영어1');

  // 선택된 세트 번호 (1 ~ 5)
  const [selectedSetId, setSelectedSetId] = useState<number>(1);

  // 현재 문제 번호 (0 ~ 4)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // 사용자가 선택한 정답 목록 (key: 문제인덱스, value: 선택한보기인덱스)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  // 결과 화면 표시 여부
  const [showResult, setShowResult] = useState<boolean>(false);

  // 현재 교과서 및 세트 객체
  const currentQuiz =
    VOCAB_QUIZ_DATA.find((q) => q.subjectKey === selectedSubjectKey) || VOCAB_QUIZ_DATA[0];

  const currentSet =
    currentQuiz.sets.find((s) => s.setId === selectedSetId) || currentQuiz.sets[0];

  const currentQ = currentSet.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  const handleSelectAnswer = (optionIdx: number) => {
    if (isAnswered) return; // 이미 답변했으면 변경 불가
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSet.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  // 퀴즈 초기화 / 세트 변경 / 교과서 변경
  const handleResetQuiz = (subjectKey?: string, setId?: number) => {
    if (subjectKey) {
      setSelectedSubjectKey(subjectKey);
      setSelectedSetId(setId ?? 1);
    } else if (setId !== undefined) {
      setSelectedSetId(setId);
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
  };

  // 다음 세트 풀어보기 (5세트 완료 시 교과서 내 첫 세트로 순환)
  const handleNextSet = () => {
    const nextSetId = selectedSetId < currentQuiz.sets.length ? selectedSetId + 1 : 1;
    handleResetQuiz(undefined, nextSetId);
  };

  // 다른 교과서 풀어보기 (다음 교과서 세트 1로 이동)
  const handleNextBook = () => {
    const currentIndex = VOCAB_QUIZ_DATA.findIndex(
      (q) => q.subjectKey === selectedSubjectKey
    );
    const nextQuiz = VOCAB_QUIZ_DATA[(currentIndex + 1) % VOCAB_QUIZ_DATA.length];
    handleResetQuiz(nextQuiz.subjectKey, 1);
  };

  // 점수 계산
  const score = Object.entries(selectedAnswers).reduce((acc, [qIdx, ans]) => {
    const q = currentSet.questions[Number(qIdx)];
    return acc + (q && q.correctIndex === ans ? 1 : 0);
  }, 0);

  const totalQuestions = currentSet.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // 성취도 평가 멘트
  const getFeedbackMessage = () => {
    if (score === totalQuestions) {
      return {
        level: '완벽 마스터! (100점)',
        comment: `축하합니다! ${currentQuiz.title} [${currentSet.setName}]의 핵심 어휘를 완벽하게 파악하고 있습니다!`,
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
          교과서 6권 × 5개 세트(총 30개 세트, 150문항) 3지 선다형 퀴즈로 나의 현재 어휘 수준을 확인해 보세요!
        </p>
      </div>

      {/* 📚 1. 교과서 6권 선택 탭 바 */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>교과서 선택</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">{currentQuiz.grade} · {currentQuiz.publisher}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {VOCAB_QUIZ_DATA.map((quiz) => {
            const isSelected = selectedSubjectKey === quiz.subjectKey;
            return (
              <button
                key={quiz.subjectKey}
                onClick={() => handleResetQuiz(quiz.subjectKey, 1)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="truncate w-full text-center">{quiz.title}</span>
                <span className={`text-[10px] font-normal truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {quiz.difficulty.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🏷️ 2. 해당 교과서의 5개 세트 선택 바 */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>퀴즈 세트 선택 (세트 1 ~ 5)</span>
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold">{currentSet.setName}</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {currentQuiz.sets.map((set) => {
            const isSelected = selectedSetId === set.setId;
            return (
              <button
                key={set.setId}
                onClick={() => handleResetQuiz(undefined, set.setId)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white hover:bg-indigo-50/50 text-slate-700 border-slate-200'
                }`}
              >
                <div>세트 {set.setId}</div>
                <div className={`text-[9px] font-normal truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {set.setName.replace(`세트 ${set.setId}: `, '')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📝 3. 퀴즈 풀기 영역 */}
      {!showResult ? (
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-xs space-y-4">
          {/* 퀴즈 헤더 */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {currentQuiz.title}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                세트 {currentSet.setId}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {currentSet.description}
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
            <p className="text-xs md:text-sm text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed text-left">
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
              {currentQuiz.title} · {currentSet.setName} 진단 완료
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

          {/* 액션 버튼 3종: 현재 세트 다시 풀기 / 다음 세트도 풀어보기 / 다른 교과서 풀어보기 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            {/* 1. 현재 세트 다시 풀기 */}
            <button
              onClick={() => handleResetQuiz(undefined, selectedSetId)}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>현재 세트 다시 풀기</span>
            </button>

            {/* 2. 다음 세트도 풀어보기 (요청사항 핵심) */}
            <button
              onClick={handleNextSet}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {selectedSetId < currentQuiz.sets.length
                  ? `다음 세트(${selectedSetId + 1}) 풀어보기`
                  : '세트 1부터 다시 도전'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* 3. 다른 교과서 풀어보기 (요청사항 핵심) */}
            <button
              onClick={handleNextBook}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>다른 교과서 풀어보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
