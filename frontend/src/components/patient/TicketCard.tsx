import React from 'react';
import { Ticket as TicketIcon, Clock, MapPin, CheckCircle2, AlertCircle, Trash2, Stethoscope } from 'lucide-react';
import type { Ticket } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface TicketCardProps {
  ticket: Ticket;
  onConfirmPresence?: () => void;
  onMarkAbsent?: () => void;
  onCancel?: () => void;
  isConfirmingPresence?: boolean;
  isMarkingAbsent?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onConfirmPresence,
  onMarkAbsent,
  onCancel,
  isConfirmingPresence = false,
  isMarkingAbsent = false,
}) => {
  const isActive = ['WAITING', 'PRESENT', 'READY', 'IN_PROGRESS'].includes(ticket.statut);

  const formatSchedule = (days: string) => {
    if (!days) return '';
    const dayArray = days.split(',');
    const allDays = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
    const shortDays: Record<string, string> = {
      LUNDI: 'Lun', MARDI: 'Mar', MERCREDI: 'Mer', JEUDI: 'Jeu', VENDREDI: 'Ven', SAMEDI: 'Sam', DIMANCHE: 'Dim'
    };

    let isRange = true;
    if (dayArray.length >= 3) {
      const firstIdx = allDays.indexOf(dayArray[0]);
      for (let i = 1; i < dayArray.length; i++) {
        if (allDays.indexOf(dayArray[i]) !== firstIdx + i) {
          isRange = false;
          break;
        }
      }
    } else {
      isRange = false;
    }

    if (isRange) {
      return `${shortDays[dayArray[0]]} - ${shortDays[dayArray[dayArray.length - 1]]}`;
    }

    return dayArray.map(d => shortDays[d]).join(', ');
  };

  return (
    <div className={`card-premium overflow-hidden ${isActive ? 'border-l-4 border-l-cyan-600' : ''}`}>
      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <TicketIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Numéro de ticket</p>
              <h3 className="text-2xl font-black text-cyan-600 tracking-tight italic leading-none">{ticket.numeroTicket}</h3>
            </div>
          </div>
          <StatusBadge statut={ticket.statut} />
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Position actuelle</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter italic">
              {String(ticket.positionActuelle).padStart(2, '0')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attente estimée</p>
            <div className="flex items-center justify-end gap-2 text-cyan-600">
              <Clock size={16} strokeWidth={3} />
              <p className="text-xl font-black italic">~{ticket.tempsAttenteEstime} min</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
           <div className="flex items-center gap-3 text-sm text-slate-600">
              <MapPin size={16} className="text-slate-400" />
              <span className="font-bold">{ticket.fileAttenteNom}</span>
           </div>
            <div className="flex items-start gap-3 text-sm text-slate-600">
               <Stethoscope size={16} className="text-slate-400 mt-0.5" />
               <div>
                  <span className="font-bold">Dr. {ticket.medecinNom || 'Assignation en cours'}</span>
                  {ticket.medecinJoursTravail && (
                     <p className="text-[10px] text-slate-400 font-bold mt-0.5 italic leading-tight">
                        Disponible {formatSchedule(ticket.medecinJoursTravail)} de {ticket.medecinHeureDebut?.slice(0, 5)} à {ticket.medecinHeureFin?.slice(0, 5)}
                     </p>
                  )}
               </div>
            </div>
        </div>

        {ticket.statut === 'WAITING' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onConfirmPresence}
              disabled={isConfirmingPresence || isMarkingAbsent}
              className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isConfirmingPresence ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Confirmer présence
            </button>
            <button
              onClick={onMarkAbsent}
              disabled={isConfirmingPresence || isMarkingAbsent}
              className="flex items-center justify-center gap-2 border-2 border-amber-500 text-amber-500 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl hover:bg-amber-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isMarkingAbsent ? (
                <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              ) : (
                <AlertCircle size={16} />
              )}
              Signaler absence
            </button>
          </div>
        )}

        {isActive && ticket.statut !== 'READY' && (
          <button 
            onClick={onCancel}
            className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-red-500 text-red-500 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl hover:bg-red-50 transition-all"
          >
            <Trash2 size={16} />
            Annuler le ticket
          </button>
        )}
      </div>
    </div>
  );
};

