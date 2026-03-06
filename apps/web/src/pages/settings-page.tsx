import type {
  AttendanceExceptionList,
  JobProfileList,
  ManagedUserList,
  PermissionGroupList,
  PropertySettings,
  PropertySummary,
  ReportConfigList
} from "@tps/types";

import { Panel } from "../components/panel.js";
import { StatusBadge } from "../components/status-badge.js";

interface SettingsPageProps {
  attendance: AttendanceExceptionList;
  jobProfiles: JobProfileList;
  permissionGroups: PermissionGroupList;
  property: PropertySummary;
  reportConfig: ReportConfigList;
  settings: PropertySettings;
  source: "api" | "fallback";
  users: ManagedUserList;
}

export function SettingsPage({
  attendance,
  jobProfiles,
  permissionGroups,
  property,
  reportConfig,
  settings,
  source,
  users
}: SettingsPageProps) {
  return (
    <div className="page-stack">
      <Panel title="Property settings" eyebrow={property.code}>
        <p>
          Settings scaffolding is ready for branding overrides, permission seeds,
          report configuration, and railroad profile defaults.
        </p>
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
        </Panel>
      </div>
    </div>
  );
}
