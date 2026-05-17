'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TYPE_CONFIG = {
  cours: { label: 'Cours', bg: 'bg-blue-900/40',   text: 'text-blue-300',   border: 'border-blue-800/40' },
  td:    { label: 'TD',    bg: 'bg-green-900/40',  text: 'text-green-300',  border: 'border-green-800/40' },
  tp:    { label: 'TP',    bg: 'bg-orange-900/40', text: 'text-orange-300', border: 'border-orange-800/40' },
  eval:  { label: 'Éval',  bg: 'bg-red-900/40',    text: 'text-red-300',    border: 'border-red-800/40' },
};

const NIVEAU_COLORS = ['', 'bg-[#9FE1CB]', 'bg-[#5DCAA5]', 'bg-[#1D9E75]', 'bg-[#0F6E56]'];

const MATIERES_ORDER = ['comportement', 'construction', 'conception', 'industrialisation'];

export default function ReferentielPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('comportement');
  const [matieres, setMatieres] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, userData, loading, router]);

  // Chargement des matières depuis Firestore
  useEffect(() => {
    async function loadMatieres() {
      try {
        const snap = await Promise.all(
          MATIERES_ORDER.map(id => getDoc(doc(db, 'referentiel', id)))
        );
        const data = snap
          .filter(d => d.exists())
          .map(d => ({ id: d.id, ...d.data() }));
        setMatieres(data);
      } catch (err) {
        console.error('Erreur chargement matières:', err);
      }
    }
    if (user) loadMatieres();
  }, [user]);

  // Chargement des séquences + items quand on change d'onglet
  useEffect(() => {
    async function loadSequences() {
      if (!activeTab) return;
      setLoadingData(true);
      try {
        const seqSnap = await getDocs(
          collection(db, 'referentiel', activeTab, 'sequences')
        );
        const seqList = seqSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Charger les items de chaque séquence
        const rows = [];
        for (const seq of seqList) {
          const itemSnap = await getDocs(
            collection(db, 'referentiel', activeTab, 'sequences', seq.id, 'items')
          );
          const items = itemSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          items.forEach(item => {
            rows.push({
              sem: seq.semestre,
              seq: seq.seq,
              contenu: item.contenu,
              type: item.type,
              niveau: item.niveau,
              comp: Array.isArray(item.competences)
                ? item.competences.join(', ')
                : item.competences,
            });
          });
        }
        setSequences(rows);
      } catch (err) {
        console.error('Erreur chargement séquences:', err);
      } finally {
        setLoadingData(false);
      }
    }
    if (user) loadSequences();
  }, [activeTab, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Regrouper les lignes par séquence
  const grouped = [];
  let lastSeq = null;
  let lastSem = null;
  sequences.forEach((row, i) => {
    const sameSeq = row.seq === lastSeq;
    const sameSem = row.sem === lastSem;
    grouped.push({ ...row, showSeq: !sameSeq, showSem: !sameSem || !sameSeq, idx: i });
    lastSeq = row.seq;
    lastSem = row.sem;
  });

  const matiere = matieres.find(m => m.id === activeTab);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#8b949e] hover:text-[#00b4d8] text-sm mb-4 flex items-center gap-1 transition-colors"
          >
            ← Retour au dashboard
          </button>
          <h1 className="text-2xl font-medium text-[#e6edf3]">Référentiel BTS CPI</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Séquences officielles par matière · Lycée Robert Doisneau
          </p>
        </div>

        {/* Onglets matières */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {matieres.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`text-sm px-5 py-2 rounded-full border transition-colors ${
                activeTab === m.id
                  ? 'bg-[#21262d] border-[#00b4d8] text-[#00b4d8]'
                  : 'border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Légende */}
        <div className="flex flex-wrap gap-4 mb-5 text-xs text-[#8b949e]">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <span key={key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {cfg.label} {key === 'cours' ? '— Apport de connaissances' : key === 'td' ? '— Travaux dirigés' : key === 'tp' ? '— Travaux pratiques' : '— Évaluation'}
            </span>
          ))}
          {[1,2,3,4].map(n => (
            <span key={n} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${NIVEAU_COLORS[n]}`} />
              Niveau {n}
            </span>
          ))}
        </div>

        {/* En-tête matière */}
        {matiere && (
          <div className="bg-[#161b22] border border-[#21262d] rounded-t-xl px-5 py-4">
            <h2 className="text-base font-medium text-[#e6edf3]">{matiere.name}</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">{matiere.description}</p>
          </div>
        )}

        {/* Tableau */}
        <div className="border border-t-0 border-[#21262d] rounded-b-xl overflow-hidden">
          {loadingData ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '46%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#0d1117] border-b border-[#21262d]">
                    {['Sem.', 'Séquence / Thème', 'Contenu (savoirs associés)', 'Type', 'Niveau', 'Comp.'].map(h => (
                      <th key={h} className="text-left px-3 py-3 text-[#8b949e] font-medium uppercase tracking-wide" style={{ fontSize: '10px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((row, i) => (
                    <tr key={i} className="border-b border-[#21262d]/50 hover:bg-[#161b22] transition-colors">
                      <td className="px-3 py-3 text-[#8b949e] font-medium align-top">
                        {row.showSem ? row.sem : ''}
                      </td>
                      <td className="px-3 py-3 align-top">
                        {row.showSeq ? (
                          <span className="font-medium text-[#e6edf3] leading-relaxed">{row.seq}</span>
                        ) : (
                          <span className="text-transparent select-none">·</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[#8b949e] leading-relaxed align-top">
                        {row.contenu}
                      </td>
                      <td className="px-3 py-3 text-center align-top">
                        {(() => {
                          const cfg = TYPE_CONFIG[row.type] || TYPE_CONFIG.cours;
                          return (
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded border text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3 text-center align-top">
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${NIVEAU_COLORS[row.niveau] || NIVEAU_COLORS[2]}`} />
                          <span className="text-[#8b949e]">{row.niveau}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#8b949e] align-top">{row.comp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}