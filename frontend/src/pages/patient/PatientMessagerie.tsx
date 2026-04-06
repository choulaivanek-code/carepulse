import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile,
  Circle,
  MessageSquare
} from 'lucide-react';
import { messageApi } from '../../api/messageApi';
import { ticketApi } from '../../api/ticketApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';

export const PatientMessagerie: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const { user } = useAuthStore();
  const role = user?.role;

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['mes-tickets', role],
    queryFn: () => ticketApi.getMesTickets(),
    enabled: role === 'PATIENT',
  });

  const tickets = ticketsData?.data?.data ?? [];

  const { data: msgData, isLoading: msgLoading, isError: msgError } = useQuery({
    queryKey: ['messages', activeTab],
    queryFn: () => messageApi.getByTicket(activeTab!),
    enabled: !!activeTab,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => messageApi.envoyer(activeTab!, text),
    onSuccess: () => {
      setMessage('');
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeTab) return;
    sendMutation.mutate(message);
  };

  const messages = msgData?.data?.data ?? [];
  const activeTicket = tickets.find((t: any) => t.id === activeTab);
  const isDoctorAssigned = activeTicket?.medecinNom && activeTicket.medecinNom.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 flex flex-col h-screen">
        
        <div className="flex-1 flex overflow-hidden">
          {/* List - Desktop only sidebar */}
          <div className="w-full lg:w-96 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
               <h1 className="text-2xl font-black text-slate-900 tracking-tight italic mb-6">Messages</h1>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="input-standard bg-slate-100/50 border-transparent focus:bg-white pl-11"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {ticketsLoading ? (
                <div className="p-10 text-center"><LoadingSpinner /></div>
              ) : tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full p-6 flex items-center gap-4 text-left border-b border-slate-50 transition-all ${
                    activeTab === t.id ? 'bg-cyan-50/50 border-r-4 border-r-cyan-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-lg shadow-sm">
                      {t.numeroTicket.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">Ticket #{t.numeroTicket}</h4>
                    </div>
                    <p className="text-xs text-slate-500 truncate font-medium">{t.motif}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col bg-slate-50 relative ${!activeTab ? 'hidden lg:flex' : 'flex'}`}>
            {activeTab ? (
              <>
                {/* Header */}
                <header className="h-24 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-black text-slate-900 italic tracking-tight leading-none">Ticket #{tickets.find(t => t.id === activeTab)?.numeroTicket}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                         <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discussion active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors"><Phone size={20} /></button>
                    <button className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors"><Video size={20} /></button>
                    <button className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors"><MoreVertical size={20} /></button>
                  </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {msgLoading ? (
                    <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>
                  ) : msgError ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                       <MessageSquare size={40} strokeWidth={1} />
                       <p className="text-[10px] font-black uppercase tracking-widest">Erreur de chargement des messages</p>
                    </div>
                  ) : (
                    messages.map((m, _idx) => {
                      const isMe = m.expediteurNom === 'Moi';
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                          <div className={`max-w-md ${isMe ? 'order-2' : ''}`}>
                            <div className={`p-5 rounded-3xl shadow-sm text-sm font-medium leading-relaxed ${
                              isMe 
                                ? 'bg-cyan-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
                            }`}>
                              {m.contenu}
                            </div>
                            <p className={`text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                              {m.dateEnvoi}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="p-8 bg-white border-t border-slate-200 shrink-0 mb-20 lg:mb-0">
                  <form onSubmit={handleSend} className="relative">
                     <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors">
                        <Paperclip size={20} />
                     </button>
                     <input 
                       type="text" 
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       disabled={!isDoctorAssigned}
                       placeholder={isDoctorAssigned ? "Écrivez votre message médical..." : "En attente de l'assignation d'un médecin..."}
                       className="input-standard pl-14 pr-32 py-4 h-14 bg-slate-50 border-none rounded-2xl disabled:bg-slate-100 disabled:text-slate-400"
                     />
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button type="button" className="text-slate-400 hover:text-cyan-600 p-2"><Smile size={20} /></button>
                        <button 
                          type="submit" 
                          disabled={!message.trim() || !isDoctorAssigned}
                          className="bg-cyan-600 text-white p-3 rounded-xl hover:bg-cyan-700 transition-all disabled:opacity-50 disabled:bg-slate-300 shadow-lg shadow-cyan-600/20"
                        >
                          <Send size={18} />
                        </button>
                     </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 animate-fade-in">
                 <div className="w-24 h-24 rounded-[36px] bg-white border border-slate-100 shadow-xl flex items-center justify-center mb-8 text-cyan-600/20">
                    <MessageSquare size={48} strokeWidth={1} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight italic mb-4">Sélectionnez une discussion</h2>
                 <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed">
                   Échangez en temps réel avec le secrétariat ou votre médecin traitant.
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

