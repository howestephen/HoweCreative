import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";

import { CAREER_START, yearsSince } from "../lib/tenure";

const PRINCIPLES = [
  {
    index: "01",
    title: "Systems over surfaces",
    body: "I don't hand over artefacts - I hand over the machine that makes them: templates, tokens, pipelines, and the documentation to run them without me.",
  },
  {
    index: "02",
    title: "Trade-offs are the design",
    body: "Every project above lists its compromises. That's deliberate: the constraints are where the real decisions live, and where senior work earns its keep.",
  },
  {
    index: "03",
    title: "Judgement where it pays",
    body: "Automate production ruthlessly; keep taste and accountability human. One tap of approval should replace a day of production - never the other way round.",
  },
] as const;

const EXPERIENCE = [
  {
    years: "2021 -",
    role: "Lead Designer, UNCX Network",
    note: "Sole designer at a multi-chain DeFi protocol - brand to product.",
  },
  {
    years: "2018-21",
    role: "Designer, Switch Studios",
    note: "30 HTML5 casino games shipped; embedded in the dev team.",
  },
  {
    years: "2016-18",
    role: "Designer & Animator, howecreative.co.uk",
    note: "Freelance video, animation, and web for international clients.",
  },
  {
    years: "2014-16",
    role: "2nd Line Support Technician, Qtac Solutions",
    note: "Senior support for HMRC payroll software; trained apprentices, rebuilt the company website.",
  },
  {
    years: "2012-16",
    role: "Web & Social Media Manager, Burger Theory",
    note: "Website, social media, and event staffing for a street-food startup, from day one.",
  },
  {
    years: "2011-12",
    role: "Venue & Promotions Manager, Hot Biscuit",
    note: "Events, marketing, design and venue management for three popular Brighton music venues.",
  },
  {
    years: "2009-11",
    role: "Brand Manager, 412 Promotions",
    note: "Website designer and contribution editor, retail and brand manager.",
  },
  {
    years: "2008-09",
    role: "Junior Helpdesk Technician, Right Click Computers",
    note: "Remote support for media servers in ~150 UK universities.",
  },
  {
    years: "2007-08",
    role: "Database Technician, BBC",
    note: "Core-database migration and cleansing at BBC Television Centre.",
  },
  {
    years: "2005-06",
    role: "Web Manager & Graphic Designer, Good Salon Guide",
    note: "Office network admin, graphic design, and building websites for clients.",
  },
] as const;

const RECENT_ROLE_COUNT = 3;

const QUALIFICATIONS = [
  {
    title: "BSc (Hons) Entertainment Technology, First Class",
    institution: "University of Portsmouth",
    year: "2007",
    detail:
      "The only First Class Honours on the course, and winner of the IBM Prize for Best Creative Technologies Project. My final dissertation received a grade of 90%, the highest in the department that year.",
  },
  {
    title: "Full Stack Coding Bootcamp",
    institution: "Tech Educators, 12 weeks intensive",
    year: "2024",
    detail:
      "A twelve-week intensive covering modern full-stack development with React, Next.js, Node.js, PostgreSQL, and Supabase. I finished with an average score equivalent to a first-class degree, and now use these skills daily to ship production software alongside my design work.",
  },
] as const;

export function Method() {
  const [showAllRoles, setShowAllRoles] = useState(false);
  const visibleExperience = showAllRoles ? EXPERIENCE : EXPERIENCE.slice(0, RECENT_ROLE_COUNT);

  return (
    <section id="method" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-12 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 className="text-3xl md:text-4xl">How I work</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            the short version
          </span>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {PRINCIPLES.map((principle, i) => (
            <motion.div
              key={principle.index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div className="mb-3 font-mono text-[11px] tracking-[0.18em] text-accent">
                {principle.index}
              </div>
              <h3 className="mb-3 text-xl">{principle.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
            </motion.div>
          ))}
        </div>

        <div id="experience" className="mt-20 scroll-mt-24 border-t border-border pt-14">
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h2 className="text-3xl md:text-4xl">Experience</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              2005 to today · {yearsSince(CAREER_START)} years
            </span>
          </div>
          <div className="space-y-0">
            {visibleExperience.map((entry) => (
              <div
                key={entry.role}
                className="grid gap-1 border-b border-border py-4 md:grid-cols-[7rem_1fr_1fr] md:gap-6"
              >
                <span className="font-mono text-[11px] text-muted-foreground">{entry.years}</span>
                <span className="font-medium text-foreground">{entry.role}</span>
                <span className="text-sm text-muted-foreground">{entry.note}</span>
              </div>
            ))}
          </div>

          {EXPERIENCE.length > RECENT_ROLE_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllRoles((value) => !value)}
              aria-expanded={showAllRoles}
              className="mt-5 inline-flex items-center gap-2 border border-foreground/25 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground hover:text-accent"
            >
              {showAllRoles ? (
                <>
                  <Minus className="h-3 w-3" /> Show recent roles only
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" /> Show {EXPERIENCE.length - RECENT_ROLE_COUNT} earlier
                  roles
                </>
              )}
            </button>
          )}

        </div>

        <div id="education" className="mt-20 scroll-mt-24 border-t border-border pt-14">
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h2 className="text-3xl md:text-4xl">Education &amp; recognition</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              degree · bootcamp · certifications
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {QUALIFICATIONS.map((item) => (
              <div key={item.title} className="border-l-2 border-accent pl-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg leading-snug text-foreground">{item.title}</h3>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {item.year}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.institution}</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{item.detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            I also hold a Certified ScrumMaster qualification (Scrum Alliance, 2019) and have
            worked in Agile teams throughout my career. The formal certification has since
            lapsed, but running work in structured, iterative sprints is still how I ship.
          </p>
        </div>
      </div>
    </section>
  );
}
