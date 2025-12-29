import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()
const authController = new AuthController()

// Public routes (rate limiting removed for easier testing)
router.post('/signup', authController.signup.bind(authController))
router.post('/login', authController.login.bind(authController))
router.post('/verify-email', authController.verifyEmail.bind(authController))

// Protected routes
router.post('/logout', authenticateToken, authController.logout.bind(authController))
router.get('/me', authenticateToken, authController.me.bind(authController))
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController))

// Admin routes
router.get('/logs', authenticateToken, requireAdmin, authController.getAuthLogs.bind(authController))

export default router