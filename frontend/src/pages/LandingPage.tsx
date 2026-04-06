import React from 'react';
import { Header } from '../components/landing/Header';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { CtaSection } from '../components/landing/CtaSection';
import { Footer } from '../components/landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-background selection:bg-primary/10 selection:text-primary">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
