import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Akshitha Edutech | Private Sector Job Portal',
  description:
    'Browse verified private-sector job opportunities for freshers and experienced candidates. Direct applications with no candidate registration required.',
  keywords: ['edutech jobs', 'freshers jobs', 'private sector jobs', 'careers', 'akshitha edutech'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
