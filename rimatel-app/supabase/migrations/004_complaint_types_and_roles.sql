-- =====================================================
-- RIMATEL SA - Types de Réclamations et Rôles
-- Migration 004
-- =====================================================

-- =====================================================
-- 1. AJOUTER LA COLONNE complaint_type AUX TICKETS
-- =====================================================
ALTER TABLE tickets 
ADD COLUMN complaint_type VARCHAR(50);

-- =====================================================
-- 2. CRÉER LA TABLE DES TYPES DE RÉCLAMATIONS
-- =====================================================
CREATE TABLE complaint_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  name_en VARCHAR(100),
  applicable_to TEXT[], -- Array des types d'abonnement (SAWI, BLR, FTTH, LS/MPLS)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INSÉRER LES TYPES DE RÉCLAMATIONS
-- =====================================================
INSERT INTO complaint_types (code, name_fr, name_ar, name_en, applicable_to) VALUES
('CONNEXION_COUPEE', 'Connexion Coupée', 'انقطاع الاتصال', 'Connection Cut', ARRAY['SAWI', 'BLR', 'FTTH', 'LS/MPLS']),
('CONNEXION_FAIBLE', 'Connexion Faible', 'اتصال ضعيف', 'Weak Connection', ARRAY['SAWI', 'BLR', 'FTTH', 'LS/MPLS']),
('CONNEXION_INSTABLE', 'Connexion Instable', 'اتصال غير مستقر', 'Unstable Connection', ARRAY['SAWI', 'BLR', 'FTTH', 'LS/MPLS']),
('PROBLEME_CABLE', 'Problème Câble', 'مشكلة في الكابل', 'Cable Problem', ARRAY['FTTH', 'LS/MPLS']),
('PROBLEME_ROUTEUR', 'Problème Routeur', 'مشكلة في الراوتر', 'Router Problem', ARRAY['SAWI', 'BLR', 'FTTH', 'LS/MPLS']),
('PROBLEME_ANTENNE', 'Problème Antenne', 'مشكلة في الهوائي', 'Antenna Problem', ARRAY['SAWI', 'BLR']);

-- =====================================================
-- 4. MODIFIER LA TABLE USERS POUR LES RÔLES
-- =====================================================
-- Ajouter la colonne role si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
  END IF;
END $$;

-- Ajouter la contrainte pour les rôles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'user', 'technicien'));

-- =====================================================
-- 5. CRÉER LA TABLE DES SERVICES ASSIGNÉS AUX TECHNICIENS
-- =====================================================
CREATE TABLE IF NOT EXISTS technician_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('SAWI', 'LTE', 'BLR', 'LS/MPLS', 'FTTH')),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_type)
);

-- =====================================================
-- 6. METTRE À JOUR LE TYPE D'ABONNEMENT
-- =====================================================
-- Ajouter LTE aux types d'abonnement
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_subscription_type_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_subscription_type_check 
  CHECK (subscription_type IN ('SAWI', 'LTE', 'BLR', 'FTTH', 'LS/MPLS'));

-- =====================================================
-- 7. INDEXES POUR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_technician_services_user ON technician_services(user_id);
CREATE INDEX IF NOT EXISTS idx_technician_services_service ON technician_services(service_type);
CREATE INDEX IF NOT EXISTS idx_tickets_complaint_type ON tickets(complaint_type);

-- =====================================================
-- 8. RLS POLICIES POUR LES NOUVELLES TABLES
-- =====================================================

-- Complaint Types - Lecture publique
ALTER TABLE complaint_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Complaint types are viewable by everyone"
  ON complaint_types FOR SELECT
  USING (true);

-- Technician Services - Admins peuvent tout faire
ALTER TABLE technician_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage technician services"
  ON technician_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Technicians can view their own services"
  ON technician_services FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- 9. FONCTION POUR VÉRIFIER SI UN TECHNICIEN PEUT VOIR UN TICKET
-- =====================================================
CREATE OR REPLACE FUNCTION can_technician_view_ticket(ticket_service_type VARCHAR, technician_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM technician_services 
    WHERE user_id = technician_id 
    AND service_type = ticket_service_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. METTRE À JOUR LES RLS POLICIES DES TICKETS
-- =====================================================

-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Authenticated users can view all tickets" ON tickets;

-- Nouvelle policy : 
-- - Admin voit tout
-- - User voit tout
-- - Technicien voit seulement ses services assignés
CREATE POLICY "Users can view tickets based on role"
  ON tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        users.role IN ('admin', 'user')
        OR (
          users.role = 'technicien' 
          AND can_technician_view_ticket(tickets.subscription_type, auth.uid())
        )
      )
    )
  );

-- =====================================================
-- 11. CRÉER UN ADMIN PAR DÉFAUT
-- =====================================================
-- Mettre à jour l'utilisateur existant ou en créer un nouveau
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@rimatel.mr',
  '$2a$10$rKvVJKhPqZXqJqYqJqYqJeO8YqYqYqYqYqYqYqYqYqYqYqYqYqYqY',
  'Administrateur RIMATEL',
  'admin',
  true
)
ON CONFLICT (email) 
DO UPDATE SET role = 'admin';

-- =====================================================
-- TERMINÉ
-- =====================================================

