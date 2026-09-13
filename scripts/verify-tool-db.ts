import "dotenv/config";
import { eq } from "drizzle-orm";
import { client, db, ensureSchema } from "../src/lib/db";
import { DEMO_TENANT_ID } from "../src/lib/demo-inventory";
import { tools } from "../src/lib/db/schema";
import { getTool, moveToolQuantity } from "../src/lib/tools";

async function main() {
  await ensureSchema();
  const rows = await db
    .select()
    .from(tools)
    .where(eq(tools.tenantId, DEMO_TENANT_ID));
  const target = rows.find((row) => row.toolNumber === "INS-CNMG-432");
  if (!target) {
    throw new Error("INS-CNMG-432 missing from demo tenant");
  }

  const before = await getTool(DEMO_TENANT_ID, target.id);
  if (!before) throw new Error("tool not found");
  console.log("before", before.locations);

  const checkout = await moveToolQuantity({
    tenantId: DEMO_TENANT_ID,
    toolId: target.id,
    from: "Crib A",
    to: "Haas VF-2",
    qty: 2,
    intent: "checkout",
    performedBy: "verify-script",
  });
  if (!checkout.ok) throw new Error(`checkout failed: ${checkout.error}`);
  const afterOut = await getTool(DEMO_TENANT_ID, target.id);
  console.log("after checkout", afterOut?.locations);

  const checkin = await moveToolQuantity({
    tenantId: DEMO_TENANT_ID,
    toolId: target.id,
    from: "Haas VF-2",
    to: "Crib A",
    qty: 1,
    intent: "checkin",
    performedBy: "verify-script",
  });
  if (!checkin.ok) throw new Error(`checkin failed: ${checkin.error}`);
  const afterIn = await getTool(DEMO_TENANT_ID, target.id);
  console.log("after return", afterIn?.locations);

  if (!afterOut?.locations.find((loc) => loc.name === "Crib A" && loc.qty === before.locations.find((l) => l.name === "Crib A")!.qty - 2)) {
    throw new Error("checkout did not reduce Crib A by 2");
  }
  if (!afterOut.locations.find((loc) => loc.name === "Haas VF-2" && loc.qty === 2)) {
    throw new Error("checkout did not create Haas VF-2 (2)");
  }
  if (!afterIn?.locations.find((loc) => loc.name === "Crib A" && loc.qty === before.locations.find((l) => l.name === "Crib A")!.qty - 1)) {
    throw new Error("return did not restore 1 to Crib A");
  }
  if (!afterIn.locations.find((loc) => loc.name === "Haas VF-2" && loc.qty === 1)) {
    throw new Error("return did not leave 1 at Haas VF-2");
  }

  const reset = await moveToolQuantity({
    tenantId: DEMO_TENANT_ID,
    toolId: target.id,
    from: "Haas VF-2",
    to: "Crib A",
    qty: 1,
    intent: "checkin",
    performedBy: "verify-script",
  });
  if (!reset.ok) throw new Error(`reset failed: ${reset.error}`);

  console.log("db checkout/return checks passed");
  await client.end({ timeout: 5 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
