import React, { useState } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Search, 
  Zap,
  ArrowRight,
  User as UserIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fileAttenteApi } from '../../api/fileAttenteApi';
import { ticketApi } from '../../api/ticketApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import type { User } from '../../types';

export const AgentCreerTicket: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    fileId: '',
    motif: '',
    priorite: 'NORMALE',
  });

  const fakeUsersData: User[] = [];
  const usersLoading = false;

  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => fileAttenteApi.getFiles(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => ticketApi.creerTicket(data),
    onSuccess: () => {
      toast.success('Ticket créé !');
      setSelectedPatient(null);
      setFormData({ fileId: '', motif: '', priorite: 'NORMALE' });
    },
  });

  const filteredPatients = fakeUsersData.filter((u: User) => 
    u.role === 'PATIENT' && 
    (u.nom.toLowerCase().includes(search.toLowerCase()) || 
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        <header className="mb-12 animate-fade-in flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Nouveau Ticket</h1>
            <p className="text-slate-500 font-medium mt-1">Enregistrement manuel d'un patient à l'accueil</p>
          </div>
          {filesLoading && <LoadingSpinner size="sm" />}
        </header>

        <div className="grid lg:grid-cols-2 gap-10 animate-fade-in">
          <div className="space-y-8">
            <h2 className="section-label">1. SÉLECTION DU PATIENT</h2>
            <div className="card-premium p-10">
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Nom ou email du patient..."
                  className="input-standard pl-12 h-14 bg-slate-50 border-transparent focus:bg-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {usersLoading ? (
                  <div className="py-10 text-center"><LoadingSpinner /></div>
                ) : filteredPatients.map((p: User) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      selectedPatient?.id === p.id 
                        ? 'border-cyan-600 bg-cyan-50/30' 
                        : 'border-slate-50 hover:border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                          {p.prenom[0]}
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-extrabold text-slate-900">{p.prenom} {p.nom}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.email}</p>
                       </div>
                    </div>
                    {selectedPatient?.id === p.id && <Zap size={16} className="text-cyan-600 fill-cyan-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="section-label">2. CONFIGURATION DU TICKET</h2>
            <div className="card-premium p-10 space-y-6">
               {!selectedPatient ? (
                 <div className="py-20 text-center space-y-4">
                    <UserIcon size={48} className="mx-auto text-slate-200" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic leading-relaxed px-10">
                       Veuillez d'abord sélectionner un patient dans la liste de gauche.
                    </p>
                 </div>
               ) : (
                 <div className="animate-fade-in space-y-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Service de destination</label>
                     <select 
                       className="input-standard h-14"
                       value={formData.fileId}
                       onChange={e => setFormData({ ...formData, fileId: e.target.value })}
                     >
                       <option value="">Choisir un service...</option>
                       {filesData?.data?.data?.map(f => (
                         <option key={f.id} value={f.id}>{f.nom} (~{f.tempsAttenteEstime} min)</option>
                       ))}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Priorité médicale</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['NORMALE', 'MODEREE', 'URGENTE'].map(p => (
                          <button
                            key={p}
                            onClick={() => setFormData({ ...formData, priorite: p })}
                            className={`py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                              formData.priorite === p 
                                ? (p === 'URGENTE' ? 'bg-red-500 border-red-500 text-white' : 'bg-cyan-600 border-cyan-600 text-white')
                                : 'border-slate-50 text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Motif (Optionnel)</label>
                     <textarea 
                        className="input-standard min-h-[100px] py-4 resize-none" 
                        placeholder="Ex: Douleurs thoraciques..."
                        value={formData.motif}
                        onChange={e => setFormData({ ...formData, motif: e.target.value })}
                     />
                   </div>

                   <div className="pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => mutation.mutate({ 
                          fileAttenteId: Number(formData.fileId), 
                          motif: formData.motif,
                          estUrgence: formData.priorite === 'URGENTE',
                          consultationType: 'GENERALE', // Default for now
                          patientId: selectedPatient.id
                        })}
                        disabled={mutation.isPending || !formData.fileId}
                        className="btn-primary w-full py-5 h-16 text-[12px] uppercase tracking-[0.2em] italic"
                      >
                         {mutation.isPending ? 'Génération...' : 'Valider & Imprimer Ticket'}
                         <ArrowRight size={20} />
                      </button>
                   </div>
                 </div>
               )}
            </div>

            {selectedPatient && (
              <div className="bg-cyan-50 border border-cyan-100 p-8 rounded-[32px] animate-fade-in">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                       <Zap size={20} />
                    </div>
                    <h4 className="text-sm font-black text-cyan-800 tracking-tight italic lowercase">Optimisation IA Active</h4>
                 </div>
                 <p className="text-xs text-cyan-700/80 leading-relaxed font-medium">
                   Le ticket sera automatiquement indexé dans la file. Le patient recevra une notification dès que sa position est confirmée par le système.
                 </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

import { LoadingSpinner } from '../../components/common/LoadingSpinner';
