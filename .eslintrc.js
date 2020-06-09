module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    jasmine: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    "no-console": "off",
    "no-debugger": "off",
    "no-else-return": "error",
    "no-self-compare": "error",
    "no-void": "error",
    "no-var": "error",
    "no-lonely-if": "error",
    "prefer-const": "error",
  },
};
