import type { PropertySummary } from "@tps/types";

import { Panel } from "../components/panel.js";

interface SettingsPageProps {
  property: PropertySummary;
}

export function SettingsPage({ property }: SettingsPageProps) {
  return (
    <div className="page-stack">
      <Panel title="Property settings" eyebrow={property.code}>
        <p>
          Settings scaffolding is ready for branding overrides, permission seeds,
          report configuration, and railroad profile defaults.
        </p>
      </Panel>
    </div>
  );
}
