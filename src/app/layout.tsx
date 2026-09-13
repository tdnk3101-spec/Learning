import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import EduguardChatModal from '@/components/chat/EduguardChatModal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EDUguard — Student Discipline Agent | Institutional Due-Process Engine',
  description: 'Statutory student discipline management, 5-point policy mapping, 8-step due-process checklists, secure case files, and anonymous governance analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased`}>
        <AppShell>{children}</AppShell>
        <EduguardChatModal />
      </body>
    </html>
  );
}

