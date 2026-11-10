import React, { useState } from 'react';
import { Award, CheckCircle2, Circle, Trophy } from 'lucide-react';

interface Booth {
  id: number;
  name: string;
  enName: string;
  desc: string;
  emoji: string;
  stampColor: string;
}

const BOOTHS: Booth[] = [
  {
    id: 1,
    name: 'Emoji English Challenge',
    enName: 'Station 1 · Emoji Word Hunt',
    desc: '이모지로 영어 표현과 단어 찾기',
    emoji: '🤩',
    stampColor: 'from-amber-400 to-orange-500',
  },
  {
    id: 2,
    name: 'World Culture Passport',
    enName: 'Station 2 · World Culture Tour',
    desc: '세계 여러 나라의 다양한 생활 문화 탐험',
    emoji: '🌍',
    stampColor: 'from-blue-400 to-indigo-500',
  },
  {
    id: 3,
    name: 'Mystery Box',
    enName: 'Station 3 · English Clue Solver',
    desc: '영어로 단서를 읽고 상자 속 물건 추리하기',
    emoji: '🎁',
    stampColor: 'from-purple-400 to-pink-500',
  },
  {
    id: 4,
    name: 'This or That?',
    enName: 'Station 4 · Voice Your Choice',
    desc: '영어로 선택하고 나만의 생각과 이유 표현하기',
    emoji: '🗣️',
    stampColor: 'from-emerald-400 to-teal-500',
  },
  {
    id: 5,
    name: 'My English Future',
    enName: 'Station 5 · 4-Cut Life & Subject AI',
    desc: '인생 네컷 사진 촬영 & 3개년 영어 선택과목 탐색',
    emoji: '📸',
    stampColor: 'from-rose-400 to-red-500',
  },
];

export const DigitalPassportTab: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [stamps, setStamps] = useState<Record<number, boolean>>({
    5: true, // 현재 웹앱 부스가 5번이므로 기본 획득 상태
  });

  const toggleStamp = (id: number) => {
    setStamps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(stamps).filter(Boolean).length;
  const isAllCompleted = completedCount === 5;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
      {/* 여권 커버 헤더 */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-widest text-slate-300 font-bold">
              Uiryeong Girls&apos; High School
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
            공식 스탬프 투어
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            ENGLISH PASSPORT ✈️
          </h2>
          <p className="text-xs text-blue-200">
            의령여자고등학교 선택과목 박람회 · Find Your English!
          </p>
        </div>

        {/* 이름 입력 */}
        <div className="pt-2 flex items-center gap-2">
          <span className="text-xs text-slate-300 shrink-0 font-medium">참여자 이름:</span>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="이름 입력 (예: 김의령)"
            className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-hidden focus:bg-white/20 transition-all max-w-[150px]"
          />
        </div>
      </div>

      {/* 스탬프 진행 현황 바 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase">도장 획득 현황</div>
          <div className="text-base font-black text-slate-800">
            {completedCount} / 5 부스 완료
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {BOOTHS.map((b) => (
            <div
              key={b.id}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                stamps[b.id]
                  ? 'bg-blue-600 text-white shadow-xs scale-105'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {b.id}
            </div>
          ))}
        </div>
      </div>

      {/* 5개 부스 스탬프 보드 */}
      <div className="space-y-3">
        {BOOTHS.map((b) => {
          const isStamped = !!stamps[b.id];
          return (
            <div
              key={b.id}
              onClick={() => toggleStamp(b.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isStamped
                  ? 'bg-white border-blue-200 shadow-xs ring-1 ring-blue-100'
                  : 'bg-slate-50/80 border-slate-200 opacity-80 hover:opacity-100 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{b.emoji}</div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      Station {b.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{b.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{b.desc}</p>
                </div>
              </div>

              {/* 도장 UI */}
              <div className="shrink-0">
                {isStamped ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-in zoom-in-75">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>도장 획득</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-200/70 text-slate-500 text-xs font-medium">
                    <Circle className="w-3.5 h-3.5" />
                    <span>터치하여 도장찍기</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 올 클리어 축하 및 인생네컷 인증서 카드 */}
      {isAllCompleted && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-300 text-center space-y-3 animate-in zoom-in-95">
          <div className="w-12 h-12 bg-amber-400 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-amber-900">
              🎉 5개 부스 스탬프 투어 완주를 축하합니다!
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>{studentName || '참여자'}</strong> 학생은 의령여자고등학교 English Passport의 모든 미션을 훌륭하게 완주하였습니다. 5번 부스에서 인생네컷을 촬영하고 선물을 수령하세요! 🎁
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
