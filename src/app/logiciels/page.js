// /logiciels/page.js - VERSION CORRIGÉE
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getDocs, collection, orderBy, query, addDoc, deleteDoc,
  doc, serverTimestamp, onSnapshot, updateDoc
} from "firebase/firestore";
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

const LOGICIELS_FIXES = [
  { id: "solidworks", label: "SolidWorks", sub: "Conception 3D",  logo: "https://cdn.worldvectorlogo.com/logos/solidworks.svg", logoBg: "#c00d0d", fixe: true },
  { id: "catia",      label: "CATIA V5",   sub: "CAO avancée",    logo: "https://logodix.com/logo/1810230.jpg",                 logoBg: "#003087", fixe: true },
  { id: "rdm6",       label: "RDM6",       sub: "Simulation",     logo: null,                                                   logoBg: "#1a6b3c", fixe: true },
];
const FIXES_IDS = LOGICIELS_FIXES.map(l => l.id);

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];
const LIVRABLES_DEFAUT = ["Fichiers CAO", "Mise en plan", "Calculs RDM", "Nomenclature", "Simulation", "Guide fabrication"];

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function badgeStyle(niveau) {
  if (niveau === "Débutant")      return { background: "#1a3a2a", color: "#3fb950" };
  if (niveau === "Intermédiaire") return { background: "#3a2e1a", color: "#d29922" };
  return                                 { background: "#3a1a1a", color: "#f85149" };
}

function niveauColor(niveau) {
  if (niveau === "Débutant")      return "#3fb950";
  if (niveau === "Intermédiaire") return "#d29922";
  return "#f85149";
}

// ── Modal Ajout Projet (4 étapes) ─────────────────────────────────────────────
function ModalAjoutProjet({ projet, onClose, user, userData }) {
  const isEdit = !!projet;
  const [etape, setEtape] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [form, setForm] = useState({
    titre: projet?.titre || "",
    description: projet?.description || "",
    niveau: projet?.niveau || "Intermédiaire",
    duree: projet?.duree || "8h",
    image: projet?.image || "",
    livrables: projet?.livrables || [...LIVRABLES_DEFAUT],
    travaux: projet?.travaux || [{ titre: "", description: "" }],
    statut: projet?.statut || "publié",
  });

  const [newRessource, setNewRessource] = useState({ titre: "", type: "youtube", url: "", nom: "" });

  const inp = {
    width: "100%", padding: "8px 12px", background: "#0d1117",
    border: "1px solid #30363d", borderRadius: 8, color: "#e6edf3",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  const handleUploadImage = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ressource/upload", { method: "POST", body: formData });
      const data = await res.json();
      setForm(f => ({ ...f, image: data.url }));
    } catch { alert("Erreur upload image"); }
    finally { setUploadingImage(false); }
  };

  const handleUploadPdf = async (file) => {
    if (!file) return;
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ressource/upload", { method: "POST", body: formData });
      const data = await res.json();
      setNewRessource(r => ({ ...r, url: data.url, nom: file.name }));
    } catch { alert("Erreur upload PDF"); }
    finally { setUploadingPdf(false); }
  };

  const toggleLivrable = (l) => {
    setForm(f => ({
      ...f,
      livrables: f.livrables.includes(l)
        ? f.livrables.filter(x => x !== l)
        : [...f.livrables, l],
    }));
  };

  const addTravail = () => setForm(f => ({ ...f, travaux: [...f.travaux, { titre: "", description: "" }] }));
  const removeTravail = (i) => setForm(f => ({ ...f, travaux: f.travaux.filter((_, idx) => idx !== i) }));
  const updateTravail = (i, field, val) => setForm(f => {
    const t = [...f.travaux];
    t[i] = { ...t[i], [field]: val };
    return { ...f, travaux: t };
  });

  // ✅ Ressources temporaires pour l'étape 4 (affichage seul — sauvegarde via sous-collection)
  const [tempRessources, setTempRessources] = useState([]);

  const addRessource = () => {
    if (!newRessource.titre.trim()) { alert("Titre requis"); return; }
    if (!newRessource.url.trim()) {
      alert(newRessource.type === "pdf" ? "Veuillez uploader un fichier PDF" : "Veuillez saisir un lien YouTube");
      return;
    }
    setTempRessources(r => [...r, { ...newRessource }]);
    setNewRessource({ titre: "", type: newRessource.type, url: "", nom: "" });
  };

  const removeRessource = (i) => setTempRessources(r => r.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.titre.trim()) { alert("Titre requis"); return; }
    setSaving(true);
    try {
      const data = {
        titre: form.titre.trim(),
        description: form.description.trim(),
        niveau: form.niveau,
        duree: form.duree,
        image: form.image,
        livrables: form.livrables,
        travaux: form.travaux.filter(t => t.titre.trim()),
        statut: form.statut,
        profId: user.uid,
        profNom: `${userData?.prenom} ${userData?.nom}`,
        updatedAt: serverTimestamp(),
      };

      let projetId;
      if (isEdit) {
        await updateDoc(doc(db, "projets", projet.id), data);
        projetId = projet.id;
      } else {
        const ref = await addDoc(collection(db, "projets"), { ...data, createdAt: serverTimestamp() });
        projetId = ref.id;
      }

      // ✅ Sauvegarder les ressources dans la sous-collection
      if (tempRessources.length > 0) {
        await Promise.all(
          tempRessources.map(r =>
            addDoc(collection(db, "projets", projetId, "ressources"), {
              titre: r.titre,
              type: r.type,
              url: r.url,
              niveau: "Débutant",
              duree: r.type === "youtube" ? "" : "",
              pages: "",
              profId: user.uid,
              profNom: `${userData?.prenom} ${userData?.nom}`,
              createdAt: serverTimestamp(),
            })
          )
        );
      }

      onClose(true);
    } catch (e) { console.error(e); alert("Erreur sauvegarde"); }
    finally { setSaving(false); }
  };

  const etapes = ["Infos", "Livrables", "Travaux", "Ressources"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16, overflowY: "auto" }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ borderBottom: "1px solid #21262d", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h3 style={{ color: "#e6edf3", fontSize: 15, fontWeight: 600 }}>
            {isEdit ? "Modifier le projet" : "Nouveau projet"}
          </h3>
          <button onClick={() => onClose(false)} style={{ background: "none", border: "none", color: "#8b949e", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", borderBottom: "1px solid #21262d", flexShrink: 0 }}>
          {etapes.map((e, i) => (
            <button key={e} onClick={() => setEtape(i + 1)}
              style={{
                flex: 1, padding: "10px 4px", fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer",
                background: etape === i + 1 ? "#1f6feb" : "transparent",
                color: etape === i + 1 ? "#fff" : "#8b949e",
                borderBottom: etape === i + 1 ? "2px solid #1f6feb" : "2px solid transparent",
                transition: "all 0.15s",
              }}>
              {i + 1}. {e}
            </button>
          ))}
        </div>

        {/* Contenu scrollable */}
        <div style={{ padding: 20, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Étape 1 : Infos */}
          {etape === 1 && (
            <>
              <div>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Titre du projet *</label>
                <input style={inp} value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} placeholder="Ex: Réducteur mécanique" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Description</label>
                <textarea style={{ ...inp, resize: "vertical", minHeight: 80 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Concevez et analysez un réducteur complet de A à Z" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Niveau</label>
                  <select style={inp} value={form.niveau} onChange={e => setForm(f => ({ ...f, niveau: e.target.value }))}>
                    {NIVEAUX.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Durée estimée</label>
                  <select style={inp} value={form.duree} onChange={e => setForm(f => ({ ...f, duree: e.target.value }))}>
                    {["2h", "4h", "6h", "8h", "12h", "16h", "20h", "24h", "+24h"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Image du projet</label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#0d1117", border: "1px dashed #30363d", borderRadius: 8, cursor: "pointer" }}>
                  <span style={{ fontSize: 18 }}>🖼</span>
                  <span style={{ fontSize: 13, color: form.image ? "#3fb950" : "#8b949e" }}>
                    {uploadingImage ? "Upload..." : form.image ? "✓ Image chargée" : "Choisir une image"}
                  </span>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUploadImage(e.target.files?.[0])} disabled={uploadingImage} />
                </label>
                {form.image && <img src={form.image} alt="aperçu" style={{ marginTop: 8, width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #30363d" }} />}
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Statut</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["publié", "brouillon"].map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, statut: s }))}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${form.statut === s ? "#1f6feb" : "#30363d"}`, background: form.statut === s ? "#1f3a5f" : "transparent", color: form.statut === s ? "#58a6ff" : "#8b949e", fontSize: 12, cursor: "pointer" }}>
                      {s === "publié" ? "✅ Publié" : "📝 Brouillon"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Étape 2 : Livrables */}
          {etape === 2 && (
            <>
              <p style={{ fontSize: 12, color: "#8b949e" }}>Sélectionnez les livrables attendus :</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {LIVRABLES_DEFAUT.map(l => (
                  <div key={l} onClick={() => toggleLivrable(l)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: form.livrables.includes(l) ? "#1f3a5f" : "#0d1117", border: `1px solid ${form.livrables.includes(l) ? "#1f6feb" : "#30363d"}`, borderRadius: 8, cursor: "pointer" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: form.livrables.includes(l) ? "#1f6feb" : "transparent", border: `1px solid ${form.livrables.includes(l) ? "#1f6feb" : "#30363d"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {form.livrables.includes(l) && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: form.livrables.includes(l) ? "#e6edf3" : "#8b949e" }}>{l}</span>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Livrable personnalisé (optionnel)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input id="custom-livrable" style={{ ...inp, flex: 1 }} placeholder="Ex: Rapport de projet" />
                  <button onClick={() => {
                    const val = document.getElementById("custom-livrable").value.trim();
                    if (val && !form.livrables.includes(val)) {
                      setForm(f => ({ ...f, livrables: [...f.livrables, val] }));
                      document.getElementById("custom-livrable").value = "";
                    }
                  }} style={{ padding: "8px 14px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#e6edf3", fontSize: 12, cursor: "pointer" }}>
                    Ajouter
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Étape 3 : Travaux */}
          {etape === 3 && (
            <>
              <p style={{ fontSize: 12, color: "#8b949e" }}>Listez les tâches que l'étudiant doit réaliser :</p>
              {form.travaux.map((t, i) => (
                <div key={i} style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#7d8590", fontWeight: 600 }}>Tâche {i + 1}</span>
                    {form.travaux.length > 1 && (
                      <button onClick={() => removeTravail(i)} style={{ background: "none", border: "none", color: "#f85149", cursor: "pointer", fontSize: 12 }}>✕ Supprimer</button>
                    )}
                  </div>
                  <input style={{ ...inp, marginBottom: 8 }} value={t.titre} onChange={e => updateTravail(i, "titre", e.target.value)} placeholder="Ex: Modélisation 3D SolidWorks" />
                  <textarea style={{ ...inp, resize: "vertical", minHeight: 60 }} value={t.description} onChange={e => updateTravail(i, "description", e.target.value)} placeholder="Description détaillée (optionnel)" />
                </div>
              ))}
              <button onClick={addTravail} style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px dashed #30363d", color: "#8b949e", fontSize: 12, cursor: "pointer" }}>
                + Ajouter une tâche
              </button>
            </>
          )}

          {/* ✅ Étape 4 : Ressources — sauvegardées dans sous-collection */}
          {etape === 4 && (
            <>
              <p style={{ fontSize: 12, color: "#8b949e" }}>Ajoutez les ressources fournies aux étudiants :</p>

              {tempRessources.length === 0 && (
                <div style={{ padding: "12px", background: "#0d1117", border: "1px dashed #30363d", borderRadius: 8, textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "#7d8590" }}>Aucune ressource ajoutée — vous pourrez en ajouter après la création du projet.</p>
                </div>
              )}

              {tempRessources.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#0d1117", border: "1px solid #21262d", borderRadius: 8 }}>
                  <span style={{ fontSize: 14 }}>{r.type === "youtube" ? "▶" : "📄"}</span>
                  <span style={{ flex: 1, fontSize: 12, color: "#e6edf3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.titre}</span>
                  <span style={{ fontSize: 10, color: "#7d8590", flexShrink: 0 }}>{r.type === "youtube" ? "YouTube" : r.nom || "PDF"}</span>
                  <button onClick={() => removeRessource(i)} style={{ background: "none", border: "none", color: "#f85149", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
                </div>
              ))}

              <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {["youtube", "pdf"].map(t => (
                    <button key={t}
                      onClick={() => setNewRessource(r => ({ titre: r.titre, type: t, url: "", nom: "" }))}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${newRessource.type === t ? "#1f6feb" : "#30363d"}`, background: newRessource.type === t ? "#1f3a5f" : "transparent", color: newRessource.type === t ? "#58a6ff" : "#8b949e", fontSize: 12, cursor: "pointer", fontWeight: newRessource.type === t ? 600 : 400 }}>
                      {t === "youtube" ? "▶ YouTube" : "📄 PDF"}
                    </button>
                  ))}
                </div>
                <input style={inp} value={newRessource.titre} onChange={e => setNewRessource(r => ({ ...r, titre: e.target.value }))} placeholder="Titre de la ressource *" />
                {newRessource.type === "youtube" ? (
                  <input style={inp} value={newRessource.url} onChange={e => setNewRessource(r => ({ ...r, url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
                ) : (
                  <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#161b22", border: `1px dashed ${newRessource.url ? "#3fb950" : "#30363d"}`, borderRadius: 8, cursor: uploadingPdf ? "wait" : "pointer" }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <span style={{ fontSize: 13, color: newRessource.url ? "#3fb950" : "#8b949e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {uploadingPdf ? "Upload en cours..." : newRessource.url ? `✓ ${newRessource.nom || "Fichier chargé"}` : "Cliquer pour uploader un PDF"}
                    </span>
                    <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.sldprt,.sldasm,.CATPart,.CATProduct" style={{ display: "none" }} onChange={e => handleUploadPdf(e.target.files?.[0])} disabled={uploadingPdf} />
                  </label>
                )}
                <button onClick={addRessource} disabled={uploadingPdf || !newRessource.titre.trim() || !newRessource.url}
                  style={{ padding: "9px", borderRadius: 8, background: (!newRessource.titre.trim() || !newRessource.url || uploadingPdf) ? "#21262d" : "#1f6feb", border: "none", color: (!newRessource.titre.trim() || !newRessource.url || uploadingPdf) ? "#8b949e" : "#fff", fontSize: 13, fontWeight: 600, cursor: (!newRessource.titre.trim() || !newRessource.url || uploadingPdf) ? "not-allowed" : "pointer" }}>
                  + Ajouter cette ressource
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #21262d", padding: "14px 20px", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            {etape > 1 && (
              <button onClick={() => setEtape(e => e - 1)} style={{ padding: "8px 16px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 13, cursor: "pointer" }}>← Précédent</button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onClose(false)} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 13, cursor: "pointer" }}>Annuler</button>
            {etape < 4 ? (
              <button onClick={() => setEtape(e => e + 1)} style={{ padding: "8px 16px", borderRadius: 8, background: "#1f6feb", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Suivant →</button>
            ) : (
              <button onClick={handleSave} disabled={saving} style={{ padding: "8px 16px", borderRadius: 8, background: saving ? "#1a3a5f" : "#1f6feb", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer" }}>
                {saving ? "Enregistrement..." : isEdit ? "Modifier" : "Publier le projet"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card Projet ────────────────────────────────────────────────────────────────
// ✅ Ajout de la prop ressourcesCount
function ProjetCard({ projet, isProf, onEdit, onDelete, onStart, isMobile, ressourcesCount }) {
  return (
    <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 16 : 20, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 24, alignItems: "flex-start" }}>
      {/* ✅ Image contrainte : largeur fixe, hauteur auto-limitée par alignSelf */}
      <div style={{ width: isMobile ? "100%" : 140, height: isMobile ? 200 : 150, borderRadius: 10, background: "#0d1117", border: "1px solid #30363d", overflow: "hidden", flexShrink: 0, alignSelf: isMobile ? "auto" : "flex-start" }}>
        {projet.image ? <img src={projet.image} alt={projet.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🔧</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: "#7d8590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>PROJET COMPLET</div>
          {isProf && (
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button onClick={() => onEdit(projet)} style={{ padding: "3px 10px", borderRadius: 6, background: "#21262d", border: "1px solid #30363d", color: "#8b949e", fontSize: 11, cursor: "pointer" }}>✏ Modifier</button>
              <button onClick={() => onDelete(projet)} style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(218,54,51,0.1)", border: "1px solid rgba(218,54,51,0.3)", color: "#f85149", fontSize: 11, cursor: "pointer" }}>✕</button>
            </div>
          )}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3", marginBottom: 6 }}>{projet.titre}</h3>
        <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 12, lineHeight: 1.5 }}>{projet.description}</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { icon: "⏱", label: "Durée", val: projet.duree, color: "#e6edf3" },
            // ✅ ressourcesCount depuis la sous-collection Firestore
            { icon: "📁", label: "Ressources", val: ressourcesCount, color: "#e6edf3" },
            { icon: "📊", label: "Niveau", val: projet.niveau, color: niveauColor(projet.niveau) }
          ].map(({ icon, label, val, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 9, color: "#7d8590", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 14, alignItems: isMobile ? "stretch" : "flex-end" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", flex: 1 }}>
            {projet.livrables?.map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#c9d1d9" }}>
                <span style={{ fontSize: 12, color: "#3fb950" }}>✓</span><span>{item}</span>
              </div>
            ))}
          </div>
          <button onClick={() => onStart(projet.id)}
            style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: "#1f6feb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
            onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
            Commencer le projet
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ current }) {
  const percent = Math.min(100, current || 0);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#7d8590" }}>Progression</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#e6edf3" }}>{percent}%</span>
      </div>
      <div style={{ width: "100%", height: 6, background: "#21262d", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, height: "100%", background: "#3b8ef3", transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function LogicielCard({ logiciel, stats = {}, onNavigate, isProf, onDelete }) {
  const { modules = 0, videos = 0, exercices = 0, projects = 0 } = stats;
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onNavigate} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#161b22", border: `1px solid ${hovered ? "#30363d" : "#21262d"}`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s", position: "relative", transform: hovered ? "translateY(-2px)" : "translateY(0)", boxSizing: "border-box", width: "100%" }}>
      {isProf && !logiciel.fixe && (
        <button onClick={e => { e.stopPropagation(); onDelete(logiciel); }}
          style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: 6, background: "rgba(218,54,51,0.85)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>✕</button>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, background: logiciel.logoBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          {logiciel.logo ? <img src={logiciel.logo} alt={logiciel.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{logiciel.label.slice(0, 3).toUpperCase()}</span>}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#e6edf3" }}>{logiciel.label}</div>
          <div style={{ fontSize: 12, color: "#7d8590", marginTop: 2 }}>{logiciel.sub}</div>
        </div>
      </div>
      <ProgressBar current={stats.progress || 0} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #21262d" }}>
        {[{ val: modules, label: "Modules" }, { val: videos, label: "Vidéos" }, { val: exercices, label: "Exercices" }, { val: projects, label: "Projets" }].map(({ val, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>{val}</div>
            <div style={{ fontSize: 10, color: "#7d8590", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      <button onClick={e => { e.stopPropagation(); onNavigate(); }}
        style={{ width: "100%", marginTop: 14, padding: "8px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#1f6feb"; e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#21262d"; e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#c9d1d9"; }}>
        Entrer dans l'espace →
      </button>
    </div>
  );
}

function ModalConfirmSuppr({ logiciel, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: 16 }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 24, maxWidth: 360, width: "100%" }}>
        <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>🗑️</div>
        <p style={{ color: "#e6edf3", fontSize: 14, marginBottom: 8, fontWeight: 600, textAlign: "center" }}>Supprimer "{logiciel.label}" ?</p>
        <p style={{ color: "#8b949e", fontSize: 12, marginBottom: 20, textAlign: "center", lineHeight: 1.5 }}>Cette action supprimera le logiciel et toutes ses ressources. Elle est irréversible.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#da3633", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

function ModalConfirmSupprProjet({ projet, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 210, padding: 16 }}>
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 24, maxWidth: 360, width: "100%" }}>
        <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>🗑️</div>
        <p style={{ color: "#e6edf3", fontSize: 14, marginBottom: 8, fontWeight: 600, textAlign: "center" }}>Supprimer "{projet.titre}" ?</p>
        <p style={{ color: "#8b949e", fontSize: 12, marginBottom: 20, textAlign: "center", lineHeight: 1.5 }}>Cette action est irréversible.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#da3633", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

function LogicielsCarousel({ logiciels, logicielStats, onNavigate, isProf, onAdd, onDelete }) {
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const VISIBLE = 3;
  const CARD_GAP = 16;
  const total = logiciels.length;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < total - VISIBLE;

  const scrollTo = (index) => {
    const clamped = Math.max(0, Math.min(index, Math.max(0, total - VISIBLE)));
    setCurrentIndex(clamped);
    if (trackRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = (containerWidth - CARD_GAP * (VISIBLE - 1)) / VISIBLE;
      trackRef.current.style.transform = `translateX(-${clamped * (cardWidth + CARD_GAP)}px)`;
    }
  };

  useEffect(() => { scrollTo(0); }, [total]);
  useEffect(() => {
    const handleResize = () => scrollTo(currentIndex);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: "#e6edf3" }}>
          Explorez nos formations
          <span style={{ fontSize: 12, color: "#7d8590", fontWeight: 400, marginLeft: 10 }}>{total} logiciel{total > 1 ? "s" : ""}</span>
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {total > VISIBLE && (
            <>
              <button onClick={() => scrollTo(currentIndex - 1)} disabled={!canPrev} style={{ width: 32, height: 32, borderRadius: 8, background: canPrev ? "#21262d" : "#161b22", border: `1px solid ${canPrev ? "#30363d" : "#21262d"}`, color: canPrev ? "#e6edf3" : "#3d444d", fontSize: 16, cursor: canPrev ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <button onClick={() => scrollTo(currentIndex + 1)} disabled={!canNext} style={{ width: 32, height: 32, borderRadius: 8, background: canNext ? "#21262d" : "#161b22", border: `1px solid ${canNext ? "#30363d" : "#21262d"}`, color: canNext ? "#e6edf3" : "#3d444d", fontSize: 16, cursor: canNext ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            </>
          )}
          {isProf && (
            <button onClick={onAdd}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1f6feb"; e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#21262d"; e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#c9d1d9"; }}>
              + Ajouter
            </button>
          )}
        </div>
      </div>
      <div ref={containerRef} style={{ overflow: "hidden", position: "relative" }}>
        <div ref={trackRef} style={{ display: "flex", gap: CARD_GAP, transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
          {logiciels.map(log => (
            <div key={log.id} style={{ flex: `0 0 calc((100% - ${CARD_GAP * (VISIBLE - 1)}px) / ${VISIBLE})`, minWidth: 0 }}>
              <LogicielCard logiciel={log} stats={logicielStats[log.id] || {}} onNavigate={() => onNavigate(log.id)} isProf={isProf} onDelete={onDelete} />
            </div>
          ))}
        </div>
      </div>
      {total > VISIBLE && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
          {Array.from({ length: total - VISIBLE + 1 }).map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)} style={{ width: currentIndex === i ? 20 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", background: currentIndex === i ? "#1f6feb" : "#30363d", transition: "all 0.2s", padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileLogicielCard({ logiciel, onNavigate, isProf, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onNavigate} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#161b22", border: "1px solid " + (hovered ? "#30363d" : "#21262d"), borderRadius: 12, padding: "16px 14px", cursor: "pointer", transition: "all 0.2s", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
      {isProf && !logiciel.fixe && (
        <button onClick={e => { e.stopPropagation(); onDelete(logiciel); }}
          style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 4, background: "rgba(218,54,51,0.85)", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>x</button>
      )}
      <div style={{ width: 52, height: 52, borderRadius: 12, background: logiciel.logoBg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
        {logiciel.logo ? <img src={logiciel.logo} alt={logiciel.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{logiciel.label.slice(0, 3).toUpperCase()}</span>}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", lineHeight: 1.3 }}>{logiciel.label}</div>
        <div style={{ fontSize: 11, color: "#7d8590", marginTop: 2 }}>{logiciel.sub}</div>
      </div>
      <div style={{ width: "100%", padding: "6px 0", background: "#21262d", borderRadius: 8, fontSize: 11, color: "#8b949e", textAlign: "center" }}>Ouvrir →</div>
    </div>
  );
}

function LogicielsMobile({ logiciels, logicielStats, onNavigate, isProf, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#e6edf3" }}>Nos formations <span style={{ fontSize: 11, color: "#7d8590", fontWeight: 400, marginLeft: 8 }}>{logiciels.length}</span></h2>
        {isProf && <button onClick={onAdd} style={{ padding: "6px 12px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 12, cursor: "pointer" }}>+ Ajouter</button>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {logiciels.map(log => <MobileLogicielCard key={log.id} logiciel={log} onNavigate={() => onNavigate(log.id)} isProf={isProf} onDelete={onDelete} />)}
      </div>
    </div>
  );
}

function ModalAjoutLogiciel({ onClose }) {
  const [form, setForm] = useState({ label: "", sub: "", logoBg: "#1f6feb", logo: null });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const handleUploadLogo = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ressource/upload", { method: "POST", body: formData });
      const data = await res.json();
      setForm(p => ({ ...p, logo: data.url }));
    } catch { alert("Erreur upload logo"); }
    finally { setUploading(false); }
  };
  const handleSubmit = async () => {
    if (!form.label.trim()) { alert("Nom requis"); return; }
    setSaving(true);
    try {
      const slug = form.label.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await addDoc(collection(db, "logiciels"), { id: slug, nom: form.label.trim(), sub: form.sub.trim() || "Logiciel", logo: form.logo || null, logoBg: form.logoBg, createdAt: serverTimestamp() });
      onClose();
    } catch (e) { console.error(e); alert("Erreur création logiciel"); }
    finally { setSaving(false); }
  };
  const inp = { width: "100%", padding: "8px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, color: "#e6edf3", fontSize: 13, outline: "none", boxSizing: "border-box" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 14, width: "100%", maxWidth: 420 }}>
        <div style={{ borderBottom: "1px solid #21262d", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "#e6edf3", fontSize: 15, fontWeight: 600 }}>Ajouter un logiciel</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8b949e", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Nom *</label><input style={inp} value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Ex: Inventor, FreeCAD..." /></div>
          <div><label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Description courte</label><input style={inp} value={form.sub} onChange={e => setForm(p => ({ ...p, sub: e.target.value }))} placeholder="Ex: Modélisation paramétrique" /></div>
          <div>
            <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Couleur + aperçu</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="color" value={form.logoBg} onChange={e => setForm(p => ({ ...p, logoBg: e.target.value }))} style={{ width: 44, height: 44, borderRadius: 8, border: "1px solid #30363d", cursor: "pointer" }} />
              <div style={{ width: 48, height: 48, borderRadius: 8, background: form.logoBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", overflow: "hidden" }}>
                {form.logo ? <img src={form.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (form.label.slice(0, 3).toUpperCase() || "LOG")}
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 6 }}>Logo (optionnel)</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: form.logo ? "#3fb950" : "#8b949e" }}>{uploading ? "Upload..." : form.logo ? "✓ Logo chargé" : "Choisir une image"}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUploadLogo(e.target.files?.[0])} disabled={uploading} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 13, cursor: "pointer" }}>Annuler</button>
            <button onClick={handleSubmit} disabled={saving || !form.label.trim()} style={{ flex: 1, padding: "9px", borderRadius: 8, background: saving ? "#1a3a5f" : "#1f6feb", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer" }}>{saving ? "Création..." : "Créer"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorielCard({ tuto, onClick }) {
  const ytId = getYouTubeId(tuto.url);
  const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
  const badge = badgeStyle(tuto.niveau || "Débutant");
  return (
    <div onClick={onClick} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#30363d"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}>
      <div style={{ width: "100%", aspectRatio: "16/9", background: "#0d1117", position: "relative", overflow: "hidden" }}>
        {thumbnail ? <img src={thumbnail} alt={tuto.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: "#1c2128", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>▶</div>}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ff0000cc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▶</div>
        </div>
        {tuto.duree && <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{tuto.duree}</div>}
        <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.65)", color: "#fff", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 500 }}>{tuto.logicielLabel}</div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#e6edf3", marginBottom: 4, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tuto.titre}</div>
        <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 8 }}>{tuto.profNom || "—"}</div>
        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 500, ...badge }}>{tuto.niveau || "Débutant"}</span>
      </div>
    </div>
  );
}

function YouTubeViewer({ tuto, onClose }) {
  const ytId = getYouTubeId(tuto.url);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 900, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <p style={{ color: "#e6edf3", fontSize: 15, fontWeight: 600 }}>{tuto.titre}</p>
          <p style={{ color: "#7d8590", fontSize: 12, marginTop: 2 }}>{tuto.logicielLabel}</p>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#e6edf3", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ width: "100%", maxWidth: 900, background: "#000", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
        </div>
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ────────────────────────────────────────────────────────────
export default function LogicielsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [logiciels, setLogiciels] = useState(LOGICIELS_FIXES);
  const [logicielStats, setLogicielStats] = useState({});
  const [derniersTutos, setDerniersTutos] = useState([]);
  const [loadingTutos, setLoadingTutos] = useState(true);
  const [viewerTuto, setViewerTuto] = useState(null);
  const [showModalAjout, setShowModalAjout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [projets, setProjets] = useState([]);
  const [loadingProjets, setLoadingProjets] = useState(true);
  // ✅ NOUVEAU : compteurs de ressources depuis les sous-collections
  const [ressourcesCounts, setRessourcesCounts] = useState({});
  const [showModalProjet, setShowModalProjet] = useState(false);
  const [editingProjet, setEditingProjet] = useState(null);
  const [confirmDeleteProjet, setConfirmDeleteProjet] = useState(null);

  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (user === null) router.push("/login"); }, [user]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "logiciels"), (snap) => {
      const extras = [];
      snap.docs.forEach(d => {
        const data = d.data();
        const logId = data.id || d.id;
        if (!FIXES_IDS.includes(logId)) {
          extras.push({ id: logId, firestoreId: d.id, label: data.nom || logId, sub: data.sub || "Logiciel", logo: data.logo || null, logoBg: data.logoBg || "#333", fixe: false });
        }
      });
      setLogiciels([...LOGICIELS_FIXES, ...extras]);
    });
    return () => unsub();
  }, []);

  // ✅ MODIFIÉ : charge les projets ET les compteurs de ressources depuis les sous-collections
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "projets"), orderBy("createdAt", "desc")),
      async (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProjets(isProf ? data : data.filter(p => p.statut === "publié"));
        setLoadingProjets(false);

        // Charger les compteurs de ressources depuis les sous-collections en parallèle
        const counts = {};
        await Promise.all(
          data.map(async (projet) => {
            try {
              const rSnap = await getDocs(collection(db, "projets", projet.id, "ressources"));
              counts[projet.id] = rSnap.size;
            } catch {
              counts[projet.id] = 0;
            }
          })
        );
        setRessourcesCounts(counts);
      }
    );
    return () => unsub();
  }, [isProf]);

  const handleDeleteLogiciel = async (logiciel) => {
    try { await deleteDoc(doc(db, "logiciels", logiciel.firestoreId)); }
    catch (e) { console.error(e); alert("Erreur suppression logiciel"); }
    setConfirmDelete(null);
  };

  const handleDeleteProjet = async (projet) => {
    try { await deleteDoc(doc(db, "projets", projet.id)); }
    catch (e) { console.error(e); alert("Erreur suppression projet"); }
    setConfirmDeleteProjet(null);
  };

  useEffect(() => {
    if (logiciels.length === 0) return;
    const computeStats = async () => {
      const stats = {};
      for (const log of logiciels) {
        const fid = log.firestoreId || log.id;
        try {
          const ateliersSnap = await getDocs(collection(db, "logiciels", fid, "ateliers"));
          let modules = 0, videos = 0, exercices = 0, projects = 0;
          for (const a of ateliersSnap.docs) {
            const rSnap = await getDocs(collection(db, "logiciels", fid, "ateliers", a.id, "ressources"));
            rSnap.forEach(r => {
              const d = r.data();
              if (d.type === "youtube") videos++;
              else if (d.type === "pdf") {
                if (d.titre?.toLowerCase().includes("exercice")) exercices++;
                else if (d.titre?.toLowerCase().includes("projet")) projects++;
                else modules++;
              }
            });
          }
          stats[log.id] = { modules, videos, exercices, projects, progress: Math.min(100, Math.round((videos + exercices + projects) * 5)) };
        } catch {
          stats[log.id] = { modules: 0, videos: 0, exercices: 0, projects: 0, progress: 0 };
        }
      }
      setLogicielStats(stats);
    };
    computeStats();
  }, [logiciels]);

  useEffect(() => {
    if (logiciels.length === 0) return;
    const fetchTutos = async () => {
      setLoadingTutos(true);
      try {
        const allTutos = [];
        for (const log of logiciels) {
          const fid = log.firestoreId || log.id;
          const ateliersSnap = await getDocs(collection(db, "logiciels", fid, "ateliers"));
          for (const a of ateliersSnap.docs) {
            const q = query(collection(db, "logiciels", fid, "ateliers", a.id, "ressources"), orderBy("createdAt", "desc"));
            const rSnap = await getDocs(q);
            rSnap.forEach(r => {
              const d = r.data();
              if (d.type === "youtube") allTutos.push({ id: r.id, ...d, logicielId: fid, logicielLabel: log.label, atelierId: a.id, _ts: d.createdAt?.seconds || 0 });
            });
          }
        }
        allTutos.sort((a, b) => b._ts - a._ts);
        setDerniersTutos(allTutos.slice(0, 4));
      } catch (e) { console.error(e); }
      finally { setLoadingTutos(false); }
    };
    fetchTutos();
  }, [logiciels]);

  if (!user || !userData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "sans-serif", overflowX: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "20px 12px" : "32px 24px", boxSizing: "border-box", width: "100%" }}>

        {/* HERO */}
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: isMobile ? "20px 16px" : "40px 32px", marginBottom: 32, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 20 : 32, alignItems: isMobile ? "flex-start" : "center", overflow: "hidden" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#7d8590", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontWeight: 600 }}>Centre de formation CPI</div>
            <h1 style={{ fontSize: isMobile ? 20 : 32, fontWeight: 600, color: "#e6edf3", marginBottom: 16, lineHeight: 1.3, wordBreak: "break-word" }}>
              Maîtrisez les logiciels industriels avec des contenus de qualité
            </h1>
            <p style={{ fontSize: isMobile ? 12 : 14, color: "#8b949e", marginBottom: 20, lineHeight: 1.6 }}>
              Tutoriaux vidéo, exercices pratiques, projets industriels et ressources téléchargeables pour réussir en BTS CPI.
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {[{ label: "✓ Formations complètes", color: "#3fb950", bg: "#1a3a2a" }, { label: "📊 Projets concrets", color: "#d29922", bg: "#3a2e1a" }, { label: "✅ Suivi progression", color: "#58a6ff", bg: "#1f3a5f" }].map(({ label, color, bg }) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", fontSize: 11, color, background: bg, borderRadius: 99, whiteSpace: "nowrap" }}>{label}</span>
              ))}
            </div>
            <button onClick={() => router.push("/logiciels/solidworks")}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, background: "#1f6feb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
              onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}>
              ▶ Continuer ma formation
            </button>
          </div>
          <div style={{ width: isMobile ? "100%" : 280, height: isMobile ? 180 : 260, borderRadius: 12, overflow: "hidden", border: "1px solid #30363d", flexShrink: 0 }}>
            <img src="/moteur.PNG" alt="Moteur" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        {/* CAROUSEL LOGICIELS */}
        <div style={{ marginBottom: 36 }}>
          {!mounted ? null : isMobile ? (
            <LogicielsMobile logiciels={logiciels} logicielStats={logicielStats} onNavigate={(id) => router.push(`/logiciels/${id}`)} isProf={isProf} onAdd={() => setShowModalAjout(true)} onDelete={setConfirmDelete} />
          ) : (
            <LogicielsCarousel logiciels={logiciels} logicielStats={logicielStats} onNavigate={(id) => router.push(`/logiciels/${id}`)} isProf={isProf} onAdd={() => setShowModalAjout(true)} onDelete={setConfirmDelete} />
          )}
        </div>

        {/* DERNIERS TUTORIELS */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: isMobile ? 15 : 18, fontWeight: 500, color: "#e6edf3" }}>Derniers tutoriels</h2>
            <button onClick={() => router.push("/logiciels/solidworks")} style={{ fontSize: 12, color: "#58a6ff", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Voir tout →</button>
          </div>
          {loadingTutos ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ width: "100%", aspectRatio: "16/9", background: "#21262d" }} />
                  <div style={{ padding: 12 }}>
                    <div style={{ height: 12, background: "#21262d", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 10, background: "#21262d", borderRadius: 4, width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : derniersTutos.length === 0 ? (
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
              <p style={{ color: "#7d8590", fontSize: 13 }}>Aucun tutoriel disponible pour l'instant.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
              {derniersTutos.map(tuto => <TutorielCard key={tuto.id} tuto={tuto} onClick={() => setViewerTuto(tuto)} />)}
            </div>
          )}
        </div>

        {/* PROJETS À RÉALISER */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: isMobile ? 15 : 18, fontWeight: 500, color: "#e6edf3" }}>
              Projets à réaliser
              <span style={{ fontSize: 12, color: "#7d8590", fontWeight: 400, marginLeft: 10 }}>{projets.length} projet{projets.length > 1 ? "s" : ""}</span>
            </h2>
            {isProf && (
              <button
                onClick={() => { setEditingProjet(null); setShowModalProjet(true); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1f6feb"; e.currentTarget.style.borderColor = "#1f6feb"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#21262d"; e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#c9d1d9"; }}>
                + Nouveau projet
              </button>
            )}
          </div>

          {loadingProjets ? (
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 24, height: 24, border: "2px solid #1f6feb", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto" }} />
            </div>
          ) : projets.length === 0 ? (
            <div style={{ background: "#161b22", border: "1px dashed #21262d", borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
              <p style={{ color: "#7d8590", fontSize: 13, marginBottom: 8 }}>Aucun projet disponible pour l'instant.</p>
              {isProf && <button onClick={() => { setEditingProjet(null); setShowModalProjet(true); }} style={{ fontSize: 12, color: "#1f6feb", background: "none", border: "none", cursor: "pointer" }}>+ Créer le premier projet</button>}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {projets.map(projet => (
                <ProjetCard
                  key={projet.id}
                  projet={projet}
                  isProf={isProf}
                  isMobile={isMobile}
                  // ✅ Compteur réel depuis la sous-collection Firestore
                  ressourcesCount={ressourcesCounts[projet.id] ?? 0}
                  onEdit={(p) => { setEditingProjet(p); setShowModalProjet(true); }}
                  onDelete={(p) => setConfirmDeleteProjet(p)}
                  onStart={(id) => router.push(`/projet/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODALS */}
      {viewerTuto && <YouTubeViewer tuto={viewerTuto} onClose={() => setViewerTuto(null)} />}
      {showModalAjout && <ModalAjoutLogiciel onClose={() => setShowModalAjout(false)} />}
      {confirmDelete && <ModalConfirmSuppr logiciel={confirmDelete} onConfirm={() => handleDeleteLogiciel(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
      {showModalProjet && (
        <ModalAjoutProjet
          projet={editingProjet}
          user={user}
          userData={userData}
          onClose={(refresh) => { setShowModalProjet(false); setEditingProjet(null); }}
        />
      )}
      {confirmDeleteProjet && <ModalConfirmSupprProjet projet={confirmDeleteProjet} onConfirm={() => handleDeleteProjet(confirmDeleteProjet)} onCancel={() => setConfirmDeleteProjet(null)} />}
    </div>
  );
}