import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL || "abdul@portfolio.com";

  if (!apiKey || !domain) {
    console.warn("Mailgun not configured. Email not sent.");
    return false;
  }

  try {
    const mg = mailgun.client({ username: "api", key: apiKey });

    const result = await mg.messages.create(domain, {
      from: fromEmail,
      to: [data.to],
      subject: data.subject,
      html: data.html,
      text: data.text || stripHtml(data.html),
    });

    return true;
  } catch (error: any) {
    console.error("Failed to send email:", error.message);
    return false;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
