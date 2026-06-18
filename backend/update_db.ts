import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("CD2026", 12);
  
  await prisma.user.update({
    where: { email: "CD.ADMIN" },
    data: { passwordHash }
  });

  await prisma.systemSetting.upsert({
    where: { key: "company_name" },
    update: { value: "CAMPAMENTOS DIOSES" },
    create: { key: "company_name", value: "CAMPAMENTOS DIOSES" }
  });

  console.log("DB Updated!");
}

main().finally(async () => {
  await prisma.$disconnect();
});
