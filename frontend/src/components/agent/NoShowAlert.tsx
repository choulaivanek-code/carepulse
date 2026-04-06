import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Ticket } from '../../types';

interface NoShowAlertProps {
  ticket: Ticket;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const NoShowAlert: React.FC<NoShowAlertProps> = ({ ticket, onConfirm, onDismiss }) => {
  const noShowPct = Math.round(ticket.scoreNoShow * 100);

  return (
    <div className="bg-[#131619] border-2 border-[#EF4444]/20 rounded-[32px] p-6 flex items-start gap-4 shadow-sm animate-fadeSlideIn relative overflow-hidden group">
      <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#EF4444]" />
      <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center flex-shrink-0">
        <AlertTriangle size={24} className="text-[#EF4444]" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-black text-white tracking-tight">
          Risque No-Show Elevé Détecté
        </p>
        <p className="text-xs font-bold text-[#718096] mt-1">
          Patient : <span className="text-white">{ticket.patientPrenom} {ticket.patientNom}</span> — Confiance IA : <span className="text-[#EF4444]">{noShowPct}%</span>
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-[#EF4444] text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#EF4444]/20 border-b-2 border-[#000000]/20"
          >
            Signaler Absence
          </button>
          <button
            onClick={onDismiss}
            className="px-5 py-2.5 rounded-xl bg-[#0D0F11] text-[#718096] text-[10px] font-black uppercase tracking-widest border border-[#1A1D21] hover:bg-[#1A1D21] transition-all"
          >
            Ignorer l'alerte
          </button>
        </div>
      </div>
      <button onClick={onDismiss} className="w-8 h-8 flex items-center justify-center hover:bg-[#1A1D21] rounded-xl transition-all text-[#4A5568] hover:text-white">
        <X size={16} strokeWidth={3} />
      </button>
    </div>
  );
};
