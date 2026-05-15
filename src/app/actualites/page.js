'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const tagColors = {
  'Actualité': 'text-[#00b4d8] bg-[#00b4d8]/10',
  'Examens': 'text-[#00b4d8] bg-[#00b4d8]/10',
  'Projet': 'text-[#e07b39] bg-[#e07b39]/10',
  'Stage': 'text-[#9d95e8] bg-[#9d95e8]/10',
  'Information': 'text-green-400 bg-green-400/10',
};

export default function ActualitesPage() {
  const [actualites, setActualites] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('TOUS');

  const tags = ['TOUS', 'Actualité', 'Examens', 'Projet', 'Stage', 'Information'];

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
    fetchActualites();
  }, []);

  const actualitesFiltrees = actualites.filter(a =>
    filtre === 'TOUS' ? true : a.tag === filtre
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <Link
          href="/"
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm mb-6 inline-block"
        >
          ← Retour à l&apos;accueil
        </Link>
        <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-2">Actualités</p>
        <h1 className="text-2xl md:text-3xl font-medium text-[#e6edf3] mb-2">
          Toutes les actualités
        </h1>
        <p className="text-[#8b949e] text-sm mb-8">
          {actualites.length} actualité{actualites.length > 1 ? 's' : ''} publiée{actualites.length > 1 ? 's' : ''}
        </p>

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap mb-8">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFiltre(tag)}
              className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                filtre === tag
                  ? 'bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]'
                  : 'bg-[#161b22] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]'
              }`}
            >
              {tag === 'TOUS' ? '📋 Tous' : tag}
              {' '}({tag === 'TOUS' ? actualites.length : actualites.filter(a => a.tag === tag).length})
            </button>
          ))}
        </div>

        {/* Chargement */}
        {chargement ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : actualitesFiltrees.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-12 text-center">
            <p className="text-[#8b949e] text-sm">Aucune actualité dans cette catégorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actualitesFiltrees.map((actu) => (
              <div
                key={actu.id}
                className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-[#00b4d8]/30 transition-colors"
              >
                {/* Image */}
                {actu.image ? (
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={actu.image}
                      alt={actu.titre}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-[#0a2233] flex items-center justify-center">
                    <span className="text-3xl">📰</span>
                  </div>
                )}

                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${tagColors[actu.tag] || 'text-[#00b4d8] bg-[#00b4d8]/10'}`}>
                      {actu.tag}
                    </span>
                    <span className="text-xs text-[#8b949e]">
                      {actu.dateCreation?.toDate?.()?.toLocaleDateString('fr-FR') || '—'}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-[#e6edf3] leading-snug mb-2">
                    {actu.titre}
                  </h3>
                  <p className="text-xs text-[#8b949e] leading-relaxed line-clamp-2">
                    {actu.description}
                  </p>
                  <Link
                    href={`/actualites/${actu.id}`}
                    className="text-xs text-[#00b4d8] mt-3 hover:underline inline-block"
                  >
                    Lire la suite →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}