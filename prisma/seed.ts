import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const user = await db.user.upsert({
    where: { email: "owner@inallmedia.local" },
    update: {},
    create: {
      email: "owner@inallmedia.local",
      name: "In All Media Owner",
      role: "admin",
    },
  });
  console.log(`Seeded user: ${user.email} (${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
