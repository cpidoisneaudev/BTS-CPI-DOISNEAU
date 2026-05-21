'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ color: '#e6edf3', fontSize: 14, fontWeight: 600 }}>{titre}</p>
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

export default function ProjetDetailPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projetId = params.id;

  const [projet, setProjet] = useState(null);
  const [loadingProjet, setLoadingProjet] = useState(true);
  const [viewerYT, setViewerYT] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!projetId) return;
    const fetchProjet = async () => {
      try {
        const snap = await getDoc(doc(db, 'projets', projetId));
        if (snap.exists()) {
          setProjet({ id: snap.id, ...snap.data() });
        } else {
          router.push('/logiciels');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProjet(false);
      }
    };
    fetchProjet();
  }, [projetId]);

  if (loading || loadingProjet) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #1f6feb', borderTopColor: 'transparent', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!projet) return null;

  const badge = niveauColor(projet.niveau);

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px', boxSizing: 'border-box' }}>

        {/* Retour */}
        <button onClick={() => router.push('/logiciels')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8b949e', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#1f6feb'}
          onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
          ← Retour aux projets
        </button>

        {/* Header */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          {/* Image bannière */}
          {projet.image && (
            <div style={{ width: '100%', height: 220, overflow: 'hidden' }}>
              <img src={projet.image} alt={projet.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ padding: 24 }}>
            {/* Badge + statut */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#7d8590', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>PROJET COMPLET</span>
              <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, fontWeight: 600, background: badge.bg, color: badge.color }}>{projet.niveau}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>{projet.titre}</h1>
            <p style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.7, marginBottom: 20 }}>{projet.description}</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 20, borderTop: '1px solid #21262d' }}>
              {[
                { icon: '⏱', label: 'Durée estimée', val: projet.duree },
                { icon: '📁', label: 'Ressources', val: `${projet.ressources?.length || 0} fichiers` },
                { icon: '✅', label: 'Tâches', val: `${projet.travaux?.length || 0} à réaliser` },
                { icon: '📦', label: 'Livrables', val: `${projet.livrables?.length || 0} attendus` },
              ].map(({ icon, label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: '#7d8590', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{icon} {label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20 }}>

          {/* Colonne principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Ressources fournies */}
            {projet.ressources?.length > 0 && (
              <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📁</span> Ressources fournies
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {projet.ressources.map((r, i) => {
                    const ytId = r.type === 'youtube' ? getYouTubeId(r.url) : null;
                    const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
                    return (
                      <div key={i}
                        onClick={() => r.type === 'youtube' ? setViewerYT(r) : window.open(r.url, '_blank')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.background = '#1c2128'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.background = '#0d1117'; }}>
                        {thumbnail ? (
                          <div style={{ width: 56, height: 38, borderRadius: 6, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                            <img src={thumbnail} alt={r.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                              <span style={{ color: '#fff', fontSize: 14 }}>▶</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ width: 56, height: 38, borderRadius: 6, background: '#21262d', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.titre}</div>
                          <div style={{ fontSize: 11, color: '#7d8590', marginTop: 2 }}>{r.type === 'youtube' ? '▶ Vidéo YouTube' : '📄 Document PDF'}</div>
                        </div>
                        <span style={{ fontSize: 12, color: '#8b949e', flexShrink: 0 }}>→</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Travaux à réaliser */}
            {projet.travaux?.length > 0 && (
              <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>✅</span> Travaux à réaliser
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {projet.travaux.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: 14, background: '#0d1117', border: '1px solid #21262d', borderRadius: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1f3a5f', border: '1px solid #1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#58a6ff' }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: t.description ? 4 : 0 }}>{t.titre}</div>
                        {t.description && <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{t.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite : livrables + bouton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Livrables attendus */}
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20, position: 'sticky', top: 80 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📦</span> Livrables attendus
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {projet.livrables?.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0d1117', borderRadius: 8, border: '1px solid #21262d' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a3a2a', border: '1px solid #3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#3fb950', flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: '#c9d1d9' }}>{l}</span>
                  </div>
                ))}
              </div>
              <button
                style={{ width: '100%', padding: '12px', background: '#1f6feb', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#388bfd'}
                onMouseLeave={e => e.currentTarget.style.background = '#1f6feb'}>
                🚀 Commencer le projet
              </button>
              <p style={{ fontSize: 11, color: '#7d8590', textAlign: 'center', marginTop: 10 }}>
                Par {projet.profNom || 'L\'équipe pédagogique'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {viewerYT && <YouTubeViewer url={viewerYT.url} titre={viewerYT.titre} onClose={() => setViewerYT(null)} />}
    </div>
  );
}