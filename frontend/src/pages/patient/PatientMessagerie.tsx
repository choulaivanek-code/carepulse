import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, 
  MessageSquare,
  Circle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { messageApi } from '../../api/messageApi';
import { ticketApi } from '../../api/ticketApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';

export const PatientMessagerie: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 1. Fetch active ticket
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['mes-tickets-messagerie'],
    queryFn: () => ticketApi.getMesTickets(),
  });

  const tickets = ticketsData?.data?.data ?? [];
  const activeTicket = tickets.find((t: any) =>
    ['WAITING', 'PRESENT', 'READY', 'IN_PROGRESS'].includes(t.statut)
  );

  // 2. Fetch messages for active ticket
  const { data: msgData, isLoading: msgLoading } = useQuery({
    queryKey: ['messages', activeTicket?.id],
    queryFn: () => messageApi.getByTicket(activeTicket!.id),
    enabled: !!activeTicket?.id,
    refetchInterval: 5000,
  });

  const messages = msgData?.data?.data ?? [];

  // 3. Send message mutation
  const sendMutation = useMutation({
    mutationFn: (text: string) => messageApi.envoyerMessage({ ticketId: activeTicket!.id, contenu: text }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', activeTicket?.id] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeTicket) return;
    sendMutation.mutate(message);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isDoctorAssigned = activeTicket?.medecinNom && activeTicket.medecinNom.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} flex flex-col h-screen transition-all duration-300`}>
        
        {ticketsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : !activeTicket ? (
          /* No active ticket */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-fade-in">
            <div className="w-24 h-24 rounded-[36px] bg-white border border-slate-100 shadow-xl flex items-center justify-center mb-8 text-cyan-600/20">
              <MessageSquare size={48} strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic mb-4">Aucun ticket actif</h2>
            <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed">
              Vous devez avoir un ticket actif pour utiliser la messagerie. Réservez un ticket pour commencer à discuter avec l'équipe médicale.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="h-20 bg-white border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-sm">
                  {activeTicket.numeroTicket?.charAt(0) || 'T'}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 italic tracking-tight leading-none text-sm">
                    Ticket #{activeTicket.numeroTicket}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Circle size={8} className={isDoctorAssigned ? 'fill-emerald-500 text-emerald-500' : 'fill-amber-400 text-amber-400'} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {isDoctorAssigned ? `Dr. ${activeTicket.medecinNom}` : 'En attente d\'assignation'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTicket.fileAttenteNom}</p>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
              {msgLoading ? (
                <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
                  <MessageSquare size={40} className="text-slate-200" strokeWidth={1} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs">
                    Aucun message pour le moment. {isDoctorAssigned ? 'Envoyez le premier message !' : 'Un médecin doit d\'abord être assigné à votre ticket.'}
                  </p>
                </div>
              ) : (
                messages.map((m: any) => {
                  const isMe = m.expediteurId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[75%] lg:max-w-md`}>
                        {!isMe && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            {m.expediteurNom}
                          </p>
                        )}
                        <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                          isMe 
                            ? 'bg-cyan-600 text-white rounded-tr-sm' 
                            : 'bg-white text-slate-900 border border-slate-100 rounded-tl-sm'
                        }`}>
                          {m.contenu}
                        </div>
                        <div className={`flex items-center gap-2 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            {new Date(m.dateEnvoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <span className={`text-[9px] font-bold uppercase tracking-tighter ${m.statut === 'LU' ? 'text-cyan-500' : 'text-slate-300'}`}>
                              {m.statut === 'LU' ? '✓✓ Lu' : '✓ Envoyé'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 lg:p-6 bg-white border-t border-slate-200 shrink-0 mb-20 lg:mb-0">
              {!isDoctorAssigned && (
                <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                    Aucun médecin assigné : votre message sera traité par un agent.
                  </p>
                </div>
              )}
              <form onSubmit={handleSend} className="relative flex gap-3">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="input-standard flex-1 py-4 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-cyan-200 rounded-2xl"
                />
                <button 
                  type="submit" 
                  disabled={!message.trim() || sendMutation.isPending}
                  className="bg-cyan-600 text-white p-4 rounded-2xl hover:bg-cyan-700 transition-all disabled:opacity-50 disabled:bg-slate-300 shadow-lg shadow-cyan-600/20 shrink-0 flex items-center justify-center"
                >
                  {sendMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
};
