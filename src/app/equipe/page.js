"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const MATIERES_COLORS = {
  comportement:     { label: "Comportement mécanique", color: "#1D9E75", bg: "#0d2b1f", text: "#5DCAA5", icon: "⚙️" },
  construction:     { label: "Construction mécanique",  color: "#378ADD", bg: "#0d1e2e", text: "#85B7EB", icon: "📐" },
  conception:       { label: "Conception mécanique",    color: "#7F77DD", bg: "#1a1a2e", text: "#AFA9EC", icon: "🖥️" },
  industrialisation:{ label: "Industrialisation",       color: "#BA7517", bg: "#2b1f0d", text: "#EF9F27", icon: "🏭" },
};

export default function EquipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profs, setProfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchProfs = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "PROF"),
          where("statut", "==", "actif")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProfs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfs();
  }, [user]);

  const getInitials = (prenom, nom) =>
    `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-xs text-[#8b949e] tracking-widest uppercase mb-4">
            Lycée Robert Doisneau · BTS CPI
          </p>
          <h1 className="text-4xl md:text-5xl font-medium text-[#e6edf3] mb-4 leading-tight">
            L'équipe{" "}
            <span className="text-[#00b4d8] italic" style={{ fontFamily: "Georgia, serif" }}>
              éducative
            </span>
          </h1>
          <p className="text-[#8b949e] text-base max-w-lg mx-auto leading-relaxed">
            Des enseignants passionnés au service de votre formation en Conception de Produits Industriels.
          </p>
        </div>

        {/* Grille profs */}
        {profs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8b949e] text-sm">Aucun enseignant disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            {profs.map((prof) => {
              const photo = prof.photoUrl || null;
              const initials = getInitials(prof.prenom, prof.nom);
              const matieres = prof.matieres || [];
              const matiereInfo = matieres.length > 0 ? MATIERES_COLORS[matieres[0]] : null;

              return (
                <div
                  key={prof.id}
                  className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden hover:border-[#00b4d8]/40 transition-colors group"
                >
                  {/* Barre couleur */}
                  <div className="h-1" style={{ background: matiereInfo?.color || "#00b4d8" }} />

                  <div className="p-6">
                    {/* Top : photo + nom + matières */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Photo ronde */}
                      {photo ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#21262d] group-hover:border-[#00b4d8]/50 transition-colors flex-shrink-0">
                          <Image
                            src={photo}
                            alt={`${prof.prenom} ${prof.nom}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2 border-[#21262d] flex-shrink-0"
                          style={{
                            background: matiereInfo ? matiereInfo.bg : "#21262d",
                            color: matiereInfo ? matiereInfo.text : "#00b4d8"
                          }}
                        >
                          {initials}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-medium text-[#e6edf3] leading-tight">
                          {prof.prenom} {prof.nom}
                        </h2>
                        <p className="text-xs text-[#8b949e] mb-2">Professeur BTS CPI</p>
                        {/* Badges matières */}
                        <div className="flex flex-wrap gap-1.5">
                          {matieres.map((m) => {
                            const info = MATIERES_COLORS[m];
                            if (!info) return null;
                            return (
                              <span
                                key={m}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                style={{ background: info.bg, color: info.text }}
                              >
                                {info.icon} {info.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {prof.description && (
                      <p className="text-xs text-[#8b949e] leading-relaxed mb-4">
                        {prof.description}
                      </p>
                    )}

                    {/* Footer : email + années */}
                    <div className="flex items-center justify-between border-t border-[#21262d] pt-4">
                      <a
                        href={`mailto:${prof.email}`}
                        className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#00b4d8] transition-colors min-w-0"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <rect x="2" y="4" width="20" height="16" rx="2"/>
                          <path d="M2 7l10 7 10-7"/>
                        </svg>
                        <span className="truncate">{prof.email}</span>
                      </a>
                      {prof.anneesExperience && (
                        <div className="flex items-center gap-1 text-xs text-[#8b949e] flex-shrink-0 ml-3">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                          </svg>
                          {prof.anneesExperience} ans
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats + citation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
            <p className="text-xs text-[#8b949e] uppercase tracking-widest mb-5">L'équipe en chiffres</p>
            <div className="flex flex-col">
              {[
                { label: "Enseignants", val: `${profs.length} professeur${profs.length > 1 ? 's' : ''}` },
                { label: "Étudiants encadrés", val: "80 étudiants" },
                { label: "Matières enseignées", val: "4 disciplines" },
                { label: "Taux de réussite", val: "92 %" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-3 border-b border-[#21262d] last:border-none">
                  <span className="text-sm text-[#8b949e]">{s.label}</span>
                  <span className="text-sm font-medium text-[#e6edf3]">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d1117] border border-[#00b4d8]/20 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-6xl text-[#00b4d8] leading-none mb-4 select-none" style={{ fontFamily: "Georgia, serif" }}>"</div>
              <p className="text-[#e6edf3] text-base leading-relaxed italic" style={{ fontFamily: "Georgia, serif" }}>
                Notre mission est de former des concepteurs capables de relever les défis industriels de demain, armés d'une solide culture technique et d'un esprit d'innovation.
              </p>
            </div>
            <p className="text-xs text-[#8b949e] mt-6">— L'équipe pédagogique BTS CPI</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[#8b949e] text-sm mb-4">Une question pour l'équipe ?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#00b4d8] text-[#0d1117] font-medium text-sm px-6 py-3 rounded-xl hover:bg-[#0099bb] transition-colors"
          >
            Nous contacter →
          </Link>
        </div>

      </div>
    </div>
  );
}