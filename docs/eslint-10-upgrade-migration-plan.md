# ESLint 10 Upgrade and Migration Plan

## Scope

This repository migrates from the `neostandard` lint stack to an explicit ESLint 10 flat-config setup that mirrors the approach used in `lirantal/gh-cp#29`, adapted for `railil` and npm lockfiles.

## Planned and Applied Changes

1. Replace `neostandard` with direct ESLint 10-compatible dependencies:
   - `@eslint/js`
   - `typescript-eslint`
   - `eslint-plugin-n`
   - `eslint-plugin-security`
2. Update lint configuration to use `defineConfig()` and `globalIgnores()` in `eslint.config.js`.
3. Remove lockfile linting from the main lint pipeline:
   - Drop `lint:lockfile` script.
   - Remove `lockfile-lint` dependency.
4. Keep the existing CI flow (`npm ci`, `npm run lint`, `npm run build`, `npm run test`) and ensure it still passes with the new stack.
5. Refresh `package-lock.json` to capture the dependency migration.

## Migration Notes for Contributors

1. Run `npm ci` after pulling these changes.
2. Use `npm run lint` as the canonical lint command.
3. Do not expect `npm run lint:lockfile`; lockfile validation is no longer a dedicated lint stage.
4. Use `npm run lint:fix` for automatic lint fixes where supported.

## Validation Checklist

- `npm run lint`
- `npm run build`
- `npm run test`
