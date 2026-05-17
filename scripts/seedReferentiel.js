require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

const REFERENTIEL = [
  {
    id: 'comportement',
    name: 'Comportement mécanique',
    code: 'S3',
    description: 'Référentiel BTS CPI · 2 semestres · Compétences C9, C10',
    sequences: [
      {
        id: 's31',
        seq: "S3.1 — Chaîne d'énergie",
        semestre: 'S1',
        items: [
          { id: 's31-1', contenu: "Notion de chaîne d'énergie : chaîne d'action, chaîne d'information. Alimentation, distribution, conversion, transmission, effet utile.", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's31-2', contenu: "Analyse d'une chaîne d'énergie sur système réel (vérin, moteur, réducteur). Bilan des puissances, rendement global.", type: 'td', niveau: 3, competences: ['C9'] },
          { id: 's31-3', contenu: "Mesure de puissance et de rendement sur banc d'essai.", type: 'tp', niveau: 3, competences: ['C9'] },
        ]
      },
      {
        id: 's321',
        seq: 'S3.2.1 — Modélisation des mécanismes',
        semestre: 'S1',
        items: [
          { id: 's321-1', contenu: "Cinématique des liaisons : nature du contact (ponctuel, linéique, surfacique), repère local, degrés de liberté. Modèle des liaisons élémentaires (pivot, glissière, rotule…).", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's321-2', contenu: "Schéma cinématique minimal et architectural. Graphe des liaisons, classes d'équivalence. Degré de mobilité, degré d'hyperstaticité.", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's321-3', contenu: "Modélisation des liaisons technologiques. Liaisons en série / parallèle : liaison équivalente (2 à 3 liaisons). Isostatisme.", type: 'td', niveau: 3, competences: ['C9'] },
          { id: 's321-4', contenu: "Réalisation du schéma cinématique d'un mécanisme réel sous SolidWorks / CATIA.", type: 'tp', niveau: 3, competences: ['C9'] },
        ]
      },
      {
        id: 's322',
        seq: 'S3.2.2 — Cinématique translation/rotation',
        semestre: 'S1',
        items: [
          { id: 's322-1', contenu: "Notion de référentiel, repère. Mouvements de rotation et translation. Position, trajectoire, vitesse, accélération. Champ des vecteurs-vitesse.", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's322-2', contenu: "Représentation graphique et analytique des positions, vitesses et accélérations (mouvements uniformes et uniformément variés).", type: 'td', niveau: 3, competences: ['C9'] },
          { id: 's322-3', contenu: "Évaluation : schéma cinématique + cinématique d'un mécanisme plan.", type: 'eval', niveau: 3, competences: ['C9'] },
        ]
      },
      {
        id: 's323',
        seq: 'S3.2.3 — Mouvements plans & CIR',
        semestre: 'S1',
        items: [
          { id: 's323-1', contenu: "Équiprojectivité du champ des vecteurs vitesse. Centre instantané de rotation (CIR). Distribution du champ des vecteurs vitesse en mouvement plan.", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's323-2', contenu: "Construction géométrique du CIR. Application aux mécanismes à barres, biellette-manivelle.", type: 'td', niveau: 3, competences: ['C9'] },
          { id: 's323-3', contenu: "Simulation cinématique d'un mécanisme plan (SolidWorks Motion).", type: 'tp', niveau: 3, competences: ['C9'] },
        ]
      },
      {
        id: 's324',
        seq: 'S3.2.4 — Actions mécaniques',
        semestre: 'S2',
        items: [
          { id: 's324-1', contenu: "Modélisation des actions mécaniques : torseur, résultante, moment. Conditions aux limites. Détermination des inconnues de liaisons (statique plane).", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's324-2', contenu: "Application des principes fondamentaux de la statique. Calcul des actions transmissibles dans les liaisons.", type: 'td', niveau: 3, competences: ['C9'] },
          { id: 's324-3', contenu: "Validation par simulation logicielle (SolidWorks Simulation ou RDM6).", type: 'tp', niveau: 3, competences: ['C9', 'C10'] },
        ]
      },
      {
        id: 's325',
        seq: 'S3.2.5 — Comportement dynamique',
        semestre: 'S2',
        items: [
          { id: 's325-1', contenu: "Principe fondamental de la dynamique (translation rectiligne, rotation axe fixe). Matrices d'inertie. Notions de vibrations, fréquences propres.", type: 'cours', niveau: 2, competences: ['C9', 'C10'] },
          { id: 's325-2', contenu: "Calcul du centre de gravité et du moment d'inertie (théorème de Huygens). Application au dimensionnement d'actionneur.", type: 'td', niveau: 3, competences: ['C9'] },
          { id: 's325-3', contenu: "Exploitation logicielle : analyse modale, fréquences propres d'une pièce simple.", type: 'tp', niveau: 3, competences: ['C10'] },
        ]
      },
      {
        id: 's326',
        seq: 'S3.2.6 — Résistance des matériaux',
        semestre: 'S2',
        items: [
          { id: 's326-1', contenu: "Hypothèses de la RDM : modèle poutre, Navier-Bernoulli. Efforts de cohésion, diagrammes (effort normal, tranchant, moment de flexion, torsion).", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's326-2', contenu: "Sollicitations simples : traction/compression, flexion, torsion. Contraintes normales et tangentielles. Condition de résistance. Notion de flambement.", type: 'cours', niveau: 3, competences: ['C9'] },
          { id: 's326-3', contenu: "Sollicitations composées : flexion-traction, flexion-torsion. Contraintes équivalentes Tresca et Von Mises. Notions d'élasticité, maillage, conditions aux limites.", type: 'td', niveau: 3, competences: ['C9', 'C10'] },
          { id: 's326-4', contenu: "TP RDM6 : pré-dimensionnement d'un arbre, analyse par éléments finis. Évaluation finale S3.", type: 'tp', niveau: 4, competences: ['C9', 'C10'] },
        ]
      },
      {
        id: 's327',
        seq: 'S3.2.7 — Mécanique des fluides',
        semestre: 'S2',
        items: [
          { id: 's327-1', contenu: "Hydrostatique, hydrodynamique. Application aux circuits hydrauliques et pneumatiques. Dimensionnement d'un vérin.", type: 'cours', niveau: 2, competences: ['C9'] },
        ]
      },
    ]
  },
  {
    id: 'construction',
    name: 'Construction mécanique',
    code: 'S5',
    description: 'Référentiel BTS CPI · 2 semestres · Compétences C8, C9, C10',
    sequences: [
      {
        id: 's51',
        seq: 'S5.1 — Solutions constructives des liaisons',
        semestre: 'S1',
        items: [
          { id: 's51-1', contenu: "Nature des liaisons. Surfaces fonctionnelles : mise en position (MiP), maintien en position (MaP). Influence sur précision, tenue aux efforts, rigidité.", type: 'cours', niveau: 2, competences: ['C8'] },
          { id: 's51-2', contenu: "Assemblages démontables : visserie, goupilles, clavettes. Assemblages permanents : soudage, collage, frettage. Lubrification et étanchéité.", type: 'cours', niveau: 2, competences: ['C8'] },
          { id: 's51-3', contenu: "Guidages en rotation (paliers lisses, roulements) et en translation (glissières, rails). Liaison rotule, liaison hélicoïdale. Joints d'étanchéité.", type: 'cours', niveau: 2, competences: ['C8', 'C9'] },
          { id: 's51-4', contenu: "Pré-dimensionnement et choix à l'aide de bases de données constructeurs (SKF, NSK…). Données technico-économiques comparatives.", type: 'td', niveau: 3, competences: ['C8', 'C9'] },
          { id: 's51-5', contenu: "TP : montage/démontage d'un guidage, identification des éléments, choix d'un roulement sur catalogue.", type: 'tp', niveau: 3, competences: ['C8'] },
        ]
      },
      {
        id: 's52',
        seq: 'S5.2 — Éléments de transmission de puissance',
        semestre: 'S1',
        items: [
          { id: 's52-1', contenu: "Comportement cinématique : loi entrée-sortie, réversibilité. Puissance, rendement. Transmissions à vitesse angulaire constante : accouplements, embrayages, limiteurs de couple, freins.", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's52-2', contenu: "Transmissions avec modification de vitesse angulaire : poulies-courroies, chaînes, engrenages (trains simples et épicycloïdaux). Application aux réducteurs et boîtes de vitesses.", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's52-3', contenu: "Transmissions avec transformation de mouvement : vis-écrou, cames simples, systèmes articulés plans. Relations entrée-sortie.", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's52-4', contenu: "TD : calcul de rapport de réduction, pré-dimensionnement d'une courroie, d'une chaîne ou d'un engrenage sur catalogue.", type: 'td', niveau: 3, competences: ['C9'] },
          { id: 's52-5', contenu: "TP SolidWorks : simulation d'un train d'engrenages, vérification cinématique. Évaluation : choix et dimensionnement d'une transmission.", type: 'tp', niveau: 3, competences: ['C9'] },
        ]
      },
      {
        id: 's53',
        seq: "S5.3 — Éléments de conversion d'énergie",
        semestre: 'S2',
        items: [
          { id: 's53-1', contenu: "Grandeurs caractéristiques entrée/sortie, espace de fonctionnement. Convertisseurs électriques : moteur CC, brushless, synchrone, asynchrone, pas à pas.", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's53-2', contenu: "Convertisseurs hydrauliques et pneumatiques : vérins, moteurs, pompes, compresseurs. Chaîne d'alimentation et de distribution (approche fonctionnelle).", type: 'cours', niveau: 2, competences: ['C9'] },
          { id: 's53-3', contenu: "TD : choix d'un actionneur adapté à un cahier des charges. Lecture de courbes caractéristiques constructeur.", type: 'td', niveau: 3, competences: ['C9'] },
          { id: 's53-4', contenu: "TP : identification et analyse d'une chaîne d'énergie complète sur système réel (banc motoréducteur ou vérin).", type: 'tp', niveau: 3, competences: ['C9', 'C10'] },
        ]
      },
      {
        id: 's54',
        seq: 'S5.4 — Capteurs',
        semestre: 'S2',
        items: [
          { id: 's54-1', contenu: "Rôle des capteurs dans la chaîne d'information. Familles de capteurs (position, vitesse, effort, pression). Caractéristiques : sensibilité, résolution, étendue de mesure.", type: 'cours', niveau: 2, competences: ['C8'] },
          { id: 's54-2', contenu: "Intégration d'un capteur dans un mécanisme : contraintes d'implantation, signal de sortie. Lecture de documentation technique constructeur.", type: 'td', niveau: 2, competences: ['C8'] },
          { id: 's54-3', contenu: "TP : acquisition et exploitation d'un signal capteur (capteur de position, codeur incrémental).", type: 'tp', niveau: 3, competences: ['C8'] },
        ]
      },
      {
        id: 's55',
        seq: 'S5.5 — Recherche documentaire',
        semestre: 'S2',
        items: [
          { id: 's55-1', contenu: "Méthodologie de recherche documentaire technique : normes, catalogues constructeurs, bases de données en ligne (INPI, brevets). Propriété industrielle.", type: 'cours', niveau: 1, competences: ['C8'] },
          { id: 's55-2', contenu: "TD : recherche et exploitation d'une documentation technique pour justifier un choix constructif.", type: 'td', niveau: 2, competences: ['C8'] },
          { id: 's55-3', contenu: "Évaluation finale S5 : étude complète d'un mécanisme (liaisons, transmission, actionneur, capteur).", type: 'eval', niveau: 3, competences: ['C8', 'C9', 'C10'] },
        ]
      },
    ]
  },
  {
    id: 'conception',
    name: 'Conception mécanique',
    code: 'S2',
    description: 'Référentiel BTS CPI · 2 semestres · Compétences C7, C8, C11',
    sequences: [
      {
        id: 's11',
        seq: 'S1.1 — Ingénierie système & analyse fonctionnelle',
        semestre: 'S1',
        items: [
          { id: 's11-1', contenu: "Démarche de conception : analyse du besoin, cahier des charges fonctionnel (CDCF), diagramme pieuvre, FAST. Ingénierie système et approche SysML.", type: 'cours', niveau: 2, competences: ['C7'] },
          { id: 's11-2', contenu: "Rédaction d'un cahier des charges fonctionnel partiel. Identification des fonctions de service et des contraintes sur un produit industriel réel.", type: 'td', niveau: 3, competences: ['C7'] },
          { id: 's11-3', contenu: "TP : analyse fonctionnelle d'un mécanisme réel, construction du diagramme pieuvre et du FAST sous logiciel.", type: 'tp', niveau: 3, competences: ['C7'] },
        ]
      },
      {
        id: 's14',
        seq: 'S1.4 — Développement durable & éco-conception',
        semestre: 'S1',
        items: [
          { id: 's14-1', contenu: "Concepts de développement durable appliqués à la conception industrielle. Analyse du cycle de vie (ACV). Critères d'éco-conception : matériaux, procédés, recyclabilité.", type: 'cours', niveau: 2, competences: ['C7', 'C8'] },
          { id: 's14-2', contenu: "TD : comparaison de solutions techniques selon des critères d'éco-conception. Choix de matériaux en fonction de l'impact environnemental.", type: 'td', niveau: 2, competences: ['C7'] },
        ]
      },
      {
        id: 's21',
        seq: 'S2.1 — Concept de chaîne numérique',
        semestre: 'S1',
        items: [
          { id: 's21-1', contenu: "Définition de la chaîne numérique en conception industrielle : du cahier des charges à la fabrication. Interopérabilité des outils CAO/FAO/simulation. Notions de maquette numérique.", type: 'cours', niveau: 2, competences: ['C11'] },
        ]
      },
      {
        id: 's23',
        seq: 'S2.3 — Outils de conception et représentation numériques',
        semestre: 'S1',
        items: [
          { id: 's23-1', contenu: "Modélisation volumique : arbre de construction, esquisses, fonctions de forme. Robustesse et portabilité du modèle. Assemblage (mode ascendant / descendant). Paramétrisation.", type: 'cours', niveau: 2, competences: ['C11'] },
          { id: 's23-2', contenu: "TP SolidWorks / CATIA V5 : modélisation de pièces simples, création d'assemblages contraints, gestion de l'arbre de construction.", type: 'tp', niveau: 3, competences: ['C11'] },
          { id: 's23-3', contenu: "TP avancé : modélisation de pièces complexes, configurations, familles de pièces. Robustesse du modèle face aux modifications paramétriques.", type: 'tp', niveau: 4, competences: ['C11'] },
        ]
      },
      {
        id: 's22',
        seq: 'S2.2 — Simulation',
        semestre: 'S2',
        items: [
          { id: 's22-1', contenu: "Utilisation des outils de simulation intégrés au modeleur volumique : simulation cinématique, détection de collisions, simulation statique. Notion de modèle d'étude.", type: 'cours', niveau: 2, competences: ['C7', 'C11'] },
          { id: 's22-2', contenu: "TP : simulation du comportement cinématique d'un mécanisme (SolidWorks Motion ou CATIA DMU). Analyse des trajectoires, vitesses et collisions.", type: 'tp', niveau: 3, competences: ['C11'] },
          { id: 's22-3', contenu: "TP simulation structurelle : mise en place d'une étude éléments finis simple (maillage, conditions aux limites, interprétation des contraintes Von Mises).", type: 'tp', niveau: 3, competences: ['C11'] },
        ]
      },
      {
        id: 's24',
        seq: 'S2.4 — Représentations graphiques dérivées des maquettes numériques',
        semestre: 'S2',
        items: [
          { id: 's24-1', contenu: "Mise en plan normalisée à partir de la maquette 3D : vues, coupes, sections. Cotation fonctionnelle ISO. Spécifications géométriques (GPS) : tolérances dimensionnelles et géométriques.", type: 'cours', niveau: 2, competences: ['C8'] },
          { id: 's24-2', contenu: "TD : lecture et interprétation de plans industriels. Application des normes de cotation ISO. Identification des surfaces fonctionnelles et des spécifications associées.", type: 'td', niveau: 3, competences: ['C8'] },
          { id: 's24-3', contenu: "TP : génération automatique des mises en plan depuis la maquette numérique. Ajout de la cotation fonctionnelle et des tolérances géométriques.", type: 'tp', niveau: 3, competences: ['C8'] },
          { id: 's24-4', contenu: "Évaluation finale : mise en plan complète d'un sous-ensemble mécanique avec cotation fonctionnelle conforme aux normes GPS.", type: 'eval', niveau: 4, competences: ['C8', 'C11'] },
        ]
      },
    ]
  },
  {
    id: 'industrialisation',
    name: 'Industrialisation',
    code: 'S7',
    description: 'Référentiel BTS CPI · 2 semestres · Compétences C10, C11, C12, C13',
    sequences: [
      {
        id: 's711',
        seq: "S7.1.1 — Procédés d'obtention",
        semestre: 'S1',
        items: [
          { id: 's711-1', contenu: "Procédés primaires : fonderie (au sable, injection), moulage (injection plastique, compression, soufflage, extrusion), déformation (forgeage, estampage, emboutissage, découpe), méthodes des poudres, composites, procédés additifs.", type: 'cours', niveau: 2, competences: ['C10'] },
          { id: 's711-2', contenu: "Procédés secondaires et tertiaires : usinage (tournage, fraisage, perçage, rectification), traitements thermiques, assemblage (soudage, collage, fixation mécanique), finition (peinture, anodisation, métallisation).", type: 'cours', niveau: 2, competences: ['C10'] },
          { id: 's711-3', contenu: "TD : identification des procédés sur des pièces réelles. Analyse qualitative des caractéristiques obtenues (tolérance, rugosité, propriétés mécaniques). Comparaison multi-critères.", type: 'td', niveau: 3, competences: ['C10'] },
        ]
      },
      {
        id: 's712',
        seq: 'S7.1.2 — Optimisation du choix du procédé',
        semestre: 'S1',
        items: [
          { id: 's712-1', contenu: "Critères d'optimisation du choix procédé : forme et état de la matière entrante, caractéristiques physiques (tolérance, rugosité), géométries réalisables, règles de conception associées, impacts environnementaux, coûts.", type: 'cours', niveau: 2, competences: ['C10', 'C12'] },
          { id: 's712-2', contenu: "TD : analyse multi-critères pour le choix d'un procédé adapté à une pièce donnée. Utilisation d'abaques et de tableaux de comparaison. Justification technico-économique.", type: 'td', niveau: 3, competences: ['C10', 'C12'] },
        ]
      },
      {
        id: 's713',
        seq: 'S7.1.3 — Relations caractéristiques Produit-Matériau-Procédé',
        semestre: 'S1',
        items: [
          { id: 's713-1', contenu: "Liens entre fonction technique, spécifications géométriques et procédé de réalisation. Interaction forme / matériau / géométrie / procédé / coût. Contraintes de conception liées au procédé choisi.", type: 'cours', niveau: 2, competences: ['C10', 'C11'] },
          { id: 's713-2', contenu: "TD : étude de cas — modification d'une conception en fonction du procédé retenu. Intégration des contraintes de moulage, d'usinage ou de déformation dans la géométrie de la pièce.", type: 'td', niveau: 3, competences: ['C10', 'C11'] },
        ]
      },
      {
        id: 's714',
        seq: 'S7.1.4 — Méthodes de choix PMP',
        semestre: 'S2',
        items: [
          { id: 's714-1', contenu: "Méthodes d'optimisation par lecture de graphes de critères (méthode Ashby). Utilisation d'un logiciel adapté connecté à une base de données matériaux (CES EduPack ou équivalent). Choix multicritères.", type: 'cours', niveau: 2, competences: ['C10', 'C12'] },
          { id: 's714-2', contenu: "TP : utilisation d'un logiciel de sélection matériaux/procédés. Définition des critères, tracé des graphes, identification des familles candidates, justification du choix final.", type: 'tp', niveau: 3, competences: ['C10', 'C12'] },
        ]
      },
      {
        id: 's715',
        seq: "S7.1.5 — Optimisation d'un produit selon un procédé donné",
        semestre: 'S2',
        items: [
          { id: 's715-1', contenu: "Processus d'usinage : gamme d'usinage, phases, sous-phases, choix des surfaces d'appui (isostatisme en fabrication). Contrat de phase, cotation de fabrication. Optimisation des paramètres de coupe.", type: 'cours', niveau: 2, competences: ['C10', 'C13'] },
          { id: 's715-2', contenu: "TD : élaboration d'une gamme d'usinage simple. Définition des phases et sous-phases, choix des mises en position, rédaction d'un contrat de phase.", type: 'td', niveau: 3, competences: ['C10', 'C13'] },
          { id: 's715-3', contenu: "TP FAO : programmation d'un usinage simple sous logiciel CAO/FAO (SolidWorks CAM ou CATIA). Génération du programme CN, simulation et vérification.", type: 'tp', niveau: 4, competences: ['C10', 'C13'] },
        ]
      },
      {
        id: 's72',
        seq: 'S7.2 — Création de prototypes',
        semestre: 'S2',
        items: [
          { id: 's72-1', contenu: "Domaines d'utilisation des prototypes : vérification ergonomie, esthétique, contraintes fonctionnelles. Technologies de prototypage rapide (FDM, SLA, SLS, jet de liant).", type: 'cours', niveau: 2, competences: ['C11', 'C12'] },
          { id: 's72-2', contenu: "Préparations CAO liées au prototypage : analyse de formes, fonctionnalités logicielles, paramétrage des fichiers (.STL, .3MF). Numérisation et reconstruction 3D (scanner).", type: 'td', niveau: 2, competences: ['C11'] },
          { id: 's72-3', contenu: "TP : impression 3D d'une pièce conçue en CAO. Préparation du fichier, réglage des paramètres machine. Contrôle dimensionnel du prototype obtenu.", type: 'tp', niveau: 3, competences: ['C11', 'C12'] },
        ]
      },
      {
        id: 's61',
        seq: 'S6.1 — Spécification des produits',
        semestre: 'S2',
        items: [
          { id: 's61-1', contenu: "Spécifications géométriques des produits (GPS) : tolérances dimensionnelles, tolérances géométriques (forme, orientation, position). Lecture et interprétation d'une chaîne de cotes.", type: 'cours', niveau: 2, competences: ['C8'] },
          { id: 's61-2', contenu: "TD : analyse d'une chaîne de cotes fonctionnelle. Calcul des tolérances par la méthode arithmétique et statistique. Vérification de la conformité d'un assemblage.", type: 'td', niveau: 3, competences: ['C8'] },
        ]
      },
      {
        id: 's62',
        seq: 'S6.2 — Processus de contrôle',
        semestre: 'S2',
        items: [
          { id: 's62-1', contenu: "Métrologie dimensionnelle : instruments de mesure (pied à coulisse, micromètre, colonne de mesure, MMT). Notion d'incertitude de mesure. Erreurs de justesse, répétabilité, reproductibilité.", type: 'cours', niveau: 2, competences: ['C13'] },
          { id: 's62-2', contenu: "TP métrologie : mesures dimensionnelles sur pièces usinées, utilisation d'une MMT, analyse statistique des résultats (moyenne, écart-type, capabilité Cp/Cpk).", type: 'tp', niveau: 3, competences: ['C13'] },
          { id: 's62-3', contenu: "Évaluation finale S7 : étude complète d'industrialisation d'une pièce (choix procédé, gamme d'usinage, spécifications, contrôle).", type: 'eval', niveau: 4, competences: ['C10', 'C12', 'C13'] },
        ]
      },
    ]
  },
];

async function seed() {
  console.log('🚀 Début du seed référentiel BTS CPI...');
  for (const matiere of REFERENTIEL) {
    const { sequences, ...matiereData } = matiere;
    await db.collection('referentiel').doc(matiere.id).set(matiereData);
    for (const seq of sequences) {
      const { items, ...seqData } = seq;
      await db
        .collection('referentiel').doc(matiere.id)
        .collection('sequences').doc(seq.id)
        .set(seqData);
      for (const item of items) {
        await db
          .collection('referentiel').doc(matiere.id)
          .collection('sequences').doc(seq.id)
          .collection('items').doc(item.id)
          .set(item);
      }
    }
    console.log(`✅ ${matiere.name} seedé (${sequences.length} séquences)`);
  }
  console.log('🎉 Seed terminé !');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });