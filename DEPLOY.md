# Déploiement — Ferme Mbiedou

## Déploiement sur Render (recommandé, gratuit)

### Prérequis

- Compte [Render.com](https://render.com) (gratuit)
- Repo GitHub connecté à Render
- Clé API Gemini (gratuite sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### Étapes

1. Aller sur [render.com](https://render.com) → **New** → **Blueprint**
2. Connecter le repo GitHub `farm-manager`
3. `render.yaml` est détecté automatiquement
   → Render crée le service web + la base PostgreSQL
4. Renseigner les variables manuelles dans le dashboard Render :
   - `FRONTEND_URL` = URL de votre app Render (ex: `https://ferme-mbiedou.onrender.com`)
   - `GEMINI_API_KEY` = votre clé Gemini (pour l'OCR des fiches)
5. Cliquer **Apply** → attendre ~5 minutes que le build se termine
6. L'app est live sur votre URL Render 🎉

### Compte par défaut

- Username : `admin`
- Mot de passe : **affiché dans les logs Render au 1er démarrage**
  (chercher la ligne `MOT DE PASSE ADMIN GÉNÉRÉ`)

⚠️ Changer immédiatement dans **Paramètres → Utilisateurs** après la première connexion.

### Variables d'environnement sur Render

| Variable | Valeur | Mode |
|----------|--------|------|
| `DATABASE_URL` | URL PostgreSQL | ✅ Auto (depuis la DB Render) |
| `SESSION_SECRET` | Clé aléatoire | ✅ Auto (généré par Render) |
| `NODE_ENV` | `production` | ✅ Auto |
| `PORT` | Injecté par Render | ✅ Auto |
| `FRONTEND_URL` | URL de l'app | ⚠️ Manuel |
| `GEMINI_API_KEY` | Clé Gemini | ⚠️ Manuel |
| `GEMINI_MODEL` | `gemini-2.5-flash` | ✅ Auto |
| `SEED_DEMO_DATA` | `false` | ✅ Auto |

### Après déploiement

1. Ouvrir l'URL Render fournie
2. Récupérer le mot de passe admin dans les logs Render
3. Se connecter et aller dans **Paramètres**
4. Renseigner l'identité de la ferme (nom, adresse, téléphone)
5. Configurer les phases d'élevage si différentes de COBB 500

## Déploiement local (développement)

```bash
# 1. Copier le fichier d'environnement
cp .env.example .env
# 2. Éditer .env (au minimum DATABASE_URL et SESSION_SECRET)

# 3. Installer les dépendances
pnpm install

# 4. Initialiser le schéma de la base
pnpm run db:migrate

# 5. Build + démarrage en mode production
pnpm run build
pnpm run start
# → http://localhost:3000
```

Le mot de passe admin est affiché dans les logs au premier démarrage.

## Mises à jour

Render redéploie automatiquement à chaque `git push origin main`
(grâce à `autoDeploy: true` dans `render.yaml`).

Le build inclut `pnpm run db:migrate` : les changements de schéma
sont appliqués automatiquement à chaque déploiement.
