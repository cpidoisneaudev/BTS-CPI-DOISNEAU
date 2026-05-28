// /dashboard/calendrier/page.js — Calendrier CPI Doisneau
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

const CATEGORY_STYLES = {
  cours: {
    label: "Cours / TP",
    color: "#1f6feb",
    bg: "rgba(31,107,235,0.22)",
    border: "rgba(31,107,235,0.45)",
    icon: "📘",
  },
  echeance: {
    label: "Échéances",
    color: "#f0883e",
    bg: "rgba(240,136,62,0.22)",
    border: "rgba(240,136,62,0.45)",
    icon: "⏰",
  },
  evaluation: {
    label: "Évaluations",
    color: "#a371f7",
    bg: "rgba(163,113,247,0.22)",
    border: "rgba(163,113,247,0.45)",
    icon: "📝",
  },
  reunion: {
    label: "Réunions",
    color: "#3fb950",
    bg: "rgba(63,185,80,0.20)",
    border: "rgba(63,185,80,0.42)",
    icon: "👥",
  },
  stage: {
    label: "Stages",
    color: "#f85149",
    bg: "rgba(248,81,73,0.20)",
    border: "rgba(248,81,73,0.42)",
    icon: "🏭",
  },
};

const SAMPLE_EVENTS = [
  { id: 1, title: "Cours CAO", date: "2025-05-05", start: "08:30", end: "10:30", category: "cours", location: "Salle B223", project: "Projet final U51" },
  { id: 2, title: "Réunion équipe", date: "2025-05-05", start: "14:00", end: "15:00", category: "reunion", location: "Salle projet", project: "Suivi projets" },
  { id: 3, title: "Échéance projet", date: "2025-05-06", start: "23:59", end: "23:59", category: "echeance", location: "Dépôt en ligne", project: "Dossier intermédiaire" },
  { id: 4, title: "TP Fabrication", date: "2025-05-07", start: "09:00", end: "12:00", category: "cours", location: "Atelier", project: "Prototypage" },
  { id: 5, title: "Soutenance projet", date: "2025-05-08", start: "13:30", end: "15:30", category: "evaluation", location: "Salle B223", project: "Projet U51" },
  { id: 6, title: "Contrôle qualité", date: "2025-05-09", start: "10:00", end: "11:00", category: "reunion", location: "Atelier", project: "CPRP" },
  { id: 7, title: "Rapport de stage", date: "2025-05-11", start: "23:59", end: "23:59", category: "stage", location: "Dépôt PDF", project: "Stage" },
  { id: 8, title: "Cours Résistance", date: "2025-05-12", start: "08:30", end: "10:30", category: "cours", location: "Salle B223", project: "Dimensionnement" },
  { id: 9, title: "Avancement projet", date: "2025-05-12", start: "16:00", end: "17:00", category: "echeance", location: "Espace projet", project: "Tous projets" },
  { id: 10, title: "Réunion CPI/CPRP", date: "2025-05-13", start: "11:00", end: "12:00", category: "reunion", location: "Atelier CPRP", project: "Collaboratif CPRP" },
  { id: 11, title: "TP Usinage", date: "2025-05-14", start: "09:00", end: "12:00", category: "cours", location: "Atelier", project: "Fabrication" },
  { id: 12, title: "Échéance dossier", date: "2025-05-15", start: "23:59", end: "23:59", category: "echeance", location: "Dépôt en ligne", project: "Dossier technique" },
  { id: 13, title: "Présentation orale", date: "2025-05-16", start: "14:00", end: "16:00", category: "evaluation", location: "Amphithéâtre", project: "Projet final" },
  { id: 14, title: "Cours Mécanique", date: "2025-05-19", start: "08:30", end: "10:30", category: "cours", location: "Salle B223", project: "Mécanismes" },
  { id: 15, title: "Point projet", date: "2025-05-20", start: "15:30", end: "16:30", category: "reunion", location: "Salle projet", project: "Suivi groupe" },
  { id: 16, title: "TP Impression 3D", date: "2025-05-21", start: "09:00", end: "12:00", category: "cours", location: "FabLab", project: "Prototypage" },
  { id: 17, title: "Échéance maquette", date: "2025-05-22", start: "23:59", end: "23:59", category: "echeance", location: "Dépôt CAO", project: "Maquette 3D" },
  { id: 18, title: "Évaluation écrite", date: "2025-05-23", start: "10:00", end: "11:00", category: "evaluation", location: "Salle B223", project: "Savoirs associés" },
  { id: 19, title: "Remise finale", date: "2025-05-25", start: "23:59", end: "23:59", category: "stage", location: "Dépôt final", project: "Stage" },
  { id: 20, title: "Cours Industrialisation", date: "2025-05-26", start: "08:30", end: "10:30", category: "cours", location: "Salle B223", project: "U61" },
  { id: 21, title: "Réunion équipe", date: "2025-05-27", start: "14:00", end: "15:30", category: "reunion", location: "Salle projet", project: "Projet final" },
  { id: 22, title: "TP Assemblage", date: "2025-05-28", start: "09:00", end: "12:00", category: "cours", location: "Atelier 2", project: "Assemblage" },
  { id: 23, title: "Bilan projet", date: "2025-05-29", start: "16:00", end: "17:00", category: "echeance", location: "Salle de réunion", project: "Bilan" },
  { id: 24, title: "Soutenance finale", date: "2025-05-30", start: "13:00", end: "17:00", category: "evaluation", location: "Amphithéâtre", project: "U51" },
];

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const mondayIndex = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayIndex);
  return start;
}

function getMonthDays(year, month) {
  const start = startOfMonthGrid(year, month);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function CardStat({ icon, title, value, subtitle, color }) {
  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(22,27,34,0.95), rgba(13,17,23,0.9))",
      border: "1px solid #21262d",
      borderRadius: 14,
      padding: 18,
      display: "flex",
      gap: 14,
      alignItems: "center",
      minHeight: 82,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `${color}22`,
        border: `1px solid ${color}44`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#e6edf3", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: "#e6edf3", marginTop: 5 }}>{title}</div>
        <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function EventPill({ event, compact = false }) {
  const st = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.cours;
  return (
    <div
      title={`${event.title} • ${event.start} - ${event.end}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        background: st.bg,
        border: `1px solid ${st.border}`,
        borderLeft: `3px solid ${st.color}`,
        color: "#e6edf3",
        borderRadius: 6,
        padding: compact ? "4px 6px" : "5px 8px",
        fontSize: compact ? 10 : 11,
        minHeight: 22,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</span>
      {!compact && <span style={{ color: "#c9d1d9", opacity: 0.9, flexShrink: 0 }}>{event.start}</span>}
    </div>
  );
}

function MiniCalendar({ currentDate, selectedDate, setSelectedDate }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);
  const monthName = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;

  return (
    <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button style={miniBtn}>‹</button>
        <div style={{ fontSize: 13, color: "#e6edf3", fontWeight: 800, textTransform: "capitalize" }}>{monthName}</div>
        <button style={miniBtn}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#8b949e", fontWeight: 700 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {days.map((d) => {
          const key = formatDateKey(d);
          const isCurrentMonth = d.getMonth() === month;
          const isSelected = selectedKey === key;
          const isToday = key === "2025-05-28";
          return (
            <button key={key} onClick={() => setSelectedDate(d)} style={{
              height: 28,
              borderRadius: "50%",
              border: isSelected ? "1px solid #1f6feb" : "1px solid transparent",
              background: isSelected || isToday ? "#1f6feb" : "transparent",
              color: isSelected || isToday ? "#fff" : isCurrentMonth ? "#c9d1d9" : "#484f58",
              fontSize: 11,
              cursor: "pointer",
              fontWeight: isSelected || isToday ? 800 : 500,
            }}>{d.getDate()}</button>
          );
        })}
      </div>
    </div>
  );
}

const miniBtn = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: "1px solid #30363d",
  background: "#161b22",
  color: "#8b949e",
  cursor: "pointer",
};

export default function CalendrierPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 28));
  const [view, setView] = useState("mois");
  const [activeCats, setActiveCats] = useState({ cours: true, echeance: true, evaluation: true, reunion: true, stage: true });

  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user, router]);

  const monthDays = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);

  const filteredEvents = useMemo(
    () => SAMPLE_EVENTS.filter(e => activeCats[e.category]),
    [activeCats]
  );

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filteredEvents]);

  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.date >= "2025-05-28")
      .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))
      .slice(0, 4);
  }, [filteredEvents]);

  const deadlines = useMemo(() => {
    return SAMPLE_EVENTS
      .filter(e => ["echeance", "stage"].includes(e.category))
      .slice(0, 4);
  }, []);

  const stats = {
    events: SAMPLE_EVENTS.length,
    deadlines: SAMPLE_EVENTS.filter(e => e.category === "echeance" || e.category === "stage").length,
    evals: SAMPLE_EVENTS.filter(e => e.category === "evaluation").length,
    meetings: SAMPLE_EVENTS.filter(e => e.category === "reunion").length,
  };

  const monthLabel = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const goPrevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date(2025, 4, 1));
    setSelectedDate(new Date(2025, 4, 28));
  };

  if (!user || !userData) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "sans-serif", overflowX: "hidden" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "18px 12px" : "28px 24px", boxSizing: "border-box" }}>

        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(31,107,235,0.18)", border: "1px solid rgba(31,107,235,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
              📅
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 30, fontWeight: 900, color: "#e6edf3" }}>Calendrier</h1>
              <p style={{ margin: "5px 0 0", color: "#8b949e", fontSize: 13 }}>Vue d’ensemble des événements, échéances et activités BTS CPI</p>
            </div>
          </div>

          <button style={{
            padding: "11px 18px",
            borderRadius: 10,
            background: "#1f6feb",
            border: "none",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(31,107,235,0.28)",
          }}>
            + Ajouter un événement
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          <CardStat icon="📅" title="Événements à venir" value={stats.events} subtitle="Cette semaine" color="#1f6feb" />
          <CardStat icon="🔐" title="Échéances projets" value={stats.deadlines} subtitle="Dans les 30 jours" color="#f0883e" />
          <CardStat icon="✅" title="Évaluations" value={stats.evals} subtitle="À venir" color="#3fb950" />
          <CardStat icon="👥" title="Réunions équipe" value={stats.meetings} subtitle="Cette semaine" color="#a371f7" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 270px", gap: 18, alignItems: "start" }}>
          <main style={{ minWidth: 0 }}>
            <section style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,0.25)" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "linear-gradient(180deg, rgba(22,27,34,0.95), rgba(13,17,23,0.95))" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={goPrevMonth} style={navBtn}>‹</button>
                  <button onClick={goNextMonth} style={navBtn}>›</button>
                  <button onClick={goToday} style={{ ...navBtn, width: "auto", padding: "0 14px", fontSize: 12 }}>Aujourd’hui</button>
                </div>

                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, textTransform: "capitalize", color: "#e6edf3" }}>{monthLabel}</h2>

                <div style={{ display: "flex", gap: 6, background: "#161b22", border: "1px solid #21262d", borderRadius: 9, padding: 4 }}>
                  {[
                    ["mois", "Mois"],
                    ["semaine", "Semaine"],
                    ["jour", "Jour"],
                  ].map(([id, label]) => (
                    <button key={id} onClick={() => setView(id)} style={{
                      padding: "7px 14px",
                      borderRadius: 7,
                      border: "none",
                      background: view === id ? "#1f6feb" : "transparent",
                      color: view === id ? "#fff" : "#c9d1d9",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #30363d" }}>
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => (
                  <div key={day} style={{ padding: "11px 10px", textAlign: "center", color: "#c9d1d9", fontSize: 12, fontWeight: 800, borderRight: day !== "Dim" ? "1px solid #30363d" : "none" }}>{day}</div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {monthDays.map((day, idx) => {
                  const key = formatDateKey(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isSelected = selectedDate && formatDateKey(selectedDate) === key;
                  const dayEvents = eventsByDate[key] || [];
                  return (
                    <div key={key + idx} onClick={() => setSelectedDate(day)} style={{
                      minHeight: isMobile ? 90 : 112,
                      borderRight: (idx + 1) % 7 !== 0 ? "1px solid #21262d" : "none",
                      borderBottom: idx < 35 ? "1px solid #21262d" : "none",
                      padding: 9,
                      background: isSelected ? "rgba(31,107,235,0.08)" : "rgba(13,17,23,0.72)",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{
                          width: 24,
                          height: 24,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          background: key === "2025-05-28" ? "#1f6feb" : "transparent",
                          color: key === "2025-05-28" ? "#fff" : isCurrentMonth ? "#e6edf3" : "#484f58",
                          fontWeight: 800,
                          fontSize: 12,
                        }}>{day.getDate()}</span>
                        {dayEvents.length > 2 && <span style={{ fontSize: 10, color: "#8b949e" }}>+{dayEvents.length - 2}</span>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {dayEvents.slice(0, isMobile ? 1 : 2).map(event => <EventPill key={event.id} event={event} compact={isMobile} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: 14, marginTop: 16 }}>
              <section style={panelStyle}>
                <h3 style={panelTitle}>Prochaines échéances</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                  {deadlines.map((e, i) => {
                    const st = CATEGORY_STYLES[e.category];
                    return (
                      <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: 12, background: "#161b22", border: "1px solid #21262d", borderRadius: 10 }}>
                        <div>
                          <div style={{ color: "#e6edf3", fontWeight: 700, fontSize: 12 }}>{st.icon} {e.title}</div>
                          <div style={{ color: "#8b949e", fontSize: 11, marginTop: 4 }}>{new Date(e.date).toLocaleDateString("fr-FR")} · {e.start}</div>
                        </div>
                        <div style={{ border: `1px solid ${st.border}`, color: st.color, background: st.bg, borderRadius: 8, padding: "6px 8px", fontSize: 12, fontWeight: 900 }}>J-{i + 3}</div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section style={panelStyle}>
                <h3 style={panelTitle}>Statistiques du mois</h3>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 86, height: 86, borderRadius: "50%", background: "conic-gradient(#1f6feb 0 40%, #f0883e 40% 67%, #a371f7 67% 84%, #3fb950 84% 94%, #f85149 94% 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                      <b style={{ color: "#e6edf3", fontSize: 20 }}>{SAMPLE_EVENTS.length}</b>
                      <span style={{ color: "#8b949e", fontSize: 9 }}>Événements</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {Object.entries(CATEGORY_STYLES).map(([key, st]) => {
                      const n = SAMPLE_EVENTS.filter(e => e.category === key).length;
                      return (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#c9d1d9" }}>
                          <span><span style={{ color: st.color }}>●</span> {st.label}</span>
                          <span>{n}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </main>

          <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <MiniCalendar currentDate={currentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

            <section style={panelStyle}>
              <h3 style={panelTitle}>Filtres</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(CATEGORY_STYLES).map(([key, st]) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, color: "#c9d1d9", fontSize: 13, cursor: "pointer" }}>
                    <input type="checkbox" checked={activeCats[key]} onChange={() => setActiveCats(p => ({ ...p, [key]: !p[key] }))} />
                    <span style={{ color: st.color }}>●</span>
                    {st.label}
                  </label>
                ))}
              </div>
              <button onClick={() => setActiveCats({ cours: true, echeance: true, evaluation: true, reunion: true, stage: true })} style={{ marginTop: 16, width: "100%", padding: "9px", borderRadius: 8, border: "1px solid #30363d", background: "transparent", color: "#58a6ff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Tout afficher</button>
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Événements à venir</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {upcomingEvents.map(e => {
                  const st = CATEGORY_STYLES[e.category];
                  return (
                    <div key={e.id} style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 3, borderRadius: 3, background: st.color }} />
                      <div>
                        <div style={{ color: "#e6edf3", fontSize: 13, fontWeight: 800 }}>{e.title}</div>
                        <div style={{ color: "#c9d1d9", fontSize: 11, marginTop: 4 }}>{new Date(e.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {e.start}</div>
                        <div style={{ color: "#8b949e", fontSize: 11, marginTop: 2 }}>{e.location}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button style={{ marginTop: 18, background: "none", border: "none", color: "#58a6ff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Voir tous les événements →</button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

const navBtn = {
  width: 38,
  height: 34,
  borderRadius: 8,
  border: "1px solid #30363d",
  background: "#161b22",
  color: "#c9d1d9",
  fontSize: 16,
  cursor: "pointer",
};

const panelStyle = {
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 14,
  padding: 16,
};

const panelTitle = {
  margin: "0 0 14px",
  color: "#e6edf3",
  fontSize: 16,
  fontWeight: 900,
};
