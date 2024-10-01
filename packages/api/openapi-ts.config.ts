import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-fetch",
  input: "http://localhost:8000/api/v1/openapi.json",
  output: {
    path: "src/lib/api/client",
    format: "prettier",
    lint: "eslint",
  },
  types: {
    dates: "types+transform",
    enums: "javascript",
  },
  services: {
    asClass: false, // flat
  },
});
