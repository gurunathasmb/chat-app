import { verifyJWT } from '../utils/jwt.js';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = verifyJWT(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
