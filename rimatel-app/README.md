# 🎫 RIMATEL SA - Système de Ticketing

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com)

Système complet de gestion de tickets pour RIMATEL SA avec support multilingue (Français, Arabe, Anglais).

## 📚 Documentation

- 📖 **[Guide de Démarrage Rapide](QUICK_START.md)** - Installation en 5 minutes
- 🔧 **[Guide d'Installation Détaillé](SETUP_GUIDE.md)** - Configuration complète
- 📡 **[Documentation API](API_DOCUMENTATION.md)** - Référence API Supabase
- 📁 **[Structure du Projet](PROJECT_STRUCTURE.md)** - Organisation des fichiers
- 🛠️ **[Guide de Maintenance](MAINTENANCE.md)** - Maintenance et dépannage
- 🤝 **[Guide de Contribution](CONTRIBUTING.md)** - Comment contribuer
- 🔒 **[Politique de Sécurité](SECURITY.md)** - Sécurité et vulnérabilités
- 📝 **[Changelog](CHANGELOG.md)** - Historique des versions
- 📋 **[Index](INDEX.md)** - Navigation dans la documentation

## 🌟 Fonctionnalités

- ✅ **Authentification sécurisée** avec Supabase Auth
- 🌍 **Support multilingue** (FR, AR, EN) avec i18next
- 📊 **Tableau de bord** avec statistiques et graphiques (Chart.js)
- 🎫 **Gestion complète des tickets**
  - Création avec validation stricte
  - Prévention des doublons
  - Changement de statut en temps réel
  - Historique des modifications
- 📍 **Données géographiques** (Wilayas et Régions de Mauritanie)
- 🔒 **Sécurité** avec Row Level Security (RLS)
- 📱 **Design responsive** avec Tailwind CSS
- ⏰ **Tâche automatique** pour marquer les tickets en retard (>24h)

## 🏗️ Architecture

### Frontend
- **React 18** avec Vite
- **React Router** pour la navigation
- **Tailwind CSS** pour le design
- **Chart.js** pour les graphiques
- **i18next** pour l'internationalisation
- **Lucide React** pour les icônes

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Row Level Security** pour la sécurité des données

## 📋 Prérequis

- Node.js 18+ et npm
- Compte Supabase (gratuit sur [supabase.com](https://supabase.com))

## 🚀 Installation Locale

### 1. Cloner le projet

```bash
cd rimatel-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

#### A. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **URL** et **anon key**

#### B. Exécuter les migrations SQL

Dans le **SQL Editor** de Supabase, exécutez dans l'ordre :

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_data.sql`
3. `supabase/migrations/003_rls_policies.sql`
4. `supabase/functions/check-late-tickets.sql`

#### C. Configurer l'authentification

1. Dans **Authentication > Providers**, activez **Email**
2. Créez un utilisateur test :
   - Email: `admin@rimatel.mr`
   - Password: `admin123`

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine :

```bash
cp .env.example .env
```

Modifiez `.env` avec vos credentials Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur **http://localhost:3000**

## 🌐 Déploiement Cloud

### Option 1: Render.com

1. Créez un compte sur [render.com](https://render.com)
2. Créez un nouveau **Static Site**
3. Connectez votre repository Git
4. Render détectera automatiquement `render.yaml`
5. Ajoutez les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Déployez !

### Option 2: Railway.app

1. Créez un compte sur [railway.app](https://railway.app)
2. Créez un nouveau projet
3. Connectez votre repository Git
4. Railway détectera automatiquement `railway.json`
5. Ajoutez les variables d'environnement
6. Déployez !

### Option 3: Docker

```bash
# Build l'image
docker build -t rimatel-ticketing .

# Run le container
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=votre-url \
  -e VITE_SUPABASE_ANON_KEY=votre-key \
  rimatel-ticketing
```

### Option 4: Vercel / Netlify

Ces plateformes supportent également les applications Vite/React :

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 📊 Règles Métier

### Validation des Données

- **Numéro d'abonné** : Format `DAB` + 1 à 6 chiffres (ex: `DAB123456`)
- **Téléphone** : 6 à 15 chiffres, peut commencer par `+`
- **Type d'abonnement** : SAWI, BLR, FTTH, LS/MPLS
- **Wilaya** : Obligatoire
- **Région** : Obligatoire uniquement pour Nouakchott (NKC)

### Statuts des Tickets

| Statut | Description |
|--------|-------------|
| `nouveau` | Ticket créé |
| `assigné` | Assigné à l'équipe e-billing |
| `paiement` | Problème de paiement |
| `en_cours` | Intervention technique en cours |
| `injoignable` | Client non joignable |
| `en_retard` | Plus de 24h sans résolution |
| `fermé` | Ticket résolu et fermé |

### Prévention des Doublons

Le système empêche la création d'un nouveau ticket si un ticket **non fermé** existe déjà pour le même numéro d'abonné.

## 🔧 Configuration Avancée

### Tâche Automatique (Tickets en Retard)

Pour activer la vérification automatique des tickets en retard :

#### Option 1: Supabase Edge Functions

Créez une Edge Function qui appelle `mark_late_tickets()` toutes les heures.

#### Option 2: Cron externe

Utilisez un service comme **cron-job.org** pour appeler une API endpoint toutes les heures.

#### Option 3: pg_cron (si disponible)

```sql
SELECT cron.schedule(
  'mark-late-tickets',
  '0 * * * *',
  'SELECT mark_late_tickets()'
);
```

### Notifications Email (Optionnel)

Configurez SMTP dans **Supabase > Project Settings > Auth > SMTP Settings** pour envoyer des emails automatiques.

## 📱 Utilisation

### Connexion

- Email: `admin@rimatel.mr`
- Mot de passe: `admin123`

### Créer un Ticket

1. Cliquez sur **"Nouveau Ticket"**
2. Remplissez le formulaire
3. Le système vérifie automatiquement les doublons
4. Le ticket est créé avec le statut **"nouveau"**

### Gérer les Tickets

- **Liste des tickets** : Vue d'ensemble avec recherche et filtres
- **Changement de statut** : Directement depuis la liste
- **Historique** : Toutes les modifications sont enregistrées

### Tableau de Bord

- Statistiques globales (Total, Ouverts, Fermés, En retard)
- Graphiques par Wilaya
- Graphiques par Service
- Graphiques par Région (pour NKC)
- Liste des tickets récents

## 🎨 Personnalisation

### Couleurs

Modifiez `tailwind.config.js` :

```js
colors: {
  primary: {
    DEFAULT: '#22AA66',  // Vert principal
    dark: '#1a8850',
    light: '#2bc47a'
  }
}
```

### Logo

Remplacez `/public/logo.png` par votre logo (recommandé : 200x200px, PNG transparent).

### Langues

Modifiez les fichiers dans `src/i18n/locales/` :
- `fr.json` - Français
- `ar.json` - Arabe
- `en.json` - Anglais

## 🔒 Sécurité

- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Authentification JWT avec Supabase
- ✅ Validation côté client et serveur
- ✅ Historique de connexion (IP, succès/échec)
- ✅ Historique des modifications de tickets

## 📦 Structure du Projet

```
rimatel-app/
├── public/
│   └── logo.png
├── src/
│   ├── components/
│   │   └── Layout.jsx
│   ├── i18n/
│   │   ├── config.js
│   │   └── locales/
│   │       ├── fr.json
│   │       ├── ar.json
│   │       └── en.json
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── NewTicket.jsx
│   │   └── TicketList.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_seed_data.sql
│   │   └── 003_rls_policies.sql
│   └── functions/
│       └── check-late-tickets.sql
├── Dockerfile
├── nginx.conf
├── render.yaml
├── railway.json
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🐛 Dépannage

### Erreur de connexion Supabase

Vérifiez que vos variables d'environnement sont correctes dans `.env`.

### Les données ne s'affichent pas

Assurez-vous d'avoir exécuté toutes les migrations SQL dans Supabase.

### Erreur RLS

Vérifiez que les policies RLS sont bien créées (`003_rls_policies.sql`).

## 📄 Licence

© 2024 RIMATEL SA - Tous droits réservés

## 👨‍💻 Support

Pour toute question ou assistance, contactez l'équipe technique RIMATEL SA.

---

**Développé avec ❤️ pour RIMATEL SA**

