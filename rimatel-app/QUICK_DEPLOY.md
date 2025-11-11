# ⚡ Déploiement Rapide - Gestion Complète des Utilisateurs

## 🎯 Objectif

Activer la **suppression définitive** et la **mise à jour complète** des utilisateurs dans RIMATEL.

## ⏱️ Temps Estimé : 10 minutes

---

## 📋 Étape 1 : Installer Supabase CLI (2 min)

### Windows (PowerShell - Administrateur)

```powershell
# Installer Scoop
iwr -useb get.scoop.sh | iex

# Installer Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS / Linux

```bash
npm install -g supabase
```

### Vérifier l'installation

```bash
supabase --version
```

✅ Vous devriez voir : `supabase version X.X.X`

---

## 🔐 Étape 2 : Se Connecter (1 min)

```bash
# Se connecter à Supabase
supabase login
```

Cela ouvrira votre navigateur pour vous authentifier.

---

## 🔗 Étape 3 : Lier le Projet (1 min)

```bash
# Lier votre projet RIMATEL
supabase link --project-ref tznyuhnglpnfllzdhhde
```

✅ Vous devriez voir : `Linked to project tznyuhnglpnfllzdhhde`

---

## 🚀 Étape 4 : Déployer les Fonctions (3 min)

### Option A : Script Automatique (Windows)

```powershell
.\deploy-functions.ps1
```

### Option B : Commande Manuelle

```bash
# Déployer toutes les fonctions
supabase functions deploy

# OU déployer individuellement
supabase functions deploy delete-user
supabase functions deploy update-user
```

✅ Vous devriez voir :
```
Deployed Function delete-user
Deployed Function update-user
```

---

## ✅ Étape 5 : Vérifier le Déploiement (1 min)

### Dans Supabase Dashboard

1. Allez sur https://supabase.com/dashboard/project/tznyuhnglpnfllzdhhde
2. Cliquez sur **Edge Functions**
3. Vérifiez que vous voyez :
   - ✅ `delete-user` (Deployed)
   - ✅ `update-user` (Deployed)

---

## 🧪 Étape 6 : Tester l'Application (2 min)

1. **Rechargez l'application** dans le navigateur (F5)
2. Allez dans **Gestion des Utilisateurs**
3. Testez :

### Test 1 : Modifier un Utilisateur
- Cliquez sur ✏️ (Edit)
- Modifiez le nom, email, rôle, etc.
- Cliquez sur **Enregistrer**
- ✅ Les modifications doivent être appliquées

### Test 2 : Supprimer un Utilisateur
- Cliquez sur 🗑️ (Delete)
- Confirmez la suppression
- ✅ L'utilisateur doit disparaître complètement

### Test 3 : Vérifier les Logs
- Ouvrez la console (F12)
- Vous devriez voir :
  ```
  🔄 Updating user via Edge Function: ...
  ✅ User updated successfully
  ```
  ```
  🗑️ Deleting user via Edge Function: ...
  ✅ User deleted completely
  ```

---

## 🎉 C'est Terminé !

Vous avez maintenant :
- ✅ Suppression définitive des utilisateurs (users + auth.users)
- ✅ Mise à jour complète des utilisateurs
- ✅ Modification de l'email et du mot de passe
- ✅ Gestion des services des techniciens

---

## 🐛 Problèmes Courants

### ❌ "supabase: command not found"

**Solution** :
```bash
# Vérifier l'installation
npm install -g supabase

# OU via Scoop (Windows)
scoop install supabase
```

### ❌ "Project not linked"

**Solution** :
```bash
supabase link --project-ref tznyuhnglpnfllzdhhde
```

### ❌ "Failed to fetch" dans l'application

**Solution** :
```bash
# Vérifier que les fonctions sont déployées
supabase functions list

# Redéployer si nécessaire
supabase functions deploy
```

### ❌ "Non autorisé" (401)

**Solution** :
- Déconnectez-vous de l'application
- Reconnectez-vous
- Réessayez

---

## 📊 Voir les Logs

### En temps réel

```bash
# Logs de delete-user
supabase functions logs delete-user --follow

# Logs de update-user
supabase functions logs update-user --follow
```

### Dans Dashboard

1. **Edge Functions** → Sélectionnez la fonction
2. **Logs**

---

## 📚 Documentation Complète

- `UPDATE_GUIDE.md` : Guide détaillé
- `DEPLOY_EDGE_FUNCTIONS.md` : Déploiement avancé
- `supabase/functions/README.md` : Documentation des fonctions

---

## 🔄 Commandes Utiles

```bash
# Lister les projets
supabase projects list

# Lister les fonctions
supabase functions list

# Voir les logs
supabase functions logs <function-name> --follow

# Redéployer une fonction
supabase functions deploy <function-name>

# Se déconnecter
supabase logout
```

---

## ✅ Checklist Finale

- [ ] Supabase CLI installé et vérifié
- [ ] Connecté à Supabase
- [ ] Projet lié (tznyuhnglpnfllzdhhde)
- [ ] Fonctions déployées (delete-user, update-user)
- [ ] Fonctions visibles dans Dashboard
- [ ] Application rechargée (F5)
- [ ] Test de modification réussi
- [ ] Test de suppression réussi
- [ ] Logs vérifiés (console + Dashboard)

---

**🎯 Résultat Attendu**

Après avoir suivi ces étapes :
- ✅ Les utilisateurs peuvent être modifiés complètement
- ✅ Les utilisateurs peuvent être supprimés définitivement
- ✅ Les modifications sont synchronisées entre `users` et `auth.users`
- ✅ Tout fonctionne de manière sécurisée (admin uniquement)

---

**Statut** : 🚀 Prêt pour la production
**Temps Total** : ~10 minutes
**Difficulté** : ⭐⭐ (Facile)

