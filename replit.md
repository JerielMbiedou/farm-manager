# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (sessions stored in PostgreSQL via connect-pg-simple)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/ferme-familiale` (`@workspace/ferme-familiale`)

French-language React + Vite web app for managing a family poultry farm in Cameroon. Uses Tailwind CSS + shadcn/ui components.

**6 Modules**: Financement, Infrastructure (Chantiers avec lots), Dépenses, Bandes de Poulets, Trésorerie, Tableau de Bord.

**User Roles**: Admin (full access), Investisseur (read-only), Gestionnaire (expenses/sales), Lecteur (read-only, assigned to new self-registered accounts). Auth: cookie-based express-session with bcrypt password hashing. Credentials: admin/admin123, papa/papa123, gestionnaire/gest123.

**Pages**:
- `/dashboard` — Overview with cards (caisse, investissements, dépenses, bandes), prochaines vaccinations, prévisions
- `/financement` — Investissements CRUD, remboursements CRUD, soldes investisseurs
- `/devis` — Devis de construction
- `/depenses` — Dépenses construction (legacy, data migrated to chantiers)
- `/infrastructure` — Gestion chantiers avec lots: vue globale + onglets par lot, dépenses groupées par catégorie, devis budgétaire, suivi avancement. Chantier 1 "Construction de la ferme Mbiedou" (cloturé, actif créé)
- `/bandes` — Liste des bandes de poulets
- `/bandes/:id` — Détail bande avec onglets: Résumé (avec export PDF/Excel, graphique répartition coûts), Dépenses, Ventes, Mortalité (avec courbe mortalité), Pesées & IC (avec courbe de croissance), Vaccins, Charges fixes
- `/stocks` — Gestion des stocks aliments et médicaments/vaccins avec alertes péremption, entrées/sorties (custom hooks, non OpenAPI)
- `/simulation` — Simulateur de rentabilité pré-lancement avec graphiques recharts, calcul seuil de rentabilité
- `/tresorerie` — Prévision de trésorerie avec graphiques barres entrées/sorties
- `/planification` — Calendrier de planification des bandes futures, estimation des besoins en aliments (sacs)
- `/historique-caisse` — Journal complet des mouvements financiers (entrées/sorties) avec filtres
- `/comparaison-bandes` — Tableau et graphiques comparatifs entre bandes (mortalité, coûts, bénéfice, seuil de rentabilité)
- `/activity-log` — Journal d'activité des actions utilisateur
- `/utilisateurs` — Gestion des utilisateurs (admin only): liste, changement de rôle, suppression
- `/parametres` — Paramètres configurables de l'application (tous les rôles en lecture, admin en écriture)

**Export**: PDF export via jspdf + jspdf-autotable, Excel export via xlsx. Available on bande résumé tab and dépenses construction page (per-tab: Bâtiment or Forage). Reports aggregate by catégorie+désignation with subtotals and grand total.

**Designation Combobox**: Both bande depenses and construction depenses forms use a combobox that suggests existing designations from the DB (fetched from `/api/bandes/designations-suggestions` and `/api/depenses/designations-suggestions` respectively) while still allowing free text entry.

**Charts**: recharts used for mortalité curves, growth curves, cost breakdown pie charts, simulation charts, trésorerie bar charts, planification comparisons.

**Stock Management** (custom API, not OpenAPI-generated):
- Tables: `stock_aliments`, `stock_medicaments`
- API: GET/POST/DELETE `/api/stocks/aliments` and `/api/stocks/medicaments`
- Custom hooks in `src/lib/stocks-api.ts`

**Treasury Logic**:
- `soldeCourant` = totalFinancement - totalConstruction - totalDepensesBandes - totalDepensesVente + totalRecettesBandes - totalRemboursements
- `caisseDisponible` on dashboard uses the same complete formula
- `historique-caisse` includes all categories: financement, sorties_argent, carburant, remboursements, construction (batiment+puits), production (bande_depenses), ventes, frais de vente
- Old tables `depenses_batiment` and `depenses_puits` still used by treasury; same data also in `chantier_depenses`

**Infrastructure (Chantiers)**:
- Tables: `chantiers`, `chantier_lots`, `chantier_depenses`, `chantier_devis_lignes`
- Cloture creates an `actifs` entry for depreciation tracking
- `bande_actifs` links actifs to bandes with `fraction_utilisee`

**Configurable Settings** (parametres table):
- Charges fixes: taux dépréciation matériel (défaut 10%), taux imprévus (défaut 5%)
- Alertes: seuil mortalité journalier (3%), seuil mortalité cumulé (5%), seuil poids (90%)
- Indice de conversion: IC bon (≤1.8), IC moyen (≤2.2)
- Budget construction: bâtiment défaut (3 525 000 FCFA), carburant défaut (150 000 FCFA)
- Calendrier vaccinal: J1, J7, J14, J21, J28 (noms, jours, descriptions)

**Production Tracking** (bande detail tabs):
- Mortalité journalière avec alertes (configurable via paramètres), décès cumulés, taux de mortalité
- Analyse mortalité par phase: Démarrage (J1-15), Croissance (J16-28), Finition (J29-45), Réformé (J46+)
- Pesées avec objectifs et écarts (seuil configurable), overlay courbe de référence COBB 500
- Consommation aliment & Indice de Conversion (IC): seuils configurables via paramètres, IC par phase
- Consommation eau journalière (onglet Eau): saisie litres/jour, graphique évolution
- Log traitements et vaccins (onglet Traitements): produit, type, dosage, observations
- Journal d'observations quotidien (onglet Journal): texte libre par jour
- Calendrier vaccination: protocole complet (J1 bipestos, J4-6 antibio, J8 Gumboro, J14 rappel, J21 rappel bipestos)
- Import historique Excel: parsing fichier Biofarm Valley (4 bandes), route POST /api/import-historical
- Scanner fiche de suivi (OCR): upload photo de fiche papier -> Gemini AI extrait les données -> preview/correction -> enregistrement automatique (alimentation, eau, mortalité, observations, poids)

**DB tables for bande tracking**:
- `consommation_eau` (bande_id, date, age_jours, quantite_litres)
- `traitements` (bande_id, date, age_jours, produit, type, dosage, observations)
- `observations_journal` (bande_id, date, age_jours, contenu)

**Custom hooks** (bande-extras-api.ts): useConsommationEau, useTraitements, useObservations, useReferencePoids

**AI Integration**: Gemini via Replit AI Integrations (env vars AI_INTEGRATIONS_GEMINI_BASE_URL, AI_INTEGRATIONS_GEMINI_API_KEY). Used for OCR fiche de suivi scanning. Lazy-loaded to avoid server crash if env vars missing. Route: POST /api/ocr-fiche (multipart, field 'photo', max 8MB). Auth required.

**Design System**:
- Typography: Inter (body), Fraunces (h1-h3 headings) loaded from Google Fonts
- Color palette: Deep forest green primary, golden amber secondary, terracotta accent, warm cream background
- Border radius: 0.5rem default; cards, buttons, badges use rounded-lg/xl
- Shadows: Subtle layered shadows with green-tinted hsla for depth
- Login: Split-screen layout with real stock photo (chicken in barn) on left, form on right
- Dashboard: Dark green gradient hero banner with background photo, icon badges on cards
- Sidebar: User avatar with initials, compact nav with active state highlight
- Real stock photos: farm-hero.jpg, chicks.jpg, chicks-grass.jpg, rooster.jpg, eggs.jpg, feed.jpg in public/images/

**Currency**: All amounts in FCFA. No emojis. French UI throughout.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

## Ferme Mbiedou — Priorités P1-P9 (terminées)

- **P1** : champ `date` (YYYY-MM-DD) sur `bande_depenses` (schéma + GET/POST/PUT + formulaire frontend + historique caisse). Date pré-remplie au jour, modifiable.
- **P2** : pesées avec `poidsMinG` / `poidsMaxG` optionnels, CV calculé `(max-min)/moyenne*100` (proxy de dispersion, pas l'écart-type) ; affiché dans la table.
- **P3** : `dureeJours` pour bandes clôturées = `dateCloture − dateDeDepart`.
- **P4** : KPI coût par sujet — `coutParSujetDepart` (primaire, sur effectif initial) + `coutParSujetVivant` (secondaire, sur effectif vivant).
- **P5** : utilitaire `getAgeJours(dateDeDepart)` — pré-remplit `ageJours` dans tous les formulaires (mortalité, pesée, eau, traitement, observation) via `resetForms()` au lieu de la valeur figée 1.
- **P7** : `/api/dashboard/summary` enrichi par bande active : `ageActuelJours`, `joursAvantAbattage`, `dernierPoidsMoyen`, `icActuel` + `icStatus` (formule corrigée : aliment / gain de poids vivant), `gmqGrams`, `mortDernieres24h`, `derniereAlerte`. Cartes dashboard refondues + bouton "Fait aujourd'hui" sur les vaccinations à venir.
- **P9** : seuils mortalité dépendants de l'âge (param `seuil_mortalite_alerte_jour_demarrage` ≤J21, `_finition` >J21) + `seuil_alerte_solde_caisse`. Bannière dashboard pour mortalité active + solde bas + dépassement budget.

### Sécurité écritures
Toutes les routes d'écriture sur `/api/bandes/:id/*` passent par `assertBandeWritable()` (vérifie l'existence + le rôle). Les UPDATE/DELETE sont scopés par `(resourceId AND bandeId)` pour éviter l'IDOR cross-bande, y compris `PUT /:id/vaccinations/:vaccId`.
