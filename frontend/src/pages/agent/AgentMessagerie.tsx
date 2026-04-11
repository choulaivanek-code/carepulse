import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, 
  Search, 
  MessageSquare,
  Circle,
  Loader2,
  User as UserIcon
} from 'lucide-react';
import { messageApi } from '../../api/messageApi';
import { ticketApi } from '../../api/ticketApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';

export const AgentMessagerie: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 1. Fetch all active tickets (conversations)
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['agent-tickets-messagerie'],
    queryFn: () => ticketApi.getTousLesTicketsActifs(),
    refetchInterval: 15000,
  });

  const tickets = ticketsData?.data?.data ?? [];
  const filteredTickets = tickets.filter((t: any) => {
    const searchTerm = search.toLowerCase();
    return (
      t.numeroTicket?.toLowerCase().includes(searchTerm) ||
      t.patientNom?.toLowerCase().includes(searchTerm) ||
      t.patientPrenom?.toLowerCase().includes(searchTerm) ||
      t.motif?.toLowerCase().includes(searchTerm)
    );
  });

  const activeTicket = tickets.find((t: any) => t.id === activeTicketId);

  // 2. Fetch messages for active ticket
  const { data: msgData, isLoading: msgLoading } = useQuery({
    queryKey: ['messages', activeTicketId],
    queryFn: () => messageApi.getByTicket(activeTicketId!),
    enabled: !!activeTicketId,
    refetchInterval: 5000,
  });

  const messages = msgData?.data?.data ?? [];

  // 3. Send message mutation
  const sendMutation = useMutation({
    mutationFn: (text: string) => messageApi.envoyerMessage({ ticketId: activeTicketId!, contenu: text }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', activeTicketId] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeTicketId) return;
    sendMutation.mutate(message);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} flex flex-col h-screen transition-all duration-300`}>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left side - Ticket list */}
          <div className={`w-full lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 ${activeTicketId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <h1 className="text-xl font-black text-slate-900 tracking-tight italic mb-4">Conversations</h1>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher par patient..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-standard bg-slate-100/50 border-transparent focus:bg-white pl-11"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {ticketsLoading ? (
                <div className="p-10 text-center"><LoadingSpinner /></div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-10 text-center">
                  <MessageSquare size={32} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucun ticket actif</p>
                </div>
              ) : (
                filteredTickets.map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`w-full p-5 flex items-center gap-4 text-left border-b border-slate-50 transition-all ${
                      activeTicketId === t.id ? 'bg-cyan-50/50 border-r-4 border-r-cyan-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-sm shadow-sm">
                        {t.patientPrenom?.charAt(0) || '?'}{t.patientNom?.charAt(0) || ''}
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">
                          {t.patientPrenom} {t.patientNom}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter shrink-0 ml-2">
                          #{t.numeroTicket}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">{t.motif || 'Pas de motif'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                          t.statut === 'IN_PROGRESS' ? 'bg-emerald-500' : 
                          t.statut === 'READY' ? 'bg-cyan-500' : 'bg-amber-400'
                        }`} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.statut.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right side - Chat Area */}
          <div className={`flex-1 flex flex-col bg-slate-50 relative ${!activeTicketId ? 'hidden lg:flex' : 'flex'}`}>
            {activeTicketId && activeTicket ? (
              <>
                {/* Chat Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    {/* Back button on mobile */}
                    <button 
                      onClick={() => setActiveTicketId(null)} 
                      className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"
                    >
                      ←
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-sm">
                      {activeTicket.patientPrenom?.charAt(0)}{activeTicket.patientNom?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 italic tracking-tight leading-none text-sm">
                        {activeTicket.patientPrenom} {activeTicket.patientNom}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Ticket #{activeTicket.numeroTicket} — {activeTicket.fileAttenteNom}
                        </span>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                  {msgLoading ? (
                    <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
                      <UserIcon size={40} className="text-slate-200" strokeWidth={1} />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs">
                        Aucun message dans cette conversation. Envoyez un message au patient.
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

                {/* Input */}
                <div className="p-4 lg:p-6 bg-white border-t border-slate-200 shrink-0 mb-20 lg:mb-0">
                  <form onSubmit={handleSend} className="flex gap-3">
                    <input 
                      type="text" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Répondre au patient..."
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
            ) : (
              /* No conversation selected */
              <div className="h-full flex flex-col items-center justify-center text-center p-12 animate-fade-in">
                <div className="w-24 h-24 rounded-[36px] bg-white border border-slate-100 shadow-xl flex items-center justify-center mb-8 text-cyan-600/20">
                  <MessageSquare size={48} strokeWidth={1} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic mb-4">Sélectionnez une conversation</h2>
                <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed">
                  Choisissez un ticket dans la liste pour commencer à échanger avec le patient.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
