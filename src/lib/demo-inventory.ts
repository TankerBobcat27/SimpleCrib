export const DEMO_TENANT_ID = "ten_demo_midwest_precision";
export const DEMO_SLUG = "demo";

export const SAMPLE_TOOLS = [
  {
    toolNumber: "INS-CNMG-432",
    name: "CNMG 432 turning insert",
    type: "Insert",
    manufacturer: "Iscar",
    notes: "SAMPLE — check out 2 to a machine, then return 1 to Crib A",
    locations: [{ name: "Crib A", qty: 14 }],
  },
  {
    toolNumber: "EM-375-4FL",
    name: '3/8" 4-flute carbide end mill',
    type: "End mill",
    manufacturer: "Kennametal",
    notes: "SAMPLE",
    locations: [
      { name: "Crib A", qty: 12 },
      { name: "DMU75", qty: 2 },
    ],
  },
  {
    toolNumber: "EM-500-4FL",
    name: '1/2" 4-flute carbide end mill',
    type: "End mill",
    manufacturer: "Sandvik",
    notes: "SAMPLE",
    locations: [{ name: "Crib A", qty: 8 }],
  },
  {
    toolNumber: "COL-ER32-375",
    name: 'ER32 collet 3/8"',
    type: "Collet",
    manufacturer: "Techniks",
    notes: "SAMPLE",
    locations: [{ name: "Crib A", qty: 6 }],
  },
  {
    toolNumber: "TAP-10-32-SP",
    name: "10-32 spiral tap",
    type: "Tap",
    manufacturer: "OSG",
    notes: "SAMPLE",
    locations: [
      { name: "Crib B", qty: 4 },
      { name: "Crib A", qty: 2 },
    ],
  },
  {
    toolNumber: "DR-250-CAR",
    name: '1/4" carbide drill',
    type: "Drill",
    manufacturer: "Guhring",
    notes: "SAMPLE",
    locations: [{ name: "Crib A", qty: 10 }],
  },
  {
    toolNumber: "FM-200-5FLT",
    name: '2" 5-flute face mill',
    type: "Face mill",
    manufacturer: "Kennametal",
    notes: "SAMPLE",
    locations: [
      { name: "Crib A", qty: 2 },
      { name: "Haas VF-2", qty: 1 },
    ],
  },
  {
    toolNumber: "EF-MIT-375",
    name: "Mechanical edge finder",
    type: "Setup",
    manufacturer: "Mitutoyo",
    notes: "SAMPLE",
    locations: [{ name: "Crib A", qty: 3 }],
  },
  {
    toolNumber: "EM-312-3FL",
    name: '5/16" 3-flute carbide end mill',
    type: "End mill",
    manufacturer: "Harvey",
    notes: "SAMPLE",
    locations: [
      { name: "Crib B", qty: 5 },
      { name: "DMU75", qty: 2 },
    ],
  },
  {
    toolNumber: "TAP-1-4-20",
    name: "1/4-20 hand tap",
    type: "Tap",
    manufacturer: "Hertel",
    notes: "SAMPLE — already split across 5 locations (chip cap)",
    locations: [
      { name: "Crib A", qty: 4 },
      { name: "Haas VF-2", qty: 2 },
      { name: "Doosan Lynx", qty: 1 },
      { name: "Bench", qty: 1 },
      { name: "Incoming", qty: 1 },
    ],
  },
] as const;
