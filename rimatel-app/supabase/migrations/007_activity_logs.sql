-- =====================================================
-- RIMATEL SA - Activity Logs System
-- Migration 007
-- =====================================================

-- 1. إنشاء جدول activity_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إنشاء indexes للأداء
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 3. إنشاء enum للـ actions (اختياري)
-- =====================================================
COMMENT ON COLUMN activity_logs.action IS 'Actions: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW, EXPORT, etc.';
COMMENT ON COLUMN activity_logs.entity_type IS 'Entity types: ticket, user, technician_service, etc.';

-- 4. RLS Policies
-- =====================================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Users can view their own logs
CREATE POLICY "Users can view own logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Anyone authenticated can insert logs
CREATE POLICY "Authenticated users can insert logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Service role can do anything
CREATE POLICY "Service role full access to logs"
  ON activity_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. دالة لتسجيل النشاط
-- =====================================================
CREATE OR REPLACE FUNCTION log_activity(
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name VARCHAR DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
  v_user_name VARCHAR;
  v_user_email VARCHAR;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT full_name, email INTO v_user_name, v_user_email
    FROM users
    WHERE id = v_user_id;
  END IF;
  
  -- Insert log
  INSERT INTO activity_logs (
    user_id,
    user_name,
    user_email,
    action,
    entity_type,
    entity_id,
    entity_name,
    old_values,
    new_values,
    description
  ) VALUES (
    v_user_id,
    v_user_name,
    v_user_email,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_old_values,
    p_new_values,
    p_description
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Triggers لتسجيل التعديلات تلقائياً
-- =====================================================

-- Trigger للـ tickets
CREATE OR REPLACE FUNCTION log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_activity(
      'CREATE',
      'ticket',
      NEW.id,
      NEW.ticket_number,
      NULL,
      to_jsonb(NEW),
      'Ticket créé: ' || NEW.ticket_number
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_activity(
      'UPDATE',
      'ticket',
      NEW.id,
      NEW.ticket_number,
      to_jsonb(OLD),
      to_jsonb(NEW),
      'Ticket modifié: ' || NEW.ticket_number
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_activity(
      'DELETE',
      'ticket',
      OLD.id,
      OLD.ticket_number,
      to_jsonb(OLD),
      NULL,
      'Ticket supprimé: ' || OLD.ticket_number
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_ticket_changes ON tickets;
CREATE TRIGGER trigger_log_ticket_changes
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_changes();

-- Trigger للـ users
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_activity(
      'CREATE',
      'user',
      NEW.id,
      NEW.full_name,
      NULL,
      jsonb_build_object(
        'email', NEW.email,
        'role', NEW.role,
        'is_active', NEW.is_active
      ),
      'Utilisateur créé: ' || NEW.full_name
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_activity(
      'UPDATE',
      'user',
      NEW.id,
      NEW.full_name,
      jsonb_build_object(
        'email', OLD.email,
        'role', OLD.role,
        'is_active', OLD.is_active
      ),
      jsonb_build_object(
        'email', NEW.email,
        'role', NEW.role,
        'is_active', NEW.is_active
      ),
      'Utilisateur modifié: ' || NEW.full_name
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_activity(
      'DELETE',
      'user',
      OLD.id,
      OLD.full_name,
      jsonb_build_object(
        'email', OLD.email,
        'role', OLD.role
      ),
      NULL,
      'Utilisateur supprimé: ' || OLD.full_name
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_user_changes ON users;
CREATE TRIGGER trigger_log_user_changes
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_changes();

-- 7. Vue لعرض الـ logs بشكل مفهوم
-- =====================================================
CREATE OR REPLACE VIEW activity_logs_view AS
SELECT 
  al.id,
  al.user_name,
  al.user_email,
  al.action,
  al.entity_type,
  al.entity_name,
  al.description,
  al.created_at,
  CASE 
    WHEN al.action = 'CREATE' THEN '✅ Création'
    WHEN al.action = 'UPDATE' THEN '✏️ Modification'
    WHEN al.action = 'DELETE' THEN '🗑️ Suppression'
    WHEN al.action = 'LOGIN' THEN '🔐 Connexion'
    WHEN al.action = 'LOGOUT' THEN '🚪 Déconnexion'
    WHEN al.action = 'VIEW' THEN '👁️ Consultation'
    ELSE al.action
  END as action_label,
  CASE 
    WHEN al.entity_type = 'ticket' THEN '🎫 Ticket'
    WHEN al.entity_type = 'user' THEN '👤 Utilisateur'
    WHEN al.entity_type = 'technician_service' THEN '🔧 Service Technicien'
    ELSE al.entity_type
  END as entity_label
FROM activity_logs al
ORDER BY al.created_at DESC;

-- 8. Fonction pour nettoyer les vieux logs (optionnel)
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. التحقق
-- =====================================================
SELECT 
  'activity_logs table created' as status,
  COUNT(*) as log_count
FROM activity_logs;

-- عرض آخر 10 logs
SELECT * FROM activity_logs_view LIMIT 10;

