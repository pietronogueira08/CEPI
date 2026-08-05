import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = "file:" + path.join(__dirname, "..", "prisma", "dev.db");
const adapter = new PrismaLibSql({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const emails = [
  { email: "diretor@cepi.edu.br", password: "Admin@123" },
  { email: "carlos@cepi.edu.br", password: "Teacher@123" },
  { email: "joao@cepi.edu.br", password: "Student@123" },
  { email: "roberto.pai@email.com", password: "Parent@123" },
];

console.log("\n=== DIAGNÓSTICO DO BANCO ===\n");

for (const { email, password } of emails) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`❌ ${email} — USUÁRIO NÃO ENCONTRADO`);
    continue;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log(`${ok ? "✅" : "❌"} ${email}`);
  console.log(`   → active: ${user.active}, role: ${user.role}, senha_ok: ${ok}`);
  console.log(`   → hash: ${user.passwordHash.substring(0, 30)}...`);
}

await prisma.$disconnect();
