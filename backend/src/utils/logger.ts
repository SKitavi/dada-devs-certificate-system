import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthLogData {
  userId?: string
  event: 'signup' | 'login_success' | 'login_failure' | 'logout' | 'password_reset' | 'email_verification'
  ipAddress?: string
  userAgent?: string
  metadata?: any
}

export const logAuthEvent = async (data: AuthLogData) => {
  try {
    await prisma.authenticationLog.create({
      data: {
        userId: data.userId,
        event: data.event,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    })
  } catch (error) {
    console.error('Failed to log auth event:', error)
  }
}

export const getClientInfo = (req: any) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent']
  }
}