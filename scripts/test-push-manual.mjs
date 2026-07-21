import webpush from "web-push";
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://postgres.celkcsawwdvwnjfhjmkg:SZjmmmpjNYZvsyql@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Configurar VAPID
const email = process.env.VAPID_EMAIL || "mailto:admin@barberos.app"
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY

console.log('📧 VAPID_EMAIL:', email)
console.log('🔑 NEXT_PUBLIC_VAPID_PUBLIC_KEY:', publicKey ? '✅ Configurado' : '❌ FALTA')
console.log('🔑 VAPID_PRIVATE_KEY:', privateKey ? '✅ Configurado' : '❌ FALTA')

if (!publicKey || !privateKey) {
  console.error('\n❌ ERROR: Variables VAPID no configuradas')
  process.exit(1)
}

webpush.setVapidDetails(email, publicKey, privateKey)

async function main() {
  console.log('\n🔍 Probando envío de push...\n')

  // Obtener barbería
  const shop = await prisma.barbershop.findFirst({
    where: { whatsappNumber: '593963410409' }
  })
  console.log('📍 Barbería:', shop?.name, '(ID:', shop?.id, ')')

  // Obtener suscripciones
  const subs = await prisma.pushSubscription.findMany({
    where: { barbershopId: shop?.id }
  })
  console.log('📱 Suscripciones:', subs.length)

  if (subs.length === 0) {
    console.error('❌ NO hay suscripciones push')
    process.exit(1)
  }

  const sub = subs[0]
  console.log('🔑 Endpoint:', sub.endpoint.substring(0, 50) + '...')

  const pushPayload = JSON.stringify({
    title: "✂️ Check-in recibido",
    body: "Test: Cliente fue atendido por Juanito. Toca para aprobar.",
    url: "/panel",
  })

  const pushSub = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }

  console.log('\n🚀 Enviando push...')

  try {
    const result = await webpush.sendNotification(pushSub, pushPayload)
    console.log('✅ push enviado!')
    console.log('📦 Status:', result.statusCode)
  } catch (err) {
    console.error('❌ Error enviando push:')
    console.error('   Status:', err.statusCode)
    console.error('   Message:', err.message)
    console.error('   Body:', err.body)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
