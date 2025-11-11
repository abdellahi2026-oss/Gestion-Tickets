# ❓ FAQ - RIMATEL Ticketing System

## 📋 Questions Générales

### Qu'est-ce que RIMATEL Ticketing ?

RIMATEL Ticketing est un système complet de gestion de tickets développé spécifiquement pour RIMATEL SA. Il permet de :
- Créer et suivre des tickets de support client
- Gérer les problèmes techniques des abonnés
- Analyser les statistiques par région et service
- Collaborer en équipe avec un historique complet

### Quelles sont les technologies utilisées ?

- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth)
- **Graphiques** : Chart.js
- **i18n** : i18next (FR/AR/EN)

### Est-ce gratuit ?

Le code est propriétaire de RIMATEL SA. Pour les coûts :
- **Développement** : Gratuit (code fourni)
- **Hébergement** : 
  - Supabase : Gratuit jusqu'à 500MB + 2GB bande passante
  - Render/Railway : Gratuit avec limitations
  - Production : ~10-20$/mois recommandé

---

## 🚀 Installation et Configuration

### Comment installer l'application ?

**Méthode rapide (5 minutes) :**
```bash
cd rimatel-app
npm install
cp .env.example .env
# Éditer .env avec vos credentials Supabase
npm run dev
```

Consultez [QUICK_START.md](QUICK_START.md) pour plus de détails.

### Où obtenir les credentials Supabase ?

1. Créez un compte sur https://supabase.com
2. Créez un nouveau projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Les migrations SQL ne fonctionnent pas

**Solutions :**
1. Vérifiez que vous êtes dans le bon projet Supabase
2. Exécutez les migrations dans l'ordre :
   - `001_initial_schema.sql`
   - `002_seed_data.sql`
   - `003_rls_policies.sql`
3. Vérifiez les erreurs dans la console SQL Editor
4. Assurez-vous d'avoir les permissions nécessaires

### Comment créer le premier utilisateur ?

**Via Supabase Dashboard :**
1. **Authentication** → **Users** → **Add user**
2. Email : `admin@rimatel.mr`
3. Password : `admin123`
4. ✅ Cochez "Auto Confirm User"

**⚠️ Important** : Changez ce mot de passe en production !

---

## 🎫 Utilisation des Tickets

### Comment créer un ticket ?

1. Cliquez sur **"+ Nouveau Ticket"**
2. Remplissez le formulaire :
   - Numéro d'abonné : `DAB` + 1-6 chiffres
   - Nom du client
   - Téléphone : 6-15 chiffres
   - Wilaya (obligatoire)
   - Région (si Nouakchott)
   - Type d'abonnement
   - Description du problème
3. Cliquez sur **"Créer le ticket"**

### Pourquoi je ne peux pas créer un ticket ?

**Raisons possibles :**
1. **Format du numéro d'abonné invalide**
   - Doit être `DAB` suivi de 1 à 6 chiffres
   - Exemples valides : `DAB1`, `DAB123`, `DAB123456`
   - Exemples invalides : `DAB`, `DAB1234567`, `123456`

2. **Ticket ouvert existant**
   - Un seul ticket ouvert par numéro d'abonné
   - Fermez le ticket existant d'abord

3. **Champs obligatoires manquants**
   - Tous les champs avec * sont obligatoires
   - La région est obligatoire pour Nouakchott (NKC)

### Comment changer le statut d'un ticket ?

**Méthode 1 : Depuis la liste**
- Cliquez sur le menu déroulant du statut
- Sélectionnez le nouveau statut
- Le changement est immédiat

**Méthode 2 : Depuis le détail**
- Ouvrez le ticket
- Changez le statut
- Sauvegardez

### Quels sont les différents statuts ?

| Statut | Signification | Utilisation |
|--------|---------------|-------------|
| **Nouveau** | Ticket créé | Automatique à la création |
| **Assigné** | Envoyé à e-billing | Pour vérification |
| **Paiement** | Problème financier | Facture impayée |
| **En cours** | Intervention technique | Technicien sur place |
| **Injoignable** | Client non joignable | Impossible de contacter |
| **En retard** | > 24h sans résolution | Automatique |
| **Fermé** | Problème résolu | Ticket terminé |

### Comment fonctionne le statut "En retard" ?

Un ticket passe automatiquement en "En retard" si :
- Il est ouvert depuis plus de 24 heures
- Il n'est pas fermé

**Configuration :**
Exécutez la fonction SQL périodiquement :
```sql
SELECT mark_late_tickets();
```

Voir [SETUP_GUIDE.md](SETUP_GUIDE.md) pour configurer l'automatisation.

---

## 🌍 Multilingue

### Comment changer la langue ?

**Dans l'application :**
- Cliquez sur le sélecteur de langue (FR/AR/EN)
- La langue change immédiatement
- Le choix est sauvegardé dans le navigateur

### Comment ajouter une nouvelle langue ?

1. Créez `src/i18n/locales/xx.json` (xx = code langue)
2. Copiez le contenu de `fr.json`
3. Traduisez toutes les clés
4. Ajoutez dans `src/i18n/config.js` :
```javascript
import xx from './locales/xx.json'

resources: {
  fr: { translation: fr },
  ar: { translation: ar },
  en: { translation: en },
  xx: { translation: xx }  // Nouvelle langue
}
```

### L'arabe ne s'affiche pas correctement

**Vérifications :**
1. Le texte doit être de droite à gauche (RTL)
2. Vérifiez que `document.documentElement.dir = 'rtl'` est appliqué
3. Les polices doivent supporter l'arabe
4. Testez dans différents navigateurs

---

## 📊 Statistiques et Graphiques

### Les graphiques ne s'affichent pas

**Solutions :**
1. Vérifiez que Chart.js est installé :
```bash
npm list chart.js react-chartjs-2
```

2. Vérifiez qu'il y a des données :
```javascript
console.log('Data:', wilayaData)
```

3. Réinstallez les dépendances :
```bash
npm install chart.js react-chartjs-2
```

### Comment personnaliser les graphiques ?

Modifiez `src/pages/Dashboard.jsx` :

```javascript
const wilayaChartData = {
  labels: wilayaData.map(([name]) => name),
  datasets: [{
    label: t('dashboard.byWilaya'),
    data: wilayaData.map(([, count]) => count),
    backgroundColor: '#22AA66',  // Changez la couleur ici
  }]
}
```

---

## 🔒 Sécurité

### Comment sécuriser l'application ?

1. **Changez les mots de passe par défaut**
2. **Activez 2FA sur Supabase**
3. **Utilisez HTTPS en production**
4. **Limitez les permissions RLS**
5. **Surveillez les logs de connexion**

Consultez [SECURITY.md](SECURITY.md) pour plus de détails.

### Comment gérer les utilisateurs ?

**Actuellement :**
- Création manuelle via Supabase Dashboard
- **Authentication** → **Users** → **Add user**

**Futur (v1.1) :**
- Interface d'administration
- Gestion des rôles
- Permissions granulaires

---

## 🚀 Déploiement

### Quelle plateforme choisir ?

| Plateforme | Gratuit | Facile | Recommandé |
|------------|---------|--------|------------|
| **Render.com** | ✅ | ✅ | ⭐⭐⭐ |
| **Railway.app** | ✅ | ✅ | ⭐⭐⭐ |
| **Vercel** | ✅ | ✅ | ⭐⭐ |
| **Netlify** | ✅ | ✅ | ⭐⭐ |
| **Docker** | ❌ | ⚠️ | ⭐⭐⭐ |

**Recommandation** : Render.com pour la simplicité

### Le déploiement échoue

**Vérifications :**
1. Les variables d'environnement sont configurées
2. Le build local fonctionne (`npm run build`)
3. Les dépendances sont à jour
4. Le fichier de configuration existe (render.yaml, etc.)

**Logs :**
Consultez les logs de déploiement pour identifier l'erreur.

### Comment configurer un domaine personnalisé ?

**Sur Render.com :**
1. **Settings** → **Custom Domain**
2. Ajoutez votre domaine
3. Configurez les DNS selon les instructions
4. Attendez la propagation (24-48h)

---

## 🐛 Dépannage

### "Missing Supabase environment variables"

**Solution :**
```bash
# Vérifiez que .env existe
cat .env

# Vérifiez le contenu
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Redémarrez le serveur
npm run dev
```

### "Failed to fetch" lors de la connexion

**Solutions :**
1. Vérifiez l'URL Supabase dans `.env`
2. Vérifiez que les migrations SQL sont exécutées
3. Vérifiez que l'utilisateur existe
4. Vérifiez les RLS policies

### Les données ne s'affichent pas

**Checklist :**
- [ ] Migrations SQL exécutées
- [ ] RLS policies créées
- [ ] Utilisateur authentifié
- [ ] Données de test insérées
- [ ] Console du navigateur sans erreurs

### Erreur lors du build

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

---

## 💡 Astuces et Bonnes Pratiques

### Comment optimiser les performances ?

1. **Pagination** : Limitez les résultats
```javascript
.range(0, 49) // 50 premiers résultats
```

2. **Indexes** : Déjà créés dans les migrations

3. **Lazy Loading** : Chargez les composants à la demande

4. **Caching** : Utilisez React Query (futur)

### Comment sauvegarder les données ?

**Automatique (Supabase) :**
- Backups quotidiens automatiques
- Rétention : 7 jours (gratuit) / 30 jours (pro)

**Manuel :**
1. **Database** → **Backups**
2. **Download** pour sauvegarder localement

### Comment migrer vers un autre Supabase ?

1. Exportez les données de l'ancien projet
2. Créez un nouveau projet
3. Exécutez les migrations SQL
4. Importez les données
5. Mettez à jour `.env`

---

## 📞 Support

### Où trouver de l'aide ?

1. **Documentation** : Consultez les fichiers MD
2. **Issues** : Créez une issue sur GitHub
3. **Email** : support@rimatel.mr

### Comment signaler un bug ?

1. Vérifiez qu'il n'existe pas déjà
2. Créez une issue avec :
   - Description claire
   - Étapes pour reproduire
   - Captures d'écran
   - Environnement (OS, navigateur)

### Comment suggérer une fonctionnalité ?

1. Créez une issue "Feature Request"
2. Décrivez le besoin
3. Expliquez les bénéfices
4. Proposez une solution (optionnel)

---

**Dernière mise à jour** : 2024-01-XX

**Vous ne trouvez pas votre réponse ?** Consultez [INDEX.md](INDEX.md) pour naviguer dans la documentation complète.

