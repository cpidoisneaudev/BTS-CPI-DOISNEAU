// /dashboard/projet/page.js — RESPONSIVE FINAL
"use client";

import { useEffect, useState } from "react";
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

function niveauColor(niveau) {
  if (niveau === "Débutant")      return "#3fb950";
  if (niveau === "Intermédiaire") return "#d29922";
  return "#f85149";
}

function niveauBadge(niveau) {
  if (niveau === "Débutant")      return { background: "#1a3a2a", color: "#3fb950" };
  if (niveau === "Intermédiaire") return { background: "#3a2e1a", color: "#d29922" };
  return                                 { background: "#3a1a1a", color: "#f85149" };
}

// ── Card Projet liste (hero section) ──────────────────────────────────────────
function ProjetCard({ projet, onStart, isMobile, ressourcesCount }) {
  return (
    <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 14 : 20, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 24, alignItems: "flex-start" }}>
      <div style={{ width: isMobile ? "100%" : 140, height: isMobile ? 160 : 150, borderRadius: 10, background: "#0d1117", border: "1px solid #30363d", overflow: "hidden", flexShrink: 0 }}>
        {projet.image
          ? <img src={projet.image} alt={projet.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🔧</div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "#7d8590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>PROJET COMPLET</div>
        <h3 style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, color: "#e6edf3", marginBottom: 5 }}>{projet.titre}</h3>
        <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: isMobile ? 2 : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{projet.description}</p>
        {/* Stats */}
        <div style={{ display: "flex", gap: isMobile ? 12 : 16, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { icon: "⏱", label: "Durée", val: projet.duree, color: "#e6edf3" },
            { icon: "📁", label: "Ressources", val: ressourcesCount, color: "#e6edf3" },
            { icon: "📊", label: "Niveau", val: projet.niveau, color: niveauColor(projet.niveau) },
          ].map(({ icon, label, val, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 9, color: "#7d8590", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Livrables + bouton */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, alignItems: isMobile ? "stretch" : "flex-end" }}>
          {!isMobile && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", flex: 1 }}>
              {projet.livrables?.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#c9d1d9" }}>
                  <span style={{ fontSize: 11, color: "#3fb950" }}>✓</span><span>{item}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => onStart(projet.id)}
            style={{ padding: isMobile ? "9px 16px" : "10px 20px", fontSize: 13, fontWeight: 600, background: "#1f6feb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
            onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
            Commencer le projet
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function DashboardProjetPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [projets, setProjets] = useState([]);
  const [ressourcesCounts, setRessourcesCounts] = useState({});
  const [loadingProjets, setLoadingProjets] = useState(true);
  const [filtreActif, setFiltreActif] = useState("Tous");

  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";

  useEffect(() => { if (user === null) router.push("/login"); }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, "projets"), orderBy("createdAt", "desc")),
      async (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProjets(isProf ? data : data.filter(p => p.statut === "publié"));
        setLoadingProjets(false);
        const counts = {};
        await Promise.all(data.map(async (p) => {
          try {
            const r = await getDocs(collection(db, "projets", p.id, "ressources"));
            counts[p.id] = r.size;
          } catch { counts[p.id] = 0; }
        }));
        setRessourcesCounts(counts);
      }
    );
    return () => unsub();
  }, [user, isProf]);

  if (!user || !userData) return null;

  const FILTRES = ["Tous", "Prototypage", "Collaboratif CPRP", "Projet final"];

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "sans-serif", overflowX: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", boxSizing: "border-box", width: "100%" }}>

        {/* ── HERO ── */}
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: isMobile ? "20px 16px" : "40px 32px", marginBottom: 28, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 32, alignItems: isMobile ? "flex-start" : "center", overflow: "hidden" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#7d8590", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>Projets industriels BTS CPI</div>
            <h1 style={{ fontSize: isMobile ? 20 : 30, fontWeight: 700, color: "#e6edf3", marginBottom: 12, lineHeight: 1.3 }}>
              Concevoir. Prototyper. <span style={{ color: "#1f6feb" }}>Innover.</span>
            </h1>
            <p style={{ fontSize: isMobile ? 12 : 14, color: "#8b949e", marginBottom: 16, lineHeight: 1.6 }}>
              Découvrez les projets industriels à réaliser, de l'idée au prototype. Chaque projet est une expérience concrète pour préparer votre BTS CPI.
            </p>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { label: "🎓 Apprendre en faisant", color: "#3fb950", bg: "#1a3a2a" },
                { label: "🤝 Collaborer et innover", color: "#d29922", bg: "#3a2e1a" },
                { label: "🎯 Besoins réels", color: "#58a6ff", bg: "#1f3a5f" },
              ].map(({ label, color, bg }) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: 10, color, background: bg, borderRadius: 99, whiteSpace: "nowrap" }}>{label}</span>
              ))}
            </div>
            {isProf && (
              <button onClick={() => router.push("/logiciels")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", fontSize: 13, fontWeight: 500, background: "#1f6feb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
                + Créer un projet
              </button>
            )}
          </div>
          {/* Image — cachée sur mobile pour gagner de l'espace */}
          {!isMobile && (
            <div style={{ width: 260, height: 240, borderRadius: 12, overflow: "hidden", border: "1px solid #30363d", flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" alt="Projets industriels" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>

        {/* ── 3 TYPES DE PROJETS avec image de fond ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 4, height: 18, background: "#1f6feb", borderRadius: 2 }} />
            <h2 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 600, color: "#e6edf3" }}>Nos 3 types de projets</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
            {[
              { icon: "🖨️", iconBg: "#1f3a5f", titre: "Projet de prototypage", desc: "Conception, fabrication de pièces, assemblage et tests pour valider la faisabilité.", tags: ["Impression 3D", "Assemblage", "Tests"], tagColor: "#58a6ff", tagBg: "rgba(31,107,235,0.2)", image: "https://images.unsplash.com/photo-1563520239648-a8f4b43d3b19?w=600&q=80", accent: "#1f6feb" },
              { icon: "🤝", iconBg: "#3a2010", titre: "Projet collaboratif avec CPRP", desc: "Collaboration avec les techniciens d'usinage (CPRP) pour concevoir et fabriquer des sous-ensembles.", tags: ["CAO", "Usinage CNC", "Métrologie"], tagColor: "#e07b39", tagBg: "rgba(224,123,57,0.2)", image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80", accent: "#e07b39" },
              { icon: "🏆", iconBg: "#1a1a3a", titre: "Projet final (6 mois)", desc: "Projet industriel complet répondant à un besoin réel d'entreprise ou de centre de recherche.", tags: ["CAO avancée", "Simulation", "Soutenance"], tagColor: "#9d95e8", tagBg: "rgba(157,149,232,0.2)", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80", accent: "#9d95e8" },
            ].map((type, i) => (
              <div key={i}
                style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #21262d", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", position: "relative", minHeight: isMobile ? 180 : 220 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = type.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#21262d"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${type.image}')`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(13,17,23,0.93) 0%, rgba(13,17,23,0.65) 100%)", zIndex: 1 }} />
                <div style={{ position: "relative", zIndex: 2, padding: isMobile ? 16 : 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: type.iconBg, border: `1px solid ${type.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>
                    {type.icon}
                  </div>
                  <h3 style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#e6edf3", marginBottom: 6, lineHeight: 1.3 }}>{type.titre}</h3>
                  <p style={{ fontSize: 11, color: "#c9d1d9", lineHeight: 1.6, marginBottom: 12 }}>{type.desc}</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                    {type.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: type.tagBg, color: type.tagColor, fontWeight: 600, border: `1px solid ${type.accent}33` }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${type.accent}22`, border: `1px solid ${type.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: type.accent }}>→</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PROJETS À RÉALISER ── */}
        <div style={{ marginBottom: 28 }}>
          {/* Header avec filtres */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 4, height: 18, background: "#1f6feb", borderRadius: 2 }} />
              <h2 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 600, color: "#e6edf3" }}>
                Projets à réaliser
                <span style={{ fontSize: 11, color: "#7d8590", fontWeight: 400, marginLeft: 8 }}>{projets.length} projet{projets.length > 1 ? "s" : ""}</span>
              </h2>
            </div>
            <button onClick={() => router.push("/logiciels")}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 11, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.color = "#58a6ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#8b949e"; }}>
              Voir tous les projets →
            </button>
          </div>

          {/* Filtres — scroll horizontal sur mobile */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {FILTRES.map((f) => (
              <button key={f} onClick={() => setFiltreActif(f)}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, border: "1px solid", cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                  background: filtreActif === f ? "#1f6feb" : "transparent",
                  borderColor: filtreActif === f ? "#1f6feb" : "#30363d",
                  color: filtreActif === f ? "#fff" : "#8b949e",
                }}>
                {f}
              </button>
            ))}
          </div>

          {/* Grille projets */}
          {loadingProjets ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ width: "100%", aspectRatio: "4/3", background: "#21262d" }} />
                  <div style={{ padding: 12 }}>
                    <div style={{ height: 12, background: "#21262d", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 10, background: "#21262d", borderRadius: 4, width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : projets.length === 0 ? (
            <div style={{ background: "#161b22", border: "1px dashed #21262d", borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔧</div>
              <p style={{ color: "#7d8590", fontSize: 13 }}>Aucun projet disponible pour l'instant.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px,1fr))", gap: isMobile ? 10 : 14 }}>
              {projets.map(projet => {
                const badge = niveauBadge(projet.niveau);
                return (
                  <div key={projet.id}
                    onClick={() => router.push(`/projet/${projet.id}`)}
                    style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#21262d"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    {/* Image */}
                    <div style={{ width: "100%", aspectRatio: "4/3", background: "#0d1117", position: "relative", overflow: "hidden" }}>
                      {projet.image
                        ? <img src={projet.image} alt={projet.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, background: "linear-gradient(135deg,#161b22,#1c2128)" }}>🔧</div>
                      }
                      <div style={{ position: "absolute", top: 8, left: 8, fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 600, background: badge.background, color: badge.color }}>{projet.niveau}</div>
                      <div style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 6, background: "rgba(13,17,23,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#8b949e" }}>🔖</div>
                    </div>
                    {/* Infos */}
                    <div style={{ padding: isMobile ? 10 : 12 }}>
                      <h3 style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#e6edf3", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projet.titre}</h3>
                      <p style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{projet.description}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #21262d" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {projet.annee && <span style={{ fontSize: 10, color: "#7d8590" }}>📅 {projet.annee}</span>}
                          {projet.groupe && <span style={{ fontSize: 10, color: "#7d8590" }}>👥 {projet.groupe}</span>}
                          {!projet.annee && !projet.groupe && projet.profNom && (
                            <span style={{ fontSize: 10, color: "#7d8590" }}>👤 {projet.profNom.split(" ")[0]}</span>
                          )}
                        </div>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1f3a5f", border: "1px solid #1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#58a6ff" }}>→</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CTA BANNIÈRE ── */}
        <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", marginBottom: 24, minHeight: isMobile ? 220 : 180 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: isMobile ? "rgba(13,17,23,0.88)" : "linear-gradient(90deg, rgba(13,17,23,0.95) 45%, rgba(13,17,23,0.5) 100%)", zIndex: 1 }} />
          <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "28px 20px" : "40px 40px", maxWidth: 520 }}>
            <h2 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, color: "#e6edf3", marginBottom: 10, lineHeight: 1.25 }}>
              Vous avez une idée ?<br />Faisons-la devenir réalité !
            </h2>
            <p style={{ fontSize: isMobile ? 12 : 13, color: "#8b949e", lineHeight: 1.7, marginBottom: 20, maxWidth: 400 }}>
              Proposez votre projet ou rejoignez une équipe pour relever de nouveaux défis et développer des solutions innovantes.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: isMobile ? "9px 18px" : "11px 22px", borderRadius: 10, background: "#1f6feb", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
                Proposer un projet →
              </button>
              <button style={{ padding: isMobile ? "9px 18px" : "11px 22px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "#e6edf3", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
                Rejoindre un projet
              </button>
            </div>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}