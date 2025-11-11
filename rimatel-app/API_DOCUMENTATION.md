# 📡 RIMATEL Ticketing - Documentation API

## 🔐 Authentification

Toutes les requêtes API nécessitent un token JWT valide obtenu via Supabase Auth.

```javascript
// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@rimatel.mr',
  password: 'admin123'
})

// Le token est automatiquement géré par Supabase client
```

## 📊 Endpoints Principaux

### Tickets

#### Lister tous les tickets

```javascript
const { data, error } = await supabase
  .from('tickets')
  .select('*, wilayas(name_fr), regions(name_fr)')
  .order('created_at', { ascending: false })
```

#### Créer un ticket

```javascript
const { data, error } = await supabase
  .from('tickets')
  .insert([{
    ticket_number: 'TKT-123456',
    subscriber_number: 'DAB12345',
    client_name: 'Mohamed Ahmed',
    phone: '+22212345678',
    wilaya_code: 'NKC',
    region_id: 'uuid-region',
    subscription_type: 'FTTH',
    problem_description: 'Problème de connexion',
    status: 'nouveau'
  }])
  .select()
```

#### Mettre à jour un ticket

```javascript
const { data, error } = await supabase
  .from('tickets')
  .update({ 
    status: 'en_cours',
    updated_at: new Date().toISOString()
  })
  .eq('id', ticketId)
```

#### Filtrer les tickets

```javascript
// Par statut
const { data } = await supabase
  .from('tickets')
  .select('*')
  .eq('status', 'nouveau')

// Par wilaya
const { data } = await supabase
  .from('tickets')
  .select('*')
  .eq('wilaya_code', 'NKC')

// Par numéro d'abonné
const { data } = await supabase
  .from('tickets')
  .select('*')
  .eq('subscriber_number', 'DAB12345')

// Tickets ouverts (non fermés)
const { data } = await supabase
  .from('tickets')
  .select('*')
  .neq('status', 'fermé')
```

### Wilayas

#### Lister toutes les wilayas

```javascript
const { data, error } = await supabase
  .from('wilayas')
  .select('*')
  .order('name_fr')
```

### Régions

#### Lister les régions de NKC

```javascript
const { data, error } = await supabase
  .from('regions')
  .select('*')
  .eq('wilaya_code', 'NKC')
  .order('name_fr')
```

### Historique

#### Historique d'un ticket

```javascript
const { data, error } = await supabase
  .from('ticket_history')
  .select('*')
  .eq('ticket_id', ticketId)
  .order('created_at', { ascending: false })
```

#### Ajouter une entrée d'historique

```javascript
const { data, error } = await supabase
  .from('ticket_history')
  .insert([{
    ticket_id: ticketId,
    action: 'status_change',
    from_status: 'nouveau',
    to_status: 'en_cours',
    changed_by: userId,
    changed_by_name: 'Admin User'
  }])
```

### Statistiques

#### Compter les tickets par statut

```javascript
const { count: total } = await supabase
  .from('tickets')
  .select('*', { count: 'exact', head: true })

const { count: open } = await supabase
  .from('tickets')
  .select('*', { count: 'exact', head: true })
  .neq('status', 'fermé')

const { count: closed } = await supabase
  .from('tickets')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'fermé')

const { count: late } = await supabase
  .from('tickets')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'en_retard')
```

#### Grouper par wilaya

```javascript
const { data } = await supabase
  .from('tickets')
  .select('wilaya_code, wilayas(name_fr)')

// Grouper côté client
const grouped = data.reduce((acc, ticket) => {
  const wilaya = ticket.wilayas?.name_fr || ticket.wilaya_code
  acc[wilaya] = (acc[wilaya] || 0) + 1
  return acc
}, {})
```

## 🔒 Row Level Security (RLS)

### Policies Actives

#### Tickets
- ✅ Lecture : Tous les utilisateurs authentifiés
- ✅ Création : Tous les utilisateurs authentifiés
- ✅ Modification : Tous les utilisateurs authentifiés

#### Wilayas & Régions
- ✅ Lecture : Public (pas d'authentification requise)

#### Historique
- ✅ Lecture : Tous les utilisateurs authentifiés
- ✅ Création : Tous les utilisateurs authentifiés

## 📝 Schéma de Données

### Table: tickets

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| ticket_number | VARCHAR(50) | Numéro de ticket (ex: TKT-123456) |
| subscriber_number | VARCHAR(20) | Numéro d'abonné (DAB + 1-6 chiffres) |
| client_name | VARCHAR(255) | Nom du client |
| phone | VARCHAR(20) | Téléphone (6-15 chiffres) |
| wilaya_code | VARCHAR(20) | Code wilaya (FK) |
| region_id | UUID | ID région (FK, nullable) |
| subscription_type | VARCHAR(20) | SAWI, BLR, FTTH, LS/MPLS |
| problem_description | TEXT | Description du problème |
| status | VARCHAR(20) | Statut du ticket |
| created_by | UUID | ID utilisateur créateur |
| assigned_to | UUID | ID utilisateur assigné |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |
| closed_at | TIMESTAMP | Date de fermeture |

### Table: wilayas

| Colonne | Type | Description |
|---------|------|-------------|
| code | VARCHAR(20) | Code unique (PK) |
| name_fr | VARCHAR(100) | Nom en français |
| name_ar | VARCHAR(100) | Nom en arabe |
| name_en | VARCHAR(100) | Nom en anglais |

### Table: regions

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| wilaya_code | VARCHAR(20) | Code wilaya (FK) |
| name_fr | VARCHAR(100) | Nom en français |
| name_ar | VARCHAR(100) | Nom en arabe |
| name_en | VARCHAR(100) | Nom en anglais |

### Table: ticket_history

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| ticket_id | UUID | ID ticket (FK) |
| action | VARCHAR(100) | Type d'action |
| from_status | VARCHAR(20) | Statut précédent |
| to_status | VARCHAR(20) | Nouveau statut |
| changed_by | UUID | ID utilisateur |
| changed_by_name | VARCHAR(255) | Nom utilisateur |
| notes | TEXT | Notes additionnelles |
| created_at | TIMESTAMP | Date de l'action |

## 🔄 Statuts des Tickets

| Statut | Code | Description |
|--------|------|-------------|
| Nouveau | `nouveau` | Ticket créé |
| Assigné | `assigné` | Assigné à l'équipe e-billing |
| Paiement | `paiement` | Problème de paiement |
| En cours | `en_cours` | Intervention technique |
| Injoignable | `injoignable` | Client non joignable |
| En retard | `en_retard` | Plus de 24h sans résolution |
| Fermé | `fermé` | Ticket résolu |

## ⚠️ Règles de Validation

### Numéro d'Abonné
```regex
^DAB\d{1,6}$
```
Exemples valides : `DAB1`, `DAB123`, `DAB123456`

### Téléphone
```regex
^\+?\d{6,15}$
```
Exemples valides : `12345678`, `+22212345678`

### Prévention des Doublons

Avant de créer un ticket, vérifier :
```javascript
const { data } = await supabase
  .from('tickets')
  .select('id')
  .eq('subscriber_number', subscriberNumber)
  .neq('status', 'fermé')
  .limit(1)

if (data && data.length > 0) {
  throw new Error('Un ticket ouvert existe déjà pour ce numéro')
}
```

## 🔧 Fonctions Utilitaires

### Générer un Numéro de Ticket

```javascript
function generateTicketNumber() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `TKT-${timestamp}-${random}`
}
```

### Marquer les Tickets en Retard

```sql
-- Fonction SQL à exécuter périodiquement
SELECT mark_late_tickets();
```

## 📊 Exemples de Requêtes Complexes

### Tickets par Wilaya avec Comptage

```javascript
const { data: tickets } = await supabase
  .from('tickets')
  .select('wilaya_code, wilayas(name_fr)')

const stats = tickets.reduce((acc, t) => {
  const wilaya = t.wilayas?.name_fr || t.wilaya_code
  acc[wilaya] = (acc[wilaya] || 0) + 1
  return acc
}, {})
```

### Tickets Ouverts depuis plus de 24h

```javascript
const yesterday = new Date()
yesterday.setHours(yesterday.getHours() - 24)

const { data } = await supabase
  .from('tickets')
  .select('*')
  .neq('status', 'fermé')
  .lt('created_at', yesterday.toISOString())
```

### Statistiques Complètes

```javascript
async function getFullStats() {
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')

  return {
    total: tickets.length,
    open: tickets.filter(t => t.status !== 'fermé').length,
    closed: tickets.filter(t => t.status === 'fermé').length,
    late: tickets.filter(t => t.status === 'en_retard').length,
    byStatus: tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1
      return acc
    }, {}),
    byWilaya: tickets.reduce((acc, t) => {
      acc[t.wilaya_code] = (acc[t.wilaya_code] || 0) + 1
      return acc
    }, {}),
    byService: tickets.reduce((acc, t) => {
      acc[t.subscription_type] = (acc[t.subscription_type] || 0) + 1
      return acc
    }, {})
  }
}
```

## 🔐 Sécurité

### Headers Requis

```javascript
{
  'apikey': 'votre-anon-key',
  'Authorization': 'Bearer votre-jwt-token',
  'Content-Type': 'application/json'
}
```

### Gestion des Erreurs

```javascript
try {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')

  if (error) throw error

  return data
} catch (error) {
  console.error('Erreur API:', error.message)
  // Gérer l'erreur appropriée
}
```

---

**Documentation générée pour RIMATEL SA - Système de Ticketing**

