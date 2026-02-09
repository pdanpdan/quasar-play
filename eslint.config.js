import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default tseslint.config(
  {
    ignores: [
      '.github/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      '**/*.html',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        __REPL_VERSION__: 'readonly',
        __PLAY_VERSION__: 'readonly',
        __QUASAR_VERSION__: 'readonly',
        __VUE_VERSION__: 'readonly',
        __TS_VERSION__: 'readonly',
      },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'no-useless-assignment': 'off',
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      'quote-props': ['error', 'as-needed'],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'keyword-spacing': 'error',
      'key-spacing': 'error',
      'space-in-parens': ['error', 'never'],
      '@typescript-eslint/no-explicit-any': [
        'error',
        { fixToUnknown: true, ignoreRestArgs: true },
      ],
      'arrow-parens': ['error', 'always'],
      'template-curly-spacing': ['error', 'always'],
    },
  },
  {
    files: ['*.html'],
    rules: {
      'vue/comment-directive': 'off',
    },
  },
);
