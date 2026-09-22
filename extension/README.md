# Extension Wokra pour Chrome, Edge et Brave

Cette extension Manifest V3 fonctionne sur les pages individuelles `linkedin.com/jobs/view/*`. Elle lit uniquement le descriptif visible de l’offre, calcule les indices localement et conserve un historique minimal dans `chrome.storage.local`.

## Installation locale

1. Ouvrir `chrome://extensions`, `edge://extensions` ou `brave://extensions`.
2. Activer le mode développeur.
3. Choisir **Charger l’extension non empaquetée** et sélectionner ce dossier `extension/`.
4. Ouvrir une offre LinkedIn, attendre son chargement : le badge Wokra apparaît automatiquement. L’icône permet de relancer l’analyse et de lire le détail des indices.

Le même dossier est compatible avec les trois navigateurs basés sur Chromium. Les icônes sont déjà incluses dans `icons/`. Pour publier l’extension, il faudra fournir une politique de confidentialité, préparer les visuels et suivre les exigences propres à chaque store ; aucun build n’est nécessaire pour l’installation locale.

## Données et permissions

L’extension demande l’accès aux pages LinkedIn Jobs et au stockage local du navigateur. Elle ne fait aucun appel réseau, ne lit pas les autres sites et ne conserve que l’URL normalisée, un résumé d’analyse et l’historique minimal de l’offre. L’historique est dédoublonné par jour, conservé 180 jours au maximum et limité à 500 offres.

Le contenu du descriptif n’est pas envoyé à Wokra. La détection reste heuristique : une absence de signal ne confirme pas qu’une offre est réelle, et un signal ne prouve pas qu’elle est fantôme.

## Interprétation

L’extension affiche « Données insuffisantes », « Points à vérifier » ou « Plusieurs indices à vérifier ». Elle ne marque jamais une annonce comme fausse : une annonce ancienne, une mention de vivier ou un recrutement conditionnel sont des signaux à vérifier, pas une preuve d’intention.

Les pages LinkedIn peuvent modifier leur HTML, limiter le contenu aux utilisateurs connectés ou afficher des dates relatives. Dans ce cas, l’analyse est partielle. Si le badge n’apparaît pas, recharge l’extension depuis la page des extensions puis recharge l’offre LinkedIn. Les pages de recherche, collections et profils LinkedIn ne sont pas analysées.
