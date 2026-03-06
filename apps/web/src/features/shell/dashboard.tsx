export function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Foundation</p>
          <h1>TPS 2.0 monorepo scaffold</h1>
          <p className="lede">
            This shell establishes the Herzog-branded layout, guarded routes,
            and shared UI tokens described in the SRD and implementation plan.
          </p>
        </div>
        <div className="hero-meta">
          <div className="metric-card">
            <span className="metric-label">API Contract</span>
            <strong>/api/v1</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Tenant Header</span>
            <strong>X-Property</strong>
          </div>
        </div>
      </section>

      <section className="section-grid">
        <article className="info-card">
          <h2>Authenticated shell</h2>
          <p>Railroad-aware navigation, version visibility, and protected routing are in place.</p>
        </article>
        <article className="info-card">
          <h2>Design tokens</h2>
          <p>Oswald, Roboto, Herzog gold, and action navy are defined as the default global theme.</p>
        </article>
        <article className="info-card">
          <h2>Vertical slice</h2>
          <p>The API and web app now share typed contracts for health, version, and tenant access.</p>
        </article>
      </section>
    </div>
  );
}

