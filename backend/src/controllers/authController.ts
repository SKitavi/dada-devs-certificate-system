import { Request, Response } from 'express'
import { AuthService } from '../services/authService'
import { signupSchema, loginSchema, updateProfileSchema } from '../utils/validation'
import { AuthRequest } from '../middleware/auth'
import { PrismaClient } from '@prisma/client'

const authService = new AuthService()
const prisma = new PrismaClient()

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { error, value } = signupSchema.validate(req.body)
      if (error) {
        return res.status(400).json({ error: error.details[0].message })
      }

      const result = await authService.signup(value, req)

      res.status(201).json({
        message: 'User created successfully',
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        emailVerifyToken: result.emailVerifyToken
      })
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { error, value } = loginSchema.validate(req.body)
      if (error) {
        return res.status(400).json({ error: error.details[0].message })
      }

      const result = await authService.login(value, req)

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      })
    } catch (error) {
      res.status(401).json({ error: (error as Error).message })
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      if (req.user) {
        await authService.logout(req.user.userId, req)
      }

      res.json({ message: 'Logout successful' })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const user = await authService.getProfile(req.user.userId)
      res.json({ user })
    } catch (error) {
      res.status(404).json({ error: (error as Error).message })
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const { error, value } = updateProfileSchema.validate(req.body)
      if (error) {
        return res.status(400).json({ error: error.details[0].message })
      }

      const user = await authService.updateProfile(req.user.userId, value)
      res.json({ message: 'Profile updated successfully', user })
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body

      if (!token) {
        return res.status(400).json({ error: 'Verification token required' })
      }

      const user = await authService.verifyEmail(token, req)
      res.json({ message: 'Email verified successfully', user })
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  async getAuthLogs(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' })
      }

      const { page = 1, limit = 50, event, userId } = req.query

      const where: any = {}
      if (event) where.event = event
      if (userId) where.userId = userId

      const logs = await prisma.authenticationLog.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      })

      const total = await prisma.authenticationLog.count({ where })

      res.json({
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }
}