'use client';

import { useState } from 'react';
import Link from 'next/link';

// SVG Icons
const IconMapPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const IconTrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="3"/>
    <path d="M4 11h16M12 3v8M8 19l-2 2M16 19l2 2"/>
    <circle cx="8.5" cy="14.5" r="1"/>
    <circle cx="15.5" cy="14.5" r="1"/>
  </svg>
);

const IconBus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6v6M16 6v6M2 12h19.6M18 18h2a1 1 0 001-1v-5a8 8 0 00-8-8H9a8 8 0 00-8 8v5a1 1 0 001 1h2"/>
    <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
  </svg>
);

const IconCar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h10l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
    <path d="M9 17h6"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const IconExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
  </svg>
);

const infos = [
  {
    icon: <IconMapPin />,
    titre: 'Adresse',
    contenu: '89 Av. Serge Dassault\n91813 Corbeil-Essonnes',
    color: 'bg-[#00b4d8]/10 border-[#00b4d8]/20',
    iconColor: 'text-[#00b4d8]',
    href: 'https://maps.google.com/?q=Lycée+Robert+Doisneau+Corbeil-Essonnes',
  },
  {
    icon: <IconPhone />,
    titre: 'Téléphone',
    contenu: '01 60 88 81 81',
    color: 'bg-[#9d95e8]/10 border-[#9d95e8]/20',
    iconColor: 'text-[#9d95e8]',
    href: 'tel:+33160888181',
  },
  {
    icon: <IconMail />,
    titre: 'Email',
    contenu: 'ce.0951780b@\nac-versailles.fr',
    color: 'bg-[#e07b39]/10 border-[#e07b39]/20',
    iconColor: 'text-[#e07b39]',
    href: 'mailto:ce.0951780b@ac-versailles.fr',
  },
  {
    icon: <IconClock />,
    titre: 'Horaires',
    contenu: 'Lun — Ven\n08h00 — 17h00',
    color: 'bg-green-500/10 border-green-500/20',
    iconColor: 'text-green-400',
    href: null,
  },
];

const sujets = [
  "Demande d'information sur le BTS CPI",
  "Candidature / Inscription Parcoursup",
  "Recherche de stage",
  "Offre de stage pour entreprise",
  "Question pédagogique",
  "Problème technique sur la plateforme",
  "Autre",
];

const faq = [
  {
    q: "Comment candidater au BTS CPI ?",
    r: "Les candidatures se font exclusivement via Parcoursup entre janvier et mars. Recherchez BTS CPI Doisneau Corbeil-Essonnes sur parcoursup.gouv.fr",
  },
  {
    q: "Quels baccalauréats sont acceptés ?",
    r: "Tous les bacs sont acceptés : Bac général (spécialités scientifiques recommandées), Bac STI2D, Bac Pro EDPI, MP3D, TRPM.",
  },
  {
    q: "Y a-t-il une formation en alternance ?",
    r: "Le BTS CPI est proposé en formation initiale. Contactez directement l'établissement pour connaître les disponibilités en alternance.",
  },
  {
    q: "Quand se déroule le stage obligatoire ?",
    r: "Pour la promotion 2025/2026, le stage se déroule du 11 Mai au 03 Juillet 2026. Durée de 8 semaines en bureau d'études industriel.",
  },
  {
    q: "Comment accéder aux ressources de la plateforme ?",
    r: "Créez votre compte avec votre email lycée, puis attendez la validation par l'administration. Les ressources sont réservées aux inscrits.",
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

  const inputClass = "w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]/30 transition-all duration-200";

  return (
    <div className="bg-[#0d1117] text-[#e6edf3] min-h-screen">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#21262d]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00b4d8]/5 rounded-full blur-3xl"/>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#9d95e8]/5 rounded-full blur-3xl"/>
        </div>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-full px-4 py-1.5 text-xs text-[#8b949e] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              Lycée Robert Doisneau — Corbeil-Essonnes
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Contactez
              <span className="text-[#00b4d8]"> l'équipe</span>
              <br />
              <span className="text-[#9d95e8]">BTS CPI</span>
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed">
              Formation, stage, plateforme — notre équipe pédagogique vous répond sous 48h en jours ouvrés.
            </p>
          </div>
        </div>
      </section>

      {/* INFOS RAPIDES */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {infos.map((info, i) => {
            const Wrapper = info.href ? 'a' : 'div';
            const props = info.href ? {
              href: info.href,
              target: info.href.startsWith('http') ? '_blank' : undefined,
              rel: info.href.startsWith('http') ? 'noopener noreferrer' : undefined,
              className: `group border rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] hover:border-opacity-60 cursor-pointer ${info.color}`,
            } : {
              className: `border rounded-2xl p-5 ${info.color}`,
            };

            return (
              <Wrapper key={i} {...props}>
                <div className={`mb-3 ${info.iconColor}`}>{info.icon}</div>
                <p className="text-xs text-[#8b949e] uppercase tracking-widest mb-1 font-medium">{info.titre}</p>
                <p className="text-sm text-[#e6edf3] font-medium whitespace-pre-line leading-relaxed">{info.contenu}</p>
              </Wrapper>
            );
          })}
        </div>
      </section>

      {/* FORMULAIRE + SIDEBAR */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Accès transport */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#00b4d8] rounded-full"/>
                Comment venir
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: <IconTrain />, label: 'RER D', detail: 'Gare Corbeil-Essonnes, 10 min à pied' },
                  { icon: <IconBus />, label: 'Bus', detail: "Ligne 402 — Arrêt Lycée Doisneau" },
                  { icon: <IconCar />, label: 'Voiture', detail: "A6 — Sortie Corbeil-Essonnes" },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#8b949e] flex-shrink-0">{t.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-[#e6edf3]">{t.label}</p>
                      <p className="text-xs text-[#8b949e]">{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="https://www.google.com/maps/place/Lyc%C3%A9e+Robert+Doisneau/@48.6234,2.4521,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 text-xs text-[#00b4d8] hover:underline"
              >
                <IconExternalLink />
                Ouvrir dans Google Maps
              </a>
            </div>

            {/* Liens utiles */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#9d95e8] rounded-full"/>
                Liens utiles
              </h3>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Candidater sur Parcoursup', href: 'https://www.parcoursup.gouv.fr', external: true },
                  { label: 'Découvrir la formation', href: '/formation', external: false },
                  { label: 'Stages et entreprises', href: '/stages', external: false },
                  { label: 'Les épreuves du BTS', href: '/epreuves', external: false },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-xs text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition-all duration-150 group"
                  >
                    <span>{link.label}</span>
                    <span className="text-[#484f58] group-hover:text-[#00b4d8] transition-colors">
                      {link.external ? <IconExternalLink /> : <IconArrowRight />}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Urgences */}
            <div className="bg-[#e07b39]/10 border border-[#e07b39]/20 rounded-2xl p-5">
              <p className="text-xs font-semibold text-[#e07b39] mb-1">Urgence administrative</p>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Pour les urgences, appelez directement le lycée au{' '}
                <a href="tel:+33160888181" className="text-[#e07b39] font-semibold hover:underline">
                  01 60 88 81 81
                </a>
              </p>
            </div>

          </div>

          {/* Formulaire */}
          <div className="lg:col-span-3">
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">

              {/* Header formulaire */}
              <div className="px-6 py-5 border-b border-[#21262d]">
                <h2 className="text-base font-semibold text-[#e6edf3]">Envoyer un message</h2>
                <p className="text-xs text-[#8b949e] mt-0.5">Réponse sous 48h en jours ouvrés</p>
              </div>

              {sent ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-green-400">
                    <IconCheck />
                  </div>
                  <h3 className="text-base font-semibold text-[#e6edf3] mb-2">Message envoyé !</h3>
                  <p className="text-sm text-[#8b949e] mb-6 leading-relaxed">
                    Notre équipe pédagogique vous répondra dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-sm text-[#00b4d8] border border-[#00b4d8]/30 px-5 py-2 rounded-lg hover:bg-[#00b4d8]/10 transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nom" className="block text-xs font-medium text-[#8b949e] mb-1.5">
                        Nom complet <span className="text-[#e07b39]">*</span>
                      </label>
                      <input
                        id="nom"
                        type="text"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        placeholder="Jean Dupont"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-[#8b949e] mb-1.5">
                        Adresse email <span className="text-[#e07b39]">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jean.dupont@email.com"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sujet" className="block text-xs font-medium text-[#8b949e] mb-1.5">
                      Sujet <span className="text-[#e07b39]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="sujet"
                        value={form.sujet}
                        onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                        required
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        <option value="">Sélectionner un sujet</option>
                        {sujets.map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] pointer-events-none">
                        <IconChevronDown />
                      </div>
                    </div>
                  </div>

                  {form.sujet === "Offre de stage pour entreprise" && (
                    <div className="bg-[#e07b39]/10 border border-[#e07b39]/20 rounded-xl p-4">
                      <p className="text-xs text-[#e07b39] leading-relaxed">
                        Précisez le nom de votre entreprise, le secteur, le poste et les dates de stage envisagées.
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="message" className="block text-xs font-medium text-[#8b949e] mb-1.5">
                      Message <span className="text-[#e07b39]">*</span>
                    </label>
                    <textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Décrivez votre demande en détail..."
                      rows={5}
                      required
                      className={`${inputClass} resize-none`}
                    />
                    <p className="text-xs text-[#484f58] mt-1 text-right">{form.message.length}/1000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 bg-[#00b4d8] text-[#0d1117] font-semibold text-sm py-3.5 rounded-xl hover:bg-[#0099bb] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#0d1117]/30 border-t-[#0d1117] rounded-full animate-spin"/>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <IconSend />
                        Envoyer le message
                      </>
                    )}
                  </button>

                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CARTE */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-12">
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#21262d] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#e6edf3]">Lycée Robert Doisneau</p>
              <p className="text-xs text-[#8b949e]">89 Av. Serge Dassault, 91813 Corbeil-Essonnes</p>
            </div>
            <a
              href="https://www.google.com/maps/place/Lyc%C3%A9e+Robert+Doisneau/@48.6234,2.4521,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#00b4d8] hover:underline"
            >
              <IconExternalLink />
              Ouvrir dans Maps
            </a>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2632.5!2d2.4499!3d48.6234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e5e7352e6ed477%3A0xdcd9338f122a9648!2sLyc%C3%A9e+Robert+Doisneau!5e0!3m2!1sfr!2sfr!4v1"
            width="100%"
            height="360"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lycée Robert Doisneau — Corbeil-Essonnes"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#161b22]/40 border-y border-[#21262d] py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <div className="mb-10">
            <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-2 font-medium">FAQ</p>
            <h2 className="text-2xl md:text-3xl font-bold">Questions fréquentes</h2>
          </div>

          <div className="flex flex-col gap-2">
            {faq.map((item, i) => (
              <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1c2128] transition-colors duration-150"
                >
                  <span className="text-sm font-medium text-[#e6edf3] pr-4">{item.q}</span>
                  <span className={`flex-shrink-0 text-[#8b949e] transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                    <IconChevronDown />
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-[#21262d]">
                    <p className="text-sm text-[#8b949e] leading-relaxed pt-4">{item.r}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#21262d] rounded-3xl p-10 md:p-14 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-[#00b4d8]/5 rounded-full blur-3xl"/>
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#9d95e8]/5 rounded-full blur-3xl"/>
          </div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Prêt à rejoindre le{' '}
              <span className="text-[#00b4d8]">BTS CPI Doisneau ?</span>
            </h2>
            <p className="text-sm text-[#8b949e] max-w-md mx-auto mb-8 leading-relaxed">
              Candidatez sur Parcoursup et rejoignez une formation d'excellence en conception industrielle.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://www.parcoursup.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#0099bb] active:scale-[0.98] transition-all duration-150"
              >
                Candidater sur Parcoursup
                <IconExternalLink />
              </a>
              <Link
                href="/formation"
                className="flex items-center gap-2 border border-[#30363d] text-[#e6edf3] text-sm px-6 py-3 rounded-xl hover:border-[#8b949e] hover:bg-[#161b22] transition-all duration-150"
              >
                Voir la formation
                <IconArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}