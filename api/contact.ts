import { checkRateLimit } from "./_lib/rate-limit";

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

interface Request {
  method?: string;
  body?: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}
interface Response {
  status(code: number): this;
  json(body: unknown): this;
  setHeader(name: string, value: string): this;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const ip =
    ((req.headers["x-forwarded-for"] as string) ?? "").split(",")[0].trim() ||
    "unknown";
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
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
