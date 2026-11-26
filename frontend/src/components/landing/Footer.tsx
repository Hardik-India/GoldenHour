import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { AMBULANCE_NUMBER, EMERGENCY_NUMBER } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 pb-10 pt-16">
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 select-none text-center text-[14vw] font-bold leading-none text-white/[0.03]">
        Every minute counts
      </div>
      <div className="container-x relative grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-white/55">
            A community network for emergency response and blood donation. Built for the first minutes that matter most.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link href="/sos" className="hover:text-gold">Raise an SOS</Link></li>
            <li><Link href="/blood" className="hover:text-gold">Blood Link</Link></li>
            <li><Link href="/first-aid" className="hover:text-gold">First-aid guides</Link></li>
            <li><Link href="/hospitals" className="hover:text-gold">Hospitals</Link></li>
            <li><Link href="/impact" className="hover:text-gold">Impact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Emergency numbers</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="text-alert-soft" href={`tel:${EMERGENCY_NUMBER}`}>{EMERGENCY_NUMBER} - National emergency</a></li>
            <li><a className="text-alert-soft" href={`tel:${AMBULANCE_NUMBER}`}>{AMBULANCE_NUMBER} - Ambulance</a></li>
          </ul>
        </div>
      </div>
      <p className="container-x relative mt-12 text-xs text-white/40">
        GoldenHour supports emergency services. It does not replace them. First-aid content is general guidance and should be
        reviewed by a medical professional before public release. &copy; {new Date().getFullYear()} GoldenHour.
      </p>
    </footer>
  );
}
