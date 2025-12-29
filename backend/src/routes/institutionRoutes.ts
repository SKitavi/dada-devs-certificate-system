import { Router } from 'express'
import { InstitutionController } from '../controllers/institutionController'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()
const institutionController = new InstitutionController()

// All routes require authentication
router.use(authenticateToken)

// Institution CRUD
router.post('/', requireAdmin, institutionController.create.bind(institutionController))
router.get('/', institutionController.getAll.bind(institutionController))
router.get('/:id', institutionController.getById.bind(institutionController))
router.put('/:id', institutionController.update.bind(institutionController))
router.delete('/:id', requireAdmin, institutionController.delete.bind(institutionController))

// Document management
router.post('/:id/documents', institutionController.addDocument.bind(institutionController))
router.delete('/:id/documents/:documentId', institutionController.removeDocument.bind(institutionController))

export default router