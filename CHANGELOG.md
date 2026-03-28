# Changelog

## 1.0.0 (2026-03-28)

### Features

- **String transforms**: `camelCase`, `snakeCase`, `kebabCase`, `pascalCase`, `constantCase`
- **Deep object transforms**: `toCamelCase`, `toSnakeCase`, `toKebabCase`, `toPascalCase`, `toConstantCase`
- **Full type inference**: string literal types transform at compile-time, deep object keys remap via mapped types
- **Acronym-aware**: `XMLParser` correctly splits to `xml` + `parser` (not `x` + `m` + `l` + `parser`)
- **Leaf preservation**: Date, RegExp, Map, Set, Error, and functions are never recursed into
- **Zero dependencies**
