import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/app-shell.js";
import { useAdminData } from "./hooks/use-admin-data.js";
import { useAuth } from "./hooks/use-auth.js";
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
  const auth = useAuth();
  const { data, error, isLoading, source } = useBootstrap(auth.isAuthenticated);
  const [selectedProperty, setSelectedProperty] = useState(data.defaultProperty);
  const [selectedUserId, setSelectedUserId] = useState("ops-manager");
  const activeProperty =
    data.availableProperties.find((property) => property.code === selectedProperty) ??
    data.availableProperties[0];
  const adminData = useAdminData(activeProperty?.code ?? data.defaultProperty);
  const baselineData = useBaselineData(activeProperty?.code ?? data.defaultProperty);
  const propertyData = usePropertyData(activeProperty?.code ?? data.defaultProperty);
  const platformData = usePlatformData(activeProperty?.code ?? data.defaultProperty);
  const activePropertyCode = activeProperty?.code ?? data.defaultProperty;
  const currentUserPermissions = data.user.propertyPermissions[activePropertyCode] ?? [];
  const scopedUsers = propertyData.users;
  const effectiveSelectedUserId =
    scopedUsers.items.find((user) => user.id === selectedUserId)?.id ??
    scopedUsers.items[0]?.id ??
    selectedUserId;
  const userAdminData = useUserAdminData(activePropertyCode, effectiveSelectedUserId, scopedUsers);
  const operationsData = useOperationsData(activeProperty?.code ?? data.defaultProperty);

  const appVersion = import.meta.env.VITE_APP_VERSION ?? "0.1.0";

  if (auth.isLoading || isLoading) {
    return <div className="loading-screen">Loading TPS 2.0...</div>;
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="loading-screen">
        <div className="panel">
          <p className="eyebrow">Authentication</p>
          <h1>Sign in to Herzog TPS 2.0</h1>
          <p>
            The web client is configured for <strong>{auth.mode}</strong> authentication.
          </p>
          {auth.error ? <p>{auth.error}</p> : null}
          <button className="primary-action" onClick={() => void auth.signIn()} type="button">
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (error || !activeProperty) {
    return (
      <div className="loading-screen">
        <div className="panel">
          <p className="eyebrow">Bootstrap Error</p>
          <h1>Authenticated, but bootstrap failed</h1>
          <p>{error ?? "bootstrap.failed"}</p>
          <button className="primary-action" onClick={() => window.location.reload()} type="button">
            Retry bootstrap
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      appVersion={appVersion}
      properties={data.availableProperties}
      selectedProperty={activeProperty.code}
      onPropertyChange={(propertyCode) => {
        setSelectedProperty(propertyCode);
        setSelectedUserId("ops-manager");
      }}
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
        <button className="topbar-chip topbar-action" onClick={() => auth.signOut()} type="button">
          <span>Session</span>
          <strong>Sign out</strong>
        </button>
      </header>
      <Routes>
        <Route path="/" element={<DashboardPage property={activeProperty} source={source} />} />
        <Route
          path="/operations"
          element={
            <OperationsPage
              consist={operationsData.consist}
              consistTemplates={operationsData.consistTemplates}
              crew={operationsData.crew}
              crewTemplates={operationsData.crewTemplates}
              currentUserPermissions={currentUserPermissions}
              delayEvents={operationsData.delayEvents}
              fareEnforcement={operationsData.fareEnforcement}
              fareDashboard={operationsData.fareDashboard}
              fareSummary={operationsData.fareSummary}
              isSaving={operationsData.isSaving}
              property={activeProperty}
              referenceData={operationsData.referenceData}
              runs={operationsData.runs}
              approvalHistory={operationsData.approvalHistory}
              scheduleApprovalHistory={operationsData.scheduleApprovalHistory}
              eventHistory={operationsData.eventHistory}
              impactSummary={operationsData.impactSummary}
              scheduleApprovalSummary={operationsData.scheduleApprovalSummary}
              trainRunStatus={operationsData.trainRunStatus}
              delayAdditionalInfo={operationsData.delayAdditionalInfo}
              delayCommonLocations={operationsData.delayCommonLocations}
              delayTemplates={operationsData.delayTemplates}
              specialMovements={operationsData.specialMovements}
              selectedRunId={operationsData.selectedRunId}
              selectRun={operationsData.selectRun}
              saveConsist={operationsData.saveConsist}
              saveCrew={operationsData.saveCrew}
              swapConsist={operationsData.swapConsist}
              swapCrew={operationsData.swapCrew}
              saveDelay={operationsData.saveDelay}
              createDelayBatch={operationsData.createDelayBatch}
              createDelayTemplate={operationsData.createDelayTemplate}
              saveDelayAdditionalInfo={operationsData.saveDelayAdditionalInfo}
              clearDelayAdditionalInfo={operationsData.clearDelayAdditionalInfo}
              deleteDelay={operationsData.deleteDelay}
              saveBatchRunApproval={operationsData.saveBatchRunApproval}
              initializeRuns={operationsData.initializeRuns}
              saveRunStatus={operationsData.saveRunStatus}
              resetRun={operationsData.resetRun}
              deleteRun={operationsData.deleteRun}
              createFare={operationsData.createFare}
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
              delayCommonLocations={adminData.delayCommonLocations}
              delayTemplates={adminData.delayTemplates}
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
              managedUserHistory={userAdminData.history}
              managedUserDetail={userAdminData.detail}
              notifications={platformData.notifications}
              personnel={baselineData.personnel}
              permissionGroups={adminData.permissionGroups}
              powerBi={platformData.powerBi}
              property={activeProperty}
              referenceData={propertyData.referenceData}
              reportConfig={adminData.reportConfig}
              saveDelayCommonLocation={adminData.saveDelayCommonLocation}
              saveDelayTemplate={adminData.saveDelayTemplate}
              saveAttendance={baselineData.saveAttendance}
              saveJobProfile={baselineData.saveJobProfile}
              createUser={async (input) => {
                const detail = await propertyData.createUser(input);
                setSelectedUserId(detail.id);
              }}
              createPermissionGroup={adminData.createPermissionGroup}
              currentUserPermissions={currentUserPermissions}
              deletePermissionGroup={adminData.deletePermissionGroup}
              saveNotification={platformData.saveNotification}
              savePermissionGroup={adminData.savePermissionGroup}
              savePersonnelStatus={baselineData.savePersonnelStatus}
              savePermissionGroups={userAdminData.savePermissionGroups}
              savePropertyAccess={userAdminData.savePropertyAccess}
              saveReportConfig={adminData.saveReportConfig}
              saveReferenceData={propertyData.saveReferenceData}
              saveSettings={propertyData.saveSettings}
              saveSpecialMovement={adminData.saveSpecialMovement}
              runUserAdminAction={userAdminData.runAdminAction}
              settings={propertyData.settings}
              specialMovements={adminData.specialMovements}
              source={propertyData.source}
              selectedUserId={effectiveSelectedUserId}
              selectUser={setSelectedUserId}
              users={propertyData.users}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
