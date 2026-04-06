import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import type { Ticket } from '../../types';

interface TicketRowProps {
  ticket: Ticket;
  onSignalerNoShow: () => void;
  onConfirmerPresence: () => void;
}

const prioriteColors: Record<string, string> = {
  URGENT: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
  MODERE: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
  NORMAL: 'bg-[#24AE7C]/10 text-[#24AE7C] border border-[#24AE7C]/20',
};

const noShowBar = (score: number) => {
  const pct = Math.round(score * 100);
  const color = score < 0.3 ? 'bg-[#24AE7C]' : score < 0.6 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]';
  const bgColor = 'bg-[#0D0F11]';
  
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-black uppercase tracking-tighter ${color.replace('bg-', 'text-')}`}>
          Scoring IA
        </span>
        <span className={`text-[9px] font-black ${color.replace('bg-', 'text-')}`}>{pct}%</span>
      </div>
      <div className={`h-1.5 ${bgColor} rounded-full overflow-hidden border border-[#1A1D21]`}>
        <div 
          className={`h-full rounded-full ${color} shadow-[0_0_8px_currentColor] transition-all duration-500`} 
          style={{ width: `${pct}%`, color: 'inherit' }} 
        />
      </div>
    </div>
  );
};

export const TicketRow: React.FC<TicketRowProps> = ({
  ticket,
  onSignalerNoShow,
  onConfirmerPresence,
}) => {
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <tr className="hover:bg-[#1A1D21] transition-colors group">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="font-mono font-black text-white text-sm bg-[#0D0F11] px-2 py-1 rounded-lg border border-[#1A1D21]">
            {ticket.numeroTicket}
          </span>
          {ticket.estUrgence && (
            <div className="animate-pulse bg-[#EF4444] text-white p-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <AlertTriangle size={10} strokeWidth={3} />
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-5">
        <p className="text-sm font-black text-white tracking-tight">
          {ticket.patientPrenom} {ticket.patientNom}
        </p>
        <div className="flex items-center gap-2 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <Clock size={10} className="text-[#4A5568]" />
          <p className="text-[10px] font-bold text-[#4A5568] uppercase tracking-wider">{formatTime(ticket.heureCreation)}</p>
        </div>
      </td>
      <td className="px-6 py-5">
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            prioriteColors[ticket.priorite] ?? prioriteColors.NORMAL
          }`}
        >
          {ticket.priorite}
        </span>
      </td>
      <td className="px-6 py-5">
        <StatusBadge statut={ticket.statut} />
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-1.5 text-[#ABB8C4]">
          <span className="text-sm font-black italic">
            {ticket.tempsAttenteEstime > 0 ? `${ticket.tempsAttenteEstime}` : '—'}
          </span>
          {ticket.tempsAttenteEstime > 0 && <span className="text-[10px] font-bold uppercase tracking-tighter text-[#A0AEC0]">min</span>}
        </div>
      </td>
      <td className="px-6 py-5">{noShowBar(ticket.scoreNoShow)}</td>
      <td className="px-6 py-5 text-right">
        <div className="flex gap-2 justify-end">
          <button
            onClick={onConfirmerPresence}
            className="px-4 py-2 rounded-xl bg-[#24AE7C] text-[#0D0F11] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm border-b-2 border-[#1A1D21]"
          >
            Arrivé
          </button>
          <button
            onClick={onSignalerNoShow}
            className="px-4 py-2 rounded-xl bg-[#EF4444] text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm border-b-2 border-[#1A1D21]"
          >
            Absent
          </button>
        </div>
      </td>
    </tr>
  );
};
