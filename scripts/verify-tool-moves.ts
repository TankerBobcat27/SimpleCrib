import assert from "node:assert/strict";
import { applyLocationMove } from "../src/lib/tool-core";

const start = [{ name: "Crib A", qty: 14 }];
const checkedOut = applyLocationMove(start, "Crib A", "Haas VF-2", 2);
assert.equal(checkedOut.ok, true);
if (checkedOut.ok) {
  assert.deepEqual(checkedOut.locations, [
    { name: "Crib A", qty: 12 },
    { name: "Haas VF-2", qty: 2 },
  ]);
}

const returnedOne = applyLocationMove(
  checkedOut.ok ? checkedOut.locations : [],
  "Haas VF-2",
  "Crib A",
  1,
);
assert.equal(returnedOne.ok, true);
if (returnedOne.ok) {
  assert.deepEqual(returnedOne.locations, [
    { name: "Crib A", qty: 13 },
    { name: "Haas VF-2", qty: 1 },
  ]);
}

const tooMany = applyLocationMove(
  [
    { name: "Crib A", qty: 4 },
    { name: "Haas VF-2", qty: 2 },
    { name: "Doosan Lynx", qty: 1 },
    { name: "Bench", qty: 1 },
    { name: "Incoming", qty: 1 },
  ],
  "Crib A",
  "Tool cart",
  1,
);
assert.equal(tooMany.ok, false);
if (!tooMany.ok) assert.equal(tooMany.error, "locations");

const short = applyLocationMove([{ name: "Crib A", qty: 2 }], "Crib A", "Bench", 3);
assert.equal(short.ok, false);
if (!short.ok) assert.equal(short.error, "stock");

console.log("applyLocationMove checks passed");
