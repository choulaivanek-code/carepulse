import React from 'react';

interface QueuePositionProps {
  current: number;
  total: number;
}

export const QueuePosition: React.FC<QueuePositionProps> = ({ current, total }) => {
  const percentage = Math.max(5, (1 - (current - 1) / total) * 100);

  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Votre place</p>
          <p className="text-5xl font-black text-slate-900 tracking-tighter italic">
            {String(current).padStart(2, '0')}
            <span className="text-2xl text-slate-300 ml-1">/ {total}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Progression</p>
          <p className="text-xl font-black text-cyan-600 italic">{Math.round(percentage)}%</p>
        </div>
      </div>

      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-lg shadow-cyan-600/20 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress_1s_linear_infinite]" />
        </div>
      </div>
      
      <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em] text-center">
        {current <= 1 ? "C'EST PRESQUE VOTRE TOUR !" : `${current - 1} patients devant vous`}
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          from { background-position: 0 0; }
          to { background-position: 20px 0; }
        }
      `}} />
    </div>
  );
};
