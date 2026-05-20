import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/AuthContext';
import { SidebarProvider } from '@/lib/SidebarContext';
import AppShell from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CPI Doisneau — Plateforme pédagogique BTS',
  description: 'Plateforme pédagogique du BTS Conception de Produits Industriels du Lycée Robert Doisneau',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0d1117] min-h-screen`}>
        <AuthProvider>
          <SidebarProvider>
            <AppShell>
              {children}
            </AppShell>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}