# Scripts retirados

Los scripts que automatizaban el flujo con Docker (`start-app`, `stop-app`, `test-windows-scripts`) fueron eliminados. A partir de ahora se recomienda levantar cada servicio manualmente:

1. Inicia PostgreSQL y Redis.
2. Backend: `cd back-handicapp && pnpm install && pnpm run dev`.
3. Frontend: `cd front-handicapp && pnpm install && pnpm dev`.

Si necesitas automatizar el inicio en tu entorno local puedes crear scripts nuevos basados en estas instrucciones o utilizar herramientas como `npm-run-all` o `concurrently` dentro de un monorepo.