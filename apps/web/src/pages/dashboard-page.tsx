import type { PropertySummary } from "@tps/types";

import { Panel } from "../components/panel.js";
import { StatusBadge } from "../components/status-badge.js";

interface DashboardPageProps {
  property: PropertySummary;
  source: "api" | "fallback";
}

export function DashboardPage({ property, source }: DashboardPageProps) {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Foundation</p>
          <h1>{property.name} operations shell</h1>
          <p className="lede">
            The application now boots through a shared session/property contract
            and can switch railroad context from the authenticated shell.
          </p>
        </div>
        <div className="hero-meta">
          <div className="metric-card">
            <span className="metric-label">Profile</span>
            <strong>{property.profile.replace("_", " ")}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Bootstrap Source</span>
            <strong>{source}</strong>
          </div>
        </div>
      </section>

      <section className="section-grid">
        <Panel title="Route guards" eyebrow="Access">
          <p>API bootstrap, bearer auth, and property-scoped routes are wired end to end.</p>
          <StatusBadge tone="success" label="ready" />
        </Panel>
        <Panel title="Branding" eyebrow="Theme">
          <p>Herzog defaults remain global while railroad context is available for overrides.</p>
          <StatusBadge tone="warning" label="override-ready" />
        </Panel>
        <Panel title="Next modules" eyebrow="Plan">
          <p>User management, settings, and reference data can now build on shared contracts.</p>
          <StatusBadge tone="neutral" label="queued" />
        </Panel>
      </section>
    </div>
  );
}
