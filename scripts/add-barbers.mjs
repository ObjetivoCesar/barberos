import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://postgres.celkcsawwdvwnjfhjmkg:SZjmmmpjNYZvsyql@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Buscar barbería de César (Tuneche)
  const shop = await prisma.barbershop.findFirst({
    where: { whatsappNumber: '593963410409' }
  })

  if (!shop) {
    console.error('❌ No se encontró Barbería Tuneche')
    process.exit(1)
  }

  console.log(`✅ Barbería: ${shop.name} (ID: ${shop.id})`)

  // Verificar si ya existen Juanito y Abelito
  const existingStaff = await prisma.barberStaff.findMany({
    where: { barbershopId: shop.id }
  })

  console.log('📋 Staff actual:', existingStaff.map(s => s.name).join(', '))

  // Crear Juanito si no existe
  if (!existingStaff.find(s => s.name === 'Juanito')) {
    await prisma.barberStaff.create({
      data: {
        barbershopId: shop.id,
        name: 'Juanito',
        role: 'BARBER'
      }
    })
    console.log('✅ Creado: Juanito (BARBER)')
  } else {
    console.log('ℹ️  Juanito ya existe')
  }

  // Crear Abelito si no existe
  if (!existingStaff.find(s => s.name === 'Abelito')) {
    await prisma.barberStaff.create({
      data: {
        barbershopId: shop.id,
        name: 'Abelito',
        role: 'BARBER'
      }
    })
    console.log('✅ Creado: Abelito (BARBER)')
  } else {
    console.log('ℹ️  Abelito ya existe')
  }

  // Mostrar staff final
  const finalStaff = await prisma.barberStaff.findMany({
    where: { barbershopId: shop.id }
  })

  console.log('\n📋 Staff final:')
  finalStaff.forEach(s => {
    console.log(`   - ${s.name} (${s.role}) [ID: ${s.id}]`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
