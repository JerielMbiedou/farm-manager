# Guide de déploiement — Ferme Mbiedou

Ce projet est conçu pour être déployable **n'importe où** : Railway, Render, Coolify,
VPS Ubuntu/Debian, Docker, ou Replit. Tout passe par les variables d'environnement
standard décrites dans `.env.example`.

## Prérequis communs

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PostgreSQL** ≥ 15
- (Optionnel) **Clé Google Gemini** pour le scan automatique des fiches d'élevage
  → https://aistudio.google.com/app/apikey

## Variables d'environnement

Voir [`.env.example`](./.env.example) pour la liste complète et les commentaires.
Variables **strictement requises** :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL PostgreSQL `postgresql://user:pass@host:5432/dbname` |
| `SESSION_SECRET` | Chaîne aléatoire ≥ 32 caractères (`openssl rand -base64 48`) |
| `NODE_ENV` | `production` recommandé hors développement |
| `PORT` | Port d'écoute du serveur HTTP |

Variables **fortement recommandées en production** :

| Variable | Description |
|---|---|
| `FRONTEND_URL` | Domaine public, ex: `https://ferme.example.com` (CORS) |
| `GEMINI_API_KEY` | Active l'OCR des fiches papier |

---

## Option 1 — Docker Compose (le plus simple)

Idéal pour tester localement ou déployer sur un VPS qui a Docker.

```bash
git clone <votre-repo> ferme-mbiedou && cd ferme-mbiedou
cp .env.example .env
# Éditer .env : SESSION_SECRET, GEMINI_API_KEY, etc.
docker compose up -d --build
# Premier démarrage : appliquer le schéma DB
docker compose exec app pnpm run db:migrate
```

Accès : http://localhost:3000 — compte par défaut **admin / admin123**
⚠️ **Changer le mot de passe immédiatement** dans Paramètres → Utilisateurs.

---

## Option 2 — Railway (recommandé pour production managée)

1. Créer un projet sur [railway.app](https://railway.app)
2. **+ New** → **Deploy from GitHub repo** et sélectionner ce dépôt
3. **+ New** → **Database** → **PostgreSQL** (génère `DATABASE_URL` automatiquement)
4. Dans le service web, onglet **Variables**, ajouter :
   - `SESSION_SECRET` (générer avec `openssl rand -base64 48`)
   - `FRONTEND_URL` = l'URL Railway de l'app (ex. `https://ferme-mbiedou.up.railway.app`)
   - `GEMINI_API_KEY` (optionnel)
   - `NODE_ENV` = `production`
5. Le fichier `railway.toml` est détecté automatiquement (build + migrations + start)
6. Premier déploiement → Railway exécute `pnpm install`, `pnpm build`, `pnpm db:migrate`,
   puis lance le serveur. Healthcheck sur `/api/healthz`.

---

## Option 3 — Render

1. Créer un compte sur [render.com](https://render.com)
2. **New +** → **Blueprint** → connecter le repo GitHub
3. Render lit `render.yaml` et propose de créer :
   - Le service web `ferme-mbiedou`
   - La base PostgreSQL `ferme-mbiedou-db`
4. Avant de cliquer "Apply", renseigner les variables marquées `sync: false` :
   - `FRONTEND_URL` : URL du service Render (ex. `https://ferme-mbiedou.onrender.com`)
   - `GEMINI_API_KEY` (optionnel)
5. **Apply** → build + déploiement automatique. Migrations DB lancées au build.

---

## Option 4 — VPS Ubuntu (manuel, pour budget serré)

```bash
# 1. Installer Node 20, pnpm, PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib
sudo corepack enable && sudo corepack prepare pnpm@latest --activate

# 2. Créer la base
sudo -u postgres psql -c "CREATE USER ferme WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "CREATE DATABASE ferme_mbiedou OWNER ferme;"

# 3. Cloner et builder
git clone <votre-repo> /opt/ferme-mbiedou && cd /opt/ferme-mbiedou
cp .env.example .env
# Éditer .env (DATABASE_URL=postgresql://ferme:CHANGE_ME@localhost:5432/ferme_mbiedou)
pnpm install --frozen-lockfile
pnpm run build
pnpm run db:migrate

# 4. Lancer avec PM2 (gestionnaire de process)
sudo npm i -g pm2
pm2 start "pnpm run start" --name ferme-mbiedou --update-env
pm2 save && pm2 startup

# 5. Reverse proxy Nginx + HTTPS via Certbot
# Voir doc Nginx standard pour proxy_pass http://localhost:3000;
```

---

## Migrations de base de données

Le schéma est géré par **Drizzle**. Pour appliquer les changements de schéma :

```bash
pnpm run db:migrate          # interactif (demande confirmation pour les destructions)
pnpm run db:migrate:force    # non-interactif (CI/CD), force toutes les migrations
```

⚠️ Sur Railway/Render, la commande est lancée automatiquement au build. Sur VPS,
relancez manuellement après chaque déploiement.

---

## Sauvegardes

L'application crée automatiquement une **sauvegarde JSON quotidienne à 02:00**
(7 dernières conservées) dans `/tmp/backups/`. En production, monter un volume
persistant si vous voulez les conserver entre redémarrages.

Pour un **dump SQL natif complet** restaurable avec `psql`, utiliser le bouton
**Paramètres → Sauvegardes → Dump SQL natif** (admin uniquement).

---

## Vérifications après déploiement

```bash
# Healthcheck
curl https://votre-domaine.com/api/healthz
# → {"status":"ok"}

# Frontend
curl -I https://votre-domaine.com/
# → 200 OK, content-type: text/html

# Login admin
curl -X POST https://votre-domaine.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Aucune dépendance Replit en production

Cette version :

- ✅ N'utilise aucun package `@replit/*` au runtime
- ✅ N'utilise aucune variable `REPLIT_*` au runtime
- ✅ Le client Gemini fonctionne avec `GEMINI_API_KEY` (API Google directe) **OU**
  `AI_INTEGRATIONS_GEMINI_API_KEY` (proxy Replit) — fallback automatique
- ✅ CORS configurable via `FRONTEND_URL`
- ✅ Cookie sessions `secure` et `sameSite=strict` activés en production
