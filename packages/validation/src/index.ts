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

export const propertyHeaderSchema = z.object({
  "x-property": z.string().min(1)
});
