'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Aucun compte trouvé avec cet email.');
          break;
        case 'auth/invalid-email':
          setError('Adresse email invalide.');
          break;
        case 'auth/too-many-requests':
          setError('Trop de tentatives. Réessayez plus tard.');
          break;
        default:
          setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#00b4d8] rounded-xl flex items-center justify-center mb-4">
            <svg viewBox="0 0 18 18" className="w-6 h-6 fill-[#0d1117]">
              <polygon points="9,1 17,5 17,13 9,17 1,13 1,5"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-[#e6edf3]">
            CPI <span className="text-[#00b4d8]">Doisneau</span>
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">Réinitialisation du mot de passe</p>
        </div>

        {/* Carte */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-8">

          {/* Succès */}
          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-6">📧</div>
              <h2 className="text-lg font-medium text-[#e6edf3] mb-3">
                Email envoyé !
              </h2>
              <p className="text-[#8b949e] text-sm leading-relaxed mb-2">
                Un lien de réinitialisation a été envoyé à :
              </p>
              <p className="text-[#00b4d8] text-sm font-medium mb-6">
                {email}
              </p>
              <div className="bg-[#0d1117] rounded-lg p-4 border border-[#21262d] mb-6 text-left">
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  1. Ouvrez votre boîte mail<br/>
                  2. Cliquez sur le lien de réinitialisation<br/>
                  3. Créez votre nouveau mot de passe<br/>
                  4. Connectez-vous avec votre nouveau mot de passe
                </p>
              </div>
              <Link
                href="/login"
                className="w-full bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-3 rounded-lg hover:bg-[#0099bb] transition-colors block text-center"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-medium text-[#e6edf3] mb-2">
                Mot de passe oublié ?
              </h2>
              <p className="text-[#8b949e] text-sm mb-6 leading-relaxed">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {/* Erreur */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleReset} className="flex flex-col gap-4">

                <div>
                  <label className="text-xs text-[#8b949e] mb-1.5 block">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean.dupont@email.com"
                    required
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00b4d8] text-[#0d1117] font-medium text-sm py-3 rounded-lg hover:bg-[#0099bb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin"/>
                      Envoi en cours...
                    </span>
                  ) : 'Envoyer le lien de réinitialisation'}
                </button>

              </form>
            </>
          )}

        </div>

        {/* Retour connexion */}
        <p className="text-center mt-6">
          <Link href="/login" className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            ← Retour à la connexion
          </Link>
        </p>

      </div>
    </div>
  );
}