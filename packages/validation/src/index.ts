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

export const propertyHeaderSchema = z.object({
  "x-property": z.string().min(1)
});
