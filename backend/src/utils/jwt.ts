import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  institutionId?: string
}

export const generateTokens = (payload: JWTPayload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions)

  return { accessToken, refreshToken }
}

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export const generateEmailVerificationToken = (email: string): string => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' } as jwt.SignOptions)
}

export const verifyEmailToken = (token: string): { email: string } => {
  return jwt.verify(token, JWT_SECRET) as { email: string }
}