# 🚀 Déploiement des Edge Functions Supabase

## 📋 Prérequis

1. Compte Supabase actif
2. Projet Supabase créé
3. Supabase CLI installé

## 🔧 Installation de Supabase CLI

### Windows (PowerShell)
```powershell
# Installer Scoop (si pas déjà installé)
iwr -useb get.scoop.sh | iex

# Installer Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS / Linux
```bash
# Installer via npm
npm install -g supabase

# OU via Homebrew (macOS)
brew install supabase/tap/supabase
```

## 🔑 Configuration

### 1. Se connecter à Supabase
```bash
supabase login
```

### 2. Lier votre projet
```bash
# Récupérer votre Project ID depuis Supabase Dashboard
# Settings > General > Reference ID

supabase link --project-ref votre-project-id
```

## 📤 Déployer les Edge Functions

### Déployer la fonction de suppression
```bash
supabase functions deploy delete-user
```

### Déployer la fonction de mise à jour
```bash
supabase functions deploy update-user
```

### Déployer toutes les fonctions
```bash
supabase functions deploy
```

## 🔐 Configurer les Secrets

Les Edge Functions ont besoin d'accéder aux variables d'environnement :

```bash
# Ces variables sont automatiquement disponibles :
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_ANON_KEY

# Pas besoin de configuration supplémentaire !
```

## 🧪 Tester les Edge Functions

### Tester localement (optionnel)
```bash
# Démarrer Supabase localement
supabase start

# Servir les fonctions localement
supabase functions serve

# Tester la fonction delete-user
curl -i --location --request POST 'http://localhost:54321/functions/v1/delete-user' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"user-id-to-delete"}'
```

### Tester en production
```bash
# Récupérer l'URL de votre fonction
# https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-user

# Tester avec curl
curl -i --location --request POST 'https://tznyuhnglpnfllzdhhde.supabase.co/functions/v1/delete-user' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"user-id-to-delete"}'
```

## 📊 Vérifier le déploiement

1. Allez sur Supabase Dashboard
2. **Edge Functions** dans le menu
3. Vous devriez voir :
   - ✅ `delete-user`
   - ✅ `update-user`

## 🔗 URLs des Edge Functions

Après déploiement, vos fonctions seront disponibles à :

```
https://tznyuhnglpnfllzdhhde.supabase.co/functions/v1/delete-user
https://tznyuhnglpnfllzdhhde.supabase.co/functions/v1/update-user
```

## 📝 Prochaines étapes

Après avoir déployé les Edge Functions, vous devez :

1. ✅ Mettre à jour le code frontend pour utiliser ces fonctions
2. ✅ Tester la suppression d'utilisateurs
3. ✅ Tester la mise à jour d'utilisateurs

Voir le fichier `UPDATE_ADMIN_USERS.md` pour les modifications frontend.

## 🐛 Dépannage

### Erreur : "supabase: command not found"
```bash
# Vérifier l'installation
supabase --version

# Réinstaller si nécessaire
npm install -g supabase
```

### Erreur : "Project not linked"
```bash
# Lier à nouveau le projet
supabase link --project-ref tznyuhnglpnfllzdhhde
```

### Erreur : "Invalid credentials"
```bash
# Se reconnecter
supabase login
```

### Voir les logs des fonctions
```bash
# Logs en temps réel
supabase functions logs delete-user --follow
supabase functions logs update-user --follow
```

## 📚 Ressources

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Deno Documentation](https://deno.land/manual)

## ✅ Checklist de déploiement

- [ ] Supabase CLI installé
- [ ] Connecté à Supabase (`supabase login`)
- [ ] Projet lié (`supabase link`)
- [ ] Fonction `delete-user` déployée
- [ ] Fonction `update-user` déployée
- [ ] Fonctions visibles dans Supabase Dashboard
- [ ] Tests effectués
- [ ] Frontend mis à jour

---

**Statut** : 🔧 Prêt pour le déploiement

