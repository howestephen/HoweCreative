import { EarlierWork } from "../concept/EarlierWork";
import { PortfolioExperience } from "../experience/PortfolioExperience";
import { WorkIndex } from "../concept/WorkIndex";
import { Capabilities } from "../concept/Capabilities";
import { Method } from "../concept/Method";
import { ContactFoot } from "../concept/ContactFoot";

export function Home() {
  return (
    <div className="w-full">
      <PortfolioExperience />
      <WorkIndex />
      <Capabilities />
      <Method />
      <EarlierWork />
      <ContactFoot />
    </div>
  );
}
