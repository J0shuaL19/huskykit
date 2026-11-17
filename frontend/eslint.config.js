export default [
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        AbortController: 'readonly',
        URLSearchParams: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-debugger': 'error',
      eqeqeq: 'error',
    },
  },
];
