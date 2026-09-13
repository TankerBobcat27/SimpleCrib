import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "../src/lib/auth";
import { db, ensureSchema, client } from "../src/lib/db";
import { DEMO_SLUG, DEMO_TENANT_ID, SAMPLE_TOOLS } from "../src/lib/demo-inventory";
import { calHistory, gages, tenants, toolLocations, tools } from "../src/lib/db/schema";

const DEMO_USERS = [
  {
    name: "Ava Chen",
    email: "admin@demo.shopcal.test",
    password: "DemoAdmin!2026",
    role: "admin",
  },
  {
    name: "Marcus Hale",
    email: "quality@demo.shopcal.test",
    password: "DemoQuality!2026",
    role: "quality",
  },
  {
    name: "Riley Ortiz",
    email: "operator@demo.shopcal.test",
    password: "DemoOperator!2026",
    role: "operator",
  },
] as const;

const SAMPLE_GAGES = [
  {
    shopId: "SHOP-MIC-01",
    name: '0-1" Outside micrometer',
    type: "Micrometer",
    manufacturer: "Mitutoyo",
    serial: "MM-104882",
    location: "Quality Lab",
    lastCal: "2025-09-12",
    nextDue: "2026-09-12",
    status: "available",
    notes: "SAMPLE — demo shop only",
  },
  {
    shopId: "SHOP-MIC-02",
    name: '1-2" Outside micrometer',
    type: "Micrometer",
    manufacturer: "Starrett",
    serial: "ST-22911",
    location: "Haas VF-2",
    lastCal: "2025-10-01",
    nextDue: "2026-10-01",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-CAL-01",
    name: '6" digital caliper',
    type: "Caliper",
    manufacturer: "Mitutoyo",
    serial: "DC-55012",
    location: "Quality Lab",
    lastCal: "2026-03-15",
    nextDue: "2026-09-15",
    status: "available",
    notes: "Due this week — SAMPLE",
  },
  {
    shopId: "SHOP-CAL-02",
    name: '8" dial caliper',
    type: "Caliper",
    manufacturer: "Fowler",
    serial: "FW-88102",
    location: "Doosan Lynx",
    lastCal: "2025-09-20",
    nextDue: "2026-09-20",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-THD-01",
    name: "1/4-20 UNC-2B plug",
    type: "Thread gage",
    manufacturer: "Vermont Gage",
    serial: "VG-1420B",
    location: "Quality Lab",
    lastCal: "2025-08-31",
    nextDue: "2026-08-31",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-THD-02",
    name: "3/8-16 UNC-2B plug",
    type: "Thread gage",
    manufacturer: "GSG",
    serial: "GSG-3816",
    location: "Quality Lab",
    lastCal: "2025-01-31",
    nextDue: "2026-01-31",
    status: "out_of_service",
    notes: "Worn go member — SAMPLE",
  },
  {
    shopId: "SHOP-THD-03",
    name: "M10 x 1.5-6H ring",
    type: "Thread gage",
    manufacturer: "OSG",
    serial: "OSG-M10",
    location: "Receiving",
    lastCal: "2026-03-20",
    nextDue: "2026-09-17",
    status: "available",
    notes: "Due this week — SAMPLE",
  },
  {
    shopId: "SHOP-HTG-01",
    name: '12" height gage',
    type: "Height gage",
    manufacturer: "Mitutoyo",
    serial: "HG-12004",
    location: "Quality Lab",
    lastCal: "2025-06-01",
    nextDue: "2026-06-01",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-IND-01",
    name: "0.0005\" test indicator",
    type: "Indicator",
    manufacturer: "Interapid",
    serial: "IR-44190",
    location: "Haas VF-2",
    lastCal: "2026-08-20",
    nextDue: "2027-08-20",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-IND-02",
    name: "1\" travel dial indicator",
    type: "Indicator",
    manufacturer: "Starrett",
    serial: "ST-IND-77",
    location: "Doosan Lynx",
    lastCal: "2025-12-01",
    nextDue: "2026-12-01",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-BLK-01",
    name: "1-2-3 block set",
    type: "Equipment",
    manufacturer: "SPI",
    serial: "SPI-123-A",
    location: "Quality Lab",
    lastCal: "2024-11-15",
    nextDue: "2025-11-15",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-PIN-01",
    name: "Pin gage set .061–.250",
    type: "Equipment",
    manufacturer: "Meyer",
    serial: "MY-PIN-061",
    location: "Quality Lab",
    lastCal: "2026-09-01",
    nextDue: "2027-09-01",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-EQ-01",
    name: "Surface plate 18x24",
    type: "Equipment",
    manufacturer: "Standridge",
    serial: "SP-1824",
    location: "Quality Lab",
    lastCal: "2025-04-10",
    nextDue: "2026-04-10",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-EQ-02",
    name: "Torque wrench 30–150 in-lb",
    type: "Equipment",
    manufacturer: "Snap-on",
    serial: "SO-T30",
    location: "Shipping",
    lastCal: "2026-03-01",
    nextDue: "2026-09-16",
    status: "available",
    notes: "Due this week — SAMPLE",
  },
  {
    shopId: "SHOP-EQ-03",
    name: "Granite angle plate",
    type: "Equipment",
    manufacturer: "Challenge",
    serial: "CH-AP-09",
    location: "Receiving",
    lastCal: "2025-07-22",
    nextDue: "2026-07-22",
    status: "out_of_service",
    notes: "Chip on working face — SAMPLE",
  },
  {
    shopId: "SHOP-MIC-03",
    name: "Blade micrometer 0-1",
    type: "Micrometer",
    manufacturer: "Brown & Sharpe",
    serial: "BS-BLD-01",
    location: "Quality Lab",
    lastCal: "2026-09-10",
    nextDue: "2026-09-18",
    status: "available",
    notes: "Due this week — SAMPLE",
  },
  {
    shopId: "SHOP-THD-04",
    name: "1/2-13 UNC-2A set",
    type: "Thread gage",
    manufacturer: "PMC",
    serial: "PMC-1213",
    location: "Haas VF-2",
    lastCal: "2026-01-15",
    nextDue: "2027-01-15",
    status: "available",
    notes: "SAMPLE",
  },
  {
    shopId: "SHOP-CAL-03",
    name: '12" digital caliper',
    type: "Caliper",
    manufacturer: "iGaging",
    serial: "IG-12-991",
    location: "Shipping",
    lastCal: "2025-05-05",
    nextDue: "2026-05-05",
    status: "available",
    notes: "SAMPLE",
  },
] as const;

async function upsertUser(input: (typeof DEMO_USERS)[number]) {
  try {
    await auth.api.signUpEmail({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
        tenantId: DEMO_TENANT_ID,
        tenantSlug: DEMO_SLUG,
        role: input.role,
      },
    });
    console.log(`Created user ${input.email}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("exist") || message.toLowerCase().includes("already")) {
      console.log(`User ${input.email} already exists`);
      return;
    }
    console.log(`User ${input.email}: ${message}`);
  }
}

async function main() {
  await ensureSchema();

  const existingTenant = await db.select().from(tenants).where(eq(tenants.id, DEMO_TENANT_ID)).limit(1);
  if (!existingTenant[0]) {
    await db.insert(tenants).values({
      id: DEMO_TENANT_ID,
      slug: DEMO_SLUG,
      name: "Midwest Precision (Demo)",
    });
    console.log("Created demo tenant");
  } else {
    console.log("Demo tenant already present");
  }

  for (const demoUser of DEMO_USERS) {
    await upsertUser(demoUser);
  }

  const existingGages = await db.select().from(gages).where(eq(gages.tenantId, DEMO_TENANT_ID));
  if (existingGages.length === 0) {
    for (const [index, gage] of SAMPLE_GAGES.entries()) {
      const gageId = `gage_demo_${String(index + 1).padStart(2, "0")}`;
      await db.insert(gages).values({
        id: gageId,
        tenantId: DEMO_TENANT_ID,
        shopId: gage.shopId,
        name: gage.name,
        type: gage.type,
        manufacturer: gage.manufacturer,
        serial: gage.serial,
        location: gage.location,
        lastCal: gage.lastCal,
        nextDue: gage.nextDue,
        status: gage.status,
        notes: gage.notes,
      });
      if (gage.lastCal) {
        await db.insert(calHistory).values({
          id: `cal_demo_${String(index + 1).padStart(2, "0")}`,
          tenantId: DEMO_TENANT_ID,
          gageId,
          calibratedAt: gage.lastCal,
          nextDue: gage.nextDue,
          result: "pass",
          notes: "Seeded SAMPLE calibration event",
          performedBy: "Demo seed",
        });
      }
    }
    console.log(`Seeded ${SAMPLE_GAGES.length} SAMPLE gages`);
  } else {
    console.log(`Demo tenant already has ${existingGages.length} gages`);
  }

  const existingTools = await db.select().from(tools).where(eq(tools.tenantId, DEMO_TENANT_ID));
  if (existingTools.length === 0) {
    for (const [index, tool] of SAMPLE_TOOLS.entries()) {
      const toolId = `tool_demo_${String(index + 1).padStart(2, "0")}`;
      await db.insert(tools).values({
        id: toolId,
        tenantId: DEMO_TENANT_ID,
        toolNumber: tool.toolNumber,
        name: tool.name,
        type: tool.type,
        manufacturer: tool.manufacturer,
        notes: tool.notes,
      });
      for (const [locIndex, loc] of tool.locations.entries()) {
        await db.insert(toolLocations).values({
          id: `tloc_demo_${String(index + 1).padStart(2, "0")}_${locIndex + 1}`,
          tenantId: DEMO_TENANT_ID,
          toolId,
          location: loc.name,
          quantity: loc.qty,
        });
      }
    }
    console.log(`Seeded ${SAMPLE_TOOLS.length} SAMPLE tools`);
  } else {
    console.log(`Demo tenant already has ${existingTools.length} tools`);
  }

  console.log("Demo login: admin@demo.shopcal.test / DemoAdmin!2026");
  await client.end({ timeout: 5 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
