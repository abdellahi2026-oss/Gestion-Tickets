# 📚 RIMATEL Ticketing - Index de Documentation

Bienvenue dans le système de ticketing RIMATEL SA ! Ce fichier vous guide vers la documentation appropriée selon vos besoins.

## 🎯 Je veux...

### 🚀 Démarrer Rapidement
→ **[QUICK_START.md](QUICK_START.md)**
- Installation en 5 minutes
- Configuration Supabase rapide
- Premier lancement

### 📖 Comprendre le Projet
→ **[README.md](README.md)**
- Vue d'ensemble complète
- Fonctionnalités détaillées
- Architecture du système
- Guide d'installation complet

### 🔧 Installer et Configurer
→ **[SETUP_GUIDE.md](SETUP_GUIDE.md)**
- Guide pas à pas détaillé
- Configuration Supabase
- Déploiement sur différentes plateformes
- Résolution de problèmes

### 📁 Comprendre la Structure
→ **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**
- Organisation des fichiers
- Description des dossiers
- Schéma de base de données
- Flux de données

### 🔌 Utiliser l'API
→ **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**
- Endpoints Supabase
- Exemples de requêtes
- Schéma de données
- Règles de validation

### 🛠️ Maintenir l'Application
→ **[MAINTENANCE.md](MAINTENANCE.md)**
- Tâches de maintenance
- Résolution de problèmes
- Optimisation
- Sécurité

### ❓ Trouver des Réponses
→ **[FAQ.md](FAQ.md)**
- Questions fréquentes
- Solutions aux problèmes courants
- Astuces et bonnes pratiques

### 📸 Voir l'Interface
→ **[SCREENSHOTS.md](SCREENSHOTS.md)**
- Mockups de l'interface
- Aperçu visuel
- Design et couleurs

### 💼 Présentation Direction
→ **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)**
- Résumé exécutif
- ROI et bénéfices
- Roadmap

## 📋 Documentation par Rôle

### 👨‍💼 Chef de Projet
Lire dans l'ordre :
1. [README.md](README.md) - Vue d'ensemble
2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture
3. [MAINTENANCE.md](MAINTENANCE.md) - Gestion

### 👨‍💻 Développeur
Lire dans l'ordre :
1. [QUICK_START.md](QUICK_START.md) - Démarrage rapide
2. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Installation détaillée
3. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API
4. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Structure

### 🔧 Administrateur Système
Lire dans l'ordre :
1. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Déploiement
2. [MAINTENANCE.md](MAINTENANCE.md) - Maintenance
3. [README.md](README.md) - Configuration

### 👤 Utilisateur Final
Lire :
1. [README.md](README.md) - Section "Utilisation"

## 🗂️ Fichiers Importants

### Configuration
- `package.json` - Dépendances npm
- `vite.config.js` - Configuration Vite
- `tailwind.config.js` - Thème et couleurs
- `.env.example` - Variables d'environnement

### Scripts
- `setup.sh` - Installation Linux/macOS
- `setup.ps1` - Installation Windows

### Déploiement
- `Dockerfile` - Image Docker
- `render.yaml` - Render.com
- `railway.json` - Railway.app
- `nginx.conf` - Configuration Nginx

### Base de Données
- `supabase/migrations/001_initial_schema.sql` - Schéma
- `supabase/migrations/002_seed_data.sql` - Données
- `supabase/migrations/003_rls_policies.sql` - Sécurité
- `supabase/functions/check-late-tickets.sql` - Fonction automatique

## 🎓 Tutoriels Rapides

### Créer un Nouveau Ticket
```javascript
// 1. Valider le numéro d'abonné (DAB + 1-6 chiffres)
const subscriberNumber = 'DAB12345'

// 2. Vérifier les doublons
const { data: existing } = await supabase
  .from('tickets')
  .select('id')
  .eq('subscriber_number', subscriberNumber)
  .neq('status', 'fermé')

if (existing.length > 0) {
  throw new Error('Ticket ouvert existe déjà')
}

// 3. Créer le ticket
const { data, error } = await supabase
  .from('tickets')
  .insert([{
    ticket_number: generateTicketNumber(),
    subscriber_number: subscriberNumber,
    // ... autres champs
    status: 'nouveau'
  }])
```

### Changer le Statut d'un Ticket
```javascript
const { error } = await supabase
  .from('tickets')
  .update({ 
    status: 'en_cours',
    updated_at: new Date().toISOString()
  })
  .eq('id', ticketId)

// Ajouter à l'historique
await supabase.from('ticket_history').insert({
  ticket_id: ticketId,
  action: 'status_change',
  to_status: 'en_cours'
})
```

### Obtenir des Statistiques
```javascript
const { data: tickets } = await supabase
  .from('tickets')
  .select('*')

const stats = {
  total: tickets.length,
  open: tickets.filter(t => t.status !== 'fermé').length,
  closed: tickets.filter(t => t.status === 'fermé').length,
  late: tickets.filter(t => t.status === 'en_retard').length
}
```

## 🔍 Recherche Rapide

### Commandes Utiles

```bash
# Développement
npm run dev              # Lancer en mode dev
npm run build            # Build production
npm run preview          # Prévisualiser build

# Installation
npm install              # Installer dépendances
./setup.sh              # Installation auto (Linux/Mac)
.\setup.ps1             # Installation auto (Windows)

# Déploiement
docker build -t rimatel . # Build Docker
vercel                   # Déployer sur Vercel
```

### Requêtes SQL Utiles

```sql
-- Tickets en retard
SELECT * FROM tickets WHERE status = 'en_retard';

-- Statistiques par wilaya
SELECT w.name_fr, COUNT(t.id) 
FROM tickets t 
JOIN wilayas w ON t.wilaya_code = w.code 
GROUP BY w.name_fr;

-- Connexions échouées
SELECT * FROM login_history 
WHERE success = false 
ORDER BY attempted_at DESC;
```

## 📞 Support

### Problèmes Courants
Consultez [SETUP_GUIDE.md](SETUP_GUIDE.md) section "Dépannage"

### Bugs et Fonctionnalités
Créez une issue sur le repository Git

### Questions
Consultez d'abord la documentation appropriée ci-dessus

## 🎨 Ressources

### Design
- Couleur principale : `#22AA66` (Vert RIMATEL)
- Logo : `/public/logo.svg` ou `/public/logo.png`
- Thème : Tailwind CSS configuré

### Traductions
- Français : `src/i18n/locales/fr.json`
- Arabe : `src/i18n/locales/ar.json`
- Anglais : `src/i18n/locales/en.json`

### Composants
- Layout : `src/components/Layout.jsx`
- Pages : `src/pages/*.jsx`

## 📊 Métriques du Projet

- **Langage** : JavaScript (React)
- **Framework** : React 18 + Vite
- **Backend** : Supabase (PostgreSQL)
- **Styling** : Tailwind CSS
- **i18n** : i18next (FR/AR/EN)
- **Charts** : Chart.js
- **Auth** : Supabase Auth (JWT)

## 🗺️ Roadmap

### Version 1.0 (Actuelle)
- ✅ Gestion complète des tickets
- ✅ Tableau de bord avec graphiques
- ✅ Support multilingue
- ✅ Authentification sécurisée

### Version 1.1 (Futur)
- [ ] Notifications email automatiques
- [ ] Export PDF des tickets
- [ ] Gestion des utilisateurs avancée
- [ ] Rapports personnalisés

### Version 2.0 (Futur)
- [ ] Application mobile
- [ ] Chat en temps réel
- [ ] Intégration WhatsApp
- [ ] Analytics avancés

## 📄 Licence

© 2024 RIMATEL SA - Tous droits réservés

---

**Développé avec ❤️ pour RIMATEL SA** 🇲🇷

Pour toute question, consultez la documentation appropriée ci-dessus ou contactez l'équipe technique.

