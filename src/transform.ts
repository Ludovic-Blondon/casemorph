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
} from "./types.js";

// ---------------------------------------------------------------------------
// Word splitting — mirrors the type-level SplitWords<S>
// ---------------------------------------------------------------------------

/** Boundary between a lowercase letter (or digit) and an uppercase letter. */
const LOWER_TO_UPPER = /([a-z\d])([A-Z])/g;

/** Boundary between an acronym and the start of the next word. */
const ACRONYM_BOUNDARY = /([A-Z]+)([A-Z][a-z])/g;

/** Any explicit separator (underscore, hyphen, whitespace). */
const SEPARATORS = /[_\-\s]+/;

/**
 * Split any casing convention into lowercase word fragments.
 *
 * Handles snake_case, kebab-case, CONSTANT_CASE, camelCase, PascalCase,
 * and acronyms like `"XMLHttpRequest"` → `["xml", "http", "request"]`.
 */
function splitWords(str: string): string[] {
  if (!str) return [];
  return str
    .replace(LOWER_TO_UPPER, "$1\x00$2")
    .replace(ACRONYM_BOUNDARY, "$1\x00$2")
    .split(SEPARATORS)
    .join("\x00")
    .split("\x00")
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

// ---------------------------------------------------------------------------
// Join helpers — one per target format
// ---------------------------------------------------------------------------

function joinCamel(words: string[]): string {
  if (words.length === 0) return "";
  return (
    words[0] +
    words
      .slice(1)
      .reduce((acc, w) => acc + w.charAt(0).toUpperCase() + w.slice(1), "")
  );
}

function joinSnake(words: string[]): string {
  return words.join("_");
}

function joinKebab(words: string[]): string {
  return words.join("-");
}

function joinPascal(words: string[]): string {
  return words.reduce(
    (acc, w) => acc + w.charAt(0).toUpperCase() + w.slice(1),
    "",
  );
}

function joinConstant(words: string[]): string {
  return words.map((w) => w.toUpperCase()).join("_");
}

// ---------------------------------------------------------------------------
// Deep key transformation
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value) as unknown;
  return proto === Object.prototype || proto === null;
}

function deepTransformKeys(
  data: unknown,
  transform: (key: string) => string,
): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => deepTransformKeys(item, transform));
  }
  if (!isPlainObject(data)) return data;

  const out: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    out[transform(key)] = deepTransformKeys(data[key], transform);
  }
  return out;
}

// ---------------------------------------------------------------------------
// String-level transforms (public)
// ---------------------------------------------------------------------------

/**
 * Convert a string to camelCase.
 *
 * @example
 * camelCase('user_name')    // 'userName'
 * camelCase('XMLParser')    // 'xmlParser'
 * camelCase('content-type') // 'contentType'
 */
export function camelCase<S extends string>(str: S): CamelCase<S> {
  return joinCamel(splitWords(str)) as CamelCase<S>;
}

/**
 * Convert a string to snake_case.
 *
 * @example
 * snakeCase('userName')     // 'user_name'
 * snakeCase('XMLParser')    // 'xml_parser'
 * snakeCase('content-type') // 'content_type'
 */
export function snakeCase<S extends string>(str: S): SnakeCase<S> {
  return joinSnake(splitWords(str)) as SnakeCase<S>;
}

/**
 * Convert a string to kebab-case.
 *
 * @example
 * kebabCase('userName')   // 'user-name'
 * kebabCase('XMLParser')  // 'xml-parser'
 * kebabCase('user_name')  // 'user-name'
 */
export function kebabCase<S extends string>(str: S): KebabCase<S> {
  return joinKebab(splitWords(str)) as KebabCase<S>;
}

/**
 * Convert a string to PascalCase.
 *
 * @example
 * pascalCase('user_name')  // 'UserName'
 * pascalCase('XMLParser')  // 'XmlParser'
 * pascalCase('kebab-case') // 'KebabCase'
 */
export function pascalCase<S extends string>(str: S): PascalCase<S> {
  return joinPascal(splitWords(str)) as PascalCase<S>;
}

/**
 * Convert a string to CONSTANT_CASE.
 *
 * @example
 * constantCase('userName')   // 'USER_NAME'
 * constantCase('XMLParser')  // 'XML_PARSER'
 * constantCase('kebab-case') // 'KEBAB_CASE'
 */
export function constantCase<S extends string>(str: S): ConstantCase<S> {
  return joinConstant(splitWords(str)) as ConstantCase<S>;
}

// ---------------------------------------------------------------------------
// Object-level transforms (public)
// ---------------------------------------------------------------------------

/**
 * Deeply transform all keys of an object (or array of objects) to camelCase.
 * Primitives, Dates, RegExps, Maps, Sets, and other non-plain objects are preserved.
 *
 * @example
 * const result = toCamelCase({ user_name: 'Alice', billing_address: { zip_code: '75001' } })
 * result.userName               // 'Alice'
 * result.billingAddress.zipCode // '75001'
 */
export function toCamelCase<T>(data: T): CamelCaseKeys<T> {
  return deepTransformKeys(data, (k) =>
    joinCamel(splitWords(k)),
  ) as CamelCaseKeys<T>;
}

/**
 * Deeply transform all keys of an object (or array of objects) to snake_case.
 *
 * @example
 * const result = toSnakeCase({ userName: 'Alice', billingAddress: { zipCode: '75001' } })
 * result.user_name                  // 'Alice'
 * result.billing_address.zip_code   // '75001'
 */
export function toSnakeCase<T>(data: T): SnakeCaseKeys<T> {
  return deepTransformKeys(data, (k) =>
    joinSnake(splitWords(k)),
  ) as SnakeCaseKeys<T>;
}

/**
 * Deeply transform all keys of an object (or array of objects) to kebab-case.
 *
 * @example
 * const result = toKebabCase({ userName: 'Alice' })
 * result['user-name'] // 'Alice'
 */
export function toKebabCase<T>(data: T): KebabCaseKeys<T> {
  return deepTransformKeys(data, (k) =>
    joinKebab(splitWords(k)),
  ) as KebabCaseKeys<T>;
}

/**
 * Deeply transform all keys of an object (or array of objects) to PascalCase.
 *
 * @example
 * const result = toPascalCase({ user_name: 'Alice' })
 * result.UserName // 'Alice'
 */
export function toPascalCase<T>(data: T): PascalCaseKeys<T> {
  return deepTransformKeys(data, (k) =>
    joinPascal(splitWords(k)),
  ) as PascalCaseKeys<T>;
}

/**
 * Deeply transform all keys of an object (or array of objects) to CONSTANT_CASE.
 *
 * @example
 * const result = toConstantCase({ userName: 'Alice' })
 * result.USER_NAME // 'Alice'
 */
export function toConstantCase<T>(data: T): ConstantCaseKeys<T> {
  return deepTransformKeys(data, (k) =>
    joinConstant(splitWords(k)),
  ) as ConstantCaseKeys<T>;
}
