#!/bin/bash

# =====================================================
# RIMATEL SA - Script d'Installation Automatique
# =====================================================

echo "🎫 RIMATEL Ticketing System - Installation"
echo "=========================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées avec succès"
echo ""

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Éditez le fichier .env avec vos credentials Supabase"
    echo ""
    echo "Vous devez configurer :"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo ""
else
    echo "✅ Le fichier .env existe déjà"
    echo ""
fi

# Afficher les prochaines étapes
echo "🎉 Installation terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1. Configurez Supabase :"
echo "   - Créez un projet sur https://supabase.com"
echo "   - Exécutez les migrations SQL dans supabase/migrations/"
echo "   - Créez un utilisateur test (admin@rimatel.mr / admin123)"
echo ""
echo "2. Configurez les variables d'environnement :"
echo "   - Éditez le fichier .env avec vos credentials Supabase"
echo ""
echo "3. Lancez l'application :"
echo "   npm run dev"
echo ""
echo "📖 Consultez SETUP_GUIDE.md pour plus de détails"
echo ""

