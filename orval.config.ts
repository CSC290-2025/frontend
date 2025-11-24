import { defineConfig } from 'orval';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

export default defineConfig({
  api: {
    input: {
      // if putting frontend & backend repos in the same root folder
      // otherwise, use './{name}.json' maybe and put it in gitignore
      // add your backend tags like below if needed
      target: '../openapi.json',
      filters: {
        mode: 'include',
        tags: [
          'Wallets',
          'MetroCards',
          'Insurance Cards',
          'SCB',
          'Transactions',
          'User',
          'Authentication',
        ],
      },
      // target: `${BACKEND_URL}/doc`,
    },
    output: {
      mode: 'tags',
      target: './src/api/generated',
      schemas: './src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      mock: false, // can be changed to true & use this guide [https://orval.dev/reference/configuration/output#mock]
      clean: true,
      prettier: true,
      baseUrl: env.VITE_API_BASE_URL,
      override: {
        mutator: {
          path: './src/api/client.ts',
          name: 'request',
        },
      },
    },
  },
});
