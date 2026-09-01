import assert from 'node:assert/strict'
import test from 'node:test'

import { buildCloudflare, parseCloudflareRanges } from './index.ts'

test('parseCloudflareRanges removes blank lines and surrounding whitespace', () => {
  assert.deepEqual(parseCloudflareRanges('1.1.1.0/24\n\n 2.2.0.0/16 \n'), [
    '1.1.1.0/24',
    '2.2.0.0/16',
  ])
})

test('buildCloudflare emits the resolver addresses as IPv4 only', async () => {
  const fetcher = (input: string | URL | Request) => Promise.resolve(
    new Response(String(input).endsWith('ips-v4') ? '10.0.0.0/8' : '2001:db8::/32'),
  )
  const rule = await buildCloudflare(fetcher)

  assert.match(rule.content, /IP-CIDR,1\.1\.1\.1\/32/)
  assert.doesNotMatch(rule.content, /IP-CIDR6,1\.1\.1\.1\/32/)
})
