import React, { useState, useMemo } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { 
  FileDown, 
  Download, 
  Calendar, 
  Search, 
  Users, 
  Ticket as TicketIcon, 
  Clock, 
  TrendingUp,
  AlertCircle,
  BarChart4,
  PieChart as PieChartIcon,
  Activity,
  User as UserIcon
} from 'lucide-react';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../api/statsApi';
import { StatsCard } from '../../components/admin/StatsCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const COLORS = ['#0891B2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const AdminRapports: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const [periode, setPeriode] = useState('7'); // '7', '30', 'today', 'month', 'custom'
  const [customRange, setCustomRange] = useState({ debut: '', fin: '' });
  const [isExporting, setIsExporting] = useState(false);

  const queryParams = useMemo(() => {
    if (periode === 'custom') {
      return { dateDebut: customRange.debut, dateFin: customRange.fin };
    }
    if (periode === 'today') return { jours: 0 };
    if (periode === 'month') return { jours: 30 }; // Simplified
    return { jours: parseInt(periode) };
  }, [periode, customRange]);

  const { data: rapportsResponse, isLoading, isError } = useQuery({
    queryKey: ['rapports', queryParams],
    queryFn: () => statsApi.getRapports(queryParams),
    enabled: periode !== 'custom' || (!!customRange.debut && !!customRange.fin),
  });

  const rapports = rapportsResponse?.data?.data;

  const handlePeriodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriode(e.target.value);
  };

  const validateCustomRange = () => {
    if (!customRange.debut || !customRange.fin) return false;
    if (new Date(customRange.fin) < new Date(customRange.debut)) {
      toast.error("La date de fin doit être après la date de début");
      return false;
    }
    return true;
  };

  const exportCSV = () => {
    if (!rapports?.listeTickets) return;
    
    setIsExporting(true);
    try {
      const headers = ['Date', 'Numéro Ticket', 'Patient', 'Service', 'Statut', 'Temps Attente (min)', 'Médecin'];
      const rows = rapports.listeTickets.map((t: any) => [
        new Date(t.heureCreation).toLocaleString('fr-FR'),
        t.numeroTicket,
        t.patientNom,
        t.fileAttente,
        t.statut,
        t.tempsAttenteEstime,
        t.medecinNom
      ]);

      const csvContent = [
        headers.join(';'),
        ...rows.map((row: any[]) => row.join(';'))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport-carepulse-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exporté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = () => {
    if (!rapports) return;
    
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(8, 145, 178); // Cyan-600
      doc.setFont('helvetica', 'bold');
      doc.text('CarePulse', 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text('Système de Gestion de File d\'Attente', 20, 27);
      
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.line(20, 35, pageWidth - 20, 35);
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text('Rapport d\'Activité Clinique', 20, 50);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const periodeLabel = periode === 'custom' ? `${customRange.debut} au ${customRange.fin}` : `${periode} derniers jours`;
      doc.text(`Période : ${periodeLabel}`, 20, 60);
      doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 20, 67);
      
      // KPIs
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.roundedRect(20, 75, pageWidth - 40, 45, 5, 5, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Indicateurs Clés (KPIs)', 30, 85);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Tickets : ${rapports.totalTickets}`, 30, 95);
      doc.text(`Taux de Complétion : ${rapports.tauxCompletion}%`, 30, 102);
      doc.text(`Temps Moyen de Consultation : ${rapports.tempsMoyen} min`, pageWidth / 2, 95);
      doc.text(`Taux de No-Show : ${rapports.tauxNoShow}%`, pageWidth / 2, 102);
      
      // Medecin Performance Table (Limited)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Médecins', 20, 140);
      
      let y = 150;
      doc.setFontSize(9);
      doc.text('Médecin', 20, y);
      doc.text('Spécialité', 70, y);
      doc.text('Tickets', 120, y);
      doc.text('Moy (min)', 150, y);
      doc.text('Sat.', 180, y);
      
      doc.line(20, y + 2, pageWidth - 20, y + 2);
      y += 10;
      
      rapports.performancesMedecins.slice(0, 10).forEach((m: any) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'normal');
        doc.text(m.medecin, 20, y);
        doc.text(m.specialite, 70, y);
        doc.text(m.consultations.toString(), 120, y);
        doc.text(m.tempsMoyen.toString(), 150, y);
        doc.text(m.satisfaction, 180, y);
        y += 8;
      });
      
      doc.save(`rapport-carepulse-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF exporté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export PDF");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const NoData = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
      <AlertCircle size={32} opacity={0.5} />
      <p className="text-[10px] font-black uppercase tracking-widest">Aucune donnée pour cette période</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 animate-fade-in">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Rapports & Analyses</h1>
            <p className="text-slate-500 font-medium mt-1">Gérez vos performances et exportez vos données cliniques</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={exportCSV}
              disabled={isLoading || !rapports || isExporting}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
             >
               CSV <Download size={14} />
             </button>
             <button 
              onClick={exportPDF}
              disabled={isLoading || !rapports || isExporting}
              className="px-6 py-3 bg-slate-900 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
             >
               Exporter PDF <FileDown size={14} />
             </button>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 mb-12 flex flex-col lg:flex-row items-end gap-6 animate-fade-in shadow-sm">
           <div className="w-full lg:w-max space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Période
              </label>
              <select 
                value={periode} 
                onChange={handlePeriodeChange}
                className="input-standard h-12 min-w-[200px]"
              >
                <option value="0">Aujourd'hui</option>
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="month">Ce mois</option>
                <option value="custom">Personnalisé</option>
              </select>
           </div>

           {periode === 'custom' && (
             <>
               <div className="w-full lg:w-max space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Début</label>
                  <input 
                    type="date" 
                    value={customRange.debut}
                    onChange={(e) => setCustomRange({...customRange, debut: e.target.value})}
                    className="input-standard h-12"
                  />
               </div>
               <div className="w-full lg:w-max space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Fin</label>
                  <input 
                    type="date" 
                    value={customRange.fin}
                    onChange={(e) => setCustomRange({...customRange, fin: e.target.value})}
                    className="input-standard h-12"
                  />
               </div>
               <button 
                onClick={() => validateCustomRange()}
                className="btn-primary h-12 px-6 flex items-center gap-2"
               >
                 <Search size={16} /> Appliquer
               </button>
             </>
           )}

           {isLoading && (
             <div className="flex items-center gap-3 ml-auto text-cyan-600 font-bold text-[10px] uppercase tracking-widest animate-pulse">
                Chargement des données...
             </div>
           )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in">
           <StatsCard 
            title="Total Tickets" 
            value={isLoading ? '...' : rapports?.totalTickets ?? 0} 
            icon={TicketIcon} 
            color="cyan" 
           />
           <StatsCard 
            title="Taux Complétion" 
            value={isLoading ? '...' : `${rapports?.tauxCompletion ?? 0}%`} 
            icon={Activity} 
            color="emerald" 
           />
           <StatsCard 
            title="Temps Moyen" 
            value={isLoading ? '...' : `${rapports?.tempsMoyen ?? 0}m`} 
            icon={Clock} 
            color="amber" 
           />
           <StatsCard 
            title="Taux No-Show" 
            value={isLoading ? '...' : `${rapports?.tauxNoShow ?? 0}%`} 
            icon={TrendingUp} 
            color="red" 
           />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12 animate-fade-in">
           {/* Chart 1: Tickets par jour */}
           <div className="card-premium p-10 h-[400px] flex flex-col">
              <h3 className="section-label mb-8">TICKETS PAR JOUR</h3>
              <div className="flex-1 w-full">
                {rapports?.ticketsParJour?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rapports.ticketsParJour}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="value" fill="#0891B2" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <NoData />}
              </div>
           </div>

           {/* Chart 2: Répartition Services */}
           <div className="card-premium p-10 h-[400px] flex flex-col">
              <h3 className="section-label mb-8">RÉPARTITION PAR SERVICE</h3>
              <div className="flex-1 w-full relative">
                {rapports?.repartitionServices?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rapports.repartitionServices}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="label"
                      >
                        {rapports.repartitionServices.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <NoData />}
              </div>
           </div>

           {/* Chart 3: Tickets par heure */}
           <div className="card-premium p-10 h-[400px] flex flex-col">
              <h3 className="section-label mb-8">AFFLUENCE HORAIRE (24H)</h3>
              <div className="flex-1 w-full">
                {rapports?.ticketsParHeure?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rapports.ticketsParHeure}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0891B2" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#0891B2" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <NoData />}
              </div>
           </div>

           {/* Chart 4: No-show par jour */}
           <div className="card-premium p-10 h-[400px] flex flex-col">
              <h3 className="section-label mb-8">TENDANCE NO-SHOW</h3>
              <div className="flex-1 w-full">
                {rapports?.noShowParJour?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rapports.noShowParJour}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="stepAfter" dataKey="value" stroke="#EF4444" strokeWidth={3} dot={{r: 4, fill: '#EF4444'}} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <NoData />}
              </div>
           </div>
        </div>

        {/* Physician Table */}
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm animate-fade-in">
           <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Performance des Médecins</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Données agrégées sur la période sélectionnée</p>
              </div>
              <Users className="text-slate-200" size={32} />
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                       <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Médecin</th>
                       <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Spécialité</th>
                       <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Consultations</th>
                       <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Temps Moyen</th>
                       <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Satisfaction</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-10 py-6 h-16 bg-slate-50/30"></td>
                        </tr>
                      ))
                    ) : (rapports?.performancesMedecins && rapports.performancesMedecins.length > 0) ? (
                      rapports.performancesMedecins.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-xl text-slate-400">
                                  <UserIcon size={16} />
                                </div>
                                <span className="text-sm font-extrabold text-slate-900 italic">{m.medecin}</span>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                                {m.specialite}
                              </span>
                           </td>
                           <td className="px-10 py-6 text-center">
                              <span className="text-sm font-black text-slate-900">{m.consultations}</span>
                           </td>
                           <td className="px-10 py-6 text-center">
                              <span className="text-sm font-bold text-slate-600">{m.tempsMoyen} min</span>
                           </td>
                           <td className="px-10 py-6 text-center">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                                m.satisfaction === 'N/A' ? 'bg-slate-100 text-slate-400' :
                                parseFloat(m.satisfaction) >= 4 ? 'bg-emerald-50 text-emerald-600' : 
                                'bg-amber-50 text-amber-600'
                              }`}>
                                {m.satisfaction}
                              </div>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                         <td colSpan={5} className="px-10 py-20 text-center">
                            <NoData />
                         </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
