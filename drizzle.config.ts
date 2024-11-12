import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  verbose: true,
  strict: true,
});
