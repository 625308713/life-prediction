import nodemailer, { Transporter } from "nodemailer";

/**
 * Provider-agnostic email backbone over SMTP. Works with any SMTP provider
 * (Resend, Amazon SES, Aliyun/Tencent DirectMail, SendGrid, Gmail, ...).
 * Configure via env; when SMTP is not configured it gracefully no-ops, so the
 * product keeps working without email (mirrors the AI service behavior).
 *
 * Required env to enable:
 *   EMAIL_SMTP_HOST   smtp host (e.g. smtp.resend.com, smtpdm.aliyun.com)
 *   EMAIL_SMTP_PORT   smtp port (465 for SMTPS, 587 for STARTTLS)
 *   EMAIL_SMTP_USER   smtp username
 *   EMAIL_SMTP_PASS   smtp password / API key
 *   EMAIL_FROM        from address, e.g. "LifeScore <noreply@your-domain>"
 */

const SMTP_HOST = process.env.EMAIL_SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.EMAIL_SMTP_PORT || "587", 10);
const SMTP_USER = process.env.EMAIL_SMTP_USER || "";
const SMTP_PASS = process.env.EMAIL_SMTP_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "LifeScore <noreply@example.com>";

let transporter: Transporter | null = null;

export function isEmailEnabled(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function getTransporter(): Transporter | null {
  if (!isEmailEnabled()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // SMTPS on 465, STARTTLS otherwise
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email. Returns true if sent, false if email is disabled or failed.
 * Never throws — email must not break the request path.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const tx = getTransporter();
  if (!tx) {
    console.warn("[Email] SMTP not configured, skipping send");
    return false;
  }
  try {
    await tx.sendMail({
      from: EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    return true;
  } catch (error) {
    console.error("[Email] Send failed:", error);
    return false;
  }
}

type EmailLang = "zh" | "en";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Confirmation email sent after a lead leaves their address on the result
 * page: gives them a stable recovery link back to their result.
 */
export async function sendResultRecoveryEmail(params: {
  to: string;
  resultUrl: string;
  language: EmailLang;
}): Promise<boolean> {
  const { to, resultUrl, language } = params;
  const safeUrl = escapeHtml(resultUrl);
  const copy =
    language === "en"
      ? {
          subject: "Your LifeScore result",
          heading: "Your LifeScore is saved",
          body: "Here is the link back to your result. It is private to you — keep it if you want to revisit or compare later.",
          cta: "View my result",
          footer:
            "You received this because you asked to save your LifeScore result. LifeScore is for health education and self-reflection, not medical diagnosis.",
        }
      : {
          subject: "你的 LifeScore 结果",
          heading: "你的 LifeScore 已保存",
          body: "这是回到你结果页的链接。它只属于你，想之后复看或对比时可以用它找回。",
          cta: "查看我的结果",
          footer:
            "你收到这封邮件，是因为你在结果页选择了保存。LifeScore 用于健康教育和自我观察，不用于医学诊断。",
        };

  const html = `<!doctype html><html><body style="margin:0;background:#f5f7f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#19312e;color:#fff;border-radius:16px;padding:28px;">
      <p style="margin:0;font-size:13px;letter-spacing:2px;color:#9fc6c0;">LIFESCORE</p>
      <h1 style="margin:12px 0 0;font-size:22px;">${escapeHtml(copy.heading)}</h1>
      <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#d8e3e0;">${escapeHtml(copy.body)}</p>
      <a href="${safeUrl}" style="display:inline-block;margin-top:22px;background:#fff;color:#19312e;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;font-size:15px;">${escapeHtml(copy.cta)}</a>
    </div>
    <p style="margin:18px 4px 0;font-size:12px;line-height:1.6;color:#8a8173;">${escapeHtml(copy.footer)}</p>
  </div>
</body></html>`;
  const text = `${copy.heading}\n\n${copy.body}\n\n${resultUrl}\n\n${copy.footer}`;

  return sendEmail({ to, subject: copy.subject, html, text });
}
