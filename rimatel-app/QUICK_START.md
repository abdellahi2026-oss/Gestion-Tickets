# ⚡ RIMATEL Ticketing - Démarrage Rapide

## 🎯 Installation en 5 Minutes

### Windows

```powershell
# 1. Installer les dépendances
.\setup.ps1

# 2. Configurer Supabase (voir ci-dessous)

# 3. Éditer .env avec vos credentials

# 4. Lancer l'application
npm run dev
```

### Linux / macOS

```bash
# 1. Installer les dépendances
chmod +x setup.sh
./setup.sh

# 2. Configurer Supabase (voir ci-dessous)

# 3. Éditer .env avec vos credentials

# 4. Lancer l'application
npm run dev
```

## 🔧 Configuration Supabase (3 minutes)

### 1. Créer le Projet

1. Allez sur **https://supabase.com** → Créez un compte
2. **New Project** → Nom: `rimatel-ticketing`
3. Attendez 2-3 minutes

### 2. Exécuter les Migrations

Dans **SQL Editor** de Supabase, exécutez dans l'ordre :

```sql
-- 1. Copier-coller le contenu de :
supabase/migrations/001_initial_schema.sql
-- Cliquez sur "Run"

-- 2. Puis :
supabase/migrations/002_seed_data.sql
-- Cliquez sur "Run"

-- 3. Puis :
supabase/migrations/003_rls_policies.sql
-- Cliquez sur "Run"

-- 4. Enfin :
supabase/functions/check-late-tickets.sql
-- Cliquez sur "Run"
```

### 3. Créer un Utilisateur

**Authentication** → **Users** → **Add user**
- Email: `admin@rimatel.mr`
- Password: `admin123`
- ✅ Auto Confirm User

### 4. Récupérer les Credentials

**Settings** → **API**
- Copiez **Project URL**
- Copiez **anon public** key

### 5. Configurer .env

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 🚀 Lancer l'Application

```bash
npm run dev
```

Ouvrez **http://localhost:3000**

**Connexion :**
- Email: `admin@rimatel.mr`
- Password: `admin123`

## 📦 Déploiement Production

### Render.com (Gratuit - Recommandé)

1. Push votre code sur GitHub
2. **https://render.com** → New Static Site
3. Connectez votre repo
4. Ajoutez les variables d'environnement
5. Deploy !

### Railway.app (Gratuit)

1. **https://railway.app** → New Project
2. Deploy from GitHub
3. Ajoutez les variables d'environnement
4. Deploy !

### Vercel (Gratuit)

```bash
npm install -g vercel
vercel login
vercel
```

## 📋 Checklist de Vérification

- [ ] Node.js 18+ installé
- [ ] Dépendances installées (`npm install`)
- [ ] Projet Supabase créé
- [ ] 4 migrations SQL exécutées
- [ ] Utilisateur test créé
- [ ] Fichier `.env` configuré
- [ ] Application démarre (`npm run dev`)
- [ ] Connexion réussie
- [ ] Création de ticket fonctionne

## 🎨 Fonctionnalités Principales

### ✅ Gestion des Tickets
- Création avec validation (DAB + 1-6 chiffres)
- Prévention des doublons
- Changement de statut en temps réel
- Historique complet

### 📊 Tableau de Bord
- Statistiques globales
- Graphiques par Wilaya
- Graphiques par Service
- Graphiques par Région (NKC)

### 🌍 Multilingue
- Français (par défaut)
- Arabe (RTL support)
- Anglais

### 🔒 Sécurité
- Authentification JWT
- Row Level Security (RLS)
- Historique de connexion
- Validation stricte

## 📚 Documentation

- **README.md** - Documentation complète
- **SETUP_GUIDE.md** - Guide détaillé d'installation
- **API_DOCUMENTATION.md** - Documentation API
- **QUICK_START.md** - Ce fichier

## 🐛 Problèmes Courants

### Erreur "Missing Supabase environment variables"
→ Vérifiez `.env`

### "Failed to fetch"
→ Vérifiez l'URL Supabase et les migrations SQL

### Les données ne s'affichent pas
→ Vérifiez les RLS policies (migration 003)

### Erreur de build
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Support

Consultez la documentation complète dans `README.md` et `SETUP_GUIDE.md`

---

**Développé pour RIMATEL SA** 🇲🇷

