import React, { useState } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Clock, 
  User as UserIcon, 
  CheckCircle, 
  AlertCircle,
  Pause,
  ChevronRight,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ticketApi } from '../../api/ticketApi';
import { medecinApi } from '../../api/medecinApi';
import { consultationApi } from '../../api/consultationApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { CallNextButton } from '../../components/medecin/CallNextButton';
import { ConsultationForm } from '../../components/medecin/ConsultationForm';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MedecinConsole: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [consultationData, setConsultationData] = useState({});
  const [tempsEcoule, setTempsEcoule] = useState(0);

  const formaterTemps = (secondes: number) => {
    const min = Math.floor(secondes / 60).toString().padStart(2, '0');
    const sec = (secondes % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const { data: medecinData, isLoading: medecinLoading, refetch: refetchMedecin } = useQuery({
    queryKey: ['medecin-moi'],
    queryFn: () => medecinApi.getMoi(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const medecinInfo = medecinData?.data?.data;
  const enPause = medecinInfo ? !medecinInfo.disponible : false;

  const { data: ticketsData, refetch: refetchTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['medecin-tickets-console', medecinInfo?.fileAttenteId],
    queryFn: () => ticketApi.getConsoleTickets(),
    enabled: !!medecinInfo?.fileAttenteId,
    refetchInterval: 15000,
  });

  // Détection du changement de file d'attente
  React.useEffect(() => {
    const lastFileId = localStorage.getItem('last_file_id');
    if (medecinInfo?.fileAttenteId && lastFileId && String(medecinInfo.fileAttenteId) !== lastFileId) {
      toast.success(`Votre file d'attente a été mise à jour : ${medecinInfo.fileAttenteNom}`, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#0891B2',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '16px',
        },
        icon: '🔔'
      });
      refetchTickets();
    }
    if (medecinInfo?.fileAttenteId) {
      localStorage.setItem('last_file_id', String(medecinInfo.fileAttenteId));
    }
  }, [medecinInfo?.fileAttenteId, medecinInfo?.fileAttenteNom, refetchTickets]);

  const pauseMutation = useMutation({
    mutationFn: () => medecinApi.togglePause(),
    onSuccess: (res) => {
      toast.success(res.data.data.disponible ? 'Activité reprise' : 'Console en pause');
      refetchMedecin();
      refetchTickets();
    },
  });

  const appelerPatientMutation = useMutation({
    mutationFn: (id: number) => ticketApi.appellerPatient(id),
    onSuccess: () => {
      toast.success('Patient appelé !');
      refetchTickets();
    },
  });

  const demarrerMutation = useMutation({
    mutationFn: (id: number) => consultationApi.demarrer(id),
    onSuccess: () => {
      toast.success('Consultation démarrée !');
      refetchTickets();
    },
  });

  const cloturerMutation = useMutation({
    mutationFn: (ticketId: number) => consultationApi.cloturer(ticketId),
    onSuccess: () => {
      toast.success('Consultation clôturée !');
      setActiveTicket(null);
      setConsultationData({});
      refetchTickets();
    },
  });

  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const noShowMutation = useMutation({
    mutationFn: (id: number) => ticketApi.signalerAbsence(id),
    onSuccess: () => {
      toast.success('Patient marqué comme absent.');
      setShowNoShowModal(false);
      setActiveTicket(null);
      setConsultationData({});
      refetchTickets();
    },
    onError: () => {
      setShowNoShowModal(false);
      toast.error('Erreur lors du signalement.');
    }
  });

  const tickets = ticketsData?.data?.data ?? [];
  const prochainTicket = tickets.find(t => t.statut === 'READY');
  const fileAttente = tickets.filter(t => t.statut === 'WAITING').slice(0, 5);
  const currentConsultation = tickets.find(t => t.statut === 'IN_PROGRESS');

  // Handle activeTicket sync if it's currently IN_PROGRESS
  React.useEffect(() => {
    if (currentConsultation && !activeTicket) {
      setActiveTicket(currentConsultation);
    }
  }, [currentConsultation, activeTicket]);

  React.useEffect(() => {
    if (!activeTicket?.heureDebut) {
        setTempsEcoule(0);
        return;
    }
    
    const interval = setInterval(() => {
      const debut = new Date(activeTicket.heureDebut).getTime();
      const maintenant = Date.now();
      setTempsEcoule(Math.floor((maintenant - debut) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeTicket?.heureDebut]);

  if (medecinLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        
        {enPause && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 animate-slide-in">
            <AlertCircle size={18} />
            <p className="text-xs font-bold uppercase tracking-widest">Vous êtes en pause — les nouveaux appels sont suspendus</p>
          </div>
        )}

        <header className="flex items-center justify-between mb-12 animate-fade-in">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Console Médicale</h1>
              <p className="text-slate-500 font-medium mt-1">Gérez vos consultations en temps réel</p>
            </div>
            {ticketsLoading && <LoadingSpinner size="sm" />}
          </div>
          <div className="flex gap-4 items-center">
             <div className="flex flex-col gap-1 items-end mr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File active</p>
                <span className="font-black text-cyan-600 text-[10px] uppercase tracking-widest">
                  {medecinInfo?.fileAttenteNom || 'PÉDIATRIE'}
                </span>
             </div>
             <button 
               onClick={() => pauseMutation.mutate()}
               disabled={pauseMutation.isPending}
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                 enPause 
                  ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600' 
                  : 'border-slate-200 text-slate-500 hover:bg-white'
               }`}
             >
                {enPause ? <CheckCircle size={16} /> : <Pause size={16} />}
                {enPause ? 'Reprendre' : 'Mettre en pause'}
             </button>
             <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                <Stethoscope size={24} />
             </div>
          </div>
        </header>

        {!activeTicket ? (
          <div className="grid lg:grid-cols-2 gap-10 items-center animate-fade-in">
             <div className="flex flex-col gap-8 items-center justify-center">
                <CallNextButton 
                  onClick={() => prochainTicket && appelerPatientMutation.mutate(prochainTicket.id)}
                  disabled={!prochainTicket || enPause}
                  isLoading={appelerPatientMutation.isPending}
                />
                {!activeTicket && tickets.find(t => t.statut === 'READY') && (
                  <button 
                    onClick={() => demarrerMutation.mutate(tickets.find(t => t.statut === 'READY')!.id)}
                    className="btn-primary py-4 px-10 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                  >
                    Démarrer Consultation
                  </button>
                )}
             </div>
             
             <div className="space-y-8">
                <h2 className="section-label">PROCHAIN PATIENT</h2>
                {prochainTicket ? (
                  <div className="card-premium p-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                       <UserIcon size={120} />
                     </div>
                     <div className="relative z-10 flex flex-col items-center text-center">
                        <p className="text-3xl font-black text-cyan-600 italic tracking-tighter mb-4">#{prochainTicket.numeroTicket}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                          {prochainTicket.patientPrenom} {prochainTicket.patientNom}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                           <div className="flex items-center gap-1"><Clock size={12} /> {prochainTicket.tempsAttenteEstime} min</div>
                           <div className="flex items-center gap-1"><TrendingUp size={12} /> Score {prochainTicket.scoreTotal}</div>
                        </div>
                        <StatusBadge statut={prochainTicket.statut} />
                     </div>
                  </div>
                ) : (
                  <div className="card-premium p-16 text-center border-dashed border-2 bg-transparent">
                     <p className="text-slate-300 font-black text-xs uppercase tracking-[0.2em] italic">Aucun patient en attente d'appel</p>
                  </div>
                )}

                <h2 className="section-label pt-4">FILE D'ATTENTE RECUE</h2>
                <div className="space-y-3">
                   {fileAttente?.map(t => (
                     <div key={t.id} className="card-premium p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <p className="text-sm font-black text-cyan-600 italic">#{t.numeroTicket}</p>
                           <p className="text-sm font-bold text-slate-900">{t.patientPrenom} {t.patientNom}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.priorite}</span>
                           <ChevronRight size={14} className="text-slate-200" />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10 animate-fade-in">
             <div className="lg:col-span-2 space-y-8">
                <div className="card-premium p-10 border-l-4 border-l-emerald-500 relative">
                   <div className="flex justify-between items-start mb-8">
                      <div>
                         <p className="section-label mb-2 text-emerald-600">CONSULTATION EN COURS</p>
                         <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">
                           {activeTicket.patientPrenom} {activeTicket.patientNom}
                         </h2>
                      </div>
                      <div className="text-right">
                         <p className="text-4xl font-black text-emerald-600 tracking-tighter tabular-nums mb-1">{formaterTemps(tempsEcoule)}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temps réel</p>
                      </div>
                   </div>

                   <div className="grid sm:grid-cols-3 gap-6 pb-10 border-b border-slate-50">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motif</p>
                         <p className="text-sm font-bold text-slate-700 italic">"{activeTicket.motif}"</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priorité</p>
                         <StatusBadge statut={activeTicket.statut} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">N° Ticket</p>
                         <p className="text-xl font-black text-cyan-600 tracking-tighter">#{activeTicket.numeroTicket}</p>
                      </div>
                   </div>

                   <div className="pt-10">
                      <ConsultationForm formData={consultationData} onChange={setConsultationData} />
                   </div>
                </div>
             </div>

             <div className="space-y-8">
                <div className="card-premium p-8 bg-slate-900 text-white border-none shadow-2xl">
                   <h3 className="text-lg font-black italic tracking-tight mb-6">Actions Patient</h3>
                   <div className="space-y-4">
                      <button 
                        onClick={() => cloturerMutation.mutate(activeTicket.id)}
                        disabled={cloturerMutation.isPending}
                        className="w-full py-4 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                      >
                         <CheckCircle size={16} />
                         Clôturer Consultation
                      </button>
                      <button 
                        onClick={() => setShowNoShowModal(true)}
                        className="w-full py-4 rounded-xl bg-amber-500/10 text-amber-500 font-black text-[10px] uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center justify-center gap-3 border border-amber-500/20"
                      >
                         <AlertCircle size={16} />
                         Marquer No-Show
                      </button>
                   </div>
                </div>

                <div className="card-premium p-8">
                   <h3 className="section-label">HISTORIQUE PATIENT</h3>
                   <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">Consultez les 3 dernières visites de ce patient.</p>
                   <button className="w-full py-3 rounded-xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-cyan-200 hover:text-cyan-600 transition-all">
                      Voir dossier complet
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
      <MobileNav />

      {/* Modal Confirmation No-Show */}
      {showNoShowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic mb-2">Marquer No-Show</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
               Êtes-vous sûr de marquer ce patient comme absent ? Cette action annulera sa consultation.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowNoShowModal(false)}
                className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  if (activeTicket) noShowMutation.mutate(activeTicket.id);
                }}
                disabled={noShowMutation.isPending}
                className="flex-1 py-3.5 rounded-xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-70"
              >
                {noShowMutation.isPending ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
