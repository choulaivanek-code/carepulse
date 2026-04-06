import React, { useState } from 'react';
import { Star, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { feedbackApi } from '../../api/feedbackApi';
import type { FeedbackRequest } from '../../types';

interface FeedbackFormProps {
  ticketId: number;
  onSuccess?: () => void;
}

const criteria: { key: keyof FeedbackRequest; label: string }[] = [
  { key: 'noteGlobale', label: 'Satisfaction globale' },
  { key: 'noteAttenteTemps', label: "Temps d'attente" },
  { key: 'noteAccueil', label: 'Accueil' },
  { key: 'noteMedecin', label: 'Médecin' },
  { key: 'noteProprete', label: 'Propreté' },
];

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ ticketId, onSuccess }) => {
  const [notes, setNotes] = useState<Record<string, number>>({
    noteGlobale: 0,
    noteAttenteTemps: 0,
    noteAccueil: 0,
    noteMedecin: 0,
    noteProprete: 0,
  });
  const [commentaire, setCommentaire] = useState('');
  const [recommande, setRecommande] = useState(false);
  const [anonyme, setAnonyme] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<{ key: string; star: number } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: FeedbackRequest) => feedbackApi.submitFeedback(data),
    onSuccess: () => {
      toast.success('Merci pour votre feedback ! 🌟');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi du feedback');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(notes).some((n) => n === 0)) {
      toast.error('Veuillez évaluer tous les critères');
      return;
    }
    mutation.mutate({
      ticketId,
      commentaire,
      recommande,
      anonyme,
      noteGlobale: notes.noteGlobale,
      noteAttenteTemps: notes.noteAttenteTemps,
      noteAccueil: notes.noteAccueil,
      noteMedecin: notes.noteMedecin,
      noteProprete: notes.noteProprete,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeSlideIn">
      {criteria.map((c) => (
        <div key={c.key}>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-gray-soft/60 uppercase tracking-widest">{c.label}</label>
            {notes[c.key as string] > 0 && (
              <span className="text-[9px] bg-cyan-pulse/10 text-cyan-pulse px-3 py-1 rounded-full font-black uppercase tracking-[0.15em] border border-cyan-pulse/20 shadow-sm animate-bounce-in">
                SCORE {notes[c.key as string]}/5
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive =
                (hoveredStar?.key === c.key
                  ? hoveredStar.star
                  : notes[c.key as string]) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar({ key: c.key as string, star })}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() =>
                    setNotes((prev) => ({ ...prev, [c.key]: star }))
                  }
                  className="transition-all hover:scale-125 hover:-translate-y-1 active:scale-95"
                >
                  <Star
                    size={36}
                    className={`transition-all duration-500 ${
                      isActive 
                        ? 'text-orange-warning fill-orange-warning filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                        : 'text-gray-100 fill-gray-50/50 hover:text-orange-warning/30 hover:fill-orange-warning/10'
                    }`}
                    strokeWidth={isActive ? 0 : 2}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-6 border-t border-gray-50">
        <label className="block text-[10px] font-black text-gray-soft/60 uppercase tracking-widest mb-4">
          Votre témoignage <span className="text-gray-soft/30 italic font-bold">(optionnel)</span>
        </label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={5}
          placeholder="Racontez-nous votre expérience..."
          className="w-full px-6 py-5 rounded-[24px] border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-cyan-pulse/10 focus:border-cyan-pulse/50 transition-all resize-none text-sm placeholder-gray-soft/30 font-semibold text-navy-deep shadow-inner"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-5 p-6 bg-gray-50 rounded-[28px] border border-gray-100 shadow-inner">
        <label className="flex items-center gap-4 cursor-pointer group flex-1">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={recommande}
              onChange={(e) => setRecommande(e.target.checked)}
              className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-lg checked:bg-lime-pulse checked:border-lime-pulse transition-all shadow-sm"
            />
            <Check size={14} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform font-black" />
          </div>
          <span className="text-[10px] font-black text-gray-soft uppercase tracking-widest group-hover:text-navy-deep transition-colors">Je recommande</span>
        </label>
        <label className="flex items-center gap-4 cursor-pointer group flex-1">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={anonyme}
              onChange={(e) => setAnonyme(e.target.checked)}
              className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-lg checked:bg-cyan-pulse checked:border-cyan-pulse transition-all shadow-sm"
            />
            <Check size={14} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform font-black" />
          </div>
          <span className="text-[10px] font-black text-gray-soft uppercase tracking-widest group-hover:text-navy-deep transition-colors">Réponse anonyme</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-5 rounded-[24px] bg-gradient-to-r from-cyan-pulse to-lime-pulse text-white font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-cyan-pulse/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:scale-100"
      >
        {mutation.isPending ? 'Transmission...' : 'Envoyer mon témoignage'}
      </button>
    </form>
  );
};
