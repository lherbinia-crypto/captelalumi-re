# Carnet du prof

Application de classe pour iPad, inspirée d'iDoceo. Elle fonctionne hors ligne et toutes les données restent sur l'appareil.

## Fonctions

- **Élèves** : fiche par élève (photo, coordonnées, remarques, pièces jointes). Import d'une liste par copier-coller.
- **Carnet de cotes** : colonnes d'évaluation avec date, maximum, pondération et catégorie (compétence). Les moyennes sont pondérées et colorées selon le seuil de réussite. On peut aussi saisir `abs`, `exc`, `ne` ou `7/10`. Export CSV et impression.
- **Présences** : présent, absent, retard ou justifié, avec un motif. Bouton « Tous présents » et récapitulatif par élève.
- **Journal de classe** : matière vue, devoirs avec date de remise et pièces jointes (fichiers, photos du tableau).
- **DAccE** (dossier d'accompagnement de l'élève) : observations, points forts, difficultés, aménagements raisonnables, remédiations et contacts avec les parents, avec pièces jointes.
- **Sauvegarde** : export ou restauration d'un fichier `.json` qui contient tout, pièces jointes comprises, vers Fichiers, iCloud Drive ou un e-mail.

## Installation sur iPad

1. Ouvrir l'adresse du site suivie de `/carnet/` dans **Safari**.
2. Toucher **Partager** puis **« Sur l'écran d'accueil »**.
3. Le Carnet s'ouvre alors en plein écran et marche sans connexion.

Faites une sauvegarde régulière (Réglages & sauvegarde) : si l'app est supprimée de l'iPad, ses données le sont aussi.

## Technique

Une seule page HTML sans dépendance (`index.html`). Les données sont stockées dans IndexedDB. `sw.js` (service worker) permet l'usage hors ligne et `manifest.webmanifest` l'installation.
