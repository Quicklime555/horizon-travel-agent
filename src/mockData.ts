import { Trip } from './types';

export const mockTrips: Trip[] = [
  {
    id: 'trip-1',
    title: '成都 4 日探索之旅',
    description: '深入了解天府之国的文化、美景与大熊猫。',
    startDate: '2024-10-12',
    endDate: '2024-10-15',
    travelers: 2,
    status: 'exported',
    imageUrl: 'https://images.unsplash.com/photo-1543027202-581335f6060c?q=80&w=800&auto=format&fit=crop',
    tags: ['文化', '美食', 'AI 规划'],
    days: [
      {
        dayNumber: 1,
        date: '2024-10-12',
        location: '四川，成都',
        title: '抵达与大熊猫',
        activities: [
          {
            id: 'act-1',
            time: '09:00 AM',
            title: '成都大熊猫繁育研究基地',
            description: '建议尽早到达，在投喂时间观察大熊猫最活跃的状态。不要错过小熊猫展区。',
            type: 'attraction',
            duration: '3 小时',
            estimatedExpense: 50,
            imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=800&auto=format&fit=crop'
          },
          {
            id: 'act-2',
            time: '01:00 PM',
            title: '陈麻婆豆腐（午餐）',
            description: '品尝正宗川菜的必打卡之地。这里的麻婆豆腐堪称传奇，请做好迎接麻辣挑战的准备！',
            type: 'dining',
            priceLevel: '$$',
            estimatedExpense: 120,
            isAiSuggested: true
          }
        ]
      },
      {
        dayNumber: 2,
        date: '2024-10-13',
        location: '四川，成都',
        title: '文化与历史',
        activities: [
          {
            id: 'act-3',
            time: '10:00 AM',
            title: '武侯祠',
            description: '漫步于宁静的园林，深入了解三国时期的历史文化。',
            type: 'attraction',
            duration: '2 小时',
            estimatedExpense: 60
          }
        ]
      }
    ],
    budget: {
      total: 850,
      accommodation: 320,
      dining: 280,
      transport: 150
    }
  },
  {
    id: 'trip-2',
    title: '京都秋季探索之旅',
    description: '金秋时节，漫步于千年古都。',
    startDate: '2023-10-12',
    endDate: '2023-10-18',
    travelers: 1,
    status: 'exported',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    tags: ['文化', '美食', 'AI 规划'],
    days: [],
    budget: { total: 1200, accommodation: 500, dining: 400, transport: 200 }
  },
  {
    id: 'trip-3',
    title: '巴黎周末闲暇时光',
    description: '享受左岸咖啡与艺术。',
    startDate: '2024-05-05',
    endDate: '2024-05-08',
    travelers: 2,
    status: 'saved',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    tags: ['浪漫', '博物馆'],
    days: [],
    budget: { total: 1500, accommodation: 700, dining: 500, transport: 150 }
  },
  {
    id: 'trip-4',
    title: '巴塔哥尼亚徒步路线',
    description: '挑战南美风暴。',
    startDate: '2024-待定',
    endDate: '',
    travelers: 1,
    status: 'draft',
    imageUrl: 'https://images.unsplash.com/photo-1548430299-8800bd778b7e?q=80&w=800&auto=format&fit=crop',
    tags: ['冒险', '自然'],
    days: [],
    budget: { total: 2000, accommodation: 800, dining: 400, transport: 500 }
  }
];

export const DEMO_TRIP_ID = 'demo-chengdu-001';

export const PLANNER_DEMO_PRESET = {
  departure: '上海',
  destination: '成都',
  travelersCount: 2,
  budgetLevel: 'standard' as const,
  selectedDate: '2026-06-01',
  duration: 4,
};

export const PLANNER_DEMO_FIELD_EXAMPLES = {
  departure: [PLANNER_DEMO_PRESET.departure],
  destination: [PLANNER_DEMO_PRESET.destination],
  selectedDate: [PLANNER_DEMO_PRESET.selectedDate],
  duration: [`${PLANNER_DEMO_PRESET.duration} 天`],
  budgetLevel: ['舒适型'],
  travelersCount: ['两人'],
};

export const DEMO_DASHBOARD_STATS = {
  todayCount: '28',
  todayChange: '+18%',
  successRate: '98.2%',
  successChange: '+2.1%',
  failureRate: '1.8%',
  failureChange: '-0.6%',
  popularDestinations: [
    { name: '成都', value: 16, growth: '+24%', image: mockTrips[0]?.imageUrl },
    { name: '京都', value: 11, growth: '+12%', image: mockTrips[1]?.imageUrl },
    { name: '巴黎', value: 9, growth: '+9%', image: mockTrips[2]?.imageUrl },
    { name: '巴塔哥尼亚', value: 6, growth: '+5%', image: mockTrips[3]?.imageUrl },
  ],
};

export const DEMO_DASHBOARD_RUNS = [
  { id: 'run-demo-001', type: 'mock itinerary', status: 'completed', time: '30 秒前', prompt: '上海到成都双人舒适型 4 日行程', stack: '' },
  { id: 'run-demo-002', type: 'destination trend', status: 'completed', time: '2 分钟前', prompt: '成都热门目的地聚合', stack: '' },
  { id: 'run-demo-003', type: 'feedback sync', status: 'completed', time: '5 分钟前', prompt: '用户反馈摘要生成', stack: '' },
];

export const DEMO_DASHBOARD_FEEDBACKS = [
  { id: 'fb-demo-001', user: '评委 A', date: '今天', rating: 5, comment: '成都案例展示完整，生成速度快，适合比赛演示。', trip_plan_id: DEMO_TRIP_ID },
  { id: 'fb-demo-002', user: '评委 B', date: '今天', rating: 4, comment: '规划页示例填写很直观，能快速进入结果页。', trip_plan_id: DEMO_TRIP_ID },
  { id: 'fb-demo-003', user: '评委 C', date: '今天', rating: 5, comment: '热门目的地和历史行程都能直接打开，体验顺畅。', trip_plan_id: 'trip-2' },
];

export function getDemoHistoryTrips(): Trip[] {
  return mockTrips.map((trip, index) => {
    if (index === 0) {
      return {
        ...trip,
        origin: PLANNER_DEMO_PRESET.departure,
        destination: PLANNER_DEMO_PRESET.destination,
      };
    }

    return { ...trip };
  });
}

export function getDemoTripById(id: string): Trip | null {
  if (id !== DEMO_TRIP_ID) return null;

  const base = mockTrips[0];
  if (!base) return null;

  const startDate = PLANNER_DEMO_PRESET.selectedDate;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(startDateObj.getDate() + (PLANNER_DEMO_PRESET.duration - 1));
  const endDate = endDateObj.toISOString().split('T')[0];

  return {
    ...base,
    id: DEMO_TRIP_ID,
    status: 'completed',
    startDate,
    endDate,
    origin: PLANNER_DEMO_PRESET.departure,
    destination: PLANNER_DEMO_PRESET.destination,
    travelers: PLANNER_DEMO_PRESET.travelersCount,
    days: (base.days ?? []).map((day) => {
      const dateObj = new Date(startDateObj);
      dateObj.setDate(startDateObj.getDate() + (day.dayNumber - 1));
      const date = dateObj.toISOString().split('T')[0];
      return { ...day, date };
    }),
  };
}
