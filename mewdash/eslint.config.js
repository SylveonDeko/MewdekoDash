import eslintPluginSvelte from "eslint-plugin-svelte";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  // Ignore build outputs and dependencies
  {
    ignores: [
      ".svelte-kit/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "dist/**",
      ".vercel/**",
      "package/**",
      "**/*.cjs",
    ],
  },
  // TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        extraFileExtensions: [".svelte"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  // Svelte files
  ...eslintPluginSvelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      // Disable the reactivity warnings - they're overly aggressive in Svelte 5
      "svelte/prefer-svelte-reactivity": "off",
      // Allow unused svelte-ignore comments
      "svelte/no-unused-svelte-ignore": "warn",
      // Warn instead of error for {@html}
      "svelte/no-at-html-tags": "warn",
      // Disable each-key requirement - not necessary for most cases
      "svelte/require-each-key": "off",
      // Disable navigation resolution requirement - app doesn't use base path
      "svelte/no-navigation-without-resolve": "off",
      // Allow duplicate style properties - intentional fallbacks/overrides
      "svelte/no-dupe-style-properties": "off",
      // Allow unknown style directives - for Tailwind-style properties
      "svelte/no-unknown-style-directive-property": "off",
      // Don't enforce derived over state+effect - let developers choose
      "svelte/prefer-writable-derived": "off",
    },
  },
  // Override for all remaining files (including .ts files that use $app/navigation)
  {
    rules: {
      "svelte/no-navigation-without-resolve": "off",
    },
  },
];
