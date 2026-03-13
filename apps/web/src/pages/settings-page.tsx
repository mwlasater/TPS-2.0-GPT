import type {
  AttendanceExceptionUpdate,
  AttendanceExceptionList,
  FileServiceList,
  JobProfileUpdate,
  JobProfileList,
  ManagedUserDetail,
  ManagedUserList,
  NotificationUpdate,
  NotificationList,
  PermissionGroupList,
  PowerBiEmbedList,
  PropertySettingsUpdate,
  PropertySettings,
  PropertySummary,
  ReportConfigList,
  ReportConfigUpdate,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";
import { useState } from "react";

import { Panel } from "../components/panel.js";
import { StatusBadge } from "../components/status-badge.js";

interface SettingsPageProps {
  attendance: AttendanceExceptionList;
  files: FileServiceList;
  isSaving: boolean;
  jobProfiles: JobProfileList;
  managedUserActions: UserAdminActionList;
  managedUserDetail: ManagedUserDetail;
  permissionGroups: PermissionGroupList;
  notifications: NotificationList;
  powerBi: PowerBiEmbedList;
  property: PropertySummary;
  reportConfig: ReportConfigList;
  saveAttendance: (exceptionId: string, update: AttendanceExceptionUpdate) => Promise<void>;
  saveJobProfile: (profileId: string, update: JobProfileUpdate) => Promise<void>;
  saveNotification: (notificationId: string, update: NotificationUpdate) => Promise<void>;
  savePermissionGroups: (update: UserPermissionGroupUpdate) => Promise<void>;
  savePropertyAccess: (update: UserPropertyAccessUpdate) => Promise<void>;
  saveReportConfig: (reportId: string, update: ReportConfigUpdate) => Promise<void>;
  saveSettings: (update: PropertySettingsUpdate) => Promise<void>;
  settings: PropertySettings;
  source: "api" | "fallback";
  users: ManagedUserList;
}

export function SettingsPage({
  attendance,
  files,
  isSaving,
  jobProfiles,
  managedUserActions,
  managedUserDetail,
  notifications,
  permissionGroups,
  powerBi,
  property,
  reportConfig,
  saveAttendance,
  saveJobProfile,
  saveNotification,
  savePermissionGroups,
  savePropertyAccess,
  saveReportConfig,
  saveSettings,
  settings,
  source,
  users
}: SettingsPageProps) {
  const [feedback, setFeedback] = useState<string>("");

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
              </article>
            ))
          ) : (
            <p>No seeded user records yet for this property.</p>
          )}
        </div>
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
              <StatusBadge
                key={action.id}
                tone={
                  action.style === "primary"
                    ? "success"
                    : action.style === "warning"
                      ? "warning"
                      : "neutral"
                }
                label={action.label}
              />
            ))}
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
      </Panel>
    </div>
  );
}
