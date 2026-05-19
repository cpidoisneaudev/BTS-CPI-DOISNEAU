'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const MATIERES = {
  comportement: { label: 'Comportement mécanique', color: '#1D9E75' },
  construction:  { label: 'Construction mécanique',  color: '#378ADD' },
  conception:    { label: 'Conception mécanique',    color: '#7F77DD' },
  industrialisation: { label: 'Industrialisation',   color: '#BA7517' },
};

const TYPES = {
  cours:   { label: 'Cours',         bg: '#E1F5EE', text: '#0F6E56' },
  td:      { label: 'TD',            bg: '#E6F1FB', text: '#185FA5' },
  tp:      { label: 'TP',            bg: '#EEEDFE', text: '#3C3489' },
  examen:  { label: 'Examen',        bg: '#FAEEDA', text: '#854F0B' },
  projet:  { label: 'Ancien projet', bg: '#F1EFE8', text: '#5F5E5A' },
};

export default function MesCoursPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  const [cours, setCours] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [matiere, setMatiere] = useState('comportement');
  const [chapitresOuverts, setChapitresOuverts] = useState({});
  const [selected, setSelected] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [showSuccess, setShowSuccess] = useState(success === 'ajout');

  // Modal renommer chapitre
  const [modalChapitre, setModalChapitre] = useState(null); // { ancienNom, items }
  const [nouveauNom, setNouveauNom] = useState('');
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (!loading && userData?.role !== 'PROF' && userData?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'cours'), where('profId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.chapitre || '').localeCompare(b.chapitre || '') || (a.titre || '').localeCompare(b.titre || ''));
      setCours(data);
      setChargement(false);
    });
    return () => unsub();
  }, [user]);

  const chapitres = useMemo(() => {
    const filtered = cours.filter(c => c.matiere === matiere);
    const grouped = {};
    filtered.forEach(c => {
      const key = c.chapitre?.trim() || '— Sans chapitre';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    });
    return grouped;
  }, [cours, matiere]);

  useEffect(() => {
    const keys = Object.keys(chapitres);
    if (keys.length > 0) {
      setChapitresOuverts({ [keys[0]]: true });
      setSelected(chapitres[keys[0]]?.[0] || null);
    } else {
      setSelected(null);
    }
  }, [matiere]);

  const toggleChapitre = (key) => {
    setChapitresOuverts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const supprimer = async (item) => {
    if (!confirm(`Supprimer "${item.titre}" ?`)) return;
    try {
      await deleteDoc(doc(db, 'cours', item.id));
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const ouvrirModalRenommer = (chapitre, items) => {
    setModalChapitre({ ancienNom: chapitre, items });
    setNouveauNom(chapitre === '— Sans chapitre' ? '' : chapitre);
  };

  const renommerChapitre = async () => {
    if (!modalChapitre) return;
    setRenaming(true);
    try {
      await Promise.all(
        modalChapitre.items.map(item =>
          updateDoc(doc(db, 'cours', item.id), { chapitre: nouveauNom.trim() })
        )
      );
      setModalChapitre(null);
    } catch (err) {
      console.error(err);
    } finally {
      setRenaming(false);
    }
  };

  const supprimerChapitre = async (items) => {
    if (!confirm(`Supprimer les ${items.length} ressource(s) de ce chapitre ?`)) return;
    try {
      await Promise.all(items.map(item => deleteDoc(doc(db, 'cours', item.id))));
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const chapitresFiltres = useMemo(() => {
    if (!recherche) return chapitres;
    const filtered = {};
    Object.entries(chapitres).forEach(([key, items]) => {
      const match = items.filter(i => i.titre?.toLowerCase().includes(recherche.toLowerCase()));
      if (match.length > 0) filtered[key] = match;
    });
    return filtered;
  }, [chapitres, recherche]);

  const totalMatiere = (m) => cours.filter(c => c.matiere === m).length;
  const typeInfo = selected ? (TYPES[selected.type] || TYPES.cours) : null;

  const getViewerContent = () => {
    if (!selected) return null;
    if (selected.sourceType === 'youtube' && selected.youtubeId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${selected.youtubeId}`}
          className="w-full h-full"
          allowFullScreen
          title={selected.titre}
        />
      );
    }
    if (selected.fileUrl) {
      if (selected.fileFormat === 'pdf') {
        return (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(selected.fileUrl)}&embedded=true`}
            className="w-full h-full"
            title={selected.titre}
          />
        );
      }
      if (['jpg','jpeg','png','gif','webp'].includes(selected.fileFormat)) {
        return (
          <div className="w-full h-full flex items-center justify-center p-8">
            <img src={selected.fileUrl} alt={selected.titre} className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center px-8 h-full">
          <div className="w-16 h-16 bg-[#0d1117] rounded-2xl flex items-center justify-center border border-[#21262d]">
            <span className="text-3xl">📄</span>
          </div>
          <p className="text-[#e6edf3] text-sm font-medium">{selected.titre}</p>
          <p className="text-[#8b949e] text-xs">Aperçu non disponible ({selected.fileFormat?.toUpperCase()})</p>
          <a href={selected.fileUrl} download target="_blank" rel="noopener noreferrer"
            className="bg-[#00b4d8] text-[#0d1117] text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#0099bb] transition-colors">
            ⬇️ Télécharger
          </a>
        </div>
      );
    }
    return <div className="flex items-center justify-center h-full text-[#8b949e] text-sm">Aucun contenu</div>;
  };

  if (loading || chargement) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col overflow-hidden">

      {/* Modal renommer chapitre */}
      {modalChapitre && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-base font-medium text-[#e6edf3] mb-1">Renommer le chapitre</h3>
            <p className="text-xs text-[#8b949e] mb-4">
              Toutes les ressources de ce chapitre seront mises à jour ({modalChapitre.items.length} fichier{modalChapitre.items.length > 1 ? 's' : ''})
            </p>
            <input
              type="text"
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
              placeholder="Nouveau nom du chapitre..."
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={renommerChapitre}
                disabled={renaming || !nouveauNom.trim()}
                className="flex-1 bg-[#00b4d8] text-[#0d1117] text-sm font-medium py-2.5 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50"
              >
                {renaming ? 'Mise à jour...' : 'Renommer'}
              </button>
              <button
                onClick={() => setModalChapitre(null)}
                className="flex-1 border border-[#21262d] text-[#8b949e] text-sm py-2.5 rounded-lg hover:border-[#8b949e] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onglets matières */}
      <div className="border-b border-[#21262d] bg-[#0d1117] px-6 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-[#8b949e] hover:text-[#e6edf3] text-sm flex-shrink-0">
              ← Retour
            </button>
            <div className="flex gap-0 overflow-x-auto">
              {Object.entries(MATIERES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { setMatiere(key); setRecherche(''); }}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    matiere === key
                      ? 'border-[#00b4d8] text-[#e6edf3]'
                      : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: val.color }} />
                  {val.label}
                  <span className="text-[10px] bg-[#21262d] text-[#8b949e] px-1.5 py-0.5 rounded">
                    {totalMatiere(key)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bouton ajouter */}
          <Link
            href="/dashboard/cours/ajouter"
            className="flex-shrink-0 bg-[#00b4d8] text-[#0d1117] text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#0099bb] transition-colors mr-0 mb-2"
          >
            ➕ Ajouter une ressource
          </Link>
        </div>
      </div>

      {/* Message succès */}
      {showSuccess && (
        <div className="bg-green-500/10 border-b border-green-500/30 px-6 py-2 flex items-center justify-between flex-shrink-0">
          <p className="text-green-400 text-xs">✅ Ressource publiée avec succès !</p>
          <button onClick={() => setShowSuccess(false)} className="text-green-400 text-xs hover:text-green-300">✕</button>
        </div>
      )}

      {/* Corps */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-[#21262d] flex flex-col bg-[#0d1117]">
          <div className="p-3 border-b border-[#21262d]">
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {Object.keys(chapitresFiltres).length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[#8b949e] text-xs mb-3">Aucune ressource pour cette matière</p>
                <Link href="/dashboard/cours/ajouter" className="text-xs text-[#00b4d8] hover:underline">
                  + Ajouter la première →
                </Link>
              </div>
            ) : (
              Object.entries(chapitresFiltres).map(([chapitre, items], idx) => (
                <div key={chapitre} className="border-b border-[#21262d]">
                  {/* En-tête chapitre */}
                  <div className="flex items-center group">
                    <button
                      onClick={() => toggleChapitre(chapitre)}
                      className="flex-1 flex items-center justify-between px-4 py-3 text-left hover:bg-[#161b22] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: MATIERES[matiere].color }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-[#e6edf3] truncate">{chapitre}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-[#8b949e]">{items.length}</span>
                        <span
                          className="text-[#8b949e] text-base leading-none transition-transform duration-200"
                          style={{ display: 'inline-block', transform: chapitresOuverts[chapitre] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >›</span>
                      </div>
                    </button>

                    {/* Actions chapitre — visibles au hover */}
                    <div className="flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => ouvrirModalRenommer(chapitre, items)}
                        title="Renommer le chapitre"
                        className="w-6 h-6 flex items-center justify-center rounded text-[#8b949e] hover:text-[#00b4d8] hover:bg-[#161b22] transition-colors text-xs"
                      >✏️</button>
                      <button
                        onClick={() => supprimerChapitre(items)}
                        title="Supprimer le chapitre"
                        className="w-6 h-6 flex items-center justify-center rounded text-[#8b949e] hover:text-red-400 hover:bg-[#161b22] transition-colors text-xs"
                      >🗑️</button>
                    </div>
                  </div>

                  {/* Sous-items */}
                  {chapitresOuverts[chapitre] && (
                    <div className="bg-[#0a0f14]">
                      {items.map((item) => {
                        const t = TYPES[item.type] || TYPES.cours;
                        const isActive = selected?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-2 pl-10 pr-2 py-2 border-l-2 transition-colors group/item ${
                              isActive ? 'bg-[#161b22] border-[#00b4d8]' : 'border-transparent hover:bg-[#161b22]'
                            }`}
                          >
                            <button onClick={() => setSelected(item)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                              <span className="text-xs flex-shrink-0">{item.sourceType === 'youtube' ? '▶️' : '📄'}</span>
                              <span className="text-xs text-[#e6edf3] flex-1 min-w-0 truncate">{item.titre}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium" style={{ background: t.bg, color: t.text }}>
                                {t.label}
                              </span>
                            </button>
                            {/* Supprimer item */}
                            <button
                              onClick={() => supprimer(item)}
                              title="Supprimer"
                              className="opacity-0 group-hover/item:opacity-100 w-5 h-5 flex items-center justify-center rounded text-[#8b949e] hover:text-red-400 transition-all text-xs flex-shrink-0"
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer sidebar */}
          <div className="p-3 border-t border-[#21262d]">
            <p className="text-[10px] text-[#8b949e] text-center">
              {cours.filter(c => c.matiere === matiere).length} ressource{cours.filter(c => c.matiere === matiere).length > 1 ? 's' : ''} dans cette matière
            </p>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 bg-[#161b22] rounded-2xl flex items-center justify-center border border-[#21262d] mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <p className="text-[#e6edf3] text-sm font-medium mb-1">Sélectionnez une ressource</p>
              <p className="text-[#8b949e] text-xs mb-4">Choisissez un chapitre dans la sidebar</p>
              <Link
                href="/dashboard/cours/ajouter"
                className="text-xs bg-[#00b4d8] text-[#0d1117] font-medium px-4 py-2 rounded-lg hover:bg-[#0099bb] transition-colors"
              >
                ➕ Ajouter une ressource
              </Link>
            </div>
          ) : (
            <>
              {/* Header viewer */}
              <div className="px-6 py-4 border-b border-[#21262d] bg-[#0d1117] flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#8b949e] mb-1.5 flex-wrap">
                      <span>{MATIERES[matiere]?.label}</span>
                      <span>›</span>
                      <span>{selected.chapitre || '—'}</span>
                      <span>›</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: typeInfo?.bg, color: typeInfo?.text }}>
                        {typeInfo?.label}
                      </span>
                    </div>
                    <h2 className="text-base font-medium text-[#e6edf3]">{selected.titre}</h2>
                    {selected.description && (
                      <p className="text-xs text-[#8b949e] mt-1">{selected.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#8b949e] flex-wrap">
                      <span>📅 {selected.dateCreation?.toDate?.()?.toLocaleDateString('fr-FR')}</span>
                      {selected.fileSize && (
                        <>
                          <span>·</span>
                          <span>{selected.fileFormat?.toUpperCase()} — {(selected.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                    {selected.fileUrl && (
                      <a href={selected.fileUrl} download target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-[#161b22] border border-[#21262d] text-[#8b949e] px-3 py-2 rounded-lg hover:border-[#8b949e] hover:text-[#e6edf3] transition-colors">
                        ⬇️ Télécharger
                      </a>
                    )}
                    {selected.fileUrl && (
                      <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-[#00b4d8] text-[#0d1117] font-medium px-3 py-2 rounded-lg hover:bg-[#0099bb] transition-colors">
                        ↗ Ouvrir
                      </a>
                    )}
                    {selected.youtubeId && (
                      <a href={`https://youtube.com/watch?v=${selected.youtubeId}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors">
                        ▶️ YouTube
                      </a>
                    )}
                    <button
                      onClick={() => supprimer(selected)}
                      className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Zone viewer */}
              <div className="flex-1 overflow-hidden bg-[#161b22]">
                {getViewerContent()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}