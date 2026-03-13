import type {
  AttendanceExceptionList,
  AppBootstrap,
  ConsistEquipmentList,
  CrewAssignmentList,
  DelayEventList,
  FareEnforcementList,
  FileServiceList,
  JobProfileList,
  ManagedUserDetail,
  ManagedUserList,
  NotificationList,
  PermissionGroupList,
  PowerBiEmbedList,
  PropertyCode,
  PropertySettings,
  ReferenceDataset,
  ReportConfigList,
  StationStopList,
  TrainRunList,
  TrainRunApprovalHistoryList,
  TrainScheduleList,
  UserAdminActionList,
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

const makeUserDetail = (
  propertyCode: PropertyCode,
  roleLabel: string,
  groups: string[]
): ManagedUserDetail => ({
  id: "ops-manager",
  displayName: "Jordan Reyes",
  email: "jordan.reyes@herzog.com",
  status: "active",
  roleLabel,
  lastSeen: "2026-03-06T14:10:00Z",
  propertyAccess: [propertyCode],
  groups,
  lastAction: "Password reset sent on 2026-03-01"
});

export const demoUserDetails: Record<PropertyCode, ManagedUserDetail> = {
  caltrain: makeUserDetail("caltrain", "Operations Manager", ["Operations Admin", "Dispatch Leadership"]),
  texrail: makeUserDetail("texrail", "Operations Manager", ["Operations Admin", "Dispatch Leadership"]),
  tre: makeUserDetail("tre", "Rail Operations Manager", ["Operations Admin", "Dispatch Leadership"]),
  trirail: makeUserDetail("trirail", "Operations Manager", ["Operations Admin"]),
  nmrx: makeUserDetail("nmrx", "Operations Manager", ["Operations Admin"]),
  ctrail: makeUserDetail("ctrail", "Operations Manager", ["Operations Admin"]),
  ace: makeUserDetail("ace", "Operations Manager", ["Operations Admin"]),
  capmetro: makeUserDetail("capmetro", "Transit Operations Manager", ["Operations Admin", "Dispatch Leadership"]),
  kcstreetcar: makeUserDetail("kcstreetcar", "Streetcar Operations Lead", ["Streetcar Operations"]),
  okcstreetcar: makeUserDetail("okcstreetcar", "Streetcar Operations Lead", ["Streetcar Operations"]),
  octastreetcar: makeUserDetail("octastreetcar", "Streetcar Operations Lead", ["Streetcar Operations"]),
  metrolinkarrow: makeUserDetail("metrolinkarrow", "Operations Manager", ["Operations Admin"]),
  silverline: makeUserDetail("silverline", "Operations Manager", ["Operations Admin"])
};

export const demoUserAdminActions: UserAdminActionList = {
  items: [
    {
      id: "reset-password",
      label: "Reset Password",
      style: "primary"
    },
    {
      id: "resend-invite",
      label: "Resend Invite",
      style: "secondary"
    },
    {
      id: "disable-user",
      label: "Disable User",
      style: "warning"
    }
  ]
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
        crewAssigned: 3,
        isApproved: false,
        approvedAt: null,
        approvalBlockers: []
      },
      {
        id: "caltrain-run-2",
        scheduleId: "ct-154",
        trainNumber: "154",
        operatingDate: "2026-03-06",
        status: "scheduled",
        delayMinutes: 0,
        crewAssigned: 3,
        isApproved: false,
        approvedAt: null,
        approvalBlockers: [
          "Crew assignment required before approval.",
          "Consist assignment required before approval.",
          "Station stop records required before approval."
        ]
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
        crewAssigned: 3,
        isApproved: false,
        approvedAt: null,
        approvalBlockers: []
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
        status: "approved",
        delayMinutes: 2,
        crewAssigned: 2,
        isApproved: true,
        approvedAt: "2026-03-06T07:26:00Z",
        approvalBlockers: []
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
        crewAssigned: 1,
        isApproved: false,
        approvedAt: null,
        approvalBlockers: []
      }
    ]
  },
  okcstreetcar: { items: [] },
  octastreetcar: { items: [] },
  metrolinkarrow: { items: [] },
  silverline: { items: [] }
};

export const demoTrainRunApprovalHistory: Record<PropertyCode, TrainRunApprovalHistoryList> = {
  caltrain: {
    items: [
      {
        id: "approval-caltrain-1",
        runId: "caltrain-run-1",
        action: "approved",
        actorName: "Jordan Reyes",
        notes: "Ready for dispatch closeout after final delay reconciliation.",
        createdAt: "2026-03-06T12:15:00Z"
      }
    ]
  },
  texrail: { items: [] },
  tre: { items: [] },
  trirail: { items: [] },
  nmrx: { items: [] },
  ctrail: { items: [] },
  ace: { items: [] },
  capmetro: {
    items: [
      {
        id: "approval-capmetro-1",
        runId: "capmetro-run-1",
        action: "approved",
        actorName: "Jordan Reyes",
        notes: "Morning service packet completed.",
        createdAt: "2026-03-06T07:26:00Z"
      }
    ]
  },
  kcstreetcar: { items: [] },
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

export const demoFareEnforcement: Record<PropertyCode, FareEnforcementList> = {
  caltrain: {
    items: [
      {
        id: "fare-caltrain-1",
        runId: "caltrain-run-1",
        inspectorName: "Morgan Lee",
        firstLocation: "SFC",
        secondLocation: "PAO",
        activityCount: 16,
        notes: "Peak boarding checks completed before Palo Alto.",
        capturedAt: "2026-03-06T06:28:00Z"
      }
    ]
  },
  texrail: { items: [] },
  tre: {
    items: [
      {
        id: "fare-tre-1",
        runId: "tre-run-1",
        inspectorName: "Taylor Brooks",
        firstLocation: "DAL",
        secondLocation: "CEN",
        activityCount: 12,
        notes: "Manual validation after dispatch hold.",
        capturedAt: "2026-03-06T08:08:00Z"
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
        id: "fare-capmetro-1",
        runId: "capmetro-run-1",
        inspectorName: "Jordan Reyes",
        firstLocation: "LNR",
        secondLocation: "MLK",
        activityCount: 9,
        notes: "Morning commuter inspection pass.",
        capturedAt: "2026-03-06T07:24:00Z"
      }
    ]
  },
  kcstreetcar: { items: [] },
  okcstreetcar: { items: [] },
  octastreetcar: { items: [] },
  metrolinkarrow: { items: [] },
  silverline: { items: [] }
};

const commuterConsist: ConsistEquipmentList = {
  items: [
    {
      id: "equip-1",
      equipmentNumber: "CAB-901",
      equipmentType: "Cab Car",
      position: 1,
      status: "active"
    },
    {
      id: "equip-2",
      equipmentNumber: "COACH-442",
      equipmentType: "Coach",
      position: 2,
      status: "active"
    },
    {
      id: "equip-3",
      equipmentNumber: "LOCO-120",
      equipmentType: "Locomotive",
      position: 3,
      status: "active"
    }
  ]
};

const streetcarConsist: ConsistEquipmentList = {
  items: [
    {
      id: "street-equip-1",
      equipmentNumber: "SC-01",
      equipmentType: "Streetcar Vehicle",
      position: 1,
      status: "active"
    }
  ]
};

const commuterCrew: CrewAssignmentList = {
  items: [
    {
      id: "crew-1",
      employeeName: "Jordan Reyes",
      role: "Engineer",
      onDutyTime: "05:30",
      status: "assigned"
    },
    {
      id: "crew-2",
      employeeName: "Taylor Brooks",
      role: "Conductor",
      onDutyTime: "05:35",
      status: "assigned"
    },
    {
      id: "crew-3",
      employeeName: "Casey Morgan",
      role: "Assistant Conductor",
      onDutyTime: "05:40",
      status: "pending_relief"
    }
  ]
};

const streetcarCrew: CrewAssignmentList = {
  items: [
    {
      id: "street-crew-1",
      employeeName: "Jordan Reyes",
      role: "Operator",
      onDutyTime: "06:45",
      status: "assigned"
    },
    {
      id: "street-crew-2",
      employeeName: "Taylor Brooks",
      role: "Street Supervisor",
      onDutyTime: "06:50",
      status: "complete"
    }
  ]
};

export const demoConsistEquipment: Record<PropertyCode, ConsistEquipmentList> = {
  caltrain: commuterConsist,
  texrail: commuterConsist,
  tre: commuterConsist,
  trirail: commuterConsist,
  nmrx: commuterConsist,
  ctrail: commuterConsist,
  ace: commuterConsist,
  capmetro: commuterConsist,
  kcstreetcar: streetcarConsist,
  okcstreetcar: streetcarConsist,
  octastreetcar: streetcarConsist,
  metrolinkarrow: commuterConsist,
  silverline: commuterConsist
};

export const demoCrewAssignments: Record<PropertyCode, CrewAssignmentList> = {
  caltrain: commuterCrew,
  texrail: commuterCrew,
  tre: commuterCrew,
  trirail: commuterCrew,
  nmrx: commuterCrew,
  ctrail: commuterCrew,
  ace: commuterCrew,
  capmetro: commuterCrew,
  kcstreetcar: streetcarCrew,
  okcstreetcar: streetcarCrew,
  octastreetcar: streetcarCrew,
  metrolinkarrow: commuterCrew,
  silverline: commuterCrew
};

const commuterPermissionGroups: PermissionGroupList = {
  items: [
    {
      id: "ops-admin",
      name: "Operations Admin",
      description: "Full operational control across schedules, runs, delays, and crew.",
      members: 4,
      permissions: ["schedules.write", "runs.approve", "delays.write", "crew.assign"]
    },
    {
      id: "dispatch",
      name: "Dispatcher",
      description: "Day-of-service editing for train runs and delays.",
      members: 7,
      permissions: ["runs.write", "delays.write", "stops.write"]
    }
  ]
};

const streetcarPermissionGroups: PermissionGroupList = {
  items: [
    {
      id: "streetcar-ops",
      name: "Streetcar Operations",
      description: "Dispatch and service adjustments for streetcar operations.",
      members: 3,
      permissions: ["runs.write", "delays.write", "crew.assign"]
    },
    {
      id: "streetcar-reporting",
      name: "Streetcar Reporting",
      description: "Read-only reporting and export access.",
      members: 2,
      permissions: ["reports.view", "reports.export"]
    }
  ]
};

const commuterReportConfig: ReportConfigList = {
  items: [
    {
      id: "report-1",
      reportName: "Daily OTP",
      audience: "Operations Leadership",
      embedEnabled: true,
      schedule: "06:00 daily"
    },
    {
      id: "report-2",
      reportName: "Delay Detail",
      audience: "Dispatch",
      embedEnabled: true,
      schedule: "Every 30 min"
    },
    {
      id: "report-3",
      reportName: "Crew Exceptions",
      audience: "Crew Management",
      embedEnabled: false,
      schedule: "08:00 weekdays"
    }
  ]
};

const streetcarReportConfig: ReportConfigList = {
  items: [
    {
      id: "street-report-1",
      reportName: "Streetcar Service Summary",
      audience: "Operations Leadership",
      embedEnabled: true,
      schedule: "07:00 daily"
    },
    {
      id: "street-report-2",
      reportName: "Incident Log",
      audience: "Street Supervisors",
      embedEnabled: false,
      schedule: "On demand"
    }
  ]
};

export const demoPermissionGroups: Record<PropertyCode, PermissionGroupList> = {
  caltrain: commuterPermissionGroups,
  texrail: commuterPermissionGroups,
  tre: commuterPermissionGroups,
  trirail: commuterPermissionGroups,
  nmrx: commuterPermissionGroups,
  ctrail: commuterPermissionGroups,
  ace: commuterPermissionGroups,
  capmetro: commuterPermissionGroups,
  kcstreetcar: streetcarPermissionGroups,
  okcstreetcar: streetcarPermissionGroups,
  octastreetcar: streetcarPermissionGroups,
  metrolinkarrow: commuterPermissionGroups,
  silverline: commuterPermissionGroups
};

export const demoReportConfig: Record<PropertyCode, ReportConfigList> = {
  caltrain: commuterReportConfig,
  texrail: commuterReportConfig,
  tre: commuterReportConfig,
  trirail: commuterReportConfig,
  nmrx: commuterReportConfig,
  ctrail: commuterReportConfig,
  ace: commuterReportConfig,
  capmetro: commuterReportConfig,
  kcstreetcar: streetcarReportConfig,
  okcstreetcar: streetcarReportConfig,
  octastreetcar: streetcarReportConfig,
  metrolinkarrow: commuterReportConfig,
  silverline: commuterReportConfig
};

const commuterJobProfiles: JobProfileList = {
  items: [
    {
      id: "engineer",
      title: "Engineer",
      department: "Transportation",
      minimumHeadcount: 1,
      reliefRequired: true
    },
    {
      id: "conductor",
      title: "Conductor",
      department: "Transportation",
      minimumHeadcount: 1,
      reliefRequired: true
    },
    {
      id: "dispatcher",
      title: "Dispatcher",
      department: "Control Center",
      minimumHeadcount: 2,
      reliefRequired: false
    }
  ]
};

const streetcarJobProfiles: JobProfileList = {
  items: [
    {
      id: "operator",
      title: "Operator",
      department: "Street Operations",
      minimumHeadcount: 1,
      reliefRequired: true
    },
    {
      id: "street-supervisor",
      title: "Street Supervisor",
      department: "Street Operations",
      minimumHeadcount: 1,
      reliefRequired: false
    }
  ]
};

const commuterAttendanceExceptions: AttendanceExceptionList = {
  items: [
    {
      id: "att-1",
      employeeName: "Casey Morgan",
      exceptionType: "absence",
      startDate: "2026-03-06",
      status: "approved",
      notes: "Approved medical leave."
    },
    {
      id: "att-2",
      employeeName: "Taylor Brooks",
      exceptionType: "tardy",
      startDate: "2026-03-06",
      status: "open",
      notes: "Reported 12 minutes late due to traffic."
    }
  ]
};

const streetcarAttendanceExceptions: AttendanceExceptionList = {
  items: [
    {
      id: "street-att-1",
      employeeName: "Jordan Reyes",
      exceptionType: "tardy",
      startDate: "2026-03-06",
      status: "resolved",
      notes: "Late sign-on resolved with supervisor approval."
    }
  ]
};

export const demoJobProfiles: Record<PropertyCode, JobProfileList> = {
  caltrain: commuterJobProfiles,
  texrail: commuterJobProfiles,
  tre: commuterJobProfiles,
  trirail: commuterJobProfiles,
  nmrx: commuterJobProfiles,
  ctrail: commuterJobProfiles,
  ace: commuterJobProfiles,
  capmetro: commuterJobProfiles,
  kcstreetcar: streetcarJobProfiles,
  okcstreetcar: streetcarJobProfiles,
  octastreetcar: streetcarJobProfiles,
  metrolinkarrow: commuterJobProfiles,
  silverline: commuterJobProfiles
};

export const demoAttendanceExceptions: Record<PropertyCode, AttendanceExceptionList> = {
  caltrain: commuterAttendanceExceptions,
  texrail: commuterAttendanceExceptions,
  tre: commuterAttendanceExceptions,
  trirail: commuterAttendanceExceptions,
  nmrx: commuterAttendanceExceptions,
  ctrail: commuterAttendanceExceptions,
  ace: commuterAttendanceExceptions,
  capmetro: commuterAttendanceExceptions,
  kcstreetcar: streetcarAttendanceExceptions,
  okcstreetcar: streetcarAttendanceExceptions,
  octastreetcar: streetcarAttendanceExceptions,
  metrolinkarrow: commuterAttendanceExceptions,
  silverline: commuterAttendanceExceptions
};

const commuterFiles: FileServiceList = {
  items: [
    {
      id: "file-1",
      fileName: "daily-delay-export.csv",
      category: "operations",
      uploadedAt: "2026-03-06T11:20:00Z",
      status: "available"
    },
    {
      id: "file-2",
      fileName: "crew-roster.xlsx",
      category: "crew",
      uploadedAt: "2026-03-06T10:05:00Z",
      status: "processing"
    }
  ]
};

const streetcarFiles: FileServiceList = {
  items: [
    {
      id: "street-file-1",
      fileName: "incident-log.pdf",
      category: "safety",
      uploadedAt: "2026-03-06T09:15:00Z",
      status: "available"
    }
  ]
};

const commuterNotifications: NotificationList = {
  items: [
    {
      id: "notif-1",
      channel: "email",
      templateName: "Delay Escalation",
      recipientGroup: "Dispatch Leadership",
      enabled: true
    },
    {
      id: "notif-2",
      channel: "in_app",
      templateName: "Crew Relief Needed",
      recipientGroup: "Crew Management",
      enabled: true
    }
  ]
};

const streetcarNotifications: NotificationList = {
  items: [
    {
      id: "street-notif-1",
      channel: "in_app",
      templateName: "Street Incident Alert",
      recipientGroup: "Street Supervisors",
      enabled: true
    }
  ]
};

const commuterPowerBi: PowerBiEmbedList = {
  items: [
    {
      id: "bi-1",
      reportName: "Daily OTP",
      workspace: "Transit Ops",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
      enabled: true
    },
    {
      id: "bi-2",
      reportName: "Delay Detail",
      workspace: "Transit Ops",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=delay-detail",
      enabled: true
    }
  ]
};

const streetcarPowerBi: PowerBiEmbedList = {
  items: [
    {
      id: "street-bi-1",
      reportName: "Streetcar Service Summary",
      workspace: "Streetcar Ops",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=streetcar-service",
      enabled: true
    }
  ]
};

export const demoFiles: Record<PropertyCode, FileServiceList> = {
  caltrain: commuterFiles,
  texrail: commuterFiles,
  tre: commuterFiles,
  trirail: commuterFiles,
  nmrx: commuterFiles,
  ctrail: commuterFiles,
  ace: commuterFiles,
  capmetro: commuterFiles,
  kcstreetcar: streetcarFiles,
  okcstreetcar: streetcarFiles,
  octastreetcar: streetcarFiles,
  metrolinkarrow: commuterFiles,
  silverline: commuterFiles
};

export const demoNotifications: Record<PropertyCode, NotificationList> = {
  caltrain: commuterNotifications,
  texrail: commuterNotifications,
  tre: commuterNotifications,
  trirail: commuterNotifications,
  nmrx: commuterNotifications,
  ctrail: commuterNotifications,
  ace: commuterNotifications,
  capmetro: commuterNotifications,
  kcstreetcar: streetcarNotifications,
  okcstreetcar: streetcarNotifications,
  octastreetcar: streetcarNotifications,
  metrolinkarrow: commuterNotifications,
  silverline: commuterNotifications
};

export const demoPowerBi: Record<PropertyCode, PowerBiEmbedList> = {
  caltrain: commuterPowerBi,
  texrail: commuterPowerBi,
  tre: commuterPowerBi,
  trirail: commuterPowerBi,
  nmrx: commuterPowerBi,
  ctrail: commuterPowerBi,
  ace: commuterPowerBi,
  capmetro: commuterPowerBi,
  kcstreetcar: streetcarPowerBi,
  okcstreetcar: streetcarPowerBi,
  octastreetcar: streetcarPowerBi,
  metrolinkarrow: commuterPowerBi,
  silverline: commuterPowerBi
};
