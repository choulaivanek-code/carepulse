import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { ReglePriorisation } from '../../types';

interface RegleFormProps {
  regle?: ReglePriorisation;
  onSubmit: (data: Partial<ReglePriorisation>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const RegleForm: React.FC<RegleFormProps> = ({
  regle,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [form, setForm] = useState<Partial<ReglePriorisation>>({
    nom: regle?.nom ?? '',
    description: regle?.description ?? '',
    critere: regle?.critere ?? '',
    valeurSeuil: regle?.valeurSeuil ?? 0,
    scoreAjoute: regle?.scoreAjoute ?? 0,
    actif: regle?.actif ?? true,
    ordreApplication: regle?.ordreApplication ?? 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-zoom-in">
        <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">
              Configuration Règle
            </h2>
            <p className="text-2xl font-black text-slate-900 tracking-tight italic">
              {regle ? 'Modification Protocole' : 'Nouveau Protocole'}
            </p>
          </div>
          <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-2xl transition-all active:scale-95">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Intitulé de la Règle</label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              required
              className="input-standard h-14"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Spécifications Techniques</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="input-standard py-4 min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ID Critère (Metadata)</label>
            <input
              type="text"
              value={form.critere}
              onChange={(e) => setForm((f) => ({ ...f, critere: e.target.value }))}
              required
              placeholder="ex: AGE, GROSSESSE, HANDICAP"
              className="input-standard h-14"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Valeur Seuil</label>
              <input
                type="number"
                value={form.valeurSeuil}
                onChange={(e) => setForm((f) => ({ ...f, valeurSeuil: Number(e.target.value) }))}
                className="input-standard h-14"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Score d'Incidence</label>
              <input
                type="number"
                value={form.scoreAjoute}
                onChange={(e) => setForm((f) => ({ ...f, scoreAjoute: Number(e.target.value) }))}
                className="input-standard h-14 text-emerald-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Priorité d'Application</label>
              <input
                type="number"
                value={form.ordreApplication}
                onChange={(e) => setForm((f) => ({ ...f, ordreApplication: Number(e.target.value) }))}
                min={1}
                className="input-standard h-14 text-cyan-600"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-14 h-7 rounded-full transition-all ${form.actif ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${form.actif ? 'translate-x-7' : 'translate-x-0'}`} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Statut Actif</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 py-4 h-14 text-[10px] tracking-[0.2em] italic"
            >
              {isLoading ? 'Synchronisation...' : 'Valider Protocole'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
