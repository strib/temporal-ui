# Agents

## Cursor Cloud specific instructions

### Overview

Temporal UI is a SvelteKit (Svelte 5) + TypeScript + TailwindCSS web application for managing Temporal workflows. It consists of:

- **Frontend**: SvelteKit app served by Vite on port 3000
- **Go UI Server**: gRPC-to-HTTP proxy (`server/ui-server` binary) on port 8081
- **Temporal Server**: The backend workflow engine (via Temporal CLI) on port 7233

### Toolchain

- **Node.js** >= 22.14.0 (see `.node-version`)
- **pnpm** >= 10.10.0
- **Go** 1.24.11 (see `.tool-versions`). If Go is outdated, install via `go install golang.org/dl/go1.24.11@latest && ~/go/bin/go1.24.11 download` then symlink to `/usr/local/bin/go`.

### Lint / Test / Check

See `CLAUDE.md` for the standard commands. Key commands:

- `pnpm lint` — runs prettier, eslint, stylelint (0 errors expected; warnings are normal)
- `pnpm check` — TypeScript / svelte-check (0 errors expected; warnings are normal)
- `pnpm test -- --run` — Vitest unit tests

### Running the Dev Server

The `pnpm dev` (alias for `pnpm dev:ui-server`) mode has a known port conflict in Cloud Agent VMs: the Temporal CLI's `--ui-port` flag binds the same port (8081) that the Go UI server needs. To work around this, start the three services manually:

1. **Temporal Server (headless)**:

   ```
   /workspace/bin/cli/temporal server start-dev --port=7233 --headless --log-level=error --http-port=7234 \
     --dynamic-config-value frontend.enableUpdateWorkflowExecution=true \
     --dynamic-config-value frontend.enableUpdateWorkflowExecutionAsyncAccepted=true \
     --dynamic-config-value frontend.workerVersioningDataAPIs=true \
     --dynamic-config-value frontend.workerVersioningWorkflowAPIs=true \
     --dynamic-config-value worker.buildIdScavengerEnabled=true
   ```

2. **Go UI Server** (requires building server assets first):

   ```
   pnpm build:server          # builds SvelteKit assets into server/ui/assets/local/
   cd server && make build    # builds Go binary (needs PATH with Go 1.24+)
   ./ui-server --env development start
   ```

3. **Vite Dev Server**:
   ```
   VITE_TEMPORAL_UI_BUILD_TARGET=local VITE_API=http://localhost:8081 \
     VITE_TEMPORAL_PORT=7233 VITE_MODE=development npx vite dev --mode development
   ```

The frontend will be available at `http://localhost:3000/`.

### Building the Go UI Server

The Go server embeds UI assets via `//go:embed all:assets` in `server/ui/embed.go`. You **must** run `pnpm build:server` before `make build` in the `server/` directory, otherwise the Go build fails with "pattern all:assets: no matching files found".

### Important Environment Notes

- `PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig/` should be set when compiling the `backend/packages/codefs` package (per user rules).
- The Temporal CLI is auto-downloaded to `./bin/cli/temporal` during `pnpm install`.
- SSR is disabled (`export const ssr = false` in root layout), so all rendering is client-side.
- The Go UI server provides CORS headers for `http://localhost:3000`, which is required for the Vite dev server to communicate with the API.
