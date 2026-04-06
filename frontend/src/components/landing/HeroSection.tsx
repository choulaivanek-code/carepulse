import React, { useState } from 'react';
import { CheckCircle2, Ticket, Users, Clock } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [motif, setMotif] = useState('');
  const [service, setService] = useState('Clinique Saint-Marc - Douala');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif.trim()) {
      alert('Veuillez indiquer votre motif de consultation.');
      return;
    }
    alert(`Ticket confirmé pour le service "${service}". Motif: ${motif}`);
  };

  const stats = [
    { value: '15 000+', label: 'Tickets distribués' },
    { value: '98%', label: 'Satisfaction patients' },
    { value: '-65%', label: "Temps d'attente" },
    { value: '24/7', label: 'Disponibilité' },
  ];

  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold bg-accent text-accent-foreground mb-6">
              <CheckCircle2 size={16} />
              <span>Gestion médicale organisée</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground mb-6">
              Gérez votre passage en clinique <span className="text-primary italic">sans stress</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              CarePulse simplifie votre parcours de soin. Réservez votre ticket en ligne, suivez votre position en temps réel et arrivez juste à temps pour votre consultation.
            </p>

            {/* Ticket Form */}
            <div id="ticket" className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-xl">
              <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                Prendre un ticket maintenant
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Motif de consultation
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Consultation générale" 
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Département / Service
                  </label>
                  <select 
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option>Clinique Saint-Marc - Douala</option>
                    <option>Service Pédiatrie</option>
                    <option>Service Cardiologie</option>
                    <option>Service Dermatologie</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full rounded-xl bg-primary py-4 text-base font-bold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                >
                  <Ticket size={20} />
                  <span>Confirmer mon ticket</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="hidden lg:block relative group">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
                alt="Clinic Interior" 
                className="rounded-3xl shadow-2xl h-[520px] w-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              
              {/* Floating Cards */}
              <div className="absolute -left-6 top-8 rounded-2xl border border-border bg-white px-5 py-4 shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">3 patients</p>
                  <p className="text-[10px] text-muted-foreground font-medium">devant vous</p>
                </div>
              </div>

              <div className="absolute -right-8 top-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white px-5 py-4 shadow-xl flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">~12 min</p>
                  <p className="text-[10px] text-muted-foreground font-medium">temps estimé</p>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-4 rounded-2xl border border-border bg-white px-5 py-4 shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Confirmé</p>
                  <p className="text-[10px] text-muted-foreground font-medium">18 minutes</p>
                </div>
              </div>
            </div>
            
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border bg-white p-6 md:p-8 shadow-sm mt-16 md:mt-24">
          {stats.map((stat, idx) => (
            <div key={stat.label} className={`text-center py-4 ${idx < stats.length - 1 ? 'md:border-r border-border' : ''}`}>
              <p className="font-heading text-2xl md:text-4xl font-extrabold text-primary tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold mt-1 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
