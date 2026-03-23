type ContactPayload = {
  name?: string;
  email?: string;
  projectType?: string;
  brief?: string;
  website?: string; // Honeypot: must stay empty
};

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const accessKey = process.env.EMAIL_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ success: false, message: "Email service not configured." });
  }

  const body = (req.body ?? {}) as ContactPayload;
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const projectType = (body.projectType ?? "").trim();
  const brief = (body.brief ?? "").trim();
  const website = (body.website ?? "").trim();

  if (website) {
    // Treat honeypot submissions as successful to avoid signaling bots.
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !brief) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address." });
  }

  try {
    const upstream = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        subject: `Portfolio enquiry from ${name}${projectType ? ` - ${projectType}` : ""}`,
        message: `Project type: ${projectType || "-"}\n\n${brief}`,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok || !data.success) {
      return res.status(502).json({
        success: false,
        message: "Unable to send message right now. Please try again.",
      });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Network error. Please try again.",
    });
  }
}
