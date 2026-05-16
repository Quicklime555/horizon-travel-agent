export type TripStatus = 'saved' | 'exported' | 'draft' | 'pending' | 'processing' | 'generating' | 'completed' | 'failed';

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'attraction' | 'dining' | 'hotel' | 'transit';
  duration?: string;
  priceLevel?: string;
  estimatedExpense?: number;
  imageUrl?: string;
  isAiSuggested?: boolean;
  status?: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  location: string;
  title: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  travelers: number;
  status: TripStatus;
  imageUrl: string;
  tags: string[];
  days: DayPlan[];
  budget: {
    total: number;
    accommodation: number;
    dining: number;
    transport: number;
  };
  destination?: string;
  origin?: string;
}
