import React from 'react';
import { Clock, Zap } from 'lucide-react';

interface WaitTimeDisplayProps {
  minutes: number;
}

export const WaitTimeDisplay: React.FC<WaitTimeDisplayProps> = ({ minutes }) => {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Clock size={80} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
          <Clock size={32} strokeWidth={2.5} />
        </div>
        
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attente estimée</p>
        <p className="text-5xl font-black text-slate-900 tracking-tighter italic mb-4">
          ~{minutes} <span className="text-xl text-slate-400 not-italic">min</span>
        </p>

        <div className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-100 rounded-full px-3 py-1 mt-2">
          <Zap size={12} className="text-cyan-600 fill-cyan-600" />
          <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">IA auto-correction active</span>
        </div>
        
        <p className="text-xs text-slate-500 mt-6 leading-relaxed font-medium px-4">
          Basé sur le rythme actuel des consultations.
        </p>
      </div>
    </div>
  );
};
