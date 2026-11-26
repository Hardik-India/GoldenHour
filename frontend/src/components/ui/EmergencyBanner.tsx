import { AMBULANCE_NUMBER, EMERGENCY_NUMBER } from '@/lib/utils';

export function EmergencyBanner() {
  return (
    <div className="rounded-2xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-white/85">
      GoldenHour supports emergency services. It does not replace them. Always call{' '}
      <a className="font-semibold text-alert-soft underline" href={`tel:${EMERGENCY_NUMBER}`}>
        {EMERGENCY_NUMBER}
      </a>{' '}
      or{' '}
      <a className="font-semibold text-alert-soft underline" href={`tel:${AMBULANCE_NUMBER}`}>
        {AMBULANCE_NUMBER}
      </a>{' '}
      first.
    </div>
  );
}
