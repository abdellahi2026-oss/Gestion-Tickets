# =====================================================
# Script de Déploiement des Edge Functions Supabase
# =====================================================
# Ce script automatise le déploiement des Edge Functions
# pour la gestion complète des utilisateurs
# =====================================================

Write-Host "🚀 Déploiement des Edge Functions Supabase" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Supabase CLI est installé
Write-Host "🔍 Vérification de Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>$null

if (-not $supabaseVersion) {
    Write-Host "❌ Supabase CLI n'est pas installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Installation de Supabase CLI..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 : Via Scoop (Recommandé)" -ForegroundColor Cyan
    Write-Host "  1. Installer Scoop : iwr -useb get.scoop.sh | iex" -ForegroundColor Gray
    Write-Host "  2. Ajouter le bucket : scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor Gray
    Write-Host "  3. Installer Supabase : scoop install supabase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2 : Via npm" -ForegroundColor Cyan
    Write-Host "  npm install -g supabase" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ Supabase CLI installé : $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Vérifier si le projet est lié
Write-Host "🔗 Vérification de la liaison du projet..." -ForegroundColor Yellow
$projectLinked = supabase projects list 2>$null

if (-not $projectLinked) {
    Write-Host "⚠️  Projet non lié" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Étapes pour lier le projet :" -ForegroundColor Cyan
    Write-Host "  1. Se connecter : supabase login" -ForegroundColor Gray
    Write-Host "  2. Lier le projet : supabase link --project-ref tznyuhnglpnfllzdhhde" -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "Voulez-vous vous connecter maintenant ? (o/n)"
    
    if ($response -eq "o" -or $response -eq "O") {
        Write-Host ""
        Write-Host "🔐 Connexion à Supabase..." -ForegroundColor Yellow
        supabase login
        
        Write-Host ""
        Write-Host "🔗 Liaison du projet..." -ForegroundColor Yellow
        supabase link --project-ref tznyuhnglpnfllzdhhde
    } else {
        Write-Host ""
        Write-Host "❌ Déploiement annulé" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Projet lié" -ForegroundColor Green
Write-Host ""

# Vérifier que les fichiers des fonctions existent
Write-Host "📁 Vérification des fichiers..." -ForegroundColor Yellow

$deleteUserPath = "supabase/functions/delete-user/index.ts"
$updateUserPath = "supabase/functions/update-user/index.ts"

if (-not (Test-Path $deleteUserPath)) {
    Write-Host "❌ Fichier manquant : $deleteUserPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $updateUserPath)) {
    Write-Host "❌ Fichier manquant : $updateUserPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Tous les fichiers sont présents" -ForegroundColor Green
Write-Host ""

# Déployer les fonctions
Write-Host "📤 Déploiement des Edge Functions..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  📦 Déploiement de delete-user..." -ForegroundColor Cyan
supabase functions deploy delete-user

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Échec du déploiement de delete-user" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ delete-user déployée" -ForegroundColor Green
Write-Host ""

Write-Host "  📦 Déploiement de update-user..." -ForegroundColor Cyan
supabase functions deploy update-user

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Échec du déploiement de update-user" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ update-user déployée" -ForegroundColor Green
Write-Host ""

# Résumé
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🎉 Déploiement terminé avec succès !" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Fonctions déployées :" -ForegroundColor Cyan
Write-Host "  ✅ delete-user" -ForegroundColor Green
Write-Host "  ✅ update-user" -ForegroundColor Green
Write-Host ""

Write-Host "🔗 URLs des fonctions :" -ForegroundColor Cyan
Write-Host "  https://tznyuhnglpnfllzdhhde.supabase.co/functions/v1/delete-user" -ForegroundColor Gray
Write-Host "  https://tznyuhnglpnfllzdhhde.supabase.co/functions/v1/update-user" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. Vérifiez les fonctions dans Supabase Dashboard" -ForegroundColor White
Write-Host "     https://supabase.com/dashboard/project/tznyuhnglpnfllzdhhde/functions" -ForegroundColor Gray
Write-Host ""
Write-Host '  2. Rechargez l\'application dans le navigateur (F5)' -ForegroundColor White
Write-Host ""
Write-Host '  3. Testez la suppression et la modification d''utilisateurs' -ForegroundColor White
Write-Host ""

Write-Host "🐛 Pour voir les logs :" -ForegroundColor Cyan
Write-Host "  supabase functions logs delete-user --follow" -ForegroundColor Gray
Write-Host "  supabase functions logs update-user --follow" -ForegroundColor Gray
Write-Host ""

Write-Host "Tout est pret !" -ForegroundColor Green
Write-Host ""

