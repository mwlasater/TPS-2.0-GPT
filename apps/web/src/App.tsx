import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/app-shell.js";
import { useAdminData } from "./hooks/use-admin-data.js";
import { useBaselineData } from "./hooks/use-baseline-data.js";
import { useBootstrap } from "./hooks/use-bootstrap.js";
import { useOperationsData } from "./hooks/use-operations-data.js";
import { usePlatformData } from "./hooks/use-platform-data.js";
import { usePropertyData } from "./hooks/use-property-data.js";
import { useUserAdminData } from "./hooks/use-user-admin-data.js";
import { DashboardPage } from "./pages/dashboard-page.js";
import { OperationsPage } from "./pages/operations-page.js";
import { SettingsPage } from "./pages/settings-page.js";

export function App() {
  const { data, isLoading, source } = useBootstrap();
  const [selectedProperty, setSelectedProperty] = useState(data.defaultProperty);
  const activeProperty =
    data.availableProperties.find((property) => property.code === selectedProperty) ??
    data.availableProperties[0];
  const adminData = useAdminData(activeProperty?.code ?? data.defaultProperty);
  const baselineData = useBaselineData(activeProperty?.code ?? data.defaultProperty);
  const propertyData = usePropertyData(activeProperty?.code ?? data.defaultProperty);
  const platformData = usePlatformData(activeProperty?.code ?? data.defaultProperty);
  const userAdminData = useUserAdminData(activeProperty?.code ?? data.defaultProperty, "ops-manager");
  const operationsData = useOperationsData(activeProperty?.code ?? data.defaultProperty);

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
        <Route
          path="/operations"
          element={
            <OperationsPage
              consist={operationsData.consist}
              crew={operationsData.crew}
              delayEvents={operationsData.delayEvents}
              fareEnforcement={operationsData.fareEnforcement}
              isSaving={operationsData.isSaving}
              property={activeProperty}
              referenceData={operationsData.referenceData}
              runs={operationsData.runs}
              approvalHistory={operationsData.approvalHistory}
              selectedRunId={operationsData.selectedRunId}
              selectRun={operationsData.selectRun}
              saveConsist={operationsData.saveConsist}
              saveCrew={operationsData.saveCrew}
              saveDelay={operationsData.saveDelay}
              saveFare={operationsData.saveFare}
              saveRunApproval={operationsData.saveRunApproval}
              saveStop={operationsData.saveStop}
              schedules={operationsData.schedules}
              stationStops={operationsData.stationStops}
              source={operationsData.source}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              attendance={baselineData.attendance}
              files={platformData.files}
              jobProfiles={baselineData.jobProfiles}
              isSaving={
                propertyData.isSaving ||
                adminData.isSaving ||
                baselineData.isSaving ||
                platformData.isSaving ||
                userAdminData.isSaving
              }
              managedUserActions={userAdminData.actions}
              managedUserDetail={userAdminData.detail}
              notifications={platformData.notifications}
              permissionGroups={adminData.permissionGroups}
              powerBi={platformData.powerBi}
              property={activeProperty}
              reportConfig={adminData.reportConfig}
              saveAttendance={baselineData.saveAttendance}
              saveJobProfile={baselineData.saveJobProfile}
              saveNotification={platformData.saveNotification}
              savePermissionGroups={userAdminData.savePermissionGroups}
              savePropertyAccess={userAdminData.savePropertyAccess}
              saveReportConfig={adminData.saveReportConfig}
              saveSettings={propertyData.saveSettings}
              settings={propertyData.settings}
              source={propertyData.source}
              users={propertyData.users}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
