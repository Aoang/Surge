import assert from 'node:assert/strict'
import test from 'node:test'

import { parseXiaomiHosts } from './index.ts'

test('parseXiaomiHosts extracts and deduplicates blocked hostnames', () => {
  assert.deepEqual(parseXiaomiHosts([
    '! comment',
    '0.0.0.0 tracking.mi.com',
    '127.0.0.1 telemetry.mi.com',
    '0.0.0.0 tracking.mi.com',
    '0.0.0.0 localhost',
  ].join('\n')), ['tracking.mi.com', 'telemetry.mi.com'])
})
