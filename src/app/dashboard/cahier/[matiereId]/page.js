'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, orderBy, query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MATIERES_CONFIG = {
  comportement:     { name: 'Comportement mécanique',  code: 'S3', color: '#185FA5' },
  construction:     { name: 'Construction mécanique',   code: 'S5', color: '#0F6E56' },
  conception:       { name: 'Conception mécanique',     code: 'S2', color: '#534AB7' },
  industrialisation:{ name: 'Industrialisation',        code: 'S7', color: '#993C1D' },
};

const TYPE_STYLES = {
  cours: { label: 'Cours', bg: 'bg-blue-900/40',   text: 'text-blue-300',   border: 'border-blue-800' },
  td:    { label: 'TD',    bg: 'bg-green-900/40',  text: 'text-green-300',  border: 'border-green-800' },
  tp:    { label: 'TP',    bg: 'bg-orange-900/40', text: 'text-orange-300', border: 'border-orange-800' },
  eval:  { label: 'Éval',  bg: 'bg-red-900/40',    text: 'text-red-300',    border: 'border-red-800' },
};

const NIVEAU_COLORS = ['', 'bg-[#9FE1CB]', 'bg-[#5DCAA5]', 'bg-[#1D9E75]', 'bg-[#0F6E56]'];

const EMPTY_FORM = {
  date: '',
  duree: '3h',
  sequenceId: '',
  sequenceName: '',
  selectedItems: [],
  objectif: '',
  type: 'cours',
  niveaux: [],
  competences: [],
  fichier: null,
  fichierNom: '',
  lienVideo: '',
};

export default function CahierPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const matiereId = params.matiereId;
  const config = MATIERES_CONFIG[matiereId];

  const [sequences, setSequences] = useState([]);
  const [items, setItems] = useState({});
  const [seances, setSeances] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    if (!matiereId || !user) return;
    setLoadingData(true);
    try {
      const seqSnap = await getDocs(
        collection(db, 'referentiel', matiereId, 'sequences')
      );
      const seqList = seqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSequences(seqList);

      const itemsMap = {};
      await Promise.all(seqList.map(async seq => {
        const itemSnap = await getDocs(
          collection(db, 'referentiel', matiereId, 'sequences', seq.id, 'items')
        );
        itemsMap[seq.id] = itemSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }));
      setItems(itemsMap);

      // ✅ FIX : on filtre par profId pour que chaque prof ne voit QUE ses séances
      const seancesSnap = await getDocs(
        query(
          collection(db, 'cahierTexte', matiereId, 'seances'),
          where('profId', '==', user.uid),
          orderBy('date', 'desc')
        )
      );
      setSeances(seancesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoadingData(false);
    }
  }, [matiereId, user]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && userData?.role !== 'PROF' && userData?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, userData, loading, router]);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  function handleSeqChange(seqId) {
    const seq = sequences.find(s => s.id === seqId);
    setForm(f => ({
      ...f,
      sequenceId: seqId,
      sequenceName: seq?.seq || '',
      selectedItems: [],
      niveaux: [],
      competences: [],
    }));
  }

  function toggleItem(item) {
    setForm(f => {
      const already = f.selectedItems.find(i => i.id === item.id);
      const newItems = already
        ? f.selectedItems.filter(i => i.id !== item.id)
        : [...f.selectedItems, item];
      const niveaux = [...new Set(newItems.map(i => i.niveau))];
      const competences = [...new Set(newItems.flatMap(i => i.competences))];
      return { ...f, selectedItems: newItems, niveaux, competences };
    });
  }

  async function handleSave() {
    if (!form.date || !form.sequenceId || form.selectedItems.length === 0 || !form.objectif.trim()) {
      alert('Veuillez remplir tous les champs obligatoires (date, séquence, au moins un contenu, objectif).');
      return;
    }
    setSaving(true);
    try {
      let fichierUrl = '';
      let fichierNom = '';
      if (form.fichier) {
        const formData = new FormData();
        formData.append('file', form.fichier);
        formData.append('upload_preset', 'cpi_doisneau');
        formData.append('folder', `cahier/${matiereId}`);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: formData }
        );
        const cloudData = await res.json();
        fichierUrl = cloudData.secure_url || '';
        fichierNom = form.fichierNom;
      }

      const data = {
        date: form.date,
        duree: form.duree,
        sequenceId: form.sequenceId,
        sequenceName: form.sequenceName,
        contenuRefs: form.selectedItems.map(i => i.id),
        contenuTextes: form.selectedItems.map(i => i.contenu),
        objectif: form.objectif.trim(),
        type: form.type,
        niveaux: form.niveaux,
        competences: form.competences,
        fichierUrl,
        fichierNom,
        lienVideo: form.lienVideo || '',
        profId: user.uid,
        profNom: userData?.prenom + ' ' + userData?.nom,
        matiereId,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'cahierTexte', matiereId, 'seances', editingId), data);
      } else {
        await addDoc(collection(db, 'cahierTexte', matiereId, 'seances'), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(seance) {
    const seqItems = items[seance.sequenceId] || [];
    const selectedItems = seqItems.filter(i => seance.contenuRefs?.includes(i.id));
    setForm({
      date: seance.date,
      duree: seance.duree,
      sequenceId: seance.sequenceId,
      sequenceName: seance.sequenceName,
      selectedItems,
      objectif: seance.objectif || '',
      type: seance.type || 'cours',
      niveaux: seance.niveaux || [],
      competences: seance.competences || [],
      fichier: null,
      fichierNom: seance.fichierNom || '',
      lienVideo: seance.lienVideo || '',
    });
    setEditingId(seance.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette séance ?')) return;
    await deleteDoc(doc(db, 'cahierTexte', matiereId, 'seances', id));
    await loadData();
  }

  const totalItems = Object.values(items).flat().length;
  const coveredItemIds = new Set(seances.flatMap(s => s.contenuRefs || []));
  const coveragePct = totalItems > 0 ? Math.round((coveredItemIds.size / totalItems) * 100) : 0;
  const totalHeures = seances.reduce((acc, s) => acc + parseInt(s.duree || 0), 0);
  const missingObjectif = seances.filter(s => !s.objectif?.trim()).length;

  const byMonth = seances.reduce((acc, s) => {
    const key = s.date ? s.date.substring(0, 7) : 'inconnu';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const formatMonth = (key) => {
    if (key === 'inconnu') return 'Date inconnue';
    const [y, m] = key.split('-');
    return new Date(y, m - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-[#8b949e]">
        Matière inconnue
      </div>
    );
  }

  const currentSeqItems = items[form.sequenceId] || [];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

        {/* Onglets matières */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(userData?.matieres || [matiereId]).map(m => (
            <button
              key={m}
              onClick={() => router.push(`/dashboard/cahier/${m}`)}
              className={`flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-colors ${
                m === matiereId
                  ? 'border-[#00b4d8] text-[#00b4d8] bg-[#00b4d8]/08'
                  : 'border-[#21262d] text-[#8b949e] hover:border-[#30363d]'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: MATIERES_CONFIG[m]?.color || '#8b949e' }} />
              {MATIERES_CONFIG[m]?.name || m}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-[#8b949e] hover:text-[#00b4d8] text-xs mb-3 flex items-center gap-1 transition-colors"
            >
              ← Retour au dashboard
            </button>
            <h1 className="text-xl font-medium">Cahier de texte — {config.name}</h1>
            <p className="text-xs text-[#8b949e] mt-1">{config.code} · Année 2025-2026</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 bg-[#00b4d8] text-[#0d1117] text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#00c8f0] transition-colors"
          >
            + Ajouter une séance
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-3">
            <p className="text-xs text-[#8b949e] mb-1">Séances saisies</p>
            <p className="text-xl font-medium text-green-400">{seances.length}</p>
          </div>
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-3">
            <p className="text-xs text-[#8b949e] mb-1">Heures enseignées</p>
            <p className="text-xl font-medium text-[#00b4d8]">{totalHeures}h</p>
          </div>
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-3">
            <p className="text-xs text-[#8b949e] mb-1">Couverture référentiel</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${coveragePct}%`,
                    background: coveragePct >= 75 ? '#1d9e75' : coveragePct >= 40 ? '#EF9F27' : '#E24B4A'
                  }}
                />
              </div>
              <span className="text-xs font-medium" style={{
                color: coveragePct >= 75 ? '#1d9e75' : coveragePct >= 40 ? '#EF9F27' : '#E24B4A'
              }}>
                {coveragePct}%
              </span>
            </div>
          </div>
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-3">
            <p className="text-xs text-[#8b949e] mb-1">Objectifs manquants</p>
            <p className={`text-xl font-medium ${missingObjectif > 0 ? 'text-[#EF9F27]' : 'text-green-400'}`}>
              {missingObjectif}
            </p>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="border border-[#00b4d8] rounded-xl bg-[#0a1520] p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[#00b4d8]">
                {editingId ? 'Modifier la séance' : 'Nouvelle séance'}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00b4d8]/50 inline-block" />
                  Auto depuis référentiel
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#534AB7]/70 inline-block" />
                  À rédiger
                </span>
              </div>
            </div>

            {/* Étape 1 : Date + durée */}
            <div className="flex gap-2 items-center mb-1">
              <span className="w-5 h-5 rounded-full bg-[#00b4d8]/15 border border-[#00b4d8] text-[#00b4d8] text-xs flex items-center justify-center flex-shrink-0">1</span>
              <p className="text-xs text-[#8b949e] uppercase tracking-wide font-medium">Date et durée *</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 pl-7">
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] focus:outline-none focus:border-[#00b4d8]"
              />
              <select
                value={form.duree}
                onChange={e => setForm(f => ({ ...f, duree: e.target.value }))}
                className="bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] focus:outline-none focus:border-[#00b4d8]"
              >
                {['1h','2h','3h','4h','5h','6h'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Étape 2 : Séquence */}
            <div className="flex gap-2 items-center mb-1">
              <span className="w-5 h-5 rounded-full bg-[#00b4d8]/15 border border-[#00b4d8] text-[#00b4d8] text-xs flex items-center justify-center flex-shrink-0">2</span>
              <p className="text-xs text-[#8b949e] uppercase tracking-wide font-medium">
                Séquence du référentiel *
                <span className="ml-2 text-xs text-green-400 font-normal normal-case tracking-normal">prérempli auto</span>
              </p>
            </div>
            <div className="pl-7 mb-4">
              <select
                value={form.sequenceId}
                onChange={e => handleSeqChange(e.target.value)}
                className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="">— Choisir une séquence —</option>
                {sequences.map(s => (
                  <option key={s.id} value={s.id}>{s.seq}</option>
                ))}
              </select>
            </div>

            {/* Étape 3 : Type de séance */}
            <div className="flex gap-2 items-center mb-1">
              <span className="w-5 h-5 rounded-full bg-[#00b4d8]/15 border border-[#00b4d8] text-[#00b4d8] text-xs flex items-center justify-center flex-shrink-0">3</span>
              <p className="text-xs text-[#8b949e] uppercase tracking-wide font-medium">Type de séance *</p>
            </div>
            <div className="pl-7 mb-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'cours', label: 'Cours', bg: 'bg-blue-900/40',   text: 'text-blue-300',   border: 'border-blue-800' },
                  { key: 'td',    label: 'TD',    bg: 'bg-green-900/40',  text: 'text-green-300',  border: 'border-green-800' },
                  { key: 'tp',    label: 'TP',    bg: 'bg-orange-900/40', text: 'text-orange-300', border: 'border-orange-800' },
                  { key: 'eval',  label: 'Éval',  bg: 'bg-red-900/40',    text: 'text-red-300',    border: 'border-red-800' },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setForm(f => ({ ...f, type: t.key }))}
                    className={`py-2 rounded-lg border text-xs font-medium transition-colors ${
                      form.type === t.key
                        ? `${t.bg} ${t.text} ${t.border} border-2`
                        : 'bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Étape 4 : Contenu sélectionnable */}
            {form.sequenceId && (
              <>
                <div className="flex gap-2 items-center mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#00b4d8]/15 border border-[#00b4d8] text-[#00b4d8] text-xs flex items-center justify-center flex-shrink-0">4</span>
                  <p className="text-xs text-[#8b949e] uppercase tracking-wide font-medium">
                    Contenu traité cette séance *
                    <span className="ml-2 text-xs text-green-400 font-normal normal-case tracking-normal">
                      {form.selectedItems.length} sélectionné{form.selectedItems.length > 1 ? 's' : ''}
                    </span>
                  </p>
                </div>
                <div className="pl-7 mb-4">
                  {currentSeqItems.length === 0 ? (
                    <div className="border border-[#21262d] rounded-lg p-4 text-center text-xs text-[#8b949e]">
                      Chargement des contenus...
                    </div>
                  ) : (
                    <div className="border border-[#21262d] rounded-lg overflow-hidden">
                      <div className="bg-[#0d1117] px-3 py-2 text-xs text-[#8b949e] border-b border-[#21262d]">
                        Cocher ce qui a été traité cette séance
                      </div>
                      {currentSeqItems.map(item => {
                        const selected = form.selectedItems.find(i => i.id === item.id);
                        const tcfg = TYPE_STYLES[item.type] || TYPE_STYLES.cours;
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItem(item)}
                            className={`flex gap-3 p-3 cursor-pointer border-b border-[#21262d] last:border-0 transition-colors ${
                              selected ? 'bg-[#00b4d8]/05 border-l-2 border-l-[#00b4d8]' : 'hover:bg-[#1c2128]'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors ${
                              selected ? 'bg-[#00b4d8] border-[#00b4d8]' : 'border-[#21262d]'
                            }`}>
                              {selected && <span className="text-[#0d1117] text-xs">✓</span>}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-[#e6edf3] leading-relaxed mb-1">{item.contenu}</p>
                              <div className="flex gap-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded border ${tcfg.bg} ${tcfg.text} ${tcfg.border}`}>
                                  {tcfg.label}
                                </span>
                                <span className="text-xs text-[#8b949e] flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${NIVEAU_COLORS[item.niveau]}`} />
                                  Niv. {item.niveau}
                                </span>
                                <span className="text-xs text-[#8b949e]">{item.competences?.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {form.selectedItems.length > 0 && (
                    <div className="mt-2 bg-[#0d1117] border border-green-800/40 rounded-lg p-3">
                      <p className="text-xs text-green-400 mb-2">✓ Champs auto-renseignés dans Firestore</p>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-[#8b949e]">Type séance</p>
                          <p className="text-[#e6edf3] font-medium capitalize">{form.type}</p>
                        </div>
                        <div>
                          <p className="text-[#8b949e]">Niveaux</p>
                          <p className="text-[#e6edf3] font-medium">{form.niveaux.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-[#8b949e]">Compétences</p>
                          <p className="text-[#e6edf3] font-medium">{form.competences.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Étape 5 : Objectif */}
            <div className="flex gap-2 items-center mb-1">
              <span className="w-5 h-5 rounded-full bg-[#534AB7]/20 border border-[#534AB7] text-[#AFA9EC] text-xs flex items-center justify-center flex-shrink-0">5</span>
              <p className="text-xs text-[#8b949e] uppercase tracking-wide font-medium">
                Objectif de séance *
                <span className="ml-2 text-xs text-[#AFA9EC] font-normal normal-case tracking-normal">à rédiger</span>
              </p>
            </div>
            <div className="pl-7 mb-4">
              <div className="border border-[#534AB7]/50 rounded-lg overflow-hidden">
                <div className="bg-[#534AB7]/10 px-3 py-1.5 text-xs text-[#AFA9EC] border-b border-[#534AB7]/30">
                  Ce que le prof rédige — vérifié par l&apos;inspecteur
                </div>
                <textarea
                  rows={3}
                  value={form.objectif}
                  onChange={e => setForm(f => ({ ...f, objectif: e.target.value }))}
                  placeholder="À l'issue de cette séance, l'étudiant sera capable de..."
                  className="w-full bg-[#161b22] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none resize-none border-l-2 border-[#534AB7]"
                />
              </div>
              <p className="text-xs text-[#8b949e] mt-1 italic">
                Formuler en termes de capacités observables — cohérent avec le niveau taxonomique sélectionné
              </p>
            </div>

            {/* Étape 6 : Ressource */}
            <div className="flex gap-2 items-center mb-1">
              <span className="w-5 h-5 rounded-full bg-[#21262d] border border-[#30363d] text-[#8b949e] text-xs flex items-center justify-center flex-shrink-0">6</span>
              <p className="text-xs text-[#8b949e] uppercase tracking-wide font-medium">
                Ressource associée
                <span className="ml-2 text-xs font-normal normal-case tracking-normal">(optionnel)</span>
              </p>
            </div>
            <div className="pl-7 mb-4 flex flex-col gap-3">
              <label className="flex items-center gap-3 border border-dashed border-[#30363d] rounded-lg p-3 cursor-pointer hover:border-[#00b4d8] transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4,.zip,.sldprt,.sldasm,.CATPart,.CATProduct"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) setForm(f => ({ ...f, fichier: file, fichierNom: file.name }));
                  }}
                />
                <span className="text-lg">📎</span>
                <div className="flex-1">
                  <p className="text-xs text-[#8b949e]">
                    {form.fichierNom || 'Cliquer pour uploader un fichier'}
                  </p>
                  <p className="text-xs text-[#8b949e] opacity-60 mt-0.5">
                    PDF, Word, PowerPoint, Excel, image, vidéo, SolidWorks, CATIA — max 50 Mo
                  </p>
                </div>
                {form.fichierNom && (
                  <button
                    onClick={e => { e.preventDefault(); setForm(f => ({ ...f, fichier: null, fichierNom: '' })); }}
                    className="text-xs text-red-400 hover:text-red-300 flex-shrink-0"
                  >✕</button>
                )}
              </label>
              <input
                type="url"
                value={form.lienVideo}
                onChange={e => setForm(f => ({ ...f, lienVideo: e.target.value }))}
                placeholder="🎬 Lien YouTube ou vidéo (optionnel)"
                className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
              <p className="text-xs text-green-400">
                ✓ Synchronisé automatiquement avec le tableau de bord admin
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
                  className="text-xs px-4 py-2 border border-[#21262d] text-[#8b949e] rounded-lg hover:border-[#30363d] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs px-4 py-2 bg-[#00b4d8] text-[#0d1117] font-medium rounded-lg hover:bg-[#00c8f0] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : (editingId ? 'Modifier' : 'Sauvegarder')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tableau des séances */}
        {seances.length === 0 && !showForm ? (
          <div className="border border-dashed border-[#21262d] rounded-xl p-12 text-center">
            <p className="text-[#8b949e] mb-3">Aucune séance enregistrée</p>
            <button onClick={() => setShowForm(true)} className="text-xs text-[#00b4d8] hover:underline">
              Ajouter la première séance →
            </button>
          </div>
        ) : (
          <div className="border border-[#21262d] rounded-xl overflow-hidden">
            <div className="bg-[#161b22] px-4 py-3 flex items-center justify-between border-b border-[#21262d]">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Séances enregistrées
              </div>
              {missingObjectif > 0 && (
                <span className="text-xs text-[#EF9F27]">
                  ⚠ {missingObjectif} objectif{missingObjectif > 1 ? 's' : ''} manquant{missingObjectif > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '6%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#0d1117] border-b border-[#21262d]">
                    {['Date', 'Durée', 'Séquence', 'Contenu', 'Objectif (prof)', 'Type', 'Ressource', 'Act.'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[#8b949e] font-medium" style={{ fontSize: '10px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a)).map(([month, monthSeances]) => (
                    <>
                      <tr key={`month-${month}`} className="bg-[#0d1117]">
                        <td colSpan={8} className="px-3 py-2">
                          <span className="text-[9px] font-medium text-[#8b949e] uppercase tracking-widest">
                            {formatMonth(month)}
                          </span>
                        </td>
                      </tr>
                      {monthSeances.map(seance => {
                        const tcfg = TYPE_STYLES[seance.type] || TYPE_STYLES.cours;
                        return (
                          <tr key={seance.id} className="border-b border-[#21262d]/50 hover:bg-[#161b22] transition-colors">
                            <td className="px-3 py-3 text-[#8b949e]">{seance.date}</td>
                            <td className="px-3 py-3 text-[#8b949e]">{seance.duree}</td>
                            <td className="px-3 py-3 font-medium text-[#e6edf3] leading-tight text-xs">{seance.sequenceName}</td>
                            <td className="px-3 py-3 text-[#8b949e] leading-relaxed text-xs">{seance.contenuTextes?.join(' / ')}</td>
                            <td className="px-3 py-3">
                              {seance.objectif ? (
                                <span className="text-[#AFA9EC] italic leading-relaxed text-xs">{seance.objectif}</span>
                              ) : (
                                <span className="text-[#EF9F27] text-xs">⚠ Objectif manquant</span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded border font-medium ${tcfg.bg} ${tcfg.text} ${tcfg.border}`} style={{ fontSize: '9px' }}>
                                {tcfg.label}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-col gap-1">
                                {seance.fichierUrl && (
                                  <a href={seance.fichierUrl} target="_blank" rel="noreferrer"
                                    className="text-[#00b4d8] hover:underline flex items-center gap-1"
                                    style={{ fontSize: '9px' }}>
                                    📎 {seance.fichierNom?.substring(0, 12) || 'Fichier'}
                                  </a>
                                )}
                                {seance.lienVideo && (
                                  <a href={seance.lienVideo} target="_blank" rel="noreferrer"
                                    className="text-red-400 hover:underline flex items-center gap-1"
                                    style={{ fontSize: '9px' }}>
                                    🎬 Vidéo
                                  </a>
                                )}
                                {!seance.fichierUrl && !seance.lienVideo && (
                                  <span className="text-[#8b949e] opacity-40" style={{ fontSize: '9px' }}>—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex gap-1">
                                <button onClick={() => handleEdit(seance)}
                                  className="border border-[#21262d] rounded px-1.5 py-1 text-[#8b949e] hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors"
                                  title="Modifier">✏</button>
                                <button onClick={() => handleDelete(seance.id)}
                                  className="border border-[#21262d] rounded px-1.5 py-1 text-[#8b949e] hover:border-red-500 hover:text-red-400 transition-colors"
                                  title="Supprimer">✕</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}