type AuditCompleteEmail = {
  subject: string;
  html: string;
};

const BRAND_PRIMARY = '#2563EB';
const BRAND_PRIMARY_DARK = '#1D4ED8';
const TEXT_PRIMARY = '#111827';
const TEXT_MUTED = '#4B5563';
const BORDER = '#E5E7EB';
const BG_PAGE = '#F9FAFB';
const BG_CARD = '#FFFFFF';

function gradeColor(grade: string): string {
  const g = grade.trim().toUpperCase().charAt(0);
  switch (g) {
    case 'A':
      return '#16A34A';
    case 'B':
      return '#65A30D';
    case 'C':
      return '#CA8A04';
    case 'D':
      return '#EA580C';
    case 'F':
      return '#DC2626';
    default:
      return BRAND_PRIMARY;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function auditCompleteEmail(
  auditUrl: string,
  score: number,
  grade: string,
): AuditCompleteEmail {
  const safeUrl = escapeHtml(auditUrl);
  const safeGrade = escapeHtml(grade);
  const safeScore = escapeHtml(String(score));
  const gradeBadgeColor = gradeColor(grade);

  const subject = `Your AEO audit is ready — Score ${score} (${grade})`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BG_PAGE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:${TEXT_PRIMARY};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BG_PAGE};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:${BG_CARD};border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:${BRAND_PRIMARY};padding:24px 32px;">
                <div style="color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:-0.01em;">Campaign Creators</div>
                <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px;">AEO Auditor</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:${TEXT_PRIMARY};font-weight:700;">Your AEO audit is ready</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:${TEXT_MUTED};">
                  We finished analyzing your site for Answer Engine Optimization. Here's a quick look at the headline result — open the full report for the detailed breakdown and recommendations.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BG_PAGE};border:1px solid ${BORDER};border-radius:10px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:20px 24px;" width="60%">
                      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${TEXT_MUTED};font-weight:600;">Overall score</div>
                      <div style="font-size:40px;line-height:1;font-weight:700;color:${TEXT_PRIMARY};margin-top:6px;">${safeScore}<span style="font-size:18px;color:${TEXT_MUTED};font-weight:500;"> / 100</span></div>
                    </td>
                    <td style="padding:20px 24px;text-align:right;" width="40%">
                      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${TEXT_MUTED};font-weight:600;">Grade</div>
                      <div style="display:inline-block;margin-top:6px;padding:8px 18px;background-color:${gradeBadgeColor};color:#FFFFFF;font-size:24px;font-weight:700;border-radius:8px;line-height:1;">${safeGrade}</div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center">
                      <a href="${safeUrl}" style="display:inline-block;background-color:${BRAND_PRIMARY};color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px;border:1px solid ${BRAND_PRIMARY_DARK};">View full report</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:${TEXT_MUTED};">
                  Or paste this link into your browser:<br />
                  <a href="${safeUrl}" style="color:${BRAND_PRIMARY};word-break:break-all;">${safeUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${BORDER};background-color:${BG_PAGE};">
                <p style="margin:0;font-size:12px;line-height:1.5;color:${TEXT_MUTED};">
                  Sent by Campaign Creators — AEO Auditor. If you didn't request this audit, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}
