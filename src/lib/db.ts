import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "node:path";
import fs from "node:fs";

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Se Turso estiver configurado (produção com persistência real)
  if (tursoUrl) {
    const adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
    return new PrismaClient({ adapter, log: ["error"] });
  }

  // Ambiente demonstrativo Vercel (read-only file system)
  // Copiamos o banco populado para /tmp para permitir login e testes durante a sessão serverless
  if (process.env.VERCEL) {
    const srcDb = path.join(process.cwd(), "prisma", "dev.db");
    const destDb = path.join("/tmp", "dev.db");
    
    // Copia se ainda não existir no /tmp da instância serverless atual
    if (!fs.existsSync(destDb)) {
      try {
        fs.copyFileSync(srcDb, destDb);
        console.log("Banco sqlite copiado para /tmp com sucesso.");
      } catch (e) {
        console.error("Erro ao copiar banco para /tmp:", e);
      }
    }
    
    const adapter = new PrismaLibSql({ url: `file:${destDb}` });
    return new PrismaClient({ adapter, log: ["error"] });
  }

  // Desenvolvimento local padrão
  const localUrl = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
  const adapter = new PrismaLibSql({ url: localUrl });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
