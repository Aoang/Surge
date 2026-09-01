import liwo from '@liwo/eslint-config'

export default liwo({
  ignores: [
    '_site/**',
    'node_modules/**',
  ],
  typescript: true,
}, {
  files: ['**/*.test.ts'],
  rules: {
    'test/no-import-node-test': 'off',
  },
})
