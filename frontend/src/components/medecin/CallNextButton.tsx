import React from 'react';
import { Phone, Zap } from 'lucide-react';

interface CallNextButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const CallNextButton: React.FC<CallNextButtonProps> = ({ 
  onClick, 
  isLoading, 
  disabled 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        group relative w-full aspect-square max-w-[320px] rounded-[64px] 
        bg-white border border-slate-200 shadow-xl overflow-hidden
        transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]
        flex flex-col items-center justify-center gap-6
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-cyan-200'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="w-24 h-24 rounded-[32px] bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 group-hover:scale-110 transition-transform duration-500">
        {isLoading ? (
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Phone size={40} strokeWidth={2.5} />
        )}
      </div>

      <div className="text-center relative z-10">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Appeler le suivant</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Prêt pour la consultation</p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 rounded-full">
         <Zap size={12} className="text-cyan-600 fill-cyan-600" />
         <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">Optimisation auto</span>
      </div>
    </button>
  );
};
