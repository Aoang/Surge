import assert from 'node:assert/strict'
import test from 'node:test'

import { buildChinaIpv6Routes, parseChinaRoutes } from './index.ts'

test('parseChinaRoutes removes comments and blank lines', () => {
  const input = '# generated\n1.0.1.0/24\n\n  1.0.2.0/23  \n'

  assert.deepEqual(parseChinaRoutes(input), ['1.0.1.0/24', '1.0.2.0/23'])
})

test('buildChinaIpv6Routes converts the China IPv6 source into a separate rule file', async () => {
  const url = 'https://gaoyifan.github.io/china-operator-ip/china6.txt'
  const fetcher: typeof fetch = (input) => {
    assert.equal(input, url)
    return Promise.resolve(new Response('# generated\n2001:250::/30\n\n  2400:1040::/32  \r\n'))
  }

  assert.deepEqual(await buildChinaIpv6Routes(fetcher), {
    title: 'China CIDR6',
    source: url,
    relativePath: 'Ruleset/China/China6.list',
    content: 'IP-CIDR6,2001:250::/30\nIP-CIDR6,2400:1040::/32\n',
  })
})
