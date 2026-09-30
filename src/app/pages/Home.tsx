import { useEffect } from "react";
import { Masthead } from "../concept/Masthead";
import { WorkIndex } from "../concept/WorkIndex";
import { Capabilities } from "../concept/Capabilities";
import { Method } from "../concept/Method";
import { ContactFoot } from "../concept/ContactFoot";

export function Home() {
  // Arriving from another page with #section (the header links on the
  // archive), scroll to it once the page has rendered.
  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (target) document.getElementById(target)?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div className="w-full">
      <Masthead />
      <WorkIndex />
      <Capabilities />
      <Method />
      <ContactFoot />
    </div>
  );
}
