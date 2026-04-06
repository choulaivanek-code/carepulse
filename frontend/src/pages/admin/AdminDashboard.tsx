import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Ticket, 
  ArrowUpRight, 
  Zap,
  BarChart4,
  ChevronRight,
  Clock
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

const data = [
  { name: '08h', tickets: 12 },
  { name: '10h', tickets: 45 },
  { name: '12h', tickets: 32 },
  { name: '14h', tickets: 68 },
  { name: '16h', tickets: 55 },
  { name: '18h', tickets: 24 },
];

const COLORS = ['#0891B2', '#10B981', '#F59E0B', '#EF4444'];
const PIE_DATA = [
  { name: 'En attente', value: 400 },
  { name: 'Terminés', value: 300 },
  { name: 'Absents', value: 300 },
  { name: 'Annulés', value: 200 },
];

export const AdminDashboard: React.FC = () => {
  const { data: statsData, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
  });

  const stats = statsData?.data?.data;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-28 lg:pb-10">
        <header className="flex items-center justify-between mb-12 animate-fade-in">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Supervision Admin</h1>
            <p className="text-slate-500 font-medium mt-1">Contrôle global du système CarePulse</p>
          </div>
          <div className="flex items-center gap-4">
             {isLoading && <LoadingSpinner size="sm" />}
             {isError && <span className="text-red-500 text-[10px] font-black uppercase">Erreur de synchro</span>}
             <div className="hidden lg:flex flex-col items-end mr-6">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   Serveurs Connectés
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Latence: 42ms</p>
             </div>
             <NotificationBell />
          </div>
        </header>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in">
           <StatsCard 
            title="Tickets Actifs" 
            value={stats?.ticketsActifs ?? 0} 
            icon={Ticket} 
            trend="Live" 
            trendUp={true} 
            color="cyan" 
           />
           <StatsCard 
            title="Tickets / Jour" 
            value={stats?.ticketsAujourdhui ?? 0} 
            icon={ArrowUpRight} 
            trend="+8%" 
            trendUp={true} 
            color="emerald" 
           />
           <StatsCard 
            title="Occupation" 
            value={`${stats?.tauxOccupation ?? 0}%`} 
            icon={Zap} 
            trend="Stable" 
            trendUp={true} 
            color="violet" 
           />
           <StatsCard 
            title="Attente Moyenne" 
            value={`${stats?.tempsAttenteMoyen ?? 0} min`} 
            icon={Clock} 
            trend="-2m" 
            trendUp={true} 
            color="amber" 
           />
           <StatsCard 
            title="Médecins" 
            value={stats?.medecinsDisponibles ?? 0} 
            icon={Users} 
            trend="Actifs" 
            trendUp={true} 
            color="blue" 
           />
           <StatsCard 
            title="No-Shows" 
            value={`${stats?.tauxNoShow ?? 0}%`} 
            icon={BarChart4} 
            trend="-1.5%" 
            trendUp={false} 
            color="red" 
           />
           <StatsCard 
            title="Satisfaction" 
            value={`${stats?.tauxSatisfaction ?? 0}%`} 
            icon={BarChart4} 
            trend="+2.1%" 
            trendUp={true} 
            color="violet" 
           />
        </div>

        {/* Main Charts area */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
           <div className="lg:col-span-2 card-premium p-10 flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="section-label mb-2">TRAFIC EN TEMPS RÉEL</h3>
                    <p className="text-xl font-black italic tracking-tight italic">Affluence des tickets (24h)</p>
                 </div>
                 <select className="bg-slate-50 border-none outline-none text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl text-slate-400 cursor-pointer">
                    <option>Aujourd'hui</option>
                    <option>7 jours</option>
                 </select>
              </div>
              <div className="flex-1 w-full opacity-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data}>
                     <defs>
                       <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#0891B2" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} 
                       dy={10}
                     />
                     <YAxis hide={true} />
                     <Tooltip 
                       contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.05)'}}
                       labelStyle={{fontWeight: 900, color: '#0F172A', marginBottom: '4px'}}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="tickets" 
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
                    <p className="text-3xl font-black italic tracking-tighter leading-none text-slate-900">1.2K</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</p>
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={PIE_DATA}
                       innerRadius={70}
                       outerRadius={90}
                       paddingAngle={8}
                       dataKey="value"
                     >
                       {PIE_DATA.map((_entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="w-full mt-8 grid grid-cols-2 gap-4">
                 {PIE_DATA.map((entry, index) => (
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
                 <button className="text-[10px] font-black uppercase tracking-widest text-cyan-600 hover:underline">Voir tout</button>
              </div>
              <div className="space-y-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            Dr
                         </div>
                         <div>
                            <p className="text-sm font-extrabold text-slate-900 italic">Dr. Médical {i}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ophtalmologie</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-slate-900 italic leading-none">42 consultations</p>
                         <div className="flex items-center justify-end gap-1 mt-1 font-bold text-[10px] text-emerald-500">
                             <ArrowUpRight size={10} /> +5.2%
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                 <Zap size={140} strokeWidth={2.5} />
              </div>
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-8">
                    <Zap size={14} className="text-cyan-400 fill-cyan-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">CarePulse Intelligence</p>
                 </div>
                 <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight mb-6">Optimisation via IA active</h2>
                 <p className="text-sm text-white/60 font-medium leading-relaxed max-w-sm mb-10">
                   Le moteur de prédiction ML réduit actuellement le temps d'attente de <span className="text-white font-black italic">~4 minutes</span> par session.
                 </p>
                 <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-50 transition-all flex items-center gap-3">
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
