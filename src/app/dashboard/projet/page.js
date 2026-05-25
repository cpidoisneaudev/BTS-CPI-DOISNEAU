// /dashboard/projet/page.js — V2 COMPLET
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection, onSnapshot, query, orderBy,
  getDocs, addDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

// ── Media Query Hook ───────────────────────────────────────────────────────────
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

// ── Couleurs par type de projet ────────────────────────────────────────────────
function typeBadgeStyle(type) {
  if (type === "Prototypage")       return { background: "rgba(31,107,235,0.18)", color: "#58a6ff", border: "1px solid rgba(31,107,235,0.35)" };
  if (type === "Collaboratif CPRP") return { background: "rgba(224,123,57,0.18)", color: "#e07b39", border: "1px solid rgba(224,123,57,0.35)" };
  if (type === "Projet final")      return { background: "rgba(157,149,232,0.18)", color: "#9d95e8", border: "1px solid rgba(157,149,232,0.35)" };
  return { background: "#21262d", color: "#8b949e", border: "1px solid #30363d" };
}

function niveauBadge(niveau) {
  if (niveau === "Débutant")      return { background: "#1a3a2a", color: "#3fb950" };
  if (niveau === "Intermédiaire") return { background: "#3a2e1a", color: "#d29922" };
  return                                 { background: "#3a1a1a", color: "#f85149" };
}

// ── Upload image Cloudinary ────────────────────────────────────────────────────
async function uploadImageCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cpi_doisneau");
  formData.append("folder", "projets");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dckfu8vbw"}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  return data.secure_url;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MODAL AJOUT PROJET ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ModalAjoutProjet({ onClose, onSuccess, userData }) {
  const [etape, setEtape] = useState(1); // 1=Infos, 2=Détails, 3=Livrables
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [livrable, setLivrable] = useState("");
  const [travail, setTravail] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    titre: "",
    type: "Prototypage",
    annee: new Date().getFullYear().toString(),
    groupe: "",
    niveau: "Intermédiaire",
    description: "",
    duree: "",
    livrables: [],
    travaux: [],
    statut: "publié",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const addLivrable = () => {
    if (!livrable.trim()) return;
    set("livrables", [...form.livrables, livrable.trim()]);
    setLivrable("");
  };

  const removeLivrable = (i) => set("livrables", form.livrables.filter((_, idx) => idx !== i));

  const addTravail = () => {
    if (!travail.trim()) return;
    set("travaux", [...form.travaux, travail.trim()]);
    setTravail("");
  };

  const removeTravail = (i) => set("travaux", form.travaux.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.titre.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      let imageUrl = "";
      if (imageFile) imageUrl = await uploadImageCloudinary(imageFile);

      await addDoc(collection(db, "projets"), {
        ...form,
        image: imageUrl,
        profId: userData?.uid || "",
        profNom: userData?.displayName || userData?.prenom + " " + userData?.nom || "",
        createdAt: serverTimestamp(),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Styles communs
  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
    background: "#0d1117", border: "1px solid #30363d", color: "#e6edf3",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 11, color: "#8b949e", fontWeight: 600, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" };
  const fieldStyle = { marginBottom: 14 };

  const TYPES = ["Prototypage", "Collaboratif CPRP", "Projet final"];
  const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];
  const ANNEES = ["2022-2023", "2023-2024", "2024-2025", "2025-2026", "2026-2027"];
  const GROUPES = ["Groupe A", "Groupe B", "Groupe de 2", "Groupe de 3", "Groupe de 4", "Groupe de 5", "Binôme CPI / CPRP"];

  const typeColors = {
    "Prototypage":       { active: "#1f6feb", activeBg: "rgba(31,107,235,0.2)", border: "rgba(31,107,235,0.5)" },
    "Collaboratif CPRP": { active: "#e07b39", activeBg: "rgba(224,123,57,0.2)", border: "rgba(224,123,57,0.5)" },
    "Projet final":      { active: "#9d95e8", activeBg: "rgba(157,149,232,0.2)", border: "rgba(157,149,232,0.5)" },
  };

  const ETAPES = ["Informations", "Détails", "Livrables & Travaux"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e6edf3", margin: 0 }}>Ajouter un projet étudiant</h2>
            <p style={{ fontSize: 11, color: "#7d8590", margin: "3px 0 0" }}>Étape {etape} / 3 — {ETAPES[etape - 1]}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8b949e", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "#21262d" }}>
          <div style={{ height: "100%", background: "#1f6feb", width: `${(etape / 3) * 100}%`, transition: "width 0.3s ease", borderRadius: 2 }} />
        </div>

        {/* Corps scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* ── ÉTAPE 1 : Informations ── */}
          {etape === 1 && (
            <div>
              {/* Type de projet */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Type de projet *</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TYPES.map(t => {
                    const c = typeColors[t];
                    const isActive = form.type === t;
                    return (
                      <button key={t} onClick={() => set("type", t)}
                        style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", border: `1px solid ${isActive ? c.border : "#30363d"}`, background: isActive ? c.activeBg : "transparent", color: isActive ? c.active : "#8b949e" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Titre */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Titre du projet *</label>
                <input style={inputStyle} value={form.titre} onChange={e => set("titre", e.target.value)} placeholder="Ex: Bras articulé Pick & Place" />
              </div>

              {/* Année + Groupe */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Année scolaire</label>
                  <select style={inputStyle} value={form.annee} onChange={e => set("annee", e.target.value)}>
                    {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Groupe</label>
                  <select style={inputStyle} value={form.groupe} onChange={e => set("groupe", e.target.value)}>
                    <option value="">-- Sélectionner --</option>
                    {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Niveau */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Niveau de difficulté</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {NIVEAUX.map(n => {
                    const colors = { "Débutant": "#3fb950", "Intermédiaire": "#d29922", "Avancé": "#f85149" };
                    const isActive = form.niveau === n;
                    return (
                      <button key={n} onClick={() => set("niveau", n)}
                        style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", border: `1px solid ${isActive ? colors[n] + "88" : "#30363d"}`, background: isActive ? colors[n] + "22" : "transparent", color: isActive ? colors[n] : "#8b949e" }}>
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Statut */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Visibilité</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ v: "publié", label: "✅ Publié", color: "#3fb950" }, { v: "brouillon", label: "🔒 Brouillon", color: "#8b949e" }].map(({ v, label, color }) => (
                    <button key={v} onClick={() => set("statut", v)}
                      style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${form.statut === v ? color + "88" : "#30363d"}`, background: form.statut === v ? color + "22" : "transparent", color: form.statut === v ? color : "#8b949e" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Détails ── */}
          {etape === 2 && (
            <div>
              {/* Description */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Description *</label>
                <textarea style={{ ...inputStyle, height: 90, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Décrivez le projet, son contexte et ses objectifs..." />
              </div>

              {/* Durée */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Durée</label>
                <input style={inputStyle} value={form.duree} onChange={e => set("duree", e.target.value)} placeholder="Ex: 6 semaines, 3 mois, 1 semestre..." />
              </div>

              {/* Image */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Image du projet</label>
                <div style={{ border: "1px dashed #30363d", borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer", background: "#0d1117", position: "relative" }}
                  onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <div style={{ position: "relative" }}>
                      <img src={imagePreview} alt="preview" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, display: "block" }} />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "0"}>
                        <span style={{ color: "#fff", fontSize: 12 }}>Changer l'image</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                      <p style={{ fontSize: 12, color: "#7d8590", margin: 0 }}>Cliquez pour uploader une image</p>
                      <p style={{ fontSize: 10, color: "#484f58", margin: "4px 0 0" }}>JPG, PNG — max 5 Mo</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Livrables & Travaux ── */}
          {etape === 3 && (
            <div>
              {/* Livrables */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Livrables attendus</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={livrable} onChange={e => setLivrable(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addLivrable()}
                    placeholder="Ex: Dossier de conception CAO..." />
                  <button onClick={addLivrable}
                    style={{ padding: "9px 14px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>
                    +
                  </button>
                </div>
                {form.livrables.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {form.livrables.map((l, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d1117", border: "1px solid #21262d", borderRadius: 6, padding: "6px 10px" }}>
                        <span style={{ color: "#3fb950", fontSize: 12 }}>✓</span>
                        <span style={{ flex: 1, fontSize: 12, color: "#c9d1d9" }}>{l}</span>
                        <button onClick={() => removeLivrable(i)} style={{ background: "none", border: "none", color: "#f85149", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {form.livrables.length === 0 && (
                  <p style={{ fontSize: 11, color: "#484f58", margin: 0 }}>Aucun livrable ajouté — appuyez sur Entrée ou cliquez sur +</p>
                )}
              </div>

              {/* Travaux à réaliser */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Travaux à réaliser</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={travail} onChange={e => setTravail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addTravail()}
                    placeholder="Ex: Modélisation 3D sous SolidWorks..." />
                  <button onClick={addTravail}
                    style={{ padding: "9px 14px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#e6edf3", fontSize: 13, cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>
                    +
                  </button>
                </div>
                {form.travaux.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {form.travaux.map((t, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d1117", border: "1px solid #21262d", borderRadius: 6, padding: "6px 10px" }}>
                        <span style={{ color: "#58a6ff", fontSize: 12 }}>→</span>
                        <span style={{ flex: 1, fontSize: 12, color: "#c9d1d9" }}>{t}</span>
                        <button onClick={() => removeTravail(i)} style={{ background: "none", border: "none", color: "#f85149", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {form.travaux.length === 0 && (
                  <p style={{ fontSize: 11, color: "#484f58", margin: 0 }}>Aucun travail ajouté</p>
                )}
              </div>

              {/* Récap */}
              <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "#7d8590", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Récapitulatif</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    { label: "Titre", val: form.titre || "—" },
                    { label: "Type", val: form.type },
                    { label: "Année", val: form.annee },
                    { label: "Groupe", val: form.groupe || "—" },
                    { label: "Niveau", val: form.niveau },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", gap: 8, fontSize: 12 }}>
                      <span style={{ color: "#7d8590", width: 60, flexShrink: 0 }}>{label}</span>
                      <span style={{ color: "#e6edf3" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #21262d", display: "flex", gap: 10, justifyContent: "space-between" }}>
          <button onClick={() => etape > 1 ? setEtape(e => e - 1) : onClose()}
            style={{ padding: "9px 18px", borderRadius: 8, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            {etape === 1 ? "Annuler" : "← Retour"}
          </button>
          {etape < 3 ? (
            <button onClick={() => setEtape(e => e + 1)}
              disabled={etape === 1 && !form.titre.trim()}
              style={{ padding: "9px 22px", borderRadius: 8, background: etape === 1 && !form.titre.trim() ? "#21262d" : "#1f6feb", border: "none", color: etape === 1 && !form.titre.trim() ? "#484f58" : "#fff", fontSize: 13, fontWeight: 600, cursor: etape === 1 && !form.titre.trim() ? "not-allowed" : "pointer" }}>
              Suivant →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving || !form.description.trim()}
              style={{ padding: "9px 22px", borderRadius: 8, background: saving ? "#21262d" : "#1f6feb", border: "none", color: saving ? "#484f58" : "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {saving ? "Enregistrement..." : "✓ Publier le projet"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── PAGE PRINCIPALE ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function DashboardProjetPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [projets, setProjets] = useState([]);
  const [ressourcesCounts, setRessourcesCounts] = useState({});
  const [loadingProjets, setLoadingProjets] = useState(true);
  const [filtreActif, setFiltreActif] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";

  useEffect(() => { if (user === null) router.push("/login"); }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, "projets"), orderBy("createdAt", "desc")),
      async (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const visibles = isProf ? data : data.filter(p => p.statut === "publié");
        setProjets(visibles);
        setLoadingProjets(false);
        // Compter ressources
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

  // Filtrer les projets selon filtre actif
  const projetsFiltres = filtreActif === "Tous"
    ? projets
    : projets.filter(p => p.type === filtreActif);

  const handleSuccess = () => {
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const TYPES_INFO = [
    {
      icon: "🖨️",
      titre: "Projet de prototypage",
      desc: "Conception, fabrication de pièces, assemblage et tests pour valider la faisabilité.",
      tags: ["Impression 3D", "Assemblage", "Tests"],
      tagColor: "#58a6ff", tagBg: "rgba(31,107,235,0.2)",
      image: "https://images.unsplash.com/photo-1563520239648-a8f4b43d3b19?w=600&q=80",
      accent: "#1f6feb", iconBg: "#1f3a5f",
    },
    {
      icon: "🤝",
      titre: "Projet collaboratif avec CPRP",
      desc: "Collaboration avec les techniciens d'usinage (CPRP) pour concevoir et fabriquer des sous-ensembles.",
      tags: ["CAO", "Usinage CNC", "Métrologie"],
      tagColor: "#e07b39", tagBg: "rgba(224,123,57,0.2)",
      image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80",
      accent: "#e07b39", iconBg: "#3a2010",
    },
    {
      icon: "🏆",
      titre: "Projet final U51 (6 mois)",
      desc: "Projet industriel complet répondant à un besoin réel d'entreprise ou de centre de recherche.",
      tags: ["CAO avancée", "Simulation", "Soutenance"],
      tagColor: "#9d95e8", tagBg: "rgba(157,149,232,0.2)",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
      accent: "#9d95e8", iconBg: "#1a1a3a",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "sans-serif", overflowX: "hidden" }}>

      {/* ── MODAL ── */}
      {showModal && (
        <ModalAjoutProjet
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          userData={userData}
        />
      )}

      {/* ── Toast succès ── */}
      {successMsg && (
        <div style={{ position: "fixed", top: 80, right: 20, zIndex: 999, background: "#1a3a2a", border: "1px solid #3fb950", borderRadius: 10, padding: "12px 18px", color: "#3fb950", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
          ✓ Projet ajouté avec succès !
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", boxSizing: "border-box", width: "100%" }}>

        {/* ══ HERO — image plein fond ══ */}
        <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", marginBottom: 28, minHeight: isMobile ? 260 : 320 }}>
          {/* Image de fond */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
          {/* Overlay gradient */}
          <div style={{ position: "absolute", inset: 0, background: isMobile ? "rgba(13,17,23,0.85)" : "linear-gradient(90deg, rgba(13,17,23,0.97) 0%, rgba(13,17,23,0.85) 55%, rgba(13,17,23,0.35) 100%)", zIndex: 1 }} />
          {/* Contenu */}
          <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "28px 20px" : "52px 44px", maxWidth: 600 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(31,107,235,0.2)", border: "1px solid rgba(31,107,235,0.4)", borderRadius: 99, padding: "4px 12px", fontSize: 10, color: "#58a6ff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
              🎓 Projets BTS CPI
            </div>
            <h1 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 800, color: "#e6edf3", marginBottom: 12, lineHeight: 1.2 }}>
              Concevoir. Prototyper.<br />
              <span style={{ color: "#1f6feb" }}>Innover.</span>
            </h1>
            <p style={{ fontSize: isMobile ? 13 : 15, color: "#8b949e", marginBottom: 24, lineHeight: 1.7, maxWidth: 460 }}>
              Retrouvez ici tous les projets réalisés par les étudiants BTS CPI du Lycée Robert Doisneau — de l'idée au prototype, chaque projet témoigne d'un savoir-faire concret.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {[
                { label: "🎓 Apprendre en faisant", color: "#3fb950", bg: "#1a3a2a" },
                { label: "🤝 Collaborer et innover", color: "#d29922", bg: "#3a2e1a" },
                { label: "🎯 Besoins industriels réels", color: "#58a6ff", bg: "rgba(31,107,235,0.18)" },
              ].map(({ label, color, bg }) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", fontSize: 11, color, background: bg, borderRadius: 99, border: `1px solid ${color}33`, fontWeight: 500 }}>{label}</span>
              ))}
            </div>
            {/* Stats rapides */}
            <div style={{ display: "flex", gap: isMobile ? 16 : 28, flexWrap: "wrap" }}>
              {[
                { val: projets.length, label: "Projets" },
                { val: "3", label: "Types" },
                { val: "2", label: "Promos" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: "#e6edf3" }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#7d8590" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ 3 TYPES DE PROJETS ══ */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 4, height: 18, background: "#1f6feb", borderRadius: 2 }} />
            <h2 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: "#e6edf3" }}>Nos 3 types de projets</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
            {TYPES_INFO.map((type, i) => (
              <div key={i}
                style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #21262d", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", position: "relative", minHeight: isMobile ? 170 : 210 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = type.accent; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#21262d"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${type.image}')`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(13,17,23,0.95) 0%, rgba(13,17,23,0.6) 100%)", zIndex: 1 }} />
                <div style={{ position: "relative", zIndex: 2, padding: isMobile ? 16 : 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: type.iconBg, border: `1px solid ${type.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>
                    {type.icon}
                  </div>
                  <h3 style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: "#e6edf3", marginBottom: 6, lineHeight: 1.3 }}>{type.titre}</h3>
                  <p style={{ fontSize: 11, color: "#c9d1d9", lineHeight: 1.6, marginBottom: 10 }}>{type.desc}</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {type.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: type.tagBg, color: type.tagColor, fontWeight: 600, border: `1px solid ${type.accent}33` }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ PROJETS RÉALISÉS ══ */}
        <div style={{ marginBottom: 28 }}>

          {/* Header : titre + bouton ajouter (PROF) */}
          <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 4, height: 18, background: "#1f6feb", borderRadius: 2 }} />
              <h2 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: "#e6edf3" }}>
                Projets réalisés{" "}
                <span style={{ fontSize: 11, color: "#7d8590", fontWeight: 400 }}>
                  (années précédentes)
                </span>
              </h2>
            </div>
            {isProf && (
              <button onClick={() => setShowModal(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
                + Ajouter un projet
              </button>
            )}
          </div>

          {/* Filtres + bouton "Voir tous les projets" */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {/* Filtres pills — scroll horizontal sur mobile */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1, paddingBottom: 2 }}>
              {FILTRES.map((f) => (
                <button key={f} onClick={() => setFiltreActif(f)}
                  style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, border: "1px solid", cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                    background: filtreActif === f ? "#1f6feb" : "transparent",
                    borderColor: filtreActif === f ? "#1f6feb" : "#30363d",
                    color: filtreActif === f ? "#fff" : "#8b949e",
                  }}>
                  {f}
                  {filtreActif === f && f !== "Tous" && (
                    <span style={{ marginLeft: 4, background: "rgba(255,255,255,0.25)", borderRadius: 99, padding: "0 5px", fontSize: 10 }}>
                      {projetsFiltres.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {/* Bouton "Voir tous les projets →" — masqué sur mobile */}
            {!isMobile && (
              <button
                onClick={() => router.push("/projet/tous")}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: 20, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 11, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.color = "#58a6ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#8b949e"; }}>
                Voir tous les projets →
              </button>
            )}
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
          ) : projetsFiltres.length === 0 ? (
            <div style={{ background: "#161b22", border: "1px dashed #21262d", borderRadius: 12, padding: "50px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
              <p style={{ color: "#7d8590", fontSize: 13, marginBottom: 6 }}>
                {filtreActif === "Tous" ? "Aucun projet disponible pour l'instant." : `Aucun projet "${filtreActif}" pour l'instant.`}
              </p>
              {isProf && (
                <button onClick={() => setShowModal(true)}
                  style={{ marginTop: 10, padding: "8px 16px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  + Ajouter le premier projet
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px,1fr))", gap: isMobile ? 10 : 14 }}>
              {projetsFiltres.map(projet => {
                const typeBadge = typeBadgeStyle(projet.type);
                const niveauStyle = niveauBadge(projet.niveau);
                return (
                  <div key={projet.id}
                    onClick={() => router.push(`/projet/${projet.id}`)}
                    style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(31,107,235,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#21262d"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>

                    {/* Image */}
                    <div style={{ width: "100%", aspectRatio: "4/3", background: "#0d1117", position: "relative", overflow: "hidden" }}>
                      {projet.image
                        ? <img src={projet.image} alt={projet.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, background: "linear-gradient(135deg,#161b22,#1c2128)" }}>🔧</div>
                      }
                      {/* Badge TYPE (en bas à gauche) */}
                      {projet.type && (
                        <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 9, padding: "3px 8px", borderRadius: 4, fontWeight: 700, ...typeBadge }}>
                          {projet.type}
                        </div>
                      )}
                      {/* Badge niveau (en haut à gauche) */}
                      {projet.niveau && (
                        <div style={{ position: "absolute", top: 8, left: 8, fontSize: 9, padding: "3px 8px", borderRadius: 4, fontWeight: 600, background: niveauStyle.background, color: niveauStyle.color }}>
                          {projet.niveau}
                        </div>
                      )}
                      {/* Bookmark */}
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

        {/* ══ CTA BANNIÈRE ══ */}
        <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", marginBottom: 24, minHeight: isMobile ? 220 : 180 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: isMobile ? "rgba(13,17,23,0.9)" : "linear-gradient(90deg, rgba(13,17,23,0.96) 45%, rgba(13,17,23,0.5) 100%)", zIndex: 1 }} />
          <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "28px 20px" : "40px 44px", maxWidth: 520 }}>
            <h2 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, color: "#e6edf3", marginBottom: 10, lineHeight: 1.25 }}>
              Vous avez une idée ?<br />Faisons-la devenir réalité !
            </h2>
            <p style={{ fontSize: isMobile ? 12 : 13, color: "#8b949e", lineHeight: 1.7, marginBottom: 20, maxWidth: 400 }}>
              Proposez votre projet ou rejoignez une équipe pour relever de nouveaux défis et développer des solutions innovantes.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {isProf ? (
                <button onClick={() => setShowModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: isMobile ? "9px 18px" : "11px 22px", borderRadius: 10, background: "#1f6feb", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                  onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
                  + Ajouter un projet →
                </button>
              ) : (
                <button
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: isMobile ? "9px 18px" : "11px 22px", borderRadius: 10, background: "#1f6feb", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                  onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
                  Proposer une idée →
                </button>
              )}
              <button
                style={{ padding: isMobile ? "9px 18px" : "11px 22px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "#e6edf3", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
                Rejoindre un projet
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}