import baseConfig, { restrictEnvAccess } from "@epi/eslint-config/base";
import nextjsConfig from "@epi/eslint-config/nextjs";
import reactConfig from "@epi/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
