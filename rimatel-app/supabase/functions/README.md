# 🔧 Edge Functions Supabase - RIMATEL

## 📋 Vue d'Ensemble

Ce dossier contient les Edge Functions Supabase pour la gestion complète des utilisateurs.

### Fonctions Disponibles

1. **delete-user** : Suppression définitive d'un utilisateur
2. **update-user** : Mise à jour complète d'un utilisateur

## 🚀 Déploiement Rapide

### Windows
```powershell
.\deploy-functions.ps1
```

### macOS / Linux
```bash
supabase functions deploy
```

## 📦 delete-user

### Description
Supprime un utilisateur de manière définitive :
- Supprime de la table `users`
- Supprime de `auth.users`
- Supprime les services associés (cascade automatique)

### Endpoint
```
POST https://tznyuhnglpnfllzdhhde.supabase.co/functions/v1/delete-user
```

### Requête
```json
{
  "userId": "uuid-de-l-utilisateur"
}
```

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Réponse Succès
```json
{
  "success": true,
  "message": "Utilisateur supprimé complètement"
}
```

### Réponse Avertissement
```json
{
  "success": true,
  "warning": "Utilisateur supprimé de la base de données mais reste dans auth.users"
}
```

### Réponse Erreur
```json
{
  "error": "Message d'erreur"
}
```

### Codes de Statut
- `200` : Succès
- `400` : Requête invalide
- `401` : Non autorisé
- `403` : Accès refusé (non admin)
- `500` : Erreur serveur

### Sécurité
- ✅ Vérification de l'authentification
- ✅ Vérification du rôle admin
- ✅ Empêche la suppression de son propre compte
- ✅ Logs détaillés

## 📝 update-user

### Description
Met à jour les informations d'un utilisateur :
- Met à jour la table `users`
- Met à jour `auth.users` (email, mot de passe)
- Met à jour les services du technicien

### Endpoint
```
POST https://tznyuhnglpnfllzdhhde.supabase.co/functions/v1/update-user
```

### Requête
```json
{
  "userId": "uuid-de-l-utilisateur",
  "updates": {
    "username": "nouveau_nom_utilisateur",
    "full_name": "Nouveau Nom Complet",
    "email": "nouveau@email.com",
    "password": "nouveau_mot_de_passe",
    "role": "technicien",
    "is_active": true,
    "services": ["SAWI", "LTE"]
  }
}
```

### Champs Optionnels
- `email` : Nouveau email (optionnel)
- `password` : Nouveau mot de passe (optionnel)
- `services` : Services du technicien (uniquement si role = technicien)

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Réponse Succès
```json
{
  "success": true,
  "message": "Utilisateur mis à jour avec succès"
}
```

### Réponse Avertissement
```json
{
  "success": true,
  "warning": "Utilisateur mis à jour dans la base de données mais erreur lors de la mise à jour de l'authentification"
}
```

### Réponse Erreur
```json
{
  "error": "Message d'erreur"
}
```

### Codes de Statut
- `200` : Succès
- `400` : Requête invalide
- `401` : Non autorisé
- `403` : Accès refusé (non admin)
- `500` : Erreur serveur

### Sécurité
- ✅ Vérification de l'authentification
- ✅ Vérification du rôle admin
- ✅ Validation des données
- ✅ Logs détaillés

## 🧪 Tests

### Test Local

```bash
# Démarrer Supabase localement
supabase start

# Servir les fonctions
supabase functions serve

# Tester delete-user
curl -i --location --request POST 'http://localhost:54321/functions/v1/delete-user' \
  --header 'Authorization: Bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"user-id"}'

# Tester update-user
curl -i --location --request POST 'http://localhost:54321/functions/v1/update-user' \
  --header 'Authorization: Bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"user-id","updates":{"full_name":"Test User"}}'
```

### Test Production

```bash
# Tester delete-user
curl -i --location --request POST 'https://tznyuhnglpnfllzdhhde.supabase.co/functions/v1/delete-user' \
  --header 'Authorization: Bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"user-id"}'
```

## 📊 Logs

### Voir les logs en temps réel

```bash
# Logs de delete-user
supabase functions logs delete-user --follow

# Logs de update-user
supabase functions logs update-user --follow
```

### Logs dans Dashboard

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard/project/tznyuhnglpnfllzdhhde)
2. **Edge Functions** → Sélectionnez la fonction
3. **Logs**

## 🔐 Variables d'Environnement

Les Edge Functions ont automatiquement accès à :

- `SUPABASE_URL` : URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service (admin)
- `SUPABASE_ANON_KEY` : Clé publique

Pas besoin de configuration supplémentaire !

## 🐛 Dépannage

### Erreur : "Failed to deploy"

```bash
# Vérifier la connexion
supabase projects list

# Se reconnecter
supabase login

# Relancer le déploiement
supabase functions deploy --debug
```

### Erreur : "Non autorisé"

- Vérifiez que vous êtes connecté
- Vérifiez que votre token est valide
- Vérifiez que vous êtes admin

### Erreur : "Project not linked"

```bash
supabase link --project-ref tznyuhnglpnfllzdhhde
```

## 📚 Ressources

- [Documentation Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Deno Documentation](https://deno.land/manual)

## 🔄 Mise à Jour

Pour mettre à jour une fonction après modification :

```bash
# Déployer une fonction spécifique
supabase functions deploy delete-user

# OU déployer toutes les fonctions
supabase functions deploy
```

## ✅ Checklist

- [ ] Supabase CLI installé
- [ ] Connecté à Supabase
- [ ] Projet lié
- [ ] Fonctions déployées
- [ ] Tests effectués
- [ ] Logs vérifiés

---

**Statut** : ✅ Prêt pour la production
**Version** : 1.0
**Dernière mise à jour** : 2025-11-06

