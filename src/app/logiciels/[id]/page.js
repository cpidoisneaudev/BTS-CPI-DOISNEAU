// logiciels/[id]/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const LOGICIELS_META = {
  solidworks: { label: "SolidWorks", sub: "Conception 3D", logo: "https://cdn.worldvectorlogo.com/logos/solidworks.svg", logoBg: "#c00d0d", accent: "#e05555" },
  catia:      { label: "CATIA V5",   sub: "CAO avancée",   logo: "https://logodix.com/logo/1810230.jpg",                logoBg: "#003087", accent: "#4a7fd4" },
  rdm6:       { label: "RDM6",       sub: "Simulation mécanique", logo: null,                                           logoBg: "#1a6b3c", accent: "#3fb950" },
};

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];

const badgeStyle = (niveau) => {
  if (niveau === "Débutant")      return { bg: "#1a3a2a", color: "#3fb950" };
  if (niveau === "Intermédiaire") return { bg: "#3a2e1a", color: "#d29922" };
  return                                 { bg: "#3a1a1a", color: "#f85149" };
};

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ── Modal confirmation ─────────────────────────────────────────────────────────
function ModalConfirm({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 24, maxWidth: 360, width: "100%" }}>
        <p style={{ color: "#e6edf3", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "8px 16px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "8px 16px", borderRadius: 8, background: "#da3633", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

// ── Viewer ressource ───────────────────────────────────────────────────────────
function RessourceViewer({ ressource, onClose }) {
  if (!ressource) return null;
  const ytId = ressource.type === "youtube" ? getYouTubeId(ressource.url) : null;
  const badge = badgeStyle(ressource.niveau || "Débutant");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ width: "100%", maxWidth: 960, display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <p style={{ color: "#e6edf3", fontSize: 14, fontWeight: 600, wordBreak: "break-word" }}>{ressource.titre}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
            {ressource.niveau && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: badge.bg, color: badge.color, fontWeight: 500 }}>{ressource.niveau}</span>}
            {ressource.duree && <span style={{ fontSize: 11, color: "#7d8590" }}>⏱ {ressource.duree}</span>}
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#e6edf3", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ width: "100%", maxWidth: 960, background: "#000", borderRadius: 12, overflow: "hidden", border: "1px solid #21262d" }}>
        {ytId ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
          </div>
        ) : ressource.type === "pdf" ? (
          <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(ressource.url)}&embedded=true`} style={{ width: "100%", height: "65vh", border: "none" }} />
        ) : null}
      </div>
      {ressource.type === "pdf" && (
        <a href={ressource.url} target="_blank" rel="noopener noreferrer" style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, background: "#1f6feb", color: "#fff", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>⬇ Télécharger le PDF</a>
      )}
    </div>
  );
}

// ── Card ressource ─────────────────────────────────────────────────────────────
function RessourceCard({ ressource, onOpen, onDelete, isProf }) {
  const ytId = ressource.type === "youtube" ? getYouTubeId(ressource.url) : null;
  const badge = badgeStyle(ressource.niveau || "Débutant");
  const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
  return (
    <div
      style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s", position: "relative" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#30363d"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
    >
      <div onClick={() => onOpen(ressource)} style={{ width: "100%", aspectRatio: "16/9", background: "#0d1117", position: "relative", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {thumbnail
          ? <img src={thumbnail} alt={ressource.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#161b22,#1c2128)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 32 }}>📄</span></div>
        }
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: ressource.type === "youtube" ? "#ff0000cc" : "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{ressource.type === "youtube" ? "▶" : "📖"}</div>
        </div>
        {(ressource.duree || ressource.pages) && <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{ressource.duree || `${ressource.pages}p`}</div>}
        <div style={{ position: "absolute", top: 8, left: 8, background: ressource.type === "youtube" ? "#ff0000cc" : "#1f6feb99", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{ressource.type === "youtube" ? "▶ YouTube" : "📄 PDF"}</div>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: "#e6edf3", marginBottom: 4, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ressource.titre}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: badge.bg, color: badge.color, fontWeight: 500 }}>{ressource.niveau || "—"}</span>
          {ressource.profNom && <span style={{ fontSize: 10, color: "#7d8590" }}>{ressource.profNom}</span>}
        </div>
      </div>
      {isProf && (
        <button onClick={e => { e.stopPropagation(); onDelete(ressource); }} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 6, background: "rgba(218,54,51,0.85)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      )}
    </div>
  );
}

// ── Formulaire ajout ressource ─────────────────────────────────────────────────
function FormAjoutRessource({ logicielId, atelierId, user, userData, onClose }) {
  const [form, setForm] = useState({ titre: "", type: "youtube", url: "", duree: "", pages: "", niveau: "Débutant", file: null });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ressource/upload", { method: "POST", body: formData });
      const data = await res.json();
      setForm(prev => ({ ...prev, url: data.url }));
    } catch { alert("Erreur upload fichier"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.titre.trim()) { alert("Titre requis"); return; }
    if (form.type === "youtube" && !form.url.trim()) { alert("URL YouTube requise"); return; }
    if (form.type === "pdf" && !form.url) { alert("Fichier PDF requis"); return; }
    setUploading(true);
    try {
      await addDoc(collection(db, "logiciels", logicielId, "ateliers", atelierId, "ressources"), {
        titre: form.titre.trim(), type: form.type, url: form.url,
        niveau: form.niveau,
        duree: form.type === "youtube" ? form.duree : "",
        pages: form.type === "pdf" ? form.pages : "",
        profId: user.uid,
        profNom: `${userData.prenom} ${userData.nom}`,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch { alert("Erreur ajout ressource"); }
    finally { setUploading(false); }
  };

  const inp = { width: "100%", padding: "8px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, color: "#e6edf3", fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 14, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ position: "sticky", top: 0, background: "#161b22", borderBottom: "1px solid #21262d", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "#e6edf3", fontSize: 15, fontWeight: 600 }}>Ajouter une ressource</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8b949e", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Titre *</label>
            <input style={inp} value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex: Introduction à l'esquisse" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Type *</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["youtube", "pdf"].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t, url: "", file: null }))} style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: form.type === t ? "#1f6feb" : "#21262d", border: `1px solid ${form.type === t ? "#1f6feb" : "#30363d"}`, color: form.type === t ? "#fff" : "#8b949e" }}>
                  {t === "youtube" ? "▶ YouTube" : "📄 PDF"}
                </button>
              ))}
            </div>
          </div>
          {form.type === "youtube" ? (
            <div>
              <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>URL YouTube *</label>
              <input style={inp} value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Fichier PDF *</label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, cursor: "pointer" }}>
                <span style={{ fontSize: 13, color: form.url ? "#3fb950" : "#8b949e" }}>{uploading ? "Upload en cours..." : form.url ? "✓ Fichier chargé" : "Choisir un PDF"}</span>
                <input type="file" accept=".pdf" onChange={e => handleUpload(e.target.files?.[0])} disabled={uploading} style={{ display: "none" }} />
              </label>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>{form.type === "youtube" ? "Durée" : "Nb pages"}</label>
              <input style={inp} value={form.type === "youtube" ? form.duree : form.pages} onChange={e => setForm(p => form.type === "youtube" ? { ...p, duree: e.target.value } : { ...p, pages: e.target.value })} placeholder={form.type === "youtube" ? "14:30" : "8"} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Niveau</label>
              <select value={form.niveau} onChange={e => setForm(p => ({ ...p, niveau: e.target.value }))} style={inp}>
                {NIVEAUX.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 13, cursor: "pointer" }}>Annuler</button>
            <button onClick={handleSubmit} disabled={uploading} style={{ flex: 1, padding: "9px", borderRadius: 8, background: uploading ? "#1a3a5f" : "#1f6feb", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: uploading ? "wait" : "pointer" }}>{uploading ? "Ajout..." : "Ajouter"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ateliers ───────────────────────────────────────────────────────────
function SidebarAteliers({ ateliers, selectedAtelier, setSelectedAtelier, isProf, meta, showFormAtelier, setShowFormAtelier, newAtelierNom, setNewAtelierNom, creatingAtelier, handleCreateAtelier, setConfirmDelete, isMobile, onClose }) {
  return (
    <>
      {/* Overlay cliquable sur mobile */}
      {isMobile && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 60 }} />
      )}
      <div style={{
        // Desktop : dans le flux | Mobile : overlay depuis la gauche
        ...(isMobile ? {
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 70,
          width: 260,
        } : {
          width: 240, flexShrink: 0,
        }),
        background: "#161b22",
        borderRight: "1px solid #21262d",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Header sidebar mobile */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 12px 8px", borderBottom: "1px solid #21262d" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>Ateliers</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#8b949e", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
        )}

        <div style={{ padding: "16px 12px" }}>
          {!isMobile && (
            <p style={{ fontSize: 10, fontWeight: 700, color: "#7d8590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, paddingLeft: 8 }}>Ateliers</p>
          )}

          {ateliers.length === 0 ? (
            <p style={{ fontSize: 12, color: "#7d8590", padding: "8px", textAlign: "center" }}>Aucun atelier</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ateliers.map((atelier, i) => (
                <div key={atelier.id} style={{ display: "flex", alignItems: "center", borderRadius: 8, overflow: "hidden", background: selectedAtelier === atelier.id ? "#1f2937" : "transparent", border: selectedAtelier === atelier.id ? `1px solid ${meta.accent}44` : "1px solid transparent" }}>
                  <button
                    onClick={() => { setSelectedAtelier(atelier.id); if (isMobile) onClose(); }}
                    style={{ flex: 1, padding: "8px 10px", background: "none", border: "none", color: selectedAtelier === atelier.id ? "#e6edf3" : "#8b949e", fontSize: 13, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ width: 20, height: 20, borderRadius: 4, background: selectedAtelier === atelier.id ? meta.accent : "#21262d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{atelier.nom}</span>
                  </button>
                  {isProf && (
                    <button onClick={() => setConfirmDelete({ type: "atelier", item: atelier })} style={{ padding: "0 8px", height: "100%", background: "none", border: "none", color: "#7d8590", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#f85149"}
                      onMouseLeave={e => e.currentTarget.style.color = "#7d8590"}
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isProf && (
            <div style={{ marginTop: 12 }}>
              {showFormAtelier ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input autoFocus value={newAtelierNom} onChange={e => setNewAtelierNom(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleCreateAtelier(); if (e.key === "Escape") setShowFormAtelier(false); }}
                    placeholder="Nom de l'atelier"
                    style={{ width: "100%", padding: "7px 10px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, color: "#e6edf3", fontSize: 12, outline: "none", boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setShowFormAtelier(false)} style={{ flex: 1, padding: "5px", borderRadius: 6, background: "#21262d", border: "none", color: "#8b949e", fontSize: 11, cursor: "pointer" }}>Annuler</button>
                    <button onClick={handleCreateAtelier} disabled={creatingAtelier || !newAtelierNom.trim()} style={{ flex: 1, padding: "5px", borderRadius: 6, background: meta.accent, border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{creatingAtelier ? "..." : "Créer"}</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowFormAtelier(true)}
                  style={{ width: "100%", padding: "7px 10px", background: "none", border: "1px dashed #30363d", borderRadius: 8, color: "#7d8590", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center", transition: "border-color 0.15s, color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = meta.accent; e.currentTarget.style.color = meta.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#7d8590"; }}
                >+ Nouvel atelier</button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── PAGE PRINCIPALE ────────────────────────────────────────────────────────────
export default function LogicielDetailPage() {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [ateliers, setAteliers] = useState([]);
  const [selectedAtelier, setSelectedAtelier] = useState(null);
  const [ressources, setRessources] = useState([]);
  const [loadingRessources, setLoadingRessources] = useState(false);

  const [showFormRessource, setShowFormRessource] = useState(false);
  const [showFormAtelier, setShowFormAtelier] = useState(false);
  const [newAtelierNom, setNewAtelierNom] = useState("");
  const [creatingAtelier, setCreatingAtelier] = useState(false);

  const [viewerRessource, setViewerRessource] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Sur mobile : sidebar fermée par défaut, ouverte sur desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

  const meta = LOGICIELS_META[id] || { label: id, sub: "", logo: null, logoBg: "#333", accent: "#58a6ff" };
  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";

  useEffect(() => { if (user === null) router.push("/login"); }, [user]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "logiciels", id, "ateliers"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAteliers(data);
      if (!selectedAtelier && data.length > 0) setSelectedAtelier(data[0].id);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!selectedAtelier || !id) return;
    setLoadingRessources(true);
    const q = query(collection(db, "logiciels", id, "ateliers", selectedAtelier, "ressources"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setRessources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingRessources(false);
    });
    return () => unsub();
  }, [selectedAtelier, id]);

  const handleCreateAtelier = async () => {
    if (!newAtelierNom.trim()) return;
    setCreatingAtelier(true);
    try {
      const docRef = await addDoc(collection(db, "logiciels", id, "ateliers"), { nom: newAtelierNom.trim(), profId: user.uid, createdAt: serverTimestamp() });
      setSelectedAtelier(docRef.id);
      setNewAtelierNom("");
      setShowFormAtelier(false);
    } catch { alert("Erreur création atelier"); }
    finally { setCreatingAtelier(false); }
  };

  const handleDeleteAtelier = async (atelier) => {
    try {
      await deleteDoc(doc(db, "logiciels", id, "ateliers", atelier.id));
      if (selectedAtelier === atelier.id) setSelectedAtelier(ateliers.find(a => a.id !== atelier.id)?.id || null);
    } catch { alert("Erreur suppression atelier"); }
    setConfirmDelete(null);
  };

  const handleDeleteRessource = async (ressource) => {
    try { await deleteDoc(doc(db, "logiciels", id, "ateliers", selectedAtelier, "ressources", ressource.id)); }
    catch { alert("Erreur suppression ressource"); }
    setConfirmDelete(null);
  };

  if (!user || !userData) return null;

  const atelierActif = ateliers.find(a => a.id === selectedAtelier);

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #21262d", padding: isMobile ? "12px 16px" : "16px 24px", display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap" }}>
        
        {/* Bouton retour */}
        <button onClick={() => router.push("/logiciels")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#8b949e", fontSize: 13, cursor: "pointer", padding: "4px 6px", borderRadius: 6, flexShrink: 0, whiteSpace: "nowrap" }}
          onMouseEnter={e => e.currentTarget.style.color = "#e6edf3"}
          onMouseLeave={e => e.currentTarget.style.color = "#8b949e"}
        >← Retour</button>

        {/* Logo + titre */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: meta.logoBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            {meta.logo ? <img src={meta.logo} alt={meta.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>RDM</span>}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: isMobile ? 14 : 18, fontWeight: 600, color: "#e6edf3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.label}</h1>
            {!isMobile && <p style={{ fontSize: 12, color: "#7d8590" }}>{meta.sub}</p>}
          </div>
        </div>

        {/* Stats — cachées sur très petit écran */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e6edf3" }}>{ateliers.length}</div>
              <div style={{ fontSize: 10, color: "#7d8590" }}>Ateliers</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e6edf3" }}>{ressources.length}</div>
              <div style={{ fontSize: 10, color: "#7d8590" }}>Ressources</div>
            </div>
          </div>
        )}

        {/* Bouton toggle sidebar — toujours visible */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ padding: isMobile ? "6px 10px" : "6px 12px", borderRadius: 8, background: sidebarOpen && !isMobile ? "#1f2937" : "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 12, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          ☰ {isMobile ? "" : "Ateliers"}
        </button>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Sidebar — desktop dans le flux, mobile en overlay */}
        {sidebarOpen && (
          <SidebarAteliers
            ateliers={ateliers}
            selectedAtelier={selectedAtelier}
            setSelectedAtelier={setSelectedAtelier}
            isProf={isProf}
            meta={meta}
            showFormAtelier={showFormAtelier}
            setShowFormAtelier={setShowFormAtelier}
            newAtelierNom={newAtelierNom}
            setNewAtelierNom={setNewAtelierNom}
            creatingAtelier={creatingAtelier}
            handleCreateAtelier={handleCreateAtelier}
            setConfirmDelete={setConfirmDelete}
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px" : "24px", minWidth: 0 }}>
          {ateliers.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "#161b22", border: "1px solid #21262d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎓</div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: "#e6edf3" }}>Aucun atelier disponible</h2>
              <p style={{ fontSize: 13, color: "#7d8590", maxWidth: 360 }}>
                {isProf ? "Créez votre premier atelier depuis la barre latérale." : "Les ressources seront bientôt disponibles."}
              </p>
            </div>
          ) : !selectedAtelier ? null : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 600, color: "#e6edf3" }}>{atelierActif?.nom || "Atelier"}</h2>
                  <p style={{ fontSize: 12, color: "#7d8590", marginTop: 2 }}>{ressources.length} ressource{ressources.length !== 1 ? "s" : ""}</p>
                </div>
                {isProf && (
                  <button onClick={() => setShowFormRessource(true)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}
                  >+ Ajouter une ressource</button>
                )}
              </div>

              {loadingRessources ? (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #1f6feb", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
                </div>
              ) : ressources.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "40vh", gap: 12, textAlign: "center" }}>
                  <span style={{ fontSize: 40 }}>📂</span>
                  <p style={{ fontSize: 14, color: "#7d8590" }}>Aucune ressource dans cet atelier.</p>
                  {isProf && <button onClick={() => setShowFormRessource(true)} style={{ padding: "8px 20px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 13, cursor: "pointer" }}>+ Ajouter la première ressource</button>}
                </div>
              ) : (
                /* ✅ Grille responsive : 1 col mobile, 2 col tablette, 3+ desktop */
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: isMobile ? 10 : 16 }}>
                  {ressources.map(r => (
                    <RessourceCard key={r.id} ressource={r} onOpen={setViewerRessource} onDelete={r => setConfirmDelete({ type: "ressource", item: r })} isProf={isProf} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {viewerRessource && <RessourceViewer ressource={viewerRessource} onClose={() => setViewerRessource(null)} />}
      {showFormRessource && selectedAtelier && <FormAjoutRessource logicielId={id} atelierId={selectedAtelier} user={user} userData={userData} onClose={() => setShowFormRessource(false)} />}
      {confirmDelete && (
        <ModalConfirm
          message={confirmDelete.type === "atelier" ? `Supprimer l'atelier "${confirmDelete.item.nom}" et toutes ses ressources ?` : `Supprimer la ressource "${confirmDelete.item.titre}" ?`}
          onConfirm={() => confirmDelete.type === "atelier" ? handleDeleteAtelier(confirmDelete.item) : handleDeleteRessource(confirmDelete.item)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}