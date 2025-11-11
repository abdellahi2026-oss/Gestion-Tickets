# 🔧 حل جميع المشاكل - دليل شامل

## 🎯 المشاكل الحالية

1. ❌ لا يظهر رابط "Gestion des Utilisateurs"
2. ❌ خطأ عند إنشاء تذكرة جديدة

---

## ✅ الحل الشامل - خطوة بخطوة

### الخطوة 1: تحقق من وجود المستخدم في Authentication

1. **افتح Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/tznyuhnglpnfllzdhhde
   ```

2. **اذهب إلى Authentication → Users**

3. **ابحث عن المستخدم**:
   - هل يوجد مستخدم بالبريد: `admin@rimatel.mr`؟
   
   **إذا لم يكن موجوداً:**
   - اضغط **Add user** → **Create new user**
   - Email: `admin@rimatel.mr`
   - Password: `admin123`
   - ✅ Auto Confirm User
   - اضغط **Create user**
   - **انسخ الـ ID** (مثل: `abc123-def456-...`)

---

### الخطوة 2: نفذ SQL لإصلاح قاعدة البيانات

**افتح SQL Editor في Supabase ونفذ:**

#### الحل A: إذا كان المستخدم موجود في Authentication

```sql
-- 1. اجعل password_hash اختيارياً
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. احذف السجلات القديمة
DELETE FROM users WHERE email LIKE '%admin%';

-- 3. أدخل المستخدم بشكل صحيح
INSERT INTO users (id, email, full_name, role, is_active)
SELECT 
  au.id,
  'admin@rimatel.mr',
  'Administrateur RIMATEL',
  'admin',
  true
FROM auth.users au
WHERE au.email = 'admin@rimatel.mr';

-- 4. تحقق من النتيجة
SELECT id, email, role, is_active FROM users WHERE email = 'admin@rimatel.mr';
```

**يجب أن ترى:**
```
id: [UUID]
email: admin@rimatel.mr
role: admin
is_active: true
```

#### الحل B: إذا لم يكن المستخدم موجود في Authentication

أولاً أنشئ المستخدم في **Authentication → Users** كما في الخطوة 1، ثم نفذ الحل A.

---

### الخطوة 3: تحقق من جدول complaint_types

```sql
-- تحقق من وجود أنواع الشكاوى
SELECT * FROM complaint_types;
```

**إذا كان الجدول فارغاً، نفذ:**

```sql
-- إدراج أنواع الشكاوى
INSERT INTO complaint_types (code, name_fr, name_ar, name_en, applicable_to) VALUES
('COUPURE', 'Coupure', 'انقطاع', 'Outage', ARRAY['SAWI', 'LTE', 'BLR', 'FTTH', 'LS/MPLS']),
('LENTEUR', 'Lenteur', 'بطء', 'Slowness', ARRAY['SAWI', 'LTE', 'BLR', 'FTTH', 'LS/MPLS']),
('PROBLEME_ANTENNE', 'Problème Antenne', 'مشكلة الهوائي', 'Antenna Problem', ARRAY['SAWI', 'BLR']),
('PROBLEME_MATERIEL', 'Problème Matériel', 'مشكلة المعدات', 'Equipment Problem', ARRAY['SAWI', 'LTE', 'BLR', 'FTTH', 'LS/MPLS']),
('PROBLEME_CONFIGURATION', 'Problème Configuration', 'مشكلة الإعدادات', 'Configuration Problem', ARRAY['SAWI', 'LTE', 'BLR', 'FTTH', 'LS/MPLS']),
('AUTRE', 'Autre', 'أخرى', 'Other', ARRAY['SAWI', 'LTE', 'BLR', 'FTTH', 'LS/MPLS'])
ON CONFLICT (code) DO NOTHING;
```

---

### الخطوة 4: أعد تشغيل التطبيق

في Terminal:

```bash
# أوقف التطبيق (Ctrl+C)
# ثم أعد التشغيل
npm run dev
```

---

### الخطوة 5: امسح Cache المتصفح

1. **في المتصفح اضغط**: `Ctrl + Shift + Delete`
2. **اختر**: Cached images and files
3. **اضغط**: Clear data
4. **أو ببساطة**: اضغط `Ctrl + F5` لإعادة تحميل قوية

---

### الخطوة 6: سجل الدخول

1. **اذهب إلى**: http://localhost:3002
2. **سجل الدخول**:
   - البريد: `admin@rimatel.mr`
   - كلمة المرور: `admin123`

---

### الخطوة 7: افتح Console للتشخيص

1. **اضغط F12** في المتصفح
2. **اذهب إلى تبويب Console**
3. **ابحث عن الرسائل**:
   ```
   User role loaded: admin
   Current userRole: admin
   Adding admin menu item
   ```

**إذا رأيت `User role loaded: null`:**
- المشكلة في قاعدة البيانات
- ارجع للخطوة 2

**إذا رأيت `User role loaded: admin` لكن لا يظهر الرابط:**
- أعد تحميل الصفحة (F5)
- امسح Cache (Ctrl + Shift + Delete)

---

## 🧪 اختبار النتيجة

### اختبار 1: لوحة الإدارة ✅

**يجب أن ترى في القائمة:**
- 📊 Tableau de bord
- 🎫 Tickets
- ➕ Nouveau Ticket
- 🛡️ **Gestion des Utilisateurs** ← يجب أن يظهر!

### اختبار 2: إنشاء تذكرة ✅

1. اضغط على **Nouveau Ticket**
2. املأ النموذج:
   - رقم المشترك: `DAB12345`
   - رقم الهاتف: `+22212345678`
   - اترك اسم العميل فارغاً
   - اختر الولاية
   - اختر نوع الاشتراك (مثلاً SAWI)
   - **يجب أن يظهر حقل "Type de Réclamation"**
   - اختر نوع الشكوى
   - اكتب وصف المشكلة
3. احفظ
4. **يجب أن تُنشأ التذكرة بنجاح**

---

## 🐛 إذا استمرت المشاكل

### المشكلة: لا يزال لا يظهر رابط الإدارة

**نفذ هذا للتشخيص:**

```sql
-- تحقق من كل شيء
SELECT 
  'auth.users' as source,
  id,
  email,
  'N/A' as role
FROM auth.users
WHERE email = 'admin@rimatel.mr'

UNION ALL

SELECT 
  'users table' as source,
  id,
  email,
  role
FROM users
WHERE email = 'admin@rimatel.mr';
```

**أخبرني بالنتيجة!**

---

### المشكلة: خطأ عند إنشاء تذكرة

**افتح Console (F12) وأخبرني بالخطأ الأحمر الذي يظهر**

الأخطاء الشائعة:
- `complaint_types table does not exist` → نفذ الخطوة 3
- `null value in column "client_name"` → نفذ Migration 005
- `i18n is not defined` → تم إصلاحه بالفعل

---

## 📞 المساعدة السريعة

**أخبرني بـ:**

1. **نتيجة هذا الاستعلام:**
   ```sql
   SELECT email, role FROM users WHERE email = 'admin@rimatel.mr';
   ```

2. **ماذا ترى في Console (F12) عند تسجيل الدخول؟**

3. **ما هو الخطأ الذي يظهر عند إنشاء تذكرة؟**

**سأحل المشكلة فوراً! 😊**

---

## ✅ قائمة التحقق النهائية

- [ ] المستخدم موجود في Authentication → Users
- [ ] المستخدم موجود في جدول users بدور admin
- [ ] جدول complaint_types يحتوي على 6 أنواع
- [ ] تم مسح Cache المتصفح
- [ ] تم إعادة تشغيل التطبيق
- [ ] تم تسجيل الخروج وإعادة تسجيل الدخول
- [ ] يظهر رابط "Gestion des Utilisateurs"
- [ ] يمكن إنشاء تذكرة جديدة بنجاح

---

**الحالة**: 🔧 جاري الإصلاح

