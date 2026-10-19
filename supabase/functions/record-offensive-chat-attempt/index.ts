import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Authentication is required.' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    console.error('Missing Supabase URL, publishable key, or server service-role secret.');
    return jsonResponse({ error: 'Moderation service is not configured.' }, 500);
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return jsonResponse({ error: 'The session is invalid or expired.' }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: attempts, error: countError } = await adminClient.rpc(
    'record_offensive_chat_attempt',
    { target_user_id: user.id }
  );
  if (countError) {
    console.error('Could not record the authenticated user moderation attempt:', countError);
    return jsonResponse({ error: 'Could not record the moderation attempt.' }, 500);
  }

  if (typeof attempts !== 'number' || !Number.isSafeInteger(attempts) || attempts < 1) {
    console.error('The moderation counter returned an invalid attempt count.');
    return jsonResponse({ error: 'The moderation counter returned an invalid response.' }, 500);
  }

  if (attempts < 25) return jsonResponse({ attempts, deleted: false });

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('Could not delete the account after reaching the moderation threshold:', deleteError);
    return jsonResponse({ error: 'The account could not be deleted.' }, 500);
  }

  return jsonResponse({ attempts, deleted: true });
});
