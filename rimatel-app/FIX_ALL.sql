-- =====================================================
-- إصلاح شامل لجميع المشاكل
-- =====================================================

-- 1. التأكد من أن password_hash اختياري
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. حذف أي سجلات مكررة أو خاطئة
DELETE FROM users WHERE email LIKE '%admin%';

-- 3. إدراج المستخدم Admin بشكل صحيح
INSERT INTO users (id, email, full_name, role, is_active)
SELECT 
  au.id,
  'admin@rimatel.mr',
  'Administrateur RIMATEL',
  'admin',
  true
FROM auth.users au
WHERE au.email = 'admin@rimatel.mr'
ON CONFLICT (id) DO UPDATE 
SET 
  email = 'admin@rimatel.mr',
  role = 'admin', 
  is_active = true,
  full_name = 'Administrateur RIMATEL';

-- 4. التحقق من النتيجة
SELECT 
  u.id,
  u.email, 
  u.role, 
  u.is_active,
  au.email as auth_email
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@rimatel.mr';

-- 5. إذا لم يكن هناك مستخدم في auth.users، أنشئه
-- (نفذ هذا يدوياً في Authentication > Users إذا لزم الأمر)

