import liwo from '@liwo/eslint-config'

export default liwo({
  ignores: [
    'output/**',
    'node_modules/**',
  ],
  typescript: true,
}, {
  files: ['**/*.test.ts'],
  rules: {
    'test/no-import-node-test': 'off',
  },
})
