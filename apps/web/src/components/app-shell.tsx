import type { PropertyCode, PropertySummary } from "@tps/types";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface AppShellProps {
  appVersion: string;
  children: ReactNode;
  properties: PropertySummary[];
  selectedProperty: PropertyCode;
  onPropertyChange: (property: PropertyCode) => void;
}

const navigation = [
  { label: "Dashboard", to: "/" },
  { label: "Operations", to: "/operations" },
  { label: "Settings", to: "/settings" }
];

export function AppShell({
  appVersion,
  children,
  properties,
  selectedProperty,
  onPropertyChange
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">HERZOG</div>
          <p className="brand-subtitle">Transit Property Software 2.0</p>
        </div>
        <nav className="nav-list" aria-label="Primary">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              to={item.to}
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <label className="sidebar-selector">
          <span className="eyebrow inverse">Property</span>
          <select
            value={selectedProperty}
            onChange={(event) => onPropertyChange(event.target.value as PropertyCode)}
          >
            {properties.map((property) => (
              <option key={property.code} value={property.code}>
                {property.name}
              </option>
            ))}
          </select>
        </label>
        <div className="version-block">v{appVersion}</div>
      </aside>
      <main className="content-shell">{children}</main>
    </div>
  );
}
