import React from 'react';
import { FileDown, FileText, Download } from 'lucide-react';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';

export const AdminRapports: React.FC = () => {
  const reports = [
    { title: 'Activité Mensuelle', desc: 'Volume de tickets, taux d’occupation et efficacité.', date: 'Février 2026', type: 'PDF' },
    { title: 'Performance Lab', desc: 'Analyses des temps d’attente par département.', date: 'Hier', type: 'XLSX' },
    { title: 'Satisfaction Patient', desc: 'Compilation des feedbacks et scores NPS.', date: 'Q1 2026', type: 'PDF' },
    { title: 'Rapport No-Show', desc: 'Analyse des absences et pertes opérationnelles.', date: 'T1 2026', type: 'CSV' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-28 lg:pb-10">
        <header className="mb-12 animate-fade-in">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Centre de Rapports</h1>
          <p className="text-slate-500 font-medium mt-1">Exportez les données de performance et d'activité</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
           {reports.map((report, idx) => (
             <div key={idx} className="card-premium p-10 group cursor-pointer hover:border-cyan-200 overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 p-8 opacity-5 text-slate-900 group-hover:scale-110 transition-transform">
                   <FileText size={160} />
                </div>
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                         <FileDown size={24} />
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-cyan-50 text-cyan-600 text-[10px] font-black uppercase tracking-widest">{report.type}</span>
                   </div>
                   <h3 className="text-2xl font-black italic tracking-tight mb-3 text-slate-900">{report.title}</h3>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mb-8">{report.desc}</p>
                   <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Généré le {report.date}</p>
                      <button className="flex items-center gap-2 text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:underline transition-all">
                         Télécharger <Download size={14} />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="mt-16 bg-white border border-slate-200 rounded-[40px] p-10 animate-fade-in">
           <h3 className="section-label">GÉNÉRATEUR PERSONNALISÉ</h3>
           <div className="grid sm:grid-cols-3 gap-8 mt-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Période</label>
                 <select className="input-standard h-12">
                   <option>30 derniers jours</option>
                   <option>90 derniers jours</option>
                 </select>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</label>
                 <select className="input-standard h-12">
                   <option>Tous les services</option>
                   <option>Secrétariat</option>
                 </select>
              </div>
              <div className="flex items-end">
                 <button className="btn-primary w-full h-12 text-[10px] uppercase tracking-widest italic py-0">Générer le rapport personnalisé</button>
              </div>
           </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
