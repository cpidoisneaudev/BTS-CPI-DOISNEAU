"use client";

import { useEffect } from "react";
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
  const { width, setCollapsed } = useSidebar();

  const isPublic = ALWAYS_PUBLIC.some(r =>
    pathname === r || pathname.startsWith(r + "/")
  );
  const showSidebar = user && userData && !isPublic;

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, [pathname]);

  if (!showSidebar) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      overflowX: "hidden",
      backgroundColor: "var(--bg-primary)",
    }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        <Navbar />
      </div>

      <div style={{ display: "flex", flex: 1, marginTop: 65 }}>
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

        <div style={{
          marginLeft: width,
          flex: 1,
          minWidth: 0,
          width: `calc(100vw - ${width})`,
          maxWidth: `calc(100vw - ${width})`,
          overflowX: "hidden",
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