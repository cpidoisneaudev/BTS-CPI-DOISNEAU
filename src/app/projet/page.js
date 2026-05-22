// /projet/page.js
"use client";

import Link from "next/link";

const epreuves = [
  {
    code: "E4",
    titre: "Étude préliminaire des produits",
    color: "from-red-500/20 to-red-500/5",
    border: "border-red-500/30",
    textColor: "text-red-400",
    icon: "🔴",
    unites: [
      {
        code: "U41",
        titre: "Expression du besoin & Cahier des Charges Fonctionnel",
        coef: 2,
        forme: "Oral",
        duree: "20 min (10+10)",
        heures: "20h",
        details: [
          "Rapport numérique de 15 pages MAX hors annexes",
          "Soutenance de 10 min enrichie d'un diaporama",
          "Questionnement de 10 minutes",
          "20 heures d'étude en classe",
        ],
      },
      {
        code: "U42",
        titre: "Conception préliminaire",
        coef: 6,
        forme: "Écrit",
        duree: "6h",
        heures: null,
        details: [
          "Épreuve écrite de 6 heures",
          "Analyse d'un système mécanique complet",
          "Proposition de solutions techniques innovantes",
          "Épreuve à fort coefficient — priorité absolue",
        ],
      },
    ],
  },
  {
    code: "E5",
    titre: "Projet industriel",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
    textColor: "text-blue-400",
    icon: "🔵",
    unites: [
      {
        code: "U51",
        titre: "Conception détaillée",
        coef: 5,
        forme: "Oral",
        duree: "40 min (20+20)",
        heures: "100h",
        details: [
          "Rapport numérique de 15 pages hors annexes",
          "Soutenance de 20 min + questionnement 20 min",
          "Présentation collaborative possible",
          "100 heures d'étude en classe",
        ],
      },
      {
        code: "U52",
        titre: "Soutenance rapport de stage",
        coef: 1,
        forme: "Oral",
        duree: "20 min (10+10)",
        heures: null,
        details: [
          "Rapport numérique de 30 pages hors annexes",
          "Soutenance de 10 min + questionnement 10 min",
          "Visé par l'entreprise avant remise",
          "3 documents en anglais dans les annexes",
        ],
      },
    ],
  },
  {
    code: "E6",
    titre: "Prototypage et industrialisation des produits",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
    textColor: "text-green-400",
    icon: "🟢",
    unites: [
      {
        code: "U61",
        titre: "Projet de Prototypage",
        coef: 2,
        forme: "CCF — Oral",
        duree: "40 min (30+10)",
        heures: "20h",
        details: [
          "Présentation individuelle 10 min + questions 10 min",
          "OU présentation collective 30 min MAX + questions 10 min",
          "Diaporama enrichi obligatoire",
          "20 heures d'étude en classe",
        ],
      },
      {
        code: "U62",
        titre: "Projet Collaboratif d'Optimisation",
        coef: 3,
        forme: "CCF — Oral",
        duree: "40 min (30+10)",
        heures: "20h",
        details: [
          "Soutenance orale collective de 30 min MAX",
          "Questionnement individuel de 10 minutes",
          "Projet mené avec les étudiants CPRP",
          "20 heures d'étude en classe",
        ],
      },
    ],
  },
];

const structure = [
  {
    icon: "✍️",
    label: "1 épreuve écrite",
    desc: "U42 — Conception préliminaire (6h)",
    color: "text-[#00b4d8]",
  },
  {
    icon: "🎤",
    label: "5 épreuves orales",
    desc: "U41, U51, U52, U61, U62 — rapport + soutenance",
    color: "text-[#9d95e8]",
  },
  {
    icon: "📋",
    label: "3 grandes épreuves",
    desc: "E4 Étude préliminaire, E5 Projet industriel, E6 Prototypage",
    color: "text-[#e07b39]",
  },
  {
    icon: "⚖️",
    label: "28 points de coefficient",
    desc: "Répartis sur toutes les unités",
    color: "text-green-400",
  },
];

export default function ProjetPage() {
  return (
    <div className="bg-[#0d1117] text-[#e6edf3] min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-xs text-green-400 mb-6">
              🏗️ Épreuves E4, E5 & E6 — BTS CPI
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Les <span className="text-green-400">projets</span>
              <br />
              du BTS <span className="text-[#00b4d8]">CPI</span>
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed mb-8 max-w-2xl">
              La formation technique est organisée autour de 6 épreuves
              réparties en 3 grandes phases : étude préliminaire, projet
              industriel et prototypage. Chaque épreuve implique un rapport et
              une soutenance orale.
            </p>

            {/* Structure rapide */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {structure.map((s, i) => (
                <div
                  key={i}
                  className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 text-center"
                >
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className={`text-sm font-bold ${s.color} mb-1`}>
                    {s.label}
                  </p>
                  <p className="text-[10px] text-[#8b949e] leading-tight">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ÉPREUVES */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
            Référentiel
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Les 3 grandes épreuves
          </h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
            Chaque épreuve regroupe plusieurs unités avec leurs coefficients et
            modalités d'évaluation.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {epreuves.map((epreuve, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${epreuve.color} border ${epreuve.border} rounded-2xl p-6`}
            >
              {/* Header épreuve */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`text-xs font-mono font-bold bg-[#0d1117] px-3 py-1.5 rounded-lg ${epreuve.textColor}`}
                >
                  {epreuve.code}
                </div>
                <h3 className="text-lg font-bold text-[#e6edf3]">
                  {epreuve.titre}
                </h3>
              </div>

              {/* Unités */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {epreuve.unites.map((unite, j) => (
                  <div
                    key={j}
                    className="bg-[#161b22] border border-[#21262d] rounded-xl p-5"
                  >
                    {/* Header unité */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-xs font-mono font-bold bg-[#0d1117] px-2 py-0.5 rounded ${epreuve.textColor}`}
                          >
                            {unite.code}
                          </span>
                          {unite.heures && (
                            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                              ⏰ {unite.heures} en classe
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-[#e6edf3]">
                          {unite.titre}
                        </h4>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#0d1117] border border-[#21262d] flex flex-col items-center justify-center">
                          <span
                            className={`text-lg font-bold ${epreuve.textColor}`}
                          >
                            {unite.coef}
                          </span>
                          <span className="text-[9px] text-[#8b949e]">
                            coef
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap mb-4">
                      <span className="text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] px-2 py-1 rounded-full">
                        🎤 {unite.forme}
                      </span>
                      <span className="text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] px-2 py-1 rounded-full">
                        ⏱️ {unite.duree}
                      </span>
                    </div>

                    {/* Détails */}
                    <div className="flex flex-col gap-2">
                      {unite.details.map((detail, k) => (
                        <div key={k} className="flex items-start gap-2">
                          <span className="text-[#00b4d8] text-xs mt-0.5 flex-shrink-0">
                            •
                          </span>
                          <span className="text-xs text-[#8b949e] leading-relaxed">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALENDRIER */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs text-[#9d95e8] uppercase tracking-widest mb-3">
              Organisation
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Déroulement sur 2 ans
            </h2>
            <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
              Les projets s'étalent sur les deux années de formation avec des
              jalons précis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1ère année */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-[#00b4d8]/10 border border-[#00b4d8]/30 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-[#00b4d8]">1A</span>
                </div>
                <h3 className="text-base font-semibold text-[#e6edf3]">
                  Première année
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: "🖥️",
                    titre: "U61 — Projet de prototypage",
                    desc: "Début du projet de prototypage en équipe — 20h",
                  },
                  {
                    icon: "🏢",
                    titre: "Stage",
                    desc: "8 semaines en Bureau d'Études — Mai/Juillet",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-[#0d1117] rounded-lg px-4 py-3"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#e6edf3]">
                        {item.titre}
                      </p>
                      <p className="text-xs text-[#8b949e]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2ème année */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-[#9d95e8]/10 border border-[#9d95e8]/30 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-[#9d95e8]">2A</span>
                </div>
                <h3 className="text-base font-semibold text-[#e6edf3]">
                  Deuxième année
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: "📝",
                    titre: "U52 — Rapport de stage",
                    desc: "Soutenance du rapport de stage devant jury",
                  },
                  {
                    icon: "📋",
                    titre: "U41 — Expression du besoin",
                    desc: "Rédaction du cahier des charges fonctionnel — 15 pages",
                  },
                  {
                    icon: "⚙️",
                    titre: "U51 — Conception détaillée",
                    desc: "Projet industriel complet — 100h en classe",
                  },
                  {
                    icon: "👥",
                    titre: "U62 — Projet collaboratif",
                    desc: "Optimisation avec les étudiants CPRP — 20h",
                  },
                  {
                    icon: "✍️",
                    titre: "U42 — Conception préliminaire",
                    desc: "Épreuve écrite finale de 6 heures — Juin",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-[#0d1117] rounded-lg px-4 py-3"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#e6edf3]">
                        {item.titre}
                      </p>
                      <p className="text-xs text-[#8b949e]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONSEILS */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs text-green-400 uppercase tracking-widest mb-3">
            Réussite
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Conseils pour vos projets
          </h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
            Les clés pour réussir vos projets et décrocher votre BTS CPI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: "📅",
              titre: "Anticipez les jalons",
              desc: "Les dates de remise des rapports sont fixes et non négociables — commencez tôt !",
            },
            {
              icon: "📸",
              titre: "Documentez tout",
              desc: "Prenez des photos, des notes, des captures d'écran tout au long du projet.",
            },
            {
              icon: "🤝",
              titre: "Communiquez en équipe",
              desc: "U62 est collaboratif — organisez des réunions régulières et partagez les tâches.",
            },
            {
              icon: "🎨",
              titre: "Soignez vos diaporamas",
              desc: "Un beau diaporama bien structuré fait la différence lors des soutenances.",
            },
            {
              icon: "🔍",
              titre: "Relisez vos rapports",
              desc: "Faites relire par un camarade avant de remettre — les fautes pénalisent.",
            },
            {
              icon: "💪",
              titre: "Pratiquez vos oraux",
              desc: "Entraînez-vous à chronométrer vos soutenances — 10 ou 20 min c'est vite passé !",
            },
          ].map((c, i) => (
            <div
              key={i}
              className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 hover:border-green-500/30 transition-colors group"
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-2 group-hover:text-green-400 transition-colors">
                {c.titre}
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
        <div className="bg-gradient-to-br from-green-500/10 via-[#161b22] to-[#00b4d8]/10 border border-[#21262d] rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Accédez aux <span className="text-green-400">ressources</span>
            <br />
            pour préparer vos projets
          </h2>
          <p className="text-[#8b949e] text-sm max-w-lg mx-auto mb-8">
            Cours, TD, TP, anciens projets et sujets d'examens disponibles sur
            la plateforme.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#0099bb] transition-colors"
            >
              Accéder aux ressources
            </Link>
            <Link
              href="/epreuves"
              className="border border-[#21262d] text-[#e6edf3] text-sm px-8 py-3.5 rounded-xl hover:border-[#00b4d8] transition-colors"
            >
              Voir les épreuves
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
