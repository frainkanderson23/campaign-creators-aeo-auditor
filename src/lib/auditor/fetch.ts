const FETCH_TIMEOUT_MS = 10000;
const USER_AGENT =
  'Mozilla/5.0 (compatible; CampaignCreatorsAEOBot/1.0; +https://campaigncreators.com/aeo-audit)';

export interface FetchedResource {
  ok: boolean;
  status: number;
  headers: Headers;
  text: string;
}

export async function fetchResource(
  url: string,
  init?: { method?: 'GET' | 'HEAD' },
): Promise<FetchedResource | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: init?.method ?? 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    const text = res.body && init?.method !== 'HEAD' ? await res.text() : '';

    return {
      ok: res.ok,
      status: res.status,
      headers: res.headers,
      text,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
