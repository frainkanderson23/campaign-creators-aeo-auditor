export interface NormalizedDomain {
  hostname: string;
  origin: string;
}

export function normalizeDomain(input: string): NormalizedDomain | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  const hostname = url.hostname.replace(/^www\./, '');
  if (!hostname.includes('.')) return null;
  if (!/^[a-z0-9.-]+$/.test(hostname)) return null;

  return {
    hostname,
    origin: `${url.protocol}//${url.hostname}`,
  };
}
