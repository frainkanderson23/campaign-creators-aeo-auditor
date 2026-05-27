import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
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
      className={`${dmSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-6 py-8 w-full">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
