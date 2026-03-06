import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

const navigation = [
  "Dashboard",
  "Schedules",
  "Train Runs",
  "Delays",
  "Crew",
  "Reporting",
  "Settings"
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">HERZOG</div>
          <p className="brand-subtitle">Transit Property Software 2.0</p>
        </div>
        <nav className="nav-list" aria-label="Primary">
          {navigation.map((item, index) => (
            <a
              key={item}
              className={index === 0 ? "nav-item active" : "nav-item"}
              href="/"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="version-block">v0.1.0 foundation</div>
      </aside>
      <main className="content-shell">{children}</main>
    </div>
  );
}

