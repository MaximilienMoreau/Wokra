# Wokra

Wokra est désormais une extension Manifest V3 pour Chrome, Edge et Brave. Elle analyse localement les offres LinkedIn afin d’identifier des indices compatibles avec une ghost job.

## Installer l’extension en local

1. Ouvrir `chrome://extensions`, `edge://extensions` ou `brave://extensions`.
2. Activer le mode développeur.
3. Cliquer sur **Charger l’extension non empaquetée**.
4. Sélectionner le dossier [`extension/`](extension/).

L’extension lit uniquement le texte visible de l’offre, conserve son historique dans le stockage local du navigateur et n’envoie pas le contenu à un serveur Wokra. Les résultats indiquent des points à vérifier ; ils ne prouvent jamais qu’une annonce est fausse.

Voir [extension/README.md](extension/README.md) pour le fonctionnement et les limites.
