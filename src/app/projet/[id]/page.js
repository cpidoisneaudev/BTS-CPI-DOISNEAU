// /app/projet/[id]/page.js — V4 avec édition complète + carousels
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  doc, getDoc, updateDoc, collection, onSnapshot, addDoc, deleteDoc,
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

// ── Carousel Photos ────────────────────────────────────────────────────────────
function CarouselPhotos({ photos, onPhotoClick }) {
  const [idx, setIdx] = useState(0);
  if (!photos || photos.length === 0) return null;
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);
  const photo = photos[idx];
  return (
    <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#0d1117', aspectRatio: '16/9' }}>
      <img
        src={typeof photo === 'string' ? photo : photo.url}
        alt={typeof photo === 'string' ? '' : (photo.caption || '')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
        onClick={() => onPhotoClick && onPhotoClick(typeof photo === 'string' ? photo : photo.url)}
      />
      {photos.length > 1 && (
        <>
          {/* Flèches */}
          <button onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>‹</button>
          <button onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>›</button>
          {/* Dots */}
          <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {photos.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }} />
            ))}
          </div>
          {/* Compteur */}
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 99, padding: '2px 8px', fontSize: 11, color: '#fff', backdropFilter: 'blur(4px)' }}>
            {idx + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  );
}

// ── Carousel Vidéos ────────────────────────────────────────────────────────────
function CarouselVideos({ videos, onPlay }) {
  const [idx, setIdx] = useState(0);
  if (!videos || videos.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
      <p style={{ fontSize: 13 }}>Aucune vidéo de réalisation disponible.</p>
    </div>
  );
  const prev = () => setIdx(i => (i - 1 + videos.length) % videos.length);
  const next = () => setIdx(i => (i + 1) % videos.length);
  const vid = videos[idx];
  const ytId = getYouTubeId(vid.url || vid.youtubeUrl);
  return (
    <div>
      {/* Vidéo principale */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', marginBottom: 14 }} onClick={() => onPlay(vid)}>
        <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={vid.titre} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ff0000cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>▶</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 12px', background: 'linear-gradient(transparent,rgba(0,0,0,0.85))' }}>
          <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{vid.titre}</p>
        </div>
        {videos.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </>
        )}
      </div>
      {/* Miniatures */}
      {videos.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {videos.map((v, i) => {
            const id = getYouTubeId(v.url || v.youtubeUrl);
            return (
              <div key={i} onClick={() => setIdx(i)} style={{ flexShrink: 0, width: 100, borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === idx ? '#1f6feb' : 'transparent'}`, cursor: 'pointer', position: 'relative' }}>
                <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt={v.titre} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>▶</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Compteur */}
      {videos.length > 1 && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#7d8590' }}>{idx + 1} / {videos.length} vidéos</div>
      )}
    </div>
  );
}

// ── Éditeur Riche simple ───────────────────────────────────────────────────────
function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); ref.current?.focus(); };
  const btnStyle = (active) => ({
    padding: '4px 10px', borderRadius: 6, border: `1px solid ${active ? '#1f6feb' : '#30363d'}`,
    background: active ? '#1f6feb22' : '#21262d', color: active ? '#58a6ff' : '#8b949e',
    fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 400,
  });
  return (
    <div style={{ border: '1px solid #30363d', borderRadius: 10, overflow: 'hidden', background: '#0d1117' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 10px', borderBottom: '1px solid #21262d', background: '#161b22', flexWrap: 'wrap' }}>
        <button style={btnStyle(false)} onClick={() => exec('bold')}><b>G</b></button>
        <button style={btnStyle(false)} onClick={() => exec('italic')}><i>I</i></button>
        <button style={btnStyle(false)} onClick={() => exec('underline')}><u>U</u></button>
        <div style={{ width: 1, background: '#30363d', margin: '0 4px' }} />
        <button style={btnStyle(false)} onClick={() => exec('formatBlock', 'h2')} title="Titre">H2</button>
        <button style={btnStyle(false)} onClick={() => exec('formatBlock', 'h3')} title="Sous-titre">H3</button>
        <button style={btnStyle(false)} onClick={() => exec('formatBlock', 'p')} title="Paragraphe">¶</button>
        <div style={{ width: 1, background: '#30363d', margin: '0 4px' }} />
        <button style={btnStyle(false)} onClick={() => exec('insertUnorderedList')}>• Liste</button>
        <button style={btnStyle(false)} onClick={() => exec('insertOrderedList')}>1. Liste</button>
        <div style={{ width: 1, background: '#30363d', margin: '0 4px' }} />
        <button style={{ ...btnStyle(false), color: '#f85149' }} onClick={() => exec('removeFormat')}>✕ Format</button>
      </div>
      {/* Zone édition */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        style={{ padding: 16, minHeight: 200, color: '#e6edf3', fontSize: 13, lineHeight: 1.8, outline: 'none' }}
      />
    </div>
  );
}

// ── Affichage HTML riche ───────────────────────────────────────────────────────
function RichContent({ html }) {
  if (!html) return null;
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ fontSize: 13, color: '#c9d1d9', lineHeight: 1.8 }}
    />
  );
}

// ── Modal ajout ressource classique ───────────────────────────────────────────
function FormAjoutRessource({ projetId, user, userData, onClose }) {
  const [form, setForm] = useState({ titre: '', type: 'pdf', url: '', duree: '', pages: '', niveau: 'Débutant' });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/ressource/upload', { method: 'POST', body: fd });
      const data = await res.json();
      setForm(p => ({ ...p, url: data.url }));
    } catch { alert('Erreur upload'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.titre.trim() || !form.url.trim()) { alert('Titre et fichier requis'); return; }
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
            <input style={inp} value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex: Dossier technique" />
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
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 5 }}>Fichier *</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: form.url ? '#3fb950' : '#8b949e' }}>
                  {uploading ? 'Upload...' : form.url ? '✓ Fichier chargé' : `Choisir un ${form.type.toUpperCase()}`}
                </span>
                <input type="file" accept={form.type === 'pdf' ? '.pdf' : '.zip,.rar,.7z,.sldprt,.sldasm,.CATPart,.CATProduct'} onChange={e => handleUpload(e.target.files?.[0])} disabled={uploading} style={{ display: 'none' }} />
              </label>
            </div>
          )}
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

// ── Modal Édition Contenu (PROF) ───────────────────────────────────────────────
function ModalEditionContenu({ projet, projetId, user, userData, onClose, onSaved }) {
  const [tab, setTab] = useState('cahier');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // États des champs
  const [cahier, setCahier] = useState(projet.cahierDesCharges || '');
  const [tests, setTests] = useState(projet.testsResultats || '');

  // Conception — étapes
  const [etapes, setEtapes] = useState(
    projet.conceptionEtapes?.length > 0 ? projet.conceptionEtapes : []
  );
  const [newEtape, setNewEtape] = useState({ titre: '', description: '', fichierUrl: '', fichierNom: '' });
  const [uploadingEtape, setUploadingEtape] = useState(false);

  // Réalisation — vidéos
  const [videos, setVideos] = useState(
    projet.realisationVideos?.length > 0 ? projet.realisationVideos : []
  );
  const [newVideo, setNewVideo] = useState({ titre: '', youtubeUrl: '' });

  // Photos du hero (carousel)
  const [photos, setPhotos] = useState(
    projet.photos?.length > 0 ? projet.photos : (projet.image ? [{ url: projet.image, caption: '' }] : [])
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Infos générales
  const [infos, setInfos] = useState({
    description: projet.description || '',
    duree: projet.duree || '',
    annee: projet.annee || '',
    groupe: projet.groupe || '',
    type: projet.type || 'Prototypage',
    niveau: projet.niveau || 'Intermédiaire',
    statut: projet.statut || 'publié',
    livrables: projet.livrables || [],
    travaux: projet.travaux || [],
  });
  const [newLivrable, setNewLivrable] = useState('');
  const [newTravail, setNewTravail] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const setInfo = (k, v) => setInfos(p => ({ ...p, [k]: v }));

  const addLivrable = () => {
    if (!newLivrable.trim()) return;
    setInfo('livrables', [...infos.livrables, newLivrable.trim()]);
    setNewLivrable('');
  };
  const removeLivrable = (i) => setInfo('livrables', infos.livrables.filter((_, j) => j !== i));

  const addTravail = () => {
    if (!newTravail.trim()) return;
    setInfo('travaux', [...infos.travaux, newTravail.trim()]);
    setNewTravail('');
  };
  const removeTravail = (i) => setInfo('travaux', infos.travaux.filter((_, j) => j !== i));

  const handleUploadImagePrincipale = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/ressource/upload', { method: 'POST', body: fd });
      const data = await res.json();
      // Met à jour la première photo (image principale)
      setPhotos(prev => {
        const updated = [...prev];
        if (updated.length > 0) updated[0] = { url: data.url, caption: '' };
        else updated.push({ url: data.url, caption: '' });
        return updated;
      });
    } catch { alert('Erreur upload image'); }
    finally { setUploadingImage(false); }
  };

  const inp = { width: '100%', padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  // Upload photo
  const handleUploadPhoto = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/ressource/upload', { method: 'POST', body: fd });
      const data = await res.json();
      setPhotos(p => [...p, { url: data.url, caption: file.name.replace(/\.[^.]+$/, '') }]);
    } catch { alert('Erreur upload photo'); }
    finally { setUploadingPhoto(false); }
  };

  // Upload fichier étape
  const handleUploadFichierEtape = async (file) => {
    if (!file) return;
    setUploadingEtape(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/ressource/upload', { method: 'POST', body: fd });
      const data = await res.json();
      setNewEtape(p => ({ ...p, fichierUrl: data.url, fichierNom: file.name }));
    } catch { alert('Erreur upload'); }
    finally { setUploadingEtape(false); }
  };

  const addEtape = () => {
    if (!newEtape.titre.trim()) return;
    setEtapes(p => [...p, { ...newEtape }]);
    setNewEtape({ titre: '', description: '', fichierUrl: '', fichierNom: '' });
  };

  const removeEtape = (i) => setEtapes(p => p.filter((_, j) => j !== i));

  const addVideo = () => {
    if (!newVideo.titre.trim() || !newVideo.youtubeUrl.trim()) return;
    setVideos(p => [...p, { ...newVideo }]);
    setNewVideo({ titre: '', youtubeUrl: '' });
  };

  const removeVideo = (i) => setVideos(p => p.filter((_, j) => j !== i));
  const removePhoto = (i) => setPhotos(p => p.filter((_, j) => j !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'projets', projetId), {
        description: infos.description,
        duree: infos.duree,
        annee: infos.annee,
        groupe: infos.groupe,
        type: infos.type,
        niveau: infos.niveau,
        statut: infos.statut,
        livrables: infos.livrables,
        travaux: infos.travaux,
        image: photos[0]?.url || projet.image || '',
        cahierDesCharges: cahier,
        testsResultats: tests,
        conceptionEtapes: etapes,
        realisationVideos: videos,
        photos: photos,
        updatedAt: serverTimestamp(),
      });
      onSaved();
      onClose();
    } catch (e) { console.error(e); alert('Erreur de sauvegarde'); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: 'infos',       label: '📝 Infos générales' },
    { id: 'cahier',      label: '📄 Cahier des charges' },
    { id: 'conception',  label: '⚙️ Conception' },
    { id: 'realisation', label: '🎬 Réalisation' },
    { id: 'tests',       label: '✅ Tests & Résultats' },
    { id: 'photos',      label: '🖼 Photos' },
  ];

  const TYPES = ['Prototypage', 'Collaboratif CPRP', 'Projet final'];
  const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé'];
  const ANNEES = ['2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'];
  const GROUPES = ['Groupe A', 'Groupe B', 'Groupe de 2', 'Groupe de 3', 'Groupe de 4', 'Groupe de 5', 'Binôme CPI / CPRP'];
  const typeColors = {
    'Prototypage':       { active: '#58a6ff', activeBg: 'rgba(31,107,235,0.2)', border: 'rgba(31,107,235,0.5)' },
    'Collaboratif CPRP': { active: '#e07b39', activeBg: 'rgba(224,123,57,0.2)',  border: 'rgba(224,123,57,0.5)' },
    'Projet final':      { active: '#9d95e8', activeBg: 'rgba(157,149,232,0.2)', border: 'rgba(157,149,232,0.5)' },
  };
  const niveauColors = { 'Débutant': '#3fb950', 'Intermédiaire': '#d29922', 'Avancé': '#f85149' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16 }}>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ color: '#e6edf3', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>✏️ Éditer le contenu</h2>
            <p style={{ color: '#7d8590', fontSize: 12 }}>{projet.titre}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #21262d', overflowX: 'auto', flexShrink: 0, background: '#0d1117' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '10px 14px', fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: tab === t.id ? '#e6edf3' : '#7d8590', borderBottom: `2px solid ${tab === t.id ? '#1f6feb' : 'transparent'}`, whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* INFOS GÉNÉRALES */}
          {tab === 'infos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <p style={{ fontSize: 12, color: '#8b949e', marginBottom: -4 }}>Modifiez les informations de base du projet. Ces données alimentent la fiche projet et les filtres.</p>

              {/* Description */}
              <div>
                <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Description / Résumé *</label>
                <textarea
                  value={infos.description}
                  onChange={e => setInfo('description', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 90, resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Décrivez le projet, son contexte et ses objectifs..." />
              </div>

              {/* Type + Durée */}
              <div>
                <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Type de projet</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TYPES.map(t => {
                    const c = typeColors[t];
                    return (
                      <button key={t} onClick={() => setInfo('type', t)}
                        style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${infos.type === t ? c.border : '#30363d'}`, background: infos.type === t ? c.activeBg : 'transparent', color: infos.type === t ? c.active : '#8b949e' }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Année + Groupe + Durée */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Année scolaire</label>
                  <select value={infos.annee} onChange={e => setInfo('annee', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12, outline: 'none' }}>
                    {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Groupe</label>
                  <select value={infos.groupe} onChange={e => setInfo('groupe', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12, outline: 'none' }}>
                    <option value="">-- Sélectionner --</option>
                    {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Durée</label>
                  <input value={infos.duree} onChange={e => setInfo('duree', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} placeholder="Ex: 6 semaines" />
                </div>
              </div>

              {/* Niveau + Statut */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Niveau</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {NIVEAUX.map(n => (
                      <button key={n} onClick={() => setInfo('niveau', n)}
                        style={{ flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${infos.niveau === n ? niveauColors[n] + '88' : '#30363d'}`, background: infos.niveau === n ? niveauColors[n] + '22' : 'transparent', color: infos.niveau === n ? niveauColors[n] : '#8b949e' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Visibilité</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'publié', label: '✅ Publié', color: '#3fb950' }, { v: 'brouillon', label: '🔒 Brouillon', color: '#8b949e' }].map(({ v, label, color }) => (
                      <button key={v} onClick={() => setInfo('statut', v)}
                        style={{ flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${infos.statut === v ? color + '88' : '#30363d'}`, background: infos.statut === v ? color + '22' : 'transparent', color: infos.statut === v ? color : '#8b949e' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Livrables (Objectifs) */}
              <div>
                <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Livrables attendus <span style={{ color: '#7d8590', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(= Objectifs affichés)</span></label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input value={newLivrable} onChange={e => setNewLivrable(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLivrable()}
                    style={{ flex: 1, padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none' }}
                    placeholder="Ex: Fichiers CAO, Mise en plan, Calculs RDM..." />
                  <button onClick={addLivrable} style={{ padding: '8px 14px', borderRadius: 8, background: '#1f6feb', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>+</button>
                </div>
                {infos.livrables.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {infos.livrables.map((l, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d1117', border: '1px solid #21262d', borderRadius: 7, padding: '7px 10px' }}>
                        <span style={{ color: '#3fb950', fontSize: 12, flexShrink: 0 }}>✓</span>
                        <span style={{ flex: 1, fontSize: 12, color: '#c9d1d9' }}>{l}</span>
                        <button onClick={() => removeLivrable(i)} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ fontSize: 11, color: '#484f58' }}>Aucun livrable — ils apparaîtront dans "Objectifs"</p>}
              </div>

              {/* Travaux (Compétences + Étapes) */}
              <div>
                <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Travaux à réaliser <span style={{ color: '#7d8590', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(= Compétences + Étapes du projet)</span></label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input value={newTravail} onChange={e => setNewTravail(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTravail()}
                    style={{ flex: 1, padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none' }}
                    placeholder="Ex: Modélisation 3D SolidWorks, Calcul RDM..." />
                  <button onClick={addTravail} style={{ padding: '8px 14px', borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 13, cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>+</button>
                </div>
                {infos.travaux.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {infos.travaux.map((t, i) => {
                      const label = typeof t === 'string' ? t : t.titre;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d1117', border: '1px solid #21262d', borderRadius: 7, padding: '7px 10px' }}>
                          <span style={{ color: '#58a6ff', fontSize: 12, flexShrink: 0 }}>→</span>
                          <span style={{ flex: 1, fontSize: 12, color: '#c9d1d9' }}>{label}</span>
                          <button onClick={() => removeTravail(i)} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                ) : <p style={{ fontSize: 11, color: '#484f58' }}>Aucun travail — ils apparaîtront dans "Compétences" et "Étapes"</p>}
              </div>

              {/* Image principale */}
              <div>
                <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Image principale du projet</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {photos[0]?.url && (
                    <img src={photos[0].url} alt="preview" style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, border: '1px solid #30363d', flexShrink: 0 }} />
                  )}
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '16px 12px', background: '#0d1117', border: '2px dashed #30363d', borderRadius: 8, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#1f6feb'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}>
                    <span style={{ fontSize: 20 }}>{uploadingImage ? '⏳' : '🖼️'}</span>
                    <span style={{ fontSize: 12, color: '#58a6ff', fontWeight: 500 }}>{uploadingImage ? 'Upload...' : photos[0]?.url ? "Changer l'image" : 'Choisir une image'}</span>
                    <input type="file" accept="image/*" onChange={e => handleUploadImagePrincipale(e.target.files?.[0])} disabled={uploadingImage} style={{ display: 'none' }} />
                  </label>
                </div>
                <p style={{ fontSize: 11, color: '#7d8590', marginTop: 6 }}>💡 Cette image apparaît aussi dans le carousel du hero. Vous pouvez ajouter d'autres photos dans l'onglet "🖼 Photos".</p>
              </div>
            </div>
          )}

          {/* CAHIER DES CHARGES */}
          {tab === 'cahier' && (
            <div>
              <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 10 }}>Rédigez le cahier des charges du projet. Vous pouvez utiliser la mise en forme (titres, listes, gras...).</p>
              <RichEditor value={cahier} onChange={setCahier} />
            </div>
          )}

          {/* CONCEPTION — ÉTAPES */}
          {tab === 'conception' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 12, color: '#8b949e' }}>Décrivez les étapes de conception du projet. Vous pouvez joindre un fichier à chaque étape.</p>

              {/* Liste des étapes existantes */}
              {etapes.map((e, i) => (
                <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1f3a5f', border: '1px solid #1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#58a6ff', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>{e.titre}</div>
                    {e.description && <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6, marginBottom: 4 }}>{e.description}</div>}
                    {e.fichierNom && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: '#1f6feb22', border: '1px solid #1f6feb44', borderRadius: 6, fontSize: 11, color: '#58a6ff' }}>
                        📎 {e.fichierNom}
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeEtape(i)} style={{ width: 24, height: 24, borderRadius: 5, background: 'rgba(218,54,51,0.2)', border: '1px solid rgba(218,54,51,0.4)', color: '#f85149', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                </div>
              ))}

              {/* Ajouter une étape */}
              <div style={{ background: '#0d1117', border: '1px dashed #30363d', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 12, color: '#58a6ff', fontWeight: 600, marginBottom: 2 }}>+ Nouvelle étape</p>
                <input style={inp} value={newEtape.titre} onChange={e => setNewEtape(p => ({ ...p, titre: e.target.value }))} placeholder="Titre de l'étape *" />
                <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} value={newEtape.description} onChange={e => setNewEtape(p => ({ ...p, description: e.target.value }))} placeholder="Description (optionnel)" />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: '#21262d', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: newEtape.fichierNom ? '#3fb950' : '#8b949e', flex: 1 }}>
                    {uploadingEtape ? '⏳ Upload...' : newEtape.fichierNom ? `📎 ${newEtape.fichierNom}` : '📎 Joindre un fichier (PDF, CAO...)'}
                    <input type="file" accept=".pdf,.zip,.sldprt,.sldasm,.CATPart,.CATProduct,.dwg,.dxf" onChange={e => handleUploadFichierEtape(e.target.files?.[0])} disabled={uploadingEtape} style={{ display: 'none' }} />
                  </label>
                  <button onClick={addEtape} disabled={!newEtape.titre.trim()} style={{ padding: '7px 16px', borderRadius: 8, background: newEtape.titre.trim() ? '#1f6feb' : '#21262d', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: newEtape.titre.trim() ? 'pointer' : 'default' }}>
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RÉALISATION — VIDÉOS */}
          {tab === 'realisation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 12, color: '#8b949e' }}>Ajoutez les vidéos de réalisation du projet (YouTube). Elles seront affichées en carousel.</p>

              {/* Vidéos existantes */}
              {videos.map((v, i) => {
                const ytId = getYouTubeId(v.youtubeUrl || v.url);
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: 12, alignItems: 'center' }}>
                    {ytId && <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.titre} style={{ width: 80, borderRadius: 6, aspectRatio: '16/9', objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{v.titre}</div>
                      <div style={{ fontSize: 11, color: '#7d8590', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.youtubeUrl || v.url}</div>
                    </div>
                    <button onClick={() => removeVideo(i)} style={{ width: 24, height: 24, borderRadius: 5, background: 'rgba(218,54,51,0.2)', border: '1px solid rgba(218,54,51,0.4)', color: '#f85149', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  </div>
                );
              })}

              {/* Ajouter une vidéo */}
              <div style={{ background: '#0d1117', border: '1px dashed #30363d', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 12, color: '#58a6ff', fontWeight: 600, marginBottom: 2 }}>+ Nouvelle vidéo</p>
                <input style={inp} value={newVideo.titre} onChange={e => setNewVideo(p => ({ ...p, titre: e.target.value }))} placeholder="Titre de la vidéo *" />
                <input style={inp} value={newVideo.youtubeUrl} onChange={e => setNewVideo(p => ({ ...p, youtubeUrl: e.target.value }))} placeholder="URL YouTube * (https://youtube.com/watch?v=...)" />
                <button onClick={addVideo} disabled={!newVideo.titre.trim() || !newVideo.youtubeUrl.trim()} style={{ padding: '8px 16px', borderRadius: 8, background: (newVideo.titre.trim() && newVideo.youtubeUrl.trim()) ? '#1f6feb' : '#21262d', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: (newVideo.titre.trim() && newVideo.youtubeUrl.trim()) ? 'pointer' : 'default', alignSelf: 'flex-end' }}>
                  Ajouter la vidéo
                </button>
              </div>
            </div>
          )}

          {/* TESTS & RÉSULTATS */}
          {tab === 'tests' && (
            <div>
              <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 10 }}>Décrivez les tests effectués et les résultats obtenus.</p>
              <RichEditor value={tests} onChange={setTests} />
            </div>
          )}

          {/* PHOTOS — CAROUSEL */}
          {tab === 'photos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 12, color: '#8b949e' }}>Ajoutez plusieurs photos du projet. Elles seront affichées en carousel dans le hero et l'onglet Aperçu.</p>

              {/* Grille photos */}
              {photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {photos.map((p, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3', background: '#0d1117' }}>
                      <img src={p.url || p} alt={p.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.0)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                        <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 5, background: 'rgba(218,54,51,0.85)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        <div style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 11, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)', padding: '1px 6px', borderRadius: 4 }}>#{i + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload photo */}
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px 16px', background: '#0d1117', border: '2px dashed #30363d', borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#1f6feb'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}>
                <div style={{ fontSize: 28 }}>{uploadingPhoto ? '⏳' : '🖼'}</div>
                <p style={{ fontSize: 13, color: '#58a6ff', fontWeight: 600 }}>{uploadingPhoto ? 'Upload en cours...' : 'Cliquer pour ajouter une photo'}</p>
                <p style={{ fontSize: 11, color: '#7d8590' }}>JPG, PNG, WebP — plusieurs uploads possibles</p>
                <input type="file" accept="image/*" onChange={e => handleUploadPhoto(e.target.files?.[0])} disabled={uploadingPhoto} style={{ display: 'none' }} multiple />
              </label>

              {photos.length === 0 && (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#7d8590' }}>Aucune photo ajoutée. L'image principale du projet sera utilisée par défaut.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer — Boutons */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #21262d', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0, background: '#161b22' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 24px', borderRadius: 8, background: saving ? '#1a3a5f' : '#1f6feb', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? '⏳ Sauvegarde...' : '✓ Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
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

// ══ PAGE PRINCIPALE ═══════════════════════════════════════════════════════════
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
  const [showEdition, setShowEdition] = useState(false);
  const [photoActive, setPhotoActive] = useState(null);
  const [heroPhotoIdx, setHeroPhotoIdx] = useState(0);

  const isProf = userData?.role === 'PROF' || userData?.role === 'ADMIN';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  const loadProjet = () => {
    if (!projetId) return;
    getDoc(doc(db, 'projets', projetId)).then(snap => {
      if (snap.exists()) setProjet({ id: snap.id, ...snap.data() });
      else router.push('/dashboard/projet');
      setLoadingProjet(false);
    }).catch(() => setLoadingProjet(false));
  };

  useEffect(() => { loadProjet(); }, [projetId]);

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

  // Données enrichies
  const photos = projet.photos?.length > 0 ? projet.photos : (projet.image ? [{ url: projet.image, caption: '' }] : []);
  const realisationVideos = projet.realisationVideos?.length > 0 ? projet.realisationVideos : [];
  const conceptionEtapes = projet.conceptionEtapes || [];

  const resPDF   = ressources.filter(r => r.type === 'pdf' || r.type === 'zip');
  const resVideo = ressources.filter(r => r.type === 'youtube');
  const membres  = projet.membres || [];

  // Hero photo carousel
  const heroPrev = () => setHeroPhotoIdx(i => (i - 1 + photos.length) % photos.length);
  const heroNext = () => setHeroPhotoIdx(i => (i + 1) % photos.length);

  const fileIcon = (type) => {
    if (type === 'youtube') return { icon: '▶', bg: '#ff000022', color: '#ff4444', border: '#ff000044' };
    if (type === 'zip')     return { icon: '📦', bg: '#d2992222', color: '#d29922', border: '#d2992244' };
    return                         { icon: '📄', bg: '#1f6feb22', color: '#58a6ff', border: '#1f6feb44' };
  };

  const ONGLETS = [
    { id: 'apercu',        label: 'Aperçu',             icon: '👁' },
    { id: 'cahier',        label: 'Cahier des charges',  icon: '📄' },
    { id: 'conception',    label: 'Conception',          icon: '⚙️' },
    { id: 'realisation',   label: 'Réalisation',         icon: '🔨' },
    { id: 'tests',         label: 'Tests & Résultats',   icon: '✅' },
    { id: 'documentation', label: 'Documentation',       icon: '📋' },
  ];

  // ── Onglet Aperçu ──────────────────────────────────────────────────────────
  const OngletApercu = () => (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 16, alignItems: 'start' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Résumé */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Résumé du projet</h3>
          <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>{projet.description || 'Aucune description.'}</p>
        </div>

        {/* Objectifs + Compétences */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
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

        {/* Timeline */}
        {projet.travaux?.length > 0 && (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Étapes du projet</h3>
            <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: projet.travaux.length > 4 ? 'max-content' : 'auto', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 15, left: '5%', right: '5%', height: 2, background: 'linear-gradient(90deg, #1f6feb, #7c3aed, #9d95e8)', borderRadius: 1, zIndex: 0 }} />
                {projet.travaux.map((t, i) => {
                  const label = typeof t === 'string' ? t : t.titre;
                  const desc  = typeof t === 'string' ? '' : t.description;
                  const colors = ['#1f6feb', '#2a7ef8', '#4a5be8', '#7c3aed', '#8b5cf6', '#9d95e8'];
                  const c = colors[i % colors.length];
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 0 auto', minWidth: isMobile ? 80 : 100, position: 'relative', zIndex: 1, padding: '0 4px' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 10, border: '2px solid #0d1117', boxShadow: `0 0 0 3px ${c}40` }}>{i + 1}</div>
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

        {/* Carousel photos + Vidéo présentation */}
        <div style={{ display: 'grid', gridTemplateColumns: photos.length > 0 && realisationVideos.length > 0 ? (isMobile ? '1fr' : '1fr 1fr') : '1fr', gap: 14 }}>
          {photos.length > 0 && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Photos du projet</h3>
              <CarouselPhotos photos={photos} onPhotoClick={setPhotoActive} />
            </div>
          )}
          {realisationVideos.length > 0 && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Vidéo de présentation</h3>
              <CarouselVideos videos={[realisationVideos[0]]} onPlay={v => setViewerYT({ url: v.youtubeUrl || v.url, titre: v.titre })} />
            </div>
          )}
        </div>
      </div>

      {/* Colonne droite */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 14 : 20, position: isMobile ? 'static' : 'sticky', top: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>
              Fichiers et ressources
              {ressources.length > 0 && <span style={{ fontSize: 11, color: '#7d8590', fontWeight: 400, marginLeft: 6 }}>({ressources.length})</span>}
            </h3>
            {isProf && (
              <button onClick={() => setShowFormRessource(true)} style={{ padding: '5px 12px', borderRadius: 8, background: '#1f6feb', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>+ Ajouter</button>
            )}
          </div>
          {ressources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📂</div>
              <p style={{ fontSize: 12, color: '#7d8590' }}>{isProf ? 'Cliquez sur "+ Ajouter"' : 'Aucune ressource disponible'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ressources.map(r => {
                const fi = fileIcon(r.type);
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, cursor: 'pointer' }}
                    onClick={() => r.type === 'youtube' ? setViewerYT({ url: r.url, titre: r.titre }) : window.open(r.url, '_blank')}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: fi.bg, border: `1px solid ${fi.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{fi.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.titre}</div>
                      <div style={{ fontSize: 10, color: '#7d8590', marginTop: 1 }}>{r.type === 'youtube' ? 'YouTube' : r.type?.toUpperCase()}{r.pages ? ` · ${r.pages}` : ''}{r.duree ? ` · ${r.duree}` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {r.type !== 'youtube' && <div style={{ width: 24, height: 24, borderRadius: 6, background: '#21262d', border: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#8b949e' }}>↓</div>}
                      {isProf && (
                        <button onClick={e => { e.stopPropagation(); handleDeleteRessource(r.id); }} style={{ width: 22, height: 22, borderRadius: 4, background: 'rgba(218,54,51,0.7)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
      <div onClick={() => router.push('/dashboard/projet')} style={{ position: 'fixed', inset: 0, background: 'rgba(1,4,9,0.75)', backdropFilter: 'blur(6px)', zIndex: 100 }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: isMobile ? '0' : '24px 16px' }}>
        <div style={{ background: '#0d1117', border: isMobile ? 'none' : '1px solid #21262d', borderRadius: isMobile ? 0 : 16, width: '100%', maxWidth: 960, minHeight: isMobile ? '100vh' : 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}>

          {/* HERO */}
          <div style={{ position: 'relative', background: '#161b22', borderBottom: '1px solid #21262d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '12px 16px' : '14px 24px', borderBottom: '1px solid #21262d' }}>
              <button onClick={() => router.push('/dashboard/projet')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8b949e', fontSize: 13, cursor: 'pointer', padding: 0 }}>
                ← Retour aux projets
              </button>
              <button onClick={() => router.push('/dashboard/projet')} style={{ width: 30, height: 30, borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 0, minHeight: isMobile ? 'auto' : 280 }}>
              {/* Texte gauche */}
              <div style={{ padding: isMobile ? '20px 16px' : '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {projet.type && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 6, background: tb.bg, border: `1px solid ${tb.border}`, color: tb.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                      {projet.type === 'Projet final' ? 'PROJET FINAL (6 MOIS)' : projet.type?.toUpperCase()}
                    </div>
                  )}
                  <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#e6edf3', marginBottom: 10, lineHeight: 1.25 }}>{projet.titre}</h1>
                  <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.7, marginBottom: 16, maxWidth: 460 }}>{projet.description}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
                    {projet.annee && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d8590' }}><span>📅</span> {projet.annee}</div>}
                    {projet.groupe && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d8590' }}><span>👥</span> {projet.groupe}</div>}
                    {projet.duree && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d8590' }}><span>⏱</span> Durée : {projet.duree}</div>}
                    <div style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.35)', color: '#3fb950', fontSize: 11, fontWeight: 600 }}>Terminé</div>
                  </div>
                  {projet.travaux?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {projet.travaux.slice(0, 5).map((t, i) => {
                        const label = typeof t === 'string' ? t : t.titre;
                        return <span key={i} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8b949e', fontSize: 11 }}>{label}</span>;
                      })}
                    </div>
                  )}
                </div>
                {/* Membres */}
                {membres.length > 0 ? (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #21262d' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#7d8590', marginBottom: 12 }}>Réalisé par</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {membres.map((m, i) => <Avatar key={i} nom={m.nom} prenom={m.prenom} role={m.role} size={44} />)}
                    </div>
                  </div>
                ) : projet.profNom && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #21262d' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#7d8590', marginBottom: 10 }}>Réalisé par</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{projet.profNom?.[0] || 'P'}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{projet.profNom}</div>
                        <div style={{ fontSize: 11, color: '#7d8590' }}>Encadrant</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image droite — CAROUSEL */}
              {!isMobile && (
                <div style={{ position: 'relative', borderLeft: '1px solid #21262d', overflow: 'hidden', minHeight: 280 }}>
                  {photos.length > 0 ? (
                    <>
                      <img
                        src={typeof photos[heroPhotoIdx] === 'string' ? photos[heroPhotoIdx] : photos[heroPhotoIdx]?.url}
                        alt={projet.titre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }}
                      />
                      {/* Miniatures */}
                      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                        {photos.map((p, i) => (
                          <div key={i} onClick={() => setHeroPhotoIdx(i)} style={{ width: 52, height: 40, borderRadius: 6, overflow: 'hidden', border: `2px solid ${i === heroPhotoIdx ? '#1f6feb' : 'rgba(255,255,255,0.2)'}`, cursor: 'pointer', flexShrink: 0 }}>
                            <img src={typeof p === 'string' ? p : p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                      {/* Flèches hero */}
                      {photos.length > 1 && (
                        <>
                          <button onClick={heroPrev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                          <button onClick={heroNext} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                        </>
                      )}
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1c2128, #161b22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 48, opacity: 0.3 }}>🏭</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ONGLETS */}
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

          {/* CONTENU ONGLETS */}
          <div style={{ padding: isMobile ? '16px 12px' : '20px 24px', background: '#0d1117', minHeight: 400 }}>

            {onglet === 'apercu' && <OngletApercu />}

            {/* CAHIER DES CHARGES */}
            {onglet === 'cahier' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Cahier des charges</h2>
                {projet.cahierDesCharges ? (
                  <>
                    <RichContent html={projet.cahierDesCharges} />
                    <style>{`
                      .rich-content h2 { font-size:16px; font-weight:700; color:#e6edf3; margin:16px 0 8px; }
                      .rich-content h3 { font-size:14px; font-weight:600; color:#c9d1d9; margin:12px 0 6px; }
                      .rich-content ul { padding-left:20px; color:#c9d1d9; }
                      .rich-content ol { padding-left:20px; color:#c9d1d9; }
                      .rich-content li { margin-bottom:4px; font-size:13px; }
                      .rich-content b { color:#e6edf3; }
                      .rich-content strong { color:#e6edf3; }
                    `}</style>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                    <p style={{ fontSize: 13 }}>Cahier des charges non renseigné.</p>
                    {isProf && <p style={{ fontSize: 12, color: '#58a6ff', marginTop: 8, cursor: 'pointer' }} onClick={() => setShowEdition(true)}>✏️ Cliquez sur le bouton éditer pour le renseigner</p>}
                  </div>
                )}
              </div>
            )}

            {/* CONCEPTION */}
            {onglet === 'conception' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Phase de conception</h2>
                {conceptionEtapes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {conceptionEtapes.map((e, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 18px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1f3a5f', border: '1px solid #1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#58a6ff' }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: e.description ? 6 : 0 }}>{e.titre}</div>
                          {e.description && <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6, marginBottom: e.fichierNom ? 8 : 0 }}>{e.description}</div>}
                          {e.fichierNom && (
                            <a href={e.fichierUrl} target="_blank" rel="noreferrer" onClick={ev => ev.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#1f6feb22', border: '1px solid #1f6feb44', borderRadius: 6, fontSize: 11, color: '#58a6ff', textDecoration: 'none' }}>
                              📎 {e.fichierNom} <span style={{ fontSize: 10, opacity: 0.7 }}>↓</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⚙️</div>
                    <p style={{ fontSize: 13 }}>Aucune étape de conception renseignée.</p>
                    {isProf && <p style={{ fontSize: 12, color: '#58a6ff', marginTop: 8, cursor: 'pointer' }} onClick={() => setShowEdition(true)}>✏️ Cliquez sur le bouton éditer pour ajouter des étapes</p>}
                  </div>
                )}
              </div>
            )}

            {/* RÉALISATION */}
            {onglet === 'realisation' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Réalisation du projet</h2>
                {realisationVideos.length > 0 ? (
                  <CarouselVideos videos={realisationVideos} onPlay={v => setViewerYT({ url: v.youtubeUrl || v.url, titre: v.titre })} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                    <p style={{ fontSize: 13 }}>Aucune vidéo de réalisation disponible.</p>
                    {isProf && <p style={{ fontSize: 12, color: '#58a6ff', marginTop: 8, cursor: 'pointer' }} onClick={() => setShowEdition(true)}>✏️ Cliquez sur le bouton éditer pour ajouter des vidéos</p>}
                  </div>
                )}
              </div>
            )}

            {/* TESTS */}
            {onglet === 'tests' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Tests & Résultats</h2>
                {projet.testsResultats ? (
                  <RichContent html={projet.testsResultats} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#7d8590' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <p style={{ fontSize: 13 }}>Aucun résultat de test renseigné.</p>
                    {isProf && <p style={{ fontSize: 12, color: '#58a6ff', marginTop: 8, cursor: 'pointer' }} onClick={() => setShowEdition(true)}>✏️ Cliquez sur le bouton éditer pour renseigner</p>}
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTATION */}
            {onglet === 'documentation' && (
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: isMobile ? 16 : 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>Documentation & fichiers</h2>
                  {isProf && (
                    <button onClick={() => setShowFormRessource(true)} style={{ padding: '7px 14px', borderRadius: 8, background: '#1f6feb', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Ajouter</button>
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
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, cursor: 'pointer' }} onClick={() => window.open(r.url, '_blank')}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: fi.bg, border: `1px solid ${fi.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{fi.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{r.titre}</div>
                            <div style={{ fontSize: 11, color: '#7d8590', marginTop: 2 }}>{r.type?.toUpperCase()}{r.pages ? ` · ${r.pages}` : ''}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ padding: '5px 12px', borderRadius: 6, background: '#21262d', border: '1px solid #30363d', color: '#8b949e', fontSize: 11, fontWeight: 500 }}>↓ Télécharger</div>
                            {isProf && (
                              <button onClick={e => { e.stopPropagation(); handleDeleteRessource(r.id); }} style={{ width: 24, height: 24, borderRadius: 5, background: 'rgba(218,54,51,0.7)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
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

      {/* ── BOUTON FLOATING ÉDITION (PROF) ── */}
      {isProf && (
        <button
          onClick={() => setShowEdition(true)}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 200,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 99,
            background: 'linear-gradient(135deg, #1f6feb, #7c3aed)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 24px rgba(31,111,235,0.45)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(31,111,235,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(31,111,235,0.45)'; }}>
          ✏️ Éditer le contenu
        </button>
      )}

      {/* ── Modals & Viewers ── */}
      {viewerYT && <YouTubeViewer url={viewerYT.url} titre={viewerYT.titre} onClose={() => setViewerYT(null)} />}
      {showFormRessource && <FormAjoutRessource projetId={projetId} user={user} userData={userData} onClose={() => setShowFormRessource(false)} />}
      {showEdition && projet && (
        <ModalEditionContenu
          projet={projet}
          projetId={projetId}
          user={user}
          userData={userData}
          onClose={() => setShowEdition(false)}
          onSaved={loadProjet}
        />
      )}

      {/* Photo plein écran */}
      {photoActive && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setPhotoActive(null)}>
          <img src={photoActive} alt="photo" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }} />
          <button onClick={() => setPhotoActive(null)} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}