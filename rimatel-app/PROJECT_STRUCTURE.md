# 📁 RIMATEL Ticketing - Structure du Projet

```
rimatel-app/
│
├── 📂 public/                          # Fichiers statiques
│   ├── logo.svg                        # Logo RIMATEL SA
│   └── logo.png                        # Logo alternatif
│
├── 📂 src/                             # Code source React
│   │
│   ├── 📂 components/                  # Composants réutilisables
│   │   └── Layout.jsx                  # Layout principal avec navigation
│   │
│   ├── 📂 i18n/                        # Internationalisation
│   │   ├── config.js                   # Configuration i18next
│   │   └── 📂 locales/                 # Fichiers de traduction
│   │       ├── fr.json                 # Français (défaut)
│   │       ├── ar.json                 # Arabe
│   │       └── en.json                 # Anglais
│   │
│   ├── 📂 lib/                         # Bibliothèques et utilitaires
│   │   └── supabase.js                 # Client Supabase
│   │
│   ├── 📂 pages/                       # Pages de l'application
│   │   ├── Dashboard.jsx               # Tableau de bord avec graphiques
│   │   ├── Login.jsx                   # Page de connexion
│   │   ├── NewTicket.jsx               # Création de ticket
│   │   └── TicketList.jsx              # Liste des tickets
│   │
│   ├── App.jsx                         # Composant principal + routes
│   ├── main.jsx                        # Point d'entrée React
│   └── index.css                       # Styles globaux + Tailwind
│
├── 📂 supabase/                        # Configuration Supabase
│   │
│   ├── 📂 migrations/                  # Migrations SQL
│   │   ├── 001_initial_schema.sql      # Schéma de base de données
│   │   ├── 002_seed_data.sql           # Données de référence
│   │   └── 003_rls_policies.sql        # Politiques de sécurité
│   │
│   └── 📂 functions/                   # Fonctions Supabase
│       └── check-late-tickets.sql      # Fonction pour tickets en retard
│
├── 📂 Documentation/                   # Documentation du projet
│   ├── README.md                       # Documentation principale
│   ├── QUICK_START.md                  # Démarrage rapide
│   ├── SETUP_GUIDE.md                  # Guide d'installation détaillé
│   ├── API_DOCUMENTATION.md            # Documentation API
│   └── PROJECT_STRUCTURE.md            # Ce fichier
│
├── 📂 Déploiement/                     # Fichiers de déploiement
│   ├── Dockerfile                      # Image Docker
│   ├── nginx.conf                      # Configuration Nginx
│   ├── render.yaml                     # Configuration Render.com
│   ├── railway.json                    # Configuration Railway.app
│   ├── .dockerignore                   # Exclusions Docker
│   └── .gitignore                      # Exclusions Git
│
├── 📂 Scripts/                         # Scripts d'installation
│   ├── setup.sh                        # Installation Linux/macOS
│   └── setup.ps1                       # Installation Windows
│
├── 📂 Configuration/                   # Fichiers de configuration
│   ├── package.json                    # Dépendances npm
│   ├── vite.config.js                  # Configuration Vite
│   ├── tailwind.config.js              # Configuration Tailwind CSS
│   ├── postcss.config.js               # Configuration PostCSS
│   ├── .env.example                    # Exemple de variables d'env
│   └── index.html                      # Template HTML
│
└── 📄 Fichiers racine
    ├── .env                            # Variables d'environnement (à créer)
    ├── .gitignore                      # Exclusions Git
    └── node_modules/                   # Dépendances (généré)
```

## 📋 Description des Dossiers

### 🎨 `/src` - Code Source

#### `/src/components`
Composants React réutilisables :
- **Layout.jsx** : Header, navigation, footer, gestion de langue

#### `/src/pages`
Pages principales de l'application :
- **Login.jsx** : Authentification avec Supabase Auth
- **Dashboard.jsx** : Statistiques et graphiques Chart.js
- **TicketList.jsx** : Liste avec recherche, filtres, changement de statut
- **NewTicket.jsx** : Formulaire de création avec validation

#### `/src/i18n`
Système multilingue :
- **config.js** : Configuration i18next
- **locales/** : Traductions FR/AR/EN

#### `/src/lib`
Utilitaires et bibliothèques :
- **supabase.js** : Client Supabase configuré

### 🗄️ `/supabase` - Base de Données

#### `/supabase/migrations`
Scripts SQL à exécuter dans l'ordre :
1. **001_initial_schema.sql** : Tables (tickets, users, wilayas, etc.)
2. **002_seed_data.sql** : Données de référence (wilayas, régions)
3. **003_rls_policies.sql** : Sécurité Row Level Security

#### `/supabase/functions`
Fonctions PostgreSQL :
- **check-late-tickets.sql** : Marquer tickets > 24h en retard

### 🚀 Fichiers de Déploiement

- **Dockerfile** : Build multi-stage avec Nginx
- **nginx.conf** : Configuration serveur web
- **render.yaml** : Déploiement Render.com
- **railway.json** : Déploiement Railway.app

### ⚙️ Configuration

- **package.json** : Dépendances et scripts npm
- **vite.config.js** : Configuration du bundler
- **tailwind.config.js** : Thème et couleurs (#22AA66)
- **.env.example** : Template des variables d'environnement

## 🔑 Fichiers Importants

### À Créer Manuellement

```bash
.env                    # Copier depuis .env.example
```

### Générés Automatiquement

```bash
node_modules/           # npm install
dist/                   # npm run build
```

## 📊 Schéma de Base de Données

### Tables Principales

```
tickets
├── id (UUID)
├── ticket_number (VARCHAR)
├── subscriber_number (VARCHAR)
├── client_name (VARCHAR)
├── phone (VARCHAR)
├── wilaya_code (FK → wilayas)
├── region_id (FK → regions)
├── subscription_type (ENUM)
├── problem_description (TEXT)
├── status (ENUM)
└── timestamps

wilayas
├── code (PK)
├── name_fr
├── name_ar
└── name_en

regions
├── id (UUID)
├── wilaya_code (FK)
├── name_fr
├── name_ar
└── name_en

ticket_history
├── id (UUID)
├── ticket_id (FK)
├── action
├── from_status
├── to_status
└── timestamp

login_history
├── id (UUID)
├── user_id (FK)
├── email
├── ip_address
├── success (BOOLEAN)
└── timestamp
```

## 🎯 Points d'Entrée

### Développement
```bash
npm run dev              # → src/main.jsx → src/App.jsx
```

### Production
```bash
npm run build            # → dist/index.html
```

### Docker
```bash
docker build .           # → Dockerfile → nginx
```

## 🔄 Flux de Données

```
User Interface (React)
    ↓
Supabase Client (src/lib/supabase.js)
    ↓
Supabase API (REST + Auth)
    ↓
PostgreSQL Database
    ↓
Row Level Security (RLS)
```

## 🌍 Support Multilingue

```
i18n/config.js
    ↓
locales/fr.json (défaut)
locales/ar.json (RTL)
locales/en.json
    ↓
useTranslation() hook
    ↓
Composants React
```

## 📦 Dépendances Principales

### Production
- **react** : Framework UI
- **react-router-dom** : Navigation
- **@supabase/supabase-js** : Client Supabase
- **i18next** : Internationalisation
- **chart.js** : Graphiques
- **lucide-react** : Icônes
- **tailwindcss** : Styles

### Développement
- **vite** : Build tool
- **@vitejs/plugin-react** : Plugin React
- **autoprefixer** : CSS prefixes
- **postcss** : CSS processing

## 🔐 Sécurité

### Fichiers Sensibles (Ne PAS Commiter)
```
.env
.env.local
.env.production
node_modules/
dist/
```

### Fichiers Publics (OK pour Git)
```
.env.example
src/
supabase/migrations/
README.md
```

## 📝 Scripts NPM

```json
{
  "dev": "vite",                    // Développement
  "build": "vite build",            // Production
  "preview": "vite preview",        // Prévisualiser build
  "lint": "eslint ."                // Vérifier le code
}
```

## 🎨 Thème et Design

### Couleurs Principales
```css
Primary Green: #22AA66
Primary Dark:  #1a8850
Primary Light: #2bc47a
White:         #FFFFFF
Gray:          #F9FAFB
```

### Composants UI
- Cards avec ombres légères
- Boutons arrondis
- Inputs avec focus ring vert
- Tables responsives
- Graphiques colorés

---

**Structure créée pour RIMATEL SA - Système de Ticketing**

