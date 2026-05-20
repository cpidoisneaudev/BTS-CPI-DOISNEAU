"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useSidebar } from "@/lib/SidebarContext";
import LogicielsSidebar from "@/components/LogicielsSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ALWAYS_PUBLIC = ["/", "/contact", "/login", "/inscription", "/reset-password"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { user, userData } = useAuth();
  const { width } = useSidebar();

  const isPublic = ALWAYS_PUBLIC.some(r =>
    pathname === r || pathname.startsWith(r + "/")
  );
  const showSidebar = user && userData && !isPublic;

  if (!showSidebar) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", overflowX: "hidden" }}>
      {/* Navbar full width fixe en haut */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        <Navbar />
      </div>

      {/* Sous la navbar */}
      <div style={{
        display: "flex",
        flex: 1,
        marginTop: 65,
      }}>
        {/* Sidebar fixe */}
        <div style={{
          position: "fixed",
          top: 65,
          left: 0,
          height: "calc(100vh - 65px)",
          width: width,
          zIndex: 40,
          transition: "width 0.22s ease",
        }}>
          <LogicielsSidebar />
        </div>

        {/* ✅ FIX : width calculée explicitement, overflow caché, min-width: 0 */}
        <div style={{
          marginLeft: width,
          flex: 1,
          minWidth: 0,                    // ← empêche le flex item de déborder
          width: `calc(100vw - ${width})`, // ← largeur explicite = viewport - sidebar
          maxWidth: `calc(100vw - ${width})`, // ← plafond strict
          overflowX: "hidden",            // ← coupe tout ce qui dépasse
          minHeight: "calc(100vh - 65px)",
          transition: "margin-left 0.22s ease, width 0.22s ease, max-width 0.22s ease",
          display: "flex",
          flexDirection: "column",
        }}>
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}