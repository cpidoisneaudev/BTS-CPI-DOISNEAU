// /app/projets/tous/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

function useMediaQuery(q) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(q);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [q]);
  return matches;
}

function typeBadgeStyle(type) {
  if (type === "Prototypage")       return { background: "rgba(31,107,235,0.18)", color: "#58a6ff", border: "1px solid rgba(31,107,235,0.35)" };
  if (type === "Collaboratif CPRP") return { background: "rgba(224,123,57,0.18)", color: "#e07b39", border: "1px solid rgba(224,123,57,0.35)" };
  if (type === "Projet final")      return { background: "rgba(157,149,232,0.18)", color: "#9d95e8", border: "1px solid rgba(157,149,232,0.35)" };
  return { background: "#21262d", color: "#8b949e", border: "1px solid #30363d" };
}

function statutBadge(statut) {
  if (statut === "publié" || statut === "terminé") return { bg: "rgba(63,185,80,0.15)", color: "#3fb950", label: "Terminé" };
  if (statut === "en_cours")  return { bg: "rgba(210,153,34,0.15)", color: "#d29922", label: "En cours" };
  if (statut === "brouillon") return { bg: "rgba(139,148,158,0.15)", color: "#8b949e", label: "Brouillon" };
  return { bg: "rgba(63,185,80,0.15)", color: "#3fb950", label: "Terminé" };
}

// Icône fichier PDF
function IconPDF() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="#f85149" strokeWidth="1.2"/>
      <text x="8" y="11" textAnchor="middle" fontSize="6" fill="#f85149" fontWeight="700">PDF</text>
    </svg>
  );
}
// Icône vidéo
function IconVideo() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="#58a6ff" strokeWidth="1.2"/>
      <polygon points="6,5 11,8 6,11" fill="#58a6ff"/>
    </svg>
  );
}
// Icône doc
function IconDoc() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="#8b949e" strokeWidth="1.2"/>
      <line x1="4" y1="5" x2="12" y2="5" stroke="#8b949e" strokeWidth="1.2"/>
      <line x1="4" y1="8" x2="12" y2="8" stroke="#8b949e" strokeWidth="1.2"/>
      <line x1="4" y1="11" x2="9" y2="11" stroke="#8b949e" strokeWidth="1.2"/>
    </svg>
  );
}

// Icône recherche
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="#7d8590" strokeWidth="1.5"/>
      <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#7d8590" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Icône reset
function IconReset() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M2 8a6 6 0 1 0 1.5-4" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round"/>
      <polyline points="2,4 2,8 6,8" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const ANNEES = ["Toutes", "2024-2025", "2023-2024", "2022-2023", "2021-2022", "2021", "2022", "2023", "2024"];
const TYPES  = ["Tous", "Prototypage", "Collaboratif CPRP", "Projet final"];
const STATUTS = ["Tous", "Terminé", "En cours", "Brouillon"];
const COMPETENCES = ["Toutes", "CAO", "Simulation", "Impression 3D", "Usinage CNC", "Métrologie", "Assemblage"];
const PAR_PAGE_OPTIONS = [5, 10, 20, 50];

export default function ProjetsTousPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 900px)");

  const [projets, setProjets]         = useState([]);
  const [ressourcesCounts, setRC]     = useState({});
  const [ressourcesTypes, setRT]      = useState({});
  const [loading, setLoading]         = useState(true);

  // Filtres
  const [search, setSearch]           = useState("");
  const [filtreType, setFiltreType]   = useState("Tous");
  const [filtreAnnee, setFiltreAnnee] = useState("Toutes");
  const [filtreComp, setFiltreComp]   = useState("Toutes");
  const [filtreStatut, setFiltreStatut] = useState("Tous");

  // Pagination
  const [page, setPage]               = useState(1);
  const [parPage, setParPage]         = useState(10);

  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";

  useEffect(() => { if (user === null) router.push("/login"); }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, "projets"), orderBy("createdAt", "desc")),
      async (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const visibles = isProf ? data : data.filter(p => p.statut === "publié" || p.statut === "terminé");
        setProjets(visibles);
        setLoading(false);

        // Compter et typer les ressources
        const counts = {};
        const types  = {};
        await Promise.all(data.map(async (p) => {
          try {
            const r = await getDocs(collection(db, "projets", p.id, "ressources"));
            counts[p.id] = r.size;
            const docs = r.docs.map(d => d.data());
            types[p.id] = {
              pdf:   docs.filter(d => d.type === "pdf"   || d.format === "pdf").length,
              video: docs.filter(d => d.type === "video" || d.resourceType === "video" || (d.url || "").includes("youtube")).length,
              doc:   docs.filter(d => d.type === "doc"   || d.format === "docx" || d.format === "zip").length,
            };
          } catch {
            counts[p.id] = 0;
            types[p.id]  = { pdf: 0, video: 0, doc: 0 };
          }
        }));
        setRC(counts);
        setRT(types);
      }
    );
    return () => unsub();
  }, [user, isProf]);

  // Filtrage
  const projetsFiltres = useMemo(() => {
    return projets.filter(p => {
      const s = search.toLowerCase();
      const matchSearch = !s || (p.titre || "").toLowerCase().includes(s) || (p.description || "").toLowerCase().includes(s);
      const matchType   = filtreType === "Tous" || p.type === filtreType;
      const matchAnnee  = filtreAnnee === "Toutes" || (p.annee || "").includes(filtreAnnee);
      const matchStatut = filtreStatut === "Tous"
        || (filtreStatut === "Terminé"  && (p.statut === "publié" || p.statut === "terminé"))
        || (filtreStatut === "En cours" && p.statut === "en_cours")
        || (filtreStatut === "Brouillon" && p.statut === "brouillon");
      const matchComp   = filtreComp === "Toutes"
        || (p.travaux || []).some(t => t.toLowerCase().includes(filtreComp.toLowerCase()))
        || (p.livrables || []).some(l => l.toLowerCase().includes(filtreComp.toLowerCase()));
      return matchSearch && matchType && matchAnnee && matchStatut && matchComp;
    });
  }, [projets, search, filtreType, filtreAnnee, filtreStatut, filtreComp]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(projetsFiltres.length / parPage));
  const projetsPagines = projetsFiltres.slice((page - 1) * parPage, page * parPage);

  // Reset page quand filtre change
  useEffect(() => setPage(1), [search, filtreType, filtreAnnee, filtreStatut, filtreComp]);

  const resetFiltres = () => {
    setSearch(""); setFiltreType("Tous"); setFiltreAnnee("Toutes");
    setFiltreComp("Toutes"); setFiltreStatut("Tous"); setPage(1);
  };

  const hasFiltres = search || filtreType !== "Tous" || filtreAnnee !== "Toutes" || filtreComp !== "Toutes" || filtreStatut !== "Tous";

  if (!user || !userData) return null;

  // Générer les numéros de pages à afficher
  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "…", totalPages];
    if (page >= totalPages - 2) return [1, "…", totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  };

  const selectStyle = {
    background: "#161b22", border: "1px solid #30363d", color: "#e6edf3",
    borderRadius: 8, padding: "7px 10px", fontSize: 12, cursor: "pointer", outline: "none",
    appearance: "none", WebkitAppearance: "none", paddingRight: 28,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237d8590' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", boxSizing: "border-box" }}>

        {/* ── HERO ── */}
        <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", marginBottom: 24, minHeight: isMobile ? 160 : 200 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(13,17,23,0.97) 0%, rgba(13,17,23,0.8) 60%, rgba(13,17,23,0.3) 100%)", zIndex: 1 }} />
          <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "24px 20px" : "40px 44px" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <button onClick={() => router.push("/dashboard/projet")}
                style={{ background: "none", border: "none", color: "#7d8590", fontSize: 11, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = "#58a6ff"}
                onMouseLeave={e => e.currentTarget.style.color = "#7d8590"}>
                ← Projets
              </button>
              <span style={{ color: "#30363d", fontSize: 11 }}>/</span>
              <span style={{ color: "#58a6ff", fontSize: 11, fontWeight: 600 }}>Tous nos projets</span>
            </div>
            <div style={{ fontSize: 10, color: "#58a6ff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>PROJETS BTS CPI</div>
            <h1 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 800, color: "#e6edf3", marginBottom: 10, lineHeight: 1.2 }}>Tous nos projets</h1>
            <p style={{ fontSize: isMobile ? 12 : 14, color: "#8b949e", lineHeight: 1.6, maxWidth: 480 }}>
              Découvrez l'ensemble des projets réalisés par nos étudiants ces dernières années.
            </p>
          </div>
        </div>

        {/* ── BARRE FILTRES ── */}
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? "14px" : "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>

            {/* Recherche */}
            <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "1 1 200px", minWidth: 160 }}>
              <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                <IconSearch />
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un projet..."
                style={{ width: "100%", padding: "8px 12px 8px 32px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, color: "#e6edf3", fontSize: 12, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.currentTarget.style.borderColor = "#1f6feb"}
                onBlur={e => e.currentTarget.style.borderColor = "#30363d"}
              />
            </div>

            {/* Filtres selects */}
            {[
              { label: "Type de projet", value: filtreType,   setter: setFiltreType,   options: TYPES },
              { label: "Année",          value: filtreAnnee,  setter: setFiltreAnnee,  options: ANNEES },
              { label: "Compétences",    value: filtreComp,   setter: setFiltreComp,   options: COMPETENCES },
              { label: "Statut",         value: filtreStatut, setter: setFiltreStatut, options: STATUTS },
            ].map(({ label, value, setter, options }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 3, flex: "0 0 auto" }}>
                <span style={{ fontSize: 10, color: "#7d8590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                <div style={{ position: "relative" }}>
                  <select value={value} onChange={e => setter(e.target.value)} style={selectStyle}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            ))}

            {/* Bouton réinitialiser */}
            <button onClick={resetFiltres}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: hasFiltres ? "rgba(88,166,255,0.1)" : "transparent", border: `1px solid ${hasFiltres ? "rgba(88,166,255,0.35)" : "#30363d"}`, color: hasFiltres ? "#58a6ff" : "#7d8590", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", marginTop: isMobile ? 0 : 16, flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#58a6ff"; e.currentTarget.style.color = "#58a6ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = hasFiltres ? "rgba(88,166,255,0.35)" : "#30363d"; e.currentTarget.style.color = hasFiltres ? "#58a6ff" : "#7d8590"; }}>
              <IconReset />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* ── TABLEAU ── */}
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>

          {/* Header tableau */}
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 180px 160px 130px 90px 90px 120px", gap: 0, padding: "10px 20px", borderBottom: "1px solid #21262d", background: "#0d1117" }}>
              {["Titre du projet", "Photo", "Réalisé par", "Type de projet", "Ressources", "Année", "Statut", ""].map((h, i) => (
                <div key={i} style={{ fontSize: 11, color: "#7d8590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</div>
              ))}
            </div>
          )}

          {/* Rows */}
          {loading ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 28, height: 28, border: "3px solid #21262d", borderTopColor: "#1f6feb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ color: "#7d8590", fontSize: 13 }}>Chargement des projets...</p>
            </div>
          ) : projetsFiltres.length === 0 ? (
            <div style={{ padding: "50px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
              <p style={{ color: "#7d8590", fontSize: 13, marginBottom: 8 }}>Aucun projet ne correspond à vos critères.</p>
              <button onClick={resetFiltres} style={{ padding: "7px 16px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            projetsPagines.map((projet, idx) => {
              const badge  = typeBadgeStyle(projet.type);
              const statut = statutBadge(projet.statut);
              const rc     = ressourcesCounts[projet.id] || 0;
              const rt     = ressourcesTypes[projet.id]  || { pdf: 0, video: 0, doc: 0 };
              const isLast = idx === projetsPagines.length - 1;

              if (isMobile) {
                // Vue mobile : cards
                return (
                  <div key={projet.id}
                    style={{ padding: "14px 16px", borderBottom: isLast ? "none" : "1px solid #21262d", display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}
                    onClick={() => router.push(`/projet/${projet.id}`)}>
                    <div style={{ width: 60, height: 50, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#0d1117" }}>
                      {projet.image
                        ? <img src={projet.image} alt={projet.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔧</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", margin: 0 }}>{projet.titre}</h3>
                        <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, fontWeight: 700, ...badge }}>{projet.type}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#7d8590", margin: "0 0 6px", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projet.description}</p>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        {projet.annee && <span style={{ fontSize: 10, color: "#7d8590" }}>📅 {projet.annee}</span>}
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: statut.bg, color: statut.color, fontWeight: 600 }}>{statut.label}</span>
                        <span style={{ fontSize: 10, color: "#7d8590" }}>📁 {rc}</span>
                      </div>
                    </div>
                    <div style={{ color: "#58a6ff", fontSize: 14, flexShrink: 0 }}>→</div>
                  </div>
                );
              }

              // Vue desktop : tableau
              return (
                <div key={projet.id}
                  style={{ display: "grid", gridTemplateColumns: "2fr 100px 180px 160px 130px 90px 90px 120px", gap: 0, padding: "14px 20px", borderBottom: isLast ? "none" : "1px solid #21262d", alignItems: "center", transition: "background 0.15s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(31,107,235,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => router.push(`/projet/${projet.id}`)}>

                  {/* Titre + description */}
                  <div style={{ paddingRight: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projet.titre}</div>
                    <div style={{ fontSize: 11, color: "#7d8590", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{projet.description}</div>
                  </div>

                  {/* Photo */}
                  <div>
                    <div style={{ width: 60, height: 48, borderRadius: 8, overflow: "hidden", background: "#0d1117", border: "1px solid #21262d" }}>
                      {projet.image
                        ? <img src={projet.image} alt={projet.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔧</div>
                      }
                    </div>
                  </div>

                  {/* Réalisé par (skippé → groupe/année) */}
                  <div>
                    <div style={{ fontSize: 11, color: "#c9d1d9", fontWeight: 500 }}>
                      {projet.groupe || <span style={{ color: "#484f58" }}>—</span>}
                    </div>
                    {projet.annee && <div style={{ fontSize: 10, color: "#7d8590", marginTop: 2 }}>Promo {projet.annee}</div>}
                  </div>

                  {/* Type badge */}
                  <div>
                    <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, fontWeight: 700, display: "inline-block", ...badge }}>
                      {projet.type || "—"}
                    </span>
                  </div>

                  {/* Ressources : icônes + compteurs */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {rc === 0 ? (
                      <span style={{ fontSize: 10, color: "#484f58" }}>—</span>
                    ) : (
                      <>
                        {rt.pdf > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <IconPDF />
                            <span style={{ fontSize: 11, color: "#c9d1d9" }}>{rt.pdf}</span>
                          </div>
                        )}
                        {rt.video > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <IconVideo />
                            <span style={{ fontSize: 11, color: "#c9d1d9" }}>{rt.video}</span>
                          </div>
                        )}
                        {rt.doc > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <IconDoc />
                            <span style={{ fontSize: 11, color: "#c9d1d9" }}>{rt.doc}</span>
                          </div>
                        )}
                        {rc > 0 && rt.pdf === 0 && rt.video === 0 && rt.doc === 0 && (
                          <span style={{ fontSize: 11, color: "#c9d1d9" }}>📁 {rc}</span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Année */}
                  <div style={{ fontSize: 12, color: "#c9d1d9" }}>
                    {projet.annee || <span style={{ color: "#484f58" }}>—</span>}
                  </div>

                  {/* Statut */}
                  <div>
                    <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, fontWeight: 700, background: statut.bg, color: statut.color, display: "inline-block" }}>
                      {statut.label}
                    </span>
                  </div>

                  {/* Action */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/projet/${projet.id}`); }}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.color = "#58a6ff"; e.currentTarget.style.background = "rgba(31,107,235,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#8b949e"; e.currentTarget.style.background = "transparent"; }}>
                      Voir le projet <span style={{ fontSize: 13 }}>→</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── PAGINATION ── */}
        {!loading && projetsFiltres.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>

            {/* Info */}
            <div style={{ fontSize: 12, color: "#7d8590" }}>
              Affichage de {Math.min((page - 1) * parPage + 1, projetsFiltres.length)} à {Math.min(page * parPage, projetsFiltres.length)} sur <strong style={{ color: "#c9d1d9" }}>{projetsFiltres.length}</strong> projet{projetsFiltres.length > 1 ? "s" : ""}
            </div>

            {/* Pages */}
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {/* Précédent */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ width: 30, height: 30, borderRadius: 6, background: "transparent", border: "1px solid #30363d", color: page === 1 ? "#484f58" : "#8b949e", fontSize: 14, cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ‹
              </button>

              {/* Numéros */}
              {getPages().map((p, i) => (
                p === "…" ? (
                  <span key={`ell-${i}`} style={{ width: 30, textAlign: "center", color: "#484f58", fontSize: 12 }}>…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: 30, height: 30, borderRadius: 6, background: page === p ? "#1f6feb" : "transparent", border: `1px solid ${page === p ? "#1f6feb" : "#30363d"}`, color: page === p ? "#fff" : "#8b949e", fontSize: 12, fontWeight: page === p ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (page !== p) { e.currentTarget.style.borderColor = "#58a6ff"; e.currentTarget.style.color = "#58a6ff"; }}}
                    onMouseLeave={e => { if (page !== p) { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#8b949e"; }}}>
                    {p}
                  </button>
                )
              ))}

              {/* Suivant */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ width: 30, height: 30, borderRadius: 6, background: "transparent", border: "1px solid #30363d", color: page === totalPages ? "#484f58" : "#8b949e", fontSize: 14, cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ›
              </button>
            </div>

            {/* Par page */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#7d8590" }}>Afficher</span>
              <select value={parPage} onChange={e => { setParPage(Number(e.target.value)); setPage(1); }} style={{ ...selectStyle, padding: "5px 28px 5px 10px" }}>
                {PAR_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "#7d8590" }}>par page</span>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #161b22; color: #e6edf3; }
        input::placeholder { color: #484f58; }
      `}</style>
    </div>
  );
}