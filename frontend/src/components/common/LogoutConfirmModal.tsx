import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    // Simulation d'un délai d'une seconde pour l'expérience utilisateur
    setTimeout(() => {
      onConfirm();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-zoom-in">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <LogOut size={40} className="ml-1" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic mb-3">
            Déconnexion
          </h2>
          <p className="text-slate-500 font-medium px-4">
            Êtes-vous sûr de vouloir quitter votre session CarePulse ?
          </p>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoggingOut ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sortie...
              </>
            ) : (
              'Se déconnecter'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
