# Agents

## Cursor Cloud specific instructions

### System requirements

- **Node.js** >= 22.14.0 (pre-installed via nvm)
- **pnpm** >= 10.10.0 (activated via `corepack enable pnpm`)
- **Go** >= 1.24.11 (must be at `/usr/local/go/bin/go`; add to PATH: `export PATH="/usr/local/go/bin:$PATH"`)

### Key commands

See `CLAUDE.md` for lint/check/test commands. Key scripts from `package.json`:

- `pnpm lint` — prettier + eslint + stylelint (warnings only, 0 errors expected)
- `pnpm check` — svelte-check / TypeScript type checking
- `pnpm test -- --run` — unit tests via Vitest
- `pnpm test:e2e` — Playwright E2E tests (requires `pnpm exec playwright install` first)
- `pnpm test:integration` — Playwright integration tests (mock-based)

### Running the development server

**Recommended approach for Cloud Agents** — use `pnpm dev:local-temporal`:

1. Start the Temporal CLI in headless mode (no built-in UI) in the background:
   ```
   PATH="/usr/local/go/bin:$PATH" ./bin/cli/temporal server start-dev --port 7233 --headless --log-level error --http-port 7234 &
   ```
2. Build UI assets for the Go server (required once, or after UI changes):
   ```
   pnpm build:server
   ```
3. Start the Vite dev server + Go UI server:
   ```
   PATH="/usr/local/go/bin:$PATH" pnpm dev:local-temporal
   ```
   This starts the SvelteKit frontend at `http://localhost:3000` and the Go UI server on port 8081.

**Why not `pnpm dev` / `pnpm dev:ui-server`?** — These modes start the Temporal CLI with `--ui-port=8081` via the Vite plugin, which conflicts with the Go UI server also binding to port 8081. Use `dev:local-temporal` to avoid this port conflict.

**Alternative** — `pnpm dev:temporal-cli` works for the Vite dev server but uses the Temporal CLI's built-in UI at port 8080. The SvelteKit app at port 3000 has CORS issues calling port 8080 from the browser. Best for SSR-only testing, not full browser interaction.

### Go UI server build

The Go UI server (`server/`) requires UI assets to be present at `server/ui/assets/` before it can build. Run `pnpm build:server` to generate these assets. Without them, `make build` in `server/` will fail with `pattern all:assets: no matching files found`.

When compiling Go in the `server/` directory, ensure `PATH="/usr/local/go/bin:$PATH"` is set so Go 1.24.11 is used instead of the system Go 1.22.

### Gotchas

- The `pnpm install` `prepare` script downloads the Temporal CLI to `./bin/cli/temporal` automatically.
- Git submodules (`git submodule update --init`) must be initialized for the Temporal API protos.
- The `pnpm.onlyBuiltDependencies` allowlist in `package.json` controls which native dependencies can run build scripts. A warning about `unrs-resolver` being ignored is expected and harmless.
