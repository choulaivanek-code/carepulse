import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Ticket as TicketIcon, 
  ArrowUpRight, 
  Zap,
  BarChart4,
  ChevronRight,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { adminApi } from '../../api/adminApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { NotificationBell } from '../../components/common/NotificationBell';
import { StatsCard } from '../../components/admin/StatsCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const COLORS = ['#0891B2', '#10B981', '#F59E0B', '#EF4444']; // Cyan, Emerald, Amber, Red

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showSkeleton, setShowSkeleton] = useState(true);

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
    staleTime: 5000
  });

  const { data: configResponse } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => adminApi.getParametres()
  });

  // Handle skeleton delay (max 1s or until data)
  useEffect(() => {
    if (!statsLoading) {
      const timer = setTimeout(() => setShowSkeleton(false), 300); // Small fluid delay
      return () => clearTimeout(timer);
    }
  }, [statsLoading]);

  const stats = statsResponse?.data?.data;
  const config = configResponse?.data?.data || [];
  const isMLActive = config.find((p: any) => p.cle === 'moteur_ml')?.valeur === 'true';

  const chartData = stats?.traficParHeure || [];
  
  const pieData = stats?.repartitionStatuts ? Object.entries(stats.repartitionStatuts).map(([name, value]) => ({
    name,
    value: Number(value)
  })) : [];

  const totalStatus = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const formatTrend = (key: string) => {
    if (!stats?.comparaisonHier) return { trend: '...', isUp: true };
    const val = stats.comparaisonHier[key];
    return {
      trend: val,
      isUp: val.startsWith('+') || val === 'STABLE' || val === 'NOUVEAU'
    };
  };

  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-6 lg:p-10">
           <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-28 lg:pb-10">
        <header className="flex items-center justify-between mb-12 animate-fade-in">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Supervision Admin</h1>
            <p className="text-slate-500 font-medium mt-1">Données réelles du système CarePulse</p>
          </div>
          <div className="flex items-center gap-4">
             {statsLoading && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />}
             <div className="hidden lg:flex flex-col items-end mr-6">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                   Système Synchro
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">MAJ toutes les 30s</p>
             </div>
             <NotificationBell />
          </div>
        </header>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in">
           <StatsCard 
            title="Tickets Actifs" 
            value={stats?.ticketsActifs ?? 0} 
            icon={TicketIcon} 
            trend={formatTrend('ticketsActifs').trend}
            trendUp={formatTrend('ticketsActifs').isUp}
            color="cyan" 
           />
           <StatsCard 
            title="Tickets / Jour" 
            value={stats?.ticketsJour ?? 0} 
            icon={ArrowUpRight} 
            trend="Live" 
            trendUp={true} 
            color="emerald" 
           />
           <StatsCard 
            title="Occupation" 
            value={`${stats?.occupation ?? 0}%`} 
            icon={Zap} 
            trend="Config" // Refers to the cap
            trendUp={true} 
            color="violet" 
           />
           <StatsCard 
            title="Attente Moyenne" 
            value={`${stats?.attenteMoyenne ?? 0}m`} 
            icon={Clock} 
            trend={formatTrend('attente').trend}
            trendUp={!formatTrend('attente').isUp} // Inverted
            color="amber" 
           />
           <StatsCard 
            title="Médecins Actifs" 
            value={stats?.medecinsActifs ?? 0} 
            icon={Users} 
            trend="En ligne" 
            trendUp={true} 
            color="blue" 
           />
           <StatsCard 
            title="No-Shows" 
            value={`${stats?.noShowPourcentage ?? 0}%`} 
            icon={BarChart4} 
            trend={formatTrend('noShow').trend}
            trendUp={!formatTrend('noShow').isUp} // Lower is better
            color="red" 
           />
           <StatsCard 
            title="Satisfaction" 
            value={`${stats?.satisfaction ?? 0}/5`} 
            icon={Star} 
            trend={formatTrend('satisfaction').trend}
            trendUp={formatTrend('satisfaction').isUp}
            color="violet" 
           />
           <StatsCard 
            title="Total Historique" 
            value={stats?.totalTickets ?? 0} 
            icon={TrendingUp} 
            trend="Cumul" 
            trendUp={true} 
            color="slate" 
           />
        </div>

        {/* Charts area */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
           <div className="lg:col-span-2 card-premium p-10 flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="section-label mb-2">TRAFIC EN TEMPS RÉEL</h3>
                    <p className="text-xl font-black italic tracking-tight">Affluence horaire (07h - 19h)</p>
                 </div>
              </div>
              <div className="flex-1 w-full opacity-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#0891B2" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis 
                       dataKey="heure" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} 
                       dy={10}
                     />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                     <Tooltip 
                       contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.05)'}}
                       labelStyle={{fontWeight: 900, color: '#0F172A', marginBottom: '4px'}}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="count" 
                       name="Tickets"
                       stroke="#0891B2" 
                       strokeWidth={4} 
                       fillOpacity={1} 
                       fill="url(#colorTickets)" 
                     />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="card-premium p-10 flex flex-col items-center h-[450px]">
              <h3 className="section-label mb-8 w-full">RÉPARTITION STATUTS</h3>
              <div className="flex-1 w-full relative">
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-3xl font-black italic tracking-tighter leading-none text-slate-900">{totalStatus}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tickets</p>
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={pieData}
                       innerRadius={70}
                       outerRadius={90}
                       paddingAngle={8}
                       dataKey="value"
                     >
                       {pieData.map((_entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="w-full mt-8 grid grid-cols-2 gap-4">
                 {pieData.map((entry, index) => (
                   <div key={entry.name} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[index]}} />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{entry.name}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
           <div className="card-premium p-10">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="section-label mb-0">TOP MÉDECINS</h3>
                 <button onClick={() => navigate('/admin/utilisateurs')} className="text-[10px] font-black uppercase tracking-widest text-cyan-600 hover:underline cursor-pointer">Voir tout</button>
              </div>
              <div className="space-y-6">
                 {stats?.topMedecins && stats.topMedecins.length > 0 ? (
                   stats.topMedecins.map((med: any, i: number) => (
                    <div key={i} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0 transition-transform hover:translate-x-2">
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl bg-${i === 0 ? 'emerald' : 'blue'}-50 text-${i === 0 ? 'emerald' : 'blue'}-600 flex items-center justify-center font-bold`}>
                             Dr
                          </div>
                          <div>
                             <p className="text-sm font-extrabold text-slate-900 italic">{med.nom}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.specialite}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-900 italic leading-none">{med.consultations} consultations</p>
                          <div className="flex items-center justify-end gap-1 mt-1 font-bold text-[10px] text-emerald-500">
                              <Star size={10} fill="currentColor" /> {i === 0 ? 'Major' : 'Top Performance'}
                          </div>
                       </div>
                    </div>
                   ))
                 ) : (
                   <p className="text-center text-slate-400 font-bold uppercase text-[10px]">Aucune donnée disponible</p>
                 )}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-center transition-all hover:shadow-cyan-900/10 active:scale-[0.98]">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                 <Zap size={140} strokeWidth={2.5} />
              </div>
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-8">
                    <Zap size={14} className="text-cyan-400 fill-cyan-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">CarePulse Intelligence</p>
                 </div>
                 <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight mb-6">
                    {isMLActive ? "Optimisation via IA active" : "IA désactivée"}
                 </h2>
                 <p className="text-sm text-white/60 font-medium leading-relaxed max-w-sm mb-10">
                   {isMLActive 
                     ? "Le moteur de prédiction ML réduit actuellement le temps d'attente estimé de ~4.2m par session." 
                     : "Activez le moteur ML dans la configuration pour optimiser automatiquement les flux de patients."}
                 </p>
                 <button 
                  onClick={() => navigate('/admin/ml')}
                  className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-50 transition-all flex items-center gap-3 cursor-pointer"
                 >
                    Accéder au Lab ML
                    <ChevronRight size={18} strokeWidth={3} />
                 </button>
              </div>
           </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
