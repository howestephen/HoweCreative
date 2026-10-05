import { checkRateLimit } from "./_lib/rate-limit.js";

type ContactPayload = {
  name?: string;
  email?: string;
  projectType?: string;
  brief?: string;
  website?: string; // Honeypot: must stay empty
};

const WEB3FORMS_URL = "https://api.web3forms.com/submit";
// Kept in step with the form's maxLength attributes.
const MAX_NAME = 200;
const MAX_BRIEF = 5000;

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

  const accessKey = process.env.WEB3FORMS_SERVER_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ success: false, message: "Email service not configured." });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const field = (key: keyof ContactPayload) => {
    const value = body[key];
    return value === undefined ? "" : typeof value === "string" ? value.trim() : null;
  };
  const name = field("name");
  const email = field("email");
  const projectType = field("projectType");
  const brief = field("brief");
  const website = field("website");

  // A field sent as a number, object or array is a malformed request, not a crash.
  if (name === null || email === null || projectType === null || brief === null || website === null) {
    return res.status(400).json({ success: false, message: "Invalid form fields." });
  }

  if (website) {
    // Treat honeypot submissions as successful to avoid signaling bots.
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !brief) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  if (name.length > MAX_NAME || brief.length > MAX_BRIEF || projectType.length > MAX_NAME) {
    return res.status(400).json({ success: false, message: "Message is too long." });
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
        // Newlines in a subject could smuggle extra mail headers.
        subject: `Portfolio enquiry from ${name.replace(/[\r\n]+/g, " ")}${projectType ? ` - ${projectType.replace(/[\r\n]+/g, " ")}` : ""}`,
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
