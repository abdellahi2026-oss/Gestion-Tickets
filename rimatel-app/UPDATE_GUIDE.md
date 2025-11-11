# 🔄 Guide de Mise à Jour - Gestion Complète des Utilisateurs

## 📋 Résumé des Modifications

Ce guide explique comment activer la **suppression définitive** et la **mise à jour complète** des utilisateurs.

### ✅ Nouvelles Fonctionnalités

1. **Suppression définitive** : Supprime l'utilisateur de `users` ET de `auth.users`
2. **Mise à jour complète** : Met à jour les informations dans `users` ET `auth.users`
3. **Modification de l'email** : Permet de changer l'email d'un utilisateur
4. **Modification du mot de passe** : Permet de réinitialiser le mot de passe
5. **Gestion des services** : Met à jour les services des techniciens

## 🚀 Étapes de Déploiement

### Étape 1 : Installer Supabase CLI

#### Windows (PowerShell - Administrateur)
```powershell
# Installer Scoop
iwr -useb get.scoop.sh | iex

# Installer Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### macOS / Linux
```bash
npm install -g supabase
```

### Étape 2 : Se Connecter à Supabase

```bash
# Se connecter
supabase login

# Lier votre projet (Project ID: tznyuhnglpnfllzdhhde)
supabase link --project-ref tznyuhnglpnfllzdhhde
```

### Étape 3 : Déployer les Edge Functions

```bash
# Déployer toutes les fonctions
supabase functions deploy

# OU déployer individuellement
supabase functions deploy delete-user
supabase functions deploy update-user
```

### Étape 4 : Vérifier le Déploiement

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard/project/tznyuhnglpnfllzdhhde)
2. Cliquez sur **Edge Functions** dans le menu
3. Vérifiez que vous voyez :
   - ✅ `delete-user`
   - ✅ `update-user`

### Étape 5 : Tester l'Application

1. **Rechargez l'application** dans le navigateur (F5)
2. Allez dans **Gestion des Utilisateurs**
3. Testez :
   - ✅ Modifier un utilisateur (nom, email, rôle, services)
   - ✅ Supprimer un utilisateur (suppression complète)

## 🧪 Tests à Effectuer

### Test 1 : Mise à Jour d'un Utilisateur

1. Cliquez sur l'icône ✏️ (Edit) d'un utilisateur
2. Modifiez :
   - Nom complet
   - Email (optionnel)
   - Mot de passe (optionnel)
   - Rôle
   - Services (si technicien)
3. Cliquez sur **Enregistrer**
4. ✅ Vérifiez que les modifications sont appliquées

### Test 2 : Suppression Définitive

1. Cliquez sur l'icône 🗑️ (Delete) d'un utilisateur
2. Confirmez la suppression
3. ✅ Vérifiez que l'utilisateur disparaît de la liste
4. ✅ Vérifiez dans Supabase Dashboard :
   - **Authentication** → **Users** : L'utilisateur doit être supprimé
   - **Table Editor** → **users** : L'utilisateur doit être supprimé

### Test 3 : Vérification des Logs

Ouvrez la console du navigateur (F12) et vérifiez les logs :

```
🔄 Updating user via Edge Function: user-id
✅ User updated successfully
```

```
🗑️ Deleting user via Edge Function: user-id
✅ User deleted completely
```

## 🔧 Dépannage

### Problème : "Failed to fetch"

**Cause** : Les Edge Functions ne sont pas déployées

**Solution** :
```bash
supabase functions deploy
```

### Problème : "Non autorisé" (401)

**Cause** : Session expirée

**Solution** :
1. Déconnectez-vous
2. Reconnectez-vous
3. Réessayez

### Problème : "Accès refusé - Admin uniquement" (403)

**Cause** : Vous n'êtes pas connecté en tant qu'admin

**Solution** :
1. Connectez-vous avec un compte admin
2. Vérifiez dans la table `users` que votre rôle est `admin`

### Problème : Edge Function ne se déploie pas

**Solution** :
```bash
# Vérifier la connexion
supabase projects list

# Se reconnecter si nécessaire
supabase login

# Relancer le déploiement
supabase functions deploy --debug
```

## 📊 Vérification dans Supabase Dashboard

### Vérifier les Edge Functions

1. **Edge Functions** → Vous devez voir :
   - `delete-user` (Deployed)
   - `update-user` (Deployed)

### Vérifier les Logs

1. **Edge Functions** → `delete-user` → **Logs**
2. Vous devriez voir les requêtes et les réponses

### Vérifier les Utilisateurs

1. **Authentication** → **Users**
2. Après suppression, l'utilisateur ne doit plus apparaître

## 🎯 Fonctionnalités Disponibles

### ✅ Suppression Définitive
- Supprime de la table `users`
- Supprime de `auth.users`
- Supprime les services associés (cascade)
- Empêche la suppression de son propre compte

### ✅ Mise à Jour Complète
- Met à jour le nom d'utilisateur
- Met à jour le nom complet
- Met à jour l'email (optionnel)
- Met à jour le mot de passe (optionnel)
- Met à jour le rôle
- Met à jour le statut actif/inactif
- Met à jour les services (pour les techniciens)

### ✅ Sécurité
- Vérification de l'authentification
- Vérification du rôle admin
- Protection contre la suppression de son propre compte
- Logs détaillés pour le débogage

## 📝 Notes Importantes

1. **Service Role Key** : Les Edge Functions utilisent automatiquement la Service Role Key côté serveur
2. **Sécurité** : Seuls les admins peuvent supprimer/modifier des utilisateurs
3. **Logs** : Tous les logs sont visibles dans Supabase Dashboard → Edge Functions → Logs
4. **Performance** : Les Edge Functions sont déployées sur le réseau global de Supabase (rapide)

## 🔗 Ressources

- [Documentation Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Dashboard Supabase](https://supabase.com/dashboard/project/tznyuhnglpnfllzdhhde)

## ✅ Checklist Finale

- [ ] Supabase CLI installé
- [ ] Connecté à Supabase
- [ ] Projet lié
- [ ] Edge Functions déployées
- [ ] Fonctions visibles dans Dashboard
- [ ] Application rechargée
- [ ] Test de mise à jour réussi
- [ ] Test de suppression réussi
- [ ] Logs vérifiés

---

**Statut** : 🚀 Prêt pour la production
**Version** : 2.0
**Date** : 2025-11-06

