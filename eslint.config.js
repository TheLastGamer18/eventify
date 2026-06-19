import nextPlugin from "eslint-config-next";

export default [
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  },
  ...nextPlugin,
];
