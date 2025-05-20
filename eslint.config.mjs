// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';
import unusedImports from 'eslint-plugin-unused-imports';
import reactHooks from 'eslint-plugin-react-hooks';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'plugin:@typescript-eslint/recommended',
      // 'plugin:storybook/recommended',
    ],
  }),
];

export default tseslint.config(
  eslint.configs.recommended,
  eslintConfig,
  tseslint.configs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
      'react-hooks': reactHooks,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-array-constructor': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-useless-catch': 'warn',
      'no-constant-binary-expression': 'warn',
      'prefer-const': 'warn',
      'no-case-declarations': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'no-empty': 'warn',
      'no-empty-pattern': 'warn',
      'no-useless-escape': 'warn',
      'no-prototype-builtins': 'warn',
      'no-constant-condition': 'warn',
      'no-async-promise-executor': 'warn',
      'no-var': 'warn',
      'no-dupe-else-if': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  {
    ignores: [
      '**/dist/*',
      '**/tests/*',
      'tests/**/*',
      'tsconfig.json',
      '**.config.js',
      '**.config.ts',
      'coverage/*',
      '.storybook/*',
      '.next/*',
    ],
  }
);
