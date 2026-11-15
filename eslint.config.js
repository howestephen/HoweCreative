import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig(
  { ignores: ["dist", "node_modules"] },
  {
    files: ["**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"],
    extends: [js.configs.recommended, tseslint.configs.strictTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      // The kit sets noInlineConfig: true. One existing directive
      // (api/contact.test.ts, no-explicit-any) needs it off until that test
      // is retyped; reportUnusedDisableDirectives stays on.
      noInlineConfig: false,
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "no-restricted-syntax": ["error", {
        selector: "FunctionExpression",
        message: "Use an arrow function; document and review genuine this/generator exceptions in config.",
      }],
      "prefer-const": "error",
      "no-var": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: false }],
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-ignore": true,
        "ts-nocheck": true,
        "ts-check": false,
        "ts-expect-error": "allow-with-description",
        minimumDescriptionLength: 10,
      }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // Project relaxations: kit rules the existing code does not yet meet,
    // measured 15 November 2026 with `npx eslint src api` on this branch
    // (violations in brackets). Each is a recorded deferral, not a house
    // decision: retire one by fixing its violations and deleting its line.
    files: ["**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"],
    rules: {
      "func-style": "off", // 43
      "@typescript-eslint/no-confusing-void-expression": "off", // 40
      "@typescript-eslint/explicit-module-boundary-types": "off", // 34
      "@typescript-eslint/no-non-null-assertion": "off", // 31
      "@typescript-eslint/no-unnecessary-condition": "off", // 25
      "no-restricted-syntax": "off", // 21 (function expressions)
      "@typescript-eslint/restrict-template-expressions": "off", // 20
      "@typescript-eslint/require-await": "off", // 17
      "@typescript-eslint/no-unsafe-member-access": "off", // 11
      "@typescript-eslint/unbound-method": "off", // 10
      "@typescript-eslint/no-unsafe-assignment": "off", // 8
      "@typescript-eslint/no-base-to-string": "off", // 6
      "@typescript-eslint/no-unnecessary-type-assertion": "off", // 5
      "@typescript-eslint/no-floating-promises": "off", // 5
      "prefer-arrow-callback": "off", // 2
      "@typescript-eslint/no-unsafe-enum-comparison": "off", // 1
      "@typescript-eslint/no-misused-spread": "off", // 1
      "@typescript-eslint/no-deprecated": "off", // 1
      "@typescript-eslint/no-unsafe-argument": "off", // 1
      "@typescript-eslint/no-misused-promises": "off", // 1
      "@typescript-eslint/consistent-type-imports": "off", // 1
      "@typescript-eslint/no-extraneous-class": "off", // 1
      "@typescript-eslint/no-unsafe-return": "off", // 1
    },
  },
  {
    // One test deliberately builds a function from the shader source to run
    // its arithmetic as JavaScript (1 violation of each rule).
    files: ["src/app/experience/PortraitScene.test.tsx"],
    rules: {
      "no-new-func": "off",
      "@typescript-eslint/no-implied-eval": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    // JS uses JSDoc and checkJs, not TS parameter/return annotation syntax.
    rules: { "@typescript-eslint/explicit-module-boundary-types": "off" },
  },
);
