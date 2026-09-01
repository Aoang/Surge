import assert from 'node:assert/strict'
import test from 'node:test'

import { renderRuleFile } from './rule-file.ts'

test('renderRuleFile preserves the Surge metadata format', () => {
  const result = renderRuleFile(
    {
      title: 'Example',
      source: 'https://example.com',
      relativePath: 'Ruleset/Example.list',
      content: 'DOMAIN-SUFFIX,example.com\n',
    },
    new Date('2026-01-02T03:04:05Z'),
  )

  assert.match(result, /^# Example, https:\/\/example\.com\n# Update: /)
  assert.match(result, /DOMAIN-SUFFIX,example\.com\n$/)
})
