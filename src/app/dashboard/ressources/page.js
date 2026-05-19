'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MATIERES = {
  comportement:     { label: 'Comportement mécanique', color: '#1D9E75' },
  construction:     { label: 'Construction mécanique',  color: '#378ADD' },
  conception:       { label: 'Conception mécanique',    color: '#7F77DD' },
  industrialisation:{ label: 'Industrialisation',       color: '#BA7517' },
};

const TYPES = {
  cours:  { label: 'Cours',         bg: '#E1F5EE', text: '#0F6E56' },
  td:     { label: 'TD',            bg: '#E6F1FB', text: '#185FA5' },
  tp:     { label: 'TP',            bg: '#EEEDFE', text: '#3C3489' },
  examen: { label: 'Examen',        bg: '#FAEEDA', text: '#854F0B' },
  projet: { label: 'Ancien projet', bg: '#F1EFE8', text: '#5F5E5A' },
};

export default function RessourcesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cours, setCours] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [matiere, setMatiere] = useState('comportement');
  const [chapitresOuverts, setChapitresOuverts] = useState({});
  const [selected, setSelected] = useState(null);
  const [recherche, setRecherche] = useState('');
  // Mobile : 'list' | 'viewer'
  const [mobileView, setMobileView] = useState('list');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, 'cours')), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) =>
        (a.chapitre || '').localeCompare(b.chapitre || '') ||
        (a.titre || '').localeCompare(b.titre || '')
      );
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
    setMobileView('list');
  }, [matiere]);

  const toggleChapitre = (key) =>
    setChapitresOuverts(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSelectItem = (item) => {
    setSelected(item);
    setMobileView('viewer');
  };

  const chapitresFiltres = useMemo(() => {
    if (!recherche) return chapitres;
    const filtered = {};
    Object.entries(chapitres).forEach(([key, items]) => {
      const match = items.filter(i =>
        i.titre?.toLowerCase().includes(recherche.toLowerCase())
      );
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
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
            <img
              src={selected.fileUrl}
              alt={selected.titre}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
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
    return (
      <div className="flex items-center justify-center h-full text-[#8b949e] text-sm">
        Aucun contenu disponible
      </div>
    );
  };

  if (loading || chargement) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Sidebar partagée (liste des chapitres) ──────────────────────────────
  const SidebarContent = () => (
    <>
      <div className="p-3 border-b border-[#21262d]">
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une ressource..."
          className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
        />
      </div>
      <div className="overflow-y-auto flex-1">
        {Object.keys(chapitresFiltres).length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#8b949e] text-xs">Aucune ressource pour cette matière</p>
          </div>
        ) : (
          Object.entries(chapitresFiltres).map(([chapitre, items], idx) => (
            <div key={chapitre} className="border-b border-[#21262d]">
              <button
                onClick={() => toggleChapitre(chapitre)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#161b22] transition-colors"
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
              {chapitresOuverts[chapitre] && (
                <div className="bg-[#0a0f14]">
                  {items.map((item) => {
                    const t = TYPES[item.type] || TYPES.cours;
                    const isActive = selected?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className={`w-full flex items-center gap-2 pl-10 pr-3 py-3 text-left border-l-2 transition-colors ${
                          isActive ? 'bg-[#161b22] border-[#00b4d8]' : 'border-transparent hover:bg-[#161b22]'
                        }`}
                      >
                        <span className="text-xs flex-shrink-0">
                          {item.sourceType === 'youtube' ? '▶️' : '📄'}
                        </span>
                        <span className="text-xs text-[#e6edf3] flex-1 min-w-0 truncate">{item.titre}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium"
                          style={{ background: t.bg, color: t.text }}
                        >
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

  // ── Header viewer partagé ───────────────────────────────────────────────
  const ViewerHeader = () => (
    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#21262d] bg-[#0d1117] flex-shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[10px] md:text-xs text-[#8b949e] mb-1.5 flex-wrap">
            <span>{MATIERES[matiere].label}</span>
            <span>›</span>
            <span>{selected?.chapitre || '—'}</span>
            <span>›</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: typeInfo?.bg, color: typeInfo?.text }}>
              {typeInfo?.label}
            </span>
          </div>
          <h2 className="text-sm md:text-base font-medium text-[#e6edf3] leading-tight">{selected?.titre}</h2>
          {selected?.description && (
            <p className="text-xs text-[#8b949e] mt-1 hidden md:block">{selected.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-[10px] md:text-xs text-[#8b949e] flex-wrap">
            <span>👤 {selected?.profNom}</span>
            <span>·</span>
            <span>📅 {selected?.dateCreation?.toDate?.()?.toLocaleDateString('fr-FR')}</span>
            {selected?.fileSize && (
              <>
                <span className="hidden md:inline">·</span>
                <span className="hidden md:inline">
                  {selected.fileFormat?.toUpperCase()} — {(selected.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </>
            )}
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
          {selected?.fileUrl && (
            <a href={selected.fileUrl} download target="_blank" rel="noopener noreferrer"
              className="text-xs bg-[#161b22] border border-[#21262d] text-[#8b949e] px-2 md:px-3 py-2 rounded-lg hover:border-[#8b949e] hover:text-[#e6edf3] transition-colors">
              ⬇️
            </a>
          )}
          {selected?.fileUrl && (
            <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs bg-[#00b4d8] text-[#0d1117] font-medium px-2 md:px-3 py-2 rounded-lg hover:bg-[#0099bb] transition-colors">
              ↗ Ouvrir
            </a>
          )}
          {selected?.youtubeId && (
            <a href={`https://youtube.com/watch?v=${selected.youtubeId}`} target="_blank" rel="noopener noreferrer"
              className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-2 md:px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors">
              ▶️
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col overflow-hidden">

      {/* Onglets matières */}
      <div className="border-b border-[#21262d] bg-[#0d1117] px-3 md:px-6 pt-3 md:pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Retour — sur mobile dans viewer seulement */}
          <button
            onClick={() => {
              if (mobileView === 'viewer') {
                setMobileView('list');
              } else {
                router.push('/dashboard');
              }
            }}
            className="text-[#8b949e] hover:text-[#e6edf3] text-sm flex-shrink-0"
          >
            ←
          </button>

          {/* Onglets — scroll horizontal sur mobile */}
          <div className="flex gap-0 overflow-x-auto scrollbar-hide flex-1">
            {Object.entries(MATIERES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setMatiere(key); setRecherche(''); }}
                className={`flex items-center gap-1.5 px-3 md:px-5 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  matiere === key
                    ? 'border-[#00b4d8] text-[#e6edf3]'
                    : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
                }`}
              >
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0" style={{ background: val.color }} />
                {/* Nom court sur mobile */}
                <span className="md:hidden">
                  {key === 'comportement' ? 'Comport.' :
                   key === 'construction' ? 'Constr.' :
                   key === 'conception' ? 'Concept.' : 'Indus.'}
                </span>
                <span className="hidden md:inline">{val.label}</span>
                <span className="text-[9px] md:text-[10px] bg-[#21262d] text-[#8b949e] px-1 md:px-1.5 py-0.5 rounded">
                  {totalMatiere(key)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP : sidebar + viewer côte à côte ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Sidebar desktop */}
        <div className="w-72 flex-shrink-0 border-r border-[#21262d] flex flex-col bg-[#0d1117]">
          <SidebarContent />
        </div>
        {/* Viewer desktop */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 bg-[#161b22] rounded-2xl flex items-center justify-center border border-[#21262d] mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <p className="text-[#e6edf3] text-sm font-medium mb-1">Sélectionnez une ressource</p>
              <p className="text-[#8b949e] text-xs">Choisissez un chapitre dans la sidebar</p>
            </div>
          ) : (
            <>
              <ViewerHeader />
              <div className="flex-1 overflow-hidden bg-[#161b22]">
                {getViewerContent()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── MOBILE : liste OU viewer plein écran ── */}
      <div className="flex md:hidden flex-1 overflow-hidden flex-col">
        {mobileView === 'list' ? (
          /* Vue liste mobile */
          <div className="flex flex-col flex-1 overflow-hidden bg-[#0d1117]">
            <SidebarContent />
          </div>
        ) : (
          /* Vue viewer mobile */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Bouton retour vers liste */}
            <div className="px-4 py-2 border-b border-[#21262d] bg-[#0d1117] flex-shrink-0">
              <button
                onClick={() => setMobileView('list')}
                className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                ← Retour à la liste
              </button>
            </div>
            <ViewerHeader />
            <div className="flex-1 overflow-hidden bg-[#161b22]">
              {getViewerContent()}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}