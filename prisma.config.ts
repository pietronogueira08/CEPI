import path from "node:path";
import { defineConfig } from "prisma/config";

// Auto-detecta ambiente: Turso (prod) ou SQLite local (dev)
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const localUrl = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

const dbUrl = tursoUrl ?? localUrl;
const authToken = tursoToken;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import("@prisma/adapter-libsql");
      const config: { url: string; authToken?: string } = { url: dbUrl };
      if (authToken) config.authToken = authToken;
      return new PrismaLibSql(config);
    },
  },
});
