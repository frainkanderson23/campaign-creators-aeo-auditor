import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
  );
}

const WINDOW_SECONDS = 3600;

export async function checkRateLimit(
  ip: string,
): Promise<{ limited: boolean }> {
  const supabase = getSupabase();
  const limit = Number.parseInt(process.env.RATE_LIMIT_MAX ?? '5', 10) || 5;
  const since = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from('audit_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) >= limit) {
    return { limited: true };
  }

  const { error: insertError } = await supabase
    .from('audit_rate_limits')
    .insert({ ip, created_at: new Date().toISOString() });

  if (insertError) {
    throw insertError;
  }

  return { limited: false };
}
