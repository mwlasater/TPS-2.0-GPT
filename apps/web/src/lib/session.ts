import type {
  AppBootstrap,
  DelayEventList,
  ManagedUserList,
  PropertyCode,
  PropertySettings,
  ReferenceDataset,
  StationStopList,
  TrainRunList,
  TrainScheduleList,
  UserSession
} from "@tps/types";

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

export const demoPropertySettings: Record<PropertyCode, PropertySettings> = {
  caltrain: {
    propertyCode: "caltrain",
    displayName: "CalTrain",
    supportEmail: "caltrain-ops@herzog.com",
    timezone: "America/Los_Angeles",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E3A5F", logoMode: "herzog-default" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  texrail: {
    propertyCode: "texrail",
    displayName: "TEXRail",
    supportEmail: "texrail-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E3A5F", logoMode: "herzog-default" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  tre: {
    propertyCode: "tre",
    displayName: "Trinity Railway Express",
    supportEmail: "tre-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "commuter_rail",
    branding: { primaryColor: "#086670", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: true, cmms: true }
  },
  trirail: {
    propertyCode: "trirail",
    displayName: "Tri-Rail",
    supportEmail: "trirail-ops@herzog.com",
    timezone: "America/New_York",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E3A5F", logoMode: "herzog-default" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  nmrx: {
    propertyCode: "nmrx",
    displayName: "New Mexico Rail Runner",
    supportEmail: "nmrx-ops@herzog.com",
    timezone: "America/Denver",
    profile: "commuter_rail",
    branding: { primaryColor: "#8A5700", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: false, cmms: false }
  },
  ctrail: {
    propertyCode: "ctrail",
    displayName: "CT Rail",
    supportEmail: "ctrail-ops@herzog.com",
    timezone: "America/New_York",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E3A5F", logoMode: "herzog-default" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  ace: {
    propertyCode: "ace",
    displayName: "ACE",
    supportEmail: "ace-ops@herzog.com",
    timezone: "America/Los_Angeles",
    profile: "commuter_rail",
    branding: { primaryColor: "#086670", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  capmetro: {
    propertyCode: "capmetro",
    displayName: "CapMetro",
    supportEmail: "capmetro-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "commuter_rail",
    branding: { primaryColor: "#AB2D24", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: true, cmms: true }
  },
  kcstreetcar: {
    propertyCode: "kcstreetcar",
    displayName: "KC Streetcar",
    supportEmail: "kcstreetcar-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "streetcar",
    branding: { primaryColor: "#AB2D24", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: false, cmms: false }
  },
  okcstreetcar: {
    propertyCode: "okcstreetcar",
    displayName: "OKC Streetcar",
    supportEmail: "okcstreetcar-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "streetcar",
    branding: { primaryColor: "#8A5700", logoMode: "property-override" },
    features: { powerBi: false, fileUploads: false, cmms: false }
  },
  octastreetcar: {
    propertyCode: "octastreetcar",
    displayName: "OCTA Streetcar",
    supportEmail: "octa-streetcar-ops@herzog.com",
    timezone: "America/Los_Angeles",
    profile: "streetcar",
    branding: { primaryColor: "#086670", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: false, cmms: false }
  },
  metrolinkarrow: {
    propertyCode: "metrolinkarrow",
    displayName: "Metrolink Arrow",
    supportEmail: "metrolink-arrow-ops@herzog.com",
    timezone: "America/Los_Angeles",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E6B38", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  silverline: {
    propertyCode: "silverline",
    displayName: "Silver Line",
    supportEmail: "silverline-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "commuter_rail",
    branding: { primaryColor: "#58595B", logoMode: "property-override" },
    features: { powerBi: false, fileUploads: true, cmms: false }
  }
};

export const demoManagedUsers: Record<PropertyCode, ManagedUserList> = {
  caltrain: {
    items: [
      {
        id: "ops-manager",
        displayName: "Jordan Reyes",
        email: "jordan.reyes@herzog.com",
        status: "active",
        roleLabel: "Operations Manager",
        lastSeen: "2026-03-06T14:10:00Z"
      },
      {
        id: "dispatcher-1",
        displayName: "Taylor Brooks",
        email: "taylor.brooks@herzog.com",
        status: "active",
        roleLabel: "Dispatcher",
        lastSeen: "2026-03-06T13:45:00Z"
      }
    ]
  },
  texrail: {
    items: []
  },
  tre: {
    items: [
      {
        id: "ops-manager",
        displayName: "Jordan Reyes",
        email: "jordan.reyes@herzog.com",
        status: "active",
        roleLabel: "Rail Operations Manager",
        lastSeen: "2026-03-06T14:10:00Z"
      }
    ]
  },
  trirail: { items: [] },
  nmrx: { items: [] },
  ctrail: { items: [] },
  ace: { items: [] },
  capmetro: {
    items: [
      {
        id: "ops-manager",
        displayName: "Jordan Reyes",
        email: "jordan.reyes@herzog.com",
        status: "active",
        roleLabel: "Transit Operations Manager",
        lastSeen: "2026-03-06T14:10:00Z"
      },
      {
        id: "dispatcher-1",
        displayName: "Taylor Brooks",
        email: "taylor.brooks@herzog.com",
        status: "active",
        roleLabel: "Dispatcher",
        lastSeen: "2026-03-06T13:45:00Z"
      }
    ]
  },
  kcstreetcar: {
    items: [
      {
        id: "ops-manager",
        displayName: "Jordan Reyes",
        email: "jordan.reyes@herzog.com",
        status: "active",
        roleLabel: "Streetcar Operations Lead",
        lastSeen: "2026-03-06T14:10:00Z"
      }
    ]
  },
  okcstreetcar: { items: [] },
  octastreetcar: { items: [] },
  metrolinkarrow: { items: [] },
  silverline: { items: [] }
};

const commuterReferenceData: ReferenceDataset = {
  delayReasons: ["Mechanical", "Signal delay", "Late crew", "Passenger loading"],
  crewRoles: ["Engineer", "Conductor", "Assistant Conductor", "Dispatcher"],
  stationCodes: ["STA", "STB", "STC", "STD", "STE"]
};

const streetcarReferenceData: ReferenceDataset = {
  delayReasons: ["Traffic hold", "Signal issue", "Passenger assistance", "Vehicle reset"],
  crewRoles: ["Operator", "Street Supervisor", "Service Lead"],
  stationCodes: ["ST01", "ST02", "ST03", "ST04"]
};

export const demoReferenceData: Record<PropertyCode, ReferenceDataset> = {
  caltrain: commuterReferenceData,
  texrail: commuterReferenceData,
  tre: commuterReferenceData,
  trirail: commuterReferenceData,
  nmrx: commuterReferenceData,
  ctrail: commuterReferenceData,
  ace: commuterReferenceData,
  capmetro: commuterReferenceData,
  kcstreetcar: streetcarReferenceData,
  okcstreetcar: streetcarReferenceData,
  octastreetcar: streetcarReferenceData,
  metrolinkarrow: commuterReferenceData,
  silverline: commuterReferenceData
};

export const demoTrainSchedules: Record<PropertyCode, TrainScheduleList> = {
  caltrain: {
    items: [
      {
        id: "ct-101",
        trainNumber: "101",
        routeName: "San Francisco to San Jose",
        direction: "southbound",
        serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        stopCount: 10
      },
      {
        id: "ct-154",
        trainNumber: "154",
        routeName: "San Jose to San Francisco",
        direction: "northbound",
        serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        stopCount: 10
      }
    ]
  },
  texrail: { items: [] },
  tre: {
    items: [
      {
        id: "tre-401",
        trainNumber: "401",
        routeName: "Dallas Union to Fort Worth T&P",
        direction: "westbound",
        serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        stopCount: 8
      }
    ]
  },
  trirail: { items: [] },
  nmrx: { items: [] },
  ctrail: { items: [] },
  ace: { items: [] },
  capmetro: {
    items: [
      {
        id: "cm-701",
        trainNumber: "701",
        routeName: "Leander to Downtown Austin",
        direction: "southbound",
        serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        stopCount: 9
      }
    ]
  },
  kcstreetcar: {
    items: [
      {
        id: "kc-01",
        trainNumber: "SC-01",
        routeName: "Main Street Line",
        direction: "northbound",
        serviceDays: ["Daily"],
        stopCount: 6
      }
    ]
  },
  okcstreetcar: { items: [] },
  octastreetcar: { items: [] },
  metrolinkarrow: { items: [] },
  silverline: { items: [] }
};

export const demoTrainRuns: Record<PropertyCode, TrainRunList> = {
  caltrain: {
    items: [
      {
        id: "caltrain-run-1",
        scheduleId: "ct-101",
        trainNumber: "101",
        operatingDate: "2026-03-06",
        status: "in_progress",
        delayMinutes: 7,
        crewAssigned: 3
      },
      {
        id: "caltrain-run-2",
        scheduleId: "ct-154",
        trainNumber: "154",
        operatingDate: "2026-03-06",
        status: "approved",
        delayMinutes: 0,
        crewAssigned: 3
      }
    ]
  },
  texrail: { items: [] },
  tre: {
    items: [
      {
        id: "tre-run-1",
        scheduleId: "tre-401",
        trainNumber: "401",
        operatingDate: "2026-03-06",
        status: "in_progress",
        delayMinutes: 4,
        crewAssigned: 3
      }
    ]
  },
  trirail: { items: [] },
  nmrx: { items: [] },
  ctrail: { items: [] },
  ace: { items: [] },
  capmetro: {
    items: [
      {
        id: "capmetro-run-1",
        scheduleId: "cm-701",
        trainNumber: "701",
        operatingDate: "2026-03-06",
        status: "scheduled",
        delayMinutes: 0,
        crewAssigned: 2
      }
    ]
  },
  kcstreetcar: {
    items: [
      {
        id: "kcstreetcar-run-1",
        scheduleId: "kc-01",
        trainNumber: "SC-01",
        operatingDate: "2026-03-06",
        status: "in_progress",
        delayMinutes: 2,
        crewAssigned: 1
      }
    ]
  },
  okcstreetcar: { items: [] },
  octastreetcar: { items: [] },
  metrolinkarrow: { items: [] },
  silverline: { items: [] }
};

const commuterStationStops: StationStopList = {
  items: [
    {
      id: "stop-1",
      stationCode: "STA",
      sequence: 1,
      scheduledTime: "06:05",
      actualTime: "06:06",
      boardings: 42,
      alightings: 3
    },
    {
      id: "stop-2",
      stationCode: "STB",
      sequence: 2,
      scheduledTime: "06:18",
      actualTime: "06:23",
      boardings: 27,
      alightings: 11
    },
    {
      id: "stop-3",
      stationCode: "STC",
      sequence: 3,
      scheduledTime: "06:31",
      actualTime: null,
      boardings: 0,
      alightings: 0
    }
  ]
};

const streetcarStationStops: StationStopList = {
  items: [
    {
      id: "street-stop-1",
      stationCode: "ST01",
      sequence: 1,
      scheduledTime: "07:10",
      actualTime: "07:10",
      boardings: 14,
      alightings: 2
    },
    {
      id: "street-stop-2",
      stationCode: "ST02",
      sequence: 2,
      scheduledTime: "07:18",
      actualTime: "07:20",
      boardings: 8,
      alightings: 4
    }
  ]
};

const commuterDelayEvents: DelayEventList = {
  items: [
    {
      id: "delay-1",
      category: "Signal delay",
      minutes: 4,
      notes: "Signal clearance held at interlocking.",
      reportedAt: "2026-03-06T06:19:00Z"
    },
    {
      id: "delay-2",
      category: "Passenger loading",
      minutes: 3,
      notes: "Heavy boarding volume at central station.",
      reportedAt: "2026-03-06T06:24:00Z"
    }
  ]
};

const streetcarDelayEvents: DelayEventList = {
  items: [
    {
      id: "street-delay-1",
      category: "Traffic hold",
      minutes: 2,
      notes: "Signalized crossing blocked by downtown traffic.",
      reportedAt: "2026-03-06T07:19:00Z"
    }
  ]
};

export const demoStationStops: Record<PropertyCode, StationStopList> = {
  caltrain: commuterStationStops,
  texrail: commuterStationStops,
  tre: commuterStationStops,
  trirail: commuterStationStops,
  nmrx: commuterStationStops,
  ctrail: commuterStationStops,
  ace: commuterStationStops,
  capmetro: commuterStationStops,
  kcstreetcar: streetcarStationStops,
  okcstreetcar: streetcarStationStops,
  octastreetcar: streetcarStationStops,
  metrolinkarrow: commuterStationStops,
  silverline: commuterStationStops
};

export const demoDelayEvents: Record<PropertyCode, DelayEventList> = {
  caltrain: commuterDelayEvents,
  texrail: commuterDelayEvents,
  tre: commuterDelayEvents,
  trirail: commuterDelayEvents,
  nmrx: commuterDelayEvents,
  ctrail: commuterDelayEvents,
  ace: commuterDelayEvents,
  capmetro: commuterDelayEvents,
  kcstreetcar: streetcarDelayEvents,
  okcstreetcar: streetcarDelayEvents,
  octastreetcar: streetcarDelayEvents,
  metrolinkarrow: commuterDelayEvents,
  silverline: commuterDelayEvents
};
