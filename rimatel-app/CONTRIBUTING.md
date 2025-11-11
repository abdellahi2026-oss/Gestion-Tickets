# 🤝 Guide de Contribution - RIMATEL Ticketing

Merci de votre intérêt pour contribuer au système de ticketing RIMATEL SA !

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Standards de Code](#standards-de-code)
- [Processus de Pull Request](#processus-de-pull-request)
- [Conventions de Commit](#conventions-de-commit)
- [Structure des Branches](#structure-des-branches)

## 📜 Code de Conduite

### Nos Engagements

- Respecter tous les contributeurs
- Accepter les critiques constructives
- Se concentrer sur ce qui est meilleur pour la communauté
- Faire preuve d'empathie envers les autres

### Comportements Inacceptables

- Langage ou images à caractère sexuel
- Trolling, commentaires insultants
- Harcèlement public ou privé
- Publication d'informations privées sans permission

## 🚀 Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec le template "Bug Report"
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Captures d'écran si applicable
   - Environnement (OS, navigateur, version)

### Suggérer une Fonctionnalité

1. Vérifiez que la fonctionnalité n'existe pas déjà
2. Créez une issue avec le template "Feature Request"
3. Incluez :
   - Description détaillée
   - Cas d'utilisation
   - Bénéfices attendus
   - Mockups si possible

### Contribuer au Code

1. Fork le repository
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m 'feat: ajouter ma fonctionnalité'`)
4. Push vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## 💻 Standards de Code

### JavaScript/React

```javascript
// ✅ BON
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert([formData])
    
    if (error) throw error
    navigate('/tickets')
  } catch (error) {
    console.error('Error:', error)
  }
}

// ❌ MAUVAIS
const handleSubmit = async (e) => {
  e.preventDefault()
  const {data,error}=await supabase.from('tickets').insert([formData])
  if(error)throw error
  navigate('/tickets')
}
```

### Conventions de Nommage

```javascript
// Composants : PascalCase
const TicketList = () => { }

// Fonctions : camelCase
const handleClick = () => { }

// Constantes : UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com'

// Variables : camelCase
const userName = 'John'
```

### Structure des Composants

```javascript
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function MyComponent() {
  const { t } = useTranslation()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Logic here
  }

  return (
    <div>
      {/* JSX here */}
    </div>
  )
}
```

### CSS/Tailwind

```jsx
// ✅ BON - Classes organisées
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// ❌ MAUVAIS - Classes désorganisées
<div className="p-4 flex shadow-md bg-white rounded-lg items-center justify-between">
```

### SQL

```sql
-- ✅ BON
SELECT 
  t.id,
  t.ticket_number,
  w.name_fr
FROM tickets t
JOIN wilayas w ON t.wilaya_code = w.code
WHERE t.status = 'nouveau'
ORDER BY t.created_at DESC;

-- ❌ MAUVAIS
select t.id,t.ticket_number,w.name_fr from tickets t join wilayas w on t.wilaya_code=w.code where t.status='nouveau' order by t.created_at desc;
```

## 🔄 Processus de Pull Request

### Checklist Avant Soumission

- [ ] Le code suit les standards du projet
- [ ] Les tests passent (`npm run lint`)
- [ ] Le build fonctionne (`npm run build`)
- [ ] La documentation est à jour
- [ ] Les commits suivent les conventions
- [ ] Pas de conflits avec `main`

### Template de Pull Request

```markdown
## Description
Brève description des changements

## Type de Changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests manuels effectués

## Captures d'écran
(Si applicable)

## Checklist
- [ ] Code testé localement
- [ ] Documentation mise à jour
- [ ] Pas de warnings ESLint
```

### Processus de Review

1. Au moins 1 approbation requise
2. Tous les commentaires doivent être résolus
3. Les tests CI/CD doivent passer
4. Merge par un mainteneur

## 📝 Conventions de Commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/)

### Format

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, point-virgules manquants, etc.
- `refactor`: Refactoring du code
- `perf`: Amélioration des performances
- `test`: Ajout de tests
- `chore`: Maintenance, dépendances, etc.

### Exemples

```bash
# Nouvelle fonctionnalité
git commit -m "feat(tickets): ajouter filtre par date"

# Correction de bug
git commit -m "fix(auth): corriger la validation du mot de passe"

# Documentation
git commit -m "docs(readme): mettre à jour les instructions d'installation"

# Refactoring
git commit -m "refactor(dashboard): optimiser le chargement des graphiques"

# Breaking change
git commit -m "feat(api)!: changer le format de réponse des tickets

BREAKING CHANGE: Le format de réponse a changé de { data } à { tickets }"
```

## 🌿 Structure des Branches

### Branches Principales

- `main` : Code de production
- `develop` : Code de développement

### Branches de Fonctionnalités

```bash
feature/nom-de-la-fonctionnalite
fix/nom-du-bug
docs/nom-de-la-doc
refactor/nom-du-refactor
```

### Workflow

```bash
# 1. Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/ma-fonctionnalite

# 2. Développer et committer
git add .
git commit -m "feat: ajouter ma fonctionnalité"

# 3. Push et créer PR
git push origin feature/ma-fonctionnalite
# Créer PR vers develop sur GitHub

# 4. Après merge, supprimer la branche
git branch -d feature/ma-fonctionnalite
```

## 🧪 Tests

### Lancer les Tests

```bash
# Linter
npm run lint

# Build
npm run build

# Preview
npm run preview
```

### Écrire des Tests

```javascript
// À venir : Tests unitaires avec Vitest
```

## 📚 Documentation

### Mettre à Jour la Documentation

Lors de l'ajout de fonctionnalités, mettez à jour :

- `README.md` - Si changement majeur
- `API_DOCUMENTATION.md` - Si changement API
- `CHANGELOG.md` - Toujours
- Commentaires dans le code

### Style de Documentation

```javascript
/**
 * Crée un nouveau ticket dans la base de données
 * 
 * @param {Object} ticketData - Données du ticket
 * @param {string} ticketData.subscriber_number - Numéro d'abonné (DAB + 1-6 chiffres)
 * @param {string} ticketData.client_name - Nom du client
 * @returns {Promise<Object>} Le ticket créé
 * @throws {Error} Si le numéro d'abonné est invalide
 */
async function createTicket(ticketData) {
  // Implementation
}
```

## 🎨 Design

### Ajouter des Composants UI

1. Suivre le design system existant
2. Utiliser Tailwind CSS
3. Respecter la palette de couleurs RIMATEL
4. Assurer la responsivité
5. Tester sur mobile

### Palette de Couleurs

```javascript
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: '#22AA66',
    dark: '#1a8850',
    light: '#2bc47a'
  }
}
```

## 🌍 Internationalisation

### Ajouter des Traductions

```json
// src/i18n/locales/fr.json
{
  "nouvelle_cle": "Texte en français"
}

// src/i18n/locales/ar.json
{
  "nouvelle_cle": "النص بالعربية"
}

// src/i18n/locales/en.json
{
  "nouvelle_cle": "Text in English"
}
```

### Utiliser les Traductions

```javascript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return <h1>{t('nouvelle_cle')}</h1>
}
```

## 🔒 Sécurité

### Signaler une Vulnérabilité

**NE PAS** créer d'issue publique pour les vulnérabilités de sécurité.

Contactez directement : security@rimatel.mr

## 📞 Questions ?

- Consultez la [documentation](README.md)
- Créez une [issue](../../issues)
- Contactez l'équipe : dev@rimatel.mr

## 🙏 Remerciements

Merci à tous les contributeurs qui aident à améliorer ce projet !

---

**RIMATEL SA** - Système de Ticketing

