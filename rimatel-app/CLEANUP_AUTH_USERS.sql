-- =====================================================
-- Nettoyage des utilisateurs orphelins dans auth.users
-- =====================================================
-- Ce script supprime les utilisateurs de auth.users qui n'ont plus
-- de profil correspondant dans la table users
--
-- ⚠️ ATTENTION : Ce script doit être exécuté dans le SQL Editor de Supabase
-- avec les privilèges appropriés
-- =====================================================

-- 1. Voir les utilisateurs orphelins (dans auth.users mais pas dans users)
-- =====================================================
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  'Orphelin - Pas de profil dans users' as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Compter les utilisateurs orphelins
-- =====================================================
SELECT 
  COUNT(*) as orphaned_users_count
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 3. Supprimer les utilisateurs orphelins (ATTENTION : Action irréversible!)
-- =====================================================
-- ⚠️ Décommentez cette section UNIQUEMENT si vous êtes sûr de vouloir supprimer
-- les utilisateurs orphelins de auth.users

/*
DO $$
DECLARE
  user_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  -- Parcourir tous les utilisateurs orphelins
  FOR user_record IN 
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN users u ON au.id = u.id
    WHERE u.id IS NULL
  LOOP
    -- Supprimer l'utilisateur de auth.users
    DELETE FROM auth.users WHERE id = user_record.id;
    deleted_count := deleted_count + 1;
    
    RAISE NOTICE 'Deleted user: % (%)', user_record.email, user_record.id;
  END LOOP;
  
  RAISE NOTICE 'Total users deleted: %', deleted_count;
END $$;
*/

-- 4. Vérification après nettoyage
-- =====================================================
-- Exécutez ceci après le nettoyage pour vérifier qu'il n'y a plus d'orphelins
SELECT 
  COUNT(*) as remaining_orphaned_users
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================
-- 1. Les utilisateurs dans auth.users sans profil dans users ne peuvent pas se connecter
-- 2. La suppression de la table users cascade automatiquement vers technician_services
-- 3. Pour une suppression complète, vous devez exécuter ce script manuellement
-- 4. Alternative : Créer une Edge Function Supabase pour gérer la suppression
-- =====================================================

