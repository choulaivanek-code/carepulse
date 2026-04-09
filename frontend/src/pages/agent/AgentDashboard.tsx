import React, { useState } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Search,
  Plus
} from 'lucide-react';
import { ticketApi } from '../../api/ticketApi';
import { adminApi } from '../../api/adminApi';
import { fileAttenteApi } from '../../api/fileAttenteApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { NotificationBell } from '../../components/common/NotificationBell';
import { QueueTable } from '../../components/agent/QueueTable';
import { UrgenceModal } from '../../components/agent/UrgenceModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const AgentDashboard: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const [filter, setFilter] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [isUrgenceOpen, setIsUrgenceOpen] = useState(false);

  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => fileAttenteApi.getFiles(),
  });

  React.useEffect(() => {
    if (filesData?.data?.data && filesData.data.data.length > 0 && !selectedFileId) {
      setSelectedFileId(filesData.data.data[0].id);
    }
  }, [filesData, selectedFileId]);

  const { data: ticketsData, isLoading: ticketsLoading, isError: ticketsError, refetch: refetchTickets } = useQuery({
    queryKey: ['agent-tickets-actifs'],
    queryFn: () => ticketApi.getTousLesTicketsActifs(),
    refetchInterval: 10000,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
  });

  const appelerMutation = useMutation({
    mutationFn: (id: number) => ticketApi.appellerPatient(id),
    onSuccess: () => {
      toast.success('Patient appelé !');
      refetchTickets();
    },
  });

  const tickets = ticketsData?.data?.data ?? [];
  const stats = statsData?.data?.data;

  const kpis = [
    {
      label: 'En attente',
      value: stats?.enAttente ?? 0,
      icon: Users,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      label: 'En cours',
      value: stats?.enCours ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Absences',
      value: stats?.absences ?? 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: 'Satisfaction',
      value: stats?.satisfaction != null ? `${stats.satisfaction}/5` : '—',
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        <header className="flex items-center justify-between mb-12 animate-fade-in">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Espace Accueil</h1>
              <p className="text-slate-500 font-medium mt-1">Gestion des flux et des tickets prioritaires</p>
            </div>
            {filesLoading && <LoadingSpinner size="sm" />}
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsUrgenceOpen(true)}
                className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
             >
                <Plus size={16} />
                Insérer Urgence
             </button>
             <NotificationBell />
          </div>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="card-premium p-8 group hover:border-cyan-200 cursor-default">
               <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                 <kpi.icon size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
               {statsLoading ? (
                 <div className="h-9 w-16 bg-slate-100 rounded-lg animate-pulse mt-1" />
               ) : (
                 <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{kpi.value}</p>
               )}
            </div>
          ))}
        </div>

        {/* ALERTS */}
        {stats?.tauxOccupation && stats.tauxOccupation > 80 && (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] mb-12 flex items-center justify-between animate-fade-in">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                   <AlertCircle size={20} />
                </div>
                <div>
                   <h4 className="font-extrabold text-amber-900 text-sm italic">Surcharge détectée ({(stats.tauxOccupation)}%)</h4>
                   <p className="text-xs text-amber-700/70 font-medium">Temps d'attente moyen supérieur à 45 minutes.</p>
                </div>
             </div>
             <button className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-colors">
                Optimiser
             </button>
          </div>
        )}

        {/* Main Section */}
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-2">
             <h2 className="section-label mb-0">LISTE DES TICKETS ACTIFS</h2>
             <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher par numéro ou patient..."
                  className="input-standard bg-white pl-12 h-12"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
             </div>
          </div>

          {ticketsLoading ? (
            <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
          ) : ticketsError ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
               <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Erreur Sync Tickets</p>
               <button onClick={() => refetchTickets()} className="text-[10px] font-black uppercase text-cyan-600 hover:underline italic">Réessayer</button>
            </div>
          ) : (
            <QueueTable 
              tickets={tickets.filter(t => 
                t.numeroTicket.toLowerCase().includes(filter.toLowerCase()) || 
                t.patientNom.toLowerCase().includes(filter.toLowerCase())
              )}
              onAppeler={(id) => appelerMutation.mutate(id)}
              onAnnuler={(id) => ticketApi.annulerTicket(id).then(() => refetchTickets())}
              onTerminer={() => {}}
            />
          )}
        </div>

        <UrgenceModal 
          isOpen={isUrgenceOpen} 
          onClose={() => setIsUrgenceOpen(false)} 
          onSubmit={() => {
             toast.success('Urgence insérée');
             setIsUrgenceOpen(false);
             refetchTickets();
          }} 
        />
      </main>
      <MobileNav />
    </div>
  );
};
