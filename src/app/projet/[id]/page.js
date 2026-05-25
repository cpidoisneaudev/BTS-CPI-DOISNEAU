// /app/projet/[id]/page.js — DESIGN FIDÈLE AU MAQUETTE V3
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  doc, getDoc, collection, onSnapshot, addDoc, deleteDoc,
  serverTimestamp, orderBy, query
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

function useIsMobile() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const c = () => setV(window.innerWidth < 768);
    c(); window.addEventListener('resize', c);
    return () => window.removeEventListener('resize', c);
  }, []);
  return v;
}

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

function typeBadge(type) {
  if (type === 'Prototypage')       return { bg: 'rgba(31,107,235,0.25)', color: '#58a6ff', border: 'rgba(31,107,235,0.5)' };
  if (type === 'Collaboratif CPRP') return { bg: 'rgba(224,123,57,0.25)', color: '#e07b39', border: 'rgba(224,123,57,0.5)' };
  if (type === 'Projet final')      return { bg: 'rgba(157,149,232,0.25)', color: '#9d95e8', border: 'rgba(157,149,232,0.5)' };
  return { bg: 'rgba(31,107,235,0.2)', color: '#58a6ff', border: 'rgba(31,107,235,0.4)' };
}

// ── YouTube Viewer ─────────────────────────────────────────────────────────────
function YouTubeViewer({ url, titre, onClose }) {
  const ytId = getYouTubeId(url);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ color: '#e6edf3', fontSize: 14, fontWeight: 600, flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titre}</p>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      <div style={{ width: '100%', maxWidth: 900, background: '#000', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
        </div>
      </div>
    </div>
  );
}

// ── Modal ajout ressource ──────────────────────────────────────────────────────
function FormAjoutRessource({ projetId, user, userData, onClose }) {
  const [form, setForm] = useState({ titre: '', type: 'pdf', url: '', duree: '', pages: '', niveau: 'Débutant' });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/ressource/upload', { method: 'POST', body: fd });
      const data = await res.json();
      setForm(p => ({ ...p, url: data.url }));
    } catch { alert('Erreur upload'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.titre.trim()) { alert('Titre requis'); return; }
    if (!form.url.trim()) { alert('Fichier/URL requis'); return; }
    setUploading(true);
    try {
      await addDoc(collection(db, 'projets', projetId, 'ressources'), {
        titre: form.titre.trim(), type: form.type, url: form.url,
        niveau: form.niveau, duree: form.duree, pages: form.pages,
        profId: user.uid, profNom: `${userData.prenom} ${userData.nom}`,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (e) { console.error(e); alert('Erreur'); }
    finally { setUploading(false); }
  };

  const inp = { width: '100%', padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 16 }}>
      <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 14, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: '#161b22', borderBottom: '1px solid #21262d', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#e6edf3', fontSize: 14, fontWeight: 600 }}>Ajouter une ressource</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 5 }}>Titre *</label>
            <input style={inp} value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex: Dossier technique complet" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 5 }}>Type *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['pdf', 'youtube', 'zip'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t, url: '' }))}
                  style={{ flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: form.type === t ? '#1f6feb' : '#21262d', border: `1px solid ${form.type === t ? '#1f6feb' : '#30363d'}`, color: form.type === t ? '#fff' : '#8b949e' }}>
                  {t === 'pdf' ? '📄 PDF' : t === 'youtube' ? '▶ YouTube' : '📦 ZIP'}
                </button>
              ))}
            </div>
          </div>
          {form.type === 'youtube' ? (
            <div>
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 5 }}>URL YouTube *</label>
              <input style={inp} value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 5 }}>Fichier * ({form.type.toUpperCase()})</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: form.url ? '#3fb950' : '#8b949e' }}>
                  {uploading ? 'Upload...' : form.url ? '✓ Fichier chargé' : `Choisir un ${form.type.toUpperCase()}`}
                </span>
                <input type="file" accept={form.type === 'pdf' ? '.pdf' : '.zip,.rar,.7z,.sldprt,.sldasm,.CATPart,.CATProduct'} onChange={e => handleUpload(e.target.files?.[0])} disabled={uploading} style={{ display: 'none' }} />
              </label>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 5 }}>{form.type === 'youtube' ? 'Durée' : 'Taille / Pages'}</label>
              <input style={inp} value={form.type === 'youtube' ? form.duree : form.pages} onChange={e => setForm(p => form.type === 'youtube' ? { ...p, duree: e.target.value } : { ...p, pages: e.target.value })} placeholder={form.type === 'youtube' ? '14:30' : '2.4 Mo'} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 5 }}>Niveau</label>
              <select value={form.niveau} onChange={e => setForm(p => ({ ...p, niveau: e.target.value }))} style={inp}>
                {['Débutant', 'Intermédiaire', 'Avancé'].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 9, borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSubmit} disabled={uploading} style={{ flex: 1, padding: 9, borderRadius: 8, background: uploading ? '#1a3a5f' : '#1f6feb', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: uploading ? 'wait' : 'pointer' }}>
              {uploading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Initiale avatar ────────────────────────────────────────────────────────────
function Avatar({ nom, prenom, role, size = 48 }) {
  const initiale = (prenom?.[0] || '') + (nom?.[0] || '');
  const colors = ['#1f6feb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2'];
  const ci = (prenom?.charCodeAt(0) || 0) % colors.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: colors[ci], border: '2px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
        {initiale || '?'}
      </div>
      {nom && <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#e6edf3', whiteSpace: 'nowrap' }}>{prenom} {nom?.[0]}.</div>
        {role && <div style={{ fontSize: 10, color: '#8b949e', marginTop: 1, whiteSpace: 'nowrap' }}>{role}</div>}
      </div>}
    </div>
  );
}

// ── PAGE PRINCIPALE ────────────────────────────────────────────────────────────
export default function ProjetDetailPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projetId = params.id;
  const isMobile = useIsMobile();

  const [projet, setProjet] = useState(null);
  const [loadingProjet, setLoadingProjet] = useState(true);
  const [ressources, setRessources] = useState([]);
  const [onglet, setOnglet] = useState('apercu');
  const [viewerYT, setViewerYT] = useState(null);
  const [showFormRessource, setShowFormRessource] = useState(false);
  const [photoActive, setPhotoActive] = useState(null);

  const isProf = userData?.role === 'PROF' || userData?.role === 'ADMIN';

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  useEffect(() => {
    if (!projetId) return;
    getDoc(doc(db, 'projets', projetId)).then(snap => {
      if (snap.exists()) setProjet({ id: snap.id, ...snap.data() });
      else router.push('/dashboard/projet');
      setLoadingProjet(false);
    }).catch(() => setLoadingProjet(false));
  }, [projetId]);

  useEffect(() => {
    if (!projetId) return;
    const q = query(collection(db, 'projets', projetId, 'ressources'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, snap => setRessources(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [projetId]);

  const handleDeleteRessource = async (id) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    await deleteDoc(doc(db, 'projets', projetId, 'ressources', id));
  };

  if (loading || loadingProjet) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,17,23,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ width: 32, height: 32, border: '2px solid #1f6feb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!projet) return null;

  const tb = typeBadge(projet.type);

  const resPDF    = ressources.filter(r => r.type === 'pdf' || r.type === 'zip');
  const resVideo  = ressources.filter(r => r.type === 'youtube');
  const firstVideo = resVideo[0];
  const ytId = firstVideo ? getYouTubeId(firstVideo.url) : null;
  const photosRessources = ressources.filter(r => r.type === 'image');

  // Membres du projet (si renseignés)
  const membres = projet.membres || [];

  const fileIcon = (type) => {
    if (type === 'youtube') return { icon: '▶', bg: '#ff000022', color: '#ff4444', border: '#ff000044' };
    if (type === 'zip')     return { icon: '📦', bg: '#d2992222', color: '#d29922', border: '#d2992244' };
    return                         { icon: '📄', bg: '#1f6feb22', color: '#58a6ff', border: '#1f6feb44' };
  };

  const ONGLETS = [
    { id: 'apercu',         label: 'Aperçu',          icon: '👁' },
    { id: 'cahier',         label: 'Cahier des charges', icon: '📄' },
    { id: 'conception',     label: 'Conception',       icon: '⚙️' },
    { id: 'realisation',    label: 'Réalisation',      icon: '🔨' },
    { id: 'tests',          label: 'Tests & Résultats', icon: '✅' },
    { id: 'documentation',  label: 'Documentation',    icon: '📋' },
  ];

  // ── Contenu onglet Aperçu ──────────────────────────────────────────────────
  const OngletApercu = () => (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 16, alignItems: 'start' }}>

      {/* ── Colonne gauche ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Résumé du projet */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Résumé du projet</h3>
          <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>{projet.description || 'Aucune description.'}</p>
        </div>

        {/* Objectifs + Compétences (2 colonnes) */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
          {/* Objectifs */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 14 : 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Objectifs</h3>
            {projet.livrables?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {projet.livrables.slice(0, 5).map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: '#1f6feb', fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: '#c9d1d9', lineHeight: 1.5 }}>{l}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 12, color: '#7d8590' }}>Aucun objectif renseigné.</p>}
          </div>

          {/* Compétences mobilisées */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 14 : 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Compétences mobilisées</h3>
            {projet.travaux?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {projet.travaux.slice(0, 5).map((t, i) => {
                  const label = typeof t === 'string' ? t : t.titre;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(31,107,235,0.15)', border: '1px solid rgba(31,107,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1f6feb' }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#c9d1d9', lineHeight: 1.4 }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p style={{ fontSize: 12, color: '#7d8590' }}>Aucune compétence renseignée.</p>}
          </div>
        </div>

        {/* Timeline étapes */}
        {projet.travaux?.length > 0 && (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Étapes du projet</h3>
            <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: projet.travaux.length > 4 ? 'max-content' : 'auto', position: 'relative' }}>
                {/* Ligne connecteur */}
                <div style={{ position: 'absolute', top: 15, left: '5%', right: '5%', height: 2, background: 'linear-gradient(90deg, #1f6feb, #7c3aed, #9d95e8)', borderRadius: 1, zIndex: 0 }} />
                {projet.travaux.map((t, i) => {
                  const label = typeof t === 'string' ? t : t.titre;
                  const desc  = typeof t === 'string' ? '' : t.description;
                  const colors = ['#1f6feb', '#2a7ef8', '#4a5be8', '#7c3aed', '#8b5cf6', '#9d95e8'];
                  const c = colors[i % colors.length];
                  const total = projet.travaux.length;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 0 auto', minWidth: isMobile ? 80 : 100, position: 'relative', zIndex: 1, padding: '0 4px' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 10, border: '2px solid #0d1117', boxShadow: `0 0 0 3px ${c}40` }}>
                        {i + 1}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#e6edf3', lineHeight: 1.3, marginBottom: 2 }}>{label}</div>
                        {desc && <div style={{ fontSize: 9, color: '#7d8590', lineHeight: 1.4 }}>{desc.slice(0, 40)}{desc.length > 40 ? '...' : ''}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Photos du projet + Vidéo côte à côte */}
        <div style={{ display: 'grid', gridTemplateColumns: photosRessources.length > 0 && firstVideo ? (isMobile ? '1fr' : '1fr 1fr') : '1fr', gap: 14 }}>

          {/* Photos */}
          {photosRessources.length > 0 && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>Photos du projet</h3>
                {photosRessources.length > 4 && (
                  <span style={{ fontSize: 11, color: '#58a6ff', cursor: 'pointer' }}>Voir toutes →</span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {photosRessources.slice(0, 4).map((r, i) => (
                  <div key={i} style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#21262d' }}
                    onClick={() => setPhotoActive(r.url)}>
                    <img src={r.url} alt={r.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 3 && photosRessources.length > 4 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                        +{photosRessources.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vidéo de présentation */}
          {firstVideo && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>Vidéo de présentation</h3>
                <span onClick={() => setViewerYT(firstVideo)} style={{ fontSize: 11, color: '#58a6ff', cursor: 'pointer' }}>Voir la vidéo →</span>
              </div>
              <div style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', position: 'relative' }} onClick={() => setViewerYT(firstVideo)}>
                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="video" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, backdropFilter: 'blur(4px)' }}>▶</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Colonne droite ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Fichiers & ressources */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 14 : 20, position: isMobile ? 'static' : 'sticky', top: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>
              Fichiers et ressources
              {ressources.length > 0 && <span style={{ fontSize: 11, color: '#7d8590', fontWeight: 400, marginLeft: 6 }}>({ressources.length})</span>}
            </h3>
            {isProf && (
              <button onClick={() => setShowFormRessource(true)}
                style={{ padding: '5px 12px', borderRadius: 8, background: '#1f6feb', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                + Ajouter
              </button>
            )}
          </div>

          {ressources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📂</div>
              <p style={{ fontSize: 12, color: '#7d8590' }}>{isProf ? 'Aucune ressource — cliquez sur "+ Ajouter"' : 'Aucune ressource disponible'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ressources.map(r => {
                const fi = fileIcon(r.type);
                return (
                  <div key={r.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#30363d'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#21262d'}
                    onClick={() => r.type === 'youtube' ? setViewerYT(r) : window.open(r.url, '_blank')}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: fi.bg, border: `1px solid ${fi.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                      {fi.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.titre}</div>
                      <div style={{ fontSize: 10, color: '#7d8590', marginTop: 1 }}>
                        {r.type === 'youtube' ? 'YouTube' : r.type?.toUpperCase()}
                        {r.pages ? ` · ${r.pages}` : ''}
                        {r.duree ? ` · ${r.duree}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {r.type !== 'youtube' && (
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#21262d', border: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#8b949e' }}>↓</div>
                      )}
                      {isProf && (
                        <button onClick={e => { e.stopPropagation(); handleDeleteRessource(r.id); }}
                          style={{ width: 22, height: 22, borderRadius: 4, background: 'rgba(218,54,51,0.7)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Livrables attendus */}
          {projet.livrables?.length > 0 && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #21262d' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>Livrables attendus</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {projet.livrables.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#3fb950', flexShrink: 0 }}>✓</div>
                    <span style={{ fontSize: 12, color: '#c9d1d9' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ══ OVERLAY fond flou ══ */}
      <div
        onClick={() => router.push('/dashboard/projet')}
        style={{ position: 'fixed', inset: 0, background: 'rgba(1,4,9,0.75)', backdropFilter: 'blur(6px)', zIndex: 100 }}
      />

      {/* ══ MODALE principale ══ */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 101,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        overflowY: 'auto', padding: isMobile ? '0' : '24px 16px',
      }}>
        <div style={{
          background: '#0d1117',
          border: isMobile ? 'none' : '1px solid #21262d',
          borderRadius: isMobile ? 0 : 16,
          width: '100%',
          maxWidth: 960,
          minHeight: isMobile ? '100vh' : 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}>

          {/* ══ HERO — 2 colonnes ══ */}
          <div style={{ position: 'relative', background: '#161b22', borderBottom: '1px solid #21262d' }}>

            {/* Header avec boutons retour/fermer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '12px 16px' : '14px 24px', borderBottom: '1px solid #21262d' }}>
              <button onClick={() => router.push('/dashboard/projet')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8b949e', fontSize: 13, cursor: 'pointer', padding: 0 }}>
                ← Retour aux projets
              </button>
              <button onClick={() => router.push('/dashboard/projet')}
                style={{ width: 30, height: 30, borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>

            {/* Contenu hero 2 colonnes */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 0, minHeight: isMobile ? 'auto' : 280 }}>

              {/* Colonne gauche — texte */}
              <div style={{ padding: isMobile ? '20px 16px' : '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Badge type */}
                  {projet.type && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 6, background: tb.bg, border: `1px solid ${tb.border}`, color: tb.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                      {projet.type === 'Projet final' ? 'PROJET FINAL (6 MOIS)' : projet.type?.toUpperCase()}
                    </div>
                  )}

                  {/* Titre */}
                  <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#e6edf3', marginBottom: 10, lineHeight: 1.25 }}>
                    {projet.titre}
                  </h1>

                  {/* Description */}
                  <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.7, marginBottom: 16, maxWidth: 460 }}>
                    {projet.description}
                  </p>

                  {/* Méta infos */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
                    {projet.annee && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d8590' }}>
                        <span>📅</span> {projet.annee}
                      </div>
                    )}
                    {projet.groupe && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d8590' }}>
                        <span>👥</span> {projet.groupe}
                      </div>
                    )}
                    {projet.duree && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d8590' }}>
                        <span>⏱</span> Durée : {projet.duree}
                      </div>
                    )}
                    <div style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.35)', color: '#3fb950', fontSize: 11, fontWeight: 600 }}>
                      Terminé
                    </div>
                  </div>

                  {/* Tags compétences */}
                  {projet.travaux?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {projet.travaux.slice(0, 5).map((t, i) => {
                        const label = typeof t === 'string' ? t : t.titre;
                        return (
                          <span key={i} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8b949e', fontSize: 11 }}>
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Réalisé par — membres */}
                {membres.length > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #21262d' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#7d8590', marginBottom: 12 }}>Réalisé par</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {membres.map((m, i) => (
                        <Avatar key={i} nom={m.nom} prenom={m.prenom} role={m.role} size={44} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback si pas de membres */}
                {membres.length === 0 && projet.profNom && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #21262d' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#7d8590', marginBottom: 10 }}>Réalisé par</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {projet.profNom?.[0] || 'P'}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{projet.profNom}</div>
                        <div style={{ fontSize: 11, color: '#7d8590' }}>Encadrant</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne droite — image + miniatures */}
              {!isMobile && (
                <div style={{ position: 'relative', borderLeft: '1px solid #21262d', overflow: 'hidden', minHeight: 280 }}>
                  {/* Image principale */}
                  {projet.image ? (
                    <img src={projet.image} alt={projet.titre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1c2128, #161b22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 48, opacity: 0.3 }}>🏭</div>
                    </div>
                  )}

                  {/* Miniatures en bas à droite */}
                  {photosRessources.length > 0 && (
                    <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                      {photosRessources.slice(0, 4).map((r, i) => (
                        <div key={i} style={{ width: 52, height: 40, borderRadius: 6, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer', flexShrink: 0, position: 'relative' }}
                          onClick={() => setPhotoActive(r.url)}>
                          <img src={r.url} alt={r.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                      {photosRessources.length > 4 && (
                        <div style={{ width: 52, height: 40, borderRadius: 6, background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          +{photosRessources.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ══ ONGLETS ══ */}
          <div style={{ borderBottom: '1px solid #21262d', background: '#0d1117', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 0, minWidth: 'max-content', padding: '0 16px' }}>
              {ONGLETS.map(o => (
                <button key={o.id} onClick={() => setOnglet(o.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '12px 12px' : '14px 18px', fontSize: 13, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: onglet === o.id ? '#e6edf3' : '#7d8590', borderBottom: `2px solid ${onglet === o.id ? '#1f6feb' : 'transparent'}`, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 13 }}>{o.icon}</span>
                  {!isMobile && o.label}
                  {isMobile && o.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* ══ CONTENU ONGLETS ══ */}
          <div style={{ padding: isMobile ? '16px 12px' : '20px 24px', background: '#0d1117', minHeight: 400 }}>

            {/* APERÇU */}
            {onglet === 'apercu' && <OngletApercu />}

            {/* CAHIER DES CHARGES */}
            {onglet === 'cahier' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Cahier des charges</h2>
                {projet.cahier ? (
                  <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>{projet.cahier}</p>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                    <p style={{ fontSize: 13 }}>Cahier des charges non renseigné.</p>
                  </div>
                )}
              </div>
            )}

            {/* CONCEPTION */}
            {onglet === 'conception' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Phase de conception</h2>
                {projet.travaux?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {projet.travaux.map((t, i) => {
                      const label = typeof t === 'string' ? t : t.titre;
                      const desc  = typeof t === 'string' ? '' : t.description;
                      return (
                        <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1f3a5f', border: '1px solid #1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#58a6ff' }}>{i + 1}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: desc ? 4 : 0 }}>{label}</div>
                            {desc && <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{desc}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#7d8590', fontSize: 13 }}>Aucune étape de conception renseignée.</p>
                )}
              </div>
            )}

            {/* RÉALISATION */}
            {onglet === 'realisation' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Réalisation du projet</h2>
                {resVideo.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                    {resVideo.map(r => {
                      const id = getYouTubeId(r.url);
                      return (
                        <div key={r.id} style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', position: 'relative' }} onClick={() => setViewerYT(r)}>
                          <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt={r.titre} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ff0000bb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>▶</div>
                          </div>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 12px 10px', background: 'linear-gradient(transparent,rgba(0,0,0,0.8))' }}>
                            <p style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{r.titre}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                    <p style={{ fontSize: 13 }}>Aucune vidéo de réalisation disponible.</p>
                  </div>
                )}
              </div>
            )}

            {/* TESTS & RÉSULTATS */}
            {onglet === 'tests' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Tests & Résultats</h2>
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <p style={{ fontSize: 13 }}>Aucun résultat de test renseigné.</p>
                </div>
              </div>
            )}

            {/* DOCUMENTATION */}
            {onglet === 'documentation' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>Documentation & fichiers</h2>
                  {isProf && (
                    <button onClick={() => setShowFormRessource(true)}
                      style={{ padding: '7px 14px', borderRadius: 8, background: '#1f6feb', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      + Ajouter
                    </button>
                  )}
                </div>
                {resPDF.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                    <p style={{ fontSize: 13 }}>Aucun fichier disponible.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {resPDF.map(r => {
                      const fi = fileIcon(r.type);
                      return (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, cursor: 'pointer' }}
                          onClick={() => window.open(r.url, '_blank')}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: fi.bg, border: `1px solid ${fi.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{fi.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{r.titre}</div>
                            <div style={{ fontSize: 11, color: '#7d8590', marginTop: 2 }}>{r.type?.toUpperCase()}{r.pages ? ` · ${r.pages}` : ''}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ padding: '5px 12px', borderRadius: 6, background: '#21262d', border: '1px solid #30363d', color: '#8b949e', fontSize: 11, fontWeight: 500 }}>↓ Télécharger</div>
                            {isProf && (
                              <button onClick={e => { e.stopPropagation(); handleDeleteRessource(r.id); }}
                                style={{ width: 24, height: 24, borderRadius: 5, background: 'rgba(218,54,51,0.7)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Viewers & modals ── */}
      {viewerYT && <YouTubeViewer url={viewerYT.url} titre={viewerYT.titre} onClose={() => setViewerYT(null)} />}
      {showFormRessource && <FormAjoutRessource projetId={projetId} user={user} userData={userData} onClose={() => setShowFormRessource(false)} />}

      {/* Photo plein écran */}
      {photoActive && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setPhotoActive(null)}>
          <img src={photoActive} alt="photo" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }} />
          <button onClick={() => setPhotoActive(null)} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}