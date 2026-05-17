'use client';

import Link from 'next/link';
import Image from 'next/image';

const epreuvesObligatoires = [
  {
    code: 'U1',
    titre: 'Culture générale et expression',
    coef: 3,
    forme: 'Écrite',
    duree: '4 heures',
    type: 'ecrit',
    desc: 'Maîtrise de la langue française, analyse de documents, expression écrite argumentée.',
    color: 'border-[#8b949e]/30',
    icon: '✍️',
  },
  {
    code: 'U2',
    titre: 'Langue vivante étrangère (Anglais)',
    coef: 2,
    forme: 'CCF ou Orale',
    duree: '45 min',
    type: 'oral',
    desc: 'Compréhension et expression orale en anglais technique et professionnel.',
    color: 'border-[#8b949e]/30',
    icon: '🇬🇧',
  },
  {
    code: 'U31',
    titre: 'Mathématiques',
    coef: 2,
    forme: 'CCF ou Écrite',
    duree: '2 heures',
    type: 'ecrit',
    desc: 'Algèbre, analyse, géométrie et statistiques appliquées aux problèmes industriels.',
    color: 'border-[#8b949e]/30',
    icon: '📐',
  },
  {
    code: 'U32',
    titre: 'Physique-Chimie',
    coef: 2,
    forme: 'CCF ou Pratique',
    duree: '3 heures',
    type: 'pratique',
    desc: 'Mécanique, thermodynamique, électricité et chimie des matériaux.',
    color: 'border-[#8b949e]/30',
    icon: '⚗️',
  },
  {
    code: 'U41',
    titre: 'Expression du besoin et cahier des charges fonctionnel',
    coef: 2,
    forme: 'Orale',
    duree: '30 min',
    type: 'oral',
    desc: 'Rapport écrit de 15 pages max + soutenance 10 min + questionnement 10 min devant jury.',
    color: 'border-[#00b4d8]/30',
    icon: '📋',
  },
  {
    code: 'U42',
    titre: 'Conception préliminaire',
    coef: 6,
    forme: 'Écrite',
    duree: '6 heures',
    type: 'ecrit',
    desc: "L'épreuve reine du BTS CPI. Analyse d'un système mécanique complet et proposition de solutions techniques.",
    color: 'border-[#e07b39]/30',
    icon: '💡',
    important: true,
  },
  {
    code: 'U51',
    titre: 'Conception détaillée',
    coef: 5,
    forme: 'Orale',
    duree: '40 min (15+20+5)',
    type: 'oral',
    desc: 'Rapport de 30 pages max. Évaluation équipe pédagogique (30%) + jury (70%). Modélisation 3D et mise en plan.',
    color: 'border-[#9d95e8]/30',
    icon: '🖥️',
  },
  {
    code: 'U52',
    titre: 'Soutenance du rapport de stage',
    coef: 1,
    forme: 'Orale',
    duree: '20 min (10+10)',
    type: 'oral',
    desc: 'Rapport de stage de 30 pages max. Présentation de votre expérience en entreprise devant jury.',
    color: 'border-[#00b4d8]/30',
    icon: '🏢',
  },
  {
    code: 'U61',
    titre: 'Projet de prototypage',
    coef: 2,
    forme: 'CCF — Oral',
    duree: '20 min (10+10)',
    type: 'oral',
    desc: 'Présentation individuelle ou collective du projet de prototypage réalisé en équipe.',
    color: 'border-green-500/30',
    icon: '🖨️',
  },
  {
    code: 'U62',
    titre: "Projet collaboratif d'optimisation",
    coef: 3,
    forme: 'CCF — Pratique',
    duree: '4 heures',
    type: 'pratique',
    desc: "Projet mené en collaboration avec les étudiants de CPRP. Optimisation d'un produit existant.",
    color: 'border-green-500/30',
    icon: '👥',
  },
];

const epreuvesFactultatives = [
  { code: 'EF1', titre: 'Langue vivante étrangère', forme: 'Orale', duree: '20 min', icon: '🌍' },
  { code: 'EF2', titre: 'Culture design de produit', forme: 'CCF ou Orale', duree: '20 min', icon: '🎨' },
  { code: 'EF3', titre: 'Engagement étudiant', forme: 'CCF ou Orale', duree: '20 min', icon: '🤝' },
];

const typeColors = {
  ecrit: 'bg-[#00b4d8]/10 text-[#00b4d8] border-[#00b4d8]/30',
  oral: 'bg-[#9d95e8]/10 text-[#9d95e8] border-[#9d95e8]/30',
  pratique: 'bg-[#e07b39]/10 text-[#e07b39] border-[#e07b39]/30',
};

const typeLabels = {
  ecrit: '✍️ Écrit',
  oral: '🎤 Oral',
  pratique: '🔬 Pratique',
};

const conseils = [
  { icon: '📅', titre: 'Gérez votre temps', desc: 'Pour U42 (6h), entraînez-vous régulièrement sur des sujets des années précédentes.' },
  { icon: '📝', titre: 'Soignez vos rapports', desc: 'Les rapports U41, U51 et U52 comptent pour une grande part de la note finale.' },
  { icon: '🗣️', titre: 'Préparez vos oraux', desc: 'Entraînez-vous à présenter clairement avec un diaporama structuré et percutant.' },
  { icon: '👥', titre: 'Travaillez en équipe', desc: "U62 est un projet collaboratif — la cohésion d'équipe est évaluée." },
  { icon: '🇬🇧', titre: "Pratiquez l'anglais", desc: "Le vocabulaire technique en anglais est indispensable pour l'épreuve U2." },
  { icon: '⏰', titre: 'Anticipez les deadlines', desc: 'Les remises de rapports sont fixes — ne laissez jamais au dernier moment.' },
];

export default function EpreuvesPage() {
  const totalCoef = epreuvesObligatoires.reduce((acc, e) => acc + e.coef, 0);

  return (
    <div className="bg-[#0d1117] text-[#e6edf3] min-h-screen">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9d95e8]/10 via-transparent to-[#00b4d8]/10 pointer-events-none"/>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Texte */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#9d95e8]/10 border border-[#9d95e8]/30 rounded-full px-4 py-1.5 text-xs text-[#9d95e8] mb-6">
              📋 Référentiel officiel — BTS CPI
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Les <span className="text-[#9d95e8]">épreuves</span><br />
              du BTS <span className="text-[#00b4d8]">CPI</span>
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed mb-8">
              Le BTS CPI comporte 10 épreuves obligatoires réparties sur 2 ans,
              avec un total de {totalCoef} points de coefficient. Une épreuve écrite,
              5 épreuves orales et 4 épreuves pratiques ou CCF.
            </p>

            {/* Stats rapides */}
            <div className="flex flex-wrap gap-4">
              {[
                { val: '10', label: 'épreuves obligatoires', color: 'text-[#00b4d8]' },
                { val: `${totalCoef}`, label: 'points de coefficient', color: 'text-[#9d95e8]' },
                { val: '3', label: 'épreuves facultatives', color: 'text-[#e07b39]' },
                { val: '6h', label: 'épreuve la plus longue', color: 'text-green-400' },
              ].map((s, i) => (
                <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl px-5 py-3">
                  <span className={`text-2xl font-bold ${s.color}`}>{s.val}</span>
                  <p className="text-xs text-[#8b949e] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image — remplace /epreuves-hero.jpg par ta vraie photo dans /public */}
          <div className="hidden lg:block relative h-96 rounded-2xl overflow-hidden border border-[#21262d]">
            <Image
              src="/epreuves-hero.jpg"
              alt="Étudiants BTS CPI en salle d'examen"
              fill
              className="object-cover"
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Fallback si pas d'image */}
            <div className="absolute inset-0 bg-[#161b22] flex items-center justify-center">
              <div className="text-center text-[#8b949e]">
                <div className="text-6xl mb-4">
                                      <Image
                    src="/devoir.jpg"
                    alt="BTS CPI — Lycée Robert Doisneau"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-sm">Photo étudiants en examen</p>
                <p className="text-xs mt-1 text-[#8b949e]/50">Placez votre photo dans /public/epreuves-hero.jpg</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* LÉGENDE */}
      <section className="border-y border-[#21262d] bg-[#161b22]/50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center gap-6 flex-wrap">
          <span className="text-xs text-[#8b949e]">Type d'épreuve :</span>
          {Object.entries(typeColors).map(([type, color]) => (
            <span key={type} className={`text-xs px-3 py-1 rounded-full border ${color}`}>
              {typeLabels[type]}
            </span>
          ))}
        </div>
      </section>

      {/* ÉPREUVES OBLIGATOIRES */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="mb-10">
          <p className="text-xs text-[#9d95e8] uppercase tracking-widest mb-3">Examen</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Épreuves obligatoires</h2>
          <p className="text-[#8b949e] text-sm">Toutes les épreuves à valider pour obtenir le BTS CPI</p>
        </div>

        <div className="flex flex-col gap-4">
          {epreuvesObligatoires.map((e, i) => (
            <div
              key={i}
              className={`bg-[#161b22] border ${e.color} rounded-2xl p-6 hover:scale-[1.005] transition-transform ${e.important ? 'ring-1 ring-[#e07b39]/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="text-3xl mb-1">{e.icon}</div>
                    <span className="text-xs font-mono font-bold text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded">
                      {e.code}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-base font-semibold text-[#e6edf3]">{e.titre}</h3>
                      {e.important && (
                        <span className="text-xs bg-[#e07b39]/10 text-[#e07b39] border border-[#e07b39]/30 px-2 py-0.5 rounded-full">
                          ⭐ Épreuve clé
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#8b949e] leading-relaxed mb-3">{e.desc}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[e.type]}`}>
                        {typeLabels[e.type]}
                      </span>
                      <span className="text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] px-2 py-1 rounded-full">
                        ⏱️ {e.duree}
                      </span>
                      <span className="text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] px-2 py-1 rounded-full">
                        {e.forme}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[#00b4d8]">{e.coef}</span>
                    <span className="text-[10px] text-[#8b949e]">coef</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ÉPREUVES FACULTATIVES */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="mb-10">
            <p className="text-xs text-[#e07b39] uppercase tracking-widest mb-3">Bonus</p>
            <h2 className="text-2xl font-bold mb-2">Épreuves facultatives</h2>
            <p className="text-[#8b949e] text-sm">
              Les points obtenus au-dessus de 10/20 s'ajoutent à votre total. Profitez-en !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {epreuvesFactultatives.map((e, i) => (
              <div key={i} className="bg-[#161b22] border border-[#e07b39]/20 rounded-2xl p-6 hover:border-[#e07b39]/40 transition-colors">
                <div className="text-3xl mb-3">{e.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded">{e.code}</span>
                  <span className="text-xs bg-[#e07b39]/10 text-[#e07b39] border border-[#e07b39]/30 px-2 py-0.5 rounded-full">Facultative</span>
                </div>
                <h3 className="text-sm font-semibold text-[#e6edf3] mb-2">{e.titre}</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] px-2 py-1 rounded-full">{e.forme}</span>
                  <span className="text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] px-2 py-1 rounded-full">⏱️ {e.duree}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex items-center gap-4">
            <div className="text-4xl">💻</div>
            <div>
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-1">Certification PIX</h3>
              <p className="text-xs text-[#8b949e]">
                Certification nationale des compétences numériques — obligatoire, passée en cours d'année sur 2 heures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RÉPARTITION DES COEFFICIENTS */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">Stratégie</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Répartition des coefficients</h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
            Concentrez vos efforts sur les épreuves à fort coefficient pour maximiser votre moyenne.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#e6edf3] mb-5">🎯 Épreuves à fort coefficient</h3>
            <div className="flex flex-col gap-3">
              {[...epreuvesObligatoires]
                .sort((a, b) => b.coef - a.coef)
                .slice(0, 5)
                .map((e, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#8b949e] w-8">{e.code}</span>
                    <div className="flex-1 bg-[#0d1117] rounded-full h-2">
                      <div className="bg-[#00b4d8] h-2 rounded-full" style={{ width: `${(e.coef / 6) * 100}%` }}/>
                    </div>
                    <span className="text-sm font-bold text-[#00b4d8] w-12 text-right">coef {e.coef}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#00b4d8]/10 to-[#9d95e8]/10 border border-[#00b4d8]/20 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#e6edf3] mb-4">💡 Le saviez-vous ?</h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: '⭐', text: 'U42 (Conception préliminaire) représente à elle seule 20% de votre note finale avec un coef 6.' },
                { icon: '📊', text: "U51 (Conception détaillée) est notée à 30% par l'équipe pédagogique et 70% par le jury externe." },
                { icon: '🏆', text: 'Un étudiant qui excelle en U42 et U51 peut compenser des résultats moyens ailleurs.' },
                { icon: '✅', text: "Les CCF sont évalués en cours d'année — votre travail au quotidien compte !" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <p className="text-xs text-[#8b949e] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONSEILS */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs text-green-400 uppercase tracking-widest mb-3">Réussite</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Conseils pour réussir</h2>
            <p className="text-[#8b949e] text-sm max-w-xl mx-auto">Les clés pour décrocher votre BTS CPI avec mention.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {conseils.map((c, i) => (
              <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 hover:border-green-500/30 transition-colors group">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="text-sm font-semibold text-[#e6edf3] mb-2 group-hover:text-green-400 transition-colors">{c.titre}</h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
        <div className="bg-gradient-to-br from-[#9d95e8]/10 via-[#161b22] to-[#00b4d8]/10 border border-[#21262d] rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Accédez aux <span className="text-[#00b4d8]">ressources</span><br />
            pour préparer vos épreuves
          </h2>
          <p className="text-[#8b949e] text-sm max-w-lg mx-auto mb-8">
            Cours, TD, TP, sujets d'examens et anciens projets disponibles sur la plateforme.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login" className="bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#0099bb] transition-colors">
              Accéder aux ressources
            </Link>
            <Link href="/formation" className="border border-[#21262d] text-[#e6edf3] text-sm px-8 py-3.5 rounded-xl hover:border-[#00b4d8] transition-colors">
              Voir la formation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}