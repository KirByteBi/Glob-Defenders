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
    return jsonResponse({ error: 'Code redemption service is not configured.' }, 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Could not parse the one-time code redemption request:', error);
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }
  if (!body || typeof body !== 'object' ||
      !('code' in body) || typeof body.code !== 'string' ||
      body.code.length > 64) {
    return jsonResponse({ error: 'A valid code is required.' }, 400);
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
  const { data, error } = await adminClient.rpc('redeem_one_time_skin_code', {
    target_code: body.code,
    target_user_id: user.id
  });
  if (error) {
    console.error('Could not atomically redeem the one-time skin code:', error);
    return jsonResponse({ error: 'Could not redeem the code right now.' }, 500);
  }
  if (!data || typeof data !== 'object' || typeof data.result !== 'string') {
    console.error('The one-time skin code RPC returned an invalid response.');
    return jsonResponse({ error: 'The redemption service returned an invalid response.' }, 500);
  }

  return jsonResponse(data);
});
