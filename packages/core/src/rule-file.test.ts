import assert from 'node:assert/strict'
import test from 'node:test'

import { formatUpdatedAt, renderRuleFile } from './rule-file.ts'

test('formatUpdatedAt uses the compact UTC+8 format', () => {
  assert.equal(formatUpdatedAt(new Date('2020-01-01T09:22:36Z')), '2020-01-01 17:22:36 +08')
})

test('renderRuleFile preserves the Surge metadata format', () => {
  const result = renderRuleFile(
    {
      title: 'Example',
      source: 'https://example.com',
      relativePath: 'Ruleset/Example.list',
      content: 'DOMAIN-SUFFIX,example.com\n',
    },
    new Date('2020-01-01T09:22:36Z'),
  )

  assert.match(result, /^# Example, https:\/\/example\.com\n# Update: 2020-01-01 17:22:36 \+08\n/)
  assert.match(result, /DOMAIN-SUFFIX,example\.com\n$/)
})
