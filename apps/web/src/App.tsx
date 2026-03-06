import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/app-shell.js";
import { useBootstrap } from "./hooks/use-bootstrap.js";
import { DashboardPage } from "./pages/dashboard-page.js";
import { OperationsPage } from "./pages/operations-page.js";
import { SettingsPage } from "./pages/settings-page.js";

export function App() {
  const { data, isLoading, source } = useBootstrap();
  const [selectedProperty, setSelectedProperty] = useState(data.defaultProperty);
  const activeProperty =
    data.availableProperties.find((property) => property.code === selectedProperty) ??
    data.availableProperties[0];

  const appVersion = import.meta.env.VITE_APP_VERSION ?? "0.1.0";

  if (isLoading || !activeProperty) {
    return <div className="loading-screen">Loading TPS 2.0...</div>;
  }

  return (
    <AppShell
      appVersion={appVersion}
      properties={data.availableProperties}
      selectedProperty={activeProperty.code}
      onPropertyChange={setSelectedProperty}
    >
      <header className="topbar">
        <div>
          <p className="eyebrow">Authenticated as</p>
          <strong>{data.user.displayName}</strong>
        </div>
        <div className="topbar-chip">
          <span>Property scope</span>
          <strong>{activeProperty.name}</strong>
        </div>
        <div className="topbar-chip">
          <span>Data source</span>
          <strong>{source}</strong>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<DashboardPage property={activeProperty} source={source} />} />
        <Route path="/operations" element={<OperationsPage property={activeProperty} />} />
        <Route path="/settings" element={<SettingsPage property={activeProperty} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
