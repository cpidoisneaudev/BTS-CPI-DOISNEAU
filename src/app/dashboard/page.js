'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Cartes étudiant
const cartesEtudiant = [
  { titre: 'Comportement mécanique', icon: '⚙️', href: '/dashboard/matiere/comportement', desc: 'Cours, TD, TP et examens' },
  { titre: 'Construction mécanique', icon: '📐', href: '/dashboard/matiere/construction', desc: 'Cours, TD, TP et examens' },
  { titre: 'Conception mécanique', icon: '🖥️', href: '/dashboard/matiere/conception', desc: 'Cours, TD, TP et examens' },
  { titre: 'Industrialisation', icon: '🏭', href: '/dashboard/matiere/industrialisation', desc: 'Cours, TD, TP et examens' },
];

// Cartes prof
const cartesProf = [
  { titre: 'Mes cours', icon: '📚', href: '/dashboard/cours', desc: 'Gérer mes cours et ressources' },
  { titre: 'Ajouter un cours', icon: '➕', href: '/dashboard/cours/ajouter', desc: 'Uploader un nouveau fichier' },
  { titre: 'Gérer les actualités', icon: '📰', href: '/dashboard/actualite', desc: 'Ajouter, modifier, supprimer' },
  { titre: 'Liens YouTube', icon: '▶️', href: '/dashboard/youtube', desc: 'Gérer les vidéos' },
];

// Cartes admin
const cartesAdmin = [
  { titre: 'Comptes en attente', icon: '⏳', href: '/admin/validation', desc: 'Valider les nouveaux comptes', color: 'border-[#e07b39]/30 hover:border-[#e07b39]/60' },
  { titre: 'Gérer les utilisateurs', icon: '👥', href: '/admin/utilisateurs', desc: 'Voir et modifier les rôles', color: 'border-[#9d95e8]/30 hover:border-[#9d95e8]/60' },
  { titre: 'Gérer les actualités', icon: '📰', href: '/dashboard/actualite', desc: 'Ajouter, modifier, supprimer', color: 'border-[#00b4d8]/30 hover:border-[#00b4d8]/60' },
  { titre: 'Ajouter un cours', icon: '➕', href: '/dashboard/cours/ajouter', desc: 'Uploader un nouveau fichier', color: 'border-[#00b4d8]/30 hover:border-[#00b4d8]/60' },
  { titre: 'Comportement mécanique', icon: '⚙️', href: '/dashboard/matiere/comportement', desc: 'Voir les cours', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
  { titre: 'Construction mécanique', icon: '📐', href: '/dashboard/matiere/construction', desc: 'Voir les cours', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
  { titre: 'Conception mécanique', icon: '🖥️', href: '/dashboard/matiere/conception', desc: 'Voir les cours', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
  { titre: 'Industrialisation', icon: '🏭', href: '/dashboard/matiere/industrialisation', desc: 'Voir les cours', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
];

export default function DashboardPage() {
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  // Compte en attente
  if (userData?.statut === 'en_attente') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[#161b22] border border-[#21262d] rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-lg font-medium text-[#e6edf3] mb-3">
            Compte en attente de validation
          </h2>
          <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
            Votre compte a bien été créé. L&apos;administration du lycée Robert Doisneau va valider votre accès prochainement.
          </p>
          <div className="bg-[#0d1117] rounded-lg p-4 border border-[#21262d] mb-4">
            <p className="text-xs text-[#8b949e]">
              Connecté en tant que <span className="text-[#00b4d8]">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-[#8b949e] hover:text-red-400 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // Compte refusé
  if (userData?.statut === 'refusé') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[#161b22] border border-red-500/20 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-lg font-medium text-[#e6edf3] mb-3">
            Accès refusé
          </h2>
          <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
            Votre demande d&apos;accès a été refusée par l&apos;administration du lycée Robert Doisneau.
          </p>
          <div className="bg-[#0d1117] rounded-lg p-4 border border-[#21262d] mb-6">
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Pour toute question, contactez l&apos;administration du lycée directement.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/contact"
              className="w-full bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-2.5 rounded-lg hover:bg-[#0099bb] transition-colors"
            >
              Contacter l&apos;administration
            </Link>
            <button
              onClick={async () => { await logout(); router.push('/'); }}
              className="w-full border border-[#21262d] text-[#8b949e] text-sm py-2.5 rounded-lg hover:border-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prénom depuis Firestore (userData) ou Firebase Auth (user)
  const prenom = userData?.prenom || user?.displayName?.split(' ')[0] || '';

  // Choix des cartes selon le rôle
  const cartes = userData?.role === 'ADMIN'
    ? cartesAdmin
    : userData?.role === 'PROF'
    ? cartesProf
    : cartesEtudiant;

  const titreRole = userData?.role === 'ADMIN'
    ? 'Tableau de bord Admin'
    : userData?.role === 'PROF'
    ? 'Tableau de bord Professeur'
    : 'Tableau de bord Étudiant';

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          {user?.photoURL && (
            <Image
              src={user.photoURL}
              alt={user.displayName || 'Avatar'}
              width={48}
              height={48}
              className="rounded-full border border-[#21262d]"
            />
          )}
          <div>
            <h1 className="text-2xl font-medium text-[#e6edf3]">
              Bonjour, <span className="text-[#00b4d8]">{prenom}</span> 👋
            </h1>
            <p className="text-[#8b949e] text-sm">{titreRole}</p>
          </div>
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cartes.map((carte, index) => (
            <Link
              key={index}
              href={carte.href}
              className={`bg-[#161b22] border rounded-xl p-6 transition-colors group ${
                carte.color || 'border-[#21262d] hover:border-[#00b4d8]/30'
              }`}
            >
              <div className="text-3xl mb-4">{carte.icon}</div>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-2 group-hover:text-[#00b4d8] transition-colors">
                {carte.titre}
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                {carte.desc}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}