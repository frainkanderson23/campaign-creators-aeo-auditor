const HUBSPOT_API_BASE = 'https://api.hubapi.com';

type HubSpotContactProperties = Record<string, string | number | boolean | null | undefined>;

type HubSpotContactResponse = {
  id: string;
  properties: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeProperties(
  email: string,
  properties: HubSpotContactProperties,
): Record<string, string> {
  const out: Record<string, string> = { email };
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;
    out[key] = typeof value === 'string' ? value : String(value);
  }
  return out;
}

export async function upsertContact(
  email: string,
  properties: HubSpotContactProperties = {},
): Promise<HubSpotContactResponse | null> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN?.trim();
  if (!token) {
    console.warn('[hubspot] HUBSPOT_PRIVATE_APP_TOKEN not set; skipping upsertContact');
    return null;
  }

  if (!email) {
    console.warn('[hubspot] upsertContact called without email; skipping');
    return null;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const normalized = normalizeProperties(email, properties);

  const searchRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [{ propertyName: 'email', operator: 'EQ', value: email }],
        },
      ],
      properties: ['email'],
      limit: 1,
    }),
  });

  if (!searchRes.ok) {
    const body = await searchRes.text();
    console.error(`[hubspot] search failed (${searchRes.status}): ${body}`);
    return null;
  }

  const searchData = (await searchRes.json()) as { results?: Array<{ id: string }> };
  const existingId = searchData.results?.[0]?.id;

  if (existingId) {
    const updateRes = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${existingId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ properties: normalized }),
      },
    );
    if (!updateRes.ok) {
      const body = await updateRes.text();
      console.error(`[hubspot] update failed (${updateRes.status}): ${body}`);
      return null;
    }
    return (await updateRes.json()) as HubSpotContactResponse;
  }

  const createRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ properties: normalized }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    console.error(`[hubspot] create failed (${createRes.status}): ${body}`);
    return null;
  }

  return (await createRes.json()) as HubSpotContactResponse;
}
