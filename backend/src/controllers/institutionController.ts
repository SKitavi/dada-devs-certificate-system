import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { institutionSchema } from '../utils/validation'

const prisma = new PrismaClient()

export class InstitutionController {
  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' })
      }

      const { error, value } = institutionSchema.validate(req.body)
      if (error) {
        return res.status(400).json({ error: error.details[0].message })
      }

      // Check if slug already exists
      const existingInstitution = await prisma.institution.findUnique({
        where: { slug: value.slug }
      })

      if (existingInstitution) {
        return res.status(400).json({ error: 'Institution with this slug already exists' })
      }

      const institution = await prisma.institution.create({
        data: value
      })

      res.status(201).json({
        message: 'Institution created successfully',
        institution
      })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query

      const institutions = await prisma.institution.findMany({
        include: {
          _count: {
            select: {
              users: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      })

      const total = await prisma.institution.count()

      res.json({
        institutions,
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

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      const institution = await prisma.institution.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              createdAt: true
            }
          },
          documents: true
        }
      })

      if (!institution) {
        return res.status(404).json({ error: 'Institution not found' })
      }

      // Check permissions
      if (req.user?.role !== 'ADMIN' && req.user?.institutionId !== id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      res.json({ institution })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      // Check permissions
      if (req.user?.role !== 'ADMIN' && req.user?.institutionId !== id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const { error, value } = institutionSchema.validate(req.body)
      if (error) {
        return res.status(400).json({ error: error.details[0].message })
      }

      // Check if slug already exists (excluding current institution)
      if (value.slug) {
        const existingInstitution = await prisma.institution.findFirst({
          where: {
            slug: value.slug,
            NOT: { id }
          }
        })

        if (existingInstitution) {
          return res.status(400).json({ error: 'Institution with this slug already exists' })
        }
      }

      const institution = await prisma.institution.update({
        where: { id },
        data: value
      })

      res.json({
        message: 'Institution updated successfully',
        institution
      })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' })
      }

      await prisma.institution.delete({
        where: { id }
      })

      res.json({ message: 'Institution deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }

  async addDocument(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { name, type, url } = req.body

      // Check permissions
      if (req.user?.role !== 'ADMIN' && req.user?.institutionId !== id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      if (!name || !type || !url) {
        return res.status(400).json({ error: 'Name, type, and URL are required' })
      }

      const document = await prisma.institutionDocument.create({
        data: {
          institutionId: id,
          name,
          type,
          url
        }
      })

      res.status(201).json({
        message: 'Document added successfully',
        document
      })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }

  async removeDocument(req: AuthRequest, res: Response) {
    try {
      const { id, documentId } = req.params

      // Check permissions
      if (req.user?.role !== 'ADMIN' && req.user?.institutionId !== id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      await prisma.institutionDocument.delete({
        where: {
          id: documentId,
          institutionId: id
        }
      })

      res.json({ message: 'Document removed successfully' })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }
}