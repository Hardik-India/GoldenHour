import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GoldenHour - When every minute counts, someone nearby can save a life',
  description:
    'Community emergency response, live responder tracking, ambulance dispatch and blood donor matching for India.',
};

export const viewport: Viewport = {
  themeColor: '#0B0F1A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
