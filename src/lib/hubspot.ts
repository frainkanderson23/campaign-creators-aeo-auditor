export async function submitLeadToHubSpot(
  email: string,
  domain: string,
  score: number,
  grade: string,
): Promise<void> {
  try {
    const portalId = (process.env.HUBSPOT_PORTAL_ID ?? '2660433').trim();
    const formGuid = (process.env.HUBSPOT_FORM_GUID ?? '').trim();

    if (!formGuid) {
      console.warn(
        'HubSpot submission skipped: HUBSPOT_FORM_GUID is not set',
      );
      return;
    }

    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: [
          { name: 'email', value: email },
          { name: 'domain', value: domain },
          { name: 'aeo_score', value: String(score) },
          { name: 'aeo_grade', value: grade },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('HubSpot submission failed:', response.status, text);
    }
  } catch (error) {
    console.error('HubSpot submission error:', error);
  }
}
