import test from 'node:test';
import assert from 'node:assert/strict';

import { mapTripRecordToTrip } from '../server/services/tripTransformer.ts';

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
