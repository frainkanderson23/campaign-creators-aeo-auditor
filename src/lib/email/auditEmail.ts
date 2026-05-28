import { auditCompleteEmail } from './templates';
import { sendEmail } from './resend';

function buildAuditUrl(auditId: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/audit/${encodeURIComponent(auditId)}`;
}

export async function sendAuditCompleteEmail(
  email: string,
  auditId: string,
  score: number,
  grade: string,
): Promise<{ id: string } | null> {
  if (!email) {
    console.warn('[auditEmail] sendAuditCompleteEmail called without email; skipping');
    return null;
  }

  const auditUrl = buildAuditUrl(auditId);
  const { subject, html } = auditCompleteEmail(auditUrl, score, grade);

  return sendEmail({ to: email, subject, html });
}
