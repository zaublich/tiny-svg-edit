module.exports = {
  plugins: ['vue', '@typescript-eslint','mocha'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    env: { es6: true },
    sourceType: 'module'
  },
  root: true,
  env: {
    browser: true,
    node: true,
    mocha:true
  },
  extends: ['plugin:vue/base', 'plugin:@typescript-eslint/recommended', 'plugin:vue/essential', 'standard'],
  rules: {
    // default eslint rules
    'no-unused-vars': 0,
    'one-var': 0,
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': 0,
    'no-console': 0,
    semi: [2, 'always'],
    'no-extra-semi': 2,
    'space-before-function-paren': 0,
    eqeqeq: 0,
    'spaced-comment': 0,
    'no-useless-escape': 0,
    'no-tabs': 0,
    'no-mixed-spaces-and-tabs': 0,
    'new-cap': 0,
    camelcase: 0,
    'no-new': 0,
    indent: 'off',
    semi: 'off',
    "no-use-before-define": "off",
    // typescript-eslint rules
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules
    '@typescript-eslint/no-explicit-any': "off",
    '@typescript-eslint/explicit-module-boundary-types': "off",
    '@typescript-eslint/explicit-function-return-type': 0
  }
};