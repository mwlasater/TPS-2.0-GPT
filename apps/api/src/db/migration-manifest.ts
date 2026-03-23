export interface MigrationManifestEntry {
  id: string;
  domain: "foundation" | "operations" | "admin" | "reporting" | "migration";
  tables: string[];
}

export const migrationManifest: MigrationManifestEntry[] = [
  { id: "0001_foundation", domain: "foundation", tables: ["shared.railroad", "shared.property_settings"] },
  { id: "0002_operations", domain: "operations", tables: ["shared.train_schedule", "shared.train_run", "shared.delay_event"] },
  { id: "0003_admin_platform", domain: "admin", tables: ["shared.report_config", "shared.notification_template"] },
  { id: "0004_run_resources", domain: "operations", tables: ["shared.consist_equipment", "shared.crew_assignment"] },
  { id: "0005_user_admin", domain: "admin", tables: ["shared.managed_user", "shared.permission_group"] },
  { id: "0006_reference_admin_actions", domain: "admin", tables: ["shared.reference_dataset", "shared.user_admin_action"] },
  { id: "0007_fare_enforcement_locks", domain: "operations", tables: ["shared.fare_enforcement_record"] },
  { id: "0008_train_run_approval_history", domain: "operations", tables: ["shared.train_run_approval_history"] },
  { id: "0009_fare_enforcement_counts", domain: "operations", tables: ["shared.fare_enforcement_record"] },
  { id: "0010_delay_management", domain: "operations", tables: ["shared.delay_common_location", "shared.delay_additional_info"] },
  { id: "0011_resource_templates", domain: "operations", tables: ["shared.consist_template", "shared.crew_template"] },
  { id: "0012_delay_templates", domain: "operations", tables: ["shared.delay_template"] },
  { id: "0013_personnel_directory", domain: "admin", tables: ["shared.personnel_record"] },
  { id: "0015_user_admin_history", domain: "admin", tables: ["shared.user_admin_history"] },
  { id: "0017_train_run_status_history", domain: "operations", tables: ["shared.train_run_status", "shared.train_run_event_history"] },
  { id: "0018_attendance_workflows", domain: "admin", tables: ["shared.attendance_issue", "shared.attendance_notification_rule"] },
  { id: "0019_reporting_workflows", domain: "reporting", tables: ["shared.report_preference", "shared.scheduled_report_email_job"] },
  { id: "0020_reporting_delay_extensions", domain: "migration", tables: ["shared.passenger_report_import", "shared.notable_delay_type", "shared.delay_work_order"] },
  { id: "0021_report_delivery_history", domain: "reporting", tables: ["shared.report_delivery_request"] },
  { id: "0022_fare_enforcement_history", domain: "operations", tables: ["shared.fare_enforcement_history"] }
];
