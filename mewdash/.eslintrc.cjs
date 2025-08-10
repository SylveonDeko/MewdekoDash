module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    project: "./tsconfig.json",
    extraFileExtensions: [".svelte"]
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser"
      },
      rules: {
        // Svelte-specific rules
        "svelte/no-at-debug-tags": "warn",
        "svelte/no-reactive-functions": "error",
        "svelte/no-reactive-literals": "error",
        "svelte/prefer-destructuring-props": "warn",
        "svelte/require-store-reactive-access": "error",
        "svelte/valid-compile": ["error", { ignoreWarnings: false }],

        // Accessibility rules
        "svelte/a11y-accesskey": "error",
        "svelte/a11y-aria-attributes": "error",
        "svelte/a11y-click-events-have-key-events": "warn",
        "svelte/a11y-interactive-supports-focus": "error",
        "svelte/a11y-label-has-associated-control": "error",
        "svelte/a11y-media-has-caption": "warn",
        "svelte/a11y-missing-attribute": "error",
        "svelte/a11y-no-abstract-role": "error",
        "svelte/a11y-no-redundant-roles": "error",
        "svelte/a11y-role-has-required-aria-props": "error",
        "svelte/a11y-structure": "error",

        // TypeScript rules for Svelte files
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/no-unsafe-return": "warn"
      }
    }
  ],
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

    // General code quality rules
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-template": "error",

    // Import rules
    "import/no-duplicates": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "never"
    }]
  },
  settings: {
    "svelte4/typescript": true
  }
};