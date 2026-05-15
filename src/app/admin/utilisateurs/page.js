'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UtilisateursPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('TOUS');

  // Protection — admin uniquement
  useEffect(() => {
    if (!loading && userData?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  // Récupérer tous les utilisateurs
  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUtilisateurs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setChargement(false);
      }
    };
    if (userData?.role === 'ADMIN') fetchUtilisateurs();
  }, [userData]);

  // Changer le rôle
  const changerRole = async (uid, nouveauRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: nouveauRole });
      setUtilisateurs(utilisateurs.map(u =>
        u.id === uid ? { ...u, role: nouveauRole } : u
      ));
    } catch (err) {
      console.error(err);
    }
  };

  // Changer le statut
  const changerStatut = async (uid, nouveauStatut) => {
    try {
      await updateDoc(doc(db, 'users', uid), { statut: nouveauStatut });
      setUtilisateurs(utilisateurs.map(u =>
        u.id === uid ? { ...u, statut: nouveauStatut } : u
      ));
    } catch (err) {
      console.error(err);
    }
  };

  // Supprimer un utilisateur
  const supprimerUtilisateur = async (uid) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUtilisateurs(utilisateurs.filter(u => u.id !== uid));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrage
  const utilisateursFiltres = utilisateurs.filter(u => {
    if (filtre === 'TOUS') return true;
    return u.role === filtre;
  });

  if (loading || chargement) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <button
          onClick={() => router.push('/dashboard')}
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm mb-4"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-medium text-[#e6edf3] mb-2">
          Gestion des utilisateurs
        </h1>
        <p className="text-[#8b949e] text-sm mb-8">
          {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''} au total
        </p>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['TOUS', 'ETUDIANT', 'PROF', 'ADMIN'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                filtre === f
                  ? 'bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]'
                  : 'bg-[#161b22] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]'
              }`}
            >
              {f === 'TOUS' ? '👥 Tous' :
               f === 'ETUDIANT' ? '🎓 Étudiants' :
               f === 'PROF' ? '👨‍🏫 Professeurs' : '⚙️ Admins'}
              {' '}
              ({utilisateurs.filter(u => f === 'TOUS' ? true : u.role === f).length})
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="flex flex-col gap-3">
          {utilisateursFiltres.map((u) => (
            <div
              key={u.id}
              className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              {/* Infos */}
              <div className="flex items-center gap-4">
                {u.photo ? (
                  <Image
                    src={u.photo}
                    alt={u.nom || 'Avatar'}
                    width={40}
                    height={40}
                    className="rounded-full border border-[#21262d]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#00b4d8] flex items-center justify-center text-[#0d1117] font-bold text-sm">
                    {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#e6edf3]">
                    {u.prenom} {u.nom}
                  </p>
                  <p className="text-xs text-[#8b949e]">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Statut */}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      u.statut === 'actif'
                        ? 'bg-green-500/10 text-green-400'
                        : u.statut === 'en_attente'
                        ? 'bg-[#e07b39]/10 text-[#e07b39]'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {u.statut === 'actif' ? '✅ Actif' :
                       u.statut === 'en_attente' ? '⏳ En attente' : '❌ Expiré'}
                    </span>
                    {/* Promotion */}
                    {u.promotion && (
                      <span className="text-xs bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded">
                        {u.promotion === '1ere' ? '1ère année' : '2ème année'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">

                {/* Changer rôle */}
                <select
                  value={u.role}
                  onChange={(e) => changerRole(u.id, e.target.value)}
                  className="bg-[#0d1117] border border-[#21262d] text-[#e6edf3] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#00b4d8] transition-colors"
                >
                  <option value="ETUDIANT">🎓 Étudiant</option>
                  <option value="PROF">👨‍🏫 Professeur</option>
                  <option value="ADMIN">⚙️ Admin</option>
                </select>

                {/* Activer / Désactiver */}
                {u.statut === 'actif' ? (
                  <button
                    onClick={() => changerStatut(u.id, 'expiré')}
                    className="text-xs bg-[#e07b39]/10 text-[#e07b39] border border-[#e07b39]/30 px-3 py-2 rounded-lg hover:bg-[#e07b39]/20 transition-colors"
                  >
                    Désactiver
                  </button>
                ) : (
                  <button
                    onClick={() => changerStatut(u.id, 'actif')}
                    className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    Activer
                  </button>
                )}

                {/* Supprimer */}
                <button
                  onClick={() => supprimerUtilisateur(u.id)}
                  className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  🗑️
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}