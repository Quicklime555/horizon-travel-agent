import { Router } from 'express';
import { generateTrip, getAgentLogs } from '../services/aiService';
import { supabase } from '../lib/supabase';
import { mapTripRecordToTrip } from '../services/tripTransformer';

const router = Router();

/**
 * POST /api/trips/plan
 * 创建新的行程规划任务，调用 AI Agent 生成结构化行程并持久化至数据库。
 */
router.post('/plan', async (req: any, res: any) => {
  const { origin, destination, startDate, endDate, budget, preferences, pace, travelers } = req.body;
  const userId = req.user?.id;

  if (!destination || !startDate || !endDate || !budget) {
    return res.status(400).json({ error: 'Missing required fields: destination, startDate, endDate, budget' });
  }

  try {
    // 1. 在数据库中创建 "generating" 状态的 trip plan
    const { data: tripPlan, error: tripError } = await supabase
      .from('trip_plans')
      .insert({
        user_id: userId,
        origin,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget,
        preferences: { userPreferences: preferences, aiMetadata: {} },
        pace,
        status: 'generating'
      })
      .select()
      .single();

    if (tripError) throw tripError;

    // 2. 调用 AI Agent（内置重试与错误日志）
    const startTime = Date.now();
    let generatedTrip;
    try {
      generatedTrip = await generateTrip({
        origin,
        destination,
        startDate,
        endDate,
        budget,
        preferences: preferences || [],
        pace: pace || 'standard',
        travelers: travelers || 1
      });
    } catch (aiError: any) {
      // 记录失败到 planner_runs
      await supabase.from('planner_runs').insert({
        trip_plan_id: tripPlan.id,
        provider: 'deepseek',
        status: 'failed',
        error_message: aiError.message,
        latency_ms: Date.now() - startTime
      });

      await supabase.from('trip_plans').update({ status: 'failed' }).eq('id', tripPlan.id);
      throw aiError;
    }

    // 3. 将 AI 生成的结构化数据持久化到数据库
    await supabase.from('trip_plans').update({
      preferences: {
        userPreferences: preferences,
        title: generatedTrip.title,
        description: generatedTrip.description,
        tags: generatedTrip.tags,
        budgetBreakdown: generatedTrip.budget,
      },
      status: 'completed'
    }).eq('id', tripPlan.id);

    // 保存每日行程与活动项
    for (const day of generatedTrip.days) {
      const dayBudget = day.activities.reduce((sum, act) => sum + (act.estimatedExpense || 0), 0);

      const { data: dayData, error: dayError } = await supabase
        .from('itinerary_days')
        .insert({
          trip_plan_id: tripPlan.id,
          day_index: day.dayNumber,
          title: day.title,
          summary: day.location,
          day_budget: dayBudget
        })
        .select()
        .single();

      if (dayError) throw dayError;

      const itemsToInsert = day.activities.map((activity) => ({
        itinerary_day_id: dayData.id,
        start_time: activity.time,
        place_name: activity.title,
        category: activity.type,
        notes: activity.description,
        estimated_cost: activity.estimatedExpense || 0
      }));

      const { error: itemsError } = await supabase.from('itinerary_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    // 记录成功到 planner_runs
    await supabase.from('planner_runs').insert({
      trip_plan_id: tripPlan.id,
      provider: 'deepseek',
      status: 'success',
      latency_ms: Date.now() - startTime
    });

    // 返回完整的 Trip 对象（前端可直接使用）
    res.status(200).json({
      tripId: tripPlan.id,
      ...generatedTrip,
      id: tripPlan.id,  // 使用数据库分配的真实 ID
    });
  } catch (error: any) {
    console.error('Plan Generation Route Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.get('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const { data: trip, error } = await supabase
      .from('trip_plans')
      .select(`
        *,
        itinerary_days (
          day_index,
          title,
          summary,
          itinerary_items (
            id,
            start_time,
            place_name,
            category,
            notes,
            estimated_cost
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Trip plan not found' });
      }
      throw error;
    }

    res.status(200).json(mapTripRecordToTrip(trip));
  } catch (error: any) {
    console.error('Trip Details Route Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * GET /api/trips/agent-logs
 * 获取 AI Agent 的运行日志（供 Admin Dashboard 使用）
 */
router.get('/agent-logs', async (_req: any, res: any) => {
  try {
    const agentLogs = getAgentLogs();
    res.status(200).json(agentLogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
