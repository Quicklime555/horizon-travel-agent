import apiClient from './api';
import { Trip } from '../types';

export interface TripPlanRequest {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  preferences: string[];
  pace: 'relaxed' | 'standard' | 'fast-paced';
}

const tripService = {
  // Create a new planning task
  planTrip: async (data: TripPlanRequest): Promise<{ id: string }> => {
    const response = await apiClient.post('/trips/plan', data);
    return response.data;
  },

  // Get trip details
  getTripDetails: async (id: string): Promise<Trip> => {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  },

  // Get history
  getHistory: async (): Promise<Trip[]> => {
    const response = await apiClient.get('/history');
    return response.data;
  },

  // Regenerate trip
  regenerateTrip: async (id: string): Promise<{ id: string }> => {
    const response = await apiClient.post(`/trips/${id}/regenerate`);
    return response.data;
  },

  // Update preferences
  updatePreferences: async (id: string, preferences: string[]): Promise<Trip> => {
    const response = await apiClient.patch(`/trips/${id}/preferences`, { preferences });
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (id: string, score: number, comment: string): Promise<void> => {
    await apiClient.post(`/trips/${id}/feedback`, { score, comment });
  },

  // Admin: Get system stats
  getAdminStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Admin: Get planner runs (logs)
  getPlannerRuns: async () => {
    const response = await apiClient.get('/admin/planner-runs');
    return response.data;
  },

  // Admin: Get all feedback
  getAllFeedback: async () => {
    const response = await apiClient.get('/admin/feedback');
    return response.data;
  },

  // Polling logic for long-running generation
  pollTripUntilComplete: async (id: string, interval = 3000, maxAttempts = 20): Promise<Trip> => {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const trip = await tripService.getTripDetails(id);
      
      // Check if the trip is in a terminal state
      if (trip.status === 'completed' || trip.status === 'saved' || trip.status === 'exported') {
        return trip;
      }
      
      if (trip.status === 'failed') {
        throw new Error('AI 行程规划引擎执行失败，请尝试调整偏好后重试。');
      }
      
      // Wait for the next poll
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
    
    throw new Error('行程生成超时，这可能是由于复杂的地理计算导致的，请点击重试。');
  }
};

export default tripService;
