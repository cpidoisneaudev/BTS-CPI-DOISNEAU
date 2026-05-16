'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
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

  useEffect(() => {
    if (!loading && userData?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  // Écoute en temps réel avec onSnapshot
  useEffect(() => {
    if (userData?.role !== 'ADMIN') return;
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUtilisateurs(data);
      setChargement(false);
    });
    return () => unsubscribe();
  }, [userData]);

  const changerRole = async (uid, nouveauRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: nouveauRole });
    } catch (err) {
      console.error(err);
    }
  };

  const changerStatut = async (uid, nouveauStatut) => {
    try {
      await updateDoc(doc(db, 'users', uid), { statut: nouveauStatut });
    } catch (err) {
      console.error(err);
    }
  };

  const supprimerUtilisateur = async (uid) => {
    if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;
    try {
      const res = await fetch('/api/admin/supprimer-utilisateur', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur serveur');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression : ' + err.message);
    }
  };

  const utilisateursFiltres = utilisateurs.filter(u => {
    if (filtre === 'TOUS') return true;
    if (filtre === 'EN_LIGNE') return u.isOnline === true;
    return u.role === filtre;
  });

  const nbEnLigne = utilisateurs.filter(u => u.isOnline === true).length;

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
        <div className="flex items-center gap-4 mb-8">
          <p className="text-[#8b949e] text-sm">
            {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''} au total
          </p>
          {/* Indicateur en ligne */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            <span className="text-xs text-green-400">{nbEnLigne} en ligne</span>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['TOUS', 'EN_LIGNE', 'ETUDIANT', 'PROF', 'ADMIN'].map((f) => (
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
               f === 'EN_LIGNE' ? '🟢 En ligne' :
               f === 'ETUDIANT' ? '🎓 Étudiants' :
               f === 'PROF' ? '👨‍🏫 Professeurs' : '⚙️ Admins'}
              {' '}
              ({f === 'EN_LIGNE'
                ? nbEnLigne
                : utilisateurs.filter(u => f === 'TOUS' ? true : u.role === f).length})
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
                {/* Avatar avec indicateur en ligne */}
                <div className="relative">
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
                  {/* Point vert si en ligne */}
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161b22] ${
                    u.isOnline ? 'bg-green-400' : 'bg-[#8b949e]'
                  }`}/>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#e6edf3]">
                    {u.prenom} {u.nom}
                  </p>
                  <p className="text-xs text-[#8b949e]">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                    {u.promotion && (
                      <span className="text-xs bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded">
                        {u.promotion === '1ere' ? '1ère année' : '2ème année'}
                      </span>
                    )}
                    {/* Dernière connexion */}
                    {!u.isOnline && u.lastSeen && (
                      <span className="text-xs text-[#8b949e]">
                        Vu {u.lastSeen?.toDate?.()?.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={u.role}
                  onChange={(e) => changerRole(u.id, e.target.value)}
                  className="bg-[#0d1117] border border-[#21262d] text-[#e6edf3] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#00b4d8] transition-colors"
                >
                  <option value="ETUDIANT">🎓 Étudiant</option>
                  <option value="PROF">👨‍🏫 Professeur</option>
                  <option value="ADMIN">⚙️ Admin</option>
                </select>

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