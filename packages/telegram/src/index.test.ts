import assert from 'node:assert/strict'
import test from 'node:test'

import { buildTelegram, parseTelegramCidrs } from './index.ts'

test('parseTelegramCidrs ignores comments, whitespace, and blank lines', () => {
  assert.deepEqual(parseTelegramCidrs(' 91.108.4.0/22\n\n# comment\n2001:b28:f23c::/48 \n'), [
    '91.108.4.0/22',
    '2001:b28:f23c::/48',
  ])
})

test('buildTelegram combines built-in domains with official and additional CIDRs', async () => {
  const fetcher = () => Promise.resolve(new Response([
    '91.108.4.0/22',
    '2001:b28:f23c::/48',
    '149.154.160.0/20',
  ].join('\n')))
  const rule = await buildTelegram(fetcher)

  assert.equal(rule.relativePath, 'Ruleset/Telegram/Telegram.list')
  assert.match(rule.content, /^DOMAIN-SUFFIX,t\.me\n/)
  assert.match(rule.content, /IP-CIDR,91\.108\.4\.0\/22,no-resolve/)
  assert.match(rule.content, /IP-CIDR6,2001:b28:f23c::\/48,no-resolve/)
  assert.equal(rule.content.match(/149\.154\.160\.0\/20/g)?.length, 1)
  assert.match(rule.content, /IP-CIDR,5\.28\.192\.0\/18,no-resolve\n$/)
})
