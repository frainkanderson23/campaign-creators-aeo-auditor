import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AEO Auditor — Campaign Creators',
  description:
    'How visible is your brand in AI search? Enter your domain. Get an instant AEO health score.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">
          <div
            style={{ maxWidth: '1120px' }}
            className="mx-auto px-6 py-8 w-full"
          >
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
