'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const tagColors = {
  'Actualité': 'text-[#00b4d8] bg-[#00b4d8]/10',
  'Examens': 'text-[#00b4d8] bg-[#00b4d8]/10',
  'Projet': 'text-[#e07b39] bg-[#e07b39]/10',
  'Stage': 'text-[#9d95e8] bg-[#9d95e8]/10',
  'Information': 'text-green-400 bg-green-400/10',
};

export default function ActualiteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [actu, setActu] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const fetchActualite = async () => {
      try {
        const docRef = doc(db, 'actualites', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setActu({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push('/actualites');
        }
      } catch (err) {
        console.error(err);
        router.push('/actualites');
      } finally {
        setChargement(false);
      }
    };
    if (id) fetchActualite();
  }, [id, router]);

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!actu) return null;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12">

        {/* Retour */}
        <Link
          href="/actualites"
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm mb-8 inline-block"
        >
          ← Retour aux actualités
        </Link>

        {/* Image */}
        {actu.image && (
          <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden border border-[#21262d] mb-8">
            <Image
              src={actu.image}
              alt={actu.titre}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`text-xs px-3 py-1 rounded-full ${tagColors[actu.tag] || 'text-[#00b4d8] bg-[#00b4d8]/10'}`}>
            {actu.tag}
          </span>
          <span className="text-xs text-[#8b949e]">
            📅 {actu.dateCreation?.toDate?.()?.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) || '—'}
          </span>
          {actu.auteur && (
            <span className="text-xs text-[#8b949e]">
              ✍️ {actu.auteur}
            </span>
          )}
        </div>

        {/* Titre */}
        <h1 className="text-2xl md:text-3xl font-medium text-[#e6edf3] leading-tight mb-6">
          {actu.titre}
        </h1>

        {/* Contenu */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 md:p-8">
          <p className="text-[#8b949e] text-sm leading-relaxed whitespace-pre-wrap">
            {actu.description}
          </p>
        </div>

        {/* Navigation bas */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#21262d]">
          <Link
            href="/actualites"
            className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            ← Toutes les actualités
          </Link>
          <Link
            href="/"
            className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Accueil →
          </Link>
        </div>

      </div>
    </div>
  );
}