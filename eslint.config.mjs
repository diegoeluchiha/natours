import globals from 'globals';
import pluginJs from '@eslint/js';
//Importaciones de los plugins
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
// Import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */ //ignore public
export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } }, //para archivos js

  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  eslintPluginPrettier,
  {
    rules: {
      'no-console': 'warn', //no se puede usar console.log
      'no-undef': 'error', //no se puede usar una variable no declarada
      'no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
      'no-var': 'error',
      'prefer-const': 'error', //se debe usar const en lugar de let en variables que no cambian
    },
  },
];
