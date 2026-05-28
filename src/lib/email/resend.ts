import { Resend } from 'resend';

type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
};

type SendEmailResult = {
  id: string;
} | null;

const DEFAULT_FROM = 'Campaign Creators <noreply@campaigncreators.com>';

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: SendEmailArgs): Promise<SendEmailResult> {
  const client = getClient();
  if (!client) {
    console.warn('[resend] RESEND_API_KEY not set; skipping sendEmail');
    return null;
  }

  const fromAddress = from?.trim() || process.env.RESEND_FROM?.trim() || DEFAULT_FROM;

  const { data, error } = await client.emails.send({
    from: fromAddress,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    console.error('[resend] send failed:', error);
    return null;
  }

  if (!data?.id) {
    return null;
  }

  return { id: data.id };
}
