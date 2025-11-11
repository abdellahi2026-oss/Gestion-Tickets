-- =====================================================
-- RIMATEL SA - Seed Data
-- =====================================================

-- =====================================================
-- 1. INSERT WILAYAS
-- =====================================================
INSERT INTO wilayas (code, name_fr, name_ar, name_en) VALUES
('NKC', 'Nouakchott', 'نواكشوط', 'Nouakchott'),
('NDB', 'Nouadhibou', 'نواذيبو', 'Nouadhibou'),
('TIMBEDRA', 'Timbedra', 'تمبدغة', 'Timbedra'),
('NEMA', 'Néma', 'النعمة', 'Nema'),
('GHEROU', 'Guerou', 'كرو', 'Guerou'),
('AIOUN', 'Aïoun', 'العيون', 'Aioun'),
('OUAD_NAGUE', 'Ouad Nague', 'واد الناقة', 'Ouad Nague'),
('KIFFA', 'Kiffa', 'كيفة', 'Kiffa'),
('ALEG', 'Aleg', 'ألاك', 'Aleg'),
('TIDJIGJE', 'Tidjigje', 'تجكجة', 'Tidjigje'),
('WELATE', 'Welate', 'ولاتة', 'Welate'),
('SELIBABAI', 'Sélibabi', 'سيليبابي', 'Selibabi'),
('BOGHE', 'Boghé', 'بوكي', 'Boghe'),
('BABABE', 'Bababé', 'بابابي', 'Bababe'),
('TACHOUT', 'Tachout', 'تاشوت', 'Tachout'),
('BASSIKNOU', 'Bassiknou', 'باسكنو', 'Bassiknou');

-- =====================================================
-- 2. INSERT REGIONS (NKC only)
-- =====================================================
INSERT INTO regions (wilaya_code, name_fr, name_ar, name_en) VALUES
('NKC', 'Arafat', 'عرفات', 'Arafat'),
('NKC', 'Riyadh', 'الرياض', 'Riyadh'),
('NKC', 'Baghdad', 'بغداد', 'Baghdad'),
('NKC', 'Carrefour', 'كارفور', 'Carrefour'),
('NKC', 'Toujounine', 'توجنين', 'Toujounine'),
('NKC', 'TVZ', 'تي في زد', 'TVZ'),
('NKC', 'Sahrawi', 'الصحراوي', 'Sahrawi'),
('NKC', 'Soukouk', 'السكوك', 'Soukouk'),
('NKC', 'Capital', 'العاصمة', 'Capital'),
('NKC', 'El Mina', 'الميناء', 'El Mina'),
('NKC', 'Sebkha', 'السبخة', 'Sebkha'),
('NKC', 'Teyaret', 'تيارت', 'Teyaret'),
('NKC', 'Dar Naim', 'دار النعيم', 'Dar Naim'),
('NKC', 'Zaatar', 'الزعتر', 'Zaatar'),
('NKC', 'Ancien Aéroport', 'المطار القديم', 'Old Airport'),
('NKC', 'Ksar', 'القصر', 'Ksar'),
('NKC', 'Aghnodert', 'أغنودرت', 'Aghnodert');

-- =====================================================
-- 3. CREATE DEFAULT ADMIN USER
-- Password: admin123 (hashed with bcrypt)
-- =====================================================
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@rimatel.mr', '$2a$10$rKvVJKhPqZXqJqYqJqYqJeO8YqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 'Administrateur RIMATEL', 'admin');

-- Note: You should change this password after first login
-- The actual hash should be generated using bcrypt in your application

