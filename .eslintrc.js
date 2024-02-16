module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    "@typescript-eslint/strict-boolean-expressions": "off",
    "no-prototype-builtins": "off",
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "@typescript-eslint/brace-style": "off",
    "@typescript-eslint/no-explicit-any": "error",
    // TODO would like to add this one back
    "@typescript-eslint/restrict-template-expressions": "off",
    // no absolute imports
    "no-restricted-imports": ["error",{ "patterns": ["^/", "src/*"] }],
  }
}
