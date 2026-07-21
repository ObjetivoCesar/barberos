import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const barbershops = await prisma.barbershop.findMany({
    select: {
      id: true,
      name: true,
      whatsappNumber: true,
      planStatus: true,
      evolutionInstance: true,
    },
  });
  console.log("=== BARBERÍAS EN BD ===");
  console.log(JSON.stringify(barbershops, null, 2));

  const tokens = await prisma.magicToken.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { barbershopId: true, token: true, expiresAt: true, usedAt: true, createdAt: true },
  });
  console.log("\n=== ÚLTIMOS 5 MAGIC TOKENS ===");
  console.log(JSON.stringify(tokens, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
