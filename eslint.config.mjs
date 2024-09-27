import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintConfigJest from 'eslint-plugin-jest'
import typescriptEslint from 'typescript-eslint'

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  ...typescriptEslint.configs.strict,
  ...typescriptEslint.configs.stylistic,
  {
    files: ['apps/backend/**/*.ts'],
    rules: {
      // NestJS often has empty classes
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    ...eslintConfigJest.configs['flat/recommended'],
  },
  {
    ignores: ['**/dist/', '**/tsconfig.json'],
  },
]
