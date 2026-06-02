"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import {
  collection, onSnapshot, addDoc, deleteDoc, updateDoc,
  doc, serverTimestamp, orderBy, query
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Hooks ──────────────────────────────────────────────────
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

// ── Highlight recherche ────────────────────────────────────
function highlight(text, query) {
  if (!query.trim()) return text;
  const parts = String(text).split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: "rgba(31,107,235,0.32)", color: "var(--text-primary)", padding: "0 2px", borderRadius: 3 }}>{part}</mark>
      : part
  );
}

// ── Upload Cloudinary ──────────────────────────────────────
async function uploadToCloudinary(file, folder = "bibliotheque") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await fetch("/api/ressource/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.url;
}

// ── SVG Icons ──────────────────────────────────────────────
const IconSearch    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconLink      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconBook      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconBox       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconCube      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l9 4.9V17L12 22 3 17V6.9L12 2z"/><polyline points="12 22 12 12"/><polyline points="3 6.9 12 12 21 6.9"/></svg>;
const IconDownload  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconExternal  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IconRefresh   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IconGlobe     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconPlus      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconEdit      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconUpload    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

// ── Données statiques (SVG pièces) ─────────────────────────
const PIECES_SVG = {
  "Roulement à billes": <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><circle cx="30" cy="30" r="24"/><circle cx="30" cy="30" r="10"/><circle cx="30" cy="10" r="3" fill="#8b949e"/><circle cx="30" cy="50" r="3" fill="#8b949e"/><circle cx="10" cy="30" r="3" fill="#8b949e"/><circle cx="50" cy="30" r="3" fill="#8b949e"/><circle cx="16" cy="16" r="3" fill="#8b949e"/><circle cx="44" cy="44" r="3" fill="#8b949e"/><circle cx="44" cy="16" r="3" fill="#8b949e"/><circle cx="16" cy="44" r="3" fill="#8b949e"/></svg>,
  "Vérin pneumatique": <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><rect x="8" y="22" width="36" height="16" rx="3"/><rect x="44" y="26" width="10" height="8" rx="1.5"/><line x1="8" y1="30" x2="2" y2="30"/><rect x="18" y="18" width="16" height="24" rx="2" strokeDasharray="3 2"/></svg>,
  "Guidage linéaire": <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><rect x="4" y="26" width="52" height="8" rx="2"/><rect x="18" y="20" width="24" height="20" rx="3"/><circle cx="22" cy="30" r="3"/><circle cx="30" cy="30" r="3"/><circle cx="38" cy="30" r="3"/></svg>,
  "Poulie trapézoïdale": <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><circle cx="30" cy="30" r="22"/><circle cx="30" cy="30" r="14"/><circle cx="30" cy="30" r="4"/><line x1="30" y1="8" x2="30" y2="16"/><line x1="30" y1="44" x2="30" y2="52"/><line x1="8" y1="30" x2="16" y2="30"/><line x1="44" y1="30" x2="52" y2="30"/></svg>,
  "Motoréducteur": <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><rect x="6" y="18" width="28" height="24" rx="3"/><circle cx="20" cy="30" r="8"/><circle cx="20" cy="30" r="3"/><rect x="34" y="24" width="18" height="12" rx="2"/><line x1="52" y1="30" x2="58" y2="30"/></svg>,
  "Vis hexagonale": <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><polygon points="30,6 50,18 50,42 30,54 10,42 10,18"/><circle cx="30" cy="30" r="8"/><line x1="30" y1="42" x2="30" y2="58"/><rect x="26" y="42" width="8" height="16" rx="1"/></svg>,
  "Engrenage droit": <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><circle cx="30" cy="30" r="16"/><circle cx="30" cy="30" r="5"/>{[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>{const r=a*Math.PI/180;return <line key={a} x1={30+16*Math.cos(r)} y1={30+16*Math.sin(r)} x2={30+22*Math.cos(r)} y2={30+22*Math.sin(r)} strokeWidth="4" strokeLinecap="round"/>;})}</svg>,
  "Chaîne à rouleaux": <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><rect x="4" y="24" width="10" height="12" rx="2"/><rect x="18" y="24" width="10" height="12" rx="2"/><rect x="32" y="24" width="10" height="12" rx="2"/><rect x="46" y="24" width="10" height="12" rx="2"/><line x1="14" y1="27" x2="18" y2="27"/><line x1="14" y1="33" x2="18" y2="33"/><line x1="28" y1="27" x2="32" y2="27"/><line x1="28" y1="33" x2="32" y2="33"/><line x1="42" y1="27" x2="46" y2="27"/><line x1="42" y1="33" x2="46" y2="33"/><circle cx="9" cy="30" r="2" fill="#8b949e"/><circle cx="23" cy="30" r="2" fill="#8b949e"/><circle cx="37" cy="30" r="2" fill="#8b949e"/><circle cx="51" cy="30" r="2" fill="#8b949e"/></svg>,
};

const DEFAULT_SVG = <svg viewBox="0 0 60 60" fill="none" stroke="#8b949e" strokeWidth="1.5"><rect x="10" y="10" width="40" height="40" rx="6"/><line x1="20" y1="25" x2="40" y2="25"/><line x1="20" y1="35" x2="34" y2="35"/></svg>;

const TAG_COLORS = {
  CAO:        { bg: "rgba(31,107,235,0.12)", text: "#58a6ff" },
  Officiel:   { bg: "rgba(63,185,80,0.12)",  text: "#3fb950" },
  Composants: { bg: "rgba(224,123,57,0.12)", text: "#e07b39" },
  Norme:      { bg: "rgba(157,149,232,0.12)",text: "#9d95e8" },
  Autre:      { bg: "rgba(139,148,158,0.12)",text: "#8b949e" },
};

const COVER_PRESETS = [
  { label: "Bleu", bg: "linear-gradient(160deg,#1e3a5f,#2d6a9f)", accent: "#60a5fa" },
  { label: "Orange", bg: "linear-gradient(160deg,#3b2a1a,#8b5e3c)", accent: "#f59e0b" },
  { label: "Vert", bg: "linear-gradient(160deg,#1a3a2a,#2d7a4f)", accent: "#34d399" },
  { label: "Violet", bg: "linear-gradient(160deg,#2a1a3a,#6d3a8b)", accent: "#a78bfa" },
  { label: "Rouge", bg: "linear-gradient(160deg,#3a1a1a,#8b2a2a)", accent: "#f87171" },
  { label: "Cyan",  bg: "linear-gradient(160deg,#0f2a3a,#1a6a7a)", accent: "#22d3ee" },
];

const CATEGORIES_PIECES = ["Mécanique", "Transmission", "Guidage", "Éléments normalisés", "Assemblage"];
const FORMATS_OPTIONS   = [".STEP", ".IGS", ".SLDPRT", ".CATPart", ".DWG", ".DXF", ".STL"];
const FILTERS_PIECES    = ["Tous", ...CATEGORIES_PIECES];
const TAGS_SITES        = ["CAO", "Officiel", "Composants", "Norme", "Autre"];

// ════════════════════════════════════════════════════════════
// MODAL GÉNÉRIQUE
// ════════════════════════════════════════════════════════════
function Modal({ title, onClose, children, saving, onSubmit, submitLabel = "Ajouter" }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>{children}</div>
        {/* Footer */}
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>
            Annuler
          </button>
          <button onClick={onSubmit} disabled={saving}
            style={{ padding: "8px 20px", borderRadius: 8, background: saving ? "var(--border)" : "#1f6feb", border: "none", color: saving ? "var(--text-secondary)" : "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Enregistrement..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Champ formulaire
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputSt = { width: "100%", padding: "9px 12px", borderRadius: 8, background: "var(--bg-primary)", border: "1px solid var(--border-hover)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" };

// ════════════════════════════════════════════════════════════
// MODAL SITE
// ════════════════════════════════════════════════════════════
function ModalSite({ onClose, userData, siteToEdit = null }) {
  const isEdit = !!siteToEdit;
  const [form, setForm] = useState({
    nom: siteToEdit?.nom || "",
    logo: siteToEdit?.logo || "",
    description: siteToEdit?.description || "",
    url: siteToEdit?.url || "https://",
    tag: siteToEdit?.tag || "CAO",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nom.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        logo: form.logo.trim() || form.nom.slice(0, 2).toUpperCase(),
        description: form.description.trim(),
        url: form.url.trim(),
        tag: form.tag,
      };
      if (isEdit) {
        await updateDoc(doc(db, "bibliotheque", "sites", "items", siteToEdit.id), payload);
      } else {
        await addDoc(collection(db, "bibliotheque", "sites", "items"), {
          ...payload,
          profId: userData?.uid || "",
          profNom: `${userData?.prenom || ""} ${userData?.nom || ""}`.trim(),
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? "Modifier le site" : "Ajouter un site recommandé"} onClose={onClose} saving={saving} onSubmit={handleSubmit} submitLabel={isEdit ? "Enregistrer" : "Ajouter le site"}>
      <Field label="Nom du site *">
        <input style={inputSt} value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Ex: GrabCAD" />
      </Field>
      <Field label="Sigle / Logo (2-3 lettres)">
        <input style={inputSt} value={form.logo} onChange={e => set("logo", e.target.value)} placeholder="Ex: GC (auto si vide)" maxLength={3} />
      </Field>
      <Field label="URL *">
        <input style={inputSt} value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." />
      </Field>
      <Field label="Description">
        <textarea style={{ ...inputSt, height: 72, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Décrivez brièvement ce site..." />
      </Field>
      <Field label="Catégorie">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TAGS_SITES.map(t => (
            <button key={t} onClick={() => set("tag", t)}
              style={{ padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid", background: form.tag === t ? TAG_COLORS[t]?.bg : "transparent", color: form.tag === t ? TAG_COLORS[t]?.text : "var(--text-secondary)", borderColor: form.tag === t ? TAG_COLORS[t]?.text + "66" : "var(--border)" }}>
              {t}
            </button>
          ))}
        </div>
      </Field>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// MODAL LIVRE PDF — Couverture Cloudinary + PDF Google Drive
// ════════════════════════════════════════════════════════════

function parseDriveUrl(url) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    const id = match[1];
    return {
      fileId: id,
      previewUrl: `https://drive.google.com/file/d/${id}/preview`,
      viewUrl: `https://drive.google.com/file/d/${id}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
    };
  }
  return null;
}

function ModalLivre({ onClose, userData }) {
  const [form, setForm] = useState({ titre: "", soustitre: "", description: "", pages: "", size: "", driveUrl: "" });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [drivePreview, setDrivePreview] = useState(null);
  const [driveError, setDriveError] = useState("");
  const coverRef = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = ev => setCoverPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDriveUrl = (url) => {
    set("driveUrl", url);
    setDriveError("");
    if (!url.trim()) { setDrivePreview(null); return; }
    const parsed = parseDriveUrl(url);
    if (parsed) { setDrivePreview(parsed); }
    else { setDrivePreview(null); if (url.length > 10) setDriveError("Lien invalide — copiez le lien de partage Google Drive."); }
  };

  const handleSubmit = async () => {
    if (!form.titre.trim()) return;
    if (!drivePreview) { setDriveError("Veuillez coller un lien Google Drive valide."); return; }
    setSaving(true);
    try {
      let coverUrl = "";
      if (coverFile) {
        setUploadMsg("Upload de la couverture...");
        coverUrl = await uploadToCloudinary(coverFile, "bibliotheque/couvertures");
        setUploadMsg("");
      }
      await addDoc(collection(db, "bibliotheque", "livres", "items"), {
        titre: form.titre.trim(),
        soustitre: form.soustitre.trim(),
        description: form.description.trim(),
        pages: parseInt(form.pages) || 0,
        size: form.size.trim(),
        coverUrl,
        fileUrl: drivePreview.viewUrl,
        previewUrl: drivePreview.previewUrl,
        downloadUrl: drivePreview.downloadUrl,
        driveFileId: drivePreview.fileId,
        profId: userData?.uid || "",
        profNom: `${userData?.prenom || ""} ${userData?.nom || ""}`.trim(),
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Ajouter un livre / document PDF" onClose={onClose} saving={saving} onSubmit={handleSubmit} submitLabel="Publier le document">
      <Field label="Titre *">
        <input style={inputSt} value={form.titre} onChange={e => set("titre", e.target.value)} placeholder="Ex: Mécanique des matériaux" />
      </Field>
      <Field label="Auteur">
        <input style={inputSt} value={form.soustitre} onChange={e => set("soustitre", e.target.value)} placeholder="Ex: Cours et exercices" />
      </Field>
      <Field label="Description">
        <textarea style={{ ...inputSt, height: 60, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Guide complet sur..." />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Field label="Nombre de pages">
          <input style={inputSt} type="number" value={form.pages} onChange={e => set("pages", e.target.value)} placeholder="Ex: 152" />
        </Field>
        <Field label="Taille">
          <input style={inputSt} value={form.size} onChange={e => set("size", e.target.value)} placeholder="Ex: 2.4 Mo" />
        </Field>
      </div>

      {/* Image de couverture */}
      <Field label="Image de couverture (photo de la page de garde)">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {/* Aperçu couverture */}
          <div style={{ width: 80, height: 108, borderRadius: 6, background: "var(--bg-hover)", border: "1px solid var(--border)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {coverPreview
              ? <img src={coverPreview} alt="couverture" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 24 }}>📖</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: "12px", textAlign: "center", cursor: "pointer", background: "var(--bg-primary)" }}
              onClick={() => coverRef.current?.click()}>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                {coverFile ? `✅ ${coverFile.name}` : "Cliquer pour uploader la couverture"}
              </p>
              <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "3px 0 0" }}>JPG, PNG — photo de la page de garde</p>
              <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverFile} />
            </div>
            {uploadMsg && <p style={{ fontSize: 11, color: "#58a6ff", margin: "4px 0 0" }}>{uploadMsg}</p>}
          </div>
        </div>
      </Field>

      {/* Lien Google Drive */}
      <Field label="Lien Google Drive (PDF) *">
        <input style={{ ...inputSt, borderColor: driveError ? "#f85149" : drivePreview ? "#3fb950" : "var(--border-hover)" }}
          value={form.driveUrl} onChange={e => handleDriveUrl(e.target.value)}
          placeholder="https://drive.google.com/file/d/.../view" />
        {driveError && <p style={{ fontSize: 11, color: "#f85149", margin: "4px 0 0" }}>⚠️ {driveError}</p>}
        {drivePreview && <p style={{ fontSize: 11, color: "#3fb950", margin: "4px 0 0" }}>✓ Lien Drive valide</p>}
        <div style={{ background: "var(--bg-hover)", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 8 }}>
          <strong style={{ color: "var(--text-primary)" }}>Google Drive :</strong> Clic droit sur le PDF → Partager → Tout le monde avec le lien → Copier
        </div>
      </Field>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// MODAL PIÈCE CAO
// ════════════════════════════════════════════════════════════
function ModalPiece({ onClose, userData }) {
  const [form, setForm] = useState({ titre: "", categorie: "Mécanique", formats: [] });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileRef = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleFormat = (f) => {
    set("formats", form.formats.includes(f) ? form.formats.filter(x => x !== f) : [...form.formats, f]);
  };

  const handleSubmit = async () => {
    if (!form.titre.trim()) return;
    setSaving(true);
    try {
      let fileUrl = "";
      if (file) {
        setUploadProgress("Upload en cours...");
        fileUrl = await uploadToCloudinary(file, "bibliotheque/pieces");
        setUploadProgress("");
      }
      await addDoc(collection(db, "bibliotheque", "pieces", "items"), {
        titre: form.titre.trim(),
        categorie: form.categorie,
        formats: form.formats,
        fileUrl,
        profId: userData?.uid || "",
        profNom: `${userData?.prenom || ""} ${userData?.nom || ""}`.trim(),
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Ajouter une pièce CAO" onClose={onClose} saving={saving} onSubmit={handleSubmit} submitLabel="Publier la pièce">
      <Field label="Nom de la pièce *">
        <input style={inputSt} value={form.titre} onChange={e => set("titre", e.target.value)} placeholder="Ex: Roulement à billes 6205" />
      </Field>
      <Field label="Catégorie">
        <select style={inputSt} value={form.categorie} onChange={e => set("categorie", e.target.value)}>
          {CATEGORIES_PIECES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Formats disponibles">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FORMATS_OPTIONS.map(f => (
            <button key={f} onClick={() => toggleFormat(f)}
              style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid", background: form.formats.includes(f) ? "rgba(31,107,235,0.15)" : "transparent", color: form.formats.includes(f) ? "#58a6ff" : "var(--text-secondary)", borderColor: form.formats.includes(f) ? "rgba(88,166,255,0.5)" : "var(--border)" }}>
              {f}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Fichier CAO">
        <div style={{ border: "1px dashed var(--border)", borderRadius: 10, padding: "20px 16px", textAlign: "center", cursor: "pointer", background: "var(--bg-primary)" }}
          onClick={() => fileRef.current?.click()}>
          {file ? (
            <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>📦 {file.name}</div>
          ) : (
            <>
              <div style={{ color: "var(--text-tertiary)", marginBottom: 6, display: "flex", justifyContent: "center" }}><IconUpload /></div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Cliquer pour uploader le fichier</p>
              <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: "4px 0 0" }}>STEP, SLDPRT, CATPart, ZIP...</p>
            </>
          )}
          {uploadProgress && <p style={{ fontSize: 11, color: "#58a6ff", margin: "8px 0 0" }}>{uploadProgress}</p>}
          <input ref={fileRef} type="file" accept=".step,.stp,.igs,.iges,.sldprt,.sldasm,.CATPart,.CATProduct,.dwg,.dxf,.stl,.zip" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
        </div>
      </Field>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
export default function DashboardBibliothequePage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1100px)");

  const [search, setSearch]           = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");

  // Modals
  const [showModalSite, setShowModalSite]   = useState(false);
  const [editSite, setEditSite]             = useState(null);
  const [showModalLivre, setShowModalLivre] = useState(false);
  const [showModalPiece, setShowModalPiece] = useState(false);

  // Données Firestore
  const [sites, setSites]   = useState([]);
  const [livres, setLivres] = useState([]);
  const [pieces, setPieces] = useState([]);

  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";

  useEffect(() => { if (user === null) router.push("/login"); }, [user, router]);

  // Écoute temps réel
  useEffect(() => {
    if (!user) return;
    const unSites  = onSnapshot(query(collection(db, "bibliotheque", "sites",  "items"), orderBy("createdAt", "asc")),  s => setSites(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unLivres = onSnapshot(query(collection(db, "bibliotheque", "livres", "items"), orderBy("createdAt", "desc")),  s => setLivres(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unPieces = onSnapshot(query(collection(db, "bibliotheque", "pieces", "items"), orderBy("createdAt", "asc")),  s => setPieces(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unSites(); unLivres(); unPieces(); };
  }, [user]);

  // Suppression
  const deleteSite  = async (id) => { if (confirm("Supprimer ce site ?"))  await deleteDoc(doc(db, "bibliotheque", "sites",  "items", id)); };
  const deleteLivre = async (id) => { if (confirm("Supprimer ce livre ?")) await deleteDoc(doc(db, "bibliotheque", "livres", "items", id)); };
  const deletePiece = async (id) => { if (confirm("Supprimer cette pièce ?")) await deleteDoc(doc(db, "bibliotheque", "pieces", "items", id)); };

  // Filtrage
  const filteredSites = useMemo(() => {
    const base = [...sites].sort((a, b) => (a.nom || "").localeCompare(b.nom || ""));
    const filtered = !search.trim() ? base : base.filter(s => [s.nom, s.description].join(" ").toLowerCase().includes(search.toLowerCase()));
    return filtered.slice(0, 5);
  }, [sites, search]);

  const filteredPieces = useMemo(() => {
    const byFilter = activeFilter === "Tous" ? pieces : pieces.filter(p => p.categorie === activeFilter);
    if (!search.trim()) return byFilter;
    const q = search.toLowerCase();
    return byFilter.filter(p => [p.titre, p.categorie, ...(p.formats || [])].join(" ").toLowerCase().includes(q));
  }, [pieces, activeFilter, search]);

  const quickCards = [
    { title: "Liens Utiles",        count: sites.length,  label: "ressources",  icon: <IconLink />,  color: "#1f6feb", bg: "rgba(31,107,235,0.15)", border: "rgba(31,107,235,0.3)" },
    { title: "Livres PDF",          count: livres.length, label: "documents",   icon: <IconBook />,  color: "#3fb950", bg: "rgba(63,185,80,0.12)",  border: "rgba(63,185,80,0.3)" },
    { title: "Norelem & Catalogues",count: 18,            label: "catalogues",  icon: <IconBox />,   color: "#e07b39", bg: "rgba(224,123,57,0.12)", border: "rgba(224,123,57,0.3)" },
    { title: "Pièces mécaniques",   count: pieces.length, label: "modèles 3D",  icon: <IconCube />,  color: "#9d95e8", bg: "rgba(157,149,232,0.12)",border: "rgba(157,149,232,0.3)" },
  ];

  if (!user || !userData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "sans-serif", overflowX: "hidden" }}>

      {/* Modals */}
      {(showModalSite || editSite) && <ModalSite onClose={() => { setShowModalSite(false); setEditSite(null); }} userData={userData} siteToEdit={editSite} />}
      {showModalLivre && <ModalLivre onClose={() => setShowModalLivre(false)} userData={userData} />}
      {showModalPiece && <ModalPiece onClose={() => setShowModalPiece(false)} userData={userData} />}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "16px 12px" : "28px 24px", boxSizing: "border-box" }}>

        {/* ══════════════ HERO ══════════════ */}
        <section style={{ borderRadius: 20, overflow: "hidden", position: "relative", marginBottom: 20, border: "1px solid var(--border)", background: "var(--bg-card)", boxShadow: "var(--shadow)" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80')", backgroundSize: "cover", backgroundPosition: "center right", opacity: 0.18 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, var(--bg-card) 45%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 50%, rgba(31,107,235,0.08), transparent 50%)" }} />

          <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "24px 20px" : "36px 40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,rgba(31,107,235,0.9),rgba(8,145,178,0.7))", border: "1px solid rgba(88,166,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>Bibliothèques</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "6px 0 0" }}>
                  Ressources pédagogiques, techniques et professionnelles du{" "}
                  <span style={{ color: "#1f6feb", fontWeight: 700 }}>BTS CPI</span>
                </p>
              </div>
            </div>

            {/* Barre de recherche */}
            <div style={{ position: "relative", width: isMobile ? "100%" : 560, maxWidth: "100%", marginBottom: 24 }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}><IconSearch /></div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un livre, un composant, un site..."
                style={{ width: "100%", height: 46, paddingLeft: 42, paddingRight: search ? 36 : 16, borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border-hover)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#1f6feb"}
                onBlur={e => e.target.style.borderColor = "var(--border-hover)"} />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 16 }}>✕</button>}
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
              {quickCards.map(card => (
                <div key={card.title} style={{ borderRadius: 12, background: "var(--bg-primary)", border: `1px solid ${card.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, transition: "transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-hover)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: card.bg, color: card.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{card.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: isMobile ? 11 : 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.title}</div>
                    <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.count}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ SITES + LIVRES ══════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1.1fr", gap: 16, marginBottom: 16 }}>

          {/* Sites recommandés */}
          <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Sites recommandés</h2>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "3px 0 0" }}>Ordre alphabétique · {sites.length} site{sites.length > 1 ? "s" : ""}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <Link href="bibliotheque/sites"
                  style={{ padding: "6px 12px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  Voir tous →
                </Link>
                {isProf && (
                  <button onClick={() => setShowModalSite(true)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
                    <IconPlus /> Ajouter
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredSites.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-tertiary)", fontSize: 13 }}>
                  {search ? "Aucun site trouvé" : "Aucun site pour l'instant"}
                </div>
              )}
              {filteredSites.map(site => (
                <div key={site.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border)", transition: "border-color 0.15s, transform 0.15s", position: "relative", minWidth: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.transform = "translateX(3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateX(0)"; }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,rgba(31,107,235,0.2),rgba(8,145,178,0.1))", border: "1px solid rgba(88,166,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#58a6ff", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                    {site.logo || (site.nom || "").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, width: 0, minWidth: 0, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{highlight(site.nom, search)}</span>
                      {site.tag && <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: TAG_COLORS[site.tag]?.bg, color: TAG_COLORS[site.tag]?.text, fontWeight: 600, flexShrink: 0 }}>{site.tag}</span>}
                    </div>
                    {site.description && (
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {site.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <a href={site.url} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: "rgba(31,107,235,0.12)", border: "1px solid rgba(88,166,255,0.3)", color: "#58a6ff", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
                      Visiter <IconExternal />
                    </a>
                    {isProf && (
                      <>
                        <button onClick={() => setEditSite(site)}
                          style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(31,107,235,0.1)"; e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.color = "#58a6ff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
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
              ))}
            </div>
            {sites.length > 5 && (
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <Link href="/bibliotheque/sites"
                  style={{ fontSize: 12, color: "#58a6ff", textDecoration: "none", fontWeight: 500 }}>
                  Voir les {sites.length - 5} autres sites →
                </Link>
              </div>
            )}
          </section>

          {/* Livres PDF */}
          <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Livres et documents PDF</h2>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "3px 0 0" }}>Téléchargement direct · {livres.length} document{livres.length > 1 ? "s" : ""}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <Link href="/bibliotheque/livres"
                  style={{ padding: "6px 12px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  Voir tous →
                </Link>
                {isProf && (
                  <button onClick={() => setShowModalLivre(true)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
                    <IconPlus /> Ajouter
                  </button>
                )}
              </div>
            </div>

            {livres.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-tertiary)", fontSize: 13 }}>
                {isProf ? "Aucun document — cliquez sur Ajouter" : "Aucun document disponible"}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {livres.slice(0, 2).map(doc => (
                  <div key={doc.id} style={{ borderRadius: 14, background: "var(--bg-primary)", border: "1px solid var(--border)", display: "flex", alignItems: "stretch", overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: "var(--shadow)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.boxShadow = "var(--shadow-hover)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}>

                    {/* ── Couverture livre à gauche ── */}
                    <div style={{ width: 110, flexShrink: 0, background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 10px 14px 14px" }}>
                      <div style={{ position: "relative", display: "flex", filter: "drop-shadow(4px 6px 12px rgba(0,0,0,0.6))" }}>
                        {/* Spine (tranche) */}
                        <div style={{ width: 10, background: "rgba(0,0,0,0.7)", borderRadius: "3px 0 0 3px", flexShrink: 0 }} />
                        {/* Corps du livre */}
                        <div style={{ width: 68, height: 90, borderRadius: "0 4px 4px 0", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                          {doc.coverUrl ? (
                            <>
                              <img src={doc.coverUrl} alt={doc.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              {/* Reflet lumière */}
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg,rgba(255,255,255,0.10) 0%,transparent 55%)" }} />
                            </>
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: doc.coverBg || "linear-gradient(160deg,#1e3a5f,#2d6a9f)", display: "flex", flexDirection: "column", padding: "8px 7px" }}>
                              <div style={{ fontSize: 8, fontWeight: 900, color: "#fff", lineHeight: 1.3, flex: 1 }}>{doc.titre}</div>
                              <div style={{ background: "#da3633", color: "#fff", fontSize: 6, fontWeight: 900, padding: "2px 4px", borderRadius: 2, alignSelf: "flex-start" }}>PDF</div>
                            </div>
                          )}
                        </div>
                        {/* Badge PDF sur la couverture */}
                        <div style={{ position: "absolute", bottom: 5, left: 12, background: "#da3633", color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 5px", borderRadius: 3, letterSpacing: "0.05em" }}>PDF</div>
                      </div>
                    </div>

                    {/* ── Infos à droite ── */}
                    <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0, borderLeft: "1px solid var(--border)" }}>
                      {/* Haut : titre + badge + taille + description */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.titre}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(218,54,51,0.12)", color: "#f87171", fontWeight: 700, border: "1px solid rgba(218,54,51,0.2)" }}>PDF</span>
                          {doc.size && <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>{doc.size}</span>}
                          {doc.pages > 0 && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>· {doc.pages} p.</span>}
                        </div>
                        {doc.description && (
                          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {doc.description}
                          </p>
                        )}
                      </div>

                      {/* Bas : boutons + date + supprimer */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          {doc.previewUrl ? (
                            <>
                              <a href={doc.previewUrl} target="_blank" rel="noreferrer"
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#1f6feb", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                                👁 Ouvrir
                              </a>
                              <a href={doc.downloadUrl || doc.fileUrl} target="_blank" rel="noreferrer"
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
                                <IconDownload /> Télécharger
                              </a>
                            </>
                          ) : doc.fileUrl ? (
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#1f6feb", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                              👁 Ouvrir
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic" }}>Pas de lien disponible</span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          {doc.createdAt?.toDate && (
                            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                              Ajouté le {doc.createdAt.toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                          )}
                          {isProf && (
                            <button onClick={() => deleteLivre(doc.id)}
                              style={{ width: 26, height: 26, borderRadius: 6, background: "transparent", border: "1px solid var(--border)", color: "#f85149", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(248,81,73,0.1)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <IconTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {livres.length > 4 && (
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <Link href="/bibliotheque/livres"
                  style={{ fontSize: 12, color: "#58a6ff", textDecoration: "none", fontWeight: 500 }}>
                  Voir les {livres.length - 2} autres documents →
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* ══════════════ PIÈCES CAO ══════════════ */}
        <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Bibliothèques CAO — Pièces mécaniques</h2>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "3px 0 0" }}>Modèles 3D prêts à l'emploi — STEP, IGES, SolidWorks, CATIA · {pieces.length} pièce{pieces.length > 1 ? "s" : ""}</p>
            </div>
            {isProf && (
              <button onClick={() => setShowModalPiece(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
                onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
                <IconPlus /> Ajouter une pièce
              </button>
            )}
          </div>

          {/* Filtres */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
            {FILTERS_PIECES.map(filter => (
              <button key={filter} onClick={() => setActiveFilter(filter)}
                style={{ padding: "7px 16px", borderRadius: 99, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s",
                  background: activeFilter === filter ? "#1f6feb" : "transparent",
                  borderColor: activeFilter === filter ? "#1f6feb" : "var(--border)",
                  color: activeFilter === filter ? "#fff" : "var(--text-secondary)" }}>
                {filter}
              </button>
            ))}
          </div>

          {/* Grille */}
          {filteredPieces.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-tertiary)", fontSize: 13 }}>
              {isProf ? "Aucune pièce — cliquez sur Ajouter" : "Aucune pièce disponible"}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : isTablet ? "repeat(4,1fr)" : "repeat(8,1fr)", gap: 10 }}>
              {filteredPieces.map(part => (
                <div key={part.id} style={{ position: "relative", borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border)", padding: 12, cursor: "pointer", transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(31,107,235,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  {isProf && (
                    <button onClick={e => { e.stopPropagation(); deletePiece(part.id); }}
                      style={{ position: "absolute", top: 6, right: 6, zIndex: 2, width: 22, height: 22, borderRadius: 5, background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", color: "#f85149", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconTrash />
                    </button>
                  )}
                  <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, opacity: 0.75 }}>
                    <div style={{ width: 60, height: 60 }}>
                      {PIECES_SVG[part.titre] || DEFAULT_SVG}
                    </div>
                  </div>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.25, minHeight: 28 }}>{highlight(part.titre, search)}</h3>
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: part.fileUrl ? 28 : 6 }}>
                    {(part.formats || []).map(f => (
                      <span key={f} style={{ fontSize: 8, color: "var(--text-tertiary)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 4px", background: "var(--bg-hover)" }}>{f}</span>
                    ))}
                  </div>
                  {part.fileUrl && (
                    <a href={part.fileUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      style={{ position: "absolute", right: 8, bottom: 8, width: 28, height: 28, borderRadius: 7, background: "rgba(31,107,235,0.12)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                      <IconDownload />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ══════════════ STATS DU BAS ══════════════ */}
        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
          {[
            { icon: <IconBook />,    value: livres.length,  label: "Documents PDF",                color: "#1f6feb", bg: "rgba(31,107,235,0.1)" },
            { icon: <IconCube />,    value: pieces.length,  label: "Modèles CAO",                  color: "#3fb950", bg: "rgba(63,185,80,0.1)" },
            { icon: <IconGlobe />,   value: sites.length,   label: "Sites recommandés",             color: "#9d95e8", bg: "rgba(157,149,232,0.1)" },
            { icon: <IconRefresh />, value: null,           label: "Mises à jour régulières",       color: "#e07b39", bg: "rgba(224,123,57,0.1)" },
          ].map((stat, i) => (
            <div key={i} style={{ borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border)", padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: "var(--shadow)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{stat.icon}</div>
              <div>
                {stat.value !== null && <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{stat.value}</div>}
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: stat.value !== null ? 2 : 0, lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}