# Extension Wokra pour Chrome, Edge et Brave

Cette extension Manifest V3 fonctionne sur les pages `linkedin.com/jobs/*`. Elle lit uniquement le texte déjà visible dans la page, calcule les indices localement et conserve un historique minimal dans `chrome.storage.local`.

## Installation locale

1. Ouvrir `chrome://extensions`, `edge://extensions` ou `brave://extensions`.
2. Activer le mode développeur.
3. Choisir **Charger l’extension non empaquetée** et sélectionner ce dossier `extension/`.
4. Ouvrir une offre LinkedIn, attendre son chargement, puis cliquer sur l’icône Wokra.

Le même dossier est compatible avec les trois navigateurs basés sur Chromium. Pour publier l’extension, il faudra créer les icônes, fournir une politique de confidentialité et empaqueter séparément pour chaque store.

## Interprétation

L’extension affiche « Données insuffisantes », « Points à vérifier » ou « Plusieurs indices à vérifier ». Elle ne marque jamais une annonce comme fausse : une annonce ancienne, une mention de vivier ou un recrutement conditionnel sont des signaux à vérifier, pas une preuve d’intention.

Les pages LinkedIn peuvent modifier leur HTML, limiter le contenu aux utilisateurs connectés ou afficher des dates relatives. Dans ce cas, l’analyse est partielle et le popup le signale indirectement par l’absence de signaux ou de données.
