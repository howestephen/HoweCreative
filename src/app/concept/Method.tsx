const experience = [
  {
    years: "Dec 2021 - Present",
    role: "Lead Designer",
    company: "UNCX Network",
    note: "Sole in-house designer across brand, product UI, 3D, motion and educational content. Working with developers, marketing and external creative partners.",
  },
  {
    years: "Jul 2018 - Jun 2021",
    role: "Designer",
    company: "Switch Studios",
    note: "Design, motion and production assets for 30 shipped HTML5 casino games. Embedded in the development team, committing assets directly to the codebase. Game art direction was set by the Art Lead.",
  },
  {
    years: "May 2016 - Aug 2018",
    role: "Designer & Animator",
    company: "Howe Creative / Freelance",
    note: "Video, animation and web projects for international clients. Produced a digital chef-training course for Chalet Chardons and corporate learning content.",
  },
];
const earlier = [
  [
    "2014 - 2016",
    "Qtac Solutions",
    "2nd Line Support Technician",
    "Payroll software support, staff training and company website redesign.",
  ],
  [
    "2012 - 2016",
    "Burger Theory",
    "Web & Social Media Manager",
    "Website implementation, promotion and events, alongside other roles.",
  ],
  [
    "2011 - 2012",
    "Hot Biscuit",
    "Venue & Promotions Manager",
    "Design, programming and promotion across three Brighton music venues.",
  ],
  [
    "2009 - 2011",
    "412 Promotions",
    "Brand Manager",
    "Web, editorial, event photography and an independent retail business.",
  ],
  [
    "2008 - 2009",
    "Right Click Computers",
    "Junior Helpdesk Technician",
    "Remote support for media servers across UK universities.",
  ],
  [
    "2007 - 2008",
    "BBC",
    "Database Technician",
    "Database migration and cleansing at Television Centre.",
  ],
  [
    "2005 - 2006",
    "Good Salon Guide",
    "Web Manager & Graphic Designer",
    "Client websites, graphic design and office network administration.",
  ],
];

export function Method() {
  return (
    <section id="experience" className="experience-section wrap">
      <div className="about-intro">
        <div>
          <span className="eyebrow">03 / The person behind the work</span>
          <h2>
            A maker’s curiosity.
            <br />A practitioner’s depth.
          </h2>
          <p>
            I’m Stephen, a creative technologist based in Norwich. My career has
            moved through music venues, independent brands, digital learning,
            games and financial products. The thread is a habit of learning how
            things work, then making them better.
          </p>
          <p>
            Today I bring that experience to product design, creative tools and
            AI-assisted production. I’m looking for a hands-on role where visual
            craft and technical problem-solving matter equally.
          </p>
        </div>
        <figure>
          <img
            src="/profile-photo.webp"
            alt="Stephen Howe"
            width="400"
            height="400"
            loading="lazy"
          />
          <figcaption>Norwich, UK / Working remotely</figcaption>
        </figure>
      </div>
      <div className="career-list">
        {experience.map((job) => (
          <article key={job.company}>
            <span className="career-date">{job.years}</span>
            <div>
              <h3>
                {job.role}
                <span>{job.company}</span>
              </h3>
              <p>{job.note}</p>
            </div>
          </article>
        ))}
      </div>
      <details className="earlier-career">
        <summary>Earlier experience, 2005 - 2016</summary>
        <div className="career-list">
          {earlier.map(([years, company, role, note]) => (
            <article key={company}>
              <span className="career-date">{years}</span>
              <div>
                <h3>
                  {role}
                  <span>{company}</span>
                </h3>
                <p>{note}</p>
              </div>
            </article>
          ))}
        </div>
      </details>
      <div className="education-row">
        <div>
          <span className="eyebrow">University of Portsmouth / 2007</span>
          <h3>BSc (Hons) Entertainment Technology</h3>
          <p>
            First Class Honours. IBM Prize for Best Creative Technologies
            Project.
          </p>
        </div>
        <div>
          <span className="eyebrow">Tech Educators / 2024</span>
          <h3>Full Stack Coding Bootcamp</h3>
          <p>
            12-week intensive in React, Next.js, Node.js, PostgreSQL and
            Supabase.
          </p>
        </div>
      </div>
    </section>
  );
}
