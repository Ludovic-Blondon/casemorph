# casemorph

**Your API speaks `snake_case`. Your code speaks `camelCase`. casemorph transforms the keys — and the types follow.**

[![npm version](https://img.shields.io/npm/v/casemorph)](https://www.npmjs.com/package/casemorph)
[![bundle size](https://img.shields.io/bundlephobia/minzip/casemorph)](https://bundlephobia.com/package/casemorph)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![CI](https://img.shields.io/github/actions/workflow/status/Ludovic-Blondon/casemorph/ci.yml)](https://github.com/Ludovic-Blondon/casemorph/actions)
[![license](https://img.shields.io/npm/l/casemorph)](./LICENSE)

## The Problem

Every REST API integration involves the same ritual: receive `snake_case` keys, manually map them to `camelCase`, lose all type safety in the process — or litter your code with `as` assertions.

```ts
// You do this. Every time. And it's wrong.
const user = response.data as User; // 🤞 Hope the API matches your types
```

## The Solution

```ts
import { toCamelCase } from "casemorph";

const user = toCamelCase(apiResponse);

user.firstName;                  // ✅ Autocomplete works — type is string
user.billingAddress.streetName;  // ✅ Deep transformation
user.first_name;                 // ❌ Property 'first_name' does not exist
```

One function call. Keys transform at runtime. Types transform at compile-time. No assertions. No manual mappings. The types follow the data.

## Install

```bash
npm install casemorph
pnpm add casemorph
bun add casemorph
```

## Quick Start

```ts
import { toCamelCase, toSnakeCase } from "casemorph";

// API response → your code
const apiResponse = {
  user_id: 1,
  first_name: "Alice",
  billing_address: { street_name: "123 Main St", zip_code: "75001" },
  recent_orders: [{ order_id: 42, total_amount: 99.99 }],
};

const user = toCamelCase(apiResponse);
user.firstName;                      // "Alice"
user.billingAddress.zipCode;         // "75001"
user.recentOrders[0].totalAmount;    // 99.99

// Your code → API request
const payload = toSnakeCase({ userId: 1, firstName: "Bob" });
payload.user_id;     // 1
payload.first_name;  // "Bob"
```

## API Reference

### Object Transforms

Deeply transform all keys of an object (or array of objects). Primitives, `Date`, `RegExp`, `Map`, `Set`, and `Error` instances are preserved as-is.

| Function | Target | Example key |
|---|---|---|
| `toCamelCase(data)` | camelCase | `userName` |
| `toSnakeCase(data)` | snake_case | `user_name` |
| `toKebabCase(data)` | kebab-case | `user-name` |
| `toPascalCase(data)` | PascalCase | `UserName` |
| `toConstantCase(data)` | CONSTANT_CASE | `USER_NAME` |

```ts
// Handles nested objects, arrays of objects, and mixed content
toCamelCase({
  recent_orders: [{ order_id: 1, line_items: [{ product_name: "Widget" }] }],
});
// { recentOrders: [{ orderId: 1, lineItems: [{ productName: "Widget" }] }] }
```

### String Transforms

Transform a single string between naming conventions. When called with a string literal, the return type is the **transformed literal type**.

| Function | Example |
|---|---|
| `camelCase(str)` | `camelCase("user_name")` → `"userName"` (type: `"userName"`) |
| `snakeCase(str)` | `snakeCase("userName")` → `"user_name"` (type: `"user_name"`) |
| `kebabCase(str)` | `kebabCase("userName")` → `"user-name"` (type: `"user-name"`) |
| `pascalCase(str)` | `pascalCase("user_name")` → `"UserName"` (type: `"UserName"`) |
| `constantCase(str)` | `constantCase("userName")` → `"USER_NAME"` (type: `"USER_NAME"`) |

### Types

All type-level transforms are exported for advanced use in your own types:

```ts
import type { CamelCase, CamelCaseKeys, SnakeCase, SnakeCaseKeys } from "casemorph";

// String-level
type A = CamelCase<"user_name">;           // "userName"
type B = SnakeCase<"XMLHttpRequest">;      // "xml_http_request"

// Object-level
type ApiResponse = { user_id: number; first_name: string };
type AppModel = CamelCaseKeys<ApiResponse>; // { userId: number; firstName: string }
```

**Available types**: `CamelCase`, `SnakeCase`, `KebabCase`, `PascalCase`, `ConstantCase`, `CamelCaseKeys`, `SnakeCaseKeys`, `KebabCaseKeys`, `PascalCaseKeys`, `ConstantCaseKeys`.

## Acronym Handling

casemorph correctly splits acronyms — both at runtime and at the type level:

```ts
camelCase("XMLParser");       // "xmlParser"    (not "xmlparser" or "xMLParser")
camelCase("HTMLElement");     // "htmlElement"
camelCase("getHTTPResponse"); // "getHttpResponse"
snakeCase("XMLHttpRequest");  // "xml_http_request"
```

The algorithm detects boundaries between consecutive uppercase letters and the start of a new word, matching the behavior developers expect.

## What Gets Transformed

| Input | Transformed? |
|---|---|
| Plain objects (`{}`) | Yes — keys are renamed, values recursed |
| Arrays | Yes — each element is recursed |
| Nested objects | Yes — to arbitrary depth |
| `Date`, `RegExp`, `Error` | No — returned as-is |
| `Map`, `Set` | No — returned as-is |
| Functions | No — returned as-is |
| Primitives (`string`, `number`, `null`, ...) | No — returned as-is |

## Benchmarks

Measured on Apple M4, Node.js 24.x, averaged over 2s runs:

| Operation | ops/sec |
|---|---|
| `camelCase(string)` — simple | ~3,200,000 |
| `camelCase(string)` — acronym | ~2,400,000 |
| `toCamelCase(obj)` — flat (8 keys) | ~340,000 |
| `toCamelCase(obj)` — deep (nested + 10-item array) | ~37,000 |
| `toSnakeCase(obj)` — flat (8 keys) | ~326,000 |
| naive `key.replace(/_([a-z])/g, ...)` — flat (8 keys) | ~760,000 |

The naive approach is faster for simple snake→camel on flat objects because it skips format detection and acronym handling. casemorph handles **all** formats bidirectionally, detects acronyms, recurses arbitrarily deep, and provides full type inference — for roughly 2x the cost of a hand-rolled regex.

## Compatibility

- Node.js >= 20
- Bun
- Deno
- Cloudflare Workers
- Any edge runtime (zero dependencies, pure ESM + CJS)

## Bundle Size

**387 bytes** minified + brotli. Zero dependencies.

## Contributing

```bash
git clone https://github.com/Ludovic-Blondon/casemorph.git
cd casemorph
npm install
npm test          # run tests
npm run bench     # run benchmarks
npm run typecheck # verify types
npm run check     # lint + format
```

## License

[MIT](./LICENSE)
