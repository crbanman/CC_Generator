import prettier from "eslint-config-prettier";

const config = [
  prettier,
  {
    languageOptions: {
      globals: {
        browser: true,
        es2021: true,
        node: true,
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-unused-labels": "warn",
      "no-unreachable": "warn",
      "no-console": "off",
      eqeqeq: "error",
      curly: "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-iterator": "error",
      "no-labels": "error",
      "no-lone-blocks": "error",
      "no-loop-func": "error",
      "no-multi-str": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-octal-escape": "error",
      "no-proto": "error",
      "no-return-assign": "error",
      "no-script-url": "error",
      "no-self-compare": "error",
      "no-sequences": "error",
      "no-throw-literal": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-void": "error",
      "no-with": "error",
      radix: "error",
      "wrap-iife": ["error", "any"],
      yoda: "error",
    },
    ignores: ["node_modules", "coverage", "gen-docs", "pnpm-lock.yaml", ".git"],
  },
];

export default config;
