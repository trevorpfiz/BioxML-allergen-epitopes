import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-fetch",
  input: `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/v1/openapi.json`,
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
  plugins: ["@tanstack/react-query"],
});
