-- =====================================================
-- RIMATEL SA - Username Login & Phone Primary
-- Migration 005
-- =====================================================

-- =====================================================
-- 1. AJOUTER username À LA TABLE users
-- =====================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Créer un index pour la performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- =====================================================
-- 2. MODIFIER LA TABLE tickets - Rendre phone PRIMARY
-- =====================================================
-- Supprimer la contrainte NOT NULL de client_name
ALTER TABLE tickets 
ALTER COLUMN client_name DROP NOT NULL;

-- Ajouter un commentaire pour clarifier
COMMENT ON COLUMN tickets.client_name IS 'Nom du client (optionnel, phone est la clé primaire)';
COMMENT ON COLUMN tickets.phone IS 'Numéro de téléphone du client (identifiant principal)';

-- =====================================================
-- 3. CRÉER UNE VUE POUR LES TICKETS AVEC PHONE COMME ID
-- =====================================================
CREATE OR REPLACE VIEW tickets_by_phone AS
SELECT 
  t.*,
  w.name_fr as wilaya_name_fr,
  w.name_ar as wilaya_name_ar,
  r.name_fr as region_name_fr,
  r.name_ar as region_name_ar,
  u.full_name as created_by_name
FROM tickets t
LEFT JOIN wilayas w ON t.wilaya_code = w.code
LEFT JOIN regions r ON t.region_id = r.id
LEFT JOIN users u ON t.created_by = u.id;

-- =====================================================
-- 4. FONCTION POUR VÉRIFIER LES DOUBLONS PAR TÉLÉPHONE
-- =====================================================
CREATE OR REPLACE FUNCTION check_duplicate_ticket_by_phone(
  p_phone VARCHAR,
  p_subscription_type VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tickets 
    WHERE phone = p_phone 
    AND subscription_type = p_subscription_type
    AND status != 'fermé'
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. METTRE À JOUR L'UTILISATEUR ADMIN AVEC USERNAME
-- =====================================================
UPDATE users 
SET username = 'admin'
WHERE email = 'admin@rimatel.mr';

-- =====================================================
-- 6. CRÉER UNE TABLE POUR L'HISTORIQUE DES CONNEXIONS PAR USERNAME
-- =====================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50),
  email VARCHAR(255),
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- =====================================================
-- 7. RLS POUR login_attempts
-- =====================================================
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert login attempts"
  ON login_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 8. FONCTION POUR OBTENIR L'UTILISATEUR PAR USERNAME
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_by_username(p_username VARCHAR)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  username VARCHAR,
  full_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.username,
    u.full_name,
    u.role,
    u.is_active
  FROM users u
  WHERE u.username = p_username
  AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. TRIGGER POUR GÉNÉRER USERNAME AUTOMATIQUEMENT
-- =====================================================
CREATE OR REPLACE FUNCTION generate_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Si username n'est pas fourni, générer à partir de l'email
  IF NEW.username IS NULL THEN
    NEW.username := LOWER(SPLIT_PART(NEW.email, '@', 1));
    
    -- Si le username existe déjà, ajouter un numéro
    WHILE EXISTS (SELECT 1 FROM users WHERE username = NEW.username AND id != NEW.id) LOOP
      NEW.username := NEW.username || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_username
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_username();

-- =====================================================
-- TERMINÉ
-- =====================================================

