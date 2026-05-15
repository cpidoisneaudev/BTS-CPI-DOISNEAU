'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [comptesEnAttente, setComptesEnAttente] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userData?.role !== 'ADMIN') return;
    const q = query(
      collection(db, 'users'),
      where('statut', '==', 'en_attente')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComptesEnAttente(snapshot.size);
    });
    return () => unsubscribe();
  }, [userData]);

  const publicLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/programme', label: 'Programme' },
    { href: '/equipe', label: 'Équipe' },
    { href: '/logiciels', label: 'Logiciels' },
    { href: '/stages', label: 'Stages' },
    { href: '/contact', label: 'Contact' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-[#0d1117] border-b border-[#21262d] sticky top-0 z-50" suppressHydrationWarning>

      <div className="flex items-center justify-between px-6 md:px-10 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00b4d8] rounded-md flex items-center justify-center">
            <svg viewBox="0 0 18 18" className="w-4 h-4 fill-[#0d1117]">
              <polygon points="9,1 17,5 17,13 9,17 1,13 1,5"/>
            </svg>
          </div>
          <span className="text-[#e6edf3] font-medium text-[15px]">
            CPI <span className="text-[#00b4d8]">Doisneau</span>
          </span>
        </Link>

        {/* Liens desktop */}
        <div className="hidden lg:flex items-center gap-7">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? 'text-[#e6edf3]'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Notification Admin desktop */}
          {mounted && userData?.role === 'ADMIN' && (
            <Link href="/admin/validation" className="relative flex items-center">
              <span className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-lg">
                🔔
              </span>
              {comptesEnAttente > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {comptesEnAttente}
                </span>
              )}
            </Link>
          )}

          {/* Si connecté */}
          {mounted && user ? (
            <div className="flex items-center gap-4">

              {/* Dashboard */}
              <Link
                href="/dashboard"
                className={`text-sm transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-[#e6edf3]'
                    : 'text-[#8b949e] hover:text-[#e6edf3]'
                }`}
              >
                Dashboard
              </Link>

              {/* Admin uniquement */}
              {userData?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`text-sm transition-colors ${
                    pathname === '/admin'
                      ? 'text-[#e6edf3]'
                      : 'text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  Admin
                </Link>
              )}

              {/* Avatar + nom + logout */}
              <div className="flex items-center gap-3 pl-4 border-l border-[#21262d]">
                {user.photoURL && (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    width={32}
                    height={32}
                    className="rounded-full border border-[#21262d]"
                  />
                )}
                <span className="text-sm text-[#e6edf3]">
                  {user.displayName?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#8b949e] hover:text-red-400 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>

            </div>
          ) : (
            /* Si non connecté */
            <Link
              href="/login"
              className="bg-[#00b4d8] text-[#0d1117] text-sm font-medium px-4 py-2 rounded-md hover:bg-[#0099bb] transition-colors"
            >
              Accéder à mon espace
            </Link>
          )}
        </div>

        {/* Bouton burger mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          aria-label="Menu"
        >
          {isOpen ? (
            <>
              <span className="w-6 h-0.5 bg-[#e6edf3] rotate-45 translate-y-2 transition-all duration-300"/>
              <span className="w-6 h-0.5 bg-[#e6edf3] opacity-0 transition-all duration-300"/>
              <span className="w-6 h-0.5 bg-[#e6edf3] -rotate-45 -translate-y-2 transition-all duration-300"/>
            </>
          ) : (
            <>
              <span className="w-6 h-0.5 bg-[#e6edf3] transition-all duration-300"/>
              <span className="w-6 h-0.5 bg-[#e6edf3] transition-all duration-300"/>
              <span className="w-6 h-0.5 bg-[#e6edf3] transition-all duration-300"/>
            </>
          )}
        </button>

      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="lg:hidden border-t border-[#21262d] bg-[#0d1117] px-6 py-4 flex flex-col gap-4">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-sm py-2 border-b border-[#21262d] transition-colors ${
                pathname === link.href
                  ? 'text-[#e6edf3]'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Notification Admin mobile */}
          {mounted && userData?.role === 'ADMIN' && comptesEnAttente > 0 && (
            <Link
              href="/admin/validation"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm py-2 border-b border-[#21262d] text-red-400"
            >
              🔔 {comptesEnAttente} compte{comptesEnAttente > 1 ? 's' : ''} en attente
            </Link>
          )}

          {mounted && user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-sm py-2 border-b border-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
              >
                Dashboard
              </Link>
              {userData?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-sm py-2 border-b border-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3 py-2">
                {user.photoURL && (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    width={32}
                    height={32}
                    className="rounded-full border border-[#21262d]"
                  />
                )}
                <span className="text-sm text-[#e6edf3]">{user.displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 transition-colors text-left py-2"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="bg-[#00b4d8] text-[#0d1117] text-sm font-medium px-4 py-3 rounded-md hover:bg-[#0099bb] transition-colors text-center mt-2"
            >
              Accéder à mon espace
            </Link>
          )}
        </div>
      )}

    </nav>
  );
}