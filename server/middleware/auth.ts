import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth Error:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Attach user info to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Exception:', err);
    return res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};
