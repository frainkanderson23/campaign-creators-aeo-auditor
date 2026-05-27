import { getResend } from './resend';
import { auditUnlockEmailTemplate } from './templates';

export async function sendAuditUnlockEmail(
  to: string,
  domain: string,
  score: number,
  grade: string,
  reportUrl: string,
): Promise<void> {
  try {
    const resend = getResend();
    const { subject, html } = auditUnlockEmailTemplate(
      domain,
      score,
      grade,
      reportUrl,
    );
    const emailFrom = (process.env.EMAIL_FROM ?? 'noreply@aeoauditor.com').trim();

    await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log('Audit unlock email sent to', to);
  } catch (error) {
    console.error('Failed to send audit unlock email:', error);
  }
}
