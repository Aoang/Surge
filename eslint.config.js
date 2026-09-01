import liwo from '@liwo/eslint-config'

export default liwo({
  ignores: [
    '_site/**',
    'node_modules/**',
    'build.ts',
    'deno.json',
    'src/**',
    '.github/workflows/**',
  ],
  typescript: true,
}, {
  files: ['**/*.test.ts'],
  rules: {
    'test/no-import-node-test': 'off',
  },
})
