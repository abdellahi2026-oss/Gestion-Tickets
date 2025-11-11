// =====================================================
// Edge Function: Mise à jour d'un utilisateur
// =====================================================
// Cette fonction met à jour les informations d'un utilisateur
// dans la table users ET dans auth.users
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

    // Récupérer les données de mise à jour
    const { userId, updates } = await req.json()

    if (!userId || !updates) {
      return new Response(
        JSON.stringify({ error: 'userId et updates requis' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔄 Mise à jour de l\'utilisateur:', userId, updates)

    // 1. Mettre à jour la table users
    const dbUpdates: any = {}
    if (updates.username) dbUpdates.username = updates.username
    if (updates.full_name) dbUpdates.full_name = updates.full_name
    if (updates.role) dbUpdates.role = updates.role
    if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active

    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)

    if (dbError) {
      console.error('❌ Erreur DB:', dbError)
      throw dbError
    }

    console.log('✅ Table users mise à jour')

    // 2. Mettre à jour auth.users si nécessaire
    const authUpdates: any = {}
    
    if (updates.email) {
      authUpdates.email = updates.email
    }
    
    if (updates.password) {
      authUpdates.password = updates.password
    }
    
    if (updates.full_name) {
      authUpdates.user_metadata = { full_name: updates.full_name }
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdates
      )

      if (authUpdateError) {
        console.error('⚠️ Erreur auth:', authUpdateError)
        return new Response(
          JSON.stringify({ 
            success: true,
            warning: 'Utilisateur mis à jour dans la base de données mais erreur lors de la mise à jour de l\'authentification'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('✅ Auth.users mis à jour')
    }

    // 3. Mettre à jour les services du technicien si nécessaire
    if (updates.services && updates.role === 'technicien') {
      // Supprimer les anciens services
      await supabaseAdmin
        .from('technician_services')
        .delete()
        .eq('user_id', userId)

      // Ajouter les nouveaux services
      if (updates.services.length > 0) {
        const servicesToInsert = updates.services.map((service: string) => ({
          user_id: userId,
          service_type: service,
          assigned_by: user.id
        }))

        await supabaseAdmin
          .from('technician_services')
          .insert(servicesToInsert)
      }

      console.log('✅ Services du technicien mis à jour')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Utilisateur mis à jour avec succès'
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

