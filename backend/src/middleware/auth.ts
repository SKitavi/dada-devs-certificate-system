import { Request, Response, NextFunction } from 'express'
import { verifyToken, JWTPayload } from '../utils/jwt'

export interface AuthRequest extends Request {
  user?: JWTPayload
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const user = verifyToken(token)
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}

export const requireAdmin = requireRole(['ADMIN'])