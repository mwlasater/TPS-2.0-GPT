import type {
  PropertyCode,
  TrainRun,
  TrainRunList,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";

const scheduleCatalog: Record<PropertyCode, TrainSchedule[]> = {
  caltrain: [
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
  ],
  texrail: [
    {
      id: "tx-201",
      trainNumber: "201",
      routeName: "T&P to DFW Airport",
      direction: "westbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      stopCount: 9
    }
  ],
  tre: [
    {
      id: "tre-401",
      trainNumber: "401",
      routeName: "Dallas Union to Fort Worth T&P",
      direction: "westbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      stopCount: 8
    },
    {
      id: "tre-402",
      trainNumber: "402",
      routeName: "Fort Worth T&P to Dallas Union",
      direction: "eastbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      stopCount: 8
    }
  ],
  trirail: [],
  nmrx: [],
  ctrail: [],
  ace: [],
  capmetro: [
    {
      id: "cm-701",
      trainNumber: "701",
      routeName: "Leander to Downtown Austin",
      direction: "southbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      stopCount: 9
    }
  ],
  kcstreetcar: [
    {
      id: "kc-01",
      trainNumber: "SC-01",
      routeName: "Main Street Line",
      direction: "northbound",
      serviceDays: ["Daily"],
      stopCount: 6
    }
  ],
  okcstreetcar: [],
  octastreetcar: [],
  metrolinkarrow: [],
  silverline: []
};

const defaultRuns: TrainRun[] = [
  {
    id: "run-1",
    scheduleId: "ct-101",
    trainNumber: "101",
    operatingDate: "2026-03-06",
    status: "in_progress",
    delayMinutes: 7,
    crewAssigned: 3
  },
  {
    id: "run-2",
    scheduleId: "ct-154",
    trainNumber: "154",
    operatingDate: "2026-03-06",
    status: "approved",
    delayMinutes: 0,
    crewAssigned: 3
  }
];

export function listTrainSchedules(propertyCode: PropertyCode): TrainScheduleList {
  return {
    items: scheduleCatalog[propertyCode]
  };
}

export function listTrainRuns(propertyCode: PropertyCode): TrainRunList {
  const schedules = scheduleCatalog[propertyCode];

  if (!schedules.length) {
    return { items: [] };
  }

  return {
    items: schedules.map((schedule, index) => {
      const defaultRun = defaultRuns[index % defaultRuns.length]!;

      return {
        ...defaultRun,
        id: `${propertyCode}-run-${index + 1}`,
        scheduleId: schedule.id,
        trainNumber: schedule.trainNumber,
        status: index === 0 ? "in_progress" : "approved"
      };
    })
  };
}
