import "dotenv/config";
import { ensureSchema, client } from "../src/lib/db";

async function main() {
  await ensureSchema();
  console.log("Schema ready.");
  await client.end({ timeout: 5 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
