import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://postgres.celkcsawwdvwnjfhjmkg:SZjmmmpjNYZvsyql@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const telefonos = ['593989545740', '593981283453']
  
  // Buscar barbería de César
  const shop = await prisma.barbershop.findFirst({
    where: { whatsappNumber: '593963410409' }
  })
  
  if (!shop) {
    console.error('❌ No se encontró Barbería Tuneche')
    process.exit(1)
  }

  console.log(`Barbería: ${shop.name} (${shop.id})`)
  
  for (const whatsapp of telefonos) {
    // Buscar cliente
    const customer = await prisma.barberCustomer.findFirst({
      where: { barbershopId: shop.id, whatsapp }
    })
    
    if (!customer) {
      console.log(`ℹ️  No existe cliente con número ${whatsapp}`)
    } else {
      // Eliminar visitas primero
      await prisma.barberVisit.deleteMany({ where: { customerId: customer.id } })
      // Eliminar intentos
      await prisma.visitAttempt.deleteMany({ where: { customerId: customer.id } })
      // Eliminar cliente
      await prisma.barberCustomer.delete({ where: { id: customer.id } })
      console.log(`✅ Eliminado cliente ${whatsapp} (${customer.name || 'sin nombre'})`)
    }
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
