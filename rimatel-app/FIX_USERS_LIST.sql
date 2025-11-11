-- =====================================================
-- إصلاح مشكلة عدم ظهور المستخدمين
-- =====================================================

-- الخطوة 1: إضافة المستخدمين المفقودين من auth.users إلى users
-- =====================================================
INSERT INTO users (id, email, full_name, role, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1)
  ) as full_name,
  'user' as role,
  true as is_active
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- الخطوة 2: إصلاح RLS Policies لجدول users
-- =====================================================

-- حذف جميع الـ policies القديمة
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- إنشاء policies جديدة محسّنة

-- 1. عرض المستخدمين
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

-- 2. إدراج مستخدمين
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

-- 3. تحديث المستخدمين
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. حذف المستخدمين
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

-- الخطوة 3: التحقق من النتيجة
-- =====================================================

-- عرض جميع المستخدمين
SELECT 
  id,
  email,
  username,
  full_name,
  role,
  is_active,
  created_at
FROM users
ORDER BY created_at DESC;

-- عرض الإحصائيات
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as admins,
  COUNT(*) FILTER (WHERE role = 'user') as normal_users,
  COUNT(*) FILTER (WHERE role = 'technicien') as techniciens
FROM users;

-- عرض الـ policies
SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

