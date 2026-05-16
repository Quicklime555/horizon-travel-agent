/**
 * AI Agent — 行程生成编排层
 *
 * 职责：
 * 1. 构造精密的 System Prompt + User Prompt
 * 2. 调用 DeepSeek 官方 API，通过 JSON 输出约束生成结构化结果
 * 3. 对返回结果做双层校验（JSON 解析 + 字段完整性）
 * 4. 若解析失败自动重试（最多 2 次），并在每次失败时记录详细错误日志
 * 5. 将 LLM 自由文本映射为前端 types.ts 所定义的 Trip 结构
 */

import { getDeepSeekConfig } from './deepseekConfig';

// ────────────────────────────────────────────────────────────────────
// Types  (与前端 src/types.ts 保持一致，服务端独立声明以解耦)
// ────────────────────────────────────────────────────────────────────
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

export interface TripBudget {
  total: number;
  accommodation: number;
  dining: number;
  transport: number;
}

export interface GeneratedTrip {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  travelers: number;
  status: 'completed';
  imageUrl: string;
  tags: string[];
  days: DayPlan[];
  budget: TripBudget;
  destination: string;
  origin: string;
}

/** 前端 / 路由层传入的规划请求 */
export interface PlanRequest {
  origin: string;
  destination: string;
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  budget: number;
  preferences: string[];
  pace: 'relaxed' | 'standard' | 'fast-paced';
  travelers?: number;
}

// ────────────────────────────────────────────────────────────────────
// 日志工具
// ────────────────────────────────────────────────────────────────────
interface AgentLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  attempt: number;
  message: string;
  rawResponse?: string;
  error?: string;
}

const logs: AgentLog[] = [];

function log(level: AgentLog['level'], attempt: number, message: string, extra?: Partial<AgentLog>) {
  const entry: AgentLog = {
    timestamp: new Date().toISOString(),
    level,
    attempt,
    message,
    ...extra,
  };
  logs.push(entry);
  const prefix = `[AI-Agent][${entry.level.toUpperCase()}][attempt=${attempt}]`;
  if (level === 'error') {
    console.error(prefix, message, extra?.error ?? '');
  } else {
    console.log(prefix, message);
  }
}

/** 获取最近的 Agent 日志（可供 Admin Dashboard 使用） */
export function getAgentLogs(): AgentLog[] {
  return [...logs];
}

// ────────────────────────────────────────────────────────────────────
// System Prompt — 行程规划专用
// ────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "Horizon Travel Agent", an elite AI travel planner.

## Your Mission
Generate a precise, actionable, day-by-day travel itinerary based on the user's input. 
Your response must be a **single JSON object** that strictly conforms to the schema described below — no markdown fences, no commentary, no trailing text.

## Output Schema (TypeScript reference)
\`\`\`
{
  title: string;            // A catchy, inspiring trip title (8-15 words)
  description: string;      // A vivid 1-2 sentence summary of the trip
  tags: string[];            // 3-6 keyword tags (e.g. "美食", "历史", "海滩")
  imageUrl: string;          // A placeholder URL: "https://images.unsplash.com/photo-horizon-travel"
  budget: {
    total: number;           // Must equal the user's input budget
    accommodation: number;   // ≈ 35-45% of total
    dining: number;          // ≈ 25-35% of total
    transport: number;       // remainder
  };
  days: DayPlan[];           // One entry per calendar day between startDate and endDate (inclusive)
}

DayPlan {
  dayNumber: number;         // 1-indexed
  date: string;              // "YYYY-MM-DD" format, matching the actual calendar date
  location: string;          // The primary area/district for the day
  title: string;             // A thematic title for the day (e.g. "古城漫步与夜市探秘")
  activities: Activity[];    // 4-7 activities per day
}

Activity {
  id: string;                // Unique, format "d{dayNumber}-a{index}" (e.g. "d1-a1")
  time: string;              // 24h format "HH:MM" (e.g. "09:00", "14:30")
  title: string;             // Name of the place/activity
  description: string;       // 1-2 sentence description with practical tips
  type: "attraction" | "dining" | "hotel" | "transit";
  duration: string;          // e.g. "2 小时", "45 分钟"
  estimatedExpense: number;  // Per-person cost in the budget's currency
  isAiSuggested: true;       // Always true for AI-generated items
}
\`\`\`

## Critical Rules
1. **Budget integrity**: budget.accommodation + budget.dining + budget.transport MUST equal budget.total exactly.
2. **Date integrity**: The number of DayPlan objects must match the number of calendar days from startDate to endDate (inclusive). Each day's \`date\` field must be the correct calendar date.
3. **Activity expenses**: The sum of all activities' estimatedExpense across all days should approximate budget.total (within ±10%).
4. **Daily structure**: Each day should start with a breakfast/morning activity and end with dinner or an evening plan. Include exactly ONE hotel check-in on Day 1 and ONE hotel checkout on the last day.
5. **Preferences respect**: Prioritise activities matching user preferences. If the user loves "美食", include more dining experiences; if "历史文化", include museums and heritage sites.
6. **Pace adherence**: "relaxed" = 4 activities/day, "standard" = 5-6/day, "fast-paced" = 6-7/day.
7. **Realistic timing**: Activities must be in chronological order with realistic travel times between them.
8. **Language**: Use the same language as the destination name. If destination is in Chinese, respond in Chinese. If in English, respond in English.
9. **No extra text**: Return ONLY the JSON object. No markdown, no code fences, no explanation.`;

// ────────────────────────────────────────────────────────────────────
// JSON Schema — 作为结构化输出的参考约束
// ────────────────────────────────────────────────────────────────────
const RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    imageUrl: { type: 'string' },
    budget: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        accommodation: { type: 'number' },
        dining: { type: 'number' },
        transport: { type: 'number' },
      },
      required: ['total', 'accommodation', 'dining', 'transport'],
    },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dayNumber: { type: 'integer' },
          date: { type: 'string' },
          location: { type: 'string' },
          title: { type: 'string' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                time: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string', enum: ['attraction', 'dining', 'hotel', 'transit'] },
                duration: { type: 'string' },
                estimatedExpense: { type: 'number' },
                isAiSuggested: { type: 'boolean' },
              },
              required: ['id', 'time', 'title', 'description', 'type'],
            },
          },
        },
        required: ['dayNumber', 'date', 'location', 'title', 'activities'],
      },
    },
  },
  required: ['title', 'description', 'tags', 'budget', 'days'],
};

// ────────────────────────────────────────────────────────────────────
// 辅助：计算两个日期间的天数（含首尾）
// ────────────────────────────────────────────────────────────────────
function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ────────────────────────────────────────────────────────────────────
// 校验：确保 AI 输出满足前端 types.ts 的结构化要求
// ────────────────────────────────────────────────────────────────────
function validateTrip(data: any, req: PlanRequest): string[] {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== 'string') errors.push('Missing or invalid "title"');
  if (!data.description || typeof data.description !== 'string') errors.push('Missing or invalid "description"');
  if (!Array.isArray(data.tags)) errors.push('"tags" must be an array');
  if (!data.budget || typeof data.budget !== 'object') errors.push('Missing "budget" object');
  else {
    const { total, accommodation, dining, transport } = data.budget;
    if (typeof total !== 'number') errors.push('budget.total must be a number');
    if (typeof accommodation !== 'number') errors.push('budget.accommodation must be a number');
    if (typeof dining !== 'number') errors.push('budget.dining must be a number');
    if (typeof transport !== 'number') errors.push('budget.transport must be a number');
  }
  if (!Array.isArray(data.days) || data.days.length === 0) {
    errors.push('"days" must be a non-empty array');
  } else {
    const expectedDays = daysBetween(req.startDate, req.endDate);
    if (data.days.length !== expectedDays) {
      errors.push(`Expected ${expectedDays} days, got ${data.days.length}`);
    }
    for (const day of data.days) {
      if (!Array.isArray(day.activities) || day.activities.length === 0) {
        errors.push(`Day ${day.dayNumber}: activities must be a non-empty array`);
      }
    }
  }

  return errors;
}

// ────────────────────────────────────────────────────────────────────
// 后处理：补全 ID 和默认值，映射为前端 Trip 结构
// ────────────────────────────────────────────────────────────────────
function postProcess(data: any, req: PlanRequest): GeneratedTrip {
  const tripId = crypto.randomUUID();

  // 确保 budget.total 与用户预算一致
  if (data.budget) {
    data.budget.total = req.budget;
    // 如果子项之和不等于 total，按比例调整
    const subTotal = (data.budget.accommodation || 0) + (data.budget.dining || 0) + (data.budget.transport || 0);
    if (subTotal > 0 && Math.abs(subTotal - req.budget) > 1) {
      const ratio = req.budget / subTotal;
      data.budget.accommodation = Math.round((data.budget.accommodation || 0) * ratio);
      data.budget.dining = Math.round((data.budget.dining || 0) * ratio);
      data.budget.transport = req.budget - data.budget.accommodation - data.budget.dining;
    }
  }

  // 补全每个 Activity 的字段
  const days: DayPlan[] = (data.days || []).map((day: any, di: number) => ({
    dayNumber: day.dayNumber ?? di + 1,
    date: day.date,
    location: day.location || req.destination,
    title: day.title || `Day ${di + 1}`,
    activities: (day.activities || []).map((act: any, ai: number) => ({
      id: act.id || `d${di + 1}-a${ai + 1}`,
      time: act.time || '09:00',
      title: act.title || 'Activity',
      description: act.description || '',
      type: (['attraction', 'dining', 'hotel', 'transit'].includes(act.type) ? act.type : 'attraction') as Activity['type'],
      duration: act.duration,
      priceLevel: act.priceLevel,
      estimatedExpense: typeof act.estimatedExpense === 'number' ? act.estimatedExpense : 0,
      imageUrl: act.imageUrl,
      isAiSuggested: true,
      status: 'planned',
    })),
  }));

  return {
    id: tripId,
    title: data.title,
    description: data.description,
    startDate: req.startDate,
    endDate: req.endDate,
    travelers: req.travelers ?? 1,
    status: 'completed',
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-horizon-travel',
    tags: Array.isArray(data.tags) ? data.tags : [],
    days,
    budget: {
      total: req.budget,
      accommodation: data.budget?.accommodation ?? Math.round(req.budget * 0.4),
      dining: data.budget?.dining ?? Math.round(req.budget * 0.3),
      transport: data.budget?.transport ?? Math.round(req.budget * 0.3),
    },
    destination: req.destination,
    origin: req.origin,
  };
}

// ────────────────────────────────────────────────────────────────────
// 核心导出：generateTrip
// ────────────────────────────────────────────────────────────────────
const MAX_RETRIES = 2;

/**
 * 调用 DeepSeek 生成结构化行程。
 *
 * - 使用 JSON 输出约束与严格 Prompt 组合
 * - JSON 解析失败或字段校验失败时自动重试，最多重试 MAX_RETRIES 次
 * - 每次失败均记录详细错误日志，可通过 `getAgentLogs()` 获取
 *
 * @param planReq  用户提交的规划请求
 * @returns        符合前端 Trip 类型的结构化行程数据
 */
export async function generateTrip(planReq: PlanRequest): Promise<GeneratedTrip> {
  const { apiKey, model, baseUrl } = getDeepSeekConfig(process.env);
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured. Set it in your .env file.');
  }

  const expectedDays = daysBetween(planReq.startDate, planReq.endDate);

  const userPrompt = `Please create a ${expectedDays}-day travel itinerary with the following details:

- Origin: ${planReq.origin}
- Destination: ${planReq.destination}
- Start Date: ${planReq.startDate}
- End Date: ${planReq.endDate}
- Total Budget: ${planReq.budget} (currency unit based on destination)
- Travelers: ${planReq.travelers ?? 1} person(s)
- Preferences: ${planReq.preferences.length > 0 ? planReq.preferences.join('、') : 'general sightseeing'}
- Pace: ${planReq.pace}

Generate exactly ${expectedDays} days of activities. Remember budget.total must be ${planReq.budget}.`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    log('info', attempt, `Calling DeepSeek for ${planReq.destination} (${expectedDays} days, ¥${planReq.budget})`);

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\nUse this JSON schema as a strict reference:\n${JSON.stringify(RESPONSE_JSON_SCHEMA)}` },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 8192,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API request failed (${response.status}): ${errorText}`);
      }

      const payload = await response.json();
      const rawText = payload?.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new Error('DeepSeek returned an empty response');
      }

      log('info', attempt, `Received ${rawText.length} characters from DeepSeek`);

      // ── Step 1: JSON 解析 ────────────────────────────────────────
      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr: any) {
        // 尝试从 markdown 代码块中提取 JSON
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch?.[1]) {
          parsed = JSON.parse(jsonMatch[1].trim());
        } else {
          // 尝试贪婪匹配最外层 {}
          const braceMatch = rawText.match(/\{[\s\S]*\}/);
          if (braceMatch) {
            parsed = JSON.parse(braceMatch[0]);
          } else {
            throw new Error(`JSON parse failed: ${parseErr.message}`);
          }
        }
      }

      // ── Step 2: 结构校验 ────────────────────────────────────────
      const validationErrors = validateTrip(parsed, planReq);
      if (validationErrors.length > 0) {
        const errMsg = `Validation failed: ${validationErrors.join('; ')}`;
        log('warn', attempt, errMsg);

        // 若只是天数不匹配但其余字段合法，尝试修复而非重试
        if (validationErrors.length === 1 && validationErrors[0].startsWith('Expected')) {
          log('info', attempt, 'Attempting auto-fix for day count mismatch');
          // 截断或补齐天数（简易修复）
          while (parsed.days.length > expectedDays) parsed.days.pop();
          // 如果缺少天数则不强行补齐，保持当前输出（用户体验优先）
        } else if (attempt <= MAX_RETRIES) {
          lastError = new Error(errMsg);
          log('error', attempt, 'Will retry due to validation errors', { error: errMsg, rawResponse: rawText.slice(0, 500) });
          continue;
        }
        // 最后一次尝试即使有校验问题也尽量返回（降级策略）
      }

      // ── Step 3: 后处理 & 返回 ──────────────────────────────────
      const trip = postProcess(parsed, planReq);
      log('info', attempt, `Successfully generated trip "${trip.title}" with ${trip.days.length} days`);
      return trip;

    } catch (err: any) {
      lastError = err;
      log('error', attempt, `Generation failed: ${err.message}`, {
        error: err.stack || err.message,
        rawResponse: err.rawText?.slice(0, 500),
      });

      if (attempt > MAX_RETRIES) {
        break;
      }

      // 指数退避：attempt=1 → 1s, attempt=2 → 2s
      const backoffMs = attempt * 1000;
      log('info', attempt, `Retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // 所有重试均失败
  throw new Error(
    `AI trip generation failed after ${MAX_RETRIES + 1} attempts. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
}
