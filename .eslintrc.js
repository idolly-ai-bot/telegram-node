module.exports = {
  root: true,
  env: { es2022: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['import', 'prettier'],
  extends: ['eslint:recommended', 'plugin:import/recommended', 'plugin:prettier'],
  rules: {
    'prettier/prettier': 'error',
    'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }]
  },
  ignorePatterns: ['dist', 'build', 'coverage', 'node_modules']
};
