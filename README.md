# PROOF

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
```

Un hook pre-commit (Husky + lint-staged) lance automatiquement lint + typecheck avant chaque commit.

## Structure

```
app/(auth)/          # routes d'authentification
app/(app)/profile/    # profil : bio, compétences, artefacts
app/(app)/feed/        # feed suivis + découverte
app/(app)/search/      # recherche full-text
app/(app)/messages/    # messagerie 1-1
lib/data/              # accès Prisma (aucune requête DB hors de ce dossier)
lib/env.ts             # variables d'environnement validées par Zod
lib/prisma.ts           # client Prisma (singleton, driver adapter pg)
components/ui/         # composants shadcn/ui
components/<domaine>/  # composants métier par domaine
prisma/schema.prisma    # modèle de données
prisma/seed.ts          # seed réaliste (profils, artefacts, skills, follows, messages)
```

## Docker

`docker compose up db -d` lance uniquement Postgres (recommandé en dev pour garder le hot-reload
Next.js sur l'hôte). `docker compose up` lance l'app complète en conteneur si besoin.
