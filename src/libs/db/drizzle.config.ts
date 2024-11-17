import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/libs/db/schema.ts",
  out: "./src/libs/db/migrations",
  verbose: true,
  strict: true,
});
