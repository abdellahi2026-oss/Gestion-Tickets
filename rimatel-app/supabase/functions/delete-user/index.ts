// =====================================================
// Edge Function: Suppression complète d'un utilisateur
// =====================================================
// Cette fonction supprime un utilisateur de la table users
// ET de auth.users de manière sécurisée côté serveur
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // First, verify the JWT token using the anon key
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Pas de token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log request headers for debugging (converted to plain object)
    try {
      const headersObject = Object.fromEntries(req.headers)
      console.log('Request headers:', JSON.stringify(headersObject))
    } catch (_) {}

    const token = authHeader.replace('Bearer ', '')
    console.log('Received token:', token) // Ajout du log
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Verify the user is authenticated (pass token explicitly for server-side usage)
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    console.log('Auth.getUser result:', { userId: user?.id, authError })

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Token invalide' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Now create admin client for service role operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Vérifier que l'utilisateur est admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Accès refusé - Admin uniquement' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Récupérer l'ID de l'utilisateur à supprimer
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId requis' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Empêcher la suppression de son propre compte
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Vous ne pouvez pas supprimer votre propre compte' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🗑️ Suppression de l\'utilisateur:', userId)

    // 1. Supprimer de la table users (cascade vers technician_services)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error('❌ Erreur DB:', dbError)
      throw dbError
    }

    console.log('✅ Utilisateur supprimé de la table users')

    // 2. Supprimer de auth.users
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error('⚠️ Erreur auth:', authDeleteError)
      // L'utilisateur est déjà supprimé de la DB, on continue
      return new Response(
        JSON.stringify({ 
          success: true,
          warning: 'Utilisateur supprimé de la base de données mais reste dans auth.users'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Utilisateur supprimé de auth.users')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Utilisateur supprimé complètement'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
