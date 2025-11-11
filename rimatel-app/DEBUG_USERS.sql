-- =====================================================
-- تشخيص مشكلة عدم ظهور المستخدمين
-- =====================================================

-- 1. التحقق من المستخدمين في جدول users
-- =====================================================
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

-- 2. التحقق من المستخدمين في auth.users
-- =====================================================
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. مقارنة بين الجدولين
-- =====================================================
SELECT 
  au.email as auth_email,
  u.email as users_email,
  u.full_name,
  u.role,
  CASE 
    WHEN u.id IS NULL THEN '❌ موجود في Auth فقط'
    WHEN au.id IS NULL THEN '❌ موجود في Users فقط'
    ELSE '✅ موجود في الاثنين'
  END as status
FROM auth.users au
FULL OUTER JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- 4. التحقق من RLS Policies
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. اختبار الصلاحيات للمستخدم الحالي
-- =====================================================
-- تحقق من دور المستخدم الحالي
SELECT 
  id,
  email,
  role,
  is_active
FROM users
WHERE id = auth.uid();

-- 6. محاولة جلب جميع المستخدمين (كما يفعل التطبيق)
-- =====================================================
SELECT 
  u.*,
  COALESCE(
    json_agg(
      json_build_object('service_type', ts.service_type)
    ) FILTER (WHERE ts.service_type IS NOT NULL),
    '[]'
  ) as technician_services
FROM users u
LEFT JOIN technician_services ts ON u.id = ts.user_id
GROUP BY u.id
ORDER BY u.created_at DESC;

-- 7. إصلاح: إضافة المستخدمين المفقودين من auth.users إلى users
-- =====================================================
-- هذا سيضيف أي مستخدم موجود في auth.users لكن غير موجود في users
INSERT INTO users (id, email, full_name, role, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
  'user',
  true
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 8. التحقق النهائي
-- =====================================================
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as admins,
  COUNT(*) FILTER (WHERE role = 'user') as users,
  COUNT(*) FILTER (WHERE role = 'technicien') as techniciens,
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_users
FROM users;

