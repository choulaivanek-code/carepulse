import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Fonctionnement', href: '#fonctionnement' },
    { label: 'Services', href: '#services' },
    { label: 'Aide', href: '#aide' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm h-20 border-b border-border' : 'bg-transparent h-24'
    }`}>
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="rounded-xl bg-primary p-2 text-white transition-transform group-hover:scale-105">
            <Activity size={24} />
          </div>
          <span className="font-heading font-bold text-xl text-foreground">CarePulse</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            to="/login" 
            className="rounded-full border border-border bg-transparent px-6 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-all"
          >
            Se connecter
          </Link>
          <Link 
            to="/register" 
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all shadow-md"
          >
            S'inscrire
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-foreground p-2" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-border p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="text-base font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Link 
              to="/login" 
              className="rounded-full border border-border bg-transparent py-3 text-center font-bold text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Se connecter
            </Link>
            <Link 
              to="/register" 
              className="rounded-full bg-primary py-3 text-center font-bold text-white shadow-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              S'inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
