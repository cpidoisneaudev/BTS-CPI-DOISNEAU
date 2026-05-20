"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp, getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const LOGICIELS = [
  {
    id: "solidworks",
    label: "SolidWorks",
    sub: "Conception 3D",
    logo: "https://cdn.worldvectorlogo.com/logos/solidworks.svg",
    logoBg: "#c00d0d",
  },
  {
    id: "catia",
    label: "CATIA V5",
    sub: "CAO avancée",
    logo: "https://logodix.com/logo/1810230.jpg",
    logoBg: "#003087",
  },
  {
    id: "rdm6",
    label: "RDM6",
    sub: "Simulation",
    logo: null,
    logoBg: "#1a6b3c",
  },
];

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];

const badgeStyle = (niveau) => {
  if (niveau === "Débutant")      return { background: "#1a3a2a", color: "#3fb950" };
  if (niveau === "Intermédiaire") return { background: "#3a2e1a", color: "#d29922" };
  return                                 { background: "#3a1a1a", color: "#f85149" };
};

// Composant: Barre de progression
function ProgressBar({ current, total }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#7d8590" }}>Progression</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#e6edf3" }}>{percent}%</span>
      </div>
      <div style={{
        width: "100%", height: 6, background: "#21262d", borderRadius: 99,
        overflow: "hidden"
      }}>
        <div style={{
          width: `${percent}%`, height: "100%", background: "#3b8ef3",
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
}

// Composant: Card logiciel avec stats
function LogicielCard({ logiciel, stats, onClick, isActive }) {
  const modules = stats.modules || 0;
  const videos = stats.videos || 0;
  const exercices = stats.exercices || 0;
  const projects = stats.projects || 0;
  const totalItems = modules + videos + exercices + projects;
  const progress = stats.progress || 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#161b22",
        border: isActive ? "1px solid #58a6ff" : "1px solid #21262d",
        borderRadius: 12,
        padding: 20,
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: isActive ? "0 0 0 2px #58a6ff22" : "none",
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.borderColor = "#30363d";
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.borderColor = "#21262d";
      }}
    >
      {/* Logo + nom */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 8,
          background: logiciel.logoBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, overflow: "hidden"
        }}>
          {logiciel.logo ? (
            <img
              src={logiciel.logo}
              alt={logiciel.label}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>RDM</span>
          )}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#e6edf3" }}>
            {logiciel.label}
          </div>
          <div style={{ fontSize: 12, color: "#7d8590", marginTop: 2 }}>
            {logiciel.sub}
          </div>
        </div>
      </div>

      {/* Progression */}
      <ProgressBar current={progress} total={100} />

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #21262d"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>
            {modules}
          </div>
          <div style={{ fontSize: 10, color: "#7d8590", marginTop: 2 }}>Modules</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>
            {videos}
          </div>
          <div style={{ fontSize: 10, color: "#7d8590", marginTop: 2 }}>Vidéos</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>
            {exercices}
          </div>
          <div style={{ fontSize: 10, color: "#7d8590", marginTop: 2 }}>Exercices</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>
            {projects}
          </div>
          <div style={{ fontSize: 10, color: "#7d8590", marginTop: 2 }}>Projets</div>
        </div>
      </div>

      {/* Bouton */}
      <button
        style={{
          width: "100%", marginTop: 14,
          padding: "8px", borderRadius: 8,
          background: isActive ? "#58a6ff" : "#21262d",
          border: isActive ? "1px solid #58a6ff" : "1px solid #30363d",
          color: isActive ? "#fff" : "#c9d1d9",
          fontSize: 12, fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        {isActive ? "Vous êtes ici" : "Entrer dans l'espace"}
      </button>
    </div>
  );
}

export default function LogicielsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [logicielId, setLogicielId] = useState("solidworks");
  const [ateliers, setAteliers]     = useState([]);
  const [atelierId, setAtelierId]   = useState(null);
  const [ressources, setRessources] = useState([]);
  const [counts, setCounts]         = useState({});
  const [filterType, setFilterType] = useState("tout");
  const [logicielStats, setLogicielStats] = useState({});

  const [showAddAtelier, setShowAddAtelier]     = useState(false);
  const [showAddRessource, setShowAddRessource] = useState(false);
  const [newAtelierNom, setNewAtelierNom]       = useState("");
  const [uploading, setUploading]               = useState(false);

  const [form, setForm] = useState({
    titre: "", type: "youtube", url: "",
    niveau: "Débutant", duree: "", pages: "", file: null,
  });

  const isProf = userData?.role === "PROF" || userData?.role === "ADMIN";
  const logiciel = LOGICIELS.find(l => l.id === logicielId);

  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user]);

  // Récupérer les stats par logiciel
  useEffect(() => {
    const computeStats = async () => {
      const stats = {};
      for (const logId of ["solidworks", "catia", "rdm6"]) {
        try {
          const ateliersSnap = await getDocs(
            collection(db, "logiciels", logId, "ateliers")
          );
          let modules = 0, videos = 0, exercices = 0, projects = 0;

          for (const atelierDoc of ateliersSnap.docs) {
            const ressourcesSnap = await getDocs(
              collection(db, "logiciels", logId, "ateliers", atelierDoc.id, "ressources")
            );
            ressourcesSnap.forEach(r => {
              const rData = r.data();
              if (rData.type === "youtube") videos++;
              else if (rData.type === "pdf") {
                if (rData.titre?.toLowerCase().includes("exercice")) exercices++;
                else if (rData.titre?.toLowerCase().includes("projet")) projects++;
                else modules++;
              }
            });
          }
          stats[logId] = {
            modules, videos, exercices, projects,
            progress: Math.min(100, Math.round((videos + exercices + projects) * 5))
          };
        } catch (e) {
          console.error(`Erreur stats ${logId}:`, e);
          stats[logId] = { modules: 0, videos: 0, exercices: 0, projects: 0, progress: 0 };
        }
      }
      setLogicielStats(stats);
    };
    computeStats();
  }, []);

  // Ateliers en temps réel
  useEffect(() => {
    if (!logicielId) return;
    setAtelierId(null);
    setCounts({});
    const q = query(
      collection(db, "logiciels", logicielId, "ateliers"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, async snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAteliers(data);
      if (data.length > 0) setAtelierId(prev => prev || data[0].id);

      // Compteurs par atelier
      const c = {};
      await Promise.all(data.map(async a => {
        const s = await getDocs(
          collection(db, "logiciels", logicielId, "ateliers", a.id, "ressources")
        );
        c[a.id] = s.size;
      }));
      setCounts(c);
    });
    return () => unsub();
  }, [logicielId]);

  // Ressources en temps réel
  useEffect(() => {
    if (!atelierId) { setRessources([]); return; }
    const q = query(
      collection(db, "logiciels", logicielId, "ateliers", atelierId, "ressources"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setRessources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [atelierId, logicielId]);

  const handleAddAtelier = async () => {
    if (!newAtelierNom.trim()) return;
    const ref = await addDoc(
      collection(db, "logiciels", logicielId, "ateliers"),
      { nom: newAtelierNom.trim(), profId: user.uid, createdAt: serverTimestamp() }
    );
    setAtelierId(ref.id);
    setNewAtelierNom("");
    setShowAddAtelier(false);
  };

  const handleDeleteAtelier = async (id) => {
    if (!confirm("Supprimer cet atelier et toutes ses ressources ?")) return;
    await deleteDoc(doc(db, "logiciels", logicielId, "ateliers", id));
    setAtelierId(ateliers.find(a => a.id !== id)?.id || null);
  };

  const handleAddRessource = async () => {
    if (!form.titre.trim() || !atelierId) return;
    setUploading(true);
    try {
      let url = form.url;
      if (form.type === "pdf" && form.file) {
        const fd = new FormData();
        fd.append("file", form.file);
        const res = await fetch("/api/ressource/upload", { method: "POST", body: fd });
        const data = await res.json();
        url = data.url;
      }
      await addDoc(
        collection(db, "logiciels", logicielId, "ateliers", atelierId, "ressources"),
        {
          titre: form.titre.trim(),
          type: form.type,
          url,
          niveau: form.niveau,
          duree: form.type === "youtube" ? form.duree : "",
          pages: form.type === "pdf"     ? form.pages : "",
          profId: user.uid,
          profNom: `${userData.prenom} ${userData.nom}`,
          createdAt: serverTimestamp(),
        }
      );
      setForm({ titre:"", type:"youtube", url:"", niveau:"Débutant", duree:"", pages:"", file:null });
      setShowAddRessource(false);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'ajout.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRessource = async (rid) => {
    if (!confirm("Supprimer cette ressource ?")) return;
    await deleteDoc(
      doc(db, "logiciels", logicielId, "ateliers", atelierId, "ressources", rid)
    );
  };

  const filtered = ressources.filter(r =>
    filterType === "tout" || r.type === filterType
  );

  if (!user || !userData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ===== HERO BANNER ===== */}
        <div style={{
          background: "#161b22",
          border: "1px solid #21262d",
          borderRadius: 16,
          padding: "40px 32px",
          marginBottom: 40,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 32, alignItems: "center",
        }}>
          {/* Texte à gauche */}
          <div>
            <div style={{ fontSize: 12, color: "#7d8590", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontWeight: 600 }}>
              Centre de formation CPI
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 600, color: "#e6edf3", marginBottom: 16, lineHeight: 1.3 }}>
              Maîtrisez les logiciels industriels avec des contenus de qualité
            </h1>
            <p style={{ fontSize: 14, color: "#8b949e", marginBottom: 20, lineHeight: 1.6 }}>
              Tutoriaux vidéo, exercices pratiques, projets industriels et ressources téléchargeables pour réussir en BTS CPI.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", fontSize: 12, color: "#3fb950", background: "#1a3a2a", borderRadius: 99
              }}>✓ Formations complètes</span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", fontSize: 12, color: "#d29922", background: "#3a2e1a", borderRadius: 99
              }}>📊 Projets concrets</span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", fontSize: 12, color: "#58a6ff", background: "#1f3a5f", borderRadius: 99
              }}>✅ Suivi progression</span>
            </div>
            <button
              onClick={() => setLogicielId("solidworks")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 24px", fontSize: 13, fontWeight: 500,
                background: "#1f6feb", color: "#fff", border: "none",
                borderRadius: 8, cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
              onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}
            >
              ▶ Continuer ma formation
            </button>
          </div>

          {/* Image à droite */}
          <div style={{
            width: "100%", height: 280, borderRadius: 12,
            background: "#0d1117",
            border: "1px solid #30363d",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <img
              src="/moteur.png"
              alt="Moteur industriel"
              style={{
                width: "100%", height: "100%", objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* ===== CARDS LOGICIELS ===== */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: "#e6edf3", marginBottom: 16 }}>
            Explorez nos formations
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {LOGICIELS.map(log => (
              <LogicielCard
                key={log.id}
                logiciel={log}
                stats={logicielStats[log.id] || { modules: 0, videos: 0, exercices: 0, projects: 0, progress: 0 }}
                isActive={logicielId === log.id}
                onClick={() => setLogicielId(log.id)}
              />
            ))}
          </div>
        </div>

        {/* ===== DERNIERS TUTORIELS ===== */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: "#e6edf3" }}>
              Derniers tutoriels
            </h2>
            <a href="#" style={{ fontSize: 12, color: "#58a6ff", textDecoration: "none" }}>
              Voir toutes les vidéos →
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {/* VIDEO 1 */}
            <div style={{
              background: "#161b22", border: "1px solid #21262d",
              borderRadius: 10, overflow: "hidden", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#30363d"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
            >
              <div style={{
                width: "100%", aspectRatio: "16/9",
                background: "#0d1117", position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden"
              }}>
                <img src="/moteur.png" alt="Tutoriel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "#1f6feb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18
                  }}>▶</div>
                </div>
                <div style={{
                  position: "absolute", bottom: 8, right: 8,
                  background: "rgba(0,0,0,0.7)", color: "#fff",
                  padding: "3px 7px", borderRadius: 4,
                  fontSize: 10, fontWeight: 600
                }}>12:45</div>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#e6edf3", marginBottom: 6, lineHeight: 1.3 }}>
                  Simulation d'une poutre
                </div>
                <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 8 }}>
                  SolidWorks Simulation
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: 10, padding: "2px 8px",
                    background: "#1a3a2a", color: "#3fb950",
                    borderRadius: 4, fontWeight: 500
                  }}>Intermédiaire</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 14 }}>⭐</span>
                    <span style={{ fontSize: 11, color: "#7d8590" }}>4.8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VIDEO 2 */}
            <div style={{
              background: "#161b22", border: "1px solid #21262d",
              borderRadius: 10, overflow: "hidden", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#30363d"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
            >
              <div style={{
                width: "100%", aspectRatio: "16/9",
                background: "#0d1117", position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden"
              }}>
                <img src="/moteur.png" alt="Tutoriel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "#1f6feb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18
                  }}>▶</div>
                </div>
                <div style={{
                  position: "absolute", bottom: 8, right: 8,
                  background: "rgba(0,0,0,0.7)", color: "#fff",
                  padding: "3px 7px", borderRadius: 4,
                  fontSize: 10, fontWeight: 600
                }}>18:20</div>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#e6edf3", marginBottom: 6, lineHeight: 1.3 }}>
                  Assemblage avec contraintes
                </div>
                <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 8 }}>
                  SolidWorks
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: 10, padding: "2px 8px",
                    background: "#0d3a1a", color: "#3fb950",
                    borderRadius: 4, fontWeight: 500
                  }}>Débutant</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 14 }}>⭐</span>
                    <span style={{ fontSize: 11, color: "#7d8590" }}>4.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VIDEO 3 */}
            <div style={{
              background: "#161b22", border: "1px solid #21262d",
              borderRadius: 10, overflow: "hidden", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#30363d"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
            >
              <div style={{
                width: "100%", aspectRatio: "16/9",
                background: "#0d1117", position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden"
              }}>
                <img src="/moteur.png" alt="Tutoriel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "#1f6feb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18
                  }}>▶</div>
                </div>
                <div style={{
                  position: "absolute", bottom: 8, right: 8,
                  background: "rgba(0,0,0,0.7)", color: "#fff",
                  padding: "3px 7px", borderRadius: 4,
                  fontSize: 10, fontWeight: 600
                }}>10:15</div>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#e6edf3", marginBottom: 6, lineHeight: 1.3 }}>
                  Mise en plan complète
                </div>
                <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 8 }}>
                  SolidWorks
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: 10, padding: "2px 8px",
                    background: "#3a2e1a", color: "#d29922",
                    borderRadius: 4, fontWeight: 500
                  }}>Intermédiaire</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 14 }}>⭐</span>
                    <span style={{ fontSize: 11, color: "#7d8590" }}>4.7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VIDEO 4 */}
            <div style={{
              background: "#161b22", border: "1px solid #21262d",
              borderRadius: 10, overflow: "hidden", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#30363d"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
            >
              <div style={{
                width: "100%", aspectRatio: "16/9",
                background: "#0d1117", position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden"
              }}>
                <img src="/moteur.png" alt="Tutoriel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "#1f6feb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18
                  }}>▶</div>
                </div>
                <div style={{
                  position: "absolute", bottom: 8, right: 8,
                  background: "rgba(0,0,0,0.7)", color: "#fff",
                  padding: "3px 7px", borderRadius: 4,
                  fontSize: 10, fontWeight: 600
                }}>15:30</div>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#e6edf3", marginBottom: 6, lineHeight: 1.3 }}>
                  Analyse statique
                </div>
                <div style={{ fontSize: 11, color: "#7d8590", marginBottom: 8 }}>
                  RDM6
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: 10, padding: "2px 8px",
                    background: "#3a1a1a", color: "#f85149",
                    borderRadius: 4, fontWeight: 500
                  }}>Avancé</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 14 }}>⭐</span>
                    <span style={{ fontSize: 11, color: "#7d8590" }}>4.6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== PROJETS INDUSTRIELS (DÉPÔT) ===== */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: "#e6edf3" }}>
              Projets industriels
            </h2>
            <a href="#" style={{ fontSize: 12, color: "#58a6ff", textDecoration: "none" }}>
              Voir tous les projets →
            </a>
          </div>

          <div style={{
            background: "#161b22", border: "1px solid #21262d",
            borderRadius: 12, padding: 20,
            display: "grid", gridTemplateColumns: "140px 1fr 1fr",
            gap: 28, alignItems: "stretch"
          }}>
            {/* GAUCHE: Image */}
            <div style={{
              width: 160, height: 180, borderRadius: 10,
              background: "#0d1117", border: "1px solid #30363d",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", flexShrink: 0
            }}>
              <img src="/moteur.png" alt="Projet" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* CENTRE: Infos projet */}
            <div>
              <div style={{ fontSize: 11, color: "#7d8590", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                PROJET COMPLET
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#e6edf3", marginBottom: 8 }}>
                Réducteur mécanique
              </h3>
              <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 12, lineHeight: 1.5 }}>
                Concevez et analysez un réducteur complet de A à Z
              </p>

              {/* Stats horizontales */}
              <div style={{ display: "flex", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14 }}>⏱</span>
                  <div>
                    <div style={{ fontSize: 9, color: "#7d8590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Durée estimée</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>8h</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14 }}>📁</span>
                  <div>
                    <div style={{ fontSize: 9, color: "#7d8590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ressources</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>32</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14 }}>📊</span>
                  <div>
                    <div style={{ fontSize: 9, color: "#7d8590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Niveau</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#d29922" }}>Intermédiaire</div>
                  </div>
                </div>
              </div>
            </div>

            {/* DROITE: Inclus + Bouton */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 11, color: "#7d8590", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Inclus dans ce projet :
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14, flex: 1 }}>
                {[
                  "Fichiers CAO",
                  "Mise en plan",
                  "Calculs RDM",
                  "Nomenclature",
                  "Simulation",
                  "Guide fabrication"
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 11, color: "#c9d1d9"
                  }}>
                    <span style={{ fontSize: 12, color: "#3fb950" }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button style={{
                padding: "12px 16px", fontSize: 13, fontWeight: 600,
                background: "#1f6feb", color: "#fff", border: "none",
                borderRadius: 8, cursor: "pointer",
                transition: "all 0.2s",
                width: "100%"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#388bfd"}
              onMouseLeave={e => e.currentTarget.style.background = "#1f6feb"}
              >Commencer le projet</button>
            </div>
          </div>
        </div>

        {/* ===== CONTENU PRINCIPAL (existant) ===== */}
        <div style={{
          background: "#161b22", border: "1px solid #21262d",
          borderRadius: 10, padding: "24px",
        }}>
          {/* Header */}
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#e6edf3", marginBottom: 4 }}>
            Logiciels
          </h1>
          <p style={{ fontSize: 13, color: "#7d8590", marginBottom: 24 }}>
            Tutoriels et formations — {logiciel.label}
          </p>

          {/* Layout sidebar + contenu */}
          <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 14 }}>

            {/* Sidebar */}
            <div style={{
              background: "#0d1117", border: "1px solid #21262d",
              borderRadius: 10, overflow: "hidden", alignSelf: "start",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderBottom: "1px solid #21262d",
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#7d8590", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Ateliers
                </span>
                {isProf && (
                  <button
                    onClick={() => setShowAddAtelier(true)}
                    title="Nouvel atelier"
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: "transparent", border: "1px solid #30363d",
                      color: "#7d8590", fontSize: 18, lineHeight: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >+</button>
                )}
              </div>

              {ateliers.length === 0 ? (
                <p style={{ fontSize: 12, color: "#7d8590", textAlign: "center", padding: "24px 12px" }}>
                  {isProf ? "Crée ton premier atelier →" : "Aucun atelier"}
                </p>
              ) : ateliers.map(a => (
                <div
                  key={a.id}
                  onClick={() => setAtelierId(a.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 14px", cursor: "pointer",
                    borderLeft: atelierId === a.id ? `2px solid #58a6ff` : "2px solid transparent",
                    background: atelierId === a.id ? "#161b22" : "transparent",
                    transition: "all 0.12s",
                  }}
                >
                  <span style={{ fontSize: 13, color: atelierId === a.id ? "#e6edf3" : "#8b949e", fontWeight: atelierId === a.id ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                    {a.nom}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 11, borderRadius: 99, padding: "1px 7px",
                      background: atelierId === a.id ? "#1f3a5f" : "#21262d",
                      color: atelierId === a.id ? "#58a6ff" : "#7d8590",
                      border: `1px solid ${atelierId === a.id ? "#1f3a5f" : "#30363d"}`,
                    }}>
                      {counts[a.id] ?? 0}
                    </span>
                    {isProf && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteAtelier(a.id); }}
                        style={{
                          width: 18, height: 18, borderRadius: 4, border: "none",
                          background: "transparent", color: "#7d8590", fontSize: 11,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Zone principale */}
            <div>
              {!atelierId ? (
                <div style={{
                  background: "#0d1117", border: "1px dashed #21262d",
                  borderRadius: 10, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "64px 24px", color: "#7d8590", fontSize: 13, textAlign: "center",
                }}>
                  <span style={{ fontSize: 32, marginBottom: 12 }}>📂</span>
                  {isProf ? "Crée un atelier dans la sidebar pour commencer" : "Aucun contenu disponible"}
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: "#e6edf3" }}>
                        {ateliers.find(a => a.id === atelierId)?.nom}
                      </div>
                      <div style={{ fontSize: 12, color: "#7d8590", marginTop: 2 }}>
                        {logiciel.label} · {ressources.length} ressource{ressources.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {isProf && (
                      <button
                        onClick={() => setShowAddRessource(true)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 8,
                          border: "1px solid #30363d", background: "#21262d",
                          color: "#c9d1d9", fontSize: 12, cursor: "pointer",
                        }}
                      >+ Ajouter</button>
                    )}
                  </div>

                  {/* Filtres */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {[
                      { key: "tout", label: "Tout" },
                      { key: "youtube", label: "Vidéo" },
                      { key: "pdf", label: "PDF" },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setFilterType(f.key)}
                        style={{
                          fontSize: 11, padding: "4px 12px", borderRadius: 99,
                          border: filterType === f.key ? "1px solid #30363d" : "1px solid #21262d",
                          background: filterType === f.key ? "#21262d" : "transparent",
                          color: filterType === f.key ? "#e6edf3" : "#7d8590",
                          cursor: "pointer",
                        }}
                      >{f.label}</button>
                    ))}
                  </div>

                  {/* Ressources */}
                  {filtered.length === 0 ? (
                    <div style={{
                      background: "#0d1117", border: "1px dashed #21262d",
                      borderRadius: 10, textAlign: "center",
                      padding: "48px 24px", color: "#7d8590", fontSize: 13,
                    }}>
                      {isProf ? "Aucune ressource — clique sur + Ajouter" : "Aucune ressource disponible"}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {filtered.map(r => (
                        <div key={r.id} style={{
                          background: "#0d1117", border: "1px solid #21262d",
                          borderRadius: 10, padding: "12px 16px",
                          display: "flex", alignItems: "center", gap: 12,
                        }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 8,
                            background: r.type === "youtube" ? "#3d1a1a" : "#3d2a1a",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 17, flexShrink: 0,
                          }}>
                            {r.type === "youtube" ? "▶️" : "📄"}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#e6edf3", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {r.titre}
                            </div>
                            <div style={{ fontSize: 11, color: "#7d8590" }}>
                              {r.type === "youtube"
                                ? `Vidéo${r.duree ? ` · ${r.duree}` : ""}`
                                : `PDF${r.pages ? ` · ${r.pages} pages` : ""}`}
                            </div>
                          </div>

                          <span style={{
                            fontSize: 10, padding: "2px 9px", borderRadius: 99,
                            fontWeight: 500, flexShrink: 0,
                            ...badgeStyle(r.niveau),
                          }}>{r.niveau}</span>

                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <a
                              href={r.url} target="_blank" rel="noreferrer"
                              style={{
                                width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                                border: "1px solid #21262d", borderRadius: 7,
                                color: "#7d8590", fontSize: 13, textDecoration: "none",
                              }}
                              title={r.type === "youtube" ? "Ouvrir" : "Télécharger"}
                            >↗</a>
                            {isProf && (
                              <button
                                onClick={() => handleDeleteRessource(r.id)}
                                style={{
                                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                                  border: "1px solid #21262d", borderRadius: 7,
                                  background: "transparent", color: "#7d8590", fontSize: 13, cursor: "pointer",
                                }}
                              >✕</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALS (inchangés) ===== */}
      {showAddAtelier && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 16, width: "100%", maxWidth: 380, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: "#e6edf3", marginBottom: 16 }}>Nouvel atelier</h3>
            <input
              type="text"
              value={newAtelierNom}
              onChange={e => setNewAtelierNom(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddAtelier()}
              placeholder="Ex : Esquisse 2D"
              autoFocus
              style={{
                width: "100%", background: "#0d1117", border: "1px solid #30363d",
                borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#e6edf3",
                outline: "none", marginBottom: 16,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => { setShowAddAtelier(false); setNewAtelierNom(""); }}
                style={{ padding: "7px 16px", fontSize: 13, color: "#7d8590", background: "transparent", border: "none", cursor: "pointer" }}
              >Annuler</button>
              <button
                onClick={handleAddAtelier}
                disabled={!newAtelierNom.trim()}
                style={{
                  padding: "7px 18px", fontSize: 13, background: "#238636",
                  color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
                  opacity: newAtelierNom.trim() ? 1 : 0.4,
                }}
              >Créer</button>
            </div>
          </div>
        </div>
      )}

      {showAddRessource && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 16, width: "100%", maxWidth: 440, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: "#e6edf3", marginBottom: 20 }}>Ajouter une ressource</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: "#7d8590", display: "block", marginBottom: 6 }}>Titre</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  placeholder="Ex : Introduction aux esquisses"
                  style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#e6edf3", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: "#7d8590", display: "block", marginBottom: 6 }}>Type</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["youtube","pdf"].map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t, url: "", file: null }))}
                      style={{
                        flex: 1, padding: "8px", borderRadius: 8, fontSize: 13,
                        border: form.type === t ? "1px solid #58a6ff" : "1px solid #30363d",
                        background: form.type === t ? "#1f3a5f" : "#0d1117",
                        color: form.type === t ? "#58a6ff" : "#7d8590", cursor: "pointer",
                      }}
                    >{t === "youtube" ? "▶ Vidéo YouTube" : "📄 PDF"}</button>
                  ))}
                </div>
              </div>

              {form.type === "youtube" ? (
                <div>
                  <label style={{ fontSize: 11, color: "#7d8590", display: "block", marginBottom: 6 }}>Lien YouTube</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#e6edf3", outline: "none" }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 11, color: "#7d8590", display: "block", marginBottom: 6 }}>Fichier PDF</label>
                  <input
                    type="file" accept=".pdf"
                    onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))}
                    style={{ width: "100%", fontSize: 12, color: "#7d8590" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#7d8590", display: "block", marginBottom: 6 }}>
                    {form.type === "youtube" ? "Durée (ex: 22 min)" : "Nb de pages"}
                  </label>
                  <input
                    type="text"
                    value={form.type === "youtube" ? form.duree : form.pages}
                    onChange={e => setForm(f => form.type === "youtube" ? { ...f, duree: e.target.value } : { ...f, pages: e.target.value })}
                    placeholder={form.type === "youtube" ? "22 min" : "8"}
                    style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#e6edf3", outline: "none" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#7d8590", display: "block", marginBottom: 6 }}>Niveau</label>
                  <select
                    value={form.niveau}
                    onChange={e => setForm(f => ({ ...f, niveau: e.target.value }))}
                    style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#e6edf3", outline: "none" }}
                  >
                    {NIVEAUX.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button
                onClick={() => { setShowAddRessource(false); setForm({ titre:"", type:"youtube", url:"", niveau:"Débutant", duree:"", pages:"", file:null }); }}
                style={{ padding: "7px 16px", fontSize: 13, color: "#7d8590", background: "transparent", border: "none", cursor: "pointer" }}
              >Annuler</button>
              <button
                onClick={handleAddRessource}
                disabled={uploading || !form.titre.trim() || (!form.url && !form.file)}
                style={{
                  padding: "7px 18px", fontSize: 13, background: "#238636",
                  color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
                  opacity: (uploading || !form.titre.trim() || (!form.url && !form.file)) ? 0.4 : 1,
                }}
              >{uploading ? "Envoi..." : "Ajouter"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}