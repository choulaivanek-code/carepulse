import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Plateforme': [
      { label: 'Fonctionnement', href: '#fonctionnement' },
      { label: 'Services', href: '#services' },
      { label: 'Sécurité & confidentialité', href: '#' },
      { label: 'À propos', href: '#' },
    ],
    'Support': [
      { label: "Centre d'aide", href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Mentions légales', href: '#' },
      { label: 'Politique RGPD', href: '#' },
    ],
  };

  const socialIcons = [
    { name: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
    { name: 'Twitter', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
    { name: 'LinkedIn', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M2 4a2 2 0 1 1 2 2 2 2 0 0 1-2-2z' },
  ];

  return (
    <footer className="bg-foreground text-white pt-20 pb-10 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-2 text-white shadow-lg shadow-primary/20">
                <Activity size={24} />
              </div>
              <span className="font-heading font-bold text-xl">CarePulse</span>
            </Link>
            <p className="text-sm text-white/50 mt-8 leading-relaxed max-w-xs font-medium">
              CarePulse redéfinit l'expérience hospitalière par l'innovation technologique et l'excellence opérationnelle. 
              Gérez votre file d'attente en toute simplicité.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h5 className="font-heading text-base font-bold mb-8 tracking-tight">Plateforme</h5>
            <ul className="space-y-4">
              {footerLinks['Plateforme'].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/50 hover:text-primary transition-colors font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h5 className="font-heading text-base font-bold mb-8 tracking-tight">Support</h5>
            <ul className="space-y-4">
              {footerLinks['Support'].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/50 hover:text-primary transition-colors font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h5 className="font-heading text-base font-bold mb-8 tracking-tight">Réseaux sociaux</h5>
            <div className="flex gap-4">
              {socialIcons.map((icon) => (
                <a 
                  key={icon.name}
                  href="#" 
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-primary transition-all hover:-translate-y-1 block shadow-lg active:scale-95"
                  aria-label={icon.name}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon.path} />
                  </svg>
                </a>
              ))}
            </div>
            <p className="mt-8 text-xs text-white/30 leading-relaxed max-w-[200px]">
              Suivez-nous pour les dernières actualités et mises à jour système.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-10 text-center">
          <p className="text-xs text-white/30 font-medium uppercase tracking-[0.2em]">
            © {currentYear} CarePulse — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
};
