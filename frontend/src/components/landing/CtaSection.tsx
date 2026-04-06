import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, UserPlus } from 'lucide-react';

export const CtaSection: React.FC = () => {
  return (
    <section className="bg-primary py-24 lg:py-32 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-64 -mt-64 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight">
          Besoin d'une consultation maintenant ?
        </h2>
        <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
          Rejoignez des milliers de patients qui profitent d'un parcours de soin modernisé, fluide et serein avec CarePulse.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/login" 
            className="w-full sm:w-auto rounded-full bg-white text-primary px-10 py-5 font-bold hover:bg-white/90 flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <Ticket size={22} />
            <span>Se connecter</span>
          </Link>
          <Link 
            to="/register" 
            className="w-full sm:w-auto rounded-full border-2 border-white/30 bg-transparent text-white px-10 py-5 font-bold hover:bg-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus size={22} />
            <span>Créer un compte gratuit</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
