# Generating Orval for Financial APIs Only

This page shows how to generate Orval outputs just for the Financial APIs  
(Wallets, MetroCards, Insurance Cards, SCB) without touching the global OpenAPI generation or changing the global `orval.config.ts`.

## Why this helps

- Limits changes to the Financial frontend folder
- Avoids regenerating unrelated APIs and reduces noise
- Lets you validate Financial-related operations independently

## Package Scripts

We added ready-to-use scripts in `package.json` so you don’t need to curl + run Orval manually every time:

```json
"scripts": {
  ...
  "api:financial:generate": "curl -s http://localhost:3000/doc --output src/features/openapi.json && pnpm exec orval --config ./src/features/Financial/orval.financial.config.ts",
  "api:financial:types": "pnpm exec orval --config ./src/features/Financial/orval.financial.config.ts"
}
```

- **`api:financial:generate`**: Fetches the OpenAPI JSON and generates the Financial hooks/types.
- **`api:financial:types`**: Only regenerates types/hooks from the existing JSON (doesn’t fetch new OpenAPI JSON).

## How to run

Generate Financial API hooks + types:

```powershell
pnpm run api:financial:generate
```

Or just regenerate types/hooks from the existing JSON:

```powershell
pnpm run api:financial:types
```

The output is created under `src/api/generated/financial`. You can import them directly into your Financial pages or code.

## Notes & Tips

- Need extra tags? Add them to the `tags` array in your config.
- Missing path params in OpenAPI for financial routes will break generation — annotate the backend zod path params with `.openapi({})` (you can edit Financial backend files).
- Re-run this generator anytime you update Financial backend routes.
