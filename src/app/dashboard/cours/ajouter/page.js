'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const MATIERES = [
  { value: 'comportement', label: 'Comportement mécanique' },
  { value: 'construction', label: 'Construction mécanique' },
  { value: 'conception', label: 'Conception mécanique' },
  { value: 'industrialisation', label: 'Industrialisation' },
];

const TYPES = [
  { value: 'cours', label: '📖 Cours' },
  { value: 'td', label: '✏️ TD' },
  { value: 'tp', label: '🔬 TP' },
  { value: 'examen', label: '📝 Examen' },
  { value: 'projet', label: '🏆 Ancien projet' },
];

const FICHIERS_ACCEPTES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.SLDPRT,.SLDASM,.SLDDRW,.CATPart,.CATProduct,.jpg,.jpeg,.png';

export default function AjouterCoursPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    titre: '',
    description: '',
    matiere: '',
    type: '',
    youtubeUrl: '',
  });
  const [fichier, setFichier] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [sourceType, setSourceType] = useState('fichier'); // 'fichier' ou 'youtube'

  // Vérification rôle
  if (userData?.role !== 'PROF' && userData?.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

const uploadCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `cours/${form.matiere}/${form.type}`);

  const res = await fetch('/api/ressource/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Erreur upload');
  }

  return await res.json();
};

  const getYoutubeId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.titre || !form.matiere || !form.type) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (sourceType === 'fichier' && !fichier) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }

    if (sourceType === 'youtube' && !form.youtubeUrl) {
      setError('Veuillez entrer un lien YouTube.');
      return;
    }

    if (sourceType === 'youtube') {
      const youtubeId = getYoutubeId(form.youtubeUrl);
      if (!youtubeId) {
        setError('Lien YouTube invalide.');
        return;
      }
    }

    setUploading(true);
    setProgress(0);

    try {
      let ressource = null;

      if (sourceType === 'fichier') {
        setProgress(30);
        ressource = await uploadCloudinary(fichier);
        setProgress(80);
      }

      // Sauvegarder dans Firestore
      await addDoc(collection(db, 'cours'), {
        titre: form.titre,
        description: form.description,
        matiere: form.matiere,
        type: form.type,
        sourceType,
        // Fichier
        ...(sourceType === 'fichier' && ressource && {
          fileUrl: ressource.url,
          filePublicId: ressource.publicId,
          fileFormat: ressource.format,
          fileSize: ressource.size,
          fileResourceType: ressource.resourceType,
        }),
        // YouTube
        ...(sourceType === 'youtube' && {
          youtubeUrl: form.youtubeUrl,
          youtubeId: getYoutubeId(form.youtubeUrl),
        }),
        // Métadonnées
        profId: user.uid,
        profNom: `${userData.prenom} ${userData.nom}`,
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp(),
      });

      setProgress(100);
      router.push('/dashboard/cours?success=ajout');

    } catch (err) {
      console.error(err);
      setError('Erreur lors de la publication. Réessayez.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-12">

        <button
          onClick={() => router.push('/dashboard')}
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm mb-6"
        >
          ← Retour
        </button>

        <h1 className="text-2xl font-medium text-[#e6edf3] mb-2">Ajouter un cours</h1>
        <p className="text-[#8b949e] text-sm mb-8">Publiez une ressource pour vos étudiants</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Titre *</label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              placeholder="Ex: Cours introduction au comportement mécanique"
              required
              className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez le contenu de cette ressource..."
              rows={3}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors resize-none"
            />
          </div>

          {/* Matière */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Matière *</label>
            <select
              value={form.matiere}
              onChange={(e) => setForm({ ...form, matiere: e.target.value })}
              required
              className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#00b4d8] transition-colors"
            >
              <option value="">Sélectionner une matière</option>
              {MATIERES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Type *</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                    form.type === t.value
                      ? 'bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]'
                      : 'bg-[#161b22] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Source — fichier ou YouTube */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Type de ressource *</label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSourceType('fichier')}
                className={`flex-1 text-xs py-2.5 rounded-lg border transition-colors ${
                  sourceType === 'fichier'
                    ? 'bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]'
                    : 'bg-[#161b22] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]'
                }`}
              >
                📁 Fichier (PDF, CAD, Word...)
              </button>
              <button
                type="button"
                onClick={() => setSourceType('youtube')}
                className={`flex-1 text-xs py-2.5 rounded-lg border transition-colors ${
                  sourceType === 'youtube'
                    ? 'bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]'
                    : 'bg-[#161b22] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]'
                }`}
              >
                ▶️ Vidéo YouTube
              </button>
            </div>

            {/* Upload fichier */}
            {sourceType === 'fichier' && (
              <div
                className="border-2 border-dashed border-[#21262d] rounded-xl p-8 text-center hover:border-[#00b4d8]/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept={FICHIERS_ACCEPTES}
                  onChange={(e) => setFichier(e.target.files[0])}
                  className="hidden"
                />
                {fichier ? (
                  <div>
                    <p className="text-sm text-[#00b4d8] font-medium">✅ {fichier.name}</p>
                    <p className="text-xs text-[#8b949e] mt-1">
                      {(fichier.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-3">📁</p>
                    <p className="text-sm text-[#e6edf3] mb-1">Cliquez pour sélectionner un fichier</p>
                    <p className="text-xs text-[#8b949e]">PDF, Word, PowerPoint, Excel, CAD, ZIP (max 100MB)</p>
                  </div>
                )}
              </div>
            )}

            {/* YouTube */}
            {sourceType === 'youtube' && (
              <div>
                <input
                  type="url"
                  value={form.youtubeUrl}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                />
                {/* Prévisualisation YouTube */}
                {form.youtubeUrl && getYoutubeId(form.youtubeUrl) && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-[#21262d]">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(form.youtubeUrl)}`}
                      className="w-full aspect-video"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barre de progression */}
          {uploading && (
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-4">
              <div className="flex justify-between text-xs text-[#8b949e] mb-2">
                <span>Upload en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-[#21262d] rounded-full h-1.5">
                <div
                  className="bg-[#00b4d8] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-3 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin"/>
                  Publication...
                </span>
              ) : 'Publier la ressource'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              disabled={uploading}
              className="flex-1 border border-[#21262d] text-[#8b949e] text-sm py-3 rounded-lg hover:border-[#8b949e] hover:text-[#e6edf3] transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}