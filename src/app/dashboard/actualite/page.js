'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function GestionActualitesPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [actualites, setActualites] = useState([]);
  const [chargement, setChargement] = useState(true);

  // Protection — admin et prof uniquement
  useEffect(() => {
    if (!loading && !['ADMIN', 'PROF'].includes(userData?.role)) {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  // Récupérer toutes les actualités
  useEffect(() => {
    const fetchActualites = async () => {
      try {
        const q = query(
          collection(db, 'actualites'),
          orderBy('dateCreation', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActualites(data);
      } catch (err) {
        console.error(err);
      } finally {
        setChargement(false);
      }
    };
    if (userData?.role) fetchActualites();
  }, [userData]);

  // Supprimer une actualité
  const supprimerActualite = async (id) => {
    if (!confirm('Supprimer cette actualité ?')) return;
    try {
      await deleteDoc(doc(db, 'actualites', id));
      setActualites(actualites.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || chargement) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <button
          onClick={() => router.push('/dashboard')}
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm mb-4"
        >
          ← Retour
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-[#e6edf3] mb-1">
              Gestion des actualités
            </h1>
            <p className="text-[#8b949e] text-sm">
              {actualites.length} actualité{actualites.length > 1 ? 's' : ''} publiée{actualites.length > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/dashboard/actualite/ajouter"
            className="bg-[#00b4d8] text-[#0d1117] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0099bb] transition-colors"
          >
            + Ajouter
          </Link>
        </div>

        {/* Liste vide */}
        {actualites.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">📰</div>
            <p className="text-[#8b949e] text-sm mb-4">Aucune actualité publiée.</p>
            <Link
              href="/dashboard/actualite/ajouter"
              className="bg-[#00b4d8] text-[#0d1117] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0099bb] transition-colors"
            >
              Publier une actualité
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {actualites.map((actu) => (
              <div
                key={actu.id}
                className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 flex items-center gap-4 flex-wrap"
              >
                {/* Image miniature */}
                {actu.image ? (
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-[#21262d] flex-shrink-0">
                    <Image
                      src={actu.image}
                      alt={actu.titre}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-16 rounded-lg bg-[#0a2233] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📰</span>
                  </div>
                )}

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#00b4d8] bg-[#00b4d8]/10 px-2 py-0.5 rounded">
                      {actu.tag}
                    </span>
                    <span className="text-xs text-[#8b949e]">
                      {actu.dateCreation?.toDate?.()?.toLocaleDateString('fr-FR') || '—'}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-[#e6edf3] truncate">
                    {actu.titre}
                  </h3>
                  <p className="text-xs text-[#8b949e] truncate mt-1">
                    {actu.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/actualites/${actu.id}`}
                    className="text-xs text-[#8b949e] hover:text-[#e6edf3] border border-[#21262d] px-3 py-2 rounded-lg transition-colors"
                    target="_blank"
                  >
                    👁️ Voir
                  </Link>
                  <Link
                    href={`/dashboard/actualite/modifier/${actu.id}`}
                    className="text-xs text-[#00b4d8] border border-[#00b4d8]/30 px-3 py-2 rounded-lg hover:bg-[#00b4d8]/10 transition-colors"
                  >
                    ✏️ Modifier
                  </Link>
                  <button
                    onClick={() => supprimerActualite(actu.id)}
                    className="text-xs text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    🗑️ Supprimer
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}