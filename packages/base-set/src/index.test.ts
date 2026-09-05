import assert from 'node:assert/strict'
import test from 'node:test'

import { buildBaseSet, createBaseRule, parseBaseSet } from './index.ts'

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

test('buildBaseSet downloads sources through the provided fetcher', async () => {
  const requested: string[] = []
  const fetcher: typeof fetch = (input) => {
    requested.push(input.toString())
    return Promise.resolve(new Response('||tracking.example.com^'))
  }

  const rule = await buildBaseSet(fetcher)

  assert.equal(requested.length, 3)
  assert.match(rule.content, /\.tracking\.example\.com/)
})
