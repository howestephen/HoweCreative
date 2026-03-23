import { useState } from "react";
import { motion } from "motion/react";
import { Send, TerminalSquare } from "lucide-react";

import { contactContent } from "../data/portfolio";

type Status = "idle" | "sending" | "success" | "error";

export function ContactPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "f5ddad97-dce5-4c83-8882-64d14fadb0ee",
          name,
          email,
          subject: `Portfolio enquiry from ${name}${projectType ? ` — ${projectType}` : ""}`,
          message: `Project type: ${projectType || "—"}\n\n${brief}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setProjectType("");
        setBrief("");
      } else {
        setErrorMsg(data.message ?? "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative z-[20] border-t border-[#ff003c]/20 px-6 py-24 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="max-w-xl"
        >
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff003c]">
            {contactContent.eyebrow}
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {contactContent.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">{contactContent.description}</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="relative overflow-hidden border border-[#ff003c]/25 bg-black/92 p-5 md:p-6"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px)",
            }}
          />

          {status === "success" ? (
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff003c]">Transmission received</div>
              <p className="text-sm text-zinc-400">Message sent. I'll be in touch soon.</p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 underline underline-offset-4 hover:text-white"
              >
                Send another
              </button>
            </div>
          ) : (
            <div className="relative z-10 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {contactContent.fields.name}
                </span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-[#ff003c]/18 bg-black/92 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#ff003c]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {contactContent.fields.email}
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#ff003c]/18 bg-black/92 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#ff003c]"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {contactContent.fields.projectType}
                </span>
                <input
                  type="text"
                  name="projectType"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full border border-[#ff003c]/18 bg-black/92 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#ff003c]"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {contactContent.fields.brief}
                </span>
                <textarea
                  name="brief"
                  rows={6}
                  required
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className="w-full resize-none border border-[#ff003c]/18 bg-black/92 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#ff003c]"
                />
              </label>

              <div className="mt-1 flex flex-col gap-4 border-t border-[#ff003c]/15 pt-5 md:col-span-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <TerminalSquare className="h-4 w-4 text-[#ff003c]" />
                  {status === "error" ? (
                    <span className="text-[#ff003c]">{errorMsg}</span>
                  ) : (
                    contactContent.visualOnlyLabel
                  )}
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 border border-[#ff003c] bg-[#ff003c] px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-[#ff4466] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {status === "sending" ? "Sending…" : contactContent.submitLabel}
                </button>
              </div>
            </div>
          )}
        </motion.form>
      </div>
    </section>
  );
}
