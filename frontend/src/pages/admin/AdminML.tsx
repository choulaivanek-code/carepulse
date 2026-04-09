import React from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { Brain, Activity, Target, Shield, Loader2, AlertCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';

export const AdminML: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const { data: mlDataResponse, isLoading, refetch } = useQuery({
    queryKey: ['mlStatus'],
    queryFn: () => adminApi.getMLStatus(),
    refetchInterval: 60000,
  });

  const mlStatus = mlDataResponse?.data?.data;
  const isOnline = mlStatus?.serviceActif ?? false;

  const trainMutation = useMutation({
    mutationFn: () => adminApi.triggerMLTraining(),
    onSuccess: () => {
      toast.success('Entraînement terminé ✅ — Modèles mis à jour');
      refetch(); // Rafraîchit le statut après l'entraînement
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur : Service ML hors ligne ❌');
    }
  });

  const handleTrain = () => {
    toast.promise(trainMutation.mutateAsync(), {
      loading: 'Entraînement en cours (GPU v2)...',
      success: 'Modèles recalibrés !',
      error: 'Échec de l\'entraînement.',
    });
  };

  const accuracyChartData = mlStatus?.modeles?.map((m: any) => ({
    name: m.nom.replace('_model', '').toUpperCase(),
    acc: m.precision
  })) || [];

  const optimizationData = mlStatus?.optimisationAttente || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        <header className="flex items-center justify-between mb-12 animate-fade-in">
          <div className="flex items-center gap-6">
             <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg transition-all ${isOnline ? 'bg-cyan-600 shadow-cyan-600/30' : 'bg-slate-400 shadow-slate-400/30'}`}>
                <Brain size={32} className="text-white" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Intelligence Engine</h1>
                <p className="text-slate-500 font-medium mt-1">Surveillance et entraînement du moteur prédictif</p>
             </div>
          </div>
          
          <div className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isOnline ? 'En production' : 'Hors ligne'}
            </span>
          </div>
        </header>

        {!isOnline && !isLoading && (
          <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 animate-fade-in">
            <AlertCircle className="text-rose-500" size={24} />
            <p className="text-sm font-bold text-rose-900">
              Démarrez le service ML : <code className="bg-rose-100 px-2 py-1 rounded ml-2">uvicorn main:app --reload --port 8000</code>
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
           <div className="card-premium p-10 flex flex-col justify-between">
              <div>
                 <p className="section-label mb-2">PRÉCISION MOYENNE</p>
                 <h2 className="text-4xl font-black italic tracking-tighter text-slate-900">
                   {isLoading ? '---' : `${mlStatus?.precisionMoyenne || 0}%`}
                 </h2>
              </div>
              <div className="h-40 mt-10">
                 {isLoading ? (
                    <div className="h-full w-full bg-slate-50 animate-pulse rounded-2xl" />
                 ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={accuracyChartData}>
                       <Bar dataKey="acc" fill="#0891B2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                 )}
              </div>
           </div>

           <div className="card-premium p-10 lg:col-span-2">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="section-label mb-0">OPTIMISATION ATTENTE (MIN)</h3>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-cyan-600" />
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Réel</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-200" />
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Baseline (25m)</span>
                    </div>
                 </div>
              </div>
              <div className="h-56">
                {isLoading ? (
                  <div className="h-full w-full bg-slate-50 animate-pulse rounded-3xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={optimizationData}>
                       <XAxis dataKey="heure" hide />
                       <YAxis hide domain={[0, 40]} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                         labelStyle={{ fontWeight: '900', color: '#1e293b' }}
                       />
                       <Line type="monotone" dataKey="reel" stroke="#0891B2" strokeWidth={4} dot={{ r: 4, fill: '#0891B2' }} activeDot={{ r: 6 }} />
                       <Line type="monotone" dataKey="baseline" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 animate-fade-in">
           <div className="space-y-6">
              <h2 className="section-label">MODÈLES EN COURS</h2>
              <div className="space-y-4">
                 {isLoading ? (
                    [1, 2].map(i => <div key={i} className="h-24 bg-white rounded-[28px] animate-pulse shadow-sm" />)
                 ) : (
                    mlStatus?.modeles?.length > 0 ? (
                      mlStatus.modeles.map((m: any) => (
                        <div key={m.nom} className="card-premium p-6 flex items-center justify-between hover:scale-[1.02] transition-transform">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-2xl ${m.statut === 'ACTIF' ? 'bg-cyan-50 text-cyan-600' : 'bg-rose-50 text-rose-600'}`}>
                                <Activity size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-900 tracking-tight">{m.nom.replace('_', ' ')}</p>
                                 <p className={`text-[10px] font-bold uppercase tracking-widest ${m.statut === 'ACTIF' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                   {m.statut}
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-cyan-600">{m.precision}%</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Charge {m.charge}%</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                        <p className="text-sm font-bold text-slate-400 italic">Service ML hors ligne ou aucun modèle trouvé</p>
                      </div>
                    )
                 )}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
              
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                       <Target size={24} />
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tight">Recalibrage du Modèle</h3>
                 </div>
                 <p className="text-sm text-white/50 leading-relaxed font-medium max-w-sm mb-12">
                   Lancez une session d'entraînement sur les données réelles pour améliorer la précision des prédictions.
                 </p>
                 <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl mb-12 border border-white/10">
                    <Shield className="text-cyan-400" size={24} />
                    <p className="text-xs font-bold text-white/80 leading-relaxed">
                       Sécurité : Analyse synchrone des tables `tickets` et `consultations`.
                    </p>
                 </div>
              </div>
              
              <button 
                onClick={handleTrain}
                disabled={trainMutation.isPending || !isOnline}
                className="w-full bg-cyan-500 text-white font-black text-[12px] uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl shadow-cyan-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                 {trainMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Lancer Training (GPU v2)'}
              </button>
           </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
