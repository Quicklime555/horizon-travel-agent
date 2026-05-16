import test from 'node:test';
import assert from 'node:assert/strict';

import { mapTripRecordToTrip } from '../server/services/tripTransformer.ts';
import {
  DEMO_TRIP_ID,
  DEMO_DASHBOARD_FEEDBACKS,
  DEMO_DASHBOARD_RUNS,
  DEMO_DASHBOARD_STATS,
  getDemoHistoryTrips,
  getDemoTripById,
  PLANNER_DEMO_FIELD_EXAMPLES,
  PLANNER_DEMO_PRESET,
} from '../src/mockData.ts';
import {
  AGENT_LOADER_COMPLETION_DELAY_MS,
  AGENT_LOADER_MIN_DURATION_MS,
  getAgentLoaderProgress,
  shouldCompleteAgentLoader,
} from '../src/components/agentLoaderProgress.ts';

test('mapTripRecordToTrip maps Supabase trip detail rows into the frontend Trip shape', () => {
  const trip = mapTripRecordToTrip({
    id: 'trip-1',
    origin: '上海',
    destination: '杭州',
    start_date: '2026-05-20',
    end_date: '2026-05-22',
    budget: 3000,
    status: 'completed',
    preferences: {
      title: '杭州三日慢游',
      description: '适合比赛演示的完整行程。',
      tags: ['西湖', '美食'],
      budgetBreakdown: {
        total: 3000,
        accommodation: 1200,
        dining: 900,
        transport: 900,
      },
    },
    itinerary_days: [
      {
        day_index: 1,
        title: '第1天：西湖初见',
        summary: '西湖景区',
        itinerary_items: [
          {
            id: 'item-1',
            start_time: '09:00',
            place_name: '西湖游船',
            category: 'attraction',
            notes: '建议上午前往，避开高峰。',
            estimated_cost: 120,
          },
        ],
      },
    ],
  });

  assert.equal(trip.id, 'trip-1');
  assert.equal(trip.destination, '杭州');
  assert.equal(trip.title, '杭州三日慢游');
  assert.equal(trip.days.length, 1);
  assert.equal(trip.days[0].dayNumber, 1);
  assert.equal(trip.days[0].activities[0].title, '西湖游船');
  assert.equal(trip.days[0].activities[0].estimatedExpense, 120);
  assert.deepEqual(trip.tags, ['西湖', '美食']);
  assert.deepEqual(trip.budget, {
    total: 3000,
    accommodation: 1200,
    dining: 900,
    transport: 900,
  });
});

test('getDemoTripById returns the Chengdu demo trip', () => {
  const trip = getDemoTripById(DEMO_TRIP_ID);
  assert.ok(trip);
  assert.equal(trip.destination, '成都');
  assert.equal(trip.origin, '上海');
  assert.equal(trip.travelers, 2);
});

test('PLANNER_DEMO_PRESET uses a fixed budget level', () => {
  assert.deepEqual(PLANNER_DEMO_PRESET, {
    departure: '上海',
    destination: '成都',
    travelersCount: 2,
    budgetLevel: 'standard',
    selectedDate: '2026-06-01',
    duration: 4,
  });
});

test('PLANNER_DEMO_FIELD_EXAMPLES provides hover content for planner fields', () => {
  assert.deepEqual(PLANNER_DEMO_FIELD_EXAMPLES.departure, ['上海']);
  assert.deepEqual(PLANNER_DEMO_FIELD_EXAMPLES.destination, ['成都']);
  assert.deepEqual(PLANNER_DEMO_FIELD_EXAMPLES.selectedDate, ['2026-06-01']);
  assert.deepEqual(PLANNER_DEMO_FIELD_EXAMPLES.duration, ['4 天']);
  assert.deepEqual(PLANNER_DEMO_FIELD_EXAMPLES.budgetLevel, ['舒适型']);
  assert.deepEqual(PLANNER_DEMO_FIELD_EXAMPLES.travelersCount, ['两人']);
});

test('demo history and dashboard data are available for demo pages', () => {
  const history = getDemoHistoryTrips();
  assert.ok(history.length >= 3);
  assert.equal(history[0].destination, '成都');
  assert.ok(DEMO_DASHBOARD_STATS.popularDestinations.length > 0);
  assert.ok(DEMO_DASHBOARD_RUNS.length > 0);
  assert.ok(DEMO_DASHBOARD_FEEDBACKS.length > 0);
});

test('agent loader keeps progress below completion until minimum duration is reached', () => {
  assert.equal(AGENT_LOADER_MIN_DURATION_MS, 4500);
  assert.equal(AGENT_LOADER_COMPLETION_DELAY_MS, 800);
  assert.equal(getAgentLoaderProgress(0, false), 3);
  assert.ok(getAgentLoaderProgress(2000, true) > 3);
  assert.ok(getAgentLoaderProgress(2000, true) <= 92);
  assert.ok(getAgentLoaderProgress(4499, true) <= 92);
  assert.equal(shouldCompleteAgentLoader(4499, true), false);
  assert.equal(getAgentLoaderProgress(4500, true), 100);
  assert.equal(shouldCompleteAgentLoader(4500, true), true);
});
