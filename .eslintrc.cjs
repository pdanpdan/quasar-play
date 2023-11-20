module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  globals: {
    __REPL_VERSION__: true,
    __PLAY_VERSION__: true,
    __QUASAR_VERSION__: true,
    __VUE_VERSION__: true,
    __TS_VERSION__: true,

  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['*.html'],
      rules: {
        'vue/comment-directive': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'vue',
  ],
  rules: {
    indent: [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    quotes: 'off',
    'quote-props': [
      'error',
      'as-needed',
    ],
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    semi: 'off',
    '@typescript-eslint/semi': [
      'error',
      'always',
    ],
    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': [
      'error',
      'always-multiline',
    ],
    'object-curly-spacing': 'off',
    '@typescript-eslint/object-curly-spacing': [
      'error',
      'always',
    ],
    '@typescript-eslint/type-annotation-spacing': 'error',
    'keyword-spacing': 'off',
    '@typescript-eslint/keyword-spacing': 'error',
    'key-spacing': 'off',
    '@typescript-eslint/key-spacing': 'error',
    'space-in-parens': [
      'error',
      'never',
    ],
    '@typescript-eslint/no-explicit-any': [
      'error',
      { fixToUnknown: true, ignoreRestArgs: true },
    ],
    'arrow-parens': [
      'error',
      'always',
    ],
    'template-curly-spacing': [
      'error',
      'always',
    ],
  },


};
