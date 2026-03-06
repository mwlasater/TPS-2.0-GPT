import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  APP_VERSION: z.string().default("0.1.0"),
  API_PREFIX: z.string().default("/api/v1"),
  WEB_ORIGIN: z.string().url(),
  JWT_AUDIENCE: z.string().min(1),
  JWT_ISSUER: z.string().min(1),
  JWT_DEV_TOKEN: z.string().min(1),
  PROPERTY_CODES: z.string().min(1),
  USER_PROPERTY_ACCESS: z.string().min(1)
});

export type AppConfig = z.infer<typeof envSchema> & {
  propertyCodes: string[];
  userPropertyAccess: Record<string, string[]>;
};

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const parsed = envSchema.parse(env);
  return {
    ...parsed,
    propertyCodes: parsed.PROPERTY_CODES.split(",").map((value) => value.trim()),
    userPropertyAccess: parsed.USER_PROPERTY_ACCESS.split(",").reduce<Record<string, string[]>>(
      (accumulator, entry) => {
        const [userId, properties = ""] = entry.split(":");
        if (userId) {
          accumulator[userId] = properties
            .split("|")
            .map((value) => value.trim())
            .filter(Boolean);
        }

        return accumulator;
      },
      {}
    )
  };
}

