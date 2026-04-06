import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Star, 
  ThumbsUp, 
  ThumbsDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackApi } from '../../api/feedbackApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';

export const PatientFeedback: React.FC = () => {
  const [ratings, setRatings] = useState({
    globale: 0,
    attente: 0,
    accueil: 0,
    medecin: 0,
    proprete: 0,
  });
  const [comment, setComment] = useState('');
  const [recommande, setRecommande] = useState<boolean | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => feedbackApi.submitFeedback(data),
    onSuccess: () => {
      toast.success('Merci pour votre retour !');
      // Success animation logic
    },
  });

  const renderStars = (key: keyof typeof ratings) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setRatings({ ...ratings, [key]: star })}
          className={`w-10 h-10 transition-all ${
            ratings[key] >= star ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-slate-300'
          }`}
        >
          <Star size={32} fill={ratings[key] >= star ? 'currentColor' : 'none'} strokeWidth={ratings[key] >= star ? 0 : 2} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-28 lg:pb-10">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full mb-6">
               <Sparkles size={14} />
               <p className="text-[10px] font-black uppercase tracking-widest">Consultation terminée</p>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic">
              Votre avis compte
            </h1>
            <p className="text-slate-500 font-medium mt-2">Aidez-nous à améliorer la qualité de nos soins</p>
          </header>

          <div className="space-y-6">
            <div className="card-premium p-10">
               <h3 className="section-label">NOTE GLOBALE</h3>
               <p className="text-lg font-black mb-6 tracking-tight">Comment évaluez-vous votre expérience au total ?</p>
               {renderStars('globale')}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
               {[
                 { key: 'attente' as const, label: 'Temps d’attente' },
                 { key: 'accueil' as const, label: 'Accueil & Secrétariat' },
                 { key: 'medecin' as const, label: 'Qualité de l’échange médical' },
                 { key: 'proprete' as const, label: 'Propreté des lieux' }
               ].map((item) => (
                 <div key={item.key} className="card-premium p-8">
                    <p className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">{item.label}</p>
                    {renderStars(item.key)}
                 </div>
               ))}
            </div>

            <div className="card-premium p-10">
               <h3 className="section-label">COMMENTAIRE</h3>
               <p className="text-lg font-black mb-6 tracking-tight">Que pourrions-nous améliorer ?</p>
               <textarea 
                 value={comment}
                 onChange={(e) => setComment(e.target.value)}
                 placeholder="Votre message ici..."
                 className="input-standard min-h-[150px] py-6 resize-none"
               />
            </div>

            <div className="card-premium p-10 flex flex-col sm:flex-row items-center justify-between gap-8 bg-slate-900 text-white border-none shadow-xl">
               <div>
                  <h3 className="text-xl font-black italic tracking-tight mb-1">Recommanderiez-vous CarePulse ?</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-wide">Votre recommandation est notre plus grande récompense.</p>
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={() => setRecommande(true)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      recommande === true ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <ThumbsUp size={24} />
                  </button>
                  <button 
                    onClick={() => setRecommande(false)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      recommande === false ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/40' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <ThumbsDown size={24} />
                  </button>
               </div>
            </div>

            <div className="flex justify-end pt-6">
               <button 
                onClick={() => mutation.mutate({})}
                disabled={mutation.isPending || ratings.globale === 0}
                className="btn-primary px-12 py-5 text-sm uppercase tracking-[0.2em] italic"
               >
                 {mutation.isPending ? 'Envoi...' : 'Envoyer mon avis'}
                 <ChevronRight size={20} />
               </button>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
