import React, { useState } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { useQuery } from '@tanstack/react-query';
import {
  History, 
  Clock, 
  Stethoscope, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { consultationApi } from '../../api/consultationApi';
import { patientApi } from '../../api/patientApi';
import { useAuthStore } from '../../store/authStore';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CompteRenduModal } from '../../components/patient/CompteRenduModal';

export const PatientHistorique: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const { user } = useAuthStore();
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: consultationsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient-consultations', user?.id],
    queryFn: () => consultationApi.getByPatient(user!.id as number),
    enabled: !!user?.id,
  });

  const { data: pointsData } = useQuery({
    queryKey: ['patient-points', user?.id],
    queryFn: () => patientApi.getPoints(),
    enabled: !!user?.id,
  });

  const consultations = consultationsData?.data?.data ?? [];
  const pointsInfo = pointsData?.data?.data;

  // Stats calculation
  const totalVisits = consultations.length;
  const lastMedecin = consultations[0]?.medecinNom || '---';

  const stats = [
    { label: 'Visites totales', value: totalVisits, icon: History, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Visites terminées', value: totalVisits, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Dernier médecin', value: lastMedecin !== '---' ? `Dr. ${lastMedecin}` : '---', icon: Stethoscope, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Niveau Fidélité', value: pointsInfo?.niveau || 'Bronze', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const getLevelIcon = (niveau: string) => {
    switch (niveau) {
      case 'Or': return '🥇';
      case 'Argent': return '🥈';
      default: return '🥉';
    }
  };

  const handleOpenReport = (consultation: any) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        <header className="mb-12 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Mon Historique
            </h1>
            <p className="text-slate-500 font-medium mt-2">Retrouvez toutes vos consultations passées</p>
          </div>

          {pointsInfo && (
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm min-w-[300px]">
               <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                     <span className="text-2xl">{getLevelIcon(pointsInfo.niveau)}</span>
                     <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{pointsInfo.niveau}</p>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pointsInfo.points} Points</p>
               </div>
               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-1000" 
                    style={{ width: `${(pointsInfo.pointsVersSuivant / pointsInfo.pointsRequisSuivant) * 100}%` }}
                  />
               </div>
               <p className="text-[9px] font-bold text-slate-400 italic leading-tight">
                  {pointsInfo.messageProgression}
               </p>
            </div>
          )}
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-fade-in">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
               <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                 <stat.icon size={20} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <p className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Erreur Historique</p>
            <button onClick={() => refetch()} className="text-[10px] font-black uppercase text-cyan-600 hover:underline">Réessayer</button>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <h2 className="section-label">LIGNE DU TEMPS</h2>
            
            <div className="space-y-6 relative ml-4">
              <div className="absolute top-0 bottom-0 left-[-1.5px] w-0.5 bg-slate-200" />
              
              {consultations.length === 0 ? (
                <div className="card-premium p-10 text-center border-dashed">
                  <p className="text-slate-300 font-black text-xs uppercase tracking-[0.2em] italic">Aucune consultation enregistrée</p>
                </div>
              ) : (
                consultations.map((c: any) => (
                  <div key={c.id} className="relative pl-10 group">
                    <div className="absolute left-[-10px] top-6 w-5 h-5 rounded-full bg-white border-4 border-cyan-600 shadow-sm z-10 group-hover:scale-125 transition-transform" />
                    
                    <div 
                      onClick={() => handleOpenReport(c)}
                      className="card-premium p-6 hover:border-cyan-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
                    >
                      <div className="flex items-center gap-6">
                         <div className="text-center min-w-[60px]">
                            <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
                              {new Date(c.dateDebut).getDate()}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(c.dateDebut).toLocaleDateString('fr-FR', { month: 'short' })}
                            </p>
                         </div>
                         <div className="w-px h-10 bg-slate-100 hidden md:block" />
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <h4 className="text-lg font-black text-slate-900 italic tracking-tight">Consultation</h4>
                               <span className="text-[9px] font-black uppercase tracking-widest py-1 px-3 bg-emerald-100 text-emerald-700 rounded-full">Terminée</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                               <div className="flex items-center gap-1">
                                 <Stethoscope size={12} />
                                 Dr. {c.medecinNom}
                               </div>
                               <div className="flex items-center gap-1">
                                 <Clock size={12} />
                                 {new Date(c.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <button className="flex items-center gap-2 group/btn py-2 px-5 rounded-full bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all">
                        Compte-rendu
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <CompteRenduModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          consultation={selectedConsultation}
        />
      </main>
      <MobileNav />
    </div>
  );
};
