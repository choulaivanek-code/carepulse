import React, { useState } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, PlusCircle, Ticket as TicketIcon } from 'lucide-react';
import { ticketApi } from '../../api/ticketApi';
import { useAuthStore } from '../../store/authStore';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { NotificationBell } from '../../components/common/NotificationBell';
import { TicketCard } from '../../components/patient/TicketCard';
import { QueuePosition } from '../../components/patient/QueuePosition';
import { WaitTimeDisplay } from '../../components/patient/WaitTimeDisplay';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmCancelModal } from '../../components/patient/ConfirmCancelModal';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export const PatientDashboard: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: ticketsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['mes-tickets'],
    queryFn: () => ticketApi.getMesTickets(),
    refetchInterval: 30000,
  });

  const tickets = ticketsData?.data?.data ?? [];
  const activeTicket = tickets.find(t =>
    ['WAITING', 'PRESENT', 'READY', 'IN_PROGRESS'].includes(t.statut)
  );

  const onError = (error: unknown) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    toast.error(axiosError.response?.data?.message || 'Une erreur est survenue');
  };

  const confirmerPresenceMutation = useMutation({
    mutationFn: (id: number) => ticketApi.confirmerPresence(id),
    onSuccess: () => {
      toast.success('Présence confirmée !');
      queryClient.invalidateQueries({ queryKey: ['mes-tickets'] });
    },
    onError,
  });

  const signalerAbsenceMutation = useMutation({
    mutationFn: (id: number) => ticketApi.signalerAbsence(id),
    onSuccess: () => {
      toast.success('Absence signalée.');
      queryClient.invalidateQueries({ queryKey: ['mes-tickets'] });
    },
    onError,
  });

  const annulerTicketMutation = useMutation({
    mutationFn: (id: number) => ticketApi.annulerTicket(id),
    onSuccess: () => {
      toast.success('Ticket annulé.');
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ['mes-tickets'] });
    },
    onError: (error: unknown) => {
      setShowCancelModal(false);
      onError(error);
    },
  });

  const handleCancelConfirm = () => {
    if (activeTicket) {
      annulerTicketMutation.mutate(activeTicket.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="animate-fade-in">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight italic">
              Bonjour, {user?.prenom}
            </h1>
            <div className="flex items-center gap-2 mt-2">
               <Calendar size={14} className="text-slate-400" />
               <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
               </p>
            </div>
          </div>
          <NotificationBell />
        </header>

        {isLoading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
             <div className="w-16 h-16 rounded-[24px] bg-red-50 text-red-500 flex items-center justify-center">
                <TicketIcon size={32} />
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Erreur de chargement</p>
             <button onClick={() => refetch()} className="btn-primary py-3 px-8 text-xs">Réessayer</button>
          </div>
        ) : activeTicket ? (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-8">
              <h2 className="section-label">TICKET EN COURS</h2>
              <TicketCard
                ticket={activeTicket}
                onConfirmPresence={() => confirmerPresenceMutation.mutate(activeTicket.id)}
                onMarkAbsent={() => signalerAbsenceMutation.mutate(activeTicket.id)}
                onCancel={() => setShowCancelModal(true)}
                isConfirmingPresence={confirmerPresenceMutation.isPending}
                isMarkingAbsent={signalerAbsenceMutation.isPending}
              />

              <div className="card-premium p-8 bg-gradient-to-br from-cyan-600 to-cyan-800 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black mb-4 tracking-tight italic">Rappel important</h3>
                <p className="text-sm text-white/80 leading-relaxed font-medium">
                  Préparez votre pièce d&rsquo;identité et votre carnet de santé. Votre passage est estimé dans environ {activeTicket.tempsAttenteEstime} minutes.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="section-label">SUIVI EN TEMPS RÉEL</h2>
              <QueuePosition
                current={activeTicket.positionActuelle}
                total={activeTicket.positionActuelle + 5} // Mock total
              />
              <WaitTimeDisplay ticket={activeTicket} />
            </div>
          </div>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-24 h-24 rounded-[32px] bg-white border border-slate-200 shadow-xl flex items-center justify-center mb-8 text-cyan-600">
                <TicketIcon size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
              Aucun ticket actif
            </h2>
            <p className="text-slate-500 font-medium mb-10 max-w-xs leading-relaxed">
              Vous n&rsquo;avez pas de ticket en attente pour le moment. Réservez-en un maintenant !
            </p>
            <Link to="/patient/reserver" className="btn-primary py-4 px-10">
              Réserver un ticket
              <PlusCircle size={20} />
            </Link>
          </div>
        )}
      </main>

      <MobileNav />

      <ConfirmCancelModal
        isOpen={showCancelModal}
        isLoading={annulerTicketMutation.isPending}
        onConfirm={handleCancelConfirm}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  );
};
