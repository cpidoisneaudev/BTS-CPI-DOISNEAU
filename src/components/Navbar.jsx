'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [comptesEnAttente, setComptesEnAttente] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (userData?.role !== 'ADMIN') return;
    const q = query(collection(db, 'users'), where('statut', '==', 'en_attente'));
    const unsubscribe = onSnapshot(q, (snapshot) => setComptesEnAttente(snapshot.size));
    return () => unsubscribe();
  }, [userData]);

  const publicLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/formation', label: 'Formation' },
    { href: '/epreuves', label: 'Épreuves' },
    { href: '/stages', label: 'Stage' },
    { href: '/projet', label: 'Projet' },
    { href: '/contact', label: 'Contact' },
  ];

  const privateLinks = [
    { href: '/dashboard/ressources', label: 'Ressources' },
    { href: '/equipe', label: 'Équipe' },
    { href: '/logiciels', label: 'Logiciels' },
    { href: '/stages', label: 'Stage' },
    { href: '/dashboard/projet', label: 'Projet' },
    { href: '/Epreuves', label: 'Epreuves' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const Avatar = ({ size = 32 }) => {
    const photo = userData?.photoUrl || user?.photoURL;
    if (photo) {
      return (
        <Image src={photo} alt={user.displayName || 'Avatar'} width={size} height={size}
          className="rounded-full" style={{ objectFit: 'cover', border: '1px solid var(--border)' }} />
      );
    }
    return (
      <div style={{ width: size, height: size, backgroundColor: 'var(--cyan)', color: 'var(--bg-primary)' }}
        className="rounded-full flex items-center justify-center font-bold text-xs">
        {userData?.prenom?.charAt(0)}{userData?.nom?.charAt(0)}
      </div>
    );
  };

  const prenom = userData?.prenom || user?.displayName?.split(' ')[0] || '';
  const links = mounted && user ? privateLinks : publicLinks;
  const isLight = mounted && theme === 'light';

  return (
    <nav style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
    }} className="sticky top-0 z-50" suppressHydrationWarning>

      <div className="flex items-center justify-between px-6 md:px-10 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div style={{ backgroundColor: 'var(--cyan)' }} className="w-8 h-8 rounded-md flex items-center justify-center">
            <svg viewBox="0 0 18 18" className="w-4 h-4" style={{ fill: 'var(--bg-primary)' }}>
              <polygon points="9,1 17,5 17,13 9,17 1,13 1,5"/>
            </svg>
          </div>
          <span style={{ color: 'var(--text-primary)' }} className="font-medium text-[15px]">
            CPI <span style={{ color: 'var(--cyan)' }}>Doisneau</span>
          </span>
        </Link>

        {/* Liens desktop */}
        <div className="hidden lg:flex items-center gap-7">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              className="text-sm transition-colors hover:opacity-100"
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)'}
            >
              {link.label}
            </Link>
          ))}

          {/* Notification Admin */}
          {mounted && userData?.role === 'ADMIN' && (
            <Link href="/admin/validation" className="relative flex items-center">
              <span style={{ color: 'var(--text-secondary)' }} className="text-lg">🔔</span>
              {comptesEnAttente > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {comptesEnAttente}
                </span>
              )}
            </Link>
          )}

          {/* Toggle thème */}
          {mounted && (
            <button
              onClick={toggleTheme}
              title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                width: 34,
                height: 34,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {isLight ? '🌙' : '☀️'}
            </button>
          )}

          {/* Si connecté */}
          {mounted && user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                style={{ color: pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                className="text-sm"
              >
                Dashboard
              </Link>

              {userData?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  style={{ color: pathname === '/admin' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  className="text-sm"
                >
                  Admin
                </Link>
              )}

              <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid var(--border)' }}>
                <Avatar size={32} />
                <span style={{ color: 'var(--text-primary)' }} className="text-sm">{prenom}</span>
                <button
                  onClick={handleLogout}
                  style={{ color: 'var(--text-secondary)' }}
                  className="text-xs hover:text-red-400 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              style={{ backgroundColor: 'var(--cyan)', color: 'var(--bg-primary)' }}
              className="text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              Accéder à mon espace
            </Link>
          )}
        </div>

        {/* Burger + toggle mobile */}
        <div className="lg:hidden flex items-center gap-3">
          {mounted && (
            <button
              onClick={toggleTheme}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                width: 32,
                height: 32,
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              {isLight ? '🌙' : '☀️'}
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            aria-label="Menu"
          >
            {isOpen ? (
              <>
                <span style={{ backgroundColor: 'var(--text-primary)' }} className="w-6 h-0.5 rotate-45 translate-y-2 transition-all duration-300"/>
                <span style={{ backgroundColor: 'var(--text-primary)' }} className="w-6 h-0.5 opacity-0 transition-all duration-300"/>
                <span style={{ backgroundColor: 'var(--text-primary)' }} className="w-6 h-0.5 -rotate-45 -translate-y-2 transition-all duration-300"/>
              </>
            ) : (
              <>
                <span style={{ backgroundColor: 'var(--text-primary)' }} className="w-6 h-0.5 transition-all duration-300"/>
                <span style={{ backgroundColor: 'var(--text-primary)' }} className="w-6 h-0.5 transition-all duration-300"/>
                <span style={{ backgroundColor: 'var(--text-primary)' }} className="w-6 h-0.5 transition-all duration-300"/>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
          className="lg:hidden px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              style={{
                color: pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
              className="text-sm py-2"
            >
              {link.label}
            </Link>
          ))}

          {mounted && userData?.role === 'ADMIN' && comptesEnAttente > 0 && (
            <Link
              href="/admin/validation"
              onClick={() => setIsOpen(false)}
              style={{ borderBottom: '1px solid var(--border)' }}
              className="flex items-center gap-2 text-sm py-2 text-red-400"
            >
              🔔 {comptesEnAttente} compte{comptesEnAttente > 1 ? 's' : ''} en attente
            </Link>
          )}

          {mounted && user ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)}
                style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
                className="text-sm py-2">
                Dashboard
              </Link>
              {userData?.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setIsOpen(false)}
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
                  className="text-sm py-2">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3 py-2">
                <Avatar size={32} />
                <span style={{ color: 'var(--text-primary)' }} className="text-sm">{prenom}</span>
              </div>
              <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition-colors text-left py-2">
                Se déconnecter
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)}
              style={{ backgroundColor: 'var(--cyan)', color: 'var(--bg-primary)' }}
              className="text-sm font-medium px-4 py-3 rounded-md text-center mt-2">
              Accéder à mon espace
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}