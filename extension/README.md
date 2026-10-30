# Extension Wokra pour Chrome, Edge et Brave

Cette extension Manifest V3 fonctionne sur les pages individuelles `linkedin.com/jobs/view/*`. Elle lit uniquement le descriptif visible de l’offre, calcule les indices localement et conserve un historique minimal dans `chrome.storage.local`.

## Installation locale

1. Ouvrir `chrome://extensions`, `edge://extensions` ou `brave://extensions`.
2. Activer le mode développeur.
3. Choisir **Charger l’extension non empaquetée** et sélectionner ce dossier `extension/`.
4. Ouvrir une offre LinkedIn, attendre son chargement : le badge Wokra apparaît automatiquement. L’icône permet de relancer l’analyse et de lire le détail des indices.

Le même dossier est compatible avec les trois navigateurs basés sur Chromium. Les icônes sont déjà incluses dans `icons/`. Pour publier l’extension, il faudra fournir une politique de confidentialité, préparer les visuels et suivre les exigences propres à chaque store ; aucun build n’est nécessaire pour l’installation locale.

## Vérifier le projet avec npm

Depuis le dossier `extension/`, avec Node.js 22 ou supérieur :

```sh
npm run check
npm test
npm run package
```

Le `package.json` sert aux vérifications locales, sans dépendances npm à installer.
La commande `package` nécessite Python 3 et génère `../dist/wokra-0.2.0.zip`
directement depuis les sources, sans clé privée ni ancien CRX. Le ZIP peut être
extrait pour une installation locale ou soumis à un store. Deux générations
avec les mêmes sources donnent le même paquet.
Il n’y a pas de commande `npm run dev` ou de serveur Next.js : le site a été
remplacé par cette extension. Pour l’exécuter, suivez l’installation locale
ci-dessus. Après une modification, rechargez l’extension puis l’onglet LinkedIn.
Une erreur npm `ENOENT` sur `package.json` peut indiquer que la commande a été
lancée depuis le dossier parent : placez-vous dans `extension/`.

## Données et permissions

Le script surveille les changements de page sur LinkedIn pour reconnaître une offre
ouverte depuis le fil ou une recherche sans rechargement. Il extrait les données
uniquement sur les pages individuelles `/jobs/view/`. Il ne fait aucun appel
réseau et ne lit pas les autres sites. Les permissions `storage` et `alarms`
servent au stockage local et au nettoyage périodique ; `activeTab` permet
d’identifier l’onglet à analyser depuis le popup.

Le stockage conserve l’URL canonique sans paramètres ni fragment, le titre,
l’entreprise, le lieu, la date de publication disponible, les indices calculés
et les jours d’observation. Le descriptif lui-même n’est pas conservé.
Les observations sont dédoublonnées par jour UTC, limitées à une fenêtre glissante
de 180 jours et à 500 offres. Le nettoyage s’exécute lors des analyses, au
démarrage du navigateur, à l’installation et toutes les heures lorsque le
navigateur fonctionne. Une expiration peut donc attendre le prochain nettoyage,
notamment si le navigateur est fermé. Les anciennes variantes d’URL sont
regroupées et leurs paramètres supprimés à ce moment-là. L’ancien format ne
conservait que la première et la dernière observation : seuls ces jours connus
sont repris lors de la migration.

Le bouton **Effacer l’historique local** dans les paramètres permet de supprimer
ces données à tout moment. Une analyse ultérieure dans un onglet ouvert peut
créer une nouvelle observation.

Le contenu du descriptif n’est pas envoyé à Wokra. La détection reste heuristique : une absence de signal ne confirme pas qu’une offre est réelle, et un signal ne prouve pas qu’elle est fantôme.

## Interprétation

L’extension affiche « Données insuffisantes », « Points à vérifier » ou « Plusieurs indices à vérifier ». Elle ne marque jamais une annonce comme fausse : une annonce ancienne, une mention de vivier ou un recrutement conditionnel sont des signaux à vérifier, pas une preuve d’intention.

Les pages LinkedIn peuvent modifier leur HTML, limiter le contenu aux utilisateurs connectés ou afficher des dates relatives. Dans ce cas, l’analyse est partielle. Si le badge n’apparaît pas, recharge l’extension depuis la page des extensions puis recharge l’offre LinkedIn. Les pages de recherche, collections et profils LinkedIn ne sont pas analysées.

## Signature et publication

Les clés privées (`*.pem`), CRX et paquets générés sont exclus de Git.
L’ancienne clé versionnée et l’ancien CRX ne doivent plus être utilisés.
Leur retrait des sources ne les efface pas des anciens commits : considérer
cette clé comme exposée. Pour une future distribution CRX, créer une nouvelle
clé dans un emplacement privé hors du dépôt ; cela change l’identité de
l’extension. Une publication existante doit suivre la procédure de remplacement
de clé de son canal de distribution. Le ZIP généré ne nécessite aucune clé.

## Test navigateur optionnel

`node scripts/browser-check.cjs` exécute le parcours dans Chromium avec
un profil temporaire et des pages LinkedIn simulées localement, sans compte
ni requête vers LinkedIn. Il nécessite Playwright et son navigateur Chromium
disponibles dans l’environnement de développement. Ce test ne valide pas le
HTML du site LinkedIn en production. `WOKRA_CHROMIUM_EXECUTABLE` permet de
choisir un autre exécutable Chromium.
