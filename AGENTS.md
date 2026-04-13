# Agents

See `CLAUDE.md` for code conventions, Svelte 5 patterns, and lint/check/test commands.

## Cursor Cloud specific instructions

### Services overview

| Service                   | Purpose                                    | Default Port                |
| ------------------------- | ------------------------------------------ | --------------------------- |
| Temporal CLI dev server   | Core workflow engine (gRPC + HTTP API)     | 7233 (gRPC), 8233 (HTTP/UI) |
| Go UI Server (`server/`)  | gRPC-to-HTTP proxy with CORS, auth, config | 8081                        |
| Vite/SvelteKit dev server | Frontend application with HMR              | 3000                        |

### Starting the development environment

**`pnpm dev:ui-server`** has a port conflict: the vite plugin starts the Temporal CLI with `--ui-port` matching the Go UI server port (both 8081), causing the Go server to fail. To work around this, start the three services manually:

1. **Temporal CLI** (headless, so it doesn't bind the UI port):

   ```bash
   ./bin/cli/temporal server start-dev --port=7233 --ui-port=8233 --http-port=7234 --log-level=error --headless \
     --dynamic-config-value frontend.enableUpdateWorkflowExecution=true \
     --dynamic-config-value frontend.enableUpdateWorkflowExecutionAsyncAccepted=true \
     --dynamic-config-value frontend.workerVersioningDataAPIs=true \
     --dynamic-config-value frontend.workerVersioningWorkflowAPIs=true \
     --dynamic-config-value worker.buildIdScavengerEnabled=true
   ```

2. **Go UI Server** (from `server/` directory, requires `PATH` to include Go 1.24+):

   ```bash
   cd server && ./ui-server --env development start
   ```

   If the binary doesn't exist, build it first: `cd server && make build`

3. **Vite dev server** (with env vars pointing to the Go UI server):
   ```bash
   export VITE_TEMPORAL_PORT=7233 VITE_API=http://localhost:8081 VITE_MODE=development VITE_TEMPORAL_UI_BUILD_TARGET=local
   npx vite dev
   ```

The SvelteKit app is then available at http://localhost:3000.

### Building the Go UI server

The Go UI server embeds static assets. Before `make build` succeeds, you need UI assets:

```bash
pnpm build:server   # builds to server/ui/assets/local
cd server && make build
```

Go 1.24.11 is required. Set `PATH=/usr/local/go/bin:$PATH` if the system Go is older.

### Key commands

| Task                  | Command                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Lint (all)            | `pnpm lint`                                                                               |
| Type check            | `pnpm check`                                                                              |
| Unit tests            | `TZ=UTC pnpm test -- --run`                                                               |
| E2E tests             | `pnpm test:e2e`                                                                           |
| Integration tests     | `pnpm test:integration`                                                                   |
| Start a test workflow | `./bin/cli/temporal workflow start --task-queue <queue> --type <type> --workflow-id <id>` |
