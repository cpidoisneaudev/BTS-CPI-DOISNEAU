"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const MATIERES = {
  comportement: "Comportement mécanique",
  construction: "Construction mécanique",
  conception: "Conception mécanique",
  industrialisation: "Industrialisation",
};

const COULEURS = {
  comportement: "text-[#00b4d8] bg-[#00b4d8]/10 border-[#00b4d8]/30",
  construction: "text-[#9d95e8] bg-[#9d95e8]/10 border-[#9d95e8]/30",
  conception: "text-[#1d9e75] bg-[#1d9e75]/10 border-[#1d9e75]/30",
  industrialisation: "text-[#e07b39] bg-[#e07b39]/10 border-[#e07b39]/30",
};

const TYPE_COLORS = {
  cours: "bg-blue-500/20 text-blue-400",
  td: "bg-purple-500/20 text-purple-400",
  tp: "bg-orange-500/20 text-orange-400",
  examen: "bg-red-500/20 text-red-400",
  autre: "bg-gray-500/20 text-gray-400",
};

function grouperParMois(seances) {
  const groupes = {};
  seances.forEach((s) => {
    const dateStr = s.date || "";
    const [annee, mois] = dateStr.split("-");
    const cle = annee && mois ? `${annee}-${mois}` : "Sans date";
    if (!groupes[cle]) groupes[cle] = [];
    groupes[cle].push(s);
  });
  return groupes;
}

function labelMois(cle) {
  if (cle === "Sans date") return "Sans date";
  const [annee, mois] = cle.split("-");
  const date = new Date(Number(annee), Number(mois) - 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).toUpperCase();
}

export default function AdminCahierProfPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { profId } = useParams();

  const [prof, setProf] = useState(null);
  const [seances, setSeances] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filterMatiere, setFilterMatiere] = useState("toutes");

  useEffect(() => {
    if (!loading && userData?.role !== "ADMIN") router.push("/dashboard");
  }, [loading, userData, router]);

  useEffect(() => {
    if (!profId) return;
    const fetchData = async () => {
      try {
        const profDoc = await getDoc(doc(db, "users", profId));
        if (profDoc.exists()) setProf({ id: profDoc.id, ...profDoc.data() });

        const matieres = ["comportement", "construction", "conception", "industrialisation"];
        const toutes = [];
        for (const matiereId of matieres) {
          const q = query(
            collection(db, "cahierTexte", matiereId, "seances"),
            orderBy("date", "desc")
          );
          const snap = await getDocs(q);
          snap.docs.forEach((d) => {
            const data = d.data();
            if (data.profId === profId) {
              toutes.push({ id: d.id, matiereId, ...data });
            }
          });
        }

        toutes.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
        setSeances(toutes);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [profId]);

  const comptage = Object.keys(MATIERES).reduce((acc, id) => {
    acc[id] = seances.filter((s) => s.matiereId === id).length;
    return acc;
  }, {});

  const filtered =
    filterMatiere === "toutes"
      ? seances
      : seances.filter((s) => s.matiereId === filterMatiere);

  const groupes = grouperParMois(filtered);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard" className="text-[#8b949e] hover:text-[#00b4d8] transition-colors">Dashboard</Link>
          <span className="text-[#8b949e]">/</span>
          <Link href="/admin/cahiers" className="text-[#8b949e] hover:text-[#00b4d8] transition-colors">Cahiers de texte</Link>
          <span className="text-[#8b949e]">/</span>
          <span className="text-[#e6edf3]">{prof?.prenom} {prof?.nom}</span>
        </div>

        {/* Header prof */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 mb-6 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-[#00b4d8]/10 border border-[#00b4d8]/30 flex items-center justify-center text-[#00b4d8] font-bold text-lg shrink-0">
            {prof?.prenom?.charAt(0)}{prof?.nom?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-medium text-[#e6edf3]">
              📓 Cahier de texte — {prof?.prenom} {prof?.nom}
            </h1>
            <p className="text-sm text-[#8b949e]">{prof?.email}</p>
            <p className="text-xs text-[#8b949e] mt-1">
              {seances.length} séance{seances.length > 1 ? "s" : ""} enregistrée{seances.length > 1 ? "s" : ""}
            </p>
          </div>
          <span className="text-xs bg-[#f0a500]/10 text-[#f0a500] border border-[#f0a500]/30 px-3 py-1 rounded-full shrink-0">
            Lecture seule
          </span>
        </div>

        {/* Stats par matière */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Object.entries(MATIERES).map(([id, label]) => (
            <div key={id} className={`bg-[#161b22] border border-[#21262d] rounded-xl p-4 ${comptage[id] === 0 ? "opacity-40" : ""}`}>
              <p className="text-2xl font-bold text-[#e6edf3]">{comptage[id] ?? 0}</p>
              <p className="text-xs text-[#8b949e] mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterMatiere("toutes")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filterMatiere === "toutes"
                ? "bg-[#e6edf3] text-[#0d1117] border-[#e6edf3]"
                : "border-[#21262d] text-[#8b949e] hover:border-[#8b949e]"
            }`}
          >
            Toutes ({seances.length})
          </button>
          {Object.entries(MATIERES).map(([id, label]) =>
            comptage[id] > 0 ? (
              <button
                key={id}
                onClick={() => setFilterMatiere(id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  filterMatiere === id ? COULEURS[id] : "border-[#21262d] text-[#8b949e] hover:border-[#8b949e]"
                }`}
              >
                {label} ({comptage[id]})
              </button>
            ) : null
          )}
        </div>

        {/* Tableau identique à la vue prof */}
        {filtered.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-10 text-center">
            <p className="text-[#8b949e] text-sm">Aucune séance enregistrée.</p>
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden">

            {/* En-tête section */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#21262d]">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <h2 className="text-sm font-medium text-[#e6edf3]">Séances enregistrées</h2>
              <span className="ml-auto text-xs text-[#8b949e]">{filtered.length} séance{filtered.length > 1 ? "s" : ""}</span>
            </div>

            {/* En-têtes colonnes */}
            <div className="hidden md:grid grid-cols-[110px_60px_1fr_1fr_1fr_80px_100px] gap-3 px-6 py-3 border-b border-[#21262d] text-xs text-[#8b949e]">
              <span>Date</span>
              <span>Durée</span>
              <span>Séquence</span>
              <span>Contenu</span>
              <span>Objectif (prof)</span>
              <span>Type</span>
              <span>Ressource</span>
            </div>

            {/* Groupes par mois */}
            {Object.entries(groupes).map(([moisCle, seancesDuMois]) => (
              <div key={moisCle}>
                <div className="px-6 py-2 bg-[#0d1117]/50 border-b border-[#21262d]">
                  <span className="text-xs font-semibold text-[#8b949e] tracking-widest">
                    {labelMois(moisCle)}
                  </span>
                </div>

                {seancesDuMois.map((seance) => (
                  <div
                    key={seance.id}
                    className="grid grid-cols-1 md:grid-cols-[110px_60px_1fr_1fr_1fr_80px_100px] gap-3 px-6 py-4 border-b border-[#21262d]/50 hover:bg-[#0d1117]/30 transition-colors items-start"
                  >
                    {/* Date */}
                    <span className="text-xs text-[#8b949e]">{seance.date || "—"}</span>

                    {/* Durée */}
                    <span className="text-xs text-[#e6edf3]">{seance.duree || "—"}</span>

                    {/* Séquence */}
                    <p className="text-xs font-semibold text-[#e6edf3] leading-snug">
                      {seance.sequenceName || seance.sequenceId || "—"}
                    </p>

                    {/* Contenu */}
                    <div className="text-xs text-[#8b949e] leading-relaxed space-y-0.5">
                      {seance.contenuTextes?.length > 0
                        ? seance.contenuTextes.map((t, i) => <p key={i}>{t}</p>)
                        : <span>—</span>}
                    </div>

                    {/* Objectif */}
                    <p className="text-xs text-[#00b4d8] leading-relaxed">
                      {seance.objectif || "—"}
                    </p>

                    {/* Type */}
                    <div>
                      {seance.type ? (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium uppercase ${TYPE_COLORS[seance.type] ?? TYPE_COLORS.autre}`}>
                          {seance.type}
                        </span>
                      ) : <span className="text-[#8b949e] text-xs">—</span>}
                    </div>

                    {/* Ressource */}
                    <div className="text-xs">
                      {seance.fichierUrl ? (
                        <a href={seance.fichierUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[#00b4d8] hover:underline">
                          📄 Fichier
                        </a>
                      ) : seance.lienVideo ? (
                        <a href={seance.lienVideo} target="_blank" rel="noopener noreferrer"
                          className="text-[#00b4d8] hover:underline">
                          ▶️ Vidéo
                        </a>
                      ) : (
                        <span className="text-[#8b949e]">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-[#8b949e] mt-4 text-right">
          {filtered.length} séance{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}