import React from 'react';
import { Ticket, MapPin, Bell, Stethoscope } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    { icon: Ticket, step: '01', title: 'Prenez un ticket',
      description: 'Choisissez votre clinique, indiquez le motif, recevez votre numéro de file.' },
    { icon: MapPin, step: '02', title: 'Suivez votre position',
      description: 'Consultez en temps réel votre position et le temps estimé depuis votre téléphone.' },
    { icon: Bell, step: '03', title: 'Recevez une notification',
      description: 'Alerté par SMS ou push quand votre tour approche. Déplacez-vous au bon moment.' },
    { icon: Stethoscope, step: '04', title: 'Consultez sereinement',
      description: 'Arrivez juste à temps pour votre consultation, sans attente inutile.' },
  ];

  return (
    <section id="fonctionnement" className="bg-white py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
            Comment ça marche
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground">
            Simple, rapide et efficace
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[4.5rem] left-24 right-24 h-0.5 bg-muted -z-0" />
          
          {steps.map((item) => (
            <div key={item.step} className="text-center relative z-10 group">
              <div className="font-heading text-6xl md:text-7xl font-extrabold text-primary/10 transition-colors group-hover:text-primary/20 mb-[-1.5rem]">
                {item.step}
              </div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transform transition-transform group-hover:scale-110 duration-300 mb-6">
                <item.icon size={28} />
              </div>
              <h4 className="font-heading text-xl font-bold mb-3 text-foreground">
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed px-4">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
