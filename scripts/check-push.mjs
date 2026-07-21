import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://postgres.celkcsawwdvwnjfhjmkg:SZjmmmpjNYZvsyql@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔍 DIAGNÓSTICO DE PUSH NOTIFICATIONS\n')
  console.log('='.repeat(50))

  // 1. Ver barbería
  console.log('\n📍 Barbería Tuneche:')
  const shop = await prisma.barbershop.findFirst({
    where: { whatsappNumber: '593963410409' }
  })
  console.log(`   ID: ${shop?.id}`)
  console.log(`   Nombre: ${shop?.name}`)

  // 2. Ver suscripciones push
  console.log('\n📱 Suscripciones Push:')
  const subs = await prisma.pushSubscription.findMany({
    where: { barbershopId: shop?.id }
  })
  console.log(`   Total: ${subs.length}`)
  if (subs.length > 0) {
    subs.forEach((s, i) => {
      console.log(`   ${i + 1}. Endpoint: ${s.endpoint.substring(0, 50)}...`)
    })
  } else {
    console.log('   ⚠️  NO HAY SUSCRIPCIONES - El barbero no ha aceptado notificaciones')
  }

  // 3. Ver intentos recientes
  console.log('\n📋 Intentos de check-in (últimas 24h):')
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const attempts = await prisma.visitAttempt.findMany({
    where: {
      barbershopId: shop?.id,
      createdAt: { gte: yesterday }
    },
    orderBy: { createdAt: 'desc' }
  })
  console.log(`   Total: ${attempts.length}`)
  attempts.forEach((a, i) => {
    console.log(`   ${i + 1}. [${a.status}] ${a.reason} - ${new Date(a.createdAt).toLocaleTimeString()}`)
  })

  // 4. Ver visitas pendientes
  console.log('\n⏳ Visitas Pendientes:')
  const pending = await prisma.barberVisit.findMany({
    where: { status: 'PENDING' },
    include: { customer: true }
  })
  console.log(`   Total: ${pending.length}`)
  pending.forEach((v, i) => {
    console.log(`   ${i + 1}. Cliente ID: ${v.customerId} - Staff: ${v.staffId || 'SIN ASIGNAR'}`)
  })

  console.log('\n' + '='.repeat(50))
  console.log('\n📝 NOTAS:')
  console.log('   1. Si NO hay suscripciones → El barbero debe activar notificaciones en /panel')
  console.log('   2. Si NO hay intentos → El cliente aún no ha enviado RV55')
  console.log('   3. Si hay visitas pendientes sin staffId → El barbero no fue seleccionado')
  
  await prisma.$disconnect()
}

main().catch(console.error)
