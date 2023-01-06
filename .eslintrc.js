module.exports = {
  extends: [
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
  plugins: ['react-hooks', 'simple-import-sort'],
  ignorePatterns: ['dist/', '.next', 'node_modules/'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    'simple-import-sort/sort': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/prop-types': [0],
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': ['error'],
    'no-console': ['warn'],
    curly: 'error',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'lodash',
            message: "Please use `import [package] from 'lodash/[package]'` instead.",
          },
        ],
        patterns: ['!lodash/*'],
      },
    ],
  },
};
