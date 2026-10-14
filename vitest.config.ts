import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";
// Loads .env.local so tests use the same Supabase settings as the app.
Object.assign(process.env, { ...loadEnv("test", process.cwd(), ""), ...process.env });
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { exclude: ["node_modules", ".next", ...(process.env.RUN_INTEGRATION ? [] : ["tests/integration/**"])] },
});
