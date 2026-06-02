// /app/bibliotheque/livres/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
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

const IconSearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconTrash    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconReset    = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1 0 1.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="2,4 2,8 6,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const PAR_PAGE_OPTIONS = [10, 20, 50];

export default function LivresTousPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [livres, setLivres]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [parPage, setParPage] = useState(10);

  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";

  useEffect(() => { if (user === null) router.push("/login"); }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, "bibliotheque", "livres", "items"), orderBy("createdAt", "asc")),
      snap => { setLivres(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); }
    );
    return () => unsub();
  }, [user]);

  const deleteLivre = async (id) => {
    if (confirm("Supprimer ce document ?")) await deleteDoc(doc(db, "bibliotheque", "livres", "items", id));
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return livres;
    const q = search.toLowerCase();
    return livres.filter(l => [l.titre, l.soustitre].join(" ").toLowerCase().includes(q));
  }, [livres, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / parPage));
  const pagines = filtered.slice((page - 1) * parPage, page * parPage);
  useEffect(() => setPage(1), [search]);

  const selectStyle = {
    background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)",
    borderRadius: 6, padding: "4px 8px", fontSize: 12, outline: "none",
  };

  if (!user || !userData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", boxSizing: "border-box" }}>

        {/* Hero */}
        <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", marginBottom: 24, minHeight: 160, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, var(--bg-card) 50%, transparent 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "24px 20px" : "36px 40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <button onClick={() => router.push("/bibliotheque")}
                style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 12, cursor: "pointer", padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = "#1f6feb"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}>
                ← Bibliothèques
              </button>
              <span style={{ color: "var(--border)", fontSize: 12 }}>/</span>
              <span style={{ color: "#1f6feb", fontSize: 12, fontWeight: 600 }}>Tous les livres</span>
            </div>
            <h1 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px" }}>Livres et documents PDF</h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              {livres.length} document{livres.length > 1 ? "s" : ""} disponible{livres.length > 1 ? "s" : ""} · Téléchargement direct
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}><IconSearch /></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un document..."
              style={{ width: "100%", padding: "8px 12px 8px 32px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#1f6feb"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          {search && (
            <button onClick={() => setSearch("")}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, background: "rgba(88,166,255,0.08)", border: "1px solid rgba(88,166,255,0.3)", color: "#58a6ff", fontSize: 12, cursor: "pointer" }}>
              <IconReset /> Réinitialiser
            </button>
          )}
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: "auto" }}>
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </div>
        </div>

        {/* Tableau */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 80px 80px 100px", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)" }}>
              {["", "Document", "Auteur", "Pages", "Taille", "Actions"].map((h, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: i === 5 ? "right" : "left" }}>{h}</div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "50px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
              <p style={{ color: "var(--text-tertiary)", fontSize: 13 }}>Aucun document trouvé.</p>
            </div>
          ) : (
            pagines.map((livre, idx) => {
              const isLast = idx === pagines.length - 1;
              if (isMobile) {
                return (
                  <div key={livre.id} style={{ padding: "14px 16px", borderBottom: isLast ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Mini couverture */}
                    <div style={{ width: 40, height: 54, borderRadius: 4, background: livre.coverBg || "linear-gradient(160deg,#1e3a5f,#2d6a9f)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 7, color: "#fff", fontWeight: 900, textAlign: "center", padding: "0 4px" }}>PDF</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{livre.titre}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{livre.pages ? `${livre.pages} p.` : ""}{livre.pages && livre.size ? " · " : ""}{livre.size || ""}</div>
                    </div>
                    {livre.fileUrl && (
                      <a href={livre.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#58a6ff", display: "flex", alignItems: "center" }}><IconDownload /></a>
                    )}
                  </div>
                );
              }
              return (
                <div key={livre.id}
                  style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 80px 80px 100px", padding: "12px 20px", borderBottom: isLast ? "none" : "1px solid var(--border)", alignItems: "center", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {/* Mini couverture */}
                  <div style={{ width: 36, height: 50, borderRadius: "2px 5px 5px 2px", background: livre.coverBg || "linear-gradient(160deg,#1e3a5f,#2d6a9f)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "2px 3px 8px rgba(0,0,0,0.3)" }}>
                    <span style={{ fontSize: 6, color: "#fff", fontWeight: 900 }}>PDF</span>
                  </div>
                  {/* Titre */}
                  <div style={{ paddingRight: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{livre.titre}</div>
                  </div>
                  {/* Sous-titre */}
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                    {livre.soustitre || <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                  </div>
                  {/* Pages */}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {livre.pages ? `${livre.pages} p.` : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                  </div>
                  {/* Taille */}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {livre.size || <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    {livre.fileUrl ? (
                      <a href={livre.fileUrl} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: "rgba(31,107,235,0.1)", border: "1px solid rgba(88,166,255,0.3)", color: "#58a6ff", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
                        <IconDownload /> PDF
                      </a>
                    ) : (
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontStyle: "italic" }}>Pas de fichier</span>
                    )}
                    {isProf && (
                      <button onClick={() => deleteLivre(livre.id)}
                        style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: "1px solid var(--border)", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(248,81,73,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <IconTrash />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              {Math.min((page-1)*parPage+1, filtered.length)}–{Math.min(page*parPage, filtered.length)} sur <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> document{filtered.length > 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                style={{ width: 30, height: 30, borderRadius: 6, background: "transparent", border: "1px solid var(--border)", color: page===1 ? "var(--text-tertiary)" : "var(--text-secondary)", cursor: page===1 ? "not-allowed" : "pointer", fontSize: 14 }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 30, height: 30, borderRadius: 6, background: page===p ? "#1f6feb" : "transparent", border: `1px solid ${page===p ? "#1f6feb" : "var(--border)"}`, color: page===p ? "#fff" : "var(--text-secondary)", fontSize: 12, fontWeight: page===p ? 700 : 400, cursor: "pointer" }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{ width: 30, height: 30, borderRadius: 6, background: "transparent", border: "1px solid var(--border)", color: page===totalPages ? "var(--text-tertiary)" : "var(--text-secondary)", cursor: page===totalPages ? "not-allowed" : "pointer", fontSize: 14 }}>›</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Afficher</span>
              <select value={parPage} onChange={e => { setParPage(Number(e.target.value)); setPage(1); }} style={selectStyle}>
                {PAR_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>par page</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}