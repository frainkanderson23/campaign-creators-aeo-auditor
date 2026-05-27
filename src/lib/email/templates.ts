type EmailTemplate = { subject: string; html: string };

const COLOR_PRIMARY = '#2563EB';
const COLOR_ACCENT = '#EFF6FF';
const COLOR_TEXT = '#111827';
const COLOR_TEXT_SECONDARY = '#6B7280';
const COLOR_BORDER = '#E5E7EB';
const COLOR_BACKGROUND = '#FFFFFF';
const FONT_DISPLAY = "'Plus Jakarta Sans', 'DM Sans', Arial, sans-serif";
const FONT_BODY = "'Outfit', 'Inter', Arial, sans-serif";
const RADIUS_MD = '6px';
const RADIUS_LG = '8px';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:${COLOR_ACCENT};font-family:${FONT_BODY};color:${COLOR_TEXT};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLOR_ACCENT};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:${COLOR_BACKGROUND};border:1px solid ${COLOR_BORDER};border-radius:${RADIUS_LG};overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid ${COLOR_BORDER};">
                <div style="font-family:${FONT_DISPLAY};font-size:20px;font-weight:600;color:${COLOR_PRIMARY};letter-spacing:-0.01em;">AEO Auditor</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${COLOR_BORDER};background-color:${COLOR_ACCENT};">
                <div style="font-family:${FONT_BODY};font-size:12px;color:${COLOR_TEXT_SECONDARY};line-height:1.5;">
                  AEO Auditor &middot; You are receiving this because you requested an audit.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function auditUnlockEmailTemplate(
  domain: string,
  score: number,
  grade: string,
  reportUrl: string,
): EmailTemplate {
  const subject = `Your AEO Audit Report for ${domain} is Ready`;
  const safeDomain = escapeHtml(domain);
  const safeGrade = escapeHtml(grade);
  const safeReportUrl = escapeHtml(reportUrl);

  const body = `
    <h1 style="margin:0 0 12px 0;font-family:${FONT_DISPLAY};font-size:24px;font-weight:600;color:${COLOR_TEXT};letter-spacing:-0.01em;line-height:1.3;">Your AEO Audit is ready</h1>
    <p style="margin:0 0 24px 0;font-family:${FONT_BODY};font-size:14px;color:${COLOR_TEXT_SECONDARY};line-height:1.6;">
      We finished analyzing <strong style="color:${COLOR_TEXT};">${safeDomain}</strong>. Here is a quick summary of your results.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLOR_ACCENT};border:1px solid ${COLOR_BORDER};border-radius:${RADIUS_MD};margin:0 0 24px 0;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding:0 0 12px 0;font-family:${FONT_BODY};font-size:13px;color:${COLOR_TEXT_SECONDARY};">Domain</td>
              <td align="right" style="padding:0 0 12px 0;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLOR_TEXT};">${safeDomain}</td>
            </tr>
            <tr>
              <td style="padding:0 0 12px 0;font-family:${FONT_BODY};font-size:13px;color:${COLOR_TEXT_SECONDARY};">Score</td>
              <td align="right" style="padding:0 0 12px 0;font-family:${FONT_DISPLAY};font-size:20px;font-weight:600;color:${COLOR_PRIMARY};">${score}<span style="font-size:14px;color:${COLOR_TEXT_SECONDARY};font-weight:400;"> / 100</span></td>
            </tr>
            <tr>
              <td style="font-family:${FONT_BODY};font-size:13px;color:${COLOR_TEXT_SECONDARY};">Grade</td>
              <td align="right" style="font-family:${FONT_DISPLAY};font-size:18px;font-weight:600;color:${COLOR_TEXT};">${safeGrade}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px 0;">
      <tr>
        <td style="border-radius:${RADIUS_MD};background-color:${COLOR_PRIMARY};">
          <a href="${safeReportUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 24px;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLOR_BACKGROUND};text-decoration:none;border-radius:${RADIUS_MD};">View Full Report</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:${FONT_BODY};font-size:13px;color:${COLOR_TEXT_SECONDARY};line-height:1.6;">
      Or copy this link into your browser:<br />
      <a href="${safeReportUrl}" style="color:${COLOR_PRIMARY};word-break:break-all;">${safeReportUrl}</a>
    </p>
  `;

  return { subject, html: layout(body) };
}

export function auditCompleteNotificationTemplate(
  domain: string,
  score: number,
  grade: string,
): EmailTemplate {
  const subject = `AEO Audit Complete: ${domain} scored ${score}/100 (${grade})`;
  const safeDomain = escapeHtml(domain);
  const safeGrade = escapeHtml(grade);

  const body = `
    <h1 style="margin:0 0 16px 0;font-family:${FONT_DISPLAY};font-size:20px;font-weight:600;color:${COLOR_TEXT};letter-spacing:-0.01em;line-height:1.3;">Audit complete</h1>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid ${COLOR_BORDER};border-radius:${RADIUS_MD};">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid ${COLOR_BORDER};font-family:${FONT_BODY};font-size:13px;color:${COLOR_TEXT_SECONDARY};">Domain</td>
        <td align="right" style="padding:12px 16px;border-bottom:1px solid ${COLOR_BORDER};font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLOR_TEXT};">${safeDomain}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid ${COLOR_BORDER};font-family:${FONT_BODY};font-size:13px;color:${COLOR_TEXT_SECONDARY};">Score</td>
        <td align="right" style="padding:12px 16px;border-bottom:1px solid ${COLOR_BORDER};font-family:${FONT_DISPLAY};font-size:16px;font-weight:600;color:${COLOR_PRIMARY};">${score} / 100</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-family:${FONT_BODY};font-size:13px;color:${COLOR_TEXT_SECONDARY};">Grade</td>
        <td align="right" style="padding:12px 16px;font-family:${FONT_DISPLAY};font-size:16px;font-weight:600;color:${COLOR_TEXT};">${safeGrade}</td>
      </tr>
    </table>
  `;

  return { subject, html: layout(body) };
}

export function welcomeEmailTemplate(email: string): EmailTemplate {
  const subject = 'Welcome to AEO Auditor';
  const safeEmail = escapeHtml(email);
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://aeoauditor.com').trim();
  const safeSiteUrl = escapeHtml(siteUrl);

  const body = `
    <h1 style="margin:0 0 12px 0;font-family:${FONT_DISPLAY};font-size:24px;font-weight:600;color:${COLOR_TEXT};letter-spacing:-0.01em;line-height:1.3;">Welcome to AEO Auditor</h1>
    <p style="margin:0 0 16px 0;font-family:${FONT_BODY};font-size:14px;color:${COLOR_TEXT};line-height:1.6;">
      Hi <strong>${safeEmail}</strong>,
    </p>
    <p style="margin:0 0 24px 0;font-family:${FONT_BODY};font-size:14px;color:${COLOR_TEXT_SECONDARY};line-height:1.6;">
      Thanks for joining AEO Auditor. We help you measure how well your site is optimized for answer-engine and AI search experiences, and surface the changes that move your score the most.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="border-radius:${RADIUS_MD};background-color:${COLOR_PRIMARY};">
          <a href="${safeSiteUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 24px;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLOR_BACKGROUND};text-decoration:none;border-radius:${RADIUS_MD};">Visit AEO Auditor</a>
        </td>
      </tr>
    </table>
  `;

  return { subject, html: layout(body) };
}
