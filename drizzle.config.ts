import { defineConfig } from "drizzle-kit";

export default defineConfig({
  driver: 'pglite',
  dialect: "postgresql",
  out: './src/definition-drizzle/migrations',
  schema: "./src/definition-drizzle/schema/index.ts",
});
