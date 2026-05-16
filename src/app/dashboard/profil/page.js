"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";

export default function ProfilPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ prenom: "", nom: "", promotion: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (userData) {
      setForm({
        prenom: userData.prenom || "",
        nom: userData.nom || "",
        promotion: userData.promotion || "",
      });
    }
  }, [userData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        prenom: form.prenom,
        nom: form.nom,
        promotion: form.promotion,
      });
      window.location.href = "/dashboard?success=profil";
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

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-12">
        {/* Retour */}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm mb-6"
        >
          ← Retour au dashboard
        </button>

        <h1 className="text-2xl font-medium text-[#e6edf3] mb-2">Mon profil</h1>
        <p className="text-[#8b949e] text-sm mb-8">
          Modifiez vos informations personnelles
        </p>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Avatar"
              width={64}
              height={64}
              className="rounded-full border-2 border-[#00b4d8]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#00b4d8] flex items-center justify-center text-[#0d1117] font-bold text-xl">
              {form.prenom?.charAt(0)}
              {form.nom?.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[#e6edf3]">
              {form.prenom} {form.nom}
            </p>
            <p className="text-xs text-[#8b949e]">{user?.email}</p>
            <span className="text-xs bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/30 px-2 py-0.5 rounded mt-1 inline-block">
              🎓 Étudiant
            </span>
          </div>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSave}
          className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 flex flex-col gap-5"
        >
          {/* Succès */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
              <p className="text-green-400 text-sm">
                ✅ Profil mis à jour avec succès !
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Prénom */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">
              Prénom
            </label>
            <input
              type="text"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              required
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#00b4d8] transition-colors"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">Nom</label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#00b4d8] transition-colors"
            />
          </div>

          {/* Email — non modifiable */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">
              Email <span className="text-[#8b949e]">(non modifiable)</span>
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#8b949e] cursor-not-allowed"
            />
          </div>

          {/* Promotion */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1.5 block">
              Promotion
            </label>
            <select
              value={form.promotion}
              onChange={(e) => setForm({ ...form, promotion: e.target.value })}
              required
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#00b4d8] transition-colors"
            >
              <option value="">Sélectionner une promotion</option>
              <option value="1ere">1ère année BTS CPI</option>
              <option value="2eme">2ème année BTS CPI</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-2.5 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </span>
              ) : (
                "Sauvegarder"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 border border-[#21262d] text-[#8b949e] text-sm py-2.5 rounded-lg hover:border-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
