"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext({});

// ✅ Vérifie si un compte a plus de 2 ans
function isCompteExpire(dateCreation) {
  if (!dateCreation) return false;
  const creation = dateCreation?.toDate ? dateCreation.toDate() : new Date(dateCreation);
  const deuxAns = new Date();
  deuxAns.setFullYear(deuxAns.getFullYear() - 2);
  return creation < deuxAns;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statutBloque, setStatutBloque] = useState(null); // "en_attente" | "expiré" | null

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

  useEffect(() => {
    if (!user) return;
    const handleOffline = () => setOffline(user.uid);
    window.addEventListener("beforeunload", handleOffline);
    return () => window.removeEventListener("beforeunload", handleOffline);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

            // ✅ Vérification expiration 2 ans — ADMINS exclus
            if (data.role !== "ADMIN" && data.statut === "actif" && isCompteExpire(data.dateCreation)) {
              console.log(`Compte ${firebaseUser.email} expiré après 2 ans — désactivation automatique`);
              await updateDoc(userRef, {
                statut: "expiré",
                lastSeen: serverTimestamp(),
                isOnline: false,
              });
              await clearSession();
              return;
            }

            if (data.statut === "expiré") {
              await clearSession();
              return;
            }

            if (data.statut === "en_attente") {
              setUser(firebaseUser);
              setUserData(data);
              setStatutBloque("en_attente");
              document.cookie = "session=; path=/; max-age=0";
              setLoading(false);
              return;
            }

            setUser(firebaseUser);
            setUserData(data);
            setStatutBloque(null);
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
        setStatutBloque(null);
        document.cookie = "session=; path=/; max-age=0";
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      if (user) await setOffline(user.uid);
    } catch (err) {
      console.error("Erreur setOffline", err);
    }

    setUser(null);
    setUserData(null);
    setStatutBloque(null);
    document.cookie = "session=; path=/; max-age=0";

    try {
      await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Erreur logout", err);
    }

    window.location.href = "/";
  };

  if (loading) {
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

  if (statutBloque === "en_attente") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-[#EF9F27]/10 border border-[#EF9F27]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-xl font-medium text-[#e6edf3] mb-3">
            Compte en attente de validation
          </h1>
          <p className="text-[#8b949e] text-sm leading-relaxed mb-2">
            Votre inscription a bien été reçue.
          </p>
          <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
            L&apos;administrateur doit valider votre compte avant que vous puissiez accéder à la plateforme.
            Vous recevrez un email dès que votre accès est activé.
          </p>
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-[#8b949e]">Compte connecté</p>
            <p className="text-sm text-[#00b4d8] font-medium mt-1">{user?.email}</p>
            {userData?.role && (
              <p className="text-xs text-[#8b949e] mt-2">
                Rôle demandé : <span className="text-[#e6edf3]">{userData.role}</span>
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full border border-[#21262d] text-[#8b949e] text-sm py-3 rounded-lg hover:border-[#30363d] hover:text-[#e6edf3] transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, statutBloque }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);