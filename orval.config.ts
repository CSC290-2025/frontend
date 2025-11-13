import { defineConfig } from 'orval';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export default defineConfig({
  api: {
    input: {
      // if putting frontend & backend repos in the same root folder
      // otherwise, use './{name}.json' maybe and put it in gitignore
      target: '../openapi.json',
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
      baseUrl: `${BACKEND_URL}`,
    },
  },
});
