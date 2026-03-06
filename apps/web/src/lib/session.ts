import type { UserSession } from "@tps/types";

export const demoSession: UserSession = {
  id: "local-dev-user",
  email: "local-dev-user@herzog.com",
  displayName: "Local Development User",
  allowedProperties: ["caltrain", "capmetro", "tre"]
};

