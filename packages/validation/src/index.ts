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
  allowedProperties: z.array(z.string())
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
  crewAssigned: z.number()
});

export const trainRunListSchema = z.object({
  items: z.array(trainRunSchema)
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

export const reportConfigRowSchema = z.object({
  id: z.string(),
  reportName: z.string(),
  audience: z.string(),
  embedEnabled: z.boolean(),
  schedule: z.string()
});

export const reportConfigListSchema = z.object({
  items: z.array(reportConfigRowSchema)
});

export const propertyHeaderSchema = z.object({
  "x-property": z.string().min(1)
});
