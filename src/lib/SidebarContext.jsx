// lib/SidebarContext.jsx

'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  // Initialise collapsed à true par défaut (safe pour SSR)
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    // Sur desktop (≥ 1024px) → ouverte par défaut
    // Sur mobile/tablette (< 1024px) → fermée par défaut
    const isMobile = window.innerWidth < 1024;
    setCollapsed(isMobile);
  }, []); // S'exécute une seule fois au montage

  const width = collapsed ? 52 : 220;

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, width }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}