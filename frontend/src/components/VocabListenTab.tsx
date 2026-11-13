import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Trophy,
  Layers,
  ChevronRight,
  Volume2,
  Eye,
  EyeOff,
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

// 각 세트의 마지막 문제(index 4)가 "소리만 듣고 맞추기"
const LISTEN_ONLY_INDEX = 4;

/** Web Speech API TTS 발음 */
function speakWord(word: string, rate = 0.85) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US';
  utter.rate = rate;
  utter.pitch = 1.0;
  window.speechSynthesis.speak(utter);
}

export const VocabListenTab: React.FC = () => {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('공통영어1');
  const [selectedSetId, setSelectedSetId] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<boolean>(false);

  const currentQuiz =
    VOCAB_QUIZ_DATA.find((q) => q.subjectKey === selectedSubjectKey) || VOCAB_QUIZ_DATA[0];
  const currentSet =
    currentQuiz.sets.find((s) => s.setId === selectedSetId) || currentQuiz.sets[0];
  const currentQ = currentSet.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  // 현재 문제가 "소리만 듣고 맞추기" 모드인지
  const isListenOnlyMode = currentQuestionIndex === LISTEN_ONLY_INDEX;

  // 문제가 바뀔 때 자동 TTS
  useEffect(() => {
    if (!currentQ) return;
    if (isListenOnlyMode) {
      // 소리만 듣기 모드: 단어만 천천히 읽어줌
      setTimeout(() => speakWord(currentQ.word, 0.75), 300);
    } else {
      // 일반 모드: 단어 발음
      setTimeout(() => speakWord(currentQ.word, 0.85), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, selectedSetId, selectedSubjectKey]);

  const handleSelectAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIdx }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSet.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleResetQuiz = useCallback((subjectKey?: string, setId?: number) => {
    if (subjectKey) {
      setSelectedSubjectKey(subjectKey);
      setSelectedSetId(setId ?? 1);
    } else if (setId !== undefined) {
      setSelectedSetId(setId);
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
  }, []);

  const handleNextSet = () => {
    const nextSetId = selectedSetId < currentQuiz.sets.length ? selectedSetId + 1 : 1;
    handleResetQuiz(undefined, nextSetId);
  };

  const handleNextBook = () => {
    const currentIndex = VOCAB_QUIZ_DATA.findIndex((q) => q.subjectKey === selectedSubjectKey);
    const nextQuiz = VOCAB_QUIZ_DATA[(currentIndex + 1) % VOCAB_QUIZ_DATA.length];
    handleResetQuiz(nextQuiz.subjectKey, 1);
  };

  const score = Object.entries(selectedAnswers).reduce((acc, [qIdx, ans]) => {
    const q = currentSet.questions[Number(qIdx)];
    return acc + (q && q.correctIndex === ans ? 1 : 0);
  }, 0);

  const totalQuestions = currentSet.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  const getFeedbackMessage = () => {
    if (score === totalQuestions) {
      return {
        level: '완벽 마스터! (100점)',
        comment: `축하합니다! ${currentQuiz.title} [${currentSet.setName}]의 핵심 어휘를 완벽하게 파악하고 있습니다! 듣기 문제도 거뜬하네요! 🎉`,
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    } else if (score >= 3) {
      return {
        level: '우수 (고교 실력 탄탄)',
        comment: `${currentQuiz.title}의 주요 어휘를 잘 이해하고 있습니다. 듣기 문제를 포함한 혼합 모드에서도 좋은 실력을 보여주셨어요!`,
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    } else {
      return {
        level: '성장 진행 중 (도전 환영)',
        comment: `단어 발음을 듣고 맞추는 훈련은 영어 실력 향상에 큰 도움이 됩니다. 소리와 의미를 함께 익히면 듣기와 독해 모두 향상됩니다!`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }
  };

  const feedback = getFeedbackMessage();

  return (
    <div className="flex-1 overflow-y-auto space-y-3 w-full">
      {/* 🌟 상단 슬림 리본 배너 (단일 바 형태로 컴팩트화) */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 text-white px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-2 border-b border-purple-800/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 shrink-0 text-xs">
            🎧
          </span>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <h2 className="text-xs sm:text-sm font-extrabold tracking-tight truncate">
              소리로 배우는 영단어
            </h2>
            <span className="hidden sm:inline-block text-[10px] text-purple-200 font-medium truncate">
              오디오 챌린지
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
          <span className="bg-white/15 px-2 py-0.5 rounded-md font-medium text-purple-100 flex items-center gap-1">
            <Eye className="w-2.5 h-2.5" /> 1~4번 보기
          </span>
          <span className="bg-amber-400/25 border border-amber-300/40 text-amber-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
            <EyeOff className="w-2.5 h-2.5 text-amber-300" /> 5번 소리만!
          </span>
        </div>
      </div>

      {/* 📚 교과서 선택 탭 */}
      <div className="bg-white p-3 border-y border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>교과서 선택</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">{currentQuiz.grade} · {currentQuiz.publisher}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
          {VOCAB_QUIZ_DATA.map((quiz) => {
            const isSelected = selectedSubjectKey === quiz.subjectKey;
            return (
              <button
                key={quiz.subjectKey}
                onClick={() => handleResetQuiz(quiz.subjectKey, 1)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
              >
                <span className="truncate w-full text-center">{quiz.title}</span>
                <span className={`text-[10px] font-normal truncate mt-0.5 ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                  {quiz.grade}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📝 퀴즈 영역 */}
      {!showResult ? (
        <div className="bg-white p-4 border-y border-slate-200 shadow-2xs space-y-4">
          {/* 세트 선택 바: 번호만으로 세트 표시 & 아래에 세트 설명 */}
          <div className="space-y-2 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 shrink-0 font-bold text-slate-800">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>세트 선택:</span>
              </div>

              {/* 번호만으로 세트 표시 (1, 2, 3, 4, 5) */}
              <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                {currentQuiz.sets.map((set) => {
                  const isSelected = selectedSetId === set.setId;
                  return (
                    <button
                      key={set.setId}
                      onClick={() => handleResetQuiz(undefined, set.setId)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer ${isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                      {set.setId}
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] text-slate-400 font-medium shrink-0 ml-auto">
                문제 {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* 아래에 세트 설명 */}
            <div className="text-xs text-purple-600 font-medium bg-purple-50/60 px-2.5 py-1.5 rounded-lg border border-purple-100/80">
              💡 <span className="font-bold">{currentSet.setName}:</span> {currentSet.description}
            </div>
          </div>

          {/* 진행도 게이지 */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* 단어 / 예문 박스 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-center">
            <div className="flex items-center justify-between text-[11px] font-semibold text-purple-600 tracking-wider uppercase">
              <span>Target Vocabulary</span>
              {isListenOnlyMode && (
                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 lowercase tracking-normal">
                  🎧 소리만 듣고 맞추기
                </span>
              )}
            </div>

            {/* 소리만 듣기 모드: 단어 숨김 및 스피커 버튼, 일반 모드: 단어 + 스피커 아이콘 */}
            {isListenOnlyMode ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-36 h-10 bg-slate-200/80 rounded-xl flex items-center justify-center">
                    <span className="text-slate-400 text-sm font-black tracking-widest">? ? ? ?</span>
                  </div>
                  <button
                    onClick={() => speakWord(currentQ.word, 0.7)}
                    title="소리 다시 듣기"
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-[11px] text-amber-700 font-medium">
                  스피커를 눌러 발음을 듣고 어떤 단어인지 맞춰보세요!
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                  {currentQ.word}
                  {currentQ.pronunciation && (
                    <span className="text-sm font-normal text-slate-400 ml-2">[{currentQ.pronunciation}]</span>
                  )}
                </h3>
                <button
                  onClick={() => speakWord(currentQ.word, 0.85)}
                  title="발음 듣기"
                  className="p-1.5 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-100/70 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            )}

            {/* 예문 (소리만 듣기 모드에서도 예문은 표시) */}
            <p className="text-xs md:text-sm text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed text-left">
              {isListenOnlyMode
                ? /* 소리만 듣기: 예문에서 단어 부분을 ___로 가림 */
                `"${currentQ.contextSentence.replace(
                  new RegExp(currentQ.word, 'gi'),
                  '______'
                )}"`
                : `"${currentQ.contextSentence}"`}
            </p>
          </div>

          {/* 보기 버튼 (소리만 듣기: 단어 의미 → 단어 자체 선택으로 옵션이 단어들) */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-500 mb-1">
              {isListenOnlyMode
                ? '🎧 들은 단어의 뜻으로 올바른 것을 고르세요:'
                : '위 문맥에서 가장 알맞은 뜻을 골라보세요:'}
            </div>
            {currentQ.options.map((opt, idx) => {
              const selectedThis = selectedAnswers[currentQuestionIndex] === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 text-slate-800';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-200';
                } else if (selectedThis) {
                  btnStyle = 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-200';
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
                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {isAnswered && selectedThis && !isCorrect && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* 해설 + 단어 공개 (소리만 듣기 모드에서 답변 후 단어 보여줌) */}
          {isAnswered && (
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2 animate-in fade-in duration-200">
              {/* 소리만 듣기: 정답 단어 공개 */}
              {isListenOnlyMode && (
                <div className="flex items-center gap-2 pb-2 border-b border-purple-100">
                  <Volume2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="text-xs text-purple-900">
                    <span className="font-bold">정답 단어: </span>
                    <span className="text-xl font-black text-purple-700">{currentQ.word}</span>
                    {currentQ.pronunciation && (
                      <span className="text-slate-400 ml-1 text-xs">[{currentQ.pronunciation}]</span>
                    )}
                    <button
                      onClick={() => speakWord(currentQ.word, 0.75)}
                      className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 cursor-pointer text-[10px]"
                    >
                      <Volume2 className="w-3 h-3" /> 듣기
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-950 leading-relaxed">
                  <span className="font-bold">해설: </span>
                  {currentQ.explanation}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-purple-100">
                <span className="text-[11px] text-purple-600 font-semibold">{currentQ.tip}</span>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
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
        <div className="bg-white p-6 border-y border-slate-200 shadow-2xs text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentQuiz.title} · {currentSet.setName} 듣기+보기 진단 완료
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800">
              {totalQuestions}문제 중 <span className="text-purple-600">{score}문제</span> 정답! ({percentage}점)
            </h3>
            <p className="text-xs text-slate-500">
              (마지막 문제는 🎧 소리만 듣고 맞추기 도전!)
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${feedback.badgeColor} text-left space-y-1.5`}>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>진단 결과: {feedback.level}</span>
            </div>
            <p className="text-xs leading-relaxed">{feedback.comment}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={() => handleResetQuiz(undefined, selectedSetId)}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>현재 세트 다시 풀기</span>
            </button>

            <button
              onClick={handleNextSet}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {selectedSetId < currentQuiz.sets.length
                  ? `다음 세트(${selectedSetId + 1}) 풀어보기`
                  : '세트 1부터 다시 도전'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNextBook}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
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

