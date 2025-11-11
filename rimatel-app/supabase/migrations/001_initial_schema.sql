-- =====================================================
-- RIMATEL SA - Ticketing System Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. WILAYAS TABLE (Reference Data)
-- =====================================================
CREATE TABLE wilayas (
  code VARCHAR(20) PRIMARY KEY,
  name_fr VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  name_en VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. REGIONS TABLE (Reference Data - for NKC only)
-- =====================================================
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wilaya_code VARCHAR(20) REFERENCES wilayas(code),
  name_fr VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  name_en VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'agent',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. LOGIN HISTORY TABLE
-- =====================================================
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TICKETS TABLE
-- =====================================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Client Information
  subscriber_number VARCHAR(20) NOT NULL, -- DAB + 1-6 digits
  client_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- Location
  wilaya_code VARCHAR(20) NOT NULL REFERENCES wilayas(code),
  region_id UUID REFERENCES regions(id),
  
  -- Service Type
  subscription_type VARCHAR(20) NOT NULL CHECK (subscription_type IN ('SAWI', 'BLR', 'FTTH', 'LS/MPLS')),
  
  -- Problem Details
  problem_description TEXT NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'nouveau' 
    CHECK (status IN ('nouveau', 'assigné', 'paiement', 'en_cours', 'injoignable', 'en_retard', 'fermé')),
  
  -- Tracking
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  priority VARCHAR(20) DEFAULT 'normal',
  notes TEXT
);

-- =====================================================
-- 6. TICKET HISTORY TABLE
-- =====================================================
CREATE TABLE ticket_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  changed_by UUID REFERENCES users(id),
  changed_by_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_tickets_subscriber ON tickets(subscriber_number);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_wilaya ON tickets(wilaya_code);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX idx_login_history_user_id ON login_history(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

