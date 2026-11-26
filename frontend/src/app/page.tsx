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
    <main>
      <AuthBootstrap />
      <Navbar />
      <Hero />
      <HowItWorks />
      <DemoSimulator />
      <FeatureBento />
      <BloodSpotlight />
      <ImpactPreview />
      <TrustSafety />
      <JoinCTA />
      <Faq />
      <Footer />
    </main>
  );
}
