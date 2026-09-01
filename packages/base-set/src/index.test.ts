import assert from 'node:assert/strict'
import test from 'node:test'

import { createBaseRule, parseBaseSet } from './index.ts'

test('parseBaseSet keeps plain host rules and applies exceptions', () => {
  const domains = parseBaseSet([[
    '||ads.example.com^',
    '||tracking.example.com^',
    '@@||ads.example.com^',
    'example.com##.advert',
    '/regular-expression/',
  ].join('\n')])

  assert.deepEqual(domains, ['.tracking.example.com'])
})

test('createBaseRule appends project-specific telemetry domains', () => {
  const rule = createBaseRule([])

  assert.match(rule.content, /\.log\.aliyuncs\.com/)
  assert.match(rule.content, /cls\.ap-shanghai\.tencentcloudapi\.com/)
  assert.equal(rule.relativePath, 'Ruleset/Block/Base.set')
})
