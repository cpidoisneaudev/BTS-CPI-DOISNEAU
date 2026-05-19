"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function ProfilPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    promotion: "",
    description: "",
    anneesExperience: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (userData) {
      setForm({
        prenom: userData.prenom || "",
        nom: userData.nom || "",
        promotion: userData.promotion || "",
        description: userData.description || "",
        anneesExperience: userData.anneesExperience || "",
      });
    }
  }, [userData]);

  const currentPhoto = userData?.photoUrl || user?.photoURL || null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 5 MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("folder", "profils");

      const res = await fetch("/api/ressource/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.url) throw new Error("Upload échoué");

      await updateDoc(doc(db, "users", user.uid), { photoUrl: data.url });
      setPhotoSuccess(true);
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => setPhotoSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'upload de la photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const dataToUpdate = { prenom: form.prenom, nom: form.nom };
      if (userData?.role === "ETUDIANT") {
        dataToUpdate.promotion = form.promotion;
      }
      if (userData?.role === "PROF" || userData?.role === "ADMIN") {
        dataToUpdate.description = form.description;
        dataToUpdate.anneesExperience = form.anneesExperience;
      }
      await updateDoc(doc(db, "users", user.uid), dataToUpdate);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard?success=profil"), 1500);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayPhoto = photoPreview || currentPhoto;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-12">

        <button onClick={() => router.push("/dashboard")} className="text-[#8b949e] hover:text-[#e6edf3] text-sm mb-6">
          ← Retour au dashboard
        </button>

        <h1 className="text-2xl font-medium text-[#e6edf3] mb-2">Mon profil</h1>
        <p className="text-[#8b949e] text-sm mb-8">Modifiez vos informations personnelles</p>

        {/* Section photo */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 mb-6">
          <p className="text-sm font-medium text-[#e6edf3] mb-4">Photo de profil</p>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              {displayPhoto ? (
                <Image src={displayPhoto} alt="Avatar" width={80} height={80}
                  className="rounded-full border-2 border-[#00b4d8] object-cover"
                  style={{ width: 80, height: 80, objectFit: 'cover' }} />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#00b4d8] flex items-center justify-center text-[#0d1117] font-bold text-2xl">
                  {form.prenom?.charAt(0)}{form.nom?.charAt(0)}
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                title="Changer la photo">
                <span className="text-white text-xs">✏️</span>
              </button>
            </div>

            <div className="flex-1">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange} className="hidden" />
              {!photoFile ? (
                <div>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-xs border border-[#21262d] text-[#8b949e] px-4 py-2 rounded-lg hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors">
                    Choisir une photo
                  </button>
                  <p className="text-[10px] text-[#8b949e] mt-2">JPG, PNG ou WebP · max 5 MB</p>
                  {photoSuccess && <p className="text-green-400 text-xs mt-2">✅ Photo mise à jour !</p>}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handlePhotoUpload} disabled={uploadingPhoto}
                    className="text-xs bg-[#00b4d8] text-[#0d1117] font-medium px-4 py-2 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50">
                    {uploadingPhoto ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border border-[#0d1117] border-t-transparent rounded-full animate-spin" />
                        Upload...
                      </span>
                    ) : "Enregistrer la photo"}
                  </button>
                  <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="text-xs text-[#8b949e] hover:text-red-400 transition-colors">
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSave} className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 flex flex-col gap-5">

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
              <p className="text-green-400 text-sm">✅ Profil mis à jour ! Redirection...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Prénom</label>
            <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#00b4d8] transition-colors" />
          </div>

          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Nom</label>
            <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#00b4d8] transition-colors" />
          </div>

          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Email <span className="font-normal">(non modifiable)</span></label>
            <input type="email" value={user?.email || ""} disabled
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#8b949e] cursor-not-allowed" />
          </div>

          {/* Champs prof */}
          {(userData?.role === "PROF" || userData?.role === "ADMIN") && (
            <>
              <div>
                <label className="text-xs text-[#8b949e] mb-1.5 block">
                  Description <span className="font-normal">(affichée sur la page équipe)</span>
                </label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Spécialiste en RDM et analyse des structures. Passionné par la transmission du savoir technique..."
                  rows={3}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors resize-none" />
              </div>

              <div>
                <label className="text-xs text-[#8b949e] mb-1.5 block">
                  Années d'expérience <span className="font-normal">(affichées sur la page équipe)</span>
                </label>
                <input type="number" min="0" max="50" value={form.anneesExperience}
                  onChange={(e) => setForm({ ...form, anneesExperience: e.target.value })}
                  placeholder="Ex: 8"
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors" />
              </div>
            </>
          )}

          {/* Champ étudiant */}
          {userData?.role === "ETUDIANT" && (
            <div>
              <label className="text-xs text-[#8b949e] mb-1.5 block">Promotion</label>
              <select value={form.promotion} onChange={(e) => setForm({ ...form, promotion: e.target.value })} required
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#00b4d8] transition-colors">
                <option value="">Sélectionner une promotion</option>
                <option value="1ere">1ère année BTS CPI</option>
                <option value="2eme">2ème année BTS CPI</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={saving || success}
              className="flex-1 bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-2.5 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </span>
              ) : "Sauvegarder"}
            </button>
            <button type="button" onClick={() => router.push("/dashboard")} disabled={saving}
              className="flex-1 border border-[#21262d] text-[#8b949e] text-sm py-2.5 rounded-lg hover:border-[#8b949e] hover:text-[#e6edf3] transition-colors disabled:opacity-50">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}