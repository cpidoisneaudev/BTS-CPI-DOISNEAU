"use client";

import Link from "next/link";
import Image from "next/image";

const matieres = [
  {
    icon: "⚙️",
    titre: "Comportement mécanique",
    heures: "6h/semaine",
    desc: "Étude statique, cinématique, dynamique et énergétique des structures. Dimensionnement par la Résistance des Matériaux.",
    color: "from-[#00b4d8]/20 to-[#00b4d8]/5",
    border: "border-[#00b4d8]/30",
  },
  {
    icon: "📐",
    titre: "Construction mécanique",
    heures: "10h/semaine",
    desc: "Conception Assistée par Ordinateur (SolidWorks, CATIA V5), dessin technique, spécifications dimensionnelles et géométriques.",
    color: "from-[#9d95e8]/20 to-[#9d95e8]/5",
    border: "border-[#9d95e8]/30",
  },
  {
    icon: "🖥️",
    titre: "Conception mécanique",
    heures: "4h/semaine",
    desc: "Analyse fonctionnelle, cahier des charges, recherche de solutions innovantes, maquette numérique 3D et simulation.",
    color: "from-[#e07b39]/20 to-[#e07b39]/5",
    border: "border-[#e07b39]/30",
  },
  {
    icon: "🏭",
    titre: "Industrialisation",
    heures: "4h/semaine",
    desc: "Matériaux et procédés de fabrication, préindustrialisation, optimisation des solutions techniques, prototypage.",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
  },
];

const competences = [
  {
    icon: "📋",
    titre: "Analyse du besoin",
    desc: "Rédiger un cahier des charges fonctionnel complet",
  },
  {
    icon: "💡",
    titre: "Conception préliminaire",
    desc: "Proposer des solutions techniques innovantes",
  },
  {
    icon: "🖱️",
    titre: "CAO / DAO",
    desc: "Maîtriser SolidWorks, CATIA V5 et les outils de simulation",
  },
  {
    icon: "🔩",
    titre: "Conception détaillée",
    desc: "Définir et coter les pièces mécaniques",
  },
  {
    icon: "🖨️",
    titre: "Prototypage",
    desc: "Réaliser et valider des prototypes physiques et numériques",
  },
  {
    icon: "👥",
    titre: "Travail collaboratif",
    desc: "Mener des projets en équipe pluridisciplinaire",
  },
];

const debouches = [
  {
    metier: "Technicien Bureau d'Études",
    secteur: "Industrie mécanique",
    icon: "📊",
  },
  {
    metier: "Dessinateur Projeteur",
    secteur: "Automobile / Aéronautique",
    icon: "✏️",
  },
  { metier: "Chargé d'Affaires", secteur: "Bureau d'études", icon: "💼" },
  {
    metier: "Technicien Méthodes",
    secteur: "Production industrielle",
    icon: "⚙️",
  },
  { metier: "Designer Industriel", secteur: "Conception produits", icon: "🎨" },
  {
    metier: "Responsable de Projet",
    secteur: "Entreprise industrielle",
    icon: "🏆",
  },
];

const poursuites = [
  {
    titre: "Licence Pro",
    desc: "Conception et Amélioration de Processus Industriels (Bac+3)",
    icon: "🎓",
    color: "bg-[#00b4d8]/10 border-[#00b4d8]/30 text-[#00b4d8]",
  },
  {
    titre: "Prépa ATS",
    desc: "Classe préparatoire pour intégrer les grandes écoles d'ingénieurs",
    icon: "📚",
    color: "bg-[#9d95e8]/10 border-[#9d95e8]/30 text-[#9d95e8]",
  },
  {
    titre: "École d'Ingénieurs",
    desc: "INSA, ICAM, IMT, Arts et Métiers... (Bac+5)",
    icon: "🏛️",
    color: "bg-[#e07b39]/10 border-[#e07b39]/30 text-[#e07b39]",
  },
  {
    titre: "BUT / Licence",
    desc: "3ème année de BUT Génie Mécanique ou Licence généraliste",
    icon: "📖",
    color: "bg-green-500/10 border-green-500/30 text-green-400",
  },
];

const chiffres = [
  { valeur: "2 ans", label: "de formation intensive", icon: "📅" },
  { valeur: "32h", label: "de cours par semaine", icon: "⏰" },
  { valeur: "8 sem.", label: "de stage en entreprise", icon: "🏢" },
  { valeur: "80", label: "étudiants formés", icon: "👨‍🎓" },
];

export default function FormationPage() {
  return (
    <div className="bg-[#0d1117] text-[#e6edf3] min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00b4d8]/10 via-transparent to-[#9d95e8]/10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00b4d8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#9d95e8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#00b4d8]/10 border border-[#00b4d8]/30 rounded-full px-4 py-1.5 text-xs text-[#00b4d8] mb-6">
              🎓 Formation Bac+2 — Lycée Robert Doisneau
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              BTS <span className="text-[#00b4d8]">Conception</span>
              <br />
              de Produits
              <br />
              <span className="text-[#9d95e8]">Industriels</span>
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed mb-8 max-w-lg">
              Formez-vous aux métiers de la conception mécanique et du bureau
              d'études. Maîtrisez les outils numériques de pointe pour concevoir
              les produits industriels de demain.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#0099bb] transition-colors"
              >
                Nous contacter
              </Link>
              <a
                href="https://www.parcoursup.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#21262d] text-[#e6edf3] text-sm px-6 py-3 rounded-lg hover:border-[#00b4d8] transition-colors"
              >
                S'inscrire sur Parcoursup {"→"}
              </a>
            </div>
          </div>

          {/* Image hero — à remplacer */}
          <div className="hidden lg:block relative h-96 rounded-2xl overflow-hidden border border-[#21262d]">
            <div className="w-full h-full bg-[#161b22] flex items-center justify-center">
              <div className="text-center text-[#8b949e]">
                <div className="text-6xl mb-4">
                  <Image
                    src="/tp_CAO.jpg"
                    alt="BTS CPI — Lycée Robert Doisneau"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-sm">Photo des étudiants en TP</p>
                <p className="text-xs mt-1">(à remplacer)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="border-y border-[#21262d] bg-[#161b22]/50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {chiffres.map((c, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-2">{c.icon}</div>
                <div className="text-3xl font-bold text-[#00b4d8] mb-1">
                  {c.valeur}
                </div>
                <div className="text-xs text-[#8b949e]">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRÉSENTATION */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image — à remplacer */}
          <div className="relative h-80 rounded-2xl overflow-hidden border border-[#21262d] order-2 lg:order-1">
            <div className="w-full h-full bg-[#161b22] flex items-center justify-center">
              <div className="text-center text-[#8b949e]">
                <div className="text-5xl mb-3">
                                    <Image
                    src="/salle_cao.jpeg"
                    alt="BTS CPI — Lycée Robert Doisneau"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-sm">Photo salle CAO</p>
                <p className="text-xs mt-1">(à remplacer)</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
              La formation
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-5">
              Devenez expert en
              <br />
              <span className="text-[#00b4d8]">conception industrielle</span>
            </h2>
            <p className="text-[#8b949e] text-sm leading-relaxed mb-5">
              Le titulaire du BTS CPI est un concepteur de produits industriels
              mécaniques. Il travaille en{" "}
              <strong className="text-[#e6edf3]">Bureau d'Études</strong> où il
              utilise les outils numériques de modélisation 3D CAO, les outils
              de calcul et de simulation.
            </p>
            <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
              Il collabore avec des spécialistes des domaines de la
              motorisation, des automatismes, de l'énergie et des procédés de
              transformation au sein d'une équipe de conception.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "✅ Analyser un besoin et rédiger un cahier des charges",
                "✅ Concevoir des solutions techniques innovantes",
                "✅ Maîtriser les logiciels CAO professionnels",
                "✅ Pré-industrialiser et prototyper un produit",
              ].map((item, i) => (
                <p key={i} className="text-sm text-[#e6edf3]">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MATIÈRES */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
              Programme
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Les matières enseignées
            </h2>
            <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
              Un programme équilibré entre enseignements techniques et généraux
              pour former des techniciens complets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matieres.map((m, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${m.color} border ${m.border} rounded-2xl p-6 hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{m.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-[#e6edf3]">
                        {m.titre}
                      </h3>
                      <span className="text-xs bg-[#0d1117]/50 text-[#8b949e] px-2 py-1 rounded-full">
                        {m.heures}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enseignements généraux */}
          <div className="mt-6 bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#e6edf3] mb-4">
              📚 Enseignements généraux
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                "Culture générale & Expression (3h)",
                "Anglais LV1 (2h)",
                "Mathématiques (2h30)",
                "Physique-Chimie (2h)",
                "Accompagnement personnalisé (1h30)",
              ].map((m, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] px-3 py-1.5 rounded-full"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPÉTENCES */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
            Savoir-faire
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Compétences développées
          </h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
            À l'issue du BTS CPI, vous maîtriserez l'ensemble de la chaîne de
            conception industrielle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competences.map((c, i) => (
            <div
              key={i}
              className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 hover:border-[#00b4d8]/40 transition-colors group"
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-2 group-hover:text-[#00b4d8] transition-colors">
                {c.titre}
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOGICIELS */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
              Outils professionnels
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Logiciels utilisés
            </h2>
            <p className="text-[#8b949e] text-sm">
              Les mêmes outils que les professionnels de l'industrie
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { nom: "SolidWorks", type: "CAO 3D", icon: "🔷" },
              { nom: "CATIA V5", type: "CAO 3D avancée", icon: "🔶" },
              { nom: "RDM6", type: "Calcul de structures", icon: "📊" },
              { nom: "TopSolid", type: "CAO / FAO", icon: "⚡" },
            ].map((l, i) => (
              <div
                key={i}
                className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 text-center hover:border-[#00b4d8]/40 transition-colors"
              >
                <div className="text-4xl mb-3">{l.icon}</div>
                <p className="text-sm font-semibold text-[#e6edf3] mb-1">
                  {l.nom}
                </p>
                <p className="text-xs text-[#8b949e]">{l.type}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/logiciels"
              className="text-sm text-[#00b4d8] hover:underline"
            >
              En savoir plus sur les logiciels {"→"}
            </Link>
          </div>
        </div>
      </section>

      {/* STAGE */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
              Expérience terrain
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-5">
              8 semaines de stage
              <br />
              <span className="text-[#00b4d8]">en entreprise</span>
            </h2>
            <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
              En fin de première année, vous intégrez une entreprise
              industrielle pendant 8 semaines. Cette immersion vous permet de
              découvrir le monde professionnel, d'appliquer vos connaissances et
              de rédiger un rapport de stage soutenu devant jury.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: "🏢", text: "Bureau d'études mécaniques" },
                { icon: "🚗", text: "Industrie automobile & aéronautique" },
                { icon: "🤖", text: "Fabricants de machines spéciales" },
                { icon: "💊", text: "Industries médicales & pharmaceutiques" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-3"
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-sm text-[#8b949e]">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image stage — à remplacer */}
          <div className="relative h-80 rounded-2xl overflow-hidden border border-[#21262d]">
            <div className="w-full h-full bg-[#161b22] flex items-center justify-center">
              <div className="text-center text-[#8b949e]">
                <div className="text-5xl mb-3">
                    <Image
                    src="/stage.jpg"
                    alt="BTS CPI — Lycée Robert Doisneau"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-sm">Photo stage en entreprise</p>
                <p className="text-xs mt-1">(à remplacer)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DÉBOUCHÉS */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
              Carrière
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Débouchés professionnels
            </h2>
            <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
              Le BTS CPI ouvre les portes de nombreux secteurs industriels en
              forte demande de techniciens qualifiés.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {debouches.map((d, i) => (
              <div
                key={i}
                className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 hover:border-[#00b4d8]/40 transition-colors group"
              >
                <div className="text-3xl mb-3">{d.icon}</div>
                <h3 className="text-sm font-semibold text-[#e6edf3] mb-1 group-hover:text-[#00b4d8] transition-colors">
                  {d.metier}
                </h3>
                <p className="text-xs text-[#8b949e]">{d.secteur}</p>
              </div>
            ))}
          </div>

          {/* Secteurs */}
          <div className="mt-8 bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#e6edf3] mb-4">
              🏭 Secteurs d'activité
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Automobile",
                "Aéronautique",
                "Spatial",
                "Médical",
                "Agroalimentaire",
                "Énergie",
                "Défense",
                "Mécanique agricole",
                "Robotique",
                "Électronique",
              ].map((s, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] px-3 py-1.5 rounded-full hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors cursor-default"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* POURSUITES D'ÉTUDES */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
            Après le BTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Poursuites d'études
          </h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
            Le BTS CPI est un tremplin vers de nombreuses formations
            supérieures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {poursuites.map((p, i) => (
            <div
              key={i}
              className={`border rounded-2xl p-6 ${p.color} hover:scale-[1.02] transition-transform`}
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="text-sm font-semibold mb-2">{p.titre}</h3>
              <p className="text-xs opacity-80 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ADMISSION */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Conditions */}
            <div>
              <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">
                Rejoindre la formation
              </p>
              <h2 className="text-2xl font-bold mb-6">
                Conditions d'admission
              </h2>
              <div className="flex flex-col gap-4">
                <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">
                    🎓 Baccalauréats acceptés
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      "Bac général (toutes spécialités)",
                      "Bac STI2D — Sciences et Technologies",
                      "Bac Pro EDPI / MP3D",
                      "Bac Pro TRPM (Technicien en Réalisation de Produits Mécaniques)",
                    ].map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-[#8b949e]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] flex-shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">
                    ✨ Qualités recherchées
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Rigueur",
                      "Curiosité",
                      "Créativité",
                      "Esprit d'analyse",
                      "Travail en équipe",
                      "Organisation",
                      "Communication",
                    ].map((q, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#00b4d8]/10 border border-[#00b4d8]/30 text-[#00b4d8] px-2 py-1 rounded-full"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-1">
                Candidature
              </p>
              <h2 className="text-2xl font-bold mb-2">Comment s'inscrire ?</h2>
              <p className="text-[#8b949e] text-sm leading-relaxed mb-4">
                Les candidatures se font via la plateforme nationale Parcoursup.
                N'hésitez pas à nous contacter pour toute question sur la
                formation.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="https://www.parcoursup.gouv.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-6 py-4 rounded-xl hover:bg-[#0099bb] transition-colors group"
                >
                  <span>Candidater sur Parcoursup</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    {"→"}
                  </span>
                </a>
                <Link
                  href="/contact"
                  className="flex items-center justify-between border border-[#21262d] text-[#e6edf3] text-sm px-6 py-4 rounded-xl hover:border-[#00b4d8] transition-colors group"
                >
                  <span>Contacter l'équipe pédagogique</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
                <Link
                  href="/stages"
                  className="flex items-center justify-between border border-[#21262d] text-[#e6edf3] text-sm px-6 py-4 rounded-xl hover:border-[#00b4d8] transition-colors group"
                >
                  <span>Rechercher un stage</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    {"→"}
                  </span>
                </Link>
              </div>

              {/* Stats taux réussite */}
              <div className="mt-2 bg-gradient-to-r from-green-500/10 to-[#00b4d8]/10 border border-green-500/20 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">+90%</p>
                    <p className="text-xs text-[#8b949e]">
                      Taux de réussite moyen au BTS CPI en France
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
        <div className="bg-gradient-to-br from-[#00b4d8]/10 via-[#161b22] to-[#9d95e8]/10 border border-[#21262d] rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à rejoindre le
            <br />
            <span className="text-[#00b4d8]">BTS CPI Doisneau ?</span>
          </h2>
          <p className="text-[#8b949e] text-sm max-w-lg mx-auto mb-8">
            Rejoignez une formation d'excellence et devenez l'expert en
            conception industrielle que les entreprises recherchent.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#0099bb] transition-colors"
            >
              Nous contacter
            </Link>
            <Link
              href="/equipe"
              className="border border-[#21262d] text-[#e6edf3] text-sm px-8 py-3.5 rounded-xl hover:border-[#00b4d8] transition-colors"
            >
              Voir l'équipe pédagogique
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
