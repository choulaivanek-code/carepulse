import React from 'react';
import { X, Calendar, User, Ticket, Clock, Stethoscope, AlertCircle, CheckCircle2, TrendingUp, NotebookTabs } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CompteRenduModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: any;
}

export const CompteRenduModal: React.FC<CompteRenduModalProps> = ({ isOpen, onClose, consultation }) => {
  if (!isOpen || !consultation) return null;

  const details = [
    { label: 'Date', value: format(new Date(consultation.dateDebut), "d MMMM yyyy 'à' HH:mm", { locale: fr }), icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Service', value: consultation.fileAttenteNom || 'Pédiatrie', icon: Stethoscope, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Médecin', value: `Dr. ${consultation.medecinNom}`, icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ticket', value: `#${consultation.numeroTicket || 'T001'}`, icon: Ticket, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Durée', value: `${consultation.dureeReelle || 15} minutes`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Motif', value: consultation.motifConsultation || 'Consultation générale', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slide-up border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-100 transition-all z-10 group"
        >
          <X size={24} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
        </button>

        <div className="p-8 lg:p-14">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">COMPTE-RENDU</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Détails officiels de consultation</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-y-10 gap-x-12 mb-16 border-b border-slate-50 pb-16">
            {details.map((item, idx) => (
              <div key={idx} className="flex gap-5">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <item.icon size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{item.label}</p>
                  <p className="text-sm font-black text-slate-900 italic leading-tight">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Statut</p>
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-sm font-black text-emerald-600 italic uppercase">TERMINÉE</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8 bg-slate-50 p-10 rounded-[32px] border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-slate-900">
                <NotebookTabs size={120} />
             </div>
             
             <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">OBSERVATIONS MÉDICALES</h3>
             
             <div className="space-y-10 relative z-10">
                <div>
                   <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-3">Diagnostic & Symptômes</p>
                   <p className="text-slate-600 font-medium text-sm leading-relaxed italic">
                      {consultation.diagnostic || "Rapport médical standard. Patient stable."}
                   </p>
                </div>
                
                <div>
                   <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-3">Traitement Préconisé</p>
                   <p className="text-slate-600 font-medium text-sm leading-relaxed italic">
                      {consultation.traitement || "Suivi régulier recommandé. Repos et hydratation."}
                   </p>
                </div>
             </div>
          </div>
          
          <div className="mt-12 text-center">
             <button 
               onClick={onClose}
               className="w-full py-5 rounded-[24px] bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all"
             >
                Fermer le document
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
