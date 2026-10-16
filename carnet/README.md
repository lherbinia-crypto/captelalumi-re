# Carnet du prof

Application de classe pour iPad, inspirée d'iDoceo. Elle fonctionne hors ligne et toutes les données restent sur l'appareil.

## Fonctions

- **Élèves** : fiche par élève (coordonnées, remarques, pièces jointes). Import d'une liste depuis un **fichier Excel (.xlsx) ou CSV**, ou par copier-coller.
- **Photos des élèves** : prises avec l'appareil photo de l'iPad ou choisies dans Photos, depuis la fiche de l'élève, à l'ajout d'un élève, ou avec le bouton « Photos des élèves » qui fait passer toute la classe à la suite. La photo apparaît partout : liste, carnet de cotes, présences, DAccE.
- **Carnet de cotes** : par période (la période en cours s'ouvre d'office), colonnes d'évaluation avec date, maximum, pondération et catégorie (compétence). Les moyennes sont pondérées et colorées selon le seuil de réussite. On peut aussi saisir `abs`, `exc`, `ne` ou `7/10`. Export CSV et impression.
- **Participation (fiche « Comment je suis coté(e) »)** : chaque élève démarre chaque période à 14/20. Les icônes ajoutent ou retirent des points en un geste (💡 +2, avis expliqué +1, écoute +1, coopération +1, travail soigné +1, pas en ordre −1, dérange −1, manque de respect −2), avec un bouton Annuler. La note reste entre 0 et 20. L'auto-évaluation de mi-période (rarement / parfois / souvent) se met à côté du relevé du professeur. La participation compte comme une évaluation sur 20 dans le total des points de la période.
- **Bulletins** : 3 périodes (dates de fin et poids réglables). La note de période sur 20 = total des points obtenus ÷ total des points possibles (participation comprise). L'année est la moyenne des périodes.
- **Élève au hasard** : bouton 🎲 pour interroger un élève, chacun son tour, sans les absents du jour, avec les icônes de participation à portée de main.
- **Présences** : présent, absent, retard ou justifié, avec un motif. Bouton « Tous présents » et récapitulatif par élève.
- **Journal de classe** : matière vue, devoirs avec date de remise et pièces jointes (fichiers, photos du tableau).
- **Aménagements raisonnables (AR)** : fiche par élève (motif confidentiel, liste, source, « à compléter »), étiquette AR visible partout en classe, rappel des AR de la classe dans le carnet de cotes et la participation, note DAccE créée depuis les AR, import des AR exportés du Journal de classe CPC.
- **DAccE complet** (structure officielle, comme le Journal de classe CPC) : suivi par élève, difficultés persistantes (axe, sous-axe, suivi), actions de soutien (catégorie, type, état ; « depuis ses AR », « action du maître de CPC »), points d'appui, commentaire pour les parents (1000 caractères, alerte sur les mots sensibles), mémo pour l'équipe généré depuis la fiche, vérification du minimum obligatoire, état des bilans BS1/BS2/BS3 avec échéance, synthèse de la classe et export CSV. Les observations datées restent dans le journal de suivi.
- **Import iDoceo** : à partir de l'export Excel d'une classe iDoceo, le Carnet reprend les élèves (« Nom, Prénom ») avec leurs photos, les évaluations (titre, maximum, date), les points de participation et les présences encodées. Il compare ses moyennes aux colonnes « Bulletin » et « Participation total » d'iDoceo.
- **Référentiel EPC (tronc commun)** : 4 visées et 8 compétences avec les attendus de 1re et de 2e secondaire. Une évaluation peut être reliée à une compétence, la fiche élève montre un bilan par compétence, le journal indique les compétences travaillées, et le DAccE reprend la compétence et son attendu dans le mémo.
- **Sauvegarde** : export ou restauration d'un fichier `.json` qui contient tout, pièces jointes comprises, vers Fichiers, iCloud Drive ou un e-mail.

## Installation sur iPad

1. Ouvrir l'adresse du site suivie de `/carnet/` dans **Safari**.
2. Toucher **Partager** puis **« Sur l'écran d'accueil »**.
3. Le Carnet s'ouvre alors en plein écran et marche sans connexion.

Faites une sauvegarde régulière (Réglages & sauvegarde) : si l'app est supprimée de l'iPad, ses données le sont aussi.

## Technique

Une seule page HTML sans dépendance (`index.html`). Les données sont stockées dans IndexedDB. `sw.js` (service worker) permet l'usage hors ligne et `manifest.webmanifest` l'installation.
