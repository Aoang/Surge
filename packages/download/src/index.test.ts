import assert from 'node:assert/strict'
import test from 'node:test'

import { buildDownload, downloadDomains } from './index.ts'

test('download domains are unique and include known app download hosts', () => {
  assert.equal(new Set(downloadDomains).size, downloadDomains.length)
  assert.ok(downloadDomains.includes('download.zerotier.com'))
  assert.ok(downloadDomains.includes('osx.telegram.org'))
})

test('buildDownload emits a domain set at the existing test path', async () => {
  const rule = await buildDownload()

  assert.equal(rule.relativePath, 'Ruleset/Test/Download.list')
  assert.match(rule.content, /^brew\.sh\n/)
  assert.match(rule.content, /\ndownloads\.claude\.ai\n$/)
})
