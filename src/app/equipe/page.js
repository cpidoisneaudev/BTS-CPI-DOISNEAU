"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Badges light : fond clair coloré, texte coloré foncé
const MATIERES_LIGHT = {
  comportement:     { label: "Comportement mécanique", bgL: "#dcfce7", textL: "#166534", bgD: "#0d2b1f", textD: "#5DCAA5", icon: "⚙️" },
  construction:     { label: "Construction mécanique",  bgL: "#dbeafe", textL: "#1e40af", bgD: "#0d1e2e", textD: "#85B7EB", icon: "📐" },
  conception:       { label: "Conception mécanique",    bgL: "#ede9fe", textL: "#5b21b6", bgD: "#1a1a2e", textD: "#AFA9EC", icon: "🖥️" },
  industrialisation:{ label: "Industrialisation",       bgL: "#fef9c3", textL: "#92400e", bgD: "#2b1f0d", textD: "#EF9F27", icon: "🏭" },
};

const MATIERES_BAR = {
  comportement:     "#1D9E75",
  construction:     "#378ADD",
  conception:       "#7F77DD",
  industrialisation:"#BA7517",
};

// Motifs SVG techniques pour le hero
const HeroBg = () => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}
    viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    {/* Engrenage gauche */}
    <g transform="translate(120,200)" stroke="#0ea5e9" strokeWidth="1.5" fill="none">
      <circle cx="0" cy="0" r="60"/>
      <circle cx="0" cy="0" r="20"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
        <rect key={a} x="-8" y="-72" width="16" height="14" rx="3"
          transform={`rotate(${a})`} fill="#0ea5e9" opacity="0.5"/>
      ))}
    </g>
    {/* Équerre droite */}
    <g transform="translate(1050,160)" stroke="#0ea5e9" strokeWidth="1.5" fill="none">
      <path d="M0,0 L120,0 L120,120" strokeLinecap="round"/>
      <path d="M0,0 L120,120" strokeDasharray="6,4"/>
      <rect x="100" y="0" width="20" height="20"/>
    </g>
    {/* Règle */}
    <g transform="translate(900,80)" stroke="#0ea5e9" strokeWidth="1" fill="none">
      <rect x="0" y="0" width="200" height="30" rx="3"/>
      {[0,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200].map((x,i) => (
        <line key={x} x1={x} y1="0" x2={x} y2={i%5===0?14:8}/>
      ))}
    </g>
    {/* Crayon */}
    <g transform="translate(1100,220) rotate(-30)" stroke="#0ea5e9" strokeWidth="1.5" fill="none">
      <rect x="-6" y="-60" width="12" height="80" rx="2"/>
      <path d="M-6,20 L0,36 L6,20"/>
    </g>
    {/* Petit engrenage */}
    <g transform="translate(220,120) scale(0.5)" stroke="#0ea5e9" strokeWidth="2" fill="none">
      <circle cx="0" cy="0" r="40"/>
      <circle cx="0" cy="0" r="15"/>
      {[0,45,90,135,180,225,270,315].map(a => (
        <rect key={a} x="-5" y="-48" width="10" height="10" rx="2"
          transform={`rotate(${a})`} fill="#0ea5e9" opacity="0.5"/>
      ))}
    </g>
    {/* Lignes circuit */}
    <g stroke="#0ea5e9" strokeWidth="0.8" fill="none" opacity="0.6">
      <path d="M300,50 L400,50 L400,100 L500,100"/>
      <circle cx="300" cy="50" r="4" fill="#0ea5e9"/>
      <circle cx="500" cy="100" r="4" fill="#0ea5e9"/>
      <path d="M600,300 L700,300 L700,250 L800,250"/>
      <circle cx="600" cy="300" r="4" fill="#0ea5e9"/>
    </g>
  </svg>
);

export default function EquipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profs, setProfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchProfs = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "PROF"),
          where("statut", "==", "actif")
        );
        const snap = await getDocs(q);
        setProfs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfs();
  }, [user]);

  // Détecte le thème pour adapter les badges
  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const getInitials = (prenom, nom) =>
    `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }} className="flex items-center justify-center">
        <div style={{ borderColor: "var(--cyan) transparent transparent transparent" }}
          className="w-8 h-8 border-2 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* ── HERO avec motifs techniques ── */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        background: isLight
          ? "linear-gradient(135deg, #e0eaff 0%, #f0f6ff 50%, #e8f4fd 100%)"
          : "linear-gradient(135deg, #0d1117 0%, #0d1d30 60%, #0d1117 100%)",
        paddingTop: 64,
        paddingBottom: 64,
      }}>
        {isLight && <HeroBg />}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--cyan)",
              border: "1px solid var(--cyan)",
              borderRadius: 20,
              padding: "4px 14px",
              opacity: 0.9,
            }}>
              Lycée Robert Doisneau · BTS CPI
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 16,
            lineHeight: 1.2,
          }}>
            L'équipe{" "}
            <span style={{ color: "var(--cyan)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              éducative
            </span>
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
            Des enseignants passionnés au service de votre formation en<br/>
            Conception de Produits Industriels.
          </p>

          {/* Trait décoratif */}
          <div style={{
            width: 48,
            height: 3,
            background: "var(--cyan)",
            borderRadius: 2,
            margin: "0 auto",
          }} />
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">

        {/* Grille profs */}
        {profs.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: "var(--text-secondary)" }} className="text-sm">Aucun enseignant disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {profs.map((prof) => {
              const photo = prof.photoUrl || null;
              const initials = getInitials(prof.prenom, prof.nom);
              const matieres = prof.matieres || [];
              const firstMatiere = matieres[0];
              const barColor = MATIERES_BAR[firstMatiere] || "var(--cyan)";

              return (
                <div
                  key={prof.id}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "var(--shadow)",
                    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-hover)";
                    e.currentTarget.style.borderColor = barColor;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  {/* Barre couleur top */}
                  <div style={{ height: 4, background: barColor }} />

                  <div style={{ padding: "20px 24px 20px" }}>
                    {/* Avatar + infos */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>

                      {/* Photo avec point vert */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {photo ? (
                          <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)" }}>
                            <Image src={photo} alt={`${prof.prenom} ${prof.nom}`} width={64} height={64} style={{ objectFit: "cover" }} />
                          </div>
                        ) : (
                          <div style={{
                            width: 64, height: 64, borderRadius: "50%",
                            background: MATIERES_LIGHT[firstMatiere]?.bgD || "var(--border)",
                            color: MATIERES_LIGHT[firstMatiere]?.textD || "var(--cyan)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, fontWeight: 700,
                            border: "2px solid var(--border)",
                          }}>
                            {initials}
                          </div>
                        )}
                        {/* Point vert actif */}
                        <div style={{
                          position: "absolute", bottom: 2, right: 2,
                          width: 12, height: 12, borderRadius: "50%",
                          backgroundColor: "#22c55e",
                          border: "2px solid var(--bg-card)",
                        }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600, marginBottom: 2 }}>
                          {prof.prenom} {prof.nom}
                        </h2>
                        <p style={{ color: "var(--cyan)", fontSize: 12, fontWeight: 500, marginBottom: 10 }}>
                          Professeur BTS CPI
                        </p>
                        {/* Badges matières */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {matieres.map((m) => {
                            const info = MATIERES_LIGHT[m];
                            if (!info) return null;
                            return (
                              <span key={m} style={{
                                fontSize: 11,
                                fontWeight: 500,
                                padding: "3px 10px",
                                borderRadius: 20,
                                background: isLight ? info.bgL : info.bgD,
                                color: isLight ? info.textL : info.textD,
                              }}>
                                {info.icon} {info.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {prof.description && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <p style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                          {prof.description}
                        </p>
                      </div>
                    )}

                    {/* Footer email + exp */}
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <a href={`mailto:${prof.email}`} style={{ color: "var(--text-secondary)", fontSize: 12, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--cyan)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                        </svg>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{prof.email}</span>
                      </a>
                      {prof.anneesExperience && (
                        <div style={{ color: "var(--text-secondary)", fontSize: 12, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                          </svg>
                          {prof.anneesExperience} ans
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Stats + Citation ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">

          {/* Stats avec icônes */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 24,
            boxShadow: "var(--shadow)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: isLight ? "#dbeafe" : "#0d1e2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                L'équipe en chiffres
              </p>
            </div>

            {[
              { label: "Enseignants", val: profs.length, unit: "professeurs", color: "#0ea5e9", icon: "👨‍🏫" },
              { label: "Étudiants encadrés", val: 80, unit: "étudiants", color: "#22c55e", icon: "🎓" },
              { label: "Matières enseignées", val: 4, unit: "disciplines", color: "#8b5cf6", icon: "📚" },
              { label: "Taux de réussite", val: "92", unit: "%", color: "#f59e0b", icon: "🏆" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}
                className="last:border-none">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{s.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ color: s.color, fontSize: 20, fontWeight: 700 }}>{s.val}</span>
                  <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>{s.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Citation */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 28,
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ color: "var(--cyan)", fontSize: 48, fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: 16, fontWeight: 700 }}>"</div>
              <p style={{ color: "var(--text-primary)", fontSize: 15, lineHeight: 1.75, fontFamily: "Georgia, serif", fontStyle: "italic", margin: 0 }}>
                Notre mission est de former des concepteurs capables de relever les défis industriels de demain, armés d'une solide expertise technique et d'un esprit d'innovation.
              </p>
            </div>
            <div>
              <div style={{ width: 40, height: 2, background: "var(--cyan)", borderRadius: 1, margin: "20px 0 12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: 12, margin: 0 }}>— L'équipe pédagogique BTS CPI</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>Une question pour l'équipe ?</p>
          <Link href="/contact" style={{ backgroundColor: "var(--cyan)", color: "#ffffff", fontWeight: 600, fontSize: 14, padding: "12px 28px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", transition: "background-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--cyan-hover)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--cyan)"}>
            Nous contacter →
          </Link>
        </div>

      </div>
    </div>
  );
}