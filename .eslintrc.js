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
    "@typescript-eslint/brace-style": "off",
    // TODO would like to add this one back
    "@typescript-eslint/restrict-template-expressions": "off",
  }
}
