-- =====================================================
-- إصلاح جميع RLS Policies
-- =====================================================

-- 1. إصلاح policies لجدول users
-- =====================================================

-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- إنشاء policies جديدة

-- عرض المستخدمين
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- إدراج مستخدمين
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- تحديث المستخدمين
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- حذف المستخدمين
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 2. إصلاح policies لجدول tickets
-- =====================================================

DROP POLICY IF EXISTS "Users can view tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update tickets" ON tickets;

-- عرض التذاكر
CREATE POLICY "Users can view tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (true);

-- إدراج تذاكر
CREATE POLICY "Users can insert tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- تحديث التذاكر
CREATE POLICY "Users can update tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (true);

-- 3. إصلاح policies لجدول technician_services
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage technician services" ON technician_services;
DROP POLICY IF EXISTS "Admins can view technician services" ON technician_services;
DROP POLICY IF EXISTS "Admins can insert technician services" ON technician_services;
DROP POLICY IF EXISTS "Admins can delete technician services" ON technician_services;

-- عرض
CREATE POLICY "Admins can view technician services"
  ON technician_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- إدراج
CREATE POLICY "Admins can insert technician services"
  ON technician_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- حذف
CREATE POLICY "Admins can delete technician services"
  ON technician_services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 4. التحقق من النتيجة
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('users', 'tickets', 'technician_services')
ORDER BY tablename, policyname;

