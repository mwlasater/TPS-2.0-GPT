import type {
  AttendanceExceptionUpdate,
  AttendanceExceptionList,
  DelayCommonLocationList,
  DelayCommonLocationUpdate,
  DelayTemplateList,
  DelayTemplateUpdate,
  FileServiceList,
  JobProfileUpdate,
  JobProfileList,
  ManagedUserCreate,
  UserAdminHistoryList,
  ManagedUserDetail,
  ManagedUserList,
  NotificationUpdate,
  NotificationList,
  PersonnelRecordList,
  PersonnelStatusUpdate,
  PermissionGroupCreate,
  PermissionGroupUpdate,
  PermissionGroupList,
  PowerBiEmbedList,
  PropertySettingsUpdate,
  PropertySettings,
  PropertySummary,
  ReferenceDataset,
  ReportConfigList,
  ReportConfigUpdate,
  SpecialMovementList,
  SpecialMovementUpdate,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";
import { useState } from "react";

import { Panel } from "../components/panel.js";
import { StatusBadge } from "../components/status-badge.js";

interface SettingsPageProps {
  attendance: AttendanceExceptionList;
  delayCommonLocations: DelayCommonLocationList;
  delayTemplates: DelayTemplateList;
  files: FileServiceList;
  isSaving: boolean;
  jobProfiles: JobProfileList;
  managedUserActions: UserAdminActionList;
  managedUserHistory: UserAdminHistoryList;
  managedUserDetail: ManagedUserDetail;
  permissionGroups: PermissionGroupList;
  personnel: PersonnelRecordList;
  notifications: NotificationList;
  powerBi: PowerBiEmbedList;
  property: PropertySummary;
  referenceData: ReferenceDataset;
  reportConfig: ReportConfigList;
  createUser: (input: ManagedUserCreate) => Promise<void>;
  createPermissionGroup: (input: PermissionGroupCreate) => Promise<void>;
  currentUserPermissions: string[];
  deletePermissionGroup: (groupId: string) => Promise<void>;
  saveDelayCommonLocation: (locationId: string, update: DelayCommonLocationUpdate) => Promise<void>;
  saveDelayTemplate: (templateId: string, update: DelayTemplateUpdate) => Promise<void>;
  saveAttendance: (exceptionId: string, update: AttendanceExceptionUpdate) => Promise<void>;
  saveJobProfile: (profileId: string, update: JobProfileUpdate) => Promise<void>;
  saveNotification: (notificationId: string, update: NotificationUpdate) => Promise<void>;
  savePermissionGroup: (groupId: string, update: PermissionGroupUpdate) => Promise<void>;
  savePersonnelStatus: (personnelId: string, update: PersonnelStatusUpdate) => Promise<void>;
  savePermissionGroups: (update: UserPermissionGroupUpdate) => Promise<void>;
  savePropertyAccess: (update: UserPropertyAccessUpdate) => Promise<void>;
  saveReportConfig: (reportId: string, update: ReportConfigUpdate) => Promise<void>;
  saveReferenceData: (update: ReferenceDataset) => Promise<void>;
  saveSettings: (update: PropertySettingsUpdate) => Promise<void>;
  saveSpecialMovement: (movementId: string, update: SpecialMovementUpdate) => Promise<void>;
  runUserAdminAction: (actionId: string) => Promise<void>;
  selectedUserId: string;
  selectUser: (userId: string) => void;
  settings: PropertySettings;
  specialMovements: SpecialMovementList;
  source: "api" | "fallback";
  users: ManagedUserList;
}

export function SettingsPage({
  attendance,
  delayCommonLocations,
  delayTemplates,
  files,
  isSaving,
  jobProfiles,
  managedUserActions,
  managedUserHistory,
  managedUserDetail,
  personnel,
  notifications,
  permissionGroups,
  powerBi,
  property,
  referenceData,
  reportConfig,
  createUser,
  createPermissionGroup,
  currentUserPermissions,
  deletePermissionGroup,
  saveDelayCommonLocation,
  saveDelayTemplate,
  saveAttendance,
  saveJobProfile,
  saveNotification,
  savePermissionGroup,
  savePersonnelStatus,
  savePermissionGroups,
  savePropertyAccess,
  saveReportConfig,
  saveReferenceData,
  saveSettings,
  saveSpecialMovement,
  runUserAdminAction,
  selectedUserId,
  selectUser,
  settings,
  specialMovements,
  source,
  users
}: SettingsPageProps) {
  const [feedback, setFeedback] = useState<string>("");
  const canInviteUsers = currentUserPermissions.includes("users.invite");
  const canManageUsers = currentUserPermissions.includes("users.manage");
  const canEditUserAccess = currentUserPermissions.includes("users.access.write");
  const canManagePermissionGroups = currentUserPermissions.includes("admin.permissions.write");
  const canScheduleReports = currentUserPermissions.includes("reports.schedule");
  const canManageNotifications = currentUserPermissions.includes("notifications.write");
  const canManageStaffing = currentUserPermissions.includes("staffing.write");

  async function runAction(action: () => Promise<void>, success: string) {
    try {
      await action();
      setFeedback(success);
    } catch {
      setFeedback("Update failed. Check API availability and validation constraints.");
    }
  }

  return (
    <div className="page-stack">
      <Panel title="Property settings" eyebrow={property.code}>
        <p>
          Settings editing is now wired for the main persisted admin modules in this shell.
        </p>
        <p>{isSaving ? "Saving changes..." : feedback || "Changes save against the current property scope."}</p>
      </Panel>
      <div className="two-column-grid">
        <Panel title="Branding and support" eyebrow={source}>
          <dl className="key-value-list">
            <div>
              <dt>Display name</dt>
              <dd>{settings.displayName}</dd>
            </div>
            <div>
              <dt>Support</dt>
              <dd>{settings.supportEmail}</dd>
            </div>
            <div>
              <dt>Timezone</dt>
              <dd>{settings.timezone}</dd>
            </div>
            <div>
              <dt>Primary color</dt>
              <dd>{settings.branding.primaryColor}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() =>
              void runAction(
                () =>
                  saveSettings({
                    supportEmail: `dispatch@${property.code}.herzogops.com`,
                    timezone: settings.timezone === "America/Chicago" ? "America/Los_Angeles" : "America/Chicago",
                    branding: {
                      primaryColor:
                        settings.branding.primaryColor === "#112233" ? "#1E3A5F" : "#112233",
                      logoMode:
                        settings.branding.logoMode === "property-override"
                          ? "herzog-default"
                          : "property-override"
                    },
                    features: {
                      powerBi: !settings.features.powerBi,
                      fileUploads: settings.features.fileUploads,
                      cmms: settings.features.cmms
                    }
                  }),
                "Property settings updated."
              )
            }
          >
            Apply staged property update
          </button>
          <StatusBadge
            tone={settings.branding.logoMode === "property-override" ? "warning" : "neutral"}
            label={settings.branding.logoMode}
          />
        </Panel>
        <Panel title="Enabled integrations" eyebrow={settings.profile}>
          <div className="badge-row">
            <StatusBadge tone={settings.features.powerBi ? "success" : "neutral"} label="power bi" />
            <StatusBadge tone={settings.features.fileUploads ? "success" : "neutral"} label="files" />
            <StatusBadge tone={settings.features.cmms ? "success" : "neutral"} label="cmms" />
          </div>
        </Panel>
      </div>
      <Panel title="Reference datasets" eyebrow="Property configuration">
        <div className="two-column-grid">
          <div>
            <strong>Delay Reasons</strong>
            <p>{referenceData.delayReasons.join(", ")}</p>
          </div>
          <div>
            <strong>Crew Roles</strong>
            <p>{referenceData.crewRoles.join(", ")}</p>
          </div>
          <div>
            <strong>Station Codes</strong>
            <p>{referenceData.stationCodes.join(", ")}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={!canInviteUsers}
          onClick={() =>
            void runAction(
              () =>
                saveReferenceData({
                  delayReasons: [...referenceData.delayReasons, "Weather hold"],
                  crewRoles: [...referenceData.crewRoles, "Road Foreman"],
                  stationCodes: [...referenceData.stationCodes, "STX"]
                }),
              "Reference data updated."
            )
          }
        >
          Extend reference datasets
        </button>
      </Panel>
      <Panel title="Managed users" eyebrow={`${users.items.length} in scope`}>
        <div className="user-list">
          {users.items.length ? (
            users.items.map((user) => (
              <article className="user-row" key={user.id}>
                <div>
                  <strong>{user.displayName}</strong>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p>{user.roleLabel}</p>
                  <StatusBadge
                    tone={user.status === "active" ? "success" : user.status === "invited" ? "warning" : "neutral"}
                    label={user.status}
                  />
                </div>
                <button type="button" onClick={() => selectUser(user.id)}>
                  {selectedUserId === user.id ? "Selected" : "View user"}
                </button>
              </article>
            ))
          ) : (
            <p>No seeded user records yet for this property.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            void runAction(
              () =>
                createUser({
                  displayName: "Morgan Lee",
                  email: "morgan.lee@herzog.com",
                  roleLabel: "Operations Analyst",
                  propertyAccess: [property.code],
                  groups: ["Reporting Admin"]
                }),
              "Managed user invited."
            )
          }
        >
          Invite staged user
        </button>
      </Panel>
      <div className="two-column-grid">
        <Panel title="Selected user detail" eyebrow={managedUserDetail.status}>
          <dl className="key-value-list">
            <div>
              <dt>Name</dt>
              <dd>{managedUserDetail.displayName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{managedUserDetail.email}</dd>
            </div>
            <div>
              <dt>Groups</dt>
              <dd>{managedUserDetail.groups.join(", ")}</dd>
            </div>
            <div>
              <dt>Property access</dt>
              <dd>{managedUserDetail.propertyAccess.join(", ")}</dd>
            </div>
            <div>
              <dt>Last admin action</dt>
              <dd>{managedUserDetail.lastAction}</dd>
            </div>
          </dl>
          <div className="button-row">
            <button
              type="button"
              disabled={!canEditUserAccess}
              onClick={() =>
                void runAction(
                  () => savePropertyAccess({ propertyAccess: ["caltrain", "tre"] }),
                  "User property access updated."
                )
              }
            >
              Scope to caltrain + tre
            </button>
            <button
              type="button"
              disabled={!canEditUserAccess}
              onClick={() =>
                void runAction(
                  () => savePermissionGroups({ groups: ["Dispatch Leadership"] }),
                  "User permission groups updated."
                )
              }
            >
              Keep Dispatch Leadership only
            </button>
          </div>
        </Panel>
        <Panel title="Admin actions" eyebrow={`${managedUserActions.items.length} available`}>
          <div className="badge-row">
            {managedUserActions.items.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={!action.isAllowed || (action.requiredPermission === "users.manage" && !canManageUsers)}
                onClick={() =>
                  void runAction(
                    () => runUserAdminAction(action.id),
                    `${action.label} executed.`
                  )
                }
              >
                <StatusBadge
                  tone={
                    action.style === "primary"
                      ? "success"
                      : action.style === "warning"
                        ? "warning"
                        : "neutral"
                  }
                  label={action.label}
                />
              </button>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="User admin history" eyebrow={`${managedUserHistory.items.length} events`}>
        <div className="list-stack">
          {managedUserHistory.items.length ? (
            managedUserHistory.items.map((entry) => (
              <article className="list-row" key={entry.id}>
                <div>
                  <strong>{entry.summary}</strong>
                  <p>{entry.actorName}</p>
                </div>
                <div className="list-meta">
                  <span>{entry.action}</span>
                  <span>{entry.createdAt}</span>
                </div>
              </article>
            ))
          ) : (
            <p>No admin history recorded yet for the selected user.</p>
          )}
        </div>
      </Panel>
      <Panel title="User admin permissions" eyebrow="Current operator">
        <div className="badge-row">
          {currentUserPermissions.length ? (
            currentUserPermissions.map((permission) => (
              <StatusBadge key={permission} tone="success" label={permission} />
            ))
          ) : (
            <StatusBadge tone="warning" label="no user-admin permissions" />
          )}
        </div>
      </Panel>
      <div className="two-column-grid">
        <Panel title="Delay templates" eyebrow={`${delayTemplates.items.length} templates`}>
          <div className="list-stack">
            {delayTemplates.items.map((template) => (
              <article className="list-row" key={template.id}>
                <div>
                  <strong>{template.name}</strong>
                  <p>
                    {template.category} · {template.minutes} min
                  </p>
                </div>
                <div className="list-meta">
                  <span>{template.notableDelayType}</span>
                </div>
              </article>
            ))}
          </div>
          {delayTemplates.items[0] ? (
            <button
              type="button"
              onClick={() =>
                void runAction(
                  () =>
                    saveDelayTemplate(delayTemplates.items[0]!.id, {
                      name: `${delayTemplates.items[0]!.name} Updated`,
                      category: delayTemplates.items[0]!.category,
                      minutes: delayTemplates.items[0]!.minutes + 1,
                      notes: `${delayTemplates.items[0]!.notes} Supervisor review added.`,
                      notableDelayType: delayTemplates.items[0]!.notableDelayType,
                      specialMovementId: delayTemplates.items[0]!.specialMovementId
                    }),
                  "Delay template updated."
                )
              }
            >
              Update first delay template
            </button>
          ) : null}
        </Panel>
        <Panel title="Delay catalogs" eyebrow="Delay admin">
          <div className="list-stack">
            {delayCommonLocations.items.map((location) => (
              <article className="list-row" key={location.id}>
                <div>
                  <strong>{location.label}</strong>
                  <p>Usage count {location.usageCount}</p>
                </div>
              </article>
            ))}
            {specialMovements.items.map((movement) => (
              <article className="list-row" key={movement.id}>
                <div>
                  <strong>{movement.label}</strong>
                  <p>{movement.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="button-row">
            {delayCommonLocations.items[0] ? (
              <button
                type="button"
                onClick={() =>
                  void runAction(
                    () =>
                      saveDelayCommonLocation(delayCommonLocations.items[0]!.id, {
                        label: `${delayCommonLocations.items[0]!.label} Updated`,
                        usageCount: delayCommonLocations.items[0]!.usageCount + 1
                      }),
                    "Delay common location updated."
                  )
                }
              >
                Update first common location
              </button>
            ) : null}
            {specialMovements.items[0] ? (
              <button
                type="button"
                onClick={() =>
                  void runAction(
                    () =>
                      saveSpecialMovement(specialMovements.items[0]!.id, {
                        label: `${specialMovements.items[0]!.label} Updated`,
                        description: `${specialMovements.items[0]!.description} Updated for admin workflow.`
                      }),
                    "Special movement updated."
                  )
                }
              >
                Update first special movement
              </button>
            ) : null}
          </div>
        </Panel>
      </div>
      <div className="two-column-grid">
      <Panel title="Permission groups" eyebrow={`${permissionGroups.items.length} groups`}>
        <div className="list-stack">
          {permissionGroups.items.map((group) => (
            <article className="list-row" key={group.id}>
                <div>
                  <strong>{group.name}</strong>
                  <p>{group.description}</p>
                  <div className="badge-row">
                    {group.permissions.map((permission) => (
                      <StatusBadge key={permission} tone="neutral" label={permission} />
                    ))}
                  </div>
                </div>
                <div className="list-meta">
                  <span>{group.members} members</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Report configuration" eyebrow={reportConfig.items.length ? source : "empty"}>
          <div className="matrix-table">
            <div className="matrix-head">Report</div>
            <div className="matrix-head">Audience</div>
            <div className="matrix-head">Embed</div>
            <div className="matrix-head">Schedule</div>
            {reportConfig.items.flatMap((row) => [
              <div key={`${row.id}-name`} className="matrix-cell">
                {row.reportName}
              </div>,
              <div key={`${row.id}-audience`} className="matrix-cell">
                {row.audience}
              </div>,
              <div key={`${row.id}-embed`} className="matrix-cell">
                <StatusBadge tone={row.embedEnabled ? "success" : "neutral"} label={row.embedEnabled ? "on" : "off"} />
              </div>,
              <div key={`${row.id}-schedule`} className="matrix-cell">
                {row.schedule}
              </div>
            ])}
          </div>
          {reportConfig.items[0] ? (
            <button
              type="button"
              disabled={!canScheduleReports}
              onClick={() =>
                void runAction(
                  () =>
                    saveReportConfig(reportConfig.items[0]!.id, {
                      audience: "Dispatch Leadership",
                      embedEnabled: false,
                      schedule: "07:00 daily"
                    }),
                  "Report configuration updated."
                )
              }
            >
              Update first report row
            </button>
          ) : null}
        </Panel>
      </div>
      <div className="two-column-grid">
        <Panel title="Personnel directory" eyebrow={`${personnel.items.length} records`}>
          <div className="list-stack">
            {personnel.items.map((record) => (
              <article className="list-row" key={record.id}>
                <div>
                  <strong>{record.employeeName}</strong>
                  <p>
                    {record.employeeId} · {record.primaryRole}
                  </p>
                  <p>{record.certifications.join(", ")}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge
                    tone={
                      record.status === "active"
                        ? "success"
                        : record.status === "on_leave"
                          ? "warning"
                          : "neutral"
                    }
                    label={record.status}
                  />
                </div>
              </article>
            ))}
          </div>
          {personnel.items[0] ? (
            <button
              type="button"
              disabled={!canManageStaffing}
              onClick={() =>
                void runAction(
                  () =>
                    savePersonnelStatus(personnel.items[0]!.id, {
                      status: personnel.items[0]!.status === "active" ? "on_leave" : "active",
                      primaryRole: personnel.items[0]!.primaryRole
                    }),
                  "Personnel status updated."
                )
              }
            >
              Toggle first personnel status
            </button>
          ) : null}
        </Panel>
        <Panel title="Job profiles" eyebrow={`${jobProfiles.items.length} roles`}>
          <div className="list-stack">
            {jobProfiles.items.map((profile) => (
              <article className="list-row" key={profile.id}>
                <div>
                  <strong>{profile.title}</strong>
                  <p>{profile.department}</p>
                </div>
                <div className="list-meta">
                  <span>Min {profile.minimumHeadcount}</span>
                  <StatusBadge
                    tone={profile.reliefRequired ? "warning" : "neutral"}
                    label={profile.reliefRequired ? "relief required" : "fixed"}
                  />
                </div>
              </article>
            ))}
          </div>
          {jobProfiles.items[0] ? (
            <button
              type="button"
              disabled={!canManageStaffing}
              onClick={() =>
                void runAction(
                  () =>
                    saveJobProfile(jobProfiles.items[0]!.id, {
                      department: "Operations Control",
                      minimumHeadcount: 2,
                      reliefRequired: false
                    }),
                  "Job profile updated."
                )
              }
            >
              Update first job profile
            </button>
          ) : null}
        </Panel>
        <Panel title="Absence and tardiness" eyebrow={`${attendance.items.length} open records`}>
          <div className="list-stack">
            {attendance.items.map((record) => (
              <article className="list-row" key={record.id}>
                <div>
                  <strong>{record.employeeName}</strong>
                  <p>
                    {record.exceptionType} · {record.startDate}
                  </p>
                  <p>{record.notes}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge
                    tone={
                      record.status === "approved"
                        ? "success"
                        : record.status === "open"
                          ? "warning"
                          : "neutral"
                    }
                    label={record.status}
                  />
                </div>
              </article>
            ))}
          </div>
          {attendance.items[0] ? (
            <button
              type="button"
              disabled={!canManageStaffing}
              onClick={() =>
                void runAction(
                  () =>
                    saveAttendance(attendance.items[0]!.id, {
                      status: "resolved",
                      notes: "Cleared for duty."
                    }),
                  "Attendance record updated."
                )
              }
            >
              Resolve first attendance record
            </button>
          ) : null}
        </Panel>
      </div>
      <div className="two-column-grid">
        <Panel title="File services" eyebrow={`${files.items.length} items`}>
          <div className="list-stack">
            {files.items.map((file) => (
              <article className="list-row" key={file.id}>
                <div>
                  <strong>{file.fileName}</strong>
                  <p>
                    {file.category} · {file.uploadedAt}
                  </p>
                </div>
                <div className="list-meta">
                  <StatusBadge
                    tone={file.status === "available" ? "success" : file.status === "processing" ? "warning" : "neutral"}
                    label={file.status}
                  />
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Notifications" eyebrow={`${notifications.items.length} templates`}>
          <div className="list-stack">
            {notifications.items.map((notification) => (
              <article className="list-row" key={notification.id}>
                <div>
                  <strong>{notification.templateName}</strong>
                  <p>
                    {notification.channel} · {notification.recipientGroup}
                  </p>
                </div>
                <div className="list-meta">
                  <StatusBadge tone={notification.enabled ? "success" : "neutral"} label={notification.enabled ? "enabled" : "disabled"} />
                </div>
              </article>
            ))}
          </div>
          {notifications.items[0] ? (
            <button
              type="button"
              disabled={!canManageNotifications}
              onClick={() =>
                void runAction(
                  () =>
                    saveNotification(notifications.items[0]!.id, {
                      channel: "in_app",
                      recipientGroup: "Operations Leadership",
                      enabled: false
                    }),
                  "Notification template updated."
                )
              }
            >
              Update first notification
            </button>
          ) : null}
        </Panel>
      </div>
      <Panel title="Power BI embeds" eyebrow={`${powerBi.items.length} reports`}>
        <div className="list-stack">
          {powerBi.items.map((report) => (
            <article className="list-row" key={report.id}>
              <div>
                <strong>{report.reportName}</strong>
                <p>{report.workspace}</p>
                <p>{report.embedUrl}</p>
              </div>
              <div className="list-meta">
                <StatusBadge tone={report.enabled ? "success" : "neutral"} label={report.enabled ? "enabled" : "disabled"} />
              </div>
            </article>
          ))}
        </div>
        {permissionGroups.items[0] ? (
          <button
            type="button"
            disabled={!canManagePermissionGroups}
            onClick={() =>
              void runAction(
                () =>
                  savePermissionGroup(permissionGroups.items[0]!.id, {
                    description: `${permissionGroups.items[0]!.description} Includes edit-review workflow.`,
                    permissions: [...permissionGroups.items[0]!.permissions, "reports.schedule"]
                  }),
                "Permission group updated."
              )
            }
          >
            Expand first permission group
          </button>
        ) : null}
        <div className="button-row">
          <button
            type="button"
            disabled={!canManagePermissionGroups}
            onClick={() =>
              void runAction(
                () =>
                  createPermissionGroup({
                    name: "Service Review",
                    description: "Review-focused access for service and incident oversight.",
                    permissions: ["reports.view", "reports.schedule", "delays.write"]
                  }),
                "Permission group created."
              )
            }
          >
            Create staged permission group
          </button>
          {permissionGroups.items.at(-1) ? (
            <button
              type="button"
              disabled={!canManagePermissionGroups}
              onClick={() =>
                void runAction(
                  () => deletePermissionGroup(permissionGroups.items.at(-1)!.id),
                  "Permission group deleted."
                )
              }
            >
              Delete last permission group
            </button>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
