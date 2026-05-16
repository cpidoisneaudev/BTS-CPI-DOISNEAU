'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = async () => {
    await signOut(auth);
    document.cookie = 'session=; path=/; max-age=0';
    setUser(null);
    setUserData(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Vérifie que le token est valide en le rafraîchissant
          await firebaseUser.getIdToken(true);

          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            setUser(firebaseUser);
            setUserData(null);
          } else {
            const data = userSnap.data();

            // Si le compte est expiré ou désactivé → déconnexion auto
            if (data.statut === 'expiré') {
              await clearSession();
              return;
            }

            setUser(firebaseUser);
            setUserData(data);

            // Rafraîchir le cookie de session avec le nouveau token
            const token = await firebaseUser.getIdToken();
            document.cookie = `session=${token}; path=/; max-age=86400; SameSite=Strict`;
          }
        } catch (err) {
          // Token invalide ou expiré → nettoyage automatique
          console.error('Token invalide, déconnexion automatique', err);
          await clearSession();
          return;
        }
      } else {
        setUser(null);
        setUserData(null);
        // Nettoyer le cookie si plus de session Firebase
        document.cookie = 'session=; path=/; max-age=0';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    document.cookie = 'session=; path=/; max-age=0';
    setUser(null);
    setUserData(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);