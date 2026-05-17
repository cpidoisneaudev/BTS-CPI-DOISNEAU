'use client';

import { useState } from 'react';
import Link from 'next/link';

const infos = [
  {
    icon: '📍',
    titre: 'Adresse',
    contenu: 'Lycée Robert Doisneau\n89 Av. Serge Dassault\n91813 Corbeil-Essonnes',
    color: 'border-[#00b4d8]/30 bg-[#00b4d8]/5',
    textColor: 'text-[#00b4d8]',
  },
  {
    icon: '📞',
    titre: 'Téléphone',
    contenu: '01 60 88 81 81',
    color: 'border-[#9d95e8]/30 bg-[#9d95e8]/5',
    textColor: 'text-[#9d95e8]',
  },
  {
    icon: '✉️',
    titre: 'Email',
    contenu: 'ce.0951780b@ac-versailles.fr',
    color: 'border-[#e07b39]/30 bg-[#e07b39]/5',
    textColor: 'text-[#e07b39]',
  },
  {
    icon: '🕐',
    titre: 'Horaires',
    contenu: 'Lundi — Vendredi\n8h00 — 17h00',
    color: 'border-green-500/30 bg-green-500/5',
    textColor: 'text-green-400',
  },
];

const sujets = [
  "Demande d'information sur le BTS CPI",
  'Candidature / Inscription Parcoursup',
  "Demande d'une journée d'immersion",
  'Recherche de stage',
  'Offre de stage pour entreprise',
  'Question pédagogique',
  'Problème technique sur la plateforme',
  'Autre',
];

const faq = [
  {
    q: 'Comment candidater au BTS CPI ?',
    r: 'Les candidatures se font exclusivement via la plateforme Parcoursup entre janvier et mars. Rendez-vous sur parcoursup.gouv.fr et recherchez "BTS CPI Doisneau Corbeil-Essonnes".',
  },
  {
    q: 'Quels bacs sont acceptés ?',
    r: 'Tous les bacs sont acceptés : Bac général (spécialités scientifiques recommandées), Bac STI2D, Bac Pro EDPI, MP3D, TRPM.',
  },
  {
    q: "Y a-t-il une alternance disponible ?",
    r: "Le BTS CPI est proposé en formation initiale. Pour l'alternance, contactez directement l'établissement pour connaître les disponibilités.",
  },
  {
    q: 'Quand commence le stage ?',
  r: "Pour la promotion 2025/2026, le stage se déroule du Lundi 11 Mai au Vendredi 03 Juillet 2026. Il dure 8 semaines en bureau d'études.",
  },
  {
    q: 'Comment accéder aux ressources de la plateforme ?',
  r: "Les ressources sont accessibles uniquement aux étudiants et professeurs inscrits. Créez votre compte et attendez la validation par l'administration.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSent(true);
    setSending(false);
    setForm({ nom: '', email: '', sujet: '', message: '' });
  };

  return (
    <div className="bg-[#0d1117] text-[#e6edf3] min-h-screen">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00b4d8]/10 via-transparent to-[#9d95e8]/10 pointer-events-none"/>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-24 relative text-center">
          <div className="inline-flex items-center gap-2 bg-[#00b4d8]/10 border border-[#00b4d8]/30 rounded-full px-4 py-1.5 text-xs text-[#00b4d8] mb-6">
            💬 Lycée Robert Doisneau — Corbeil-Essonnes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Contactez <span className="text-[#00b4d8]">l'équipe</span><br />
            <span className="text-[#9d95e8]">BTS CPI</span>
          </h1>
          <p className="text-[#8b949e] text-base leading-relaxed max-w-2xl mx-auto">
            Une question sur la formation, une offre de stage, un problème technique ?
            Notre équipe pédagogique vous répond dans les plus brefs délais.
          </p>
        </div>
      </section>

      {/* INFOS + FORMULAIRE */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Infos contact */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#e6edf3] mb-2">Nos coordonnées</h2>

            {infos.map((info, i) => (
              <div key={i} className={`border rounded-xl p-5 ${info.color}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${info.textColor}`}>{info.titre}</p>
                    <p className="text-sm text-[#e6edf3] whitespace-pre-line">{info.contenu}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Accès */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">🚇 Accès</h3>
              <div className="flex flex-col gap-2 text-xs text-[#8b949e]">
                <p>🚃 RER D — Gare de Corbeil-Essonnes (10 min à pied)</p>
                <p>🚌 Bus — Arrêt Lycée Doisneau</p>
                <p>🚗 A6 — Sortie Corbeil-Essonnes</p>
              </div>
            </div>

            {/* Liens rapides */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">🔗 Liens utiles</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Candidater sur Parcoursup', href: 'https://www.parcoursup.gouv.fr', icon: '🎓' },
                  { label: 'Voir la formation', href: '/formation', icon: '📚' },
                  { label: 'Rechercher un stage', href: '/stages', icon: '🏢' },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 text-xs text-[#8b949e] hover:text-[#00b4d8] transition-colors"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                    <span className="ml-auto">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-[#e6edf3] mb-6">Envoyer un message</h2>

            {sent ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-[#e6edf3] mb-2">Message envoyé !</h3>
                <p className="text-sm text-[#8b949e] mb-6">
                  Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#0099bb] transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex flex-col gap-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1.5 block">Nom complet *</label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                      className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jean.dupont@email.com"
                      required
                      className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] mb-1.5 block">Sujet *</label>
                  <select
                    value={form.sujet}
                    onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                    required
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#00b4d8] transition-colors"
                  >
                    <option value="">Sélectionner un sujet</option>
                    {sujets.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] mb-1.5 block">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre demande en détail..."
                    rows={6}
                    required
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#00b4d8] transition-colors resize-none"
                  />
                </div>

                {form.sujet === 'Offre de stage pour entreprise' && (
                  <div className="bg-[#e07b39]/10 border border-[#e07b39]/30 rounded-lg p-4">
                    <p className="text-xs text-[#e07b39]">
                      🏢 Pour les offres de stage, précisez : le nom de l'entreprise,
                      le secteur d'activité, le poste proposé et les dates du stage.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#00b4d8] text-[#0d1117] font-semibold text-sm py-3.5 rounded-xl hover:bg-[#0099bb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin"/>
                      Envoi en cours...
                    </span>
                  ) : 'Envoyer le message'}
                </button>

                <p className="text-xs text-[#8b949e] text-center">
                  Réponse sous 48h en jours ouvrés. Pour les urgences, appelez le 01 60 88 81 81.
                </p>

              </form>
            )}
          </div>
        </div>
      </section>

      {/* CARTE Google Maps — Lycée Robert Doisneau Corbeil-Essonnes */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-12">
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#21262d] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#e6edf3]">Lycée Robert Doisneau</p>
              <p className="text-xs text-[#8b949e]">89 Av. Serge Dassault, 91813 Corbeil-Essonnes</p>
            </div>
            <a
              href="https://www.google.com/maps/place/Lyc%C3%A9e+Robert+Doisneau/@48.6234,2.4521,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#00b4d8] hover:underline"
            >
              Ouvrir dans Maps →
            </a>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2632.5!2d2.4499!3d48.6234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e5e7352e6ed477%3A0xdcd9338f122a9648!2sLyc%C3%A9e+Robert+Doisneau!5e0!3m2!1sfr!2sfr!4v1"
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lycée Robert Doisneau — Corbeil-Essonnes"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">Questions fréquentes</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">FAQ</h2>
            <p className="text-[#8b949e] text-sm">Les questions les plus posées par les futurs étudiants.</p>
          </div>

          <div className="flex flex-col gap-3">
            {faq.map((item, i) => (
              <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1c2128] transition-colors"
                >
                  <span className="text-sm font-medium text-[#e6edf3]">{item.q}</span>
                  <span className={`text-[#00b4d8] text-lg transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t border-[#21262d]">
                    <p className="text-sm text-[#8b949e] leading-relaxed pt-4">{item.r}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
        <div className="bg-gradient-to-br from-[#00b4d8]/10 via-[#161b22] to-[#9d95e8]/10 border border-[#21262d] rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à rejoindre le<br />
            <span className="text-[#00b4d8]">BTS CPI Doisneau ?</span>
          </h2>
          <p className="text-[#8b949e] text-sm max-w-lg mx-auto mb-8">
            Découvrez notre formation d'excellence et candidatez dès maintenant sur Parcoursup.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.parcoursup.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#0099bb] transition-colors"
            >
              Candidater sur Parcoursup
            </a>
            <Link
              href="/formation"
              className="border border-[#21262d] text-[#e6edf3] text-sm px-8 py-3.5 rounded-xl hover:border-[#00b4d8] transition-colors"
            >
              Voir la formation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}