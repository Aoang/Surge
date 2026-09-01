import assert from 'node:assert/strict'
import test from 'node:test'

import { parseBogus } from './index.ts'

test('parseBogus extracts configured IPv4 addresses', () => {
  const input = '# comment\nbogus-nxdomain=1.2.3.4\nserver=/example.com/8.8.8.8\n'

  assert.deepEqual(parseBogus(input), ['1.2.3.4'])
})
