"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const cartesEtudiant = [
  { titre: "Comportement mécanique", icon: "⚙️", href: "/dashboard/matiere/comportement", desc: "Cours, TD, TP et examens" },
  { titre: "Construction mécanique", icon: "📐", href: "/dashboard/matiere/construction", desc: "Cours, TD, TP et examens" },
  { titre: "Conception mécanique", icon: "🖥️", href: "/dashboard/matiere/conception", desc: "Cours, TD, TP et examens" },
  { titre: "Industrialisation", icon: "🏭", href: "/dashboard/matiere/industrialisation", desc: "Cours, TD, TP et examens" },
  { titre: "Toutes les ressources", icon: "📚", href: "/dashboard/ressources", desc: "Cours, TD, TP, examens par matière" },
];

const cartesProf = [
  { titre: "Mes cours", icon: "📚", href: "/dashboard/cours", desc: "Gérer mes cours et ressources" },
  { titre: "Ajouter un cours", icon: "➕", href: "/dashboard/cours/ajouter", desc: "Uploader un nouveau fichier" },
  { titre: "Gérer les actualités", icon: "📰", href: "/dashboard/actualite", desc: "Ajouter, modifier, supprimer" },
  { titre: "Formations & Logiciels", icon: "🎓", href: "/logiciels", desc: "Gérer ateliers et tutoriels SolidWorks, CATIA, RDM6" },
  { titre: "Cahier de texte", icon: "📋", href: "/dashboard/cahier/comportement", desc: "Saisir mes séances et objectifs" },
  { titre: "Toutes les ressources", icon: "📚", href: "/dashboard/ressources", desc: "Voir toutes les ressources publiées" },
];

const cartesAdmin = [
  { titre: 'Comptes en attente', icon: '⏳', href: '/admin/validation', desc: 'Valider les nouveaux comptes', color: 'border-[#e07b39]/30 hover:border-[#e07b39]/60' },
  { titre: 'Gérer les utilisateurs', icon: '👥', href: '/admin/utilisateurs', desc: 'Voir et modifier les rôles', color: 'border-[#9d95e8]/30 hover:border-[#9d95e8]/60' },
  { titre: 'Gérer les actualités', icon: '📰', href: '/dashboard/actualite', desc: 'Ajouter, modifier, supprimer', color: 'border-[#00b4d8]/30 hover:border-[#00b4d8]/60' },
  { titre: 'Ajouter un cours', icon: '➕', href: '/dashboard/cours/ajouter', desc: 'Uploader un nouveau fichier', color: 'border-[#00b4d8]/30 hover:border-[#00b4d8]/60' },
  { titre: 'Référentiel BTS CPI', icon: '📋', href: '/admin/referentiel', desc: 'Conformité cahier de texte vs référentiel', color: 'border-[#1d9e75]/30 hover:border-[#1d9e75]/60' },
  { titre: 'Cahiers de texte', icon: '📓', href: '/admin/cahiers', desc: 'Voir les séances de tous les profs', color: 'border-[#f0a500]/30 hover:border-[#f0a500]/60' },
  { titre: 'Formations & Logiciels', icon: '🎓', href: '/logiciels', desc: 'Gérer ateliers et tutoriels', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
  { titre: 'Comportement mécanique', icon: '⚙️', href: '/dashboard/matiere/comportement', desc: 'Voir les cours', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
  { titre: 'Construction mécanique', icon: '📐', href: '/dashboard/matiere/construction', desc: 'Voir les cours', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
  { titre: 'Conception mécanique', icon: '🖥️', href: '/dashboard/matiere/conception', desc: 'Voir les cours', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
  { titre: 'Industrialisation', icon: '🏭', href: '/dashboard/matiere/industrialisation', desc: 'Voir les cours', color: 'border-[#21262d] hover:border-[#00b4d8]/30' },
];

export default function DashboardPage() {
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profilUpdated = searchParams.get("success") === "profil";
  const [usersEnLigne, setUsersEnLigne] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (userData?.role !== "ADMIN") return;
    const q = query(collection(db, "users"), where("isOnline", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsersEnLigne(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userData?.statut === "en_attente") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[#161b22] border border-[#21262d] rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-lg font-medium text-[#e6edf3] mb-3">Compte en attente de validation</h2>
          <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
            Votre compte a bien été créé. L&apos;administration du lycée Robert Doisneau va valider votre accès prochainement.
          </p>
          <div className="bg-[#0d1117] rounded-lg p-4 border border-[#21262d] mb-4">
            <p className="text-xs text-[#8b949e]">
              Connecté en tant que <span className="text-[#00b4d8]">{user?.email}</span>
            </p>
          </div>
          <button onClick={logout} className="text-xs text-[#8b949e] hover:text-red-400 transition-colors">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  if (userData?.statut === "refusé") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[#161b22] border border-red-500/20 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-lg font-medium text-[#e6edf3] mb-3">Accès refusé</h2>
          <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
            Votre demande d&apos;accès a été refusée par l&apos;administration du lycée Robert Doisneau.
          </p>
          <div className="bg-[#0d1117] rounded-lg p-4 border border-[#21262d] mb-6">
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Pour toute question, contactez l&apos;administration du lycée directement.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/contact" className="w-full bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-2.5 rounded-lg hover:bg-[#0099bb] transition-colors text-center">
              Contacter l&apos;administration
            </Link>
            <button
              onClick={async () => { await logout(); router.push("/"); }}
              className="w-full border border-[#21262d] text-[#8b949e] text-sm py-2.5 rounded-lg hover:border-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const photo = userData?.photoUrl || user?.photoURL || null;
  const prenom = userData?.prenom || user?.displayName?.split(" ")[0] || "";
  const cartes = userData?.role === "ADMIN" ? cartesAdmin : userData?.role === "PROF" ? cartesProf : cartesEtudiant;
  const titreRole = userData?.role === "ADMIN" ? "Tableau de bord Admin" : userData?.role === "PROF" ? "Tableau de bord Professeur" : "Tableau de bord Étudiant";
  const badgeRole = userData?.role === "ADMIN" ? "⚙️ Admin" : userData?.role === "PROF" ? "👨‍🏫 Professeur" : "🎓 Étudiant";

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 md:py-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {photo ? (
            <Image src={photo} alt={user.displayName || "Avatar"} width={48} height={48}
              className="rounded-full border border-[#21262d] flex-shrink-0" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#00b4d8] flex items-center justify-center text-[#0d1117] font-bold text-sm flex-shrink-0">
              {userData?.prenom?.charAt(0)}{userData?.nom?.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-medium text-[#e6edf3] truncate">
              Bonjour, <span className="text-[#00b4d8]">{prenom}</span> 👋
            </h1>
            <p className="text-[#8b949e] text-sm">{titreRole}</p>
          </div>
        </div>

        {/* Message succès profil */}
        {profilUpdated && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-green-400 text-sm">✅ Profil mis à jour avec succès !</p>
          </div>
        )}

        {/* Carte profil */}
        {user && (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 md:p-6 mb-8">
            {/* Layout : colonne sur mobile, ligne sur desktop */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {photo ? (
                    <Image src={photo} alt="Avatar" width={56} height={56}
                      className="rounded-full border-2 border-[#00b4d8]" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#00b4d8] flex items-center justify-center text-[#0d1117] font-bold text-lg">
                      {userData?.prenom?.charAt(0)}{userData?.nom?.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Infos texte */}
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-base font-medium text-[#e6edf3] truncate">
                    {userData?.prenom} {userData?.nom}
                  </p>
                  {/* ✅ FIX : email tronqué avec overflow hidden */}
                  <p className="text-sm text-[#8b949e] truncate max-w-[200px] sm:max-w-none">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/30 px-2 py-0.5 rounded whitespace-nowrap">
                      {badgeRole}
                    </span>
                    {userData?.role === "ETUDIANT" && userData?.promotion && (
                      <span className="text-xs bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded whitespace-nowrap">
                        {userData.promotion === "1ere" ? "1ère année" : "2ème année"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Bouton modifier */}
              <Link
                href="/dashboard/profil"
                className="text-xs text-[#8b949e] border border-[#21262d] px-4 py-2 rounded-lg hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors self-start sm:self-auto whitespace-nowrap"
              >
                ✏️ Modifier mon profil
              </Link>
            </div>
          </div>
        )}

        {/* Utilisateurs en ligne — admin uniquement */}
        {userData?.role === "ADMIN" && (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                <h2 className="text-sm font-medium text-[#e6edf3]">Utilisateurs en ligne</h2>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded">
                  {usersEnLigne.length} connecté{usersEnLigne.length > 1 ? 's' : ''}
                </span>
              </div>
              <Link href="/admin/utilisateurs" className="text-xs text-[#8b949e] hover:text-[#00b4d8] transition-colors">
                Voir tous →
              </Link>
            </div>
            {usersEnLigne.length === 0 ? (
              <p className="text-xs text-[#8b949e]">Aucun utilisateur connecté.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {usersEnLigne.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2">
                    <div className="relative">
                      {u.photoUrl || u.photoURL ? (
                        <Image
                          src={u.photoUrl || u.photoURL}
                          alt={`${u.prenom} ${u.nom}`}
                          width={28} height={28}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#00b4d8] flex items-center justify-center text-[#0d1117] font-bold text-xs">
                          {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-[#0d1117]"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#e6edf3] truncate max-w-[80px]">{u.prenom} {u.nom}</p>
                      <p className="text-[10px] text-[#8b949e]">
                        {u.role === "ADMIN" ? "⚙️ Admin" : u.role === "PROF" ? "👨‍🏫 Prof" : "🎓 Étudiant"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cartes.map((carte, index) => (
            <Link
              key={index}
              href={carte.href}
              className={`bg-[#161b22] border rounded-xl p-6 transition-colors group ${carte.color || "border-[#21262d] hover:border-[#00b4d8]/30"}`}
            >
              <div className="text-3xl mb-4">{carte.icon}</div>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-2 group-hover:text-[#00b4d8] transition-colors">
                {carte.titre}
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">{carte.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}