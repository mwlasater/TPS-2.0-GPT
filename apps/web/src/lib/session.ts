import type { AppBootstrap, UserSession } from "@tps/types";

export const demoSession: UserSession = {
  id: "local-dev-user",
  email: "local-dev-user@herzog.com",
  displayName: "Local Development User",
  allowedProperties: ["caltrain", "capmetro", "tre"]
};

export const demoBootstrap: AppBootstrap = {
  user: demoSession,
  availableProperties: [
    {
      code: "caltrain",
      name: "CalTrain",
      profile: "commuter_rail",
      themeColor: "#1E3A5F"
    },
    {
      code: "capmetro",
      name: "CapMetro",
      profile: "commuter_rail",
      themeColor: "#AB2D24"
    },
    {
      code: "tre",
      name: "Trinity Railway Express",
      profile: "commuter_rail",
      themeColor: "#086670"
    }
  ],
  defaultProperty: "caltrain"
};
