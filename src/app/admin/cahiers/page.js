"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MATIERES_LABELS = {
  comportement: "Comportement mécanique",
  construction: "Construction mécanique",
  conception: "Conception mécanique",
  industrialisation: "Industrialisation",
};

export default function AdminCahiersPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [profs, setProfs] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && userData?.role !== "ADMIN") router.push("/dashboard");
  }, [loading, userData, router]);

  useEffect(() => {
    const fetchProfs = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "PROF"),
          where("statut", "==", "actif")
        );
        const snap = await getDocs(q);
        setProfs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Erreur fetch profs:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfs();
  }, []);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="mb-2">
          <Link href="/dashboard" className="text-[#8b949e] hover:text-[#00b4d8] text-sm transition-colors">
            ← Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-[#e6edf3]">📓 Cahiers de texte</h1>
            <p className="text-[#8b949e] text-sm mt-1">Sélectionnez un professeur pour voir son cahier</p>
          </div>
          <span className="text-xs bg-[#f0a500]/10 text-[#f0a500] border border-[#f0a500]/30 px-3 py-1 rounded-full">
            Lecture seule
          </span>
        </div>

        {profs.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-10 text-center">
            <p className="text-[#8b949e] text-sm">Aucun professeur actif trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profs.map((prof) => (
              <Link
                key={prof.id}
                href={`/admin/cahiers/${prof.id}`}
                className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 hover:border-[#00b4d8]/40 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#00b4d8]/10 border border-[#00b4d8]/30 flex items-center justify-center text-[#00b4d8] font-bold text-sm shrink-0">
                    {prof.prenom?.charAt(0)}{prof.nom?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#e6edf3] group-hover:text-[#00b4d8] transition-colors">
                      {prof.prenom} {prof.nom}
                    </p>
                    <p className="text-xs text-[#8b949e] truncate">{prof.email}</p>
                    {/* Matières du prof */}
                    {prof.matieres?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prof.matieres.map((m) => (
                          <span key={m} className="text-[10px] bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded">
                            {MATIERES_LABELS[m] ?? m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#8b949e]">Voir le cahier de texte</span>
                  <span className="text-[#00b4d8] text-sm group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}