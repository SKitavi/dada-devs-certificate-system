import Joi from 'joi'

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  institutionId: Joi.string().optional()
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export const institutionSchema = Joi.object({
  slug: Joi.string().min(2).max(50).required(),
  name: Joi.string().min(2).max(100).required(),
  registrationNumber: Joi.string().max(50).optional(),
  accreditationStatus: Joi.string().valid('pending', 'accredited', 'not_accredited').optional(),
  addressLine1: Joi.string().max(100).optional(),
  addressLine2: Joi.string().max(100).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  country: Joi.string().max(50).optional(),
  postalCode: Joi.string().max(20).optional(),
  contactPersonName: Joi.string().max(100).optional(),
  contactPersonRole: Joi.string().max(50).optional(),
  contactEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().max(20).optional(),
  website: Joi.string().uri().optional(),
  logoUrl: Joi.string().uri().optional()
})

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  institutionId: Joi.string().optional()
})