import { defineConfig } from 'orval';

// Generate only Financial APIs (Wallets, MetroCards, Insurance Cards, SCB)
// This config should live inside the Financial feature so you don't need to
// modify the global orval config. Run `orval --config src/features/Financial/orval.financial.config.ts`
// from the frontend root to generate only financial APIs.

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export default defineConfig({
  financial: {
    input: {
      target: '../openapi.json',
      filters: {
        mode: 'include',
        tags: ['Wallets', 'MetroCards', 'Insurance Cards', 'SCB'],
      },
    },
    output: {
      // Use tags mode so each tag comes out as its own file
      mode: 'tags',
      target: './src/api/generated/financial',
      schemas: './src/api/generated/financial/model',
      client: 'react-query',
      httpClient: 'axios',
      mock: false,
      clean: true,
      prettier: true,
      baseUrl: BACKEND_URL,
    },
  },
});
