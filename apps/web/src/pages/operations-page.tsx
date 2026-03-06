import type { PropertySummary } from "@tps/types";

import { Panel } from "../components/panel.js";

interface OperationsPageProps {
  property: PropertySummary;
}

export function OperationsPage({ property }: OperationsPageProps) {
  return (
    <div className="page-stack">
      <Panel title="Operations staging" eyebrow={property.name}>
        <p>
          This route is the handoff point for train schedules, train runs,
          delays, consist, and crew modules from the SRD migration order.
        </p>
      </Panel>
      <div className="two-column-grid">
        <Panel title="Master/detail pattern" eyebrow="Delay management">
          <p>Reserved for the two-column delay workspace described in the SRD.</p>
        </Panel>
        <Panel title="Persistent employee panel" eyebrow="Crew scheduling">
          <p>Reserved for the crew assignment layout with a fixed employee context panel.</p>
        </Panel>
      </div>
    </div>
  );
}
