# 🔧 RIMATEL Ticketing - Guide de Maintenance

## 📅 Tâches de Maintenance Régulières

### Quotidien

#### Vérifier les Tickets en Retard
```sql
-- Dans Supabase SQL Editor
SELECT * FROM tickets 
WHERE status = 'en_retard' 
ORDER BY created_at DESC;
```

#### Vérifier les Tentatives de Connexion Échouées
```sql
SELECT * FROM login_history 
WHERE success = false 
AND attempted_at > NOW() - INTERVAL '24 hours'
ORDER BY attempted_at DESC;
```

### Hebdomadaire

#### Nettoyer l'Historique Ancien (> 6 mois)
```sql
DELETE FROM login_history 
WHERE attempted_at < NOW() - INTERVAL '6 months';
```

#### Analyser les Statistiques
```sql
-- Tickets par statut
SELECT status, COUNT(*) as count 
FROM tickets 
GROUP BY status;

-- Tickets par wilaya
SELECT w.name_fr, COUNT(t.id) as count
FROM tickets t
JOIN wilayas w ON t.wilaya_code = w.code
GROUP BY w.name_fr
ORDER BY count DESC;
```

### Mensuel

#### Sauvegarder la Base de Données
Dans Supabase Dashboard :
1. **Database** → **Backups**
2. Vérifier que les backups automatiques sont actifs
3. Télécharger une copie manuelle si nécessaire

#### Mettre à Jour les Dépendances
```bash
# Vérifier les mises à jour disponibles
npm outdated

# Mettre à jour les dépendances mineures
npm update

# Pour les mises à jour majeures (avec précaution)
npm install package@latest
```

## 🔄 Mises à Jour

### Mettre à Jour l'Application

```bash
# 1. Sauvegarder les changements
git add .
git commit -m "Backup avant mise à jour"

# 2. Mettre à jour les dépendances
npm update

# 3. Tester localement
npm run dev

# 4. Build de production
npm run build

# 5. Déployer
git push origin main
```

### Ajouter une Nouvelle Wilaya

```sql
INSERT INTO wilayas (code, name_fr, name_ar, name_en) 
VALUES ('CODE', 'Nom FR', 'الاسم', 'Name EN');
```

### Ajouter une Nouvelle Région (NKC)

```sql
INSERT INTO regions (wilaya_code, name_fr, name_ar, name_en) 
VALUES ('NKC', 'Nom FR', 'الاسم', 'Name EN');
```

### Ajouter un Nouveau Statut

1. Modifier la contrainte dans la base de données :
```sql
ALTER TABLE tickets 
DROP CONSTRAINT tickets_status_check;

ALTER TABLE tickets 
ADD CONSTRAINT tickets_status_check 
CHECK (status IN ('nouveau', 'assigné', 'paiement', 'en_cours', 'injoignable', 'en_retard', 'fermé', 'NOUVEAU_STATUT'));
```

2. Ajouter les traductions dans `src/i18n/locales/*.json` :
```json
{
  "status": {
    "NOUVEAU_STATUT": "Traduction"
  }
}
```

3. Mettre à jour les composants React si nécessaire

## 🐛 Résolution de Problèmes

### Problème : Les Tickets ne se Créent Pas

**Diagnostic :**
```javascript
// Ouvrir la console du navigateur (F12)
// Vérifier les erreurs dans l'onglet Console
```

**Solutions :**
1. Vérifier les RLS policies dans Supabase
2. Vérifier que l'utilisateur est authentifié
3. Vérifier la validation du formulaire

### Problème : Les Graphiques ne s'Affichent Pas

**Solutions :**
1. Vérifier que Chart.js est installé :
```bash
npm list chart.js react-chartjs-2
```

2. Vérifier les données dans la console :
```javascript
console.log('Wilaya Data:', wilayaData)
```

3. Réinstaller les dépendances :
```bash
npm install chart.js react-chartjs-2
```

### Problème : Erreur de Connexion Supabase

**Solutions :**
1. Vérifier `.env` :
```bash
cat .env
```

2. Vérifier que les variables sont chargées :
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```

3. Vérifier le statut de Supabase :
https://status.supabase.com

### Problème : Build Échoue

**Solutions :**
```bash
# Nettoyer le cache
rm -rf node_modules package-lock.json dist

# Réinstaller
npm install

# Rebuild
npm run build
```

## 📊 Monitoring

### Métriques à Surveiller

#### Performance de l'Application
- Temps de chargement des pages
- Temps de réponse des API
- Taille du bundle JavaScript

```bash
# Analyser la taille du build
npm run build
ls -lh dist/assets/
```

#### Base de Données
- Nombre de connexions actives
- Temps de réponse des requêtes
- Taille de la base de données

Dans Supabase Dashboard :
- **Database** → **Database Health**

#### Utilisation
- Nombre de tickets créés par jour
- Nombre de connexions par jour
- Tickets par statut

```sql
-- Tickets créés aujourd'hui
SELECT COUNT(*) FROM tickets 
WHERE DATE(created_at) = CURRENT_DATE;

-- Connexions réussies aujourd'hui
SELECT COUNT(*) FROM login_history 
WHERE success = true 
AND DATE(attempted_at) = CURRENT_DATE;
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne JAMAIS commiter `.env`**
```bash
# Vérifier avant de commit
git status
```

2. **Changer les mots de passe par défaut**
```sql
-- Créer un nouvel utilisateur admin
-- Supprimer l'utilisateur de test
```

3. **Activer 2FA sur Supabase**
Dans Supabase Dashboard :
- **Account** → **Security** → **Enable 2FA**

4. **Limiter les permissions RLS**
```sql
-- Exemple : Limiter la modification aux admins seulement
CREATE POLICY "Only admins can update tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Audit de Sécurité

```sql
-- Vérifier les connexions échouées récentes
SELECT email, COUNT(*) as failed_attempts
FROM login_history
WHERE success = false
AND attempted_at > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) > 5;

-- Vérifier les modifications de tickets
SELECT t.ticket_number, th.action, th.created_at
FROM ticket_history th
JOIN tickets t ON th.ticket_id = t.id
WHERE th.created_at > NOW() - INTERVAL '24 hours'
ORDER BY th.created_at DESC;
```

## 📈 Optimisation

### Performance Frontend

1. **Lazy Loading des Pages**
```javascript
// Dans App.jsx
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TicketList = lazy(() => import('./pages/TicketList'))
```

2. **Optimiser les Images**
```bash
# Compresser le logo
# Utiliser des formats modernes (WebP, AVIF)
```

3. **Code Splitting**
```javascript
// Vite le fait automatiquement
npm run build
```

### Performance Backend

1. **Indexer les Colonnes Fréquemment Recherchées**
```sql
CREATE INDEX idx_tickets_subscriber ON tickets(subscriber_number);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
```

2. **Limiter les Résultats**
```javascript
// Pagination
const { data } = await supabase
  .from('tickets')
  .select('*')
  .range(0, 49) // 50 premiers résultats
```

3. **Utiliser les Vues Matérialisées**
```sql
-- Pour les statistiques fréquentes
CREATE MATERIALIZED VIEW ticket_stats AS
SELECT 
  status,
  COUNT(*) as count
FROM tickets
GROUP BY status;

-- Rafraîchir périodiquement
REFRESH MATERIALIZED VIEW ticket_stats;
```

## 🔄 Backup et Restauration

### Backup Manuel

```bash
# Exporter les données depuis Supabase
# Database → Backups → Download

# Ou via pg_dump (si accès direct)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### Restauration

```bash
# Via Supabase Dashboard
# Database → Backups → Restore

# Ou via psql
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

## 📞 Support et Escalade

### Niveaux de Support

**Niveau 1 : Utilisateur**
- Problèmes de connexion
- Questions sur l'utilisation
- Création de tickets

**Niveau 2 : Administrateur**
- Gestion des utilisateurs
- Configuration système
- Rapports et statistiques

**Niveau 3 : Développeur**
- Bugs de l'application
- Modifications du code
- Mises à jour majeures

### Contacts

- **Support Supabase** : https://supabase.com/support
- **Documentation React** : https://react.dev
- **Documentation Vite** : https://vitejs.dev

## 📝 Changelog

Maintenir un fichier `CHANGELOG.md` pour suivre les modifications :

```markdown
# Changelog

## [1.0.0] - 2024-01-XX
### Ajouté
- Système de ticketing complet
- Support multilingue (FR/AR/EN)
- Tableau de bord avec graphiques
- Authentification Supabase

### Modifié
- N/A

### Corrigé
- N/A
```

---

**Guide de Maintenance - RIMATEL SA**

