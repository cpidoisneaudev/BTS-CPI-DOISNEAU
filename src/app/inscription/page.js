"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const MATIERES_OPTIONS = [
  { id: "comportement",      label: "Comportement mécanique",  color: "#185FA5" },
  { id: "construction",      label: "Construction mécanique",  color: "#0F6E56" },
  { id: "conception",        label: "Conception mécanique",    color: "#534AB7" },
  { id: "industrialisation", label: "Industrialisation",       color: "#993C1D" },
];

export default function InscriptionPage() {
  const router = useRouter();

  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ETUDIANT",
    promotion: "1ere",
    matieres: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");
  const [userTemp, setUserTemp] = useState(null);

  const createSession = async (user) => {
    const token = await user.getIdToken();
    document.cookie = `session=${token}; path=/; max-age=86400; SameSite=Strict`;
  };

  const saveUserToFirestore = async (user, data) => {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      photo: user.photoURL || null,
      nom: data.nom.trim(),
      prenom: data.prenom.trim(),
      role: data.role,
      promotion: data.role === "ETUDIANT" ? data.promotion : null,
      // ✅ matieres[] sauvegardé pour les profs, null pour les étudiants
      matieres: data.role === "PROF" ? data.matieres : null,
      statut: "en_attente",
      emailVerifie: user.emailVerified,
      dateCreation: serverTimestamp(),
      dateExpiration: null,
    });
  };

  function toggleMatiere(id) {
    setForm(f => ({
      ...f,
      matieres: f.matieres.includes(id)
        ? f.matieres.filter(m => m !== id)
        : [...f.matieres, id],
    }));
  }

  const handleEmailInscription = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.prenom.trim() || !form.nom.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await sendEmailVerification(result.user);
      await createSession(result.user);
      setUserTemp(result.user);
      setEtape(2);
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Cet email est déjà utilisé. Veuillez vous connecter.");
          break;
        case "auth/invalid-email":
          setError("Adresse email invalide.");
          break;
        case "auth/weak-password":
          setError("Mot de passe trop faible (minimum 6 caractères).");
          break;
        default:
          setError("Erreur lors de la création du compte.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleInscription = async () => {
    setLoadingGoogle(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      await createSession(result.user);

      const userSnap = await getDoc(doc(db, "users", result.user.uid));
      if (userSnap.exists()) {
        router.push("/dashboard");
        return;
      }

      const displayName = result.user.displayName || "";
      const parts = displayName.split(" ");
      setForm(prev => ({
        ...prev,
        prenom: parts[0] || "",
        nom: parts.slice(1).join(" ") || "",
      }));
      setUserTemp(result.user);
      setEtape(2);
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion Google.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleFinaliser = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.prenom.trim() || !form.nom.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    // ✅ Validation : un prof doit choisir au moins une matière
    if (form.role === "PROF" && form.matieres.length === 0) {
      setError("Veuillez sélectionner au moins une matière enseignée.");
      return;
    }

    setLoading(true);
    try {
      await saveUserToFirestore(userTemp, form);
      if (userTemp.emailVerified) {
        router.push("/dashboard");
      } else {
        setEtape(3);
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const renvoyerEmail = async () => {
    try {
      await sendEmailVerification(userTemp);
      alert("Email de vérification renvoyé !");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#00b4d8] rounded-xl flex items-center justify-center mb-4">
            <svg viewBox="0 0 18 18" className="w-6 h-6 fill-[#0d1117]">
              <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-[#e6edf3]">
            CPI <span className="text-[#00b4d8]">Doisneau</span>
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">Créer un compte</p>
        </div>

        {/* Indicateur d'étape */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full transition-colors ${etape >= 1 ? "bg-[#00b4d8]" : "bg-[#21262d]"}`} />
          <div className={`flex-1 h-1 rounded-full transition-colors ${etape >= 2 ? "bg-[#00b4d8]" : "bg-[#21262d]"}`} />
          <div className={`flex-1 h-1 rounded-full transition-colors ${etape >= 3 ? "bg-[#00b4d8]" : "bg-[#21262d]"}`} />
        </div>

        {/* Carte */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ÉTAPE 1 — Créer le compte */}
          {etape === 1 && (
            <>
              <h2 className="text-lg font-medium text-[#e6edf3] mb-6">Créer votre compte</h2>

              <form onSubmit={handleEmailInscription} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1.5 block">Prénom *</label>
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={e => setForm({ ...form, prenom: e.target.value })}
                      placeholder="Jean"
                      required
                      className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1.5 block">Nom *</label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={e => setForm({ ...form, nom: e.target.value })}
                      placeholder="Dupont"
                      required
                      className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] mb-1.5 block">Adresse email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="jean.dupont@email.com"
                    required
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                  />
                  <p className="text-xs text-[#8b949e] mt-1">Un email de vérification sera envoyé à cette adresse</p>
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] mb-1.5 block">Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3]">
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <p className="text-xs text-[#8b949e] mt-1">Minimum 6 caractères</p>
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] mb-1.5 block">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors pr-10"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3]">
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || loadingGoogle}
                  className="w-full bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-3 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50 mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin" />
                      Création en cours...
                    </span>
                  ) : "Continuer →"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#21262d]" />
                <span className="text-xs text-[#8b949e]">ou</span>
                <div className="flex-1 h-px bg-[#21262d]" />
              </div>

              <button
                onClick={handleGoogleInscription}
                disabled={loading || loadingGoogle}
                className="w-full flex items-center justify-center gap-3 bg-[#0d1117] border border-[#21262d] text-[#e6edf3] text-sm font-medium py-3 rounded-lg hover:border-[#8b949e] transition-colors disabled:opacity-50"
              >
                {loadingGoogle
                  ? <span className="w-4 h-4 border-2 border-[#8b949e] border-t-transparent rounded-full animate-spin" />
                  : <GoogleIcon />}
                {loadingGoogle ? "Chargement..." : "S'inscrire avec Google"}
              </button>

              <p className="text-xs text-[#8b949e] text-center mt-6">
                Déjà un compte ?{" "}
                <Link href="/login" className="text-[#00b4d8] hover:underline">Se connecter</Link>
              </p>
            </>
          )}

          {/* ÉTAPE 2 — Infos profil */}
          {etape === 2 && (
            <>
              <h2 className="text-lg font-medium text-[#e6edf3] mb-2">Votre profil</h2>
              <p className="text-[#8b949e] text-xs mb-6">
                Compte : <span className="text-[#00b4d8]">{userTemp?.email}</span>
              </p>

              <form onSubmit={handleFinaliser} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1.5 block">Prénom *</label>
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={e => setForm({ ...form, prenom: e.target.value })}
                      placeholder="Jean"
                      required
                      className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1.5 block">Nom *</label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={e => setForm({ ...form, nom: e.target.value })}
                      placeholder="Dupont"
                      required
                      className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                    />
                  </div>
                </div>

                {/* Choix du rôle */}
                <div>
                  <label className="text-xs text-[#8b949e] mb-1.5 block">Vous êtes *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, role: "ETUDIANT", matieres: [] })}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.role === "ETUDIANT"
                          ? "bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]"
                          : "bg-[#0d1117] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]"
                      }`}
                    >
                      🎓 Étudiant
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, role: "PROF" })}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.role === "PROF"
                          ? "bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]"
                          : "bg-[#0d1117] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]"
                      }`}
                    >
                      👨‍🏫 Professeur
                    </button>
                  </div>
                </div>

                {/* Promotion — seulement pour les étudiants */}
                {form.role === "ETUDIANT" && (
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1.5 block">Année de promotion *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, promotion: "1ere" })}
                        className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                          form.promotion === "1ere"
                            ? "bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]"
                            : "bg-[#0d1117] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]"
                        }`}
                      >
                        1ère année
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, promotion: "2eme" })}
                        className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                          form.promotion === "2eme"
                            ? "bg-[#00b4d8] text-[#0d1117] border-[#00b4d8]"
                            : "bg-[#0d1117] text-[#8b949e] border-[#21262d] hover:border-[#00b4d8]"
                        }`}
                      >
                        2ème année
                      </button>
                    </div>
                  </div>
                )}

                {/* ✅ Matières — seulement pour les profs */}
                {form.role === "PROF" && (
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1.5 block">
                      Matières enseignées *
                      <span className="ml-2 text-[#00b4d8]">
                        {form.matieres.length > 0 ? `${form.matieres.length} sélectionnée${form.matieres.length > 1 ? 's' : ''}` : ''}
                      </span>
                    </label>
                    <div className="flex flex-col gap-2">
                      {MATIERES_OPTIONS.map(m => {
                        const selected = form.matieres.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleMatiere(m.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ${
                              selected
                                ? "border-[#00b4d8] bg-[#00b4d8]/08 text-[#e6edf3]"
                                : "border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d]"
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: selected ? m.color : '#30363d' }}
                            />
                            <span className="flex-1">{m.label}</span>
                            {selected && <span className="text-[#00b4d8] text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[#8b949e] mt-2">
                      Vous pourrez modifier vos matières depuis votre profil.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-3 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </span>
                  ) : "Envoyer ma demande"}
                </button>
              </form>
            </>
          )}

          {/* ÉTAPE 3 — Vérification email */}
          {etape === 3 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-6">📧</div>
              <h2 className="text-lg font-medium text-[#e6edf3] mb-3">Vérifiez votre email</h2>
              <p className="text-[#8b949e] text-sm leading-relaxed mb-2">
                Un email de vérification a été envoyé à :
              </p>
              <p className="text-[#00b4d8] text-sm font-medium mb-6">{userTemp?.email}</p>
              <div className="bg-[#0d1117] rounded-lg p-4 border border-[#21262d] mb-6 text-left">
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  1. Ouvrez votre boîte mail<br />
                  2. Cliquez sur le lien de vérification<br />
                  3. Revenez ici et connectez-vous<br />
                  4. Votre compte sera validé par l&apos;administration
                </p>
              </div>
              <button onClick={renvoyerEmail} className="text-xs text-[#00b4d8] hover:underline mb-4 block w-full">
                Renvoyer l&apos;email de vérification
              </button>
              <button
                onClick={async () => {
                  await auth.signOut();
                  document.cookie = "session=; path=/; max-age=0";
                  router.push("/login");
                }}
                className="w-full bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-3 rounded-lg hover:bg-[#0099bb] transition-colors block text-center"
              >
                Aller à la connexion
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}