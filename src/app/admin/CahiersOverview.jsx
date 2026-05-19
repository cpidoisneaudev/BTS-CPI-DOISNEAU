"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MATIERES = {
  comportement: "Comportement mécanique",
  construction: "Construction mécanique",
  conception: "Conception mécanique",
  industrialisation: "Industrialisation",
};

export default function CahiersOverview() {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMatiere, setFilterMatiere] = useState("toutes");

  useEffect(() => {
    const fetchAllSeances = async () => {
      try {
        const q = query(
          collection(db, "seances"),
          orderBy("date", "desc"),
          limit(300)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSeances(data);
      } catch (err) {
        console.error("Erreur fetch séances admin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSeances();
  }, []);

  const filtered =
    filterMatiere === "toutes"
      ? seances
      : seances.filter((s) => s.matiereId === filterMatiere);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📓 Cahiers de texte — Vue admin
        </h2>
        <span className="text-xs text-gray-400 italic">Lecture seule</span>
      </div>

      {/* Filtre matière */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilterMatiere("toutes")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            filterMatiere === "toutes"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Toutes
        </button>
        {Object.entries(MATIERES).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilterMatiere(id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filterMatiere === id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {loading ? (
        <p className="text-gray-400 text-sm">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucune séance enregistrée.</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((seance) => (
            <div
              key={seance.id}
              className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800">{seance.titre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {MATIERES[seance.matiereId] ?? seance.matiereId}
                    {" · "}
                    {seance.profNom ?? seance.profId}
                  </p>
                  {seance.contenu && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {seance.contenu}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {seance.date?.toDate
                    ? seance.date.toDate().toLocaleDateString("fr-FR")
                    : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-300 mt-4 text-right">
        {filtered.length} séance{filtered.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}