// /app/logiciels/atelier/[id]/page.js
// ✅ Identique à /projet/[id]/page.js mais lit dans "projetsAtelier"
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, onSnapshot, addDoc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function niveauColor(niveau) {
  if (niveau === 'Débutant')      return { color: '#3fb950', bg: '#1a3a2a' };
  if (niveau === 'Intermédiaire') return { color: '#d29922', bg: '#3a2e1a' };
  return                                 { color: '#f85149', bg: '#3a1a1a' };
}

function YouTubeViewer({ url, titre, onClose }) {
  const ytId = getYouTubeId(url);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ color: '#e6edf3', fontSize: 13, fontWeight: 600, flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titre}</p>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
      </div>
      <div style={{ width: '100%', maxWidth: 900, background: '#000', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
        </div>
      </div>
    </div>
  );
}

// ✅ CORRIGÉ : écrit dans projetsAtelier/{id}/ressources
function FormAjoutRessource({ projetId, user, userData, onClose }) {
  const [form, setForm] = useState({ titre: '', type: 'youtube', url: '', duree: '', pages: '', niveau: 'Débutant' });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/ressource/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setForm(prev => ({ ...prev, url: data.url }));
    } catch { alert('Erreur upload fichier'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.titre.trim()) { alert('Titre requis'); return; }
    if (form.type === 'youtube' && !form.url.trim()) { alert('URL YouTube requise'); return; }
    if (form.type === 'pdf' && !form.url) { alert('Fichier PDF requis'); return; }
    setUploading(true);
    try {
      // ✅ CORRIGÉ : projetsAtelier
      await addDoc(collection(db, 'projetsAtelier', projetId, 'ressources'), {
        titre: form.titre.trim(), type: form.type, url: form.url,
        niveau: form.niveau,
        duree: form.type === 'youtube' ? form.duree : '',
        pages: form.type === 'pdf' ? form.pages : '',
        profId: user.uid,
        profNom: `${userData.prenom} ${userData.nom}`,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (e) { console.error(e); alert('Erreur ajout ressource'); }
    finally { setUploading(false); }
  };

  const inp = { width: '100%', padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 14, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: '#161b22', borderBottom: '1px solid #21262d', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#e6edf3', fontSize: 15, fontWeight: 600 }}>Ajouter une ressource</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Titre *</label>
            <input style={inp} value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex: Mise en plan du réducteur" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Type *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['youtube', 'pdf'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t, url: '' }))}
                  style={{ flex: 1, padding: 8, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: form.type === t ? '#1f6feb' : '#21262d', border: `1px solid ${form.type === t ? '#1f6feb' : '#30363d'}`, color: form.type === t ? '#fff' : '#8b949e' }}>
                  {t === 'youtube' ? '▶ YouTube' : '📄 PDF'}
                </button>
              ))}
            </div>
          </div>
          {form.type === 'youtube' ? (
            <div>
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>URL YouTube *</label>
              <input style={inp} value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Fichier PDF *</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: form.url ? '#3fb950' : '#8b949e' }}>
                  {uploading ? 'Upload en cours...' : form.url ? '✓ Fichier chargé' : 'Choisir un PDF'}
                </span>
                <input type="file" accept=".pdf" onChange={e => handleUpload(e.target.files?.[0])} disabled={uploading} style={{ display: 'none' }} />
              </label>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>{form.type === 'youtube' ? 'Durée' : 'Nb pages'}</label>
              <input style={inp} value={form.type === 'youtube' ? form.duree : form.pages} onChange={e => setForm(p => form.type === 'youtube' ? { ...p, duree: e.target.value } : { ...p, pages: e.target.value })} placeholder={form.type === 'youtube' ? '14:30' : '8'} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Niveau</label>
              <select value={form.niveau} onChange={e => setForm(p => ({ ...p, niveau: e.target.value }))} style={inp}>
                {['Débutant', 'Intermédiaire', 'Avancé'].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
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

export default function AtelierProjetDetailPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projetId = params.id;
  const isMobile = useIsMobile();

  const [projet, setProjet] = useState(null);
  const [loadingProjet, setLoadingProjet] = useState(true);
  const [ressources, setRessources] = useState([]);
  const [viewerYT, setViewerYT] = useState(null);
  const [showFormRessource, setShowFormRessource] = useState(false);

  const isProf = userData?.role === 'PROF' || userData?.role === 'ADMIN';

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  // ✅ CORRIGÉ : lit dans projetsAtelier
  useEffect(() => {
    if (!projetId) return;
    const fetchProjet = async () => {
      try {
        const snap = await getDoc(doc(db, 'projetsAtelier', projetId));
        if (snap.exists()) {
          setProjet({ id: snap.id, ...snap.data() });
        } else {
          router.push('/logiciels');
        }
      } catch (e) { console.error(e); }
      finally { setLoadingProjet(false); }
    };
    fetchProjet();
  }, [projetId]);

  // ✅ CORRIGÉ : écoute projetsAtelier/{id}/ressources
  useEffect(() => {
    if (!projetId) return;
    const q = query(collection(db, 'projetsAtelier', projetId, 'ressources'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setRessources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [projetId]);

  // ✅ CORRIGÉ : supprime dans projetsAtelier
  const handleDeleteRessource = async (ressourceId) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    try {
      await deleteDoc(doc(db, 'projetsAtelier', projetId, 'ressources', ressourceId));
    } catch (e) { console.error(e); alert('Erreur suppression'); }
  };

  if (loading || loadingProjet) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #1f6feb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!projet) return null;

  const badge = niveauColor(projet.niveau);

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 16px', boxSizing: 'border-box' }}>

        {/* Retour */}
        <button onClick={() => router.push('/logiciels')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8b949e', fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#1f6feb'}
          onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
          ← Retour aux logiciels
        </button>

        {/* Header projet */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          {projet.image && (
            <div style={{ width: '100%', height: isMobile ? 160 : 220, overflow: 'hidden' }}>
              <img src={projet.image} alt={projet.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ padding: isMobile ? 16 : 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#7d8590', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>PROJET COMPLET</span>
              <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, fontWeight: 600, background: badge.bg, color: badge.color }}>{projet.niveau}</span>
            </div>
            <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{projet.titre}</h1>
            <p style={{ fontSize: isMobile ? 13 : 14, color: '#8b949e', lineHeight: 1.7, marginBottom: 16 }}>{projet.description}</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: isMobile ? 16 : 24, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', paddingTop: 16, borderTop: '1px solid #21262d', paddingBottom: isMobile ? 4 : 0 }}>
              {[
                { icon: '⏱', label: 'Durée estimée', val: projet.duree },
                { icon: '📁', label: 'Ressources', val: `${ressources.length} fichier${ressources.length !== 1 ? 's' : ''}` },
                { icon: '✅', label: 'Tâches', val: `${projet.travaux?.length || 0} à réaliser` },
                { icon: '📦', label: 'Livrables', val: `${projet.livrables?.length || 0} attendus` },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 9, color: '#7d8590', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, whiteSpace: 'nowrap' }}>{icon} {label}</div>
                  <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 600, color: '#e6edf3', whiteSpace: 'nowrap' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layout 2 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 280px', gap: 16 }}>

          {/* Colonne gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

            {/* Ressources */}
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                  📁 Ressources fournies
                  <span style={{ fontSize: 11, color: '#7d8590', fontWeight: 400 }}>({ressources.length})</span>
                </h2>
                {isProf && (
                  <button onClick={() => setShowFormRessource(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: '#1f6feb', border: 'none', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    + Ajouter
                  </button>
                )}
              </div>

              {ressources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#7d8590' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                  <p style={{ fontSize: 12 }}>
                    {isProf ? 'Aucune ressource — cliquez sur "+ Ajouter".' : 'Aucune ressource disponible.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ressources.map((r) => {
                    const ytId = r.type === 'youtube' ? getYouTubeId(r.url) : null;
                    const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
                    return (
                      <div key={r.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, cursor: 'pointer', position: 'relative' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.background = '#1c2128'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.background = '#0d1117'; }}>
                        <div onClick={() => r.type === 'youtube' ? setViewerYT(r) : window.open(r.url, '_blank')}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          {thumbnail ? (
                            <div style={{ width: 50, height: 34, borderRadius: 5, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                              <img src={thumbnail} alt={r.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                                <span style={{ color: '#fff', fontSize: 12 }}>▶</span>
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: 50, height: 34, borderRadius: 5, background: '#21262d', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📄</div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.titre}</div>
                            <div style={{ fontSize: 10, color: '#7d8590', marginTop: 2 }}>
                              {r.type === 'youtube' ? '▶ YouTube' : '📄 PDF'}
                              {!isMobile && r.profNom && ` · ${r.profNom}`}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: '#8b949e', flexShrink: 0 }}>→</span>
                        </div>
                        {isProf && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteRessource(r.id); }}
                            style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(218,54,51,0.8)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Travaux */}
            {projet.travaux?.length > 0 && (
              <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: isMobile ? 14 : 20 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>✅ Travaux à réaliser</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {projet.travaux.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: isMobile ? 12 : 14, background: '#0d1117', border: '1px solid #21262d', borderRadius: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1f3a5f', border: '1px solid #1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#58a6ff' }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: t.description ? 4 : 0 }}>{t.titre}</div>
                        {t.description && <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{t.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Livrables mobile */}
            {isMobile && projet.livrables?.length > 0 && (
              <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>📦 Livrables attendus</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {projet.livrables.map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0d1117', borderRadius: 8, border: '1px solid #21262d' }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#1a3a2a', border: '1px solid #3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#3fb950', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: '#c9d1d9' }}>{l}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: 12, background: '#1f6feb', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  🚀 Commencer le projet
                </button>
                <p style={{ fontSize: 11, color: '#7d8590', textAlign: 'center', marginTop: 8 }}>
                  Par {projet.profNom || "L'équipe pédagogique"}
                </p>
              </div>
            )}
          </div>

          {/* Colonne droite desktop */}
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20, position: 'sticky', top: 80 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>📦 Livrables attendus</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {projet.livrables?.map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0d1117', borderRadius: 8, border: '1px solid #21262d' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a3a2a', border: '1px solid #3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#3fb950', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: '#c9d1d9' }}>{l}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: 12, background: '#1f6feb', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#388bfd'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1f6feb'}>
                  🚀 Commencer le projet
                </button>
                <p style={{ fontSize: 11, color: '#7d8590', textAlign: 'center', marginTop: 10 }}>
                  Par {projet.profNom || "L'équipe pédagogique"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewerYT && <YouTubeViewer url={viewerYT.url} titre={viewerYT.titre} onClose={() => setViewerYT(null)} />}
      {showFormRessource && <FormAjoutRessource projetId={projetId} user={user} userData={userData} onClose={() => setShowFormRessource(false)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}