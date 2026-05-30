"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

function highlight(text, query) {
  if (!query.trim()) return text;
  const parts = String(text).split(new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} style={{ background: "rgba(31,107,235,0.32)", color: "#e6edf3", padding: "0 2px", borderRadius: 3 }}>
        {part}
      </mark>
    ) : part
  );
}

const recommendedSites = [
  {
    name: "3D ContentCentral",
    logo: "🧩",
    description: "Bibliothèque de modèles 3D gratuits pour de nombreux logiciels CAO.",
    url: "https://www.3dcontentcentral.com",
  },
  {
    name: "Dassault Systèmes",
    logo: "DS",
    description: "Documentation officielle, tutoriels et ressources CATIA, SolidWorks et 3DEXPERIENCE.",
    url: "https://www.3ds.com",
  },
  {
    name: "GrabCAD",
    logo: "G",
    description: "Communauté de conception et partage de fichiers CAO.",
    url: "https://grabcad.com/library",
  },
  {
    name: "Norelem",
    logo: "⚙️",
    description: "Éléments normalisés et composants mécaniques avec fichiers 3D.",
    url: "https://www.norelem.fr",
  },
  {
    name: "TraceParts",
    logo: "TP",
    description: "Bibliothèque de composants 3D téléchargeables : STEP, IGES, SolidWorks, CATIA.",
    url: "https://www.traceparts.com",
  },
].sort((a, b) => a.name.localeCompare(b.name));

const pdfDocuments = [
  { title: "Conception mécanique", subtitle: "Guide pratique", pages: 152, size: "12.4 Mo", cover: "#dbe7f4" },
  { title: "Mécanique des matériaux", subtitle: "Cours et exercices", pages: 210, size: "8.7 Mo", cover: "#e7e1d3" },
  { title: "Guide du dessinateur industriel", subtitle: "Communication technique", pages: 135, size: "9.1 Mo", cover: "#f0eadc" },
  { title: "Tolérances géométriques", subtitle: "Normes ISO GPS", pages: 98, size: "5.6 Mo", cover: "#eee6d4" },
];

const cadParts = [
  { title: "Roulement à billes", icon: "◉", category: "Guidage", formats: [".STEP", ".IGS", ".SLDPRT"] },
  { title: "Vérin pneumatique", icon: "▭", category: "Mécanique", formats: [".STEP", ".IGS", ".CATPart"] },
  { title: "Guidage linéaire", icon: "▰", category: "Guidage", formats: [".STEP", ".IGS"] },
  { title: "Poulie trapézoïdale", icon: "◎", category: "Transmission", formats: [".STEP", ".SLDPRT"] },
  { title: "Motoréducteur", icon: "◍", category: "Transmission", formats: [".STEP", ".IGS"] },
  { title: "Vis à tête hexagonale", icon: "⬡", category: "Éléments normalisés", formats: [".STEP", ".IGS", ".CATPart"] },
  { title: "Engrenage droit", icon: "✺", category: "Transmission", formats: [".STEP", ".IGS"] },
  { title: "Chaîne à rouleaux", icon: "⛓️", category: "Transmission", formats: [".STEP", ".IGS"] },
];

const quickCards = [
  {
    title: "Liens Utiles",
    count: "42",
    label: "ressources",
    icon: "🔗",
    color: "#1f6feb",
    bg: "rgba(31,107,235,0.18)",
  },
  {
    title: "Livres PDF",
    count: "125",
    label: "documents",
    icon: "📄",
    color: "#3fb950",
    bg: "rgba(63,185,80,0.16)",
  },
  {
    title: "Norelem & Catalogues",
    count: "18",
    label: "catalogues",
    icon: "📦",
    color: "#e07b39",
    bg: "rgba(224,123,57,0.16)",
  },
  {
    title: "Pièces mécaniques",
    count: "350+",
    label: "modèles 3D",
    icon: "🧊",
    color: "#9d95e8",
    bg: "rgba(157,149,232,0.18)",
  },
];

const filters = ["Tous", "Mécanique", "Transmission", "Guidage", "Éléments normalisés", "Assemblage"];

export default function DashboardBibliothequePage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1100px)");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");

  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user, router]);

  const filteredParts = useMemo(() => {
    const byFilter = activeFilter === "Tous" ? cadParts : cadParts.filter((p) => p.category === activeFilter);
    if (!search.trim()) return byFilter;
    const q = search.toLowerCase();
    return byFilter.filter((p) =>
      [p.title, p.category, p.formats.join(" ")].join(" ").toLowerCase().includes(q)
    );
  }, [activeFilter, search]);

  const filteredSites = useMemo(() => {
    if (!search.trim()) return recommendedSites;
    const q = search.toLowerCase();
    return recommendedSites.filter((s) => [s.name, s.description].join(" ").toLowerCase().includes(q));
  }, [search]);

  if (!user || !userData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "sans-serif", overflowX: "hidden" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", boxSizing: "border-box", width: "100%" }}>
        <section
          style={{
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            marginBottom: 18,
            minHeight: isMobile ? 330 : 300,
            border: "1px solid #21262d",
            background: "#101820",
            boxShadow: "0 24px 70px rgba(0,0,0,0.26)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isMobile
                ? "linear-gradient(180deg, rgba(13,17,23,0.98) 0%, rgba(13,17,23,0.82) 100%)"
                : "linear-gradient(90deg, rgba(13,17,23,0.98) 0%, rgba(13,17,23,0.9) 46%, rgba(13,17,23,0.35) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 52% 28%, rgba(31,107,235,0.22), transparent 32%), radial-gradient(circle at 78% 62%, rgba(88,166,255,0.14), transparent 30%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "24px 18px" : "32px 34px" }}>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 26 }}>
              <div
                style={{
                  width: isMobile ? 58 : 78,
                  height: isMobile ? 58 : 78,
                  borderRadius: 18,
                  background: "linear-gradient(135deg, rgba(31,107,235,0.95), rgba(8,145,178,0.55))",
                  border: "1px solid rgba(88,166,255,0.36)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? 30 : 42,
                  boxShadow: "0 18px 48px rgba(31,107,235,0.25)",
                  flexShrink: 0,
                }}
              >
                📖
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 900, color: "#e6edf3", margin: "0 0 8px", letterSpacing: "-0.04em" }}>
                  Bibliothèques
                </h1>
                <p style={{ fontSize: isMobile ? 13 : 16, color: "#c9d1d9", lineHeight: 1.65, maxWidth: 560, margin: 0 }}>
                  Accédez à l’ensemble des ressources pédagogiques, techniques et professionnelles du <span style={{ color: "#58a6ff", fontWeight: 800 }}>BTS CPI</span>.
                </p>
              </div>
            </div>

            <div
              style={{
                width: isMobile ? "100%" : 610,
                maxWidth: "100%",
                height: 48,
                borderRadius: 10,
                background: "rgba(22,27,34,0.82)",
                border: "1px solid #30363d",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                marginBottom: 32,
                backdropFilter: "blur(10px)",
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un livre, un composant, un site..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e6edf3", fontSize: 14 }}
              />
              <span style={{ color: "#c9d1d9", fontSize: 18 }}>⌕</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 14 }}>
              {quickCards.map((card) => (
                <div
                  key={card.title}
                  style={{
                    minHeight: 96,
                    borderRadius: 12,
                    background: "linear-gradient(180deg, rgba(22,27,34,0.86), rgba(13,17,23,0.86))",
                    border: "1px solid #30363d",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 13,
                      background: card.bg,
                      border: `1px solid ${card.color}55`,
                      color: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 34,
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, lineHeight: 1.3, fontWeight: 800, margin: "0 0 6px", color: "#e6edf3" }}>{card.title}</h3>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#c9d1d9", lineHeight: 1 }}>{card.count}</div>
                    <div style={{ fontSize: 12, color: "#8b949e", marginTop: 3 }}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1.08fr", gap: 16, marginBottom: 16 }}>
          <section style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#e6edf3" }}>
                Sites recommandés <span style={{ fontSize: 12, color: "#8b949e", fontWeight: 500 }}>(ordre alphabétique)</span>
              </h2>
              <button style={outlineButtonStyle}>Voir tous les sites</button>
            </div>

            <div style={{ overflowX: "auto", border: "1px solid #30363d", borderRadius: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
                <thead>
                  <tr style={{ background: "#111820" }}>
                    <th style={thStyle}>Site</th>
                    <th style={thStyle}>Description</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Accès</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSites.map((site) => (
                    <tr key={site.name}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={siteLogoStyle}>{site.logo}</div>
                          <strong style={{ color: "#e6edf3", fontSize: 13 }}>{highlight(site.name, search)}</strong>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: "#8b949e", fontSize: 12, lineHeight: 1.5 }}>{highlight(site.description, search)}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <a href={site.url} target="_blank" rel="noreferrer" style={visitButtonStyle}>Visiter ↗</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#e6edf3" }}>Livres et documents PDF</h2>
              <button style={outlineButtonStyle}>Voir tous les documents</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
              {pdfDocuments.map((doc) => (
                <div key={doc.title} style={pdfCardStyle}>
                  <div style={{ height: 158, borderRadius: 10, background: "linear-gradient(160deg, #2b333d, #10151b)", padding: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <div style={{ width: 92, height: 128, background: doc.cover, color: "#111820", borderRadius: 6, padding: 10, boxShadow: "0 20px 34px rgba(0,0,0,0.35)", transform: "rotate(-4deg)", position: "relative" }}>
                      <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.05 }}>{doc.title}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, marginTop: 5, opacity: 0.75 }}>{doc.subtitle}</div>
                      <span style={{ position: "absolute", left: -8, bottom: 10, background: "#da3633", color: "#fff", padding: "4px 5px", borderRadius: 4, fontSize: 9, fontWeight: 900 }}>PDF</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#c9d1d9", lineHeight: 1.55, marginBottom: 10 }}>
                    {doc.pages} pages<br />{doc.size}
                  </div>
                  <button style={{ ...visitButtonStyle, width: "100%" }}>Télécharger ↓</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 19, fontWeight: 850, margin: 0, color: "#e6edf3" }}>Bibliothèques CAO - Pièces mécaniques</h2>
            <button style={outlineButtonStyle}>Voir toutes les pièces⌄</button>
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 4 }}>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: `1px solid ${activeFilter === filter ? "#1f6feb" : "#30363d"}`,
                  background: activeFilter === filter ? "#1f6feb" : "transparent",
                  color: activeFilter === filter ? "#fff" : "#8b949e",
                  fontSize: 12,
                  fontWeight: 650,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(4, 1fr)" : "repeat(8, 1fr)", gap: 12 }}>
            {filteredParts.map((part) => (
              <article key={part.title} style={partCardStyle}>
                <div style={{ height: 112, borderRadius: 10, background: "radial-gradient(circle at 50% 42%, rgba(201,209,217,0.26), transparent 28%), linear-gradient(145deg,#222b34,#0f141a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9d1d9", fontSize: part.icon.length > 2 ? 38 : 58, textShadow: "0 14px 26px rgba(0,0,0,0.45)", marginBottom: 12 }}>
                  {part.icon}
                </div>
                <h3 style={{ fontSize: 13, color: "#e6edf3", fontWeight: 800, margin: "0 0 7px", minHeight: 32, lineHeight: 1.25 }}>{highlight(part.title, search)}</h3>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                  {part.formats.map((format) => (
                    <span key={format} style={{ fontSize: 9, color: "#8b949e", border: "1px solid #30363d", borderRadius: 4, padding: "2px 5px", background: "#111820" }}>{format}</span>
                  ))}
                </div>
                <button title="Télécharger" style={{ position: "absolute", right: 9, bottom: 9, width: 30, height: 30, borderRadius: 7, background: "rgba(31,107,235,0.16)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.5)", cursor: "pointer", fontSize: 16 }}>↓</button>
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 0, background: "linear-gradient(180deg, #161b22, #111820)", border: "1px solid #21262d", borderRadius: 14, overflow: "hidden" }}>
          {[
            { icon: "📄", value: "125", label: "Documents PDF", color: "#58a6ff" },
            { icon: "🧊", value: "350+", label: "Modèles CAO", color: "#3fb950" },
            { icon: "🌐", value: "42", label: "Sites recommandés", color: "#9d95e8" },
            { icon: "🔄", value: "", label: "Ressources mises à jour régulièrement", color: "#e07b39" },
          ].map((stat, index) => (
            <div key={index} style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 18, borderRight: !isMobile && index < 3 ? "1px solid #30363d" : "none", borderBottom: isMobile && index < 3 ? "1px solid #30363d" : "none" }}>
              <div style={{ fontSize: 34, color: stat.color }}>{stat.icon}</div>
              <div>
                {stat.value && <div style={{ fontSize: 22, fontWeight: 900, color: "#e6edf3", lineHeight: 1 }}>{stat.value}</div>}
                <div style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.45 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px 14px",
  color: "#8b949e",
  fontSize: 12,
  fontWeight: 800,
  borderBottom: "1px solid #30363d",
};

const tdStyle = {
  padding: "10px 14px",
  borderBottom: "1px solid #21262d",
};

const siteLogoStyle = {
  width: 26,
  height: 26,
  borderRadius: 7,
  background: "linear-gradient(145deg, rgba(88,166,255,0.24), rgba(31,107,235,0.12))",
  border: "1px solid rgba(88,166,255,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#e6edf3",
  fontSize: 10,
  fontWeight: 900,
  flexShrink: 0,
};

const outlineButtonStyle = {
  padding: "7px 14px",
  borderRadius: 8,
  background: "transparent",
  border: "1px solid rgba(88,166,255,0.5)",
  color: "#58a6ff",
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const visitButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 7,
  background: "rgba(31,107,235,0.14)",
  border: "1px solid rgba(88,166,255,0.45)",
  color: "#58a6ff",
  fontSize: 12,
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
};

const pdfCardStyle = {
  borderRadius: 12,
  background: "#111820",
  border: "1px solid #30363d",
  padding: 10,
  minWidth: 0,
};

const partCardStyle = {
  position: "relative",
  borderRadius: 12,
  background: "linear-gradient(180deg, #1a222b, #111820)",
  border: "1px solid #30363d",
  padding: 10,
  minHeight: 208,
  overflow: "hidden",
};
