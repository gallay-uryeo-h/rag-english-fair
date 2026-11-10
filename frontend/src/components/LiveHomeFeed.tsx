import React from 'react';
import {
  Sparkles,
  Volume2,
  BookOpen,
  Lightbulb,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface Props {
  onNavigate: (tab: 'mbti' | 'vocab' | 'textbook' | 'seteuk') => void;
  onOpenImage?: (title: string, imageUrl: string) => void;
}

export const LiveHomeFeed: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* 🌟 1. 시원시원한 히어로 피드 배너 (인스타그램 스토리/하이라이트 감성) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 md:p-10 shadow-xl border border-white/10">
        {/* 장식용 글로우 */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>2025 의령여자고등학교 영어 교육과정 페어</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            세상을 향해 열린 창, <br />
            <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent">
              의령여고에서 펼쳐질 나의 영어 스토리
            </span> ✨
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
            어떤 영어 과목이 나와 잘 맞을까요? 3분 인터랙티브 진단으로 나의 성향과 딱 맞는 교과서 본문을 찾고, 생생한 원어민 발음 퀴즈와 고교 세특 로드맵까지 한눈에 탐색해 보세요.
          </p>

          {/* 인스타 하이라이트 스타일 바로가기 알약 버튼 */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onNavigate('mbti')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-medium text-white border border-white/15 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <span>🧭 본문 성향 MBTI</span>
            </button>
            <button
              onClick={() => onNavigate('vocab')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-medium text-white border border-white/15 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <span>🎧 소리 단어 퀴즈</span>
            </button>
            <button
              onClick={() => onNavigate('textbook')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-medium text-white border border-white/15 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <span>📚 6권 교과서 뷰어</span>
            </button>
            <button
              onClick={() => onNavigate('seteuk')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-medium text-white border border-white/15 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <span>💡 고교 세특 치트키</span>
            </button>
          </div>
        </div>
      </section>

      {/* 🚀 2. 핵심 4코너 풀위드 인터랙티브 카드 (인스타그램 피드 카드 감성) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>오늘의 페어 필수 코스</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">BEST 4</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">원하는 카드를 터치해 시작해보세요</span>
        </div>

        {/* 🌟 CARD 1. 심층 본문 MBTI */}
        <div
          onClick={() => onNavigate('mbti')}
          className="group relative bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:rotate-6 transition-transform">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">STAGE 01</span>
                  <span className="text-xs font-semibold text-slate-400">약 2분 소요</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  나의 영어 성향 MBTI & 맞춤 본문 찾기
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl">
                  E vs I, S vs N, T vs F, J vs P 4개 축 정밀 분석! 16가지 성향 유형에 꼭 맞는 의령여고 영어 교과서 속 실제 지문과 추천 진로를 한눈에 발견합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center px-4 py-2.5 rounded-2xl bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs md:text-sm shadow-sm shrink-0 transition-colors">
              <span>진단 시작하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 🌟 CARD 2. 소리 단어 퀴즈 */}
        <div
          onClick={() => onNavigate('vocab')}
          className="group relative bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:rotate-6 transition-transform">
                <Volume2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">STAGE 02</span>
                  <span className="text-xs font-semibold text-slate-400">교과서 6권 × 5세트</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                  원어민 발음 듣고 맞추는 단어 챌린지 🎧
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl">
                  단어가 뜰 때마다 생생한 원어민 음성이 바로 나옵니다! 1~4번은 문맥 어휘 확인, 5번 문제는 단어를 가리고 오직 소리만 듣고 맞추는 스릴 넘치는 퀴즈입니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center px-4 py-2.5 rounded-2xl bg-purple-600 group-hover:bg-purple-700 text-white font-bold text-xs md:text-sm shadow-sm shrink-0 transition-colors">
              <span>단어 퀴즈 풀기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 🌟 CARD 3. 6권 교과서 3×2 2레이어 탐색기 */}
        <div
          onClick={() => onNavigate('textbook')}
          className="group relative bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:rotate-6 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">STAGE 03</span>
                  <span className="text-xs font-semibold text-slate-400">144개 전수 검증 완료</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  의령여고 3개년 교과서 6권 쇼케이스
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl">
                  3×2 표지 그리드에서 원하는 교과서를 누르고 단원 안으로 쏙! 듣기, 말하기, 읽기, 문법, 쓰기 버튼을 누르면 고화질 원본 E-Book 페이지가 즉시 열립니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center px-4 py-2.5 rounded-2xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs md:text-sm shadow-sm shrink-0 transition-colors">
              <span>교과서 열람하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 🌟 CARD 4. 세특 치트키 & 진로 탐구 */}
        <div
          onClick={() => onNavigate('seteuk')}
          className="group relative bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:rotate-6 transition-transform">
                <Lightbulb className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">STAGE 04</span>
                  <span className="text-xs font-semibold text-slate-400">대입 학종 실전 전략</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  고교 세특 아이디어 발전소
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl">
                  교과서 본문에서 출발하여 심화 탐구 보고서 주제와 실제 학생부 세특 기록 예시까지! 희망 진로(의학, AI, 미디어, 경영 등)에 맞춘 학생부 차별화 팁을 확인하세요.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center px-4 py-2.5 rounded-2xl bg-amber-600 group-hover:bg-amber-700 text-white font-bold text-xs md:text-sm shadow-sm shrink-0 transition-colors">
              <span>세특 치트키 보기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 🏅 3. 하단 안내 배너 (의령여고 영어과 선생님 메시지) */}
      <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
            🏫
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">의령여자고등학교 영어과 교과 페스티벌</div>
            <div className="text-[11px] text-slate-500">궁금한 점은 부스 안내 교사 및 도우미 학생에게 언제든 질문해 주세요!</div>
          </div>
        </div>
        <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
          <span>신입생 여러분의 꿈을 응원합니다</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
