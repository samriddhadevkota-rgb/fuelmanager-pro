import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // R3F uses lowercase custom elements that look like unknown JSX
      "react/no-unknown-property": "off",
      // Allow unescaped quotes in JSX text content
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
