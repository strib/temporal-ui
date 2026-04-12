# Temporal UI

SvelteKit + Svelte 5 frontend with a Go backend-for-frontend (UI Server) that proxies to Temporal gRPC.

## Cursor Cloud specific instructions

### Quick reference

| Action                       | Command                          |
| ---------------------------- | -------------------------------- |
| Install deps                 | `pnpm install`                   |
| Lint                         | `pnpm lint`                      |
| Type check                   | `pnpm check`                     |
| Unit tests                   | `pnpm test -- --run`             |
| Build frontend for UI server | `pnpm build:server`              |
| Build Go UI server           | `cd server && make build-server` |

### Running the dev environment

The `pnpm dev:ui-server` script has a port conflict: both the Temporal CLI (started by the vite-plugin-temporal-server) and the Go UI server try to bind port 8081. To work around this, start the three processes manually:

1. **Temporal CLI** (headless, no built-in UI):

   ```
   ./bin/cli/temporal server start-dev --port 7233 --http-port 7234 --headless
   ```

2. **Go UI Server** (from `server/` directory):

   ```
   cd server && ./ui-server --env development start
   ```

   This serves on port 8081 and proxies to the Temporal gRPC server on 7233.

3. **Vite dev server** (in `docker` mode to skip temporal/ui-server plugins):
   ```
   VITE_API=http://localhost:8081 VITE_TEMPORAL_UI_BUILD_TARGET=local npx vite dev --mode docker
   ```
   The SvelteKit app will be on http://localhost:3000.

### Go UI server build prerequisites

- Go 1.24+ must be installed (the `go.mod` specifies `go 1.24.11`).
- Before building the Go UI server, frontend assets must exist at `server/ui/assets/local/`. Run `pnpm build:server` first, then `cd server && make build-server`.
- The Go UI server binary is at `server/ui-server`.

### Environment variables

- `PATH` must include the Go binary directory (e.g. `/usr/local/go/bin`).
- `PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig/` is needed when building the `codefs` Go package.

### Testing notes

- Unit tests run via Vitest: `pnpm test -- --run` (1743 tests, ~40s).
- `svelte-check` reports 0 errors and ~82 warnings (all acceptable).
- E2E tests (`pnpm test:e2e`) require a full stack (Temporal server + UI server + codec server + workers) and are not typically run in cloud agent sessions.
