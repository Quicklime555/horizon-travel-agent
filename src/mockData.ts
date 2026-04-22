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
            imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08bef1ef1?q=80&w=800&auto=format&fit=crop'
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
