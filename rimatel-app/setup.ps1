# =====================================================
# RIMATEL SA - Script d'Installation Automatique (Windows)
# =====================================================

Write-Host "🎫 RIMATEL Ticketing System - Installation" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Vérifier Node.js
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord." -ForegroundColor Red
    exit 1
}

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dépendances installées avec succès" -ForegroundColor Green
Write-Host ""

# Créer le fichier .env s'il n'existe pas
if (-not (Test-Path .env)) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  IMPORTANT: Éditez le fichier .env avec vos credentials Supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vous devez configurer :" -ForegroundColor Cyan
    Write-Host "  - VITE_SUPABASE_URL" -ForegroundColor Cyan
    Write-Host "  - VITE_SUPABASE_ANON_KEY" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ Le fichier .env existe déjà" -ForegroundColor Green
    Write-Host ""
}

# Afficher les prochaines étapes
Write-Host "🎉 Installation terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configurez Supabase :" -ForegroundColor White
Write-Host "   - Créez un projet sur https://supabase.com" -ForegroundColor Gray
Write-Host "   - Exécutez les migrations SQL dans supabase/migrations/" -ForegroundColor Gray
Write-Host "   - Créez un utilisateur test (admin@rimatel.mr / admin123)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configurez les variables d'environnement :" -ForegroundColor White
Write-Host "   - Éditez le fichier .env avec vos credentials Supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Lancez l'application :" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 Consultez SETUP_GUIDE.md pour plus de détails" -ForegroundColor Cyan
Write-Host ""

