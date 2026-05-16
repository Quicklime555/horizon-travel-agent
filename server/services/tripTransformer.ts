import type { Trip } from '../../src/types.ts';

interface TripItemRow {
  id?: string;
  start_time?: string | null;
  place_name?: string | null;
  category?: string | null;
  notes?: string | null;
  estimated_cost?: number | null;
}

interface TripDayRow {
  day_index?: number | null;
  title?: string | null;
  summary?: string | null;
  itinerary_items?: TripItemRow[] | null;
}

interface TripPlanRow {
  id: string;
  origin?: string | null;
  destination?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  status?: string | null;
  preferences?: {
    title?: string;
    description?: string;
    tags?: string[];
    budgetBreakdown?: {
      total?: number;
      accommodation?: number;
      dining?: number;
      transport?: number;
    };
  } | null;
  itinerary_days?: TripDayRow[] | null;
}

const ACTIVITY_TYPES = new Set(['attraction', 'dining', 'hotel', 'transit']);

export function mapTripRecordToTrip(row: TripPlanRow): Trip {
  const budgetTotal = Number(row.budget ?? row.preferences?.budgetBreakdown?.total ?? 0);
  const budgetBreakdown = row.preferences?.budgetBreakdown;
  const days = [...(row.itinerary_days ?? [])]
    .sort((a, b) => Number(a.day_index ?? 0) - Number(b.day_index ?? 0))
    .map((day, dayIndex) => ({
      dayNumber: Number(day.day_index ?? dayIndex + 1),
      date: '',
      location: day.summary ?? row.destination ?? '',
      title: day.title ?? `第${dayIndex + 1}天`,
      activities: [...(day.itinerary_items ?? [])].map((item, itemIndex) => ({
        id: item.id ?? `d${dayIndex + 1}-a${itemIndex + 1}`,
        time: item.start_time ?? '09:00',
        title: item.place_name ?? '未命名活动',
        description: item.notes ?? '',
        type: ACTIVITY_TYPES.has(item.category ?? '') ? (item.category as 'attraction' | 'dining' | 'hotel' | 'transit') : 'attraction',
        estimatedExpense: Number(item.estimated_cost ?? 0),
        isAiSuggested: true,
      })),
    }));

  return {
    id: row.id,
    title: row.preferences?.title ?? `${row.destination ?? '旅行'}行程`,
    description: row.preferences?.description ?? 'AI 已为您生成可直接体验的比赛版演示行程。',
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    travelers: 1,
    status: (row.status as Trip['status']) ?? 'pending',
    imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cinematic%20travel%20destination%20hero%20image%2C%20beautiful%20landmark%2C%20editorial%20travel%20photography%2C%20clean%20sky%2C%20high%20detail&image_size=landscape_16_9',
    tags: row.preferences?.tags ?? [],
    days,
    budget: {
      total: budgetTotal,
      accommodation: Number(budgetBreakdown?.accommodation ?? Math.round(budgetTotal * 0.4)),
      dining: Number(budgetBreakdown?.dining ?? Math.round(budgetTotal * 0.3)),
      transport: Number(budgetBreakdown?.transport ?? Math.round(budgetTotal * 0.3)),
    },
    destination: row.destination ?? '',
    origin: row.origin ?? '',
  };
}
