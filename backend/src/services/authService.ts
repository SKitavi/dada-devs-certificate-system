import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { generateTokens, generateEmailVerificationToken, verifyEmailToken } from '../utils/jwt'
import { logAuthEvent, getClientInfo } from '../utils/logger'

const prisma = new PrismaClient()

export interface SignupData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  institutionId?: string
}

export interface LoginData {
  email: string
  password: string
}

export class AuthService {
  async signup(data: SignupData, req: any) {
    const { email, password, firstName, lastName, institutionId } = data
    const clientInfo = getClientInfo(req)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      await logAuthEvent({
        event: 'signup',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { email, error: 'Email already exists' }
      })
      throw new Error('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate email verification token
    const emailVerifyToken = generateEmailVerificationToken(email)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        institutionId,
        emailVerifyToken
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        profileCompleted: true,
        institutionId: true,
        createdAt: true
      }
    })

    // Log signup event
    await logAuthEvent({
      userId: user.id,
      event: 'signup',
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { email }
    })

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId || undefined
    })

    return {
      user,
      tokens,
      emailVerifyToken
    }
  }

  async login(data: LoginData, req: any) {
    const { email, password } = data
    const clientInfo = getClientInfo(req)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        institution: true
      }
    })

    if (!user) {
      await logAuthEvent({
        event: 'login_failure',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { email, error: 'User not found' }
      })
      throw new Error('Invalid credentials')
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      await logAuthEvent({
        userId: user.id,
        event: 'login_failure',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { email, error: 'Invalid password' }
      })
      throw new Error('Invalid credentials')
    }

    // Log successful login
    await logAuthEvent({
      userId: user.id,
      event: 'login_success',
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { email }
    })

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId || undefined
    })

    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      tokens
    }
  }

  async logout(userId: string, req: any) {
    const clientInfo = getClientInfo(req)

    await logAuthEvent({
      userId,
      event: 'logout',
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent
    })
  }

  async verifyEmail(token: string, req: any) {
    const clientInfo = getClientInfo(req)

    try {
      const { email } = verifyEmailToken(token)

      const user = await prisma.user.update({
        where: { email },
        data: {
          emailVerified: true,
          emailVerifyToken: null
        },
        select: {
          id: true,
          email: true,
          emailVerified: true
        }
      })

      await logAuthEvent({
        userId: user.id,
        event: 'email_verification',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { email }
      })

      return user
    } catch (error) {
      throw new Error('Invalid or expired verification token')
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        profileCompleted: true,
        institutionId: true,
        createdAt: true,
        updatedAt: true,
        institution: {
          select: {
            id: true,
            slug: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; institutionId?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        profileCompleted: !!(data.firstName && data.lastName)
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        profileCompleted: true,
        institutionId: true,
        updatedAt: true
      }
    })

    return user
  }
}