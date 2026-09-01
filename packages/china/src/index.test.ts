import assert from 'node:assert/strict'
import test from 'node:test'

import { parseChinaRoutes } from './index.ts'

test('parseChinaRoutes removes comments and blank lines', () => {
  const input = '# generated\n1.0.1.0/24\n\n  1.0.2.0/23  \n'

  assert.deepEqual(parseChinaRoutes(input), ['1.0.1.0/24', '1.0.2.0/23'])
})
