# 🔒 Politique de Sécurité - RIMATEL Ticketing

## 🛡️ Versions Supportées

| Version | Supportée          |
| ------- | ------------------ |
| 1.0.x   | ✅ Oui            |
| < 1.0   | ❌ Non            |

## 🚨 Signaler une Vulnérabilité

### ⚠️ IMPORTANT

**NE PAS** créer d'issue publique pour les vulnérabilités de sécurité.

### Processus de Signalement

1. **Email** : Envoyez un email à `security@rimatel.mr`
2. **Objet** : "SECURITY: [Description courte]"
3. **Contenu** :
   - Description détaillée de la vulnérabilité
   - Étapes pour reproduire
   - Impact potentiel
   - Suggestions de correction (si possible)

### Délais de Réponse

- **Accusé de réception** : 24 heures
- **Évaluation initiale** : 72 heures
- **Correction** : Selon la gravité (1-30 jours)

### Divulgation Responsable

Nous suivons le principe de divulgation responsable :
- Nous vous tiendrons informé de l'avancement
- Nous vous créditerons (si vous le souhaitez)
- Nous publierons un avis de sécurité après correction

## 🔐 Mesures de Sécurité Implémentées

### Authentification

✅ **JWT avec Supabase Auth**
- Tokens sécurisés
- Expiration automatique
- Refresh tokens

✅ **Historique de Connexion**
- Enregistrement de toutes les tentatives
- Tracking des IP
- Détection des échecs multiples

### Base de Données

✅ **Row Level Security (RLS)**
```sql
-- Exemple de policy
CREATE POLICY "Users can only view their tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());
```

✅ **Validation des Données**
- Contraintes CHECK sur les colonnes
- Foreign keys
- Types de données stricts

✅ **Indexes de Performance**
- Optimisation des requêtes
- Prévention des attaques par timing

### Frontend

✅ **Validation Côté Client**
```javascript
// Validation stricte des entrées
const subscriberRegex = /^DAB\d{1,6}$/
const phoneRegex = /^\+?\d{6,15}$/
```

✅ **Protection XSS**
- React échappe automatiquement les données
- Pas de `dangerouslySetInnerHTML`

✅ **Protection CSRF**
- Tokens JWT dans les headers
- SameSite cookies

### Backend (Supabase)

✅ **HTTPS Obligatoire**
- Toutes les communications chiffrées
- TLS 1.2+

✅ **Rate Limiting**
- Limitation des requêtes API
- Protection contre les attaques DDoS

✅ **Secrets Management**
- Variables d'environnement
- Pas de secrets dans le code

## 🔍 Audit de Sécurité

### Checklist de Sécurité

#### Variables d'Environnement
- [ ] `.env` dans `.gitignore`
- [ ] Pas de secrets dans le code
- [ ] `.env.example` sans valeurs réelles

#### Authentification
- [ ] Mots de passe hashés (bcrypt)
- [ ] JWT avec expiration
- [ ] Logout fonctionnel
- [ ] Session timeout

#### Base de Données
- [ ] RLS activé sur toutes les tables
- [ ] Policies testées
- [ ] Pas de requêtes SQL directes depuis le frontend
- [ ] Validation des entrées

#### Frontend
- [ ] Validation des formulaires
- [ ] Échappement des données utilisateur
- [ ] Pas de `eval()` ou `Function()`
- [ ] Headers de sécurité

#### Déploiement
- [ ] HTTPS activé
- [ ] Headers de sécurité (CSP, X-Frame-Options, etc.)
- [ ] Logs de sécurité activés
- [ ] Backups réguliers

### Commandes d'Audit

```bash
# Vérifier les dépendances vulnérables
npm audit

# Corriger automatiquement
npm audit fix

# Vérifier les secrets dans le code
git secrets --scan

# Linter de sécurité
npm run lint
```

## 🚫 Vulnérabilités Connues

### Aucune Actuellement

Dernière mise à jour : 2024-01-XX

## 🛠️ Bonnes Pratiques

### Pour les Développeurs

#### 1. Ne JAMAIS Commiter de Secrets

```bash
# ❌ MAUVAIS
const API_KEY = "sk_live_123456789"

# ✅ BON
const API_KEY = import.meta.env.VITE_API_KEY
```

#### 2. Valider TOUTES les Entrées

```javascript
// ✅ BON
const validateSubscriberNumber = (number) => {
  const regex = /^DAB\d{1,6}$/
  if (!regex.test(number)) {
    throw new Error('Invalid subscriber number')
  }
  return number
}
```

#### 3. Utiliser les Prepared Statements

```javascript
// ✅ BON - Supabase le fait automatiquement
const { data } = await supabase
  .from('tickets')
  .select('*')
  .eq('id', ticketId)

// ❌ MAUVAIS - SQL injection possible
const query = `SELECT * FROM tickets WHERE id = '${ticketId}'`
```

#### 4. Limiter les Permissions

```sql
-- ✅ BON - Permissions minimales
CREATE POLICY "Users can only update their own tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- ❌ MAUVAIS - Trop permissif
CREATE POLICY "Anyone can update tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (true);
```

### Pour les Administrateurs

#### 1. Changer les Mots de Passe par Défaut

```sql
-- Supprimer l'utilisateur de test en production
DELETE FROM auth.users WHERE email = 'admin@rimatel.mr';
```

#### 2. Activer 2FA

Dans Supabase Dashboard :
- Account → Security → Enable 2FA

#### 3. Surveiller les Logs

```sql
-- Vérifier les tentatives de connexion échouées
SELECT * FROM login_history 
WHERE success = false 
AND attempted_at > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) > 5;
```

#### 4. Backups Réguliers

- Backups automatiques activés dans Supabase
- Télécharger des backups manuels mensuellement
- Tester la restauration

## 🔒 Configuration de Sécurité

### Headers HTTP (Nginx)

```nginx
# nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### Supabase RLS

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Créer des policies restrictives
CREATE POLICY "Authenticated users only"
  ON tickets FOR ALL
  TO authenticated
  USING (true);
```

### Variables d'Environnement

```bash
# .env (NE PAS COMMITER)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# .env.example (OK pour Git)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📊 Monitoring de Sécurité

### Métriques à Surveiller

1. **Tentatives de Connexion Échouées**
   - Seuil : > 5 par heure pour un même email
   - Action : Bloquer temporairement

2. **Requêtes API Anormales**
   - Seuil : > 100 requêtes/minute
   - Action : Rate limiting

3. **Modifications de Données Sensibles**
   - Toutes les modifications de tickets
   - Changements de statut
   - Suppressions

### Alertes

```sql
-- Créer une fonction pour alerter
CREATE OR REPLACE FUNCTION alert_suspicious_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM login_history 
      WHERE email = NEW.email 
      AND success = false 
      AND attempted_at > NOW() - INTERVAL '1 hour') > 5 THEN
    -- Envoyer une alerte
    RAISE NOTICE 'Suspicious activity detected for %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 🆘 En Cas d'Incident

### Procédure d'Urgence

1. **Isoler** : Désactiver l'accès si nécessaire
2. **Évaluer** : Déterminer l'étendue de la compromission
3. **Contenir** : Limiter les dégâts
4. **Corriger** : Appliquer un patch
5. **Communiquer** : Informer les utilisateurs si nécessaire
6. **Analyser** : Post-mortem pour éviter la récurrence

### Contacts d'Urgence

- **Sécurité** : security@rimatel.mr
- **Technique** : tech@rimatel.mr
- **Direction** : admin@rimatel.mr

## 📚 Ressources

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Security](https://react.dev/learn/security)

### Outils

- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP ZAP](https://www.zaproxy.org/)

## 📝 Changelog de Sécurité

### Version 1.0.0 (2024-01-XX)

- ✅ Implémentation RLS
- ✅ Authentification JWT
- ✅ Validation des entrées
- ✅ Headers de sécurité
- ✅ Historique de connexion

---

**Dernière mise à jour** : 2024-01-XX

**Contact Sécurité** : security@rimatel.mr

**RIMATEL SA** - Nous prenons la sécurité au sérieux.

