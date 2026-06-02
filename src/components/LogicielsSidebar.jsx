"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/SidebarContext";
import {
  IconLayoutDashboard,
  IconBooks,
  IconUsers,
  IconBriefcase,
  IconTool,
  IconFileText,
  IconCalculator,
  IconMenu2,
  IconSchool,
  IconCalendar,
  IconMessage,
} from "@tabler/icons-react";

// ✅ EN DEHORS du composant principal
const SectionLabel = ({ text, collapsed }) => {
  if (collapsed) return <div style={{ height: 12 }} />;
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "#7d8590",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "16px 14px 6px",
      }}
    >
      {text}
    </div>
  );
};

const NavLink = ({ href, icon: Icon, label, collapsed }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 10,
        padding: collapsed ? "10px 0" : "8px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        cursor: "pointer",
        borderLeft: active ? "2px solid #58a6ff" : "2px solid transparent",
        background: active ? "#1c2128" : "transparent",
        color: active ? "#e6edf3" : "#8b949e",
        fontSize: 13,
        whiteSpace: "nowrap",
        overflow: "hidden",
        transition: "all 0.12s",
        textDecoration: "none",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ marginLeft: 2 }}>{label}</span>}
    </Link>
  );
};

// ✅ Composant principal
export default function LogicielsSidebar() {
  const { collapsed, setCollapsed, width } = useSidebar();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#010409",
        borderRight: "1px solid #21262d",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Toggle */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Ouvrir" : "Réduire"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 14,
          borderBottom: "1px solid #21262d",
          cursor: "pointer",
          color: "#7d8590",
          flexShrink: 0,
        }}
      >
        <IconMenu2 size={20} />
      </div>

      <SectionLabel text="Plateforme CPI" collapsed={collapsed} />
      <NavLink
        href="/dashboard"
        icon={IconLayoutDashboard}
        label="Tableau de bord"
        collapsed={collapsed}
      />
      <NavLink
        href="/dashboard/ressources"
        icon={IconBooks}
        label="Mes ressources"
        collapsed={collapsed}
      />
      <NavLink
        href="/equipe"
        icon={IconUsers}
        label="Équipe"
        collapsed={collapsed}
      />
      <NavLink
        href="/stages"
        icon={IconBriefcase}
        label="Stage"
        collapsed={collapsed}
      />
      <NavLink
        href="/dashboard/projet"
        icon={IconFileText}
        label="Projet"
        collapsed={collapsed}
      />
      <NavLink
        href="/dashboard/calendrier"
        icon={IconCalendar}
        label="Calendrier"
        collapsed={collapsed}
      />
      <NavLink
        href="/messages"
        icon={IconMessage}
        label="Messages"
        collapsed={collapsed}
      />

      <SectionLabel text="Formations" collapsed={collapsed} />
      <NavLink
        href="/logiciels"
        icon={IconSchool}
        label="Tutoriels"
        collapsed={collapsed}
      />

      <SectionLabel text="Ressources" collapsed={collapsed} />
      <NavLink
        href="/bibliotheque"
        icon={IconBooks}
        label="Bibliothèque"
        collapsed={collapsed}
      />
      <NavLink
        href="/ressources?type=TD"
        icon={IconFileText}
        label="Exercices"
        collapsed={collapsed}
      />
      <NavLink
        href="/ressources?type=projet"
        icon={IconTool}
        label="Projets industriels"
        collapsed={collapsed}
      />

      <SectionLabel text="Outils" collapsed={collapsed} />
      <NavLink
        href="/outils"
        icon={IconCalculator}
        label="Calculatrices"
        collapsed={collapsed}
      />

      <div style={{ flex: 1 }} />
    </div>
  );
}
