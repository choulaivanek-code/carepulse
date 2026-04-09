import React, { useState, useEffect } from 'react';
import { Clock, Zap, BellRing } from 'lucide-react';
import type { Ticket } from '../../types';

interface WaitTimeDisplayProps {
  ticket: Ticket;
}

export const WaitTimeDisplay: React.FC<WaitTimeDisplayProps> = ({ ticket }) => {
  const [tempsRestant, setTempsRestant] = useState(ticket.tempsAttenteEstime || 0);

  useEffect(() => {
    if (!ticket) return;

    const calculerTemps = () => {
      if (ticket.statut === 'IN_PROGRESS' || ticket.statut === 'READY') {
          return;
      }
      const creation = new Date(ticket.heureCreation).getTime();
      const maintenant = Date.now();
      const minutesEcoulees = Math.floor((maintenant - creation) / 60000);
      
      const estime = ticket.tempsAttenteEstime || 0;
      const restant = Math.max(0, estime - minutesEcoulees);
      setTempsRestant(restant);
    };

    calculerTemps();
    const interval = setInterval(calculerTemps, 60000);
    return () => clearInterval(interval);
  }, [ticket]);

  if (ticket.statut === 'READY') {
    return (
      <div className="bg-amber-50 p-8 rounded-[32px] border-2 border-amber-200 shadow-sm relative overflow-hidden group animate-pulse">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BellRing size={80} className="text-amber-500" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center mb-6 shadow-sm">
            <BellRing size={32} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">C'est à vous</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight italic mb-4 text-amber-600">
            Vous êtes appelé !
          </p>
          <p className="text-sm text-amber-700 font-bold px-4">
            Présentez-vous au cabinet du médecin.
          </p>
        </div>
      </div>
    );
  }

  if (ticket.statut === 'IN_PROGRESS') {
    return (
      <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-2xl font-black text-emerald-600 tracking-tight italic mb-2">
            Consultation en cours
          </p>
        </div>
      </div>
    );
  }

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
        
        {!ticket.tempsAttenteEstime ? (
           <p className="text-2xl font-black text-slate-400 tracking-tighter italic mb-4 mt-2">
             Calcul en cours...
           </p>
        ) : tempsRestant > 0 ? (
           <p className="text-5xl font-black text-slate-900 tracking-tighter italic mb-4">
             ~{tempsRestant} <span className="text-xl text-slate-400 not-italic">min</span>
           </p>
        ) : (
           <p className="text-2xl font-black text-emerald-500 tracking-tighter italic mb-4 mt-2">
             Votre tour arrive bientôt !
           </p>
        )}

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
