import { expectTypeOf } from "expect-type";
import { describe, it } from "vitest";
import {
  camelCase,
  snakeCase,
  toCamelCase,
  toSnakeCase,
} from "../src/index.js";
import type {
  CamelCase,
  CamelCaseKeys,
  ConstantCase,
  ConstantCaseKeys,
  KebabCase,
  KebabCaseKeys,
  PascalCase,
  PascalCaseKeys,
  SnakeCase,
  SnakeCaseKeys,
} from "../src/types.js";

// =============================================================================
// String-level type transforms
// =============================================================================

describe("CamelCase", () => {
  it("transforms snake_case literals", () => {
    expectTypeOf<CamelCase<"user_name">>().toEqualTypeOf<"userName">();
    expectTypeOf<
      CamelCase<"billing_address_id">
    >().toEqualTypeOf<"billingAddressId">();
  });

  it("transforms kebab-case literals", () => {
    expectTypeOf<CamelCase<"content-type">>().toEqualTypeOf<"contentType">();
    expectTypeOf<CamelCase<"x-request-id">>().toEqualTypeOf<"xRequestId">();
  });

  it("transforms PascalCase literals", () => {
    expectTypeOf<CamelCase<"UserName">>().toEqualTypeOf<"userName">();
  });

  it("transforms CONSTANT_CASE literals", () => {
    expectTypeOf<CamelCase<"USER_NAME">>().toEqualTypeOf<"userName">();
  });

  it("handles acronyms", () => {
    expectTypeOf<CamelCase<"XMLParser">>().toEqualTypeOf<"xmlParser">();
    expectTypeOf<CamelCase<"HTMLElement">>().toEqualTypeOf<"htmlElement">();
  });

  it("passes through plain string type", () => {
    expectTypeOf<CamelCase<string>>().toEqualTypeOf<string>();
  });

  it("handles empty string", () => {
    expectTypeOf<CamelCase<"">>().toEqualTypeOf<"">();
  });
});

describe("SnakeCase", () => {
  it("transforms camelCase literals", () => {
    expectTypeOf<SnakeCase<"userName">>().toEqualTypeOf<"user_name">();
    expectTypeOf<
      SnakeCase<"billingAddressId">
    >().toEqualTypeOf<"billing_address_id">();
  });

  it("handles acronyms", () => {
    expectTypeOf<SnakeCase<"XMLParser">>().toEqualTypeOf<"xml_parser">();
    expectTypeOf<
      SnakeCase<"getHTTPResponse">
    >().toEqualTypeOf<"get_http_response">();
  });
});

describe("KebabCase", () => {
  it("transforms camelCase literals", () => {
    expectTypeOf<KebabCase<"userName">>().toEqualTypeOf<"user-name">();
  });

  it("transforms snake_case literals", () => {
    expectTypeOf<KebabCase<"user_name">>().toEqualTypeOf<"user-name">();
  });
});

describe("PascalCase", () => {
  it("transforms snake_case literals", () => {
    expectTypeOf<PascalCase<"user_name">>().toEqualTypeOf<"UserName">();
  });

  it("transforms camelCase literals", () => {
    expectTypeOf<PascalCase<"userName">>().toEqualTypeOf<"UserName">();
  });
});

describe("ConstantCase", () => {
  it("transforms camelCase literals", () => {
    expectTypeOf<ConstantCase<"userName">>().toEqualTypeOf<"USER_NAME">();
  });

  it("handles acronyms", () => {
    expectTypeOf<ConstantCase<"XMLParser">>().toEqualTypeOf<"XML_PARSER">();
  });
});

// =============================================================================
// Deep key type transforms
// =============================================================================

describe("CamelCaseKeys", () => {
  it("transforms flat object keys", () => {
    type Input = { user_name: string; user_age: number };
    type Expected = { userName: string; userAge: number };
    expectTypeOf<CamelCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });

  it("transforms deeply nested objects", () => {
    type Input = {
      user_id: number;
      billing_address: {
        street_name: string;
        zip_code: string;
      };
    };
    type Expected = {
      userId: number;
      billingAddress: {
        streetName: string;
        zipCode: string;
      };
    };
    expectTypeOf<CamelCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });

  it("transforms arrays of objects", () => {
    type Input = { recent_orders: { order_id: number }[] };
    type Expected = { recentOrders: { orderId: number }[] };
    expectTypeOf<CamelCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });

  it("preserves primitive types", () => {
    expectTypeOf<CamelCaseKeys<string>>().toEqualTypeOf<string>();
    expectTypeOf<CamelCaseKeys<number>>().toEqualTypeOf<number>();
    expectTypeOf<CamelCaseKeys<boolean>>().toEqualTypeOf<boolean>();
    expectTypeOf<CamelCaseKeys<null>>().toEqualTypeOf<null>();
    expectTypeOf<CamelCaseKeys<undefined>>().toEqualTypeOf<undefined>();
  });

  it("preserves Date as a leaf", () => {
    type Input = { created_at: Date };
    type Expected = { createdAt: Date };
    expectTypeOf<CamelCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });

  it("preserves Map and Set as leaves", () => {
    type Input = { data_map: Map<string, number>; data_set: Set<string> };
    type Expected = { dataMap: Map<string, number>; dataSet: Set<string> };
    expectTypeOf<CamelCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });

  it("preserves optional properties", () => {
    type Input = { user_name: string; user_age?: number };
    type Expected = { userName: string; userAge?: number };
    expectTypeOf<CamelCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });

  it("preserves readonly properties", () => {
    type Input = { readonly user_name: string };
    type Expected = { readonly userName: string };
    expectTypeOf<CamelCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });
});

describe("SnakeCaseKeys", () => {
  it("transforms flat object keys", () => {
    type Input = { userName: string; userAge: number };
    type Expected = { user_name: string; user_age: number };
    expectTypeOf<SnakeCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });

  it("transforms deeply nested objects", () => {
    type Input = {
      userId: number;
      billingAddress: { streetName: string };
    };
    type Expected = {
      user_id: number;
      billing_address: { street_name: string };
    };
    expectTypeOf<SnakeCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });
});

describe("KebabCaseKeys", () => {
  it("transforms object keys", () => {
    type Input = { userName: string };
    type Expected = { "user-name": string };
    expectTypeOf<KebabCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });
});

describe("PascalCaseKeys", () => {
  it("transforms object keys", () => {
    type Input = { user_name: string };
    type Expected = { UserName: string };
    expectTypeOf<PascalCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });
});

describe("ConstantCaseKeys", () => {
  it("transforms object keys", () => {
    type Input = { userName: string };
    type Expected = { USER_NAME: string };
    expectTypeOf<ConstantCaseKeys<Input>>().toEqualTypeOf<Expected>();
  });
});

// =============================================================================
// Runtime function return types
// =============================================================================

describe("runtime function types", () => {
  it("camelCase returns literal type", () => {
    const result = camelCase("user_name");
    expectTypeOf(result).toEqualTypeOf<"userName">();
  });

  it("snakeCase returns literal type", () => {
    const result = snakeCase("userName");
    expectTypeOf(result).toEqualTypeOf<"user_name">();
  });

  it("toCamelCase returns transformed object type", () => {
    const input = {
      user_name: "Alice",
      billing_address: { zip_code: "75001" },
    };
    const result = toCamelCase(input);
    expectTypeOf(result.userName).toEqualTypeOf<string>();
    expectTypeOf(result.billingAddress.zipCode).toEqualTypeOf<string>();
  });

  it("toSnakeCase returns transformed object type", () => {
    const input = { userName: "Alice", billingAddress: { zipCode: "75001" } };
    const result = toSnakeCase(input);
    expectTypeOf(result.user_name).toEqualTypeOf<string>();
    expectTypeOf(result.billing_address.zip_code).toEqualTypeOf<string>();
  });
});
