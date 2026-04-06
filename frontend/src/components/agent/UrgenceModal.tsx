import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

interface UrgenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const UrgenceModal: React.FC<UrgenceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientNom: '',
    motif: '',
    justification: '',
    fileId: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[40px] border border-red-100 shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-red-500 p-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldAlert size={28} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
          <h2 className="text-2xl font-black italic tracking-tight">Insertion d'Urgence</h2>
          <p className="text-sm text-white/80 font-medium mt-1">Ce ticket sera placé en tête de file.</p>
        </div>

        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nom du Patient</label>
            <input 
              type="text" 
              className="input-standard border-red-50 focus:border-red-500 focus:ring-red-500/10" 
              placeholder="Ex: Jean Paul"
              value={formData.patientNom}
              onChange={e => setFormData({ ...formData, patientNom: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Motif Médical</label>
            <textarea 
              className="input-standard border-red-50 focus:border-red-500 focus:ring-red-500/10 min-h-[80px] py-4 resize-none" 
              placeholder="Description courte..."
              value={formData.motif}
              onChange={e => setFormData({ ...formData, motif: e.target.value })}
            />
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
             <AlertTriangle className="text-amber-500 shrink-0" size={20} />
             <div>
                <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Attention</p>
                <p className="text-xs text-amber-600/80 leading-relaxed font-medium">
                  Toute insertion d'urgence doit être médicalement justifiée et sera tracée dans le rapport d'activité.
                </p>
             </div>
          </div>

          <button 
            onClick={() => onSubmit(formData)}
            className="w-full bg-red-500 text-white font-black text-[12px] uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 mt-4"
          >
            Confirmer l'insertion
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
