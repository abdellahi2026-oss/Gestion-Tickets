# 🔄 Guide de Migration - Nouvelles Fonctionnalités

## ✨ Nouvelles Fonctionnalités Ajoutées

### 1. Types de Réclamations
- Connexion Coupée
- Connexion Faible
- Connexion Instable
- Problème Câble
- Problème Routeur
- Problème Antenne (SAWI/BLR uniquement)

### 2. Gestion des Utilisateurs (Admin Panel)
- Interface d'administration complète
- Création/Modification/Suppression d'utilisateurs
- Gestion des rôles (Admin, User, Technicien)
- Attribution des services aux techniciens

### 3. Système de Rôles
- **Admin** : Accès complet + gestion des utilisateurs
- **User** : Accès normal aux tickets
- **Technicien** : Accès limité aux tickets de ses services assignés

### 4. Nouveau Type d'Abonnement
- Ajout de **LTE** aux types d'abonnement existants

---

## 📋 Étapes de Migration

### Étape 1 : Exécuter la Migration SQL

1. **Allez sur votre projet Supabase**
   - URL : https://supabase.com/dashboard/project/tznyuhnglpnfllzdhhde

2. **Ouvrez le SQL Editor**
   - Cliquez sur **SQL Editor** dans le menu de gauche

3. **Créez une nouvelle requête**
   - Cliquez sur **"New query"**

4. **Copiez-collez le contenu**
   - Ouvrez le fichier `supabase/migrations/004_complaint_types_and_roles.sql`
   - Copiez tout le contenu
   - Collez dans l'éditeur SQL

5. **Exécutez la migration**
   - Cliquez sur **"Run"** (ou Ctrl+Enter)
   - Attendez la confirmation de succès

### Étape 2 : Vérifier la Migration

Exécutez ces requêtes pour vérifier :

```sql
-- Vérifier les types de réclamations
SELECT * FROM complaint_types;

-- Vérifier la colonne complaint_type dans tickets
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets' AND column_name = 'complaint_type';

-- Vérifier la table technician_services
SELECT * FROM technician_services;

-- Vérifier les rôles des utilisateurs
SELECT email, role FROM users;
```

### Étape 3 : Redémarrer l'Application

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

---

## 🎯 Utilisation des Nouvelles Fonctionnalités

### Créer un Ticket avec Type de Réclamation

1. Allez sur **"+ Nouveau Ticket"**
2. Remplissez le formulaire
3. Sélectionnez le **Type d'abonnement**
4. Sélectionnez le **Type de réclamation** (filtré selon le type d'abonnement)
5. Créez le ticket

**Note** : Les types de réclamations sont filtrés automatiquement :
- **SAWI/BLR** : Tous les types + Problème Antenne
- **FTTH/LS/MPLS** : Tous les types sauf Problème Antenne

### Accéder au Panel Admin

1. **Connectez-vous en tant qu'admin**
   - Email : `admin@rimatel.mr`
   - Password : `admin123`

2. **Cliquez sur "Gestion des Utilisateurs"** dans le menu

3. **Créer un utilisateur** :
   - Cliquez sur **"Ajouter un Utilisateur"**
   - Remplissez le formulaire
   - Sélectionnez le rôle
   - Si **Technicien** : Assignez les services (SAWI, LTE, BLR, FTTH, LS/MPLS)
   - Sauvegardez

### Gestion des Techniciens

**Pour créer un technicien** :
1. Panel Admin → Ajouter un Utilisateur
2. Rôle : **Technicien**
3. Sélectionnez les services (ex: SAWI + BLR)
4. Le technicien ne verra que les tickets de ses services

**Exemple** :
- Technicien A : SAWI + BLR → Voit uniquement les tickets SAWI et BLR
- Technicien B : FTTH + LS/MPLS → Voit uniquement les tickets FTTH et LS/MPLS

---

## 🔒 Permissions par Rôle

### Admin
✅ Voir tous les tickets  
✅ Créer/Modifier/Supprimer des tickets  
✅ Gérer les utilisateurs  
✅ Assigner des services aux techniciens  
✅ Accès au panel d'administration  

### User
✅ Voir tous les tickets  
✅ Créer/Modifier des tickets  
❌ Gérer les utilisateurs  

### Technicien
✅ Voir les tickets de ses services assignés uniquement  
✅ Modifier les tickets de ses services  
❌ Voir les tickets d'autres services  
❌ Gérer les utilisateurs  

---

## 🐛 Résolution de Problèmes

### Erreur lors de la création de ticket

**Problème** : "complaint_type is required"

**Solution** :
1. Vérifiez que la migration 004 est exécutée
2. Vérifiez que la table `complaint_types` existe
3. Redémarrez l'application

### Le menu Admin n'apparaît pas

**Problème** : Le lien "Gestion des Utilisateurs" n'est pas visible

**Solution** :
1. Vérifiez que vous êtes connecté en tant qu'admin
2. Exécutez cette requête SQL :
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@rimatel.mr';
```
3. Déconnectez-vous et reconnectez-vous

### Les types de réclamations ne s'affichent pas

**Problème** : Le menu déroulant est vide

**Solution** :
1. Vérifiez que la migration 004 est exécutée
2. Vérifiez les données :
```sql
SELECT * FROM complaint_types WHERE is_active = true;
```
3. Si vide, réexécutez la partie INSERT de la migration

### Erreur "admin.createUser is not a function"

**Problème** : Erreur lors de la création d'utilisateur

**Solution** :
Cette fonctionnalité nécessite les permissions admin de Supabase.

**Alternative** : Créez les utilisateurs manuellement via Supabase Dashboard :
1. **Authentication** → **Users** → **Add user**
2. Puis mettez à jour le rôle dans la table `users`

---

## 📊 Nouvelles Tables

### complaint_types
```sql
- id (UUID)
- code (VARCHAR) - Ex: CONNEXION_COUPEE
- name_fr (VARCHAR)
- name_ar (VARCHAR)
- name_en (VARCHAR)
- applicable_to (TEXT[]) - Array des types d'abonnement
- is_active (BOOLEAN)
```

### technician_services
```sql
- id (UUID)
- user_id (UUID) - Référence vers users
- service_type (VARCHAR) - SAWI, LTE, BLR, FTTH, LS/MPLS
- assigned_by (UUID) - Qui a assigné
- assigned_at (TIMESTAMP)
```

### Modifications de tickets
```sql
- complaint_type (VARCHAR) - Nouveau champ
- subscription_type - Maintenant inclut LTE
```

### Modifications de users
```sql
- role (VARCHAR) - admin, user, technicien
```

---

## ✅ Checklist Post-Migration

- [ ] Migration 004 exécutée avec succès
- [ ] Table `complaint_types` créée avec 6 types
- [ ] Table `technician_services` créée
- [ ] Colonne `complaint_type` ajoutée à `tickets`
- [ ] Colonne `role` mise à jour dans `users`
- [ ] LTE ajouté aux types d'abonnement
- [ ] Application redémarrée
- [ ] Création de ticket fonctionne avec type de réclamation
- [ ] Panel admin accessible
- [ ] Création d'utilisateur fonctionne
- [ ] Attribution de services aux techniciens fonctionne

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de l'application (console du navigateur)
2. Vérifiez les logs Supabase (SQL Editor)
3. Consultez la FAQ
4. Contactez le support technique

---

**Migration créée le** : 2024-01-XX  
**Version** : 1.1.0  
**Statut** : ✅ Prêt pour production

