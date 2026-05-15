'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { useParams, useRouter } from 'next/navigation';

export default function ModifierActualitePage() {
  const { id } = useParams();
  const { userData, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    titre: '',
    description: '',
    tag: 'Actualité',
    image: '',
  });
  const [chargement, setChargement] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tags = ['Actualité', 'Examens', 'Projet', 'Stage', 'Information'];

  // Protection
  useEffect(() => {
    if (!loading && !['ADMIN', 'PROF'].includes(userData?.role)) {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  // Charger l'actualité existante
  useEffect(() => {
    const fetchActualite = async () => {
      try {
        const docRef = doc(db, 'actualites', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            titre: data.titre || '',
            description: data.description || '',
            tag: data.tag || 'Actualité',
            image: data.image || '',
          });
        } else {
          router.push('/dashboard/actualite');
        }
      } catch (err) {
        console.error(err);
        router.push('/dashboard/actualite');
      } finally {
        setChargement(false);
      }
    };
    if (id) fetchActualite();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!form.titre.trim() || !form.description.trim()) {
        setError('Veuillez remplir tous les champs obligatoires.');
        setSubmitting(false);
        return;
      }

      await updateDoc(doc(db, 'actualites', id), {
        titre: form.titre.trim(),
        description: form.description.trim(),
        tag: form.tag,
        image: form.image.trim() || null,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/actualite');
      }, 2000);

    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || chargement) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-12">

        {/* Header */}
        <button
          onClick={() => router.push('/dashboard/actualite')}
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm mb-4"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-medium text-[#e6edf3] mb-2">
          Modifier l&apos;actualité
        </h1>
        <p className="text-[#8b949e] text-sm mb-8">
          Les modifications seront visibles immédiatement sur le site.
        </p>

        {/* Succès */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-green-400 text-sm text-center">
              ✅ Actualité modifiée avec succès ! Redirection en cours...
            </p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Titre */}
            <div>
              <label className="text-xs text-[#8b949e] mb-1.5 block">
                Titre *
              </label>
              <input
                type="text"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                required
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-[#8b949e] mb-1.5 block">
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors resize-none"
              />
            </div>

            {/* Tag */}
            <div>
              <label className="text-xs text-[#8b949e] mb-1.5 block">
                Catégorie *
              </label>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm({ ...form, tag })}
                    className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                      form.tag === tag
                        ? 'bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]'
                        : 'bg-[#0d1117] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="text-xs text-[#8b949e] mb-1.5 block">
                URL de l&apos;image (optionnel)
              </label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://exemple.com/image.jpg"
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || success}
              className="w-full bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-3 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? 'Modification en cours...' : '✅ Enregistrer les modifications'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}