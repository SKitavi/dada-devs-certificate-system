import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample institution
  const institution = await prisma.institution.create({
    data: {
      slug: 'dada-devs',
      name: 'Dada Devs',
      registrationNumber: 'DD-001',
      accreditationStatus: 'accredited',
      addressLine1: '123 Tech Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      postalCode: '100001',
      contactPersonName: 'Jane Doe',
      contactPersonRole: 'Director',
      contactEmail: 'contact@dadadevs.org',
      contactPhone: '+234-800-123-4567',
      website: 'https://dadadevs.org',
      verificationStatus: 'verified'
    }
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dadadevs.org',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
      profileCompleted: true,
      institutionId: institution.id
    }
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const regularUser = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: userPassword,
      firstName: 'Student',
      lastName: 'User',
      role: 'USER',
      emailVerified: true,
      profileCompleted: false
    }
  })

  console.log('Seed data created successfully!')
  console.log('Admin user:', { email: 'admin@dadadevs.org', password: 'admin123' })
  console.log('Regular user:', { email: 'student@example.com', password: 'user123' })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })