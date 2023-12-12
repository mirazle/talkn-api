module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  // parser: 'babel-eslint',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
    project: ['./tsconfig.base.json'],
  },
  plugins: ['react', 'import', '@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    window: true,
  },
  rules: {
    'import/no-relative-parent-imports': ['warn'],
    'import/no-relative-packages': ['warn'],
    'import/no-unassigned-import': ['warn'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
  },
};
