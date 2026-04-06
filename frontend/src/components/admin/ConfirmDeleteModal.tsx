import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-zoom-in">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic mb-2">
            {title}
          </h2>
          <p className="text-slate-500 font-medium">
            {message}
          </p>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Suppression...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};
