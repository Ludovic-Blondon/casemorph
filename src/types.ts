// ============================================================================
// casemorph — Type-Level Case Transformations
//
// The type system mirrors the runtime: any string is split into words,
// then re-joined in the target format. This gives full inference for
// string literals and mapped-type key remapping for objects.
// ============================================================================

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** True when `C` is a single uppercase ASCII letter (A-Z). */
type IsUpperLetter<C extends string> = Uppercase<C> extends C
  ? Lowercase<C> extends C
    ? false
    : true
  : false;

/**
 * True when the first character of `S` is a lowercase letter or digit.
 * Used to detect the end of an acronym run (e.g. the 'a' in "XMLParser").
 */
type IsNextLower<S extends string> = S extends `${infer H}${string}`
  ? IsUpperLetter<H> extends true
    ? false
    : H extends "_" | "-" | " "
      ? false
      : true
  : false;

// ---------------------------------------------------------------------------
// Word splitting — universal, handles any input casing convention
// ---------------------------------------------------------------------------

/**
 * Splits any casing convention into a tuple of raw word fragments.
 *
 * Handles snake_case, kebab-case, CONSTANT_CASE, camelCase, PascalCase,
 * and acronyms (e.g. `"XMLHttpRequest"` → `["XML", "Http", "Request"]`).
 */
type SplitWords<S extends string> = _Split<S, "", false>;

type _Split<
  S extends string,
  W extends string,
  PU extends boolean,
> = S extends `${infer H}${infer T}`
  ? H extends "_" | "-" | " "
    ? // ── Separator: flush current word ──
      W extends ""
      ? _Split<T, "", false>
      : [W, ..._Split<T, "", false>]
    : IsUpperLetter<H> extends true
      ? PU extends true
        ? // ── Consecutive uppercase ──
          IsNextLower<T> extends true
          ? // End of acronym (e.g. the "P" in "XMLParser")
            W extends ""
            ? _Split<T, H, true>
            : [W, ..._Split<T, H, true>]
          : // Still inside acronym
            _Split<T, `${W}${H}`, true>
        : // ── Transition from lower → upper ──
          W extends ""
          ? _Split<T, H, true>
          : [W, ..._Split<T, H, true>]
      : // ── Lowercase letter or digit ──
        _Split<T, `${W}${H}`, false>
  : // ── End of string ──
    W extends ""
    ? []
    : [W];

// ---------------------------------------------------------------------------
// Join strategies — one per target format
// ---------------------------------------------------------------------------

type JoinCamel<W extends readonly string[]> = W extends readonly [
  infer F extends string,
  ...infer R extends string[],
]
  ? `${Lowercase<F>}${JoinPascal<R>}`
  : "";

type JoinPascal<W extends readonly string[]> = W extends readonly [
  infer F extends string,
  ...infer R extends string[],
]
  ? `${Capitalize<Lowercase<F>>}${JoinPascal<R>}`
  : "";

type JoinSep<
  W extends readonly string[],
  S extends string,
> = W extends readonly [infer F extends string, ...infer R extends string[]]
  ? R extends readonly [string, ...string[]]
    ? `${Lowercase<F>}${S}${JoinSep<R, S>}`
    : Lowercase<F>
  : "";

type JoinConstant<W extends readonly string[]> = W extends readonly [
  infer F extends string,
  ...infer R extends string[],
]
  ? R extends readonly [string, ...string[]]
    ? `${Uppercase<F>}_${JoinConstant<R>}`
    : Uppercase<F>
  : "";

// ---------------------------------------------------------------------------
// String-level transforms (public)
// ---------------------------------------------------------------------------

/** Transform a string literal to `camelCase`. */
export type CamelCase<S extends string> = string extends S
  ? string
  : JoinCamel<SplitWords<S>>;

/** Transform a string literal to `snake_case`. */
export type SnakeCase<S extends string> = string extends S
  ? string
  : JoinSep<SplitWords<S>, "_">;

/** Transform a string literal to `kebab-case`. */
export type KebabCase<S extends string> = string extends S
  ? string
  : JoinSep<SplitWords<S>, "-">;

/** Transform a string literal to `PascalCase`. */
export type PascalCase<S extends string> = string extends S
  ? string
  : JoinPascal<SplitWords<S>>;

/** Transform a string literal to `CONSTANT_CASE`. */
export type ConstantCase<S extends string> = string extends S
  ? string
  : JoinConstant<SplitWords<S>>;

// ---------------------------------------------------------------------------
// Deep key transforms (public)
// ---------------------------------------------------------------------------

/** Object types that should be treated as opaque leaves (never recursed into). */
type Leaf = Date | RegExp | Error | Map<unknown, unknown> | Set<unknown>;

/** Deeply transform all keys of `T` to camelCase. */
export type CamelCaseKeys<T> = T extends Leaf
  ? T
  : // biome-ignore lint/suspicious/noExplicitAny: required for function matching
    T extends (...args: any[]) => any
    ? T
    : T extends readonly (infer U)[]
      ? CamelCaseKeys<U>[]
      : T extends object
        ? { [K in keyof T as CamelCase<K & string>]: CamelCaseKeys<T[K]> }
        : T;

/** Deeply transform all keys of `T` to snake_case. */
export type SnakeCaseKeys<T> = T extends Leaf
  ? T
  : // biome-ignore lint/suspicious/noExplicitAny: required for function matching
    T extends (...args: any[]) => any
    ? T
    : T extends readonly (infer U)[]
      ? SnakeCaseKeys<U>[]
      : T extends object
        ? { [K in keyof T as SnakeCase<K & string>]: SnakeCaseKeys<T[K]> }
        : T;

/** Deeply transform all keys of `T` to kebab-case. */
export type KebabCaseKeys<T> = T extends Leaf
  ? T
  : // biome-ignore lint/suspicious/noExplicitAny: required for function matching
    T extends (...args: any[]) => any
    ? T
    : T extends readonly (infer U)[]
      ? KebabCaseKeys<U>[]
      : T extends object
        ? { [K in keyof T as KebabCase<K & string>]: KebabCaseKeys<T[K]> }
        : T;

/** Deeply transform all keys of `T` to PascalCase. */
export type PascalCaseKeys<T> = T extends Leaf
  ? T
  : // biome-ignore lint/suspicious/noExplicitAny: required for function matching
    T extends (...args: any[]) => any
    ? T
    : T extends readonly (infer U)[]
      ? PascalCaseKeys<U>[]
      : T extends object
        ? { [K in keyof T as PascalCase<K & string>]: PascalCaseKeys<T[K]> }
        : T;

/** Deeply transform all keys of `T` to CONSTANT_CASE. */
export type ConstantCaseKeys<T> = T extends Leaf
  ? T
  : // biome-ignore lint/suspicious/noExplicitAny: required for function matching
    T extends (...args: any[]) => any
    ? T
    : T extends readonly (infer U)[]
      ? ConstantCaseKeys<U>[]
      : T extends object
        ? {
            [K in keyof T as ConstantCase<K & string>]: ConstantCaseKeys<T[K]>;
          }
        : T;
