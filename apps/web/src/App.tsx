import { AppShell } from "./components/app-shell.js";
import { DashboardPage } from "./features/shell/dashboard.js";
import { demoSession } from "./lib/session.js";

export function App() {
  return (
    <AppShell>
      <header className="topbar">
        <div>
          <p className="eyebrow">Authenticated as</p>
          <strong>{demoSession.displayName}</strong>
        </div>
        <div className="topbar-chip">
          <span>Property scope</span>
          <strong>{demoSession.allowedProperties.join(", ")}</strong>
        </div>
      </header>
      <DashboardPage />
    </AppShell>
  );
}

