import { Masthead } from "../concept/Masthead";
import { WorkIndex } from "../concept/WorkIndex";
import { Capabilities } from "../concept/Capabilities";
import { Method } from "../concept/Method";
import { ContactFoot } from "../concept/ContactFoot";

export function Home() {
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
