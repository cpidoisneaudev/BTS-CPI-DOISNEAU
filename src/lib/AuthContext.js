"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const setOnline = async (uid) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        isOnline: true,
        lastSeen: serverTimestamp(),
      });
    } catch (err) {
      console.error("Erreur setOnline", err);
    }
  };

  const setOffline = async (uid) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    } catch (err) {
      console.error("Erreur setOffline", err);
    }
  };

  const clearSession = async () => {
    await signOut(auth);
    document.cookie = "session=; path=/; max-age=0";
    setUser(null);
    setUserData(null);
    window.location.href = "/login";
  };

  // Gérer beforeunload séparément
  useEffect(() => {
    if (!user) return;
    const handleOffline = () => setOffline(user.uid);
    window.addEventListener("beforeunload", handleOffline);
    return () => window.removeEventListener("beforeunload", handleOffline);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (loggingOut) return;

      if (firebaseUser) {
        try {
          await firebaseUser.getIdToken(true);
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            setUser(firebaseUser);
            setUserData(null);
          } else {
            const data = userSnap.data();
            if (data.statut === "expiré") {
              await clearSession();
              return;
            }
            setUser(firebaseUser);
            setUserData(data);
            const token = await firebaseUser.getIdToken();
            document.cookie = `session=${token}; path=/; max-age=86400; SameSite=Strict`;
            await setOnline(firebaseUser.uid);
          }
        } catch (err) {
          console.error("Token invalide, déconnexion automatique", err);
          await clearSession();
          return;
        }
      } else {
        setUser(null);
        setUserData(null);
        document.cookie = "session=; path=/; max-age=0";
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loggingOut]);

  const logout = async () => {
    setLoggingOut(true);
    if (user) await setOffline(user.uid);
    setUser(null);
    setUserData(null);
    await signOut(auth);
    document.cookie = "session=; path=/; max-age=0";
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading || loggingOut) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00b4d8] rounded-md flex items-center justify-center">
              <svg viewBox="0 0 18 18" className="w-5 h-5 fill-[#0d1117]">
                <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" />
              </svg>
            </div>
            <span className="text-[#e6edf3] font-medium text-xl">
              CPI <span className="text-[#00b4d8]">Doisneau</span>
            </span>
          </div>
          <div className="w-6 h-6 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);