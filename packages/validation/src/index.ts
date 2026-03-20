import { z } from "zod";

export const errorEnvelopeSchema = z.object({
  error: z.string(),
  statusCode: z.number(),
  details: z.unknown().optional()
});

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
  time: z.string()
});

export const versionResponseSchema = z.object({
  version: z.string(),
  apiPrefix: z.string()
});

export const propertySummarySchema = z.object({
  code: z.string(),
  name: z.string(),
  profile: z.enum(["commuter_rail", "streetcar"]),
  themeColor: z.string()
});

export const userSessionSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  allowedProperties: z.array(z.string()),
  propertyPermissions: z.record(z.string(), z.array(z.string()))
});

export const appBootstrapSchema = z.object({
  user: userSessionSchema,
  availableProperties: z.array(propertySummarySchema),
  defaultProperty: z.string()
});

export const propertySettingsSchema = z.object({
  propertyCode: z.string(),
  displayName: z.string(),
  supportEmail: z.string().email(),
  timezone: z.string(),
  profile: z.enum(["commuter_rail", "streetcar"]),
  branding: z.object({
    primaryColor: z.string(),
    logoMode: z.enum(["herzog-default", "property-override"])
  }),
  features: z.object({
    powerBi: z.boolean(),
    fileUploads: z.boolean(),
    cmms: z.boolean()
  })
});

export const propertySettingsUpdateSchema = z.object({
  supportEmail: z.string().email(),
  timezone: z.string().min(1),
  branding: z.object({
    primaryColor: z.string().min(1),
    logoMode: z.enum(["herzog-default", "property-override"])
  }),
  features: z.object({
    powerBi: z.boolean(),
    fileUploads: z.boolean(),
    cmms: z.boolean()
  })
});

export const managedUserSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  status: z.enum(["active", "invited", "disabled"]),
  roleLabel: z.string(),
  lastSeen: z.string()
});

export const managedUserListSchema = z.object({
  items: z.array(managedUserSchema)
});

export const managedUserCreateSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  roleLabel: z.string().min(1),
  propertyAccess: z.array(z.string().min(1)).min(1),
  groups: z.array(z.string().min(1))
});

export const personnelRecordSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  status: z.enum(["active", "inactive", "on_leave"]),
  primaryRole: z.string(),
  certifications: z.array(z.string())
});

export const personnelRecordListSchema = z.object({
  items: z.array(personnelRecordSchema)
});

export const personnelStatusUpdateSchema = z.object({
  status: z.enum(["active", "inactive", "on_leave"]),
  primaryRole: z.string().min(1)
});

export const managedUserDetailSchema = managedUserSchema.extend({
  propertyAccess: z.array(z.string()),
  groups: z.array(z.string()),
  lastAction: z.string()
});

export const userPropertyAccessUpdateSchema = z.object({
  propertyAccess: z.array(z.string().min(1)).min(1)
});

export const userPermissionGroupUpdateSchema = z.object({
  groups: z.array(z.string().min(1))
});

export const userAdminActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  style: z.enum(["primary", "secondary", "warning"]),
  requiredPermission: z.string(),
  isAllowed: z.boolean()
});

export const userAdminActionListSchema = z.object({
  items: z.array(userAdminActionSchema)
});

export const userAdminHistoryEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.string(),
  actorName: z.string(),
  summary: z.string(),
  createdAt: z.string()
});

export const userAdminHistoryListSchema = z.object({
  items: z.array(userAdminHistoryEntrySchema)
});

export const referenceDatasetSchema = z.object({
  delayReasons: z.array(z.string()),
  crewRoles: z.array(z.string()),
  stationCodes: z.array(z.string())
});

export const trainScheduleSchema = z.object({
  id: z.string(),
  trainNumber: z.string(),
  routeName: z.string(),
  direction: z.enum(["eastbound", "westbound", "northbound", "southbound"]),
  serviceDays: z.array(z.string()),
  stopCount: z.number()
});

export const trainScheduleListSchema = z.object({
  items: z.array(trainScheduleSchema)
});

export const trainRunSchema = z.object({
  id: z.string(),
  scheduleId: z.string(),
  trainNumber: z.string(),
  operatingDate: z.string(),
  status: z.enum(["scheduled", "in_progress", "approved", "delayed"]),
  delayMinutes: z.number(),
  crewAssigned: z.number(),
  isApproved: z.boolean(),
  approvedAt: z.string().nullable(),
  approvalBlockers: z.array(z.string())
});

export const trainRunListSchema = z.object({
  items: z.array(trainRunSchema)
});

export const trainRunInitializeRequestSchema = z.object({
  operatingDate: z.string().min(1),
  scheduleIds: z.array(z.string().min(1)).min(1)
});

export const trainRunInitializeResultSchema = z.object({
  createdRuns: z.array(trainRunSchema),
  skippedScheduleIds: z.array(z.string())
});

export const trainRunDeleteResultSchema = z.object({
  deletedRunId: z.string()
});

export const trainRunApprovalUpdateSchema = z.object({
  isApproved: z.boolean(),
  notes: z.string().min(1)
});

export const trainRunBatchApprovalUpdateSchema = z.object({
  runIds: z.array(z.string().min(1)).min(1),
  isApproved: z.boolean(),
  notes: z.string().min(1)
});

export const trainRunApprovalHistoryEntrySchema = z.object({
  id: z.string(),
  runId: z.string(),
  action: z.enum(["approved", "unapproved"]),
  actorName: z.string(),
  notes: z.string(),
  createdAt: z.string()
});

export const trainRunApprovalHistoryListSchema = z.object({
  items: z.array(trainRunApprovalHistoryEntrySchema)
});

export const stationStopSchema = z.object({
  id: z.string(),
  stationCode: z.string(),
  sequence: z.number(),
  scheduledTime: z.string(),
  actualTime: z.string().nullable(),
  boardings: z.number(),
  alightings: z.number()
});

export const stationStopListSchema = z.object({
  items: z.array(stationStopSchema)
});

export const stationStopUpdateSchema = z.object({
  actualTime: z.string().nullable(),
  boardings: z.number().int().nonnegative(),
  alightings: z.number().int().nonnegative()
});

export const delayEventSchema = z.object({
  id: z.string(),
  category: z.string(),
  minutes: z.number(),
  notes: z.string(),
  reportedAt: z.string()
});

export const delayEventListSchema = z.object({
  items: z.array(delayEventSchema)
});

export const delayEventCreateSchema = z.object({
  category: z.string().min(1),
  minutes: z.number().int().nonnegative(),
  notes: z.string().min(1),
  reportedAt: z.string().min(1)
});

export const delayEventBatchCreateSchema = z.object({
  delays: z.array(delayEventCreateSchema).min(1)
});

export const delayTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  minutes: z.number(),
  notes: z.string(),
  notableDelayType: z.string(),
  specialMovementId: z.string().nullable()
});

export const delayTemplateListSchema = z.object({
  items: z.array(delayTemplateSchema)
});

export const delayTemplateCreateRequestSchema = z.object({
  templateId: z.string().min(1),
  reportedAt: z.string().datetime()
});

export const delayTemplateUpdateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  minutes: z.number().int().nonnegative(),
  notes: z.string().min(1),
  notableDelayType: z.string().min(1),
  specialMovementId: z.string().nullable()
});

export const delayEventDeleteResultSchema = z.object({
  deletedId: z.string(),
  runId: z.string(),
  delayMinutes: z.number().int().nonnegative()
});

export const delayCommonLocationSchema = z.object({
  id: z.string(),
  label: z.string(),
  usageCount: z.number().int().nonnegative()
});

export const delayCommonLocationListSchema = z.object({
  items: z.array(delayCommonLocationSchema)
});

export const delayCommonLocationUpdateSchema = z.object({
  label: z.string().min(1),
  usageCount: z.number().int().nonnegative()
});

export const specialMovementSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string()
});

export const specialMovementListSchema = z.object({
  items: z.array(specialMovementSchema)
});

export const specialMovementUpdateSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1)
});

export const delayAdditionalInfoSchema = z.object({
  delayId: z.string(),
  locationDetail: z.string(),
  responsibleParty: z.string(),
  notableDelayType: z.string(),
  specialMovementId: z.string().nullable(),
  workOrderId: z.string().nullable(),
  mechanicalNotes: z.string(),
  passengerImpactSummary: z.string()
});

export const delayAdditionalInfoUpdateSchema = z.object({
  locationDetail: z.string(),
  responsibleParty: z.string(),
  notableDelayType: z.string(),
  specialMovementId: z.string().nullable(),
  workOrderId: z.string().nullable(),
  mechanicalNotes: z.string(),
  passengerImpactSummary: z.string()
});

export const delayEventUpdateSchema = z.object({
  category: z.string().min(1),
  minutes: z.number().int().nonnegative(),
  notes: z.string().min(1),
  reportedAt: z.string().min(1)
});

export const consistEquipmentSchema = z.object({
  id: z.string(),
  equipmentNumber: z.string(),
  equipmentType: z.string(),
  position: z.number(),
  status: z.enum(["active", "bad_order", "spare"])
});

export const consistEquipmentListSchema = z.object({
  items: z.array(consistEquipmentSchema)
});

export const consistTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(consistEquipmentSchema)
});

export const consistTemplateListSchema = z.object({
  items: z.array(consistTemplateSchema)
});

export const consistEquipmentUpdateSchema = z.object({
  position: z.number().int().positive(),
  status: z.enum(["active", "bad_order", "spare"])
});

export const crewAssignmentSchema = z.object({
  id: z.string(),
  employeeName: z.string(),
  role: z.string(),
  onDutyTime: z.string(),
  status: z.enum(["assigned", "pending_relief", "complete"])
});

export const crewAssignmentListSchema = z.object({
  items: z.array(crewAssignmentSchema)
});

export const crewTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(crewAssignmentSchema)
});

export const crewTemplateListSchema = z.object({
  items: z.array(crewTemplateSchema)
});

export const crewAssignmentUpdateSchema = z.object({
  role: z.string().min(1),
  onDutyTime: z.string().min(1),
  status: z.enum(["assigned", "pending_relief", "complete"])
});

export const resourceSwapRequestSchema = z.object({
  templateId: z.string().min(1)
});

export const fareEnforcementRecordSchema = z.object({
  id: z.string(),
  runId: z.string(),
  inspectorName: z.string(),
  firstLocation: z.string(),
  secondLocation: z.string(),
  activityCount: z.number(),
  amtrakTransfers: z.number(),
  amtrakTickets: z.number(),
  upassCount: z.number(),
  ticketsSold: z.number(),
  notes: z.string(),
  capturedAt: z.string()
});

export const fareEnforcementListSchema = z.object({
  items: z.array(fareEnforcementRecordSchema)
});

export const fareEnforcementSummarySchema = z.object({
  runId: z.string(),
  recordCount: z.number(),
  activityCount: z.number(),
  amtrakTransfers: z.number(),
  amtrakTickets: z.number(),
  upassCount: z.number(),
  ticketsSold: z.number(),
  inspectors: z.array(z.string()),
  latestCapturedAt: z.string().nullable()
});

export const fareEnforcementSummaryListSchema = z.object({
  items: z.array(fareEnforcementSummarySchema)
});

export const fareEnforcementDashboardSchema = z.object({
  totalRecords: z.number(),
  totalActivityCount: z.number(),
  totalAmtrakTransfers: z.number(),
  totalAmtrakTickets: z.number(),
  totalUpassCount: z.number(),
  totalTicketsSold: z.number(),
  coveredRuns: z.number(),
  uncoveredRuns: z.array(z.string()),
  topInspectors: z.array(
    z.object({
      inspectorName: z.string(),
      activityCount: z.number(),
      recordCount: z.number()
    })
  )
});

export const fareEnforcementUpdateSchema = z.object({
  inspectorName: z.string().min(1),
  firstLocation: z.string().min(1),
  secondLocation: z.string().min(1),
  activityCount: z.number().int().nonnegative(),
  amtrakTransfers: z.number().int().nonnegative(),
  amtrakTickets: z.number().int().nonnegative(),
  upassCount: z.number().int().nonnegative(),
  ticketsSold: z.number().int().nonnegative(),
  notes: z.string().min(1),
  capturedAt: z.string().min(1)
});

export const fareEnforcementCreateSchema = z.object({
  runId: z.string().min(1),
  inspectorName: z.string().min(1),
  firstLocation: z.string().min(1),
  secondLocation: z.string().min(1),
  activityCount: z.number().int().nonnegative(),
  amtrakTransfers: z.number().int().nonnegative(),
  amtrakTickets: z.number().int().nonnegative(),
  upassCount: z.number().int().nonnegative(),
  ticketsSold: z.number().int().nonnegative(),
  notes: z.string().min(1),
  capturedAt: z.string().min(1)
});

export const permissionGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  members: z.number(),
  permissions: z.array(z.string())
});

export const permissionGroupListSchema = z.object({
  items: z.array(permissionGroupSchema)
});

export const permissionGroupUpdateSchema = z.object({
  description: z.string().min(1),
  permissions: z.array(z.string().min(1)).min(1)
});

export const reportConfigRowSchema = z.object({
  id: z.string(),
  reportName: z.string(),
  audience: z.string(),
  embedEnabled: z.boolean(),
  schedule: z.string()
});

export const reportConfigUpdateSchema = z.object({
  audience: z.string().min(1),
  embedEnabled: z.boolean(),
  schedule: z.string().min(1)
});

export const reportConfigListSchema = z.object({
  items: z.array(reportConfigRowSchema)
});

export const jobProfileSchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.string(),
  minimumHeadcount: z.number(),
  reliefRequired: z.boolean()
});

export const jobProfileUpdateSchema = z.object({
  department: z.string().min(1),
  minimumHeadcount: z.number().int().positive(),
  reliefRequired: z.boolean()
});

export const jobProfileListSchema = z.object({
  items: z.array(jobProfileSchema)
});

export const attendanceExceptionSchema = z.object({
  id: z.string(),
  employeeName: z.string(),
  exceptionType: z.enum(["absence", "tardy"]),
  startDate: z.string(),
  status: z.enum(["open", "approved", "resolved"]),
  notes: z.string()
});

export const attendanceExceptionUpdateSchema = z.object({
  status: z.enum(["open", "approved", "resolved"]),
  notes: z.string().min(1)
});

export const attendanceExceptionListSchema = z.object({
  items: z.array(attendanceExceptionSchema)
});

export const fileServiceItemSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  category: z.string(),
  uploadedAt: z.string(),
  status: z.enum(["available", "processing", "archived"])
});

export const fileServiceListSchema = z.object({
  items: z.array(fileServiceItemSchema)
});

export const notificationItemSchema = z.object({
  id: z.string(),
  channel: z.enum(["email", "in_app"]),
  templateName: z.string(),
  recipientGroup: z.string(),
  enabled: z.boolean()
});

export const notificationUpdateSchema = z.object({
  channel: z.enum(["email", "in_app"]),
  recipientGroup: z.string().min(1),
  enabled: z.boolean()
});

export const notificationListSchema = z.object({
  items: z.array(notificationItemSchema)
});

export const powerBiEmbedSchema = z.object({
  id: z.string(),
  reportName: z.string(),
  workspace: z.string(),
  embedUrl: z.string().url(),
  enabled: z.boolean()
});

export const powerBiEmbedListSchema = z.object({
  items: z.array(powerBiEmbedSchema)
});

export const propertyHeaderSchema = z.object({
  "x-property": z.string().min(1)
});
