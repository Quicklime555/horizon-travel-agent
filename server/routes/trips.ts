import { Router, Response } from 'express';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * @route POST /api/trips/plan
 * @desc Create a new trip plan (triggers AI generation in a real scenario)
 */
router.post('/plan', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { origin, destination, startDate, endDate, budget, preferences, pace } = req.body;
  const userId = req.user.id;

  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  try {
    // 1. Create the trip plan record
    const { data: trip, error: tripError } = await supabase
      .from('trip_plans')
      .insert([
        {
          user_id: userId,
          origin,
          destination,
          start_date: startDate,
          end_date: endDate,
          budget,
          preferences: preferences || [],
          pace,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (tripError) throw tripError;

    // TODO: In a production environment, you would trigger the LLM Agent here.
    // For now, we return the record so the client can start polling or wait.
    
    res.status(201).json(trip);
  } catch (error: any) {
    console.error('Error creating trip plan:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/trips/history
 * @desc Get list of user's past trip plans
 */
router.get('/history', verifyAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const { data: trips, error } = await supabase
      .from('trip_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(trips);
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/trips/:id
 * @desc Get full details of a specific trip, including itinerary days and items
 */
router.get('/:id', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { data: trip, error } = await supabase
      .from('trip_plans')
      .select(`
        *,
        itinerary_days (
          *,
          itinerary_items (*)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Trip plan not found' });
      throw error;
    }

    res.json(trip);
  } catch (error: any) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/trips/:id
 * @desc Delete a trip plan
 */
router.delete('/:id', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { error } = await supabase
      .from('trip_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Trip plan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting trip plan:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
