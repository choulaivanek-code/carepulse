import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmCancelModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          id="cancel-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-500" strokeWidth={2} />
          </div>
          <h2
            id="cancel-modal-title"
            className="text-xl font-black text-slate-900 tracking-tight mb-2"
          >
            Annuler le ticket ?
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
            Êtes-vous sûr de vouloir annuler votre ticket ? Vous perdrez votre
            place dans la file d&rsquo;attente.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            id="cancel-modal-cancel-btn"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            id="cancel-modal-confirm-btn"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-red-500/30 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Confirmer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
