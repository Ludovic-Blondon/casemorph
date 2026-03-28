import { describe, expect, it } from "vitest";
import {
  camelCase,
  kebabCase,
  snakeCase,
  toCamelCase,
  toSnakeCase,
} from "../src/index.js";

// =============================================================================
// String edge cases
// =============================================================================

describe("string edge cases", () => {
  it("handles single character", () => {
    expect(camelCase("a")).toBe("a");
    expect(camelCase("A")).toBe("a");
    expect(snakeCase("A")).toBe("a");
  });

  it("handles consecutive separators", () => {
    expect(camelCase("user__name")).toBe("userName");
    expect(camelCase("user---name")).toBe("userName");
    expect(camelCase("user  name")).toBe("userName");
  });

  it("handles leading separators", () => {
    expect(camelCase("_user_name")).toBe("userName");
    expect(camelCase("__private")).toBe("private");
    expect(camelCase("-kebab")).toBe("kebab");
  });

  it("handles trailing separators", () => {
    expect(camelCase("user_name_")).toBe("userName");
    expect(camelCase("trailing--")).toBe("trailing");
  });

  it("handles mixed separators", () => {
    expect(camelCase("user_name-id")).toBe("userNameId");
    expect(snakeCase("user-name_id")).toBe("user_name_id");
  });

  it("handles strings with digits", () => {
    expect(camelCase("oauth2_token")).toBe("oauth2Token");
    expect(snakeCase("oauth2Token")).toBe("oauth2_token");
    expect(camelCase("h2o")).toBe("h2o");
    expect(snakeCase("h2o")).toBe("h2o");
    expect(camelCase("base64_encoded")).toBe("base64Encoded");
  });

  it("handles all-uppercase single words", () => {
    expect(camelCase("ID")).toBe("id");
    expect(snakeCase("ID")).toBe("id");
    expect(camelCase("URL")).toBe("url");
  });

  it("handles mixed case with numbers in CONSTANT_CASE", () => {
    expect(camelCase("MAX_RETRY_3")).toBe("maxRetry3");
    expect(snakeCase("maxRetry3")).toBe("max_retry3");
  });

  it("handles spaces as separators", () => {
    expect(camelCase("user name")).toBe("userName");
    expect(snakeCase("user name")).toBe("user_name");
    expect(kebabCase("user name")).toBe("user-name");
  });
});

// =============================================================================
// Object edge cases
// =============================================================================

describe("object edge cases", () => {
  it("handles nested arrays of arrays", () => {
    const input = {
      matrix_data: [
        [{ cell_value: 1 }, { cell_value: 2 }],
        [{ cell_value: 3 }, { cell_value: 4 }],
      ],
    };
    const expected = {
      matrixData: [
        [{ cellValue: 1 }, { cellValue: 2 }],
        [{ cellValue: 3 }, { cellValue: 4 }],
      ],
    };
    expect(toCamelCase(input)).toEqual(expected);
  });

  it("handles mixed arrays (objects and primitives)", () => {
    const input = { tag_list: ["hello", 42, { tag_name: "ts" }, null] };
    const expected = { tagList: ["hello", 42, { tagName: "ts" }, null] };
    expect(toCamelCase(input)).toEqual(expected);
  });

  it("handles objects with Date values (not keys)", () => {
    const date = new Date("2024-06-15");
    const input = { created_at: date, updated_at: null };
    const result = toCamelCase(input);
    expect(result).toEqual({ createdAt: date, updatedAt: null });
    expect(result.createdAt).toBe(date);
  });

  it("handles deeply nested objects (5+ levels)", () => {
    const input = {
      level_one: {
        level_two: {
          level_three: {
            level_four: {
              level_five: { deep_value: true },
            },
          },
        },
      },
    };
    const result = toCamelCase(input);
    expect(
      result.levelOne.levelTwo.levelThree.levelFour.levelFive.deepValue,
    ).toBe(true);
  });

  it("handles object created with Object.create(null)", () => {
    const input = Object.create(null) as Record<string, unknown>;
    input.user_name = "Alice";
    const result = toCamelCase(input);
    expect(result).toEqual({ userName: "Alice" });
  });

  it("preserves Error instances", () => {
    const err = new Error("test");
    const input = { last_error: err };
    const result = toCamelCase(input);
    expect(result.lastError).toBe(err);
  });

  it("handles boolean and numeric keys gracefully", () => {
    const input = { "0": "zero", "1": "one", true_value: true };
    const result = toCamelCase(input);
    expect(result).toEqual({ "0": "zero", "1": "one", trueValue: true });
  });

  it("does not modify the original object", () => {
    const input = { user_name: "Alice", address: { zip_code: "75001" } };
    const original = JSON.parse(JSON.stringify(input));
    toCamelCase(input);
    expect(input).toEqual(original);
  });

  it("handles large flat objects", () => {
    const input: Record<string, number> = {};
    for (let i = 0; i < 100; i++) {
      input[`key_${i}`] = i;
    }
    const result = toCamelCase(input) as Record<string, number>;
    expect(Object.keys(result)).toHaveLength(100);
    expect(result.key0).toBe(0);
    expect(result.key99).toBe(99);
  });

  it("round-trips complex structures", () => {
    const input = {
      user_id: 1,
      first_name: "Alice",
      recent_orders: [
        {
          order_id: 42,
          line_items: [{ product_name: "Widget", unit_price: 9.99 }],
        },
      ],
      meta_data: null,
    };
    const roundTripped = toSnakeCase(toCamelCase(input));
    expect(roundTripped).toEqual(input);
  });
});
