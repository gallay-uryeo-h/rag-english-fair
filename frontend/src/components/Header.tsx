import React from 'react';
import { Compass } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm md:text-base tracking-tight">
            <span>의령여고 English Passport</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">5. My English Future</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
        <Compass className="w-3.5 h-3.5 text-blue-500" />
        <span className="font-medium">선택과목 박람회</span>
      </div>
    </header>
  );
};

