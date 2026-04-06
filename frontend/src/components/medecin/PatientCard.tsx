import React from 'react';
import { User, Clock, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import type { Ticket } from '../../types';

interface PatientCardProps {
  ticket: Ticket;
  tempsConsultation?: number;
}

export const PatientCard: React.FC<PatientCardProps> = ({ ticket, tempsConsultation }) => {
  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m} min`;
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-[#E2E8F0] p-8 hover:shadow-md transition-all group animate-fadeSlideIn">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[24px] bg-linear-to-br from-[#00B4D8] to-[#7BC043] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#1A202C] tracking-tight italic">
              {ticket.patientPrenom} {ticket.patientNom}
            </h3>
            <p className="text-[10px] font-black text-[#718096] uppercase tracking-[0.2em] mt-1 opacity-60">
              Dossier : {ticket.fileAttenteNom}
            </p>
          </div>
        </div>
        <StatusBadge statut={ticket.statut} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#F1F5F9]">
            <p className="text-[10px] font-black text-[#718096] uppercase tracking-[0.2em] mb-2 pl-1">Motif de Visite</p>
            <p className="text-sm font-black text-[#1A202C] italic leading-relaxed">"{ticket.motif}"</p>
          </div>

          <div className="flex items-center gap-6 pl-1">
            <div>
              <p className="text-[10px] font-black text-[#718096] uppercase tracking-[0.2em] mb-1">Priorité</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#F1F5F9] text-[#4A5568] border border-[#E2E8F0]`}>
                {ticket.priorite}
              </span>
            </div>
            {ticket.estUrgence && (
              <div className="flex items-center gap-2 bg-[#FEF2F2] rounded-xl px-4 py-2 border border-[#EF4444]/20 animate-pulse">
                <AlertTriangle size={14} className="text-[#EF4444]" />
                <span className="text-[10px] font-black text-[#EF4444] uppercase tracking-widest">Urgence Vitale</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#E0F7FC] rounded-2xl p-5 border border-[#00B4D8]/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-[#00B4D8] uppercase tracking-[0.2em] mb-1">Temps d'attente</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-[#1A202C]">
                  {ticket.tempsAttenteEstime > 0 ? ticket.tempsAttenteEstime : '—'}
                </p>
                {ticket.tempsAttenteEstime > 0 && <span className="text-[10px] font-bold text-[#718096]">min</span>}
              </div>
            </div>
            <Clock size={24} className="text-[#00B4D8] opacity-20" />
          </div>

          {tempsConsultation !== undefined && (
            <div className="bg-[#F0F9E8] rounded-2xl p-5 border border-[#7BC043]/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#7BC043] uppercase tracking-[0.2em] mb-1">Chronomètre</p>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#7BC043]" />
                  <p className="text-2xl font-black text-[#7BC043] font-mono tracking-tighter">
                    {formatMinutes(tempsConsultation)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
