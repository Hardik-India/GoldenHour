import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { DemoSimulator } from '@/components/landing/DemoSimulator';
import { FeatureBento } from '@/components/landing/FeatureBento';
import { BloodSpotlight } from '@/components/landing/BloodSpotlight';
import { ImpactPreview } from '@/components/landing/ImpactPreview';
import { TrustSafety } from '@/components/landing/TrustSafety';
import { JoinCTA } from '@/components/landing/JoinCTA';
import { Faq } from '@/components/landing/Faq';
import { Footer } from '@/components/landing/Footer';
import { AuthBootstrap } from '@/components/app/AuthBootstrap';

export default function LandingPage() {
  return (
    <main className="relative overflow-x-hidden bg-[#070b15]">
      <AuthBootstrap />
      <Navbar />
      <Hero />

      {/* Rich atmospheric multi-layer canvas below the hero */}
      <div className="relative gh-page-canvas">
        <div className="pointer-events-none absolute inset-0 gh-tactical-grid opacity-40" />
        <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 animate-drift rounded-full bg-alert/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 top-[34%] h-[28rem] w-[28rem] animate-drift rounded-full bg-gold/10 blur-[130px]" />
        <div className="pointer-events-none absolute left-1/3 top-[68%] h-96 w-96 animate-drift rounded-full bg-teal/10 blur-[130px]" />

        <div className="relative z-10">
          <HowItWorks />
          <div className="container-x"><div className="gh-section-divider" /></div>
          <DemoSimulator />
          <div className="container-x"><div className="gh-section-divider" /></div>
          <FeatureBento />
          <div className="container-x"><div className="gh-section-divider" /></div>
          <BloodSpotlight />
          <div className="container-x"><div className="gh-section-divider" /></div>
          <ImpactPreview />
          <div className="container-x"><div className="gh-section-divider" /></div>
          <TrustSafety />
          <JoinCTA />
          <Faq />
          <Footer />
        </div>
      </div>
    </main>
  );
}
