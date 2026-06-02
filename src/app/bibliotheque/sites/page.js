// /dashboard/bibliotheque/sites/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
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

const TAG_COLORS = {
  CAO:        { bg: "rgba(31,107,235,0.12)", text: "#58a6ff" },
  Officiel:   { bg: "rgba(63,185,80,0.12)",  text: "#3fb950" },
  Composants: { bg: "rgba(224,123,57,0.12)", text: "#e07b39" },
  Norme:      { bg: "rgba(157,149,232,0.12)",text: "#9d95e8" },
  Autre:      { bg: "rgba(139,148,158,0.12)",text: "#8b949e" },
};
const TAGS_SITES = ["CAO", "Officiel", "Composants", "Norme", "Autre"];
const inputSt = { width: "100%", padding: "9px 12px", borderRadius: 8, background: "var(--bg-primary)", border: "1px solid var(--border-hover)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" };

// ── Icons ──
const IconSearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconExternal = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IconEdit     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconReset    = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1 0 1.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="2,4 2,8 6,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ── Modal Edit ──
function ModalEdit({ site, onClose }) {
  const [form, setForm] = useState({ nom: site.nom || "", logo: site.logo || "", description: site.description || "", url: site.url || "", tag: site.tag || "CAO" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nom.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "bibliotheque", "sites", "items", site.id), {
        nom: form.nom.trim(),
        logo: form.logo.trim() || form.nom.slice(0, 2).toUpperCase(),
        description: form.description.trim(),
        url: form.url.trim(),
        tag: form.tag,
      });
      onClose();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Modifier le site</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Nom *", key: "nom", placeholder: "Ex: GrabCAD" },
            { label: "Sigle (2-3 lettres)", key: "logo", placeholder: "Ex: GC" },
            { label: "URL *", key: "url", placeholder: "https://..." },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
              <input style={inputSt} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
            <textarea style={{ ...inputSt, height: 72, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Description courte..." />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Catégorie</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TAGS_SITES.map(t => (
                <button key={t} onClick={() => set("tag", t)}
                  style={{ padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid", background: form.tag === t ? TAG_COLORS[t]?.bg : "transparent", color: form.tag === t ? TAG_COLORS[t]?.text : "var(--text-secondary)", borderColor: form.tag === t ? TAG_COLORS[t]?.text + "66" : "var(--border)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: "8px 20px", borderRadius: 8, background: saving ? "var(--border)" : "#1f6feb", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

const PAR_PAGE_OPTIONS = [10, 20, 50];

export default function SitesTousPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [sites, setSites]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filtreTag, setFiltreTag] = useState("Tous");
  const [editSite, setEditSite]   = useState(null);
  const [page, setPage]       = useState(1);
  const [parPage, setParPage] = useState(10);

  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";

  useEffect(() => { if (user === null) router.push("/login"); }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, "bibliotheque", "sites", "items"), orderBy("createdAt", "asc")),
      snap => { setSites(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); }
    );
    return () => unsub();
  }, [user]);

  const deleteSite = async (id) => { if (confirm("Supprimer ce site ?")) await deleteDoc(doc(db, "bibliotheque", "sites", "items", id)); };

  const filtered = useMemo(() => {
    let base = [...sites].sort((a, b) => (a.nom || "").localeCompare(b.nom || ""));
    if (filtreTag !== "Tous") base = base.filter(s => s.tag === filtreTag);
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(s => [s.nom, s.description, s.url].join(" ").toLowerCase().includes(q));
    }
    return base;
  }, [sites, search, filtreTag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / parPage));
  const pagines = filtered.slice((page - 1) * parPage, page * parPage);
  useEffect(() => setPage(1), [search, filtreTag]);

  const selectStyle = { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 8, padding: "7px 28px 7px 10px", fontSize: 12, cursor: "pointer", outline: "none", appearance: "none", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237d8590' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")` };

  if (!user || !userData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "sans-serif" }}>
      {editSite && <ModalEdit site={editSite} onClose={() => setEditSite(null)} />}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", boxSizing: "border-box" }}>

        {/* Hero */}
        <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", marginBottom: 24, minHeight: 160, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15 }} />
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
              <span style={{ color: "#1f6feb", fontSize: 12, fontWeight: 600 }}>Tous les sites</span>
            </div>
            <h1 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.2 }}>Sites recommandés</h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              {sites.length} site{sites.length > 1 ? "s" : ""} référencé{sites.length > 1 ? "s" : ""} · Ressources web pour le BTS CPI
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}><IconSearch /></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un site..."
              style={{ width: "100%", padding: "8px 12px 8px 32px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#1f6feb"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Catégorie</span>
            <select value={filtreTag} onChange={e => setFiltreTag(e.target.value)} style={selectStyle}>
              <option value="Tous">Toutes</option>
              {TAGS_SITES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(search || filtreTag !== "Tous") && (
            <button onClick={() => { setSearch(""); setFiltreTag("Tous"); }}
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
          {/* Header */}
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 2fr 90px 80px", gap: 0, padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)" }}>
              {["", "Site", "URL", "Catégorie", "Actions"].map((h, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: i === 4 ? "right" : "left" }}>{h}</div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "50px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <p style={{ color: "var(--text-tertiary)", fontSize: 13 }}>Aucun site trouvé.</p>
            </div>
          ) : (
            pagines.map((site, idx) => {
              const isLast = idx === pagines.length - 1;
              if (isMobile) {
                return (
                  <div key={site.id} style={{ padding: "14px 16px", borderBottom: isLast ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,rgba(31,107,235,0.2),rgba(8,145,178,0.1))", border: "1px solid rgba(88,166,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#58a6ff", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                      {site.logo || (site.nom || "").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{site.nom}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{site.url}</div>
                    </div>
                    <a href={site.url} target="_blank" rel="noreferrer" style={{ color: "#58a6ff", display: "flex", alignItems: "center" }}><IconExternal /></a>
                  </div>
                );
              }
              return (
                <div key={site.id}
                  style={{ display: "grid", gridTemplateColumns: "44px 1fr 2fr 90px 80px", gap: 0, padding: "13px 20px", borderBottom: isLast ? "none" : "1px solid var(--border)", alignItems: "center", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {/* Logo */}
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg,rgba(31,107,235,0.2),rgba(8,145,178,0.1))", border: "1px solid rgba(88,166,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#58a6ff", fontSize: 9, fontWeight: 900 }}>
                    {site.logo || (site.nom || "").slice(0, 2).toUpperCase()}
                  </div>
                  {/* Nom + description */}
                  <div style={{ paddingRight: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{site.nom}</div>
                    {site.description && <div style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{site.description}</div>}
                  </div>
                  {/* URL */}
                  <div style={{ paddingRight: 12 }}>
                    <a href={site.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: "#58a6ff", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                      {site.url}
                    </a>
                  </div>
                  {/* Tag */}
                  <div>
                    {site.tag && (
                      <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 99, background: TAG_COLORS[site.tag]?.bg, color: TAG_COLORS[site.tag]?.text, fontWeight: 600 }}>{site.tag}</span>
                    )}
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    <a href={site.url} target="_blank" rel="noreferrer"
                      style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(31,107,235,0.1)", border: "1px solid rgba(88,166,255,0.3)", color: "#58a6ff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                      <IconExternal />
                    </a>
                    {isProf && (
                      <>
                        <button onClick={() => setEditSite(site)}
                          style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.color = "#58a6ff"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                          <IconEdit />
                        </button>
                        <button onClick={() => deleteSite(site.id)}
                          style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: "1px solid var(--border)", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(248,81,73,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <IconTrash />
                        </button>
                      </>
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
              {Math.min((page-1)*parPage+1, filtered.length)}–{Math.min(page*parPage, filtered.length)} sur <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> site{filtered.length > 1 ? "s" : ""}
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
              <select value={parPage} onChange={e => { setParPage(Number(e.target.value)); setPage(1); }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6, padding: "4px 8px", fontSize: 12, outline: "none" }}>
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