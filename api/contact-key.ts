// Serves the public Web3Forms key to builds that lack it, such as the
// redesign, which builds in a separate Vercel project. The key is already
// public: client-mode builds embed it in the page.

interface Request {
  method?: string;
}
interface Response {
  status(code: number): this;
  json(body: unknown): this;
  setHeader(name: string, value: string): this;
}

export default function handler(req: Request, res: Response) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const accessKey = process.env.EMAIL_ACCESS_KEY ?? process.env.VITE_EMAIL_ACCESS_KEY;
  if (!accessKey) {
    return res.status(503).json({ message: "Contact form is not configured." });
  }

  res.setHeader("Cache-Control", "public, max-age=300");
  return res.status(200).json({ accessKey });
}
