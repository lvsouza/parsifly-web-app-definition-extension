import { defineConfig } from "drizzle-kit";

export default defineConfig({
  driver: 'pglite',
  dialect: "postgresql",
  out: './src/definition/migrations',
  schema: "./src/definition/schema/index.ts",
});
