import clsx, { ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const DEFAULT_CENTER: [number, number] = [
  Number(process.env.NEXT_PUBLIC_DEFAULT_LAT) || 28.6139,
  Number(process.env.NEXT_PUBLIC_DEFAULT_LNG) || 77.209,
];

export const EMERGENCY_NUMBER = process.env.NEXT_PUBLIC_EMERGENCY_NUMBER || '112';
export const AMBULANCE_NUMBER = process.env.NEXT_PUBLIC_AMBULANCE_NUMBER || '108';

export const formatKm = (km?: number) =>
  km === undefined ? '-' : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

export const formatSeconds = (sec?: number | null) => {
  if (sec === undefined || sec === null) return '-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const timeAgo = (iso: string) => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
};
