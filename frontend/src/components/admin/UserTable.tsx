import React from 'react';
import { Shield, UserCheck, UserX, Edit2, Trash2 } from 'lucide-react';
import type { User as UserType } from '../../types';

interface UserTableProps {
  users: UserType[];
  onToggleStatus: (id: number) => void;
  onEdit: (user: UserType) => void;
  onDelete: (user: UserType) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onToggleStatus, onEdit, onDelete }) => {
  const roleColors = {
    PATIENT: 'bg-cyan-100 text-cyan-700',
    AGENT: 'bg-amber-100 text-amber-700',
    MEDECIN: 'bg-emerald-100 text-emerald-700',
    ADMIN: 'bg-violet-100 text-violet-700',
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rôle</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                       {u.prenom[0]}
                    </div>
                    <div>
                       <p className="text-sm font-extrabold text-slate-900 leading-none">{u.prenom} {u.nom}</p>
                       <p className="text-xs text-slate-400 font-medium mt-1">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roleColors[u.role as keyof typeof roleColors]}`}>
                      {u.role}
                   </span>
                </td>
                <td className="px-8 py-5 text-xs font-bold text-slate-500 italic">
                   {u.telephone}
                </td>
                <td className="px-8 py-5">
                   {u.active ? (
                     <div className="flex items-center gap-1.5 text-emerald-600">
                        <UserCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Actif</span>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 text-red-500">
                        <UserX size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Désactivé</span>
                     </div>
                   )}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                     <button 
                       onClick={() => onToggleStatus(u.id)}
                       className={`p-2 rounded-xl border transition-all ${
                         u.active ? 'border-red-100 text-red-500 hover:bg-red-50' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                       }`}
                       title={u.active ? "Désactiver" : "Activer"}
                     >
                        <Shield size={16} />
                     </button>
                     <button 
                       onClick={() => onEdit(u)}
                       className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
                       title="Modifier"
                     >
                        <Edit2 size={16} />
                     </button>
                     <button 
                       onClick={() => onDelete(u)}
                       className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                       title="Supprimer"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
