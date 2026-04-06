import React from 'react';
import { Brain, Activity, Target, Shield } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';

const ACCURACY_DATA = [
  { name: 'Lun', acc: 92 }, { name: 'Mar', acc: 94 }, { name: 'Mer', acc: 91 },
  { name: 'Jeu', acc: 96 }, { name: 'Ven', acc: 95 }, { name: 'Sam', acc: 98 },
];

export const AdminML: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-28 lg:pb-10">
        <header className="flex items-center justify-between mb-12 animate-fade-in">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-3xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30">
                <Brain size={32} />
             </div>
             <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Intelligence Engine</h1>
               <p className="text-slate-500 font-medium mt-1">Surveillance et entraînement du moteur prédictif</p>
             </div>
          </div>
          <div className="flex items-center gap-2 px-6 py-2 bg-emerald-50 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">En production</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
           <div className="card-premium p-10 flex flex-col justify-between">
              <div>
                 <p className="section-label mb-2">PRÉCISION MOYENNE</p>
                 <h2 className="text-4xl font-black italic tracking-tighter text-slate-900">96.8%</h2>
              </div>
              <div className="h-40 mt-10">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={ACCURACY_DATA}>
                      <Bar dataKey="acc" fill="#0891B2" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
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
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Baseline</span>
                    </div>
                 </div>
              </div>
              <div className="h-56">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={ACCURACY_DATA}>
                      <Line type="monotone" dataKey="acc" stroke="#0891B2" strokeWidth={4} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 animate-fade-in">
           <div className="space-y-6">
              <h2 className="section-label">MODÈLES EN COURS</h2>
              <div className="space-y-4">
                 {[
                   { name: 'PredictWaitTime_v4', status: 'Actif', load: '12%', acc: '98%' },
                   { name: 'NoShowProbability_v2', status: 'Training', load: '45%', acc: '89%' },
                   { name: 'ResourceOptimize_v1', status: 'Staging', load: '2%', acc: '92%' },
                 ].map(m => (
                    <div key={m.name} className="card-premium p-6 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Activity size={20} className="text-cyan-600" />
                          <div>
                             <p className="text-sm font-black text-slate-900 tracking-tight">{m.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.status}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-cyan-600">{m.acc}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Charge {m.load}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                       <Target size={24} />
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tight">Recalibrage du Modèle</h3>
                 </div>
                 <p className="text-sm text-white/50 leading-relaxed font-medium max-w-sm mb-12">
                   Lancez une session d'entraînement sur les données des 30 derniers jours pour améliorer les prédictions d'affluence.
                 </p>
                 <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl mb-12 border border-white/10">
                    <Shield className="text-cyan-400" size={24} />
                    <p className="text-xs font-bold text-white/80 leading-relaxed">
                       Sécurité : L'entraînement utilise des données anonymisées conformes au RGPD.
                    </p>
                 </div>
              </div>
              <button className="w-full bg-cyan-500 text-white font-black text-[12px] uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl shadow-cyan-600/30">
                 Lancer Training (GPU v2)
              </button>
           </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
