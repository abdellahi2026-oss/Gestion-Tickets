-- =====================================================
-- RIMATEL SA - Fix Admin Email
-- Migration 006
-- =====================================================

-- تصحيح البريد الإلكتروني للمدير
UPDATE users 
SET email = 'admin@rimatel.mr'
WHERE email = 'admi@rimatel.mr';

-- التحقق من النتيجة
SELECT id, email, username, role FROM users WHERE role = 'admin';

