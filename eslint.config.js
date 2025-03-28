import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import perfectionist from 'eslint-plugin-perfectionist'
import globals from 'globals'

export default [
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: ['dist/', '*.config.ts', 'tsconfig.json'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2021
      },
      parser: typescriptParser,
      parserOptions: { project: './tsconfig.json' }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      perfectionist,
      prettier: prettier
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
      'prettier/prettier': [
        'error',
        {
          semi: false,
          trailingComma: 'none'
        }
      ],
      semi: ['error', 'never'],
      'comma-dangle': ['error', 'never']
    }
  },
  eslintConfigPrettier
]
