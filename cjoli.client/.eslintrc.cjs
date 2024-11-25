module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "max-lines": ["error"],
    "max-params": ["error"],
    "max-lines-per-function": ["error"],
    "max-depth": ["error"],
    "max-statements": ["error", 20, { ignoreTopLevelFunctions: true }],
    "max-lines-per-function": [
      "error",
      { max: 200, skipComments: true, skipBlankLines: true },
    ],
    "max-nested-callbacks": ["error"],
    complexity: ["error"],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
