'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const tagColors = {
  'Actualité': 'text-[#00b4d8] bg-[#00b4d8]/10',
  'Examens': 'text-[#00b4d8] bg-[#00b4d8]/10',
  'Projet': 'text-[#e07b39] bg-[#e07b39]/10',
  'Stage': 'text-[#9d95e8] bg-[#9d95e8]/10',
  'Information': 'text-green-400 bg-green-400/10',
};

export default function HomePage() {
  const { user } = useAuth();
  const [actualites, setActualites] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const fetchActualites = async () => {
      try {
        const q = query(
          collection(db, 'actualites'),
          orderBy('dateCreation', 'desc'),
          limit(3)
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

  return (
    <div className="bg-[#0d1117] text-[#e6edf3]">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Texte */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#00b4d8]/10 border border-[#00b4d8]/30 rounded-full px-4 py-1.5 text-xs text-[#00b4d8] mb-6">
            BTS Conception de Produits Industriels — Lycée Robert Doisneau
          </div>
          <h1 className="text-3xl md:text-4xl font-medium leading-tight mb-4">
            La plateforme<br />
            pédagogique du<br />
            <span className="text-[#00b4d8]">BTS CPI</span>
          </h1>
          <p className="text-[#8b949e] text-sm md:text-base leading-relaxed mb-8">
            Cours, TD, TP, examens et ressources pour les étudiants et
            professeurs du lycée Robert Doisneau.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-[#00b4d8] text-[#0d1117] font-medium text-sm px-6 py-3 rounded-lg hover:bg-[#0099bb] transition-colors text-center"
              >
                Mon Dashboard →
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[#00b4d8] text-[#0d1117] font-medium text-sm px-6 py-3 rounded-lg hover:bg-[#0099bb] transition-colors text-center"
              >
                Accéder à mon espace
              </Link>
            )}
            <Link
              href="/programme"
              className="border border-[#30363d] text-[#e6edf3] text-sm px-6 py-3 rounded-lg hover:border-[#8b949e] transition-colors text-center"
            >
              Découvrir le BTS
            </Link>
          </div>
        </div>

        {/* Photo hero */}
        <div className="hidden lg:block relative h-80 rounded-xl overflow-hidden border border-[#21262d]">
          <Image
            src="/hero.png"
            alt="BTS CPI — Lycée Robert Doisneau"
            fill
            className="object-cover"
            priority
          />
        </div>

      </section>

      <div className="border-t border-[#21262d] mx-6 md:mx-10" />

      {/* ACTUALITES */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-14">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-2">Actualités</p>
            <h2 className="text-xl md:text-2xl font-medium text-[#e6edf3] mb-1">
              Dernières nouvelles du BTS CPI
            </h2>
            <p className="text-[#8b949e] text-sm">
              Événements, informations pédagogiques et annonces importantes.
            </p>
          </div>
          <Link
            href="/actualites"
            className="hidden sm:flex items-center gap-2 text-xs text-[#8b949e] hover:text-[#00b4d8] transition-colors border border-[#21262d] hover:border-[#00b4d8]/30 px-4 py-2 rounded-lg"
          >
            Voir toutes →
          </Link>
        </div>

        {chargement ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : actualites.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-12 text-center">
            <p className="text-[#8b949e] text-sm">Aucune actualité pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {actualites.map((actu) => (
                <div
                  key={actu.id}
                  className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-[#00b4d8]/30 transition-colors"
                >
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

            <div className="flex justify-center mt-8 sm:hidden">
              <Link
                href="/actualites"
                className="text-sm text-[#8b949e] hover:text-[#00b4d8] transition-colors border border-[#21262d] hover:border-[#00b4d8]/30 px-6 py-2.5 rounded-lg"
              >
                Voir toutes les actualités →
              </Link>
            </div>
          </>
        )}

      </section>

    </div>
  );
}