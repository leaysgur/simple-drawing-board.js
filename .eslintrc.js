module.exports = {
  env: {
    es6: true,
    browser: true
  },
  parserOptions: {
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "no-console": "off",
    "no-debugger": "off",
    "no-else-return": "error",
    "no-self-compare": "error",
    "no-void": "error",
    "no-var": "error",
    "no-lonely-if": "error",
    "prefer-const": "error"
  }
};
