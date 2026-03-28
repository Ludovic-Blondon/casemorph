import { describe, expect, it } from "vitest";
import {
  camelCase,
  constantCase,
  kebabCase,
  pascalCase,
  snakeCase,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
} from "../src/index.js";

// =============================================================================
// String-level transforms
// =============================================================================

describe("camelCase", () => {
  it("converts snake_case", () => {
    expect(camelCase("user_name")).toBe("userName");
    expect(camelCase("billing_address_id")).toBe("billingAddressId");
  });

  it("converts kebab-case", () => {
    expect(camelCase("content-type")).toBe("contentType");
    expect(camelCase("x-request-id")).toBe("xRequestId");
  });

  it("converts PascalCase", () => {
    expect(camelCase("UserName")).toBe("userName");
    expect(camelCase("BillingAddress")).toBe("billingAddress");
  });

  it("converts CONSTANT_CASE", () => {
    expect(camelCase("USER_NAME")).toBe("userName");
    expect(camelCase("MAX_RETRY_COUNT")).toBe("maxRetryCount");
  });

  it("handles acronyms", () => {
    expect(camelCase("XMLParser")).toBe("xmlParser");
    expect(camelCase("HTMLElement")).toBe("htmlElement");
    expect(camelCase("XMLHttpRequest")).toBe("xmlHttpRequest");
    expect(camelCase("getHTTPResponse")).toBe("getHttpResponse");
    expect(camelCase("parseJSON")).toBe("parseJson");
  });

  it("is idempotent on camelCase input", () => {
    expect(camelCase("userName")).toBe("userName");
    expect(camelCase("billingAddressId")).toBe("billingAddressId");
  });

  it("handles single word", () => {
    expect(camelCase("user")).toBe("user");
    expect(camelCase("USER")).toBe("user");
    expect(camelCase("User")).toBe("user");
  });

  it("handles empty string", () => {
    expect(camelCase("")).toBe("");
  });
});

describe("snakeCase", () => {
  it("converts camelCase", () => {
    expect(snakeCase("userName")).toBe("user_name");
    expect(snakeCase("billingAddressId")).toBe("billing_address_id");
  });

  it("converts kebab-case", () => {
    expect(snakeCase("content-type")).toBe("content_type");
  });

  it("converts PascalCase", () => {
    expect(snakeCase("UserName")).toBe("user_name");
  });

  it("converts CONSTANT_CASE", () => {
    expect(snakeCase("USER_NAME")).toBe("user_name");
  });

  it("handles acronyms", () => {
    expect(snakeCase("XMLParser")).toBe("xml_parser");
    expect(snakeCase("HTMLElement")).toBe("html_element");
    expect(snakeCase("getHTTPResponse")).toBe("get_http_response");
  });

  it("is idempotent on snake_case input", () => {
    expect(snakeCase("user_name")).toBe("user_name");
  });
});

describe("kebabCase", () => {
  it("converts camelCase", () => {
    expect(kebabCase("userName")).toBe("user-name");
  });

  it("converts snake_case", () => {
    expect(kebabCase("user_name")).toBe("user-name");
  });

  it("handles acronyms", () => {
    expect(kebabCase("XMLParser")).toBe("xml-parser");
  });

  it("is idempotent on kebab-case input", () => {
    expect(kebabCase("user-name")).toBe("user-name");
  });
});

describe("pascalCase", () => {
  it("converts snake_case", () => {
    expect(pascalCase("user_name")).toBe("UserName");
  });

  it("converts camelCase", () => {
    expect(pascalCase("userName")).toBe("UserName");
  });

  it("handles acronyms", () => {
    expect(pascalCase("xml_parser")).toBe("XmlParser");
  });

  it("is idempotent on PascalCase input", () => {
    expect(pascalCase("UserName")).toBe("UserName");
  });
});

describe("constantCase", () => {
  it("converts camelCase", () => {
    expect(constantCase("userName")).toBe("USER_NAME");
  });

  it("converts snake_case", () => {
    expect(constantCase("user_name")).toBe("USER_NAME");
  });

  it("handles acronyms", () => {
    expect(constantCase("XMLParser")).toBe("XML_PARSER");
  });

  it("is idempotent on CONSTANT_CASE input", () => {
    expect(constantCase("USER_NAME")).toBe("USER_NAME");
  });
});

// =============================================================================
// Deep object transforms
// =============================================================================

describe("toCamelCase", () => {
  it("transforms flat object keys", () => {
    expect(toCamelCase({ user_name: "Alice", user_age: 30 })).toEqual({
      userName: "Alice",
      userAge: 30,
    });
  });

  it("transforms deeply nested objects", () => {
    const input = {
      user_id: 1,
      billing_address: {
        street_name: "123 Main St",
        zip_code: "75001",
        geo_location: {
          lat_value: 48.8,
          lng_value: 2.3,
        },
      },
    };
    const expected = {
      userId: 1,
      billingAddress: {
        streetName: "123 Main St",
        zipCode: "75001",
        geoLocation: {
          latValue: 48.8,
          lngValue: 2.3,
        },
      },
    };
    expect(toCamelCase(input)).toEqual(expected);
  });

  it("transforms objects inside arrays", () => {
    const input = {
      recent_orders: [
        { order_id: 1, total_amount: 99.99 },
        { order_id: 2, total_amount: 149.0 },
      ],
    };
    const expected = {
      recentOrders: [
        { orderId: 1, totalAmount: 99.99 },
        { orderId: 2, totalAmount: 149.0 },
      ],
    };
    expect(toCamelCase(input)).toEqual(expected);
  });

  it("handles top-level arrays", () => {
    const input = [{ user_name: "Alice" }, { user_name: "Bob" }];
    const expected = [{ userName: "Alice" }, { userName: "Bob" }];
    expect(toCamelCase(input)).toEqual(expected);
  });

  it("preserves Date objects", () => {
    const date = new Date("2024-01-01");
    const input = { created_at: date };
    const result = toCamelCase(input);
    expect(result).toEqual({ createdAt: date });
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("preserves RegExp objects", () => {
    const re = /test/gi;
    const input = { pattern_match: re };
    const result = toCamelCase(input);
    expect(result.patternMatch).toBeInstanceOf(RegExp);
    expect(result.patternMatch).toBe(re);
  });

  it("preserves Map and Set", () => {
    const map = new Map([["key", "val"]]);
    const set = new Set([1, 2, 3]);
    const input = { data_map: map, data_set: set };
    const result = toCamelCase(input);
    expect(result.dataMap).toBe(map);
    expect(result.dataSet).toBe(set);
  });

  it("preserves primitive values", () => {
    expect(toCamelCase(null)).toBe(null);
    expect(toCamelCase(undefined)).toBe(undefined);
    expect(toCamelCase(42)).toBe(42);
    expect(toCamelCase("hello")).toBe("hello");
    expect(toCamelCase(true)).toBe(true);
  });

  it("handles empty objects", () => {
    expect(toCamelCase({})).toEqual({});
  });

  it("handles empty arrays", () => {
    expect(toCamelCase([])).toEqual([]);
  });
});

describe("toSnakeCase", () => {
  it("transforms flat object keys", () => {
    expect(toSnakeCase({ userName: "Alice", userAge: 30 })).toEqual({
      user_name: "Alice",
      user_age: 30,
    });
  });

  it("transforms deeply nested objects", () => {
    const input = {
      userId: 1,
      billingAddress: {
        streetName: "123 Main St",
        zipCode: "75001",
      },
    };
    const expected = {
      user_id: 1,
      billing_address: {
        street_name: "123 Main St",
        zip_code: "75001",
      },
    };
    expect(toSnakeCase(input)).toEqual(expected);
  });

  it("handles acronyms in keys", () => {
    expect(toSnakeCase({ xmlHttpRequest: true })).toEqual({
      xml_http_request: true,
    });
  });
});

describe("toKebabCase", () => {
  it("transforms object keys", () => {
    expect(toKebabCase({ userName: "Alice" })).toEqual({
      "user-name": "Alice",
    });
  });
});

describe("toPascalCase", () => {
  it("transforms object keys", () => {
    expect(toPascalCase({ user_name: "Alice" })).toEqual({
      UserName: "Alice",
    });
  });
});

describe("toConstantCase", () => {
  it("transforms object keys", () => {
    expect(toConstantCase({ userName: "Alice" })).toEqual({
      USER_NAME: "Alice",
    });
  });
});

// =============================================================================
// Round-trip consistency
// =============================================================================

describe("round-trip", () => {
  it("snake → camel → snake preserves keys", () => {
    const input = {
      user_name: "Alice",
      billing_address: { zip_code: "75001" },
    };
    expect(toSnakeCase(toCamelCase(input))).toEqual(input);
  });

  it("camel → snake → camel preserves keys", () => {
    const input = {
      userName: "Alice",
      billingAddress: { zipCode: "75001" },
    };
    expect(toCamelCase(toSnakeCase(input))).toEqual(input);
  });

  it("kebab → camel → kebab preserves keys", () => {
    const input = { "user-name": "Alice" };
    expect(toKebabCase(toCamelCase(input))).toEqual(input);
  });
});
