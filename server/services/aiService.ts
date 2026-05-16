/**
 * AI Service — 桥接层
 *
 * 将旧版 server/services/aiService.ts 委托给新的 src/ai/agent.ts，
 * 保持 tripRoutes.ts 中的 import 路径不变。
 */

import { generateTrip, getAgentLogs } from '../../src/ai/agent.js';
import type { PlanRequest, GeneratedTrip } from '../../src/ai/agent.js';

export { generateTrip, getAgentLogs };
export type { PlanRequest, GeneratedTrip };

/**
 * 兼容旧接口：generateTripItinerary
 * 将旧版参数格式适配为新版 PlanRequest
 */
export const generateTripItinerary = async (params: {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  preferences: string[];
  pace: string;
  travelers: number;
}): Promise<GeneratedTrip> => {
  return generateTrip({
    origin: params.origin,
    destination: params.destination,
    startDate: params.startDate,
    endDate: params.endDate,
    budget: params.budget,
    preferences: params.preferences,
    pace: (params.pace as PlanRequest['pace']) || 'standard',
    travelers: params.travelers,
  });
};
