import React from 'react';
import type { TicketStatus } from '../../types';

interface StatusBadgeProps {
  statut: TicketStatus;
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  CREATED: { label: 'Créé', className: 'bg-slate-100 text-slate-600' },
  WAITING: { label: 'En attente', className: 'bg-sky-100 text-sky-700' },
  PRESENT: { label: 'Présent', className: 'bg-emerald-100 text-emerald-700' },
  READY: { label: 'Prêt', className: 'bg-violet-100 text-violet-700' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Terminé', className: 'bg-slate-100 text-slate-600' },
  CANCELLED: { label: 'Annulé', className: 'bg-red-100 text-red-600' },
  NO_SHOW: { label: 'Absent', className: 'bg-red-100 text-red-800' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ statut }) => {
  const config = statusConfig[statut] || statusConfig.CREATED;
  
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.className}`}>
      {config.label}
    </span>
  );
};
