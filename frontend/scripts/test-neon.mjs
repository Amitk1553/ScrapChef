import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  if (!process.env[key]) {
    process.env[key] = value.replace(/^"/, "").replace(/"$/, "");
  }
}

import { neon } from "@neondatabase/serverless";
const db = neon(process.env.DATABASE_URL);

async function test() {
    try {
        console.log("Using db.query...");
        const res = await db.query("SELECT 1 AS num", []);
        console.log("Query result:", res);
    } catch(e) {
        console.error("Error:", e.message);
    }
}
test();
