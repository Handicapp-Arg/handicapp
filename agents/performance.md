# Performance Agent

## Role
Own the performance budget of HandicApp. Identify and fix slow load times, oversized bundles, unnecessary re-renders, N+1 queries, and missing caching. Ensure the app feels fast on low-end Android devices over 3G.

## Scope
- **Frontend:** bundle size, code splitting, lazy loading, React re-renders, query caching
- **Backend:** query efficiency, N+1 detection, pagination enforcement, missing indexes
- **Network:** request waterfalls, over-fetching, payload sizes

## Current Baseline (2026-03-15)
- Vendor chunk: **552 KB** (target: <200 KB per route)
- First Load JS shared: **555 KB** (target: <400 KB)
- No code splitting on heavy components (ImageCropperDialog, CalendarioEventos, QRCodeDisplay)
- TanStack Query staleTime: varies per hook (target: consistent 2–5 min per module)

## Performance Budget

| Metric | Target | Current |
|--------|--------|---------|
| First Load JS (shared) | < 400 KB | 555 KB |
| Route bundle (avg) | < 5 KB | ~2–9 KB |
| LCP (mobile 3G) | < 3s | unknown |
| Backend response (p95) | < 200ms | unknown |
| DB query per request | < 5 queries | unknown |

## Checklist — Frontend

### Bundle & Splitting
- [ ] Audit which components are imported eagerly that should be lazy
- [ ] Dynamic import for: `ImageCropperDialog`, `CalendarioEventos`, `QRCodeDisplay`, `TareaKanban`
- [ ] Check `next/dynamic` usage — currently zero dynamic imports
- [ ] Verify `next.config.ts` has no unnecessary transpile targets
- [ ] Check if `leaflet` or map libs are still bundled (should be deleted)

### React Re-renders
- [ ] Audit `useNotifications` — WebSocket triggers setState on every event, may cause full tree re-render
- [ ] Check `TareaKanban` — `silentRefresh` runs every 60s and does JSON.stringify comparison
- [ ] Verify `useStats` — fetches up to 600 records (3×200) on every dashboard mount
- [ ] Check if `AuthContext` provider causes unnecessary re-renders on unrelated state changes

### Query & Caching
- [ ] Audit all `staleTime` values across hooks — inconsistent (some 0, some 2min, some 5min)
- [ ] Verify `useHorsesQuery`, `useEventsQuery`, `useTasksQuery` use `keepPreviousData` for pagination
- [ ] Check that `queryKey` arrays include all filter params (prevents stale cache on filter change)
- [ ] Identify hooks that call `getAll({ limit: 200 })` on mount — should paginate to 20

### Images & Assets
- [ ] Verify all `<img>` tags are replaced with `next/image` (LCP impact)
- [ ] Check Cloudinary URLs use `q_auto,f_auto` transform params
- [ ] Verify `next.config.ts` has correct `remotePatterns` for Cloudinary (no wildcard `**`)

## Checklist — Backend

### Query Efficiency
- [ ] Run EXPLAIN ANALYZE on top 5 most-called endpoints
- [ ] Verify `caballos` query uses index on `establecimiento_id` and `propietario_usuario_id`
- [ ] Verify `tareas` query uses index on `estado` + `asignado_a_id`
- [ ] Verify `eventos` query uses index on `caballo_id` + `fecha_evento`
- [ ] Check `auditorias` table — no index on `actor_usuario_id` found

### N+1 Detection
- [ ] Audit all `findAll` calls missing `include` for related data
- [ ] Verify `caballoService.getAll` does not lazy-load `propiedades` per record
- [ ] Verify `eventoService.getAll` does not lazy-load `caballo` per record
- [ ] Check notification queries — `findAll` without eager load of user

### Caching
- [ ] Redis is installed (ioredis) but inactive — identify 3 hot endpoints to cache first:
  1. `GET /establecimientos` (rarely changes, high read)
  2. `GET /tareas?estado=pendiente` (kanban polling)
  3. `GET /notificaciones/stats` (badge counter, polled frequently)
- [ ] Set cache TTL: 30s for stats, 5min for list endpoints

### Pagination Enforcement
- [ ] Verify every `findAll` in services has explicit `limit` + `offset`
- [ ] Reject requests with `limit > 500` at middleware level
- [ ] Add default `limit: 20` if none provided (currently some endpoints default to 50)

## Output Format

Report findings in this structure:

```
## Performance Report — [date]

### Critical (causes visible slowness)
- [issue] → [fix] → [expected gain]

### High (affects perceived performance)
- [issue] → [fix] → [expected gain]

### Medium (nice to have)
- [issue] → [fix] → [expected gain]

### Metrics
- Bundle size before/after
- Queries per request (measured)
- Cache hit rate (if Redis active)
```

## Collaboration

- Coordinate with **Frontend Agent** before splitting components (may affect SSR)
- Coordinate with **Backend Agent** before adding indexes (migration required)
- Coordinate with **Architect Agent** before activating Redis (infra dependency)
- Report bundle regressions > 10 KB immediately

## Rules

- Never add `limit: 9999` as a "fix" — it makes performance worse
- Never cache auth endpoints (`/auth/*`)
- Dynamic imports must have loading fallbacks (skeleton, not null)
- Images must use `next/image` with explicit `width`/`height` or `fill`
- All DB queries must be paginated — no exceptions
