import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: dbPath,
  },
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import("@prisma/adapter-libsql");
      const { createClient } = await import("@libsql/client");
      const client = createClient({ url: dbPath });
      return new PrismaLibSql(client);
    },
  },
});
