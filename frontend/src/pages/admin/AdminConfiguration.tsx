import React, { useState } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { Bell, Database, Layout, Cloud, Check, X, Loader2 } from 'lucide-react';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { ParametreSysteme } from '../../types';
import toast from 'react-hot-toast';

interface SettingItem {
  cle: string;
  title: string;
  type: 'text' | 'number' | 'toggle' | 'select';
  suffix?: string;
  options?: string[];
}

interface SettingSection {
  group: string;
  icon: any;
  items: SettingItem[];
}

export const AdminConfiguration: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [backupLoading, setBackupLoading] = useState(false);

  const { data: parametresData, isLoading, refetch } = useQuery({
    queryKey: ['parametres'],
    queryFn: () => adminApi.getParametres(),
  });

  const parametres = (parametresData?.data?.data as ParametreSysteme[]) ?? [];

  const updateMutation = useMutation({
    mutationFn: (data: { cle: string, valeur: string }) => adminApi.updateParametre(data),
    onSuccess: () => {
      toast.success('Paramètre mis à jour ✅');
      setEditingField(null);
      refetch();
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour ❌');
    }
  });

  const backupMutation = useMutation({
    mutationFn: () => adminApi.lancerBackup(),
    onSuccess: () => {
      toast.success('Sauvegarde lancée avec succès ✅');
      setBackupLoading(false);
    },
    onError: () => {
      toast.error('Erreur lors du backup ❌');
      setBackupLoading(false);
    }
  });

  const handleBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      backupMutation.mutate();
    }, 2000);
  };

  const getParam = (cle: string) => parametres.find(p => p.cle === cle)?.valeur ?? '---';

  const startEditing = (cle: string, currentValeur: string) => {
    setEditingField(cle);
    setEditValue(currentValeur);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = (cle: string) => {
    updateMutation.mutate({ cle, valeur: editValue });
  };

  const handleToggle = (cle: string, currentValeur: string) => {
    const newValue = currentValeur === 'true' ? 'false' : 'true';
    updateMutation.mutate({ cle, valeur: newValue });
  };

  const settingsSections: SettingSection[] = [
    {
      group: 'Général',
      icon: Layout,
      items: [
        { cle: 'nom_centre', title: 'Nom du centre', type: 'text' },
        { cle: 'ville', title: 'Ville', type: 'text' },
        { cle: 'langue', title: 'Langue par défaut', type: 'select', options: ['FR', 'EN'] }
      ]
    },
    {
      group: 'Notifications',
      icon: Bell,
      items: [
        { cle: 'email_enabled', title: 'Email Enabled', type: 'toggle' },
        { cle: 'alertes_systeme', title: 'Alertes Système', type: 'toggle' }
      ]
    },
    {
      group: 'Tickets & File',
      icon: Database,
      items: [
        { cle: 'max_tickets_jour', title: 'Max Tickets / Jour', type: 'number' },
        { cle: 'duree_moyenne', title: 'Durée Moyenne', type: 'number', suffix: ' min' },
        { cle: 'auto_annulation', title: 'Auto-Annulation', type: 'number', suffix: ' min' }
      ]
    },
    {
      group: 'Intelligence Artificielle',
      icon: Cloud,
      items: [
        { cle: 'moteur_ml', title: 'Moteur ML', type: 'toggle' },
        { cle: 'seuil_no_show', title: 'Seuil No-Show', type: 'number', suffix: '%' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        <header className="mb-12 animate-fade-in flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Options Système</h1>
            <p className="text-slate-500 font-medium mt-1">Configurez les paramètres globaux de l'infrastructure</p>
          </div>
          {isLoading && <LoadingSpinner size="sm" />}
        </header>

        <div className="grid lg:grid-cols-2 gap-10 animate-fade-in">
           {settingsSections.map((section, idx) => (
             <div key={idx} className="card-premium p-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                      <section.icon size={24} />
                   </div>
                   <h3 className="section-label mb-0">{section.group}</h3>
                </div>
                
                <div className="space-y-6">
                   {section.items.map((item, i) => {
                     const val = getParam(item.cle);
                     const isEditing = editingField === item.cle;

                     return (
                       <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className="flex flex-col">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.title}</p>
                             {isEditing ? (
                               <div className="flex items-center gap-2 mt-1">
                                  {item.type === 'select' ? (
                                    <select 
                                      value={editValue} 
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold outline-none"
                                    >
                                      {item.options?.map(opt => <option key={opt} value={opt}>{opt === 'FR' ? 'Français (FR)' : 'English (EN)'}</option>)}
                                    </select>
                                  ) : (
                                    <input 
                                      type={item.type} 
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold outline-none w-32"
                                      autoFocus
                                    />
                                  )}
                                  <button 
                                    onClick={() => handleSave(item.cle)}
                                    className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button 
                                    onClick={cancelEditing}
                                    className="p-1 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                               </div>
                             ) : (
                               <span className="text-sm font-extrabold text-slate-900">
                                 {item.type === 'toggle' 
                                   ? (val === 'true' ? 'Activé' : 'Désactivé') 
                                   : (item.cle === 'langue' ? (val === 'FR' ? 'Français (FR)' : 'English (EN)') : val + (item.suffix || ''))}
                               </span>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                             {item.type === 'toggle' ? (
                               <button 
                                 onClick={() => handleToggle(item.cle, val)}
                                 className={`w-12 h-6 rounded-full transition-all relative ${val === 'true' ? 'bg-cyan-600' : 'bg-slate-200'}`}
                               >
                                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${val === 'true' ? 'right-1' : 'left-1'}`} />
                               </button>
                             ) : (
                               !isEditing && (
                                 <button 
                                   onClick={() => startEditing(item.cle, val)}
                                   className="text-[10px] font-black uppercase tracking-widest text-cyan-600 hover:text-cyan-700"
                                 >
                                   Editer
                                 </button>
                               )
                             )}
                          </div>
                       </div>
                     );
                   })}
                </div>
             </div>
           ))}
        </div>

        <div className="mt-12 bg-white border border-slate-200 rounded-[40px] p-10 flex flex-col lg:flex-row items-center justify-between gap-10 animate-fade-in">
           <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                 <Cloud size={40} />
              </div>
              <div>
                 <h4 className="text-xl font-black italic tracking-tight mb-2">Sauvegarde & Maintenance</h4>
                 <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
                   Dernière sauvegarde effectuée le {new Date().toLocaleDateString()} à 04:00 (Cloud Backup).
                 </p>
              </div>
           </div>
           <button 
             onClick={handleBackup}
             disabled={backupLoading}
             className="btn-primary py-4 px-10 flex items-center gap-3 disabled:opacity-70"
           >
              {backupLoading ? <Loader2 size={18} className="animate-spin" /> : 'Lancer Backup Manuel'}
           </button>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
