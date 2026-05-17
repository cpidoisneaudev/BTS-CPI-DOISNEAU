'use client';

import Link from 'next/link';
import Image from 'next/image';

const competences = [
  {
    code: 'C1',
    titre: "S'intégrer dans un environnement professionnel",
    desc: "Assurer une veille technologique et capitaliser l'expérience acquise en entreprise.",
    color: 'border-[#00b4d8]/30 bg-[#00b4d8]/5',
    textColor: 'text-[#00b4d8]',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=80',
  },
  {
    code: 'C3',
    titre: 'Formuler et transmettre des informations',
    desc: "Communiquer sous forme écrite et orale y compris en anglais avec les équipes.",
    color: 'border-[#9d95e8]/30 bg-[#9d95e8]/5',
    textColor: 'text-[#9d95e8]',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80',
  },
  {
    code: 'C4',
    titre: "S'impliquer dans un groupe projet",
    desc: "Argumenter des choix techniques et contribuer activement aux décisions d'équipe.",
    color: 'border-[#e07b39]/30 bg-[#e07b39]/5',
    textColor: 'text-[#e07b39]',
    img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80',
  },
];

const etapes = [
  { num: '01', titre: 'Trouver une entreprise', desc: "Cherchez une entreprise avec un Bureau d'Études dans votre secteur. Utilisez la liste des partenaires du lycée.", icon: '🔍' },
  { num: '02', titre: 'Envoyer votre candidature', desc: 'Préparez votre CV et lettre de motivation. Envoyez par mail et/ou courrier postal au DRH ou responsable BE.', icon: '📨' },
  { num: '03', titre: "Lettre d'acceptation", desc: "Une fois accepté, remplissez la lettre d'acceptation et remettez-la à l'administration du lycée.", icon: '✅' },
  { num: '04', titre: 'Convention de stage', desc: "Le lycée établit la convention en 3 exemplaires : entreprise, lycée, étudiant.", icon: '📋' },
  { num: '05', titre: 'Réaliser le stage', desc: "8 semaines en bureau d'études. Prenez des notes, observez, participez activement aux projets.", icon: '⚙️' },
  { num: '06', titre: 'Rédiger le rapport', desc: "Rapport numérique de 30 pages + annexes en anglais. Visé par l'entreprise avant remise.", icon: '📝' },
];

const documents = [
  {
    titre: 'Lettre de motivation',
    desc: "Exemple de lettre destinée au DRH ou responsable Bureau d'Études.",
    taille: '36.3 KB',
    href: '/documents/lettre-motivation.pdf',
    color: 'border-[#00b4d8]/30 hover:border-[#00b4d8]',
    badge: 'PDF',
    badgeColor: 'bg-[#00b4d8]/10 text-[#00b4d8] border-[#00b4d8]/30',
    icon: '✉️',
  },
  {
    titre: 'Curriculum Vitae (CV)',
    desc: 'Exemple de CV — structure à reproduire avec vos informations réelles.',
    taille: '129.4 KB',
    href: '/documents/cv-exemple.pdf',
    color: 'border-[#9d95e8]/30 hover:border-[#9d95e8]',
    badge: 'PDF',
    badgeColor: 'bg-[#9d95e8]/10 text-[#9d95e8] border-[#9d95e8]/30',
    icon: '👤',
  },
  {
    titre: "Lettre d'acceptation",
    desc: "À remettre à l'administration du lycée une fois l'entreprise trouvée.",
    taille: '186.6 KB',
    href: '/documents/lettre-acceptation.pdf',
    color: 'border-[#e07b39]/30 hover:border-[#e07b39]',
    badge: 'PDF',
    badgeColor: 'bg-[#e07b39]/10 text-[#e07b39] border-[#e07b39]/30',
    icon: '📄',
  },
  {
    titre: 'Grille évaluation tuteur',
    desc: 'Grille destinée au tuteur en entreprise pour évaluer le stagiaire.',
    taille: '84.7 KB',
    href: '/documents/grille-tuteur.pdf',
    color: 'border-green-500/30 hover:border-green-500',
    badge: 'PDF',
    badgeColor: 'bg-green-500/10 text-green-400 border-green-500/30',
    icon: '📊',
  },
];

const conseils = [
  { titre: 'Cibler les bons secteurs', desc: "Automobile, aéronautique, médical, robotique — cherchez des entreprises avec un vrai Bureau d'Études mécanique.", img: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=300&q=80' },
  { titre: 'Commencez tôt', desc: "Ne cherchez pas en avril ! Démarrez vos recherches dès janvier-février pour les meilleures opportunités.", img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&q=80' },
  { titre: 'Soignez votre CV', desc: "Mettez en avant vos compétences SolidWorks, CATIA V5, et vos projets réalisés en classe.", img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&q=80' },
  { titre: 'Relancez par téléphone', desc: "Après l'envoi, relancez 1 semaine après. Un appel téléphonique fait souvent la différence.", img: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=300&q=80' },
  { titre: 'Utilisez les réseaux', desc: "LinkedIn, Indeed, les anciens étudiants du BTS CPI Doisneau — votre réseau est votre meilleur atout.", img: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=300&q=80' },
  { titre: 'Personnalisez chaque lettre', desc: "Ne copiez-collez pas ! Adaptez votre lettre à chaque entreprise en mentionnant leurs produits.", img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&q=80' },
];

const secteurs = [
  { label: 'Automobile', detail: 'Moteurs & transmissions', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=80' },
  { label: 'Aéronautique', detail: 'Turbines & structures', img: 'https://images.unsplash.com/photo-1598621961279-557cec9ba744?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { label: 'Robotique', detail: 'Bras articulés & actionneurs', img: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=300&q=80' },
  { label: 'Médical', detail: 'Implants & dispositifs', img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=300&q=80' },
  { label: 'Énergie', detail: 'Turbines & engrenages', img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&q=80' },
  { label: 'Naval', detail: 'Propulsion & gouvernail', img: 'https://images.unsplash.com/photo-1775606723628-d91325e20a18?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { label: 'Ferroviaire', detail: 'Bogies & suspension', img: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&q=80' },
  { label: 'Défense', detail: 'Systèmes hydrauliques', img: 'https://images.unsplash.com/photo-1600959134647-9b373b5082c4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

export default function StagesPage() {
  return (
    <div className="bg-[#0d1117] text-[#e6edf3] min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00b4d8]/10 via-transparent to-[#e07b39]/10 pointer-events-none"/>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div>
            <div className="inline-flex items-center gap-2 bg-[#00b4d8]/10 border border-[#00b4d8]/30 rounded-full px-4 py-1.5 text-xs text-[#00b4d8] mb-6">
              🏢 Épreuve U52 — BTS CPI
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Stage en<br />
              <span className="text-[#00b4d8]">Bureau</span><br />
              <span className="text-[#e07b39]">d'Études</span>
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed mb-6">
              8 semaines d'immersion professionnelle au coeur d'un Bureau d'Études industriel.
              Une expérience fondamentale pour votre carrière de technicien supérieur.
            </p>

            <div className="bg-[#161b22] border border-[#e07b39]/30 rounded-xl p-5 mb-6">
              <p className="text-xs text-[#e07b39] uppercase tracking-widest mb-2">Promotion 2025/2026</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-semibold text-[#e6edf3]">Lundi 11 Mai au Vendredi 03 Juillet 2026</p>
                  <p className="text-xs text-[#8b949e]">Durée : 8 semaines — Stage obligatoire en bureau d'études</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="#documents" className="bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#0099bb] transition-colors">
                Télécharger les documents
              </a>
              <Link href="/contact" className="border border-[#21262d] text-[#e6edf3] text-sm px-6 py-3 rounded-lg hover:border-[#00b4d8] transition-colors">
                Contacter l'équipe
              </Link>
            </div>
          </div>

          {/* Image hero */}
          <div className="hidden lg:block relative h-[480px] rounded-2xl overflow-hidden border border-[#21262d]">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
              alt="Ingénieur en bureau d'études"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/60 via-transparent to-transparent"/>
            {/* Badge flottant */}
            <div className="absolute bottom-6 left-6 bg-[#0d1117]/80 backdrop-blur-sm border border-[#21262d] rounded-xl px-4 py-3">
              <p className="text-xs text-[#8b949e]">Stage en entreprise</p>
              <p className="text-sm font-semibold text-[#e6edf3]">Bureau d'Études industriel</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OBJECTIFS ── */}
      <section className="border-y border-[#21262d] bg-[#161b22]/50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          <p className="text-xs text-[#8b949e] text-center mb-6 uppercase tracking-widest">
            Extrait du référentiel BTS CPI
          </p>
          <p className="text-sm text-[#8b949e] leading-relaxed text-center max-w-4xl mx-auto">
            Le stage en milieu professionnel permet au futur technicien supérieur de prendre la mesure des réalités
            techniques et économiques de l'entreprise. L'étudiant appréhende le fonctionnement de l'entreprise au travers
            de la conception et la réalisation de ses produits, ses marchés, ses équipements, son organisation du travail
            et ses ressources humaines.
          </p>
        </div>
      </section>

{/* ── SECTEURS ── */}
<section className="max-w-6xl mx-auto px-6 md:px-10 py-10">
  <p className="text-xs text-[#8b949e] uppercase tracking-widest mb-5 text-center">Secteurs d'accueil</p>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {secteurs.map((s, i) => (
      <div key={i} className="relative h-36 rounded-xl overflow-hidden border border-[#21262d] group cursor-default">
        <Image
          src={s.img}
          alt={s.label}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/90 via-[#0d1117]/30 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-semibold text-[#e6edf3] leading-tight">{s.label}</p>
          <p className="text-[10px] text-[#8b949e] mt-0.5">{s.detail}</p>
        </div>
      </div>
    ))}
  </div>
</section>

      {/* ── COMPÉTENCES ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="text-center mb-12">
          <p className="text-xs text-[#00b4d8] uppercase tracking-widest mb-3">Référentiel</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Compétences développées</h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
            Les trois compétences clés évaluées lors du stage en entreprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {competences.map((c, i) => (
            <div key={i} className={`border rounded-2xl overflow-hidden ${c.color}`}>
              {/* Image */}
              <div className="relative h-40 w-full">
                <Image src={c.img} alt={c.titre} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/70 to-transparent"/>
                <span className={`absolute bottom-3 left-3 text-xs font-mono font-bold bg-[#0d1117]/80 px-2 py-0.5 rounded ${c.textColor}`}>
                  {c.code}
                </span>
              </div>
              {/* Contenu */}
              <div className="p-5">
                <h3 className="text-sm font-semibold text-[#e6edf3] mb-2">{c.titre}</h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÉTAPES ── */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs text-[#9d95e8] uppercase tracking-widest mb-3">Guide pratique</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Comment trouver votre stage ?</h2>
            <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
              Suivez ces 6 étapes pour décrocher votre stage en Bureau d'Études.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {etapes.map((e, i) => (
              <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 hover:border-[#00b4d8]/40 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#00b4d8]/10 border border-[#00b4d8]/30 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-[#00b4d8]">{e.num}</span>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">{e.icon}</div>
                    <h3 className="text-sm font-semibold text-[#e6edf3] mb-2 group-hover:text-[#00b4d8] transition-colors">{e.titre}</h3>
                    <p className="text-xs text-[#8b949e] leading-relaxed">{e.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTS ── */}
      <section id="documents" className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs text-[#e07b39] uppercase tracking-widest mb-3">Ressources</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Documents à télécharger</h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
            Tous les documents nécessaires pour préparer et valider votre stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((d, i) => (
            <div key={i} className={`bg-[#161b22] border rounded-xl p-5 transition-colors ${d.color}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{d.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#e6edf3]">{d.titre}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded border ${d.badgeColor}`}>{d.badge}</span>
                    </div>
                    <p className="text-xs text-[#8b949e] leading-relaxed mb-2">{d.desc}</p>
                    <span className="text-xs text-[#8b949e]">{d.taille}</span>
                  </div>
                </div>
                <a href={d.href} download className="flex-shrink-0 bg-[#0d1117] border border-[#21262d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] text-xs px-3 py-2 rounded-lg transition-colors">
                  Télécharger
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-[#161b22] border border-[#21262d] rounded-xl p-5">
          <p className="text-xs text-[#8b949e]">
            ⚠️ Le CV proposé est basé sur des informations réelles et inventées — seule sa structure fait office d'exemple à reproduire avec vos vraies informations.
          </p>
        </div>
      </section>

      {/* ── ÉPREUVE U52 ── */}
      <section className="bg-[#161b22]/30 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs text-[#9d95e8] uppercase tracking-widest mb-3">Examen</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Épreuve U52 — Rapport de stage</h2>
            <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
              Coeff. 1 — Oral de 20 minutes (10 min présentation + 10 min questions)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
              {/* Image rapport */}
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80"
                  alt="Rédaction rapport"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-[#161b22]/40 to-transparent"/>
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="text-3xl">📄</div>
                  <h3 className="text-base font-semibold text-[#e6edf3]">Le rapport numérique</h3>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {[
                  { icon: '📏', text: '30 pages environ, hors annexes' },
                  { icon: '✅', text: "Visé par l'entreprise avant remise" },
                  { icon: '🔍', text: 'Compte rendu des activités et analyses' },
                  { icon: '💡', text: 'Bilan des acquis : technique, économique, organisationnel' },
                  { icon: '🇬🇧', text: '3 documents en anglais dans les annexes (1 page chacun)' },
                  { icon: '📋', text: 'Tâches A4-T1 et A4-T3 obligatoirement documentées' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#0d1117] rounded-lg px-4 py-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs text-[#8b949e]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
              {/* Image soutenance */}
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80"
                  alt="Soutenance orale"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-[#161b22]/40 to-transparent"/>
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="text-3xl">🎤</div>
                  <h3 className="text-base font-semibold text-[#e6edf3]">La soutenance orale</h3>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {[
                  { icon: '⏱️', text: '10 minutes de présentation + 10 minutes de questions' },
                  { icon: '🖥️', text: 'Diaporama obligatoire (nombre de diapos libre)' },
                  { icon: '👔', text: 'Présentation individuelle devant jury externe' },
                  { icon: '📊', text: "Grille d'évaluation fournie au tuteur en entreprise" },
                  { icon: '🏆', text: 'Coefficient 1 — épreuve de validation du stage' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#0d1117] rounded-lg px-4 py-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs text-[#8b949e]">{item.text}</span>
                  </div>
                ))}
                <div className="mt-2 bg-[#9d95e8]/10 border border-[#9d95e8]/30 rounded-lg p-4">
                  <p className="text-xs text-[#9d95e8]">
                    💡 Exemples de rapport et diaporama à venir — consultez régulièrement la plateforme !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSEILS ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs text-green-400 uppercase tracking-widest mb-3">Astuces</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Conseils pour réussir votre recherche</h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto">
            Les conseils de vos professeurs pour trouver le meilleur stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {conseils.map((c, i) => (
            <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden hover:border-green-500/30 transition-colors group">
              {/* Image */}
              <div className="relative h-36">
                <Image src={c.img} alt={c.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent"/>
              </div>
              {/* Contenu */}
              <div className="p-5">
                <h3 className="text-sm font-semibold text-[#e6edf3] mb-2 group-hover:text-green-400 transition-colors">{c.titre}</h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="relative rounded-3xl overflow-hidden border border-[#21262d]">
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80"
              alt="Bureau industriel"
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#00b4d8]/20 via-[#0d1117]/80 to-[#e07b39]/20"/>
          </div>
          {/* Contenu */}
          <div className="relative p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Une question sur<br />
              <span className="text-[#00b4d8]">votre stage ?</span>
            </h2>
            <p className="text-[#8b949e] text-sm max-w-lg mx-auto mb-8">
              Notre équipe pédagogique du BTS CPI Doisneau est disponible pour vous accompagner.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="bg-[#00b4d8] text-[#0d1117] font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#0099bb] transition-colors">
                Nous contacter
              </Link>
              <Link href="/epreuves" className="border border-[#e6edf3]/20 text-[#e6edf3] text-sm px-8 py-3.5 rounded-xl hover:border-[#e6edf3]/50 transition-colors backdrop-blur-sm">
                Voir les épreuves
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}