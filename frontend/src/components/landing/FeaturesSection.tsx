import React from 'react';
import { 
  Ticket, 
  Clock, 
  Siren, 
  Bell, 
  BarChart3, 
  BrainCircuit, 
  MessageCircle, 
  Smartphone 
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    { icon: Ticket, title: 'Prise de ticket à distance',
      description: 'Réservez votre place dans la file depuis chez vous, sans vous déplacer.' },
    { icon: Clock, title: "Estimation du temps d'attente",
      description: 'Temps estimé précis grâce à notre système intelligent.' },
    { icon: Siren, title: 'Gestion des priorités médicales',
      description: 'Les cas urgents sont automatiquement identifiés et traités en premier.' },
    { icon: Bell, title: 'Notifications en temps réel',
      description: 'Alertes SMS et push quand votre tour approche.' },
    { icon: BarChart3, title: 'Suivi de position en direct',
      description: 'Votre position dans la file à tout moment.' },
    { icon: BrainCircuit, title: 'Intelligence artificielle',
      description: "Notre IA optimise les temps d'attente et anticipe les pics d'affluence." },
    { icon: MessageCircle, title: 'Communication facilitée',
      description: 'Messagerie sécurisée avec le personnel médical.' },
    { icon: Smartphone, title: 'Accessible partout',
      description: 'Mobile, tablette ou ordinateur, selon vos préférences.' },
  ];

  return (
    <section id="services" className="bg-background py-20 lg:py-32 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
            Nos fonctionnalités
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground">
            Une suite complète pour optimiser votre clinique
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="group rounded-3xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
                <feature.icon size={28} />
              </div>
              <h4 className="font-heading text-lg font-bold mb-3 text-foreground tracking-tight">
                {feature.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
