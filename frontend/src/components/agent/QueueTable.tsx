import React from 'react';
import { 
  Phone, 
  CheckCircle, 
  XCircle,
  Clock,
  User as UserIcon
} from 'lucide-react';
import type { Ticket } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface QueueTableProps {
  tickets: Ticket[];
  onAppeler: (id: number) => void;
  onAnnuler: (id: number) => void;
  onTerminer: (id: number) => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({ 
  tickets, 
  onAppeler, 
  onAnnuler, 
  onTerminer 
}) => {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 font-serif">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Numéro</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attente</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No-Show</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-8 py-5">
                  <span className="text-sm font-black text-cyan-600 tracking-tight italic">#{ticket.numeroTicket}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                      <UserIcon size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 leading-none">{ticket.patientPrenom} {ticket.patientNom}</p>
                      <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${
                        ticket.priorite === 'URGENTE' ? 'text-red-500' : 
                        ticket.priorite === 'MODEREE' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {ticket.priorite}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-bold text-slate-600">{ticket.fileAttenteNom}</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500">
                    <Clock size={12} />
                    {ticket.tempsAttenteEstime} min
                  </div>
                </td>
                <td className="px-8 py-5">
                   <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          ticket.scoreNoShow > 60 ? 'bg-red-500' : 
                          ticket.scoreNoShow > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${ticket.scoreNoShow}%` }}
                      />
                   </div>
                   <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter">{ticket.scoreNoShow}% risque</p>
                </td>
                <td className="px-8 py-5">
                  <StatusBadge statut={ticket.statut} />
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onAppeler(ticket.id)}
                      className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
                      title="Appeler"
                    >
                      <Phone size={16} />
                    </button>
                    <button 
                      onClick={() => onTerminer(ticket.id)}
                      className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Terminer"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button 
                      onClick={() => onAnnuler(ticket.id)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Annuler"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
