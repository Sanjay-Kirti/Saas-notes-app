const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  await prisma.note.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  const acmeTenant = await prisma.tenant.create({
    data: {
      slug: 'acme',
      name: 'Acme Corporation',
      plan: 'free',
    },
  })

  const globexTenant = await prisma.tenant.create({
    data: {
      slug: 'globex',
      name: 'Globex Corporation',
      plan: 'free',
    },
  })

  const passwordHash = await bcrypt.hash('password', 10)

  const acmeAdmin = await prisma.user.create({
    data: {
      email: 'admin@acme.test',
      passwordHash,
      role: 'admin',
      tenantId: acmeTenant.id,
    },
  })

  const acmeUser = await prisma.user.create({
    data: {
      email: 'user@acme.test',
      passwordHash,
      role: 'member',
      tenantId: acmeTenant.id,
    },
  })

  const globexAdmin = await prisma.user.create({
    data: {
      email: 'admin@globex.test',
      passwordHash,
      role: 'admin',
      tenantId: globexTenant.id,
    },
  })

  const globexUser = await prisma.user.create({
    data: {
      email: 'user@globex.test',
      passwordHash,
      role: 'member',
      tenantId: globexTenant.id,
    },
  })

  await prisma.note.createMany({
    data: [
      {
        title: 'Welcome to Acme Notes',
        content: 'This is your first note in the Acme tenant. You can create, edit, and delete notes here.',
        tenantId: acmeTenant.id,
        userId: acmeAdmin.id,
      },
      {
        title: 'Meeting Notes',
        content: 'Q1 Planning Meeting:\n- Review last quarter performance\n- Set goals for Q1\n- Allocate resources',
        tenantId: acmeTenant.id,
        userId: acmeAdmin.id,
      },
      {
        title: 'Project Ideas',
        content: 'Potential projects for this year:\n1. Customer portal upgrade\n2. Mobile app development\n3. API improvements',
        tenantId: acmeTenant.id,
        userId: acmeUser.id,
      },
    ],
  })

  await prisma.note.createMany({
    data: [
      {
        title: 'Globex Corporation Notes',
        content: 'Welcome to the Globex notes system. This is a secure, multi-tenant notes application.',
        tenantId: globexTenant.id,
        userId: globexAdmin.id,
      },
      {
        title: 'Team Updates',
        content: 'Weekly team sync:\n- Engineering: New features deployed\n- Sales: Q1 targets on track\n- Support: Customer satisfaction at 95%',
        tenantId: globexTenant.id,
        userId: globexUser.id,
      },
    ],
  })

  console.log('Seed completed successfully!')
  console.log('Test accounts created:')
  console.log('- admin@acme.test (password: password) - Admin role')
  console.log('- user@acme.test (password: password) - Member role')
  console.log('- admin@globex.test (password: password) - Admin role')
  console.log('- user@globex.test (password: password) - Member role')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
