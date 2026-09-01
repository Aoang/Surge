import assert from 'node:assert/strict'
import test from 'node:test'

import { parseAppleCdn } from './index.ts'

test('parseAppleCdn extracts only matching dnsmasq server entries', () => {
  const input = [
    '# comment',
    'server=/apple.com/114.114.114.114',
    'server=/invalid.test/8.8.8.8',
    'server=/icloud.com/114.114.114.114',
  ].join('\n')

  assert.deepEqual(parseAppleCdn(input), ['apple.com', 'icloud.com'])
})
