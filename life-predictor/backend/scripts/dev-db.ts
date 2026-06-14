/**
 * Boots a throwaway embedded Postgres for local development/e2e verification
 * (Docker is unavailable on this machine). Applies prisma migrations, then
 * keeps running until killed. Data lives in .devdb and is safe to delete.
 *
 * Usage: npx tsx scripts/dev-db.ts
 * Then:  DATABASE_URL=postgresql://postgres:devpass@localhost:5433/lifescore_dev
 */
import EmbeddedPostgres from "embedded-postgres";
import { execSync } from "child_process";
import { rmSync, existsSync } from "fs";
import path from "path";

const PORT = 5433;
const DATA_DIR = path.join(__dirname, "..", ".devdb");
const DATABASE_URL = `postgresql://postgres:devpass@localhost:${PORT}/lifescore_dev`;

async function main() {
  // Throwaway database: wipe any stale data dir from a previous killed run.
  if (existsSync(DATA_DIR)) {
    rmSync(DATA_DIR, { recursive: true, force: true });
  }

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: "postgres",
    password: "devpass",
    port: PORT,
    persistent: false,
  });

  console.log("[dev-db] initializing embedded postgres...");
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("lifescore_dev");
  console.log(`[dev-db] running at ${DATABASE_URL}`);

  console.log("[dev-db] applying prisma migrations...");
  execSync("npx prisma migrate deploy", {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, DATABASE_URL },
    stdio: "inherit",
  });
  console.log("[dev-db] ready. Press Ctrl+C to stop.");

  const shutdown = async () => {
    console.log("[dev-db] stopping...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch(async (error) => {
  console.error("[dev-db] failed:", error);
  process.exit(1);
});
