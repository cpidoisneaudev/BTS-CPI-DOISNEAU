'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const MATIERES = {
  comportement: 'Comportement mécanique',
  construction: 'Construction mécanique',
  conception: 'Conception mécanique',
  industrialisation: 'Industrialisation',
};

const TYPES = {
  cours: '📖 Cours',
  td: '✏️ TD',
  tp: '🔬 TP',
  examen: '📝 Examen',
  projet: '🏆 Ancien projet',
};

export default function MesCoursPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const [cours, setCours] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('TOUS');

  useEffect(() => {
    if (!loading && userData?.role !== 'PROF' && userData?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'cours'), where('profId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => b.dateCreation?.toMillis() - a.dateCreation?.toMillis());
      setCours(data);
      setChargement(false);
    });
    return () => unsubscribe();
  }, [user]);

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    try {
      await deleteDoc(doc(db, 'cours', id));
    } catch (err) {
      console.error(err);
    }
  };

  const getViewerUrl = (url, format) => {
    if (format === 'pdf') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const coursFiltres = cours.filter(item => filtre === 'TOUS' || item.matiere === filtre);

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

        <button onClick={() => router.push('/dashboard')} className="text-[#8b949e] hover:text-[#e6edf3] text-sm mb-4">
          ← Retour
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-[#e6edf3] mb-1">Mes ressources</h1>
            <p className="text-[#8b949e] text-sm">{cours.length} ressource{cours.length > 1 ? 's' : ''} publiée{cours.length > 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/dashboard/cours/ajouter"
            className="bg-[#00b4d8] text-[#0d1117] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0099bb] transition-colors"
          >
            ➕ Ajouter
          </Link>
        </div>

        {success === 'ajout' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-green-400 text-sm">✅ Ressource publiée avec succès !</p>
          </div>
        )}

        {/* Filtres matières */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['TOUS', ...Object.keys(MATIERES)].map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                filtre === f
                  ? 'bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]'
                  : 'bg-[#161b22] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]'
              }`}
            >
              {f === 'TOUS' ? `Tous (${cours.length})` : `${MATIERES[f]} (${cours.filter(item => item.matiere === f).length})`}
            </button>
          ))}
        </div>

        {/* Liste */}
        {coursFiltres.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-12 text-center">
            <p className="text-3xl mb-3">📚</p>
            <p className="text-[#8b949e] text-sm">Aucune ressource publiée pour le moment.</p>
            <Link href="/dashboard/cours/ajouter" className="text-[#00b4d8] text-sm hover:underline mt-2 inline-block">
              Ajouter une ressource →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {coursFiltres.map((item) => (
              <div key={item.id} className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#0d1117] rounded-lg flex items-center justify-center text-xl border border-[#21262d]">
                    {item.sourceType === 'youtube' ? '▶️' : '📄'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e6edf3]">{item.titre}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/20 px-2 py-0.5 rounded">
                        {MATIERES[item.matiere]}
                      </span>
                      <span className="text-xs bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded">
                        {TYPES[item.type]}
                      </span>
                      {item.fileFormat && (
                        <span className="text-xs text-[#8b949e]">
                          {item.fileFormat.toUpperCase()} — {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                      <span className="text-xs text-[#8b949e]">
                        {item.dateCreation?.toDate?.()?.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bouton Voir */}
                  {item.fileUrl && (
                    <a
                      href={getViewerUrl(item.fileUrl, item.fileFormat)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/30 px-3 py-2 rounded-lg hover:bg-[#00b4d8]/20 transition-colors"
                    >
                      👁️ Voir
                    </a>
                  )}
                  {/* Bouton Télécharger */}
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-[#21262d] text-[#8b949e] border border-[#21262d] px-3 py-2 rounded-lg hover:border-[#8b949e] hover:text-[#e6edf3] transition-colors"
                    >
                      ⬇️
                    </a>
                  )}
                  {/* Bouton YouTube */}
                  {item.youtubeId && (
                    <a
                      href={`https://youtube.com/watch?v=${item.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      ▶️ YouTube
                    </a>
                  )}
                  {/* Bouton Supprimer */}
                  <button
                    onClick={() => supprimer(item.id)}
                    className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}