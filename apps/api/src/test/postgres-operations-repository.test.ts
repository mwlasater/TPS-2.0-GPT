import { describe, expect, it, vi } from "vitest";

import { PostgresOperationsRepository } from "../repositories/postgres-operations-repository.js";

describe("PostgresOperationsRepository", () => {
  it("maps schedule rows into train schedules", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "ct-101",
          train_number: "101",
          route_name: "San Francisco to San Jose",
          direction: "southbound",
          service_days: ["Mon", "Tue"],
          stop_count: 10
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const schedules = await repository.listTrainSchedules("caltrain");

    expect(schedules).toEqual({
      items: [
        {
          id: "ct-101",
          trainNumber: "101",
          routeName: "San Francisco to San Jose",
          direction: "southbound",
          serviceDays: ["Mon", "Tue"],
          stopCount: 10
        }
      ]
    });
  });

  it("maps run rows into train runs", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "caltrain-run-1",
          schedule_id: "ct-101",
          train_number: "101",
          operating_date: new Date("2026-03-06T00:00:00Z"),
          status: "in_progress",
          delay_minutes: 7,
          crew_assigned: 3,
          is_approved: false,
          approved_at: null,
          stop_count: 3,
          consist_count: 3,
          crew_count: 3
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const runs = await repository.listTrainRuns("caltrain");

    expect(runs).toEqual({
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
        }
      ]
    });
  });

  it("maps approval updates into train runs", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          stop_count: 3,
          consist_count: 3,
          crew_count: 3
        }
      ]
    }).mockResolvedValueOnce({
      rows: [
        {
          id: "caltrain-run-1",
          schedule_id: "ct-101",
          train_number: "101",
          operating_date: new Date("2026-03-06T00:00:00Z"),
          status: "approved",
          delay_minutes: 7,
          crew_assigned: 3,
          is_approved: true,
          approved_at: new Date("2026-03-06T12:30:00Z"),
          stop_count: 3,
          consist_count: 3,
          crew_count: 3
        }
      ]
    }).mockResolvedValueOnce({
      rows: []
    });

    const repository = new PostgresOperationsRepository({ query });
    const run = await repository.updateTrainRunApproval("caltrain", "caltrain-run-1", {
      isApproved: true,
      notes: "Ready for dispatch closeout."
    }, "Jordan Reyes");

    expect(run).toEqual({
      id: "caltrain-run-1",
      scheduleId: "ct-101",
      trainNumber: "101",
      operatingDate: "2026-03-06",
      status: "approved",
      delayMinutes: 7,
      crewAssigned: 3,
      isApproved: true,
      approvedAt: "2026-03-06T12:30:00.000Z",
      approvalBlockers: []
    });
  });

  it("maps unapproval updates into train runs", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "capmetro-run-1",
          schedule_id: "cm-701",
          train_number: "701",
          operating_date: new Date("2026-03-06T00:00:00Z"),
          status: "in_progress",
          delay_minutes: 2,
          crew_assigned: 2,
          is_approved: false,
          approved_at: null,
          stop_count: 2,
          consist_count: 1,
          crew_count: 2
        }
      ]
    }).mockResolvedValueOnce({
      rows: []
    });

    const repository = new PostgresOperationsRepository({ query });
    const run = await repository.updateTrainRunApproval(
      "capmetro",
      "capmetro-run-1",
      {
        isApproved: false,
        notes: "Reopened for crew correction."
      },
      "Jordan Reyes"
    );

    expect(run).toEqual({
      id: "capmetro-run-1",
      scheduleId: "cm-701",
      trainNumber: "701",
      operatingDate: "2026-03-06",
      status: "in_progress",
      delayMinutes: 2,
      crewAssigned: 2,
      isApproved: false,
      approvedAt: null,
      approvalBlockers: []
    });
  });

  it("rejects approval when readiness blockers exist", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          stop_count: 0,
          consist_count: 0,
          crew_count: 0
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });

    await expect(
      repository.updateTrainRunApproval("caltrain", "caltrain-run-2", {
        isApproved: true,
        notes: "Attempting approval."
      }, "Jordan Reyes")
    ).rejects.toThrow("train_run.approval_blocked");
  });

  it("maps batch approval results into updated and blocked runs", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ stop_count: 3, consist_count: 3, crew_count: 3 }]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "caltrain-run-1",
            schedule_id: "ct-101",
            train_number: "101",
            operating_date: new Date("2026-03-06T00:00:00Z"),
            status: "approved",
            delay_minutes: 7,
            crew_assigned: 3,
            is_approved: true,
            approved_at: new Date("2026-03-06T12:30:00Z"),
            stop_count: 3,
            consist_count: 3,
            crew_count: 3
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ stop_count: 0, consist_count: 0, crew_count: 0 }]
      })
      .mockResolvedValueOnce({
        rows: [{ stop_count: 0, consist_count: 0, crew_count: 0 }]
      });

    const repository = new PostgresOperationsRepository({ query });
    const result = await repository.updateTrainRunApprovalBatch(
      "caltrain",
      {
        runIds: ["caltrain-run-1", "caltrain-run-2"],
        isApproved: true,
        notes: "Batch ready for dispatch closeout."
      },
      "Jordan Reyes"
    );

    expect(result).toEqual({
      updatedRuns: [
        {
          id: "caltrain-run-1",
          scheduleId: "ct-101",
          trainNumber: "101",
          operatingDate: "2026-03-06",
          status: "approved",
          delayMinutes: 7,
          crewAssigned: 3,
          isApproved: true,
          approvedAt: "2026-03-06T12:30:00.000Z",
          approvalBlockers: []
        }
      ],
      blockedRuns: [
        {
          runId: "caltrain-run-2",
          blockers: [
            "Crew assignment required before approval.",
            "Consist assignment required before approval.",
            "Station stop records required before approval."
          ]
        }
      ]
    });
  });

  it("maps approval history rows into entries", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "approval-1",
          train_run_id: "caltrain-run-1",
          action: "approved",
          actor_name: "Jordan Reyes",
          notes: "Ready for dispatch closeout.",
          created_at: new Date("2026-03-06T12:15:00Z")
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const history = await repository.listTrainRunApprovalHistory("caltrain", "caltrain-run-1");

    expect(history).toEqual({
      items: [
        {
          id: "approval-1",
          runId: "caltrain-run-1",
          action: "approved",
          actorName: "Jordan Reyes",
          notes: "Ready for dispatch closeout.",
          createdAt: "2026-03-06T12:15:00.000Z"
        }
      ]
    });
  });

  it("maps schedule approval history rows into entries", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "approval-1",
          train_run_id: "caltrain-run-1",
          action: "approved",
          actor_name: "Jordan Reyes",
          notes: "Ready for dispatch closeout.",
          created_at: new Date("2026-03-06T12:15:00Z")
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const history = await repository.listTrainScheduleApprovalHistory("caltrain", "ct-101");

    expect(history).toEqual({
      items: [
        {
          id: "approval-1",
          runId: "caltrain-run-1",
          action: "approved",
          actorName: "Jordan Reyes",
          notes: "Ready for dispatch closeout.",
          createdAt: "2026-03-06T12:15:00.000Z"
        }
      ]
    });
  });

  it("maps fare enforcement dashboard metrics", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            total_records: 3,
            total_activity_count: 41,
            total_amtrak_transfers: 4,
            total_amtrak_tickets: 6,
            total_upass_count: 11,
            total_tickets_sold: 9,
            covered_runs: 2
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [{ run_id: "caltrain-run-3" }]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            inspector_name: "Morgan Lee",
            activity_count: 24,
            record_count: 2
          },
          {
            inspector_name: "Jordan Reyes",
            activity_count: 17,
            record_count: 1
          }
        ]
      });

    const repository = new PostgresOperationsRepository({ query });
    const dashboard = await repository.getFareEnforcementDashboard("caltrain");

    expect(dashboard).toEqual({
      totalRecords: 3,
      totalActivityCount: 41,
      totalAmtrakTransfers: 4,
      totalAmtrakTickets: 6,
      totalUpassCount: 11,
      totalTicketsSold: 9,
      coveredRuns: 2,
      uncoveredRuns: ["caltrain-run-3"],
      topInspectors: [
        {
          inspectorName: "Morgan Lee",
          activityCount: 24,
          recordCount: 2
        },
        {
          inspectorName: "Jordan Reyes",
          activityCount: 17,
          recordCount: 1
        }
      ]
    });
  });

  it("maps station stop rows into run stops", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "stop-1",
          station_code: "SFC",
          stop_sequence: 1,
          scheduled_time: "06:05",
          actual_time: "06:06",
          boardings: 42,
          alightings: 3
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const stops = await repository.listStationStops("caltrain", "run_caltrain_101_2026_03_06");

    expect(stops).toEqual({
      items: [
        {
          id: "stop-1",
          stationCode: "SFC",
          sequence: 1,
          scheduledTime: "06:05",
          actualTime: "06:06",
          boardings: 42,
          alightings: 3
        }
      ]
    });
  });

  it("maps stop updates into station stops", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [{ is_approved: false }]
    }).mockResolvedValueOnce({
      rows: [
        {
          id: "stop-1",
          station_code: "SFC",
          stop_sequence: 1,
          scheduled_time: "06:05",
          actual_time: "06:07",
          boardings: 45,
          alightings: 3
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const stop = await repository.updateStationStop("caltrain", "caltrain-run-1", "stop-1", {
      actualTime: "06:07",
      boardings: 45,
      alightings: 3
    });

    expect(stop).toEqual({
      id: "stop-1",
      stationCode: "SFC",
      sequence: 1,
      scheduledTime: "06:05",
      actualTime: "06:07",
      boardings: 45,
      alightings: 3
    });
  });

  it("maps delay rows into delay events", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "delay-1",
          category: "Signal delay",
          minutes: 4,
          notes: "Signal clearance held at interlocking.",
          reported_at: new Date("2026-03-06T06:19:00Z")
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const delays = await repository.listDelayEvents("caltrain", "run_caltrain_101_2026_03_06");

    expect(delays).toEqual({
      items: [
        {
          id: "delay-1",
          category: "Signal delay",
          minutes: 4,
          notes: "Signal clearance held at interlocking.",
          reportedAt: "2026-03-06T06:19:00.000Z"
        }
      ]
    });
  });

  it("maps consist rows into consist equipment", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "equip-1",
          equipment_number: "CAB-901",
          equipment_type: "Cab Car",
          position_index: 1,
          status: "active"
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const consist = await repository.listConsistEquipment(
      "caltrain",
      "run_caltrain_101_2026_03_06"
    );

    expect(consist).toEqual({
      items: [
        {
          id: "equip-1",
          equipmentNumber: "CAB-901",
          equipmentType: "Cab Car",
          position: 1,
          status: "active"
        }
      ]
    });
  });

  it("maps consist updates into consist equipment", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [{ is_approved: false }]
    }).mockResolvedValueOnce({
      rows: [
        {
          id: "equip-1",
          equipment_number: "CAB-901",
          equipment_type: "Cab Car",
          position_index: 1,
          status: "spare"
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const equipment = await repository.updateConsistEquipment(
      "caltrain",
      "caltrain-run-1",
      "equip-1",
      {
        position: 1,
        status: "spare"
      }
    );

    expect(equipment).toEqual({
      id: "equip-1",
      equipmentNumber: "CAB-901",
      equipmentType: "Cab Car",
      position: 1,
      status: "spare"
    });
  });

  it("maps crew rows into crew assignments", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "crew-1",
          employee_name: "Jordan Reyes",
          role_name: "Engineer",
          on_duty_time: "05:30",
          status: "assigned"
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const crew = await repository.listCrewAssignments(
      "caltrain",
      "run_caltrain_101_2026_03_06"
    );

    expect(crew).toEqual({
      items: [
        {
          id: "crew-1",
          employeeName: "Jordan Reyes",
          role: "Engineer",
          onDutyTime: "05:30",
          status: "assigned"
        }
      ]
    });
  });

  it("maps crew updates into crew assignments", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [{ is_approved: false }]
    }).mockResolvedValueOnce({
      rows: [
        {
          id: "crew-1",
          employee_name: "Jordan Reyes",
          role_name: "Engineer",
          on_duty_time: "05:45",
          status: "pending_relief"
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const crew = await repository.updateCrewAssignment(
      "caltrain",
      "caltrain-run-1",
      "crew-1",
      {
        role: "Engineer",
        onDutyTime: "05:45",
        status: "pending_relief"
      }
    );

    expect(crew).toEqual({
      id: "crew-1",
      employeeName: "Jordan Reyes",
      role: "Engineer",
      onDutyTime: "05:45",
      status: "pending_relief"
    });
  });

  it("maps fare enforcement rows into records", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "fare-1",
          train_run_id: "caltrain-run-1",
          inspector_name: "Morgan Lee",
          first_location: "SFC",
          second_location: "PAO",
          activity_count: 16,
          amtrak_transfers: 2,
          amtrak_tickets: 3,
          upass_count: 5,
          tickets_sold: 4,
          notes: "Peak boarding checks completed before Palo Alto.",
          captured_at: new Date("2026-03-06T06:28:00Z")
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const fare = await repository.listFareEnforcement("caltrain", "caltrain-run-1");

    expect(fare).toEqual({
      items: [
        {
          id: "fare-1",
          runId: "caltrain-run-1",
          inspectorName: "Morgan Lee",
          firstLocation: "SFC",
          secondLocation: "PAO",
          activityCount: 16,
          amtrakTransfers: 2,
          amtrakTickets: 3,
          upassCount: 5,
          ticketsSold: 4,
          notes: "Peak boarding checks completed before Palo Alto.",
          capturedAt: "2026-03-06T06:28:00.000Z"
        }
      ]
    });
  });

  it("maps fare enforcement summary rows into rollups", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          run_id: "caltrain-run-1",
          record_count: 2,
          activity_count: 24,
          amtrak_transfers: 5,
          amtrak_tickets: 7,
          upass_count: 9,
          tickets_sold: 4,
          inspectors: ["Jordan Reyes", "Morgan Lee"],
          latest_captured_at: new Date("2026-03-06T06:40:00Z")
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const summary = await repository.listFareEnforcementSummary("caltrain");

    expect(summary).toEqual({
      items: [
        {
          runId: "caltrain-run-1",
          recordCount: 2,
          activityCount: 24,
          amtrakTransfers: 5,
          amtrakTickets: 7,
          upassCount: 9,
          ticketsSold: 4,
          inspectors: ["Jordan Reyes", "Morgan Lee"],
          latestCapturedAt: "2026-03-06T06:40:00.000Z"
        }
      ]
    });
  });

  it("maps created fare enforcement rows into records", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "fare-new-1",
          train_run_id: "caltrain-run-1",
          inspector_name: "Morgan Lee",
          first_location: "SFC",
          second_location: "SJC",
          activity_count: 8,
          amtrak_transfers: 1,
          amtrak_tickets: 2,
          upass_count: 3,
          tickets_sold: 4,
          notes: "Midday inspection sweep.",
          captured_at: new Date("2026-03-06T09:00:00Z")
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const record = await repository.createFareEnforcement("caltrain", {
      runId: "caltrain-run-1",
      inspectorName: "Morgan Lee",
      firstLocation: "SFC",
      secondLocation: "SJC",
      activityCount: 8,
      amtrakTransfers: 1,
      amtrakTickets: 2,
      upassCount: 3,
      ticketsSold: 4,
      notes: "Midday inspection sweep.",
      capturedAt: "2026-03-06T09:00:00Z"
    });

    expect(record).toEqual({
      id: "fare-new-1",
      runId: "caltrain-run-1",
      inspectorName: "Morgan Lee",
      firstLocation: "SFC",
      secondLocation: "SJC",
      activityCount: 8,
      amtrakTransfers: 1,
      amtrakTickets: 2,
      upassCount: 3,
      ticketsSold: 4,
      notes: "Midday inspection sweep.",
      capturedAt: "2026-03-06T09:00:00.000Z"
    });
  });
});
