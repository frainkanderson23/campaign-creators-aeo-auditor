import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const RATE_LIMIT = 10;

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = (process.env.SUPABASE_URL ?? '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  client = createClient(url, key);
  return client;
}

export async function checkRateLimit(
  ip: string,
): Promise<{ allowed: boolean; remainingRequests: number }> {
  const trimmedIp = ip.trim();
  const supabase = getSupabase();

  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toISOString();
  const { error: deleteError } = await supabase
    .from('rate_limit_requests')
    .delete()
    .eq('ip', trimmedIp)
    .lt('created_at', twentyFourHoursAgo);

  if (deleteError) {
    throw deleteError;
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from('rate_limit_requests')
    .select('*', { count: 'exact', head: true })
    .eq('ip', trimmedIp)
    .gt('created_at', oneHourAgo);

  if (countError) {
    throw countError;
  }

  const currentCount = count ?? 0;

  if (currentCount >= RATE_LIMIT) {
    return { allowed: false, remainingRequests: 0 };
  }

  const { error: insertError } = await supabase
    .from('rate_limit_requests')
    .insert({ ip: trimmedIp });

  if (insertError) {
    throw insertError;
  }

  return {
    allowed: true,
    remainingRequests: RATE_LIMIT - (currentCount + 1),
  };
}
