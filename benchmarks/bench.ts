import { Bench } from "tinybench";
import {
  camelCase,
  snakeCase,
  toCamelCase,
  toSnakeCase,
} from "../src/index.js";

const bench = new Bench({ time: 2000 });

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const flatSnake = {
  user_id: 1,
  first_name: "Alice",
  last_name: "Smith",
  email_address: "alice@example.com",
  created_at: "2024-01-01",
  updated_at: "2024-06-15",
  is_active: true,
  role_name: "admin",
};

const deepSnake = {
  user_id: 1,
  first_name: "Alice",
  billing_address: {
    street_name: "123 Main St",
    zip_code: "75001",
    country_code: "FR",
    geo_location: { lat_value: 48.856614, lng_value: 2.352222 },
  },
  recent_orders: Array.from({ length: 10 }, (_, i) => ({
    order_id: i,
    total_amount: Math.random() * 100,
    line_items: [
      { product_name: `Item ${i}`, unit_price: 9.99, quantity_ordered: i + 1 },
    ],
  })),
};

const flatCamel = {
  userId: 1,
  firstName: "Alice",
  lastName: "Smith",
  emailAddress: "alice@example.com",
  createdAt: "2024-01-01",
  updatedAt: "2024-06-15",
  isActive: true,
  roleName: "admin",
};

// ---------------------------------------------------------------------------
// String benchmarks
// ---------------------------------------------------------------------------

bench
  .add("camelCase (string) — simple", () => {
    camelCase("user_name");
  })
  .add("camelCase (string) — multi-word", () => {
    camelCase("billing_address_zip_code");
  })
  .add("camelCase (string) — acronym", () => {
    camelCase("XMLHttpRequest");
  })
  .add("snakeCase (string) — simple", () => {
    snakeCase("userName");
  });

// ---------------------------------------------------------------------------
// Object benchmarks
// ---------------------------------------------------------------------------

bench
  .add("toCamelCase — flat (8 keys)", () => {
    toCamelCase(flatSnake);
  })
  .add("toCamelCase — deep (nested + arrays)", () => {
    toCamelCase(deepSnake);
  })
  .add("toSnakeCase — flat (8 keys)", () => {
    toSnakeCase(flatCamel);
  });

// ---------------------------------------------------------------------------
// Naive manual comparison
// ---------------------------------------------------------------------------

function naiveSnakeToCamel(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c: string) =>
      c.toUpperCase(),
    );
    const val = obj[key];
    result[camelKey] =
      typeof val === "object" && val !== null && !Array.isArray(val)
        ? naiveSnakeToCamel(val as Record<string, unknown>)
        : val;
  }
  return result;
}

bench.add("naive regex replace — flat (8 keys)", () => {
  naiveSnakeToCamel(flatSnake);
});

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

await bench.run();

console.log("\n## Benchmark Results\n");
console.log("| Test | ops/sec | Margin |");
console.log("|------|---------|--------|");
for (const task of bench.tasks) {
  if (task.result) {
    const opsPerSec = Math.round(task.result.hz).toLocaleString();
    const margin = `\u00b1${task.result.rme.toFixed(2)}%`;
    console.log(`| ${task.name} | ${opsPerSec} | ${margin} |`);
  }
}
