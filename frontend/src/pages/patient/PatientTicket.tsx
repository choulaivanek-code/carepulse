import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, 
  Clock, 
  Share2, 
  Download,
  AlertCircle,
  FileText,
  Ticket as TicketIcon
} from 'lucide-react';
import { ticketApi } from '../../api/ticketApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { TicketCard } from '../../components/patient/TicketCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const STATUTS_ACTIFS = ['WAITING', 'PRESENT', 'READY', 'IN_PROGRESS'];

export const PatientTicket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore(state => state.user);
  
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      if (id) {
        const res = await ticketApi.getTicket(parseInt(id));
        return res.data.data;
      } else {
        const res = await ticketApi.getMesTickets();
        return res.data.data.find(t => STATUTS_ACTIFS.includes(t.statut));
      }
    }
  });

  const handleCopierLien = () => {
    if (!ticket) return;
    const lien = `${window.location.origin}/patient/ticket/${ticket.id}`;
    navigator.clipboard.writeText(lien);
    toast.success('Lien copié !');
  };

  const handleTelechargerPDF = () => {
    if (!ticket || !user) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(8, 145, 178); // cyan-600
    doc.text('CarePulse', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Ticket de Consultation', 105, 30, { align: 'center' });
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.text(`Numéro de ticket : ${ticket.numeroTicket}`, 20, 50);
    doc.text(`Patient : ${user.prenom} ${user.nom}`, 20, 60);
    doc.text(`Service : ${ticket.fileAttenteNom}`, 20, 70);
    doc.text(`Position actuelle : ${ticket.positionActuelle}`, 20, 80);
    doc.text(`Attente estimée : ~${ticket.tempsAttenteEstime} min`, 20, 90);
    doc.text(`Statut : ${ticket.statut}`, 20, 100);
    doc.text(`Date : ${new Date(ticket.heureCreation).toLocaleString('fr-FR')}`, 20, 110);
    doc.text(`Médecin : ${ticket.medecinNom || 'Assignation en cours'}`, 20, 120);
    
    if (ticket.medecinJoursTravail) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Horaires : ${ticket.medecinJoursTravail} (${ticket.medecinHeureDebut?.slice(0, 5)} - ${ticket.medecinHeureFin?.slice(0, 5)})`, 20, 128);
    }

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Merci de rester à proximité de la salle d’attente.', 105, 150, { align: 'center' });
    
    doc.save(`ticket-${ticket.numeroTicket}.pdf`);
    toast.success('PDF téléchargé !');
  };

  const isActive = ticket && STATUTS_ACTIFS.includes(ticket.statut);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-28 lg:pb-10">
        <header className="flex items-center gap-6 mb-12 animate-fade-in">
          <Link to="/patient" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
            Détails du Ticket
          </h1>
        </header>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
        ) : isActive ? (
          <div className="max-w-4xl grid lg:grid-cols-3 gap-10 animate-fade-in">
            <div className="lg:col-span-2 space-y-8">
               <TicketCard 
                ticket={ticket}
                onConfirmPresence={() => {}}
                onMarkAbsent={() => {}}
                onCancel={() => {}}
               />

               <div className="card-premium p-10">
                  <h3 className="text-lg font-black mb-8 tracking-tight italic">Conseils de préparation</h3>
                  <div className="grid gap-6">
                    {[
                      { icon: FileText, title: 'Documents', desc: 'Ayez votre carnet de santé et vos examens précédents à portée de main.' },
                      { icon: AlertCircle, title: 'Consignes', desc: 'Veuillez rester à proximité de la salle d’attente si votre numéro est proche.' },
                      { icon: Clock, title: 'Ponctualité', desc: 'Si vous n’êtes pas présent lors de l’appel, votre ticket sera marqué comme absent.' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-cyan-600 flex items-center justify-center shrink-0">
                          <item.icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 mb-1">{item.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="card-premium p-8 text-center bg-cyan-600 text-white border-none shadow-xl shadow-cyan-600/20">
                  <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                     <Share2 size={24} />
                  </div>
                  <h3 className="text-lg font-black mb-4 tracking-tight">Partager ce ticket</h3>
                  <p className="text-xs text-white/70 mb-8 leading-relaxed font-medium">Envoyez les détails de votre ticket à un proche ou téléchargez-le.</p>
                  <div className="space-y-3">
                    <button 
                      onClick={handleCopierLien}
                      className="w-full py-3 rounded-xl bg-white text-cyan-700 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-50 transition-all border border-cyan-100"
                    >
                       Copier le lien
                    </button>
                    <button 
                      onClick={handleTelechargerPDF}
                      className="w-full py-3 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                       <Download size={14} /> PDF
                    </button>
                  </div>
               </div>

               <div className="card-premium p-8">
                  <h3 className="section-label">ASSISTANCE</h3>
                  <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">Un problème avec votre ticket ? Contactez le secrétariat.</p>
                  <Link to="/patient/messagerie" className="text-xs font-black text-cyan-600 uppercase tracking-widest hover:underline">
                    Ouvrir le chat →
                  </Link>
               </div>
            </div>
          </div>
        ) : (
          <div className="card-premium p-16 lg:p-24 text-center animate-fade-in border-dashed flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-8">
               <TicketIcon size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-400 italic mb-2">Vous n'avez aucun ticket actif pour le moment</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-10 font-medium">Réservez une consultation pour obtenir un nouveau ticket de passage.</p>
            <Link to="/patient/reserver" className="bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-600/20">
               Réserver un ticket
            </Link>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

