# Wokra

Réseau professionnel "proof-of-work" : les profils exposent des artefacts vérifiables (repo, produit
live, étude de cas) plutôt que des titres ou des métriques de vanité.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 + shadcn/ui · Prisma + PostgreSQL ·
Auth.js (GitHub OAuth + magic link) · Zod · Vitest + Playwright

## Setup local

Prérequis : Node 22 (`.nvmrc`), Docker.

```bash
nvm use                        # Node 22
npm install
cp .env.example .env
docker compose up db -d        # Postgres local
npm run db:migrate             # applique les migrations Prisma
npm run db:seed                # peuple ~15 profils / ~40 artefacts
npm run dev                    # http://localhost:3000
```

## Commandes utiles

```bash
npm run dev          # serveur de dev
npm run build         # build de prod
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm test              # Vitest
npm run db:migrate    # migrations Prisma (dev)
npm run db:seed       # rejoue le seed
npm run db:studio     # explorateur de données Prisma Studio
npm run test:e2e      # tests e2e Playwright
```

Un hook pre-commit (Husky + lint-staged) lance automatiquement lint + typecheck avant chaque commit.

## Tests e2e

`npm run test:e2e` lance Playwright sur une base dédiée (`proof_test`, créée une fois avec
`createdb -O proof proof_test`) — jamais sur la base de dev. Le auth flow réel (GitHub OAuth, email)
n'est pas pilotable en automatisé sans vraies identifiants ; les tests créent une session
directement en base plutôt que de simuler le provider. Un test dédié (`sign-in.spec.ts`) vérifie
quand même le vrai formulaire magic link de bout en bout (jusqu'à la page de confirmation).
`main-flow.spec.ts` couvre créer un artefact → vérifier via l'API GitHub réelle → apparaître dans le
feed d'un follower — nécessite un accès réseau à `api.github.com`.

## Auth

- **Magic link** : fonctionne sans configuration en dev — le lien est affiché dans les logs du
  serveur (`RESEND_API_KEY` vide). En production, définir `RESEND_API_KEY` (resend.com/api-keys).
- **GitHub OAuth** : optionnel en dev (le bouton "Continuer avec GitHub" n'apparaît que si
  configuré). Créer une [OAuth App GitHub](https://github.com/settings/developers) avec pour
  callback URL `http://localhost:3000/api/auth/callback/github`, puis renseigner
  `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` dans `.env`.
- `AUTH_SECRET` : générer avec `openssl rand -base64 33`.

## Structure

```
app/(auth)/sign-in/    # connexion (GitHub OAuth + magic link)
app/(auth)/onboarding/ # choix du handle (filet de sécurité, normalement auto-généré)
app/(app)/profile/    # profil : bio, compétences, artefacts
app/(app)/feed/        # feed suivis + découverte
app/(app)/search/      # recherche full-text
app/(app)/messages/    # messagerie 1-1
lib/data/              # accès Prisma (aucune requête DB hors de ce dossier)
lib/env.ts             # variables d'environnement validées par Zod
lib/prisma.ts           # client Prisma (singleton, driver adapter pg)
lib/auth.ts             # config Auth.js (providers, adapter, callbacks)
lib/handle.ts           # génération du handle unique à l'inscription
middleware.ts           # protection des routes + redirection onboarding
components/ui/         # composants shadcn/ui
components/<domaine>/  # composants métier par domaine
prisma/schema.prisma    # modèle de données
prisma/seed.ts          # seed réaliste (profils, artefacts, skills, follows, messages)
e2e/                     # tests Playwright (base de test dédiée, voir "Tests e2e")
```

## Docker

`docker compose up db -d` lance uniquement Postgres (recommandé en dev pour garder le hot-reload
Next.js sur l'hôte). `docker compose up` lance l'app complète en conteneur si besoin.
