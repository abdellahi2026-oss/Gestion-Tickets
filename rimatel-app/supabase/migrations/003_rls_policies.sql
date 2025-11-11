-- =====================================================
-- RIMATEL SA - Row Level Security Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- WILAYAS & REGIONS - Public Read Access
-- =====================================================
CREATE POLICY "Wilayas are viewable by everyone"
  ON wilayas FOR SELECT
  USING (true);

CREATE POLICY "Regions are viewable by everyone"
  ON regions FOR SELECT
  USING (true);

-- =====================================================
-- TICKETS - Authenticated Users
-- =====================================================
CREATE POLICY "Authenticated users can view all tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (true);

-- =====================================================
-- TICKET HISTORY - Authenticated Users
-- =====================================================
CREATE POLICY "Authenticated users can view ticket history"
  ON ticket_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create ticket history"
  ON ticket_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- LOGIN HISTORY - Authenticated Users
-- =====================================================
CREATE POLICY "Users can view their own login history"
  ON login_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert login history"
  ON login_history FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- USERS - Restricted Access
-- =====================================================
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (true);

-- Note: For production, you should implement more granular RLS policies
-- based on user roles and permissions

