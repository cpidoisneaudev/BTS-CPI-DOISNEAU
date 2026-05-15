'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ValidationPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);

  // Protection — admin uniquement
  useEffect(() => {
    if (!loading && userData?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  // Récupérer les comptes en attente
  useEffect(() => {
    const fetchComptes = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('statut', '==', 'en_attente')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComptes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setChargement(false);
      }
    };
    if (userData?.role === 'ADMIN') fetchComptes();
  }, [userData]);

  // Valider un compte
  const validerCompte = async (uid, role) => {
    try {
      const userRef = doc(db, 'users', uid);
      const dateExpiration = new Date();
      dateExpiration.setFullYear(dateExpiration.getFullYear() + 2);
      await updateDoc(userRef, {
        statut: 'actif',
        role: role,
        dateExpiration: dateExpiration,
      });
      setComptes(comptes.filter(c => c.id !== uid));
    } catch (err) {
      console.error(err);
    }
  };

  // Refuser un compte — on met statut "refusé" au lieu de supprimer
  const refuserCompte = async (uid) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        statut: 'refusé',
        dateRefus: new Date(),
      });
      setComptes(comptes.filter(c => c.id !== uid));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || chargement) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm"
          >
            ← Retour
          </button>
        </div>
        <h1 className="text-2xl font-medium text-[#e6edf3] mb-2">
          Comptes en attente
        </h1>
        <p className="text-[#8b949e] text-sm mb-8">
          {comptes.length} compte{comptes.length > 1 ? 's' : ''} en attente de validation
        </p>

        {/* Liste vide */}
        {comptes.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-[#8b949e] text-sm">
              Aucun compte en attente de validation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {comptes.map((compte) => (
              <div
                key={compte.id}
                className="bg-[#161b22] border border-[#21262d] rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">

                  {/* Infos utilisateur */}
                  <div className="flex items-center gap-4">
                    {compte.photo ? (
                      <Image
                        src={compte.photo}
                        alt={compte.nom}
                        width={48}
                        height={48}
                        className="rounded-full border border-[#21262d]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#00b4d8] flex items-center justify-center text-[#0d1117] font-bold">
                        {compte.prenom?.charAt(0)}{compte.nom?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#e6edf3]">
                        {compte.prenom} {compte.nom}
                      </p>
                      <p className="text-xs text-[#8b949e]">{compte.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-[#00b4d8]/10 text-[#00b4d8] px-2 py-0.5 rounded">
                          {compte.role === 'ETUDIANT' ? '🎓 Étudiant' : '👨‍🏫 Professeur'}
                        </span>
                        {compte.promotion && (
                          <span className="text-xs bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded">
                            {compte.promotion === '1ere' ? '1ère année' : '2ème année'}
                          </span>
                        )}
                        <span className="text-xs text-[#8b949e]">
                          Inscrit le {compte.dateCreation?.toDate?.()?.toLocaleDateString('fr-FR') || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => validerCompte(compte.id, compte.role)}
                      className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                        compte.role === 'PROF'
                          ? 'bg-[#9d95e8] text-white hover:bg-[#8b82d4]'
                          : 'bg-[#00b4d8] text-[#0d1117] hover:bg-[#0099bb]'
                      }`}
                    >
                      {compte.role === 'PROF' ? '👨‍🏫 Valider Professeur' : '✅ Valider Étudiant'}
                    </button>

                    <button
                      onClick={() => refuserCompte(compte.id)}
                      className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      ❌ Refuser
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}