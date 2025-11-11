# 🚀 Guide de Configuration RIMATEL Ticketing

## 📋 Étapes Rapides

### 1️⃣ Configuration Supabase (5 minutes)

#### A. Créer le Projet

1. Allez sur https://supabase.com
2. Cliquez sur **"New Project"**
3. Remplissez :
   - **Name**: `rimatel-ticketing`
   - **Database Password**: Choisissez un mot de passe fort
   - **Region**: Choisissez la région la plus proche
4. Cliquez sur **"Create new project"**
5. Attendez 2-3 minutes que le projet soit créé

#### B. Récupérer les Credentials

1. Dans votre projet, allez dans **Settings** (⚙️) > **API**
2. Copiez :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (la clé publique)

#### C. Exécuter les Migrations SQL

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez-collez le contenu de `supabase/migrations/001_initial_schema.sql`
4. Cliquez sur **"Run"** (ou Ctrl+Enter)
5. Répétez pour :
   - `002_seed_data.sql`
   - `003_rls_policies.sql`
   - `functions/check-late-tickets.sql`

#### D. Créer un Utilisateur Test

1. Allez dans **Authentication** > **Users**
2. Cliquez sur **"Add user"** > **"Create new user"**
3. Remplissez :
   - **Email**: `admin@rimatel.mr`
   - **Password**: `admin123`
   - **Auto Confirm User**: ✅ Coché
4. Cliquez sur **"Create user"**

### 2️⃣ Configuration Locale (2 minutes)

```bash
# 1. Installer les dépendances
cd rimatel-app
npm install

# 2. Créer le fichier .env
cp .env.example .env

# 3. Éditer .env avec vos credentials Supabase
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=votre-anon-key

# 4. Lancer l'application
npm run dev
```

### 3️⃣ Tester l'Application

1. Ouvrez http://localhost:3000
2. Connectez-vous avec :
   - Email: `admin@rimatel.mr`
   - Password: `admin123`
3. Créez votre premier ticket !

## 🌐 Déploiement Production

### Option A: Render.com (Recommandé - Gratuit)

1. Créez un compte sur https://render.com
2. Cliquez sur **"New +"** > **"Static Site"**
3. Connectez votre repository GitHub/GitLab
4. Render détecte automatiquement `render.yaml`
5. Ajoutez les variables d'environnement :
   - `VITE_SUPABASE_URL`: Votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY`: Votre clé publique
6. Cliquez sur **"Create Static Site"**
7. Attendez 3-5 minutes pour le déploiement
8. Votre app est en ligne ! 🎉

### Option B: Railway.app (Gratuit)

1. Créez un compte sur https://railway.app
2. Cliquez sur **"New Project"** > **"Deploy from GitHub repo"**
3. Sélectionnez votre repository
4. Railway détecte automatiquement `railway.json`
5. Allez dans **Variables** et ajoutez :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Le déploiement démarre automatiquement
7. Cliquez sur **"Generate Domain"** pour obtenir une URL

### Option C: Vercel (Gratuit)

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Redéployer avec les variables
vercel --prod
```

### Option D: Netlify (Gratuit)

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod

# Ajouter les variables d'environnement dans le dashboard Netlify
```

## 🔧 Configuration Avancée

### Activer les Notifications Email

1. Dans Supabase, allez dans **Project Settings** > **Auth**
2. Scrollez jusqu'à **SMTP Settings**
3. Configurez votre serveur SMTP :
   - **Host**: smtp.gmail.com (pour Gmail)
   - **Port**: 587
   - **Username**: votre-email@gmail.com
   - **Password**: Mot de passe d'application
4. Activez **"Enable Custom SMTP"**

### Tâche Automatique (Tickets en Retard)

#### Option 1: Supabase Edge Function (Recommandé)

Créez un fichier `supabase/functions/check-late-tickets/index.ts` :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await supabase.rpc('mark_late_tickets')

  return new Response(
    JSON.stringify({ success: !error }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

Déployez :
```bash
supabase functions deploy check-late-tickets
```

Configurez un cron job externe pour appeler cette fonction toutes les heures.

#### Option 2: Cron-job.org

1. Créez un compte sur https://cron-job.org
2. Créez un nouveau cron job
3. URL: `https://votre-projet.supabase.co/functions/v1/check-late-tickets`
4. Schedule: `0 * * * *` (toutes les heures)

## 📊 Vérification de l'Installation

### Checklist

- [ ] Projet Supabase créé
- [ ] Migrations SQL exécutées (4 fichiers)
- [ ] Utilisateur test créé
- [ ] Variables d'environnement configurées
- [ ] Application démarre localement
- [ ] Connexion réussie
- [ ] Création de ticket fonctionne
- [ ] Graphiques s'affichent
- [ ] Changement de langue fonctionne

### Commandes de Test

```bash
# Vérifier que toutes les dépendances sont installées
npm list

# Vérifier la configuration
cat .env

# Lancer en mode développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## 🐛 Problèmes Courants

### "Missing Supabase environment variables"

**Solution**: Vérifiez que `.env` existe et contient les bonnes valeurs.

### "Failed to fetch" lors de la connexion

**Solution**: 
1. Vérifiez que l'URL Supabase est correcte
2. Vérifiez que les migrations SQL sont exécutées
3. Vérifiez que l'utilisateur existe dans Supabase

### Les données ne s'affichent pas

**Solution**:
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs
3. Assurez-vous que les RLS policies sont créées

### Erreur lors du build

**Solution**:
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Support

Pour toute question :
1. Vérifiez la documentation dans `README.md`
2. Consultez les logs Supabase
3. Vérifiez la console du navigateur
4. Contactez l'équipe technique RIMATEL SA

---

**Bon déploiement ! 🚀**

