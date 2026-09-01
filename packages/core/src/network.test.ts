import assert from 'node:assert/strict'
import test from 'node:test'

import { fetchText } from './network.ts'

test('fetchText returns a successful response body', async () => {
  const fetcher = () => Promise.resolve(new Response('rules'))

  assert.equal(await fetchText('https://example.com/rules', fetcher), 'rules')
})

test('fetchText rejects an unsuccessful response', async () => {
  const fetcher = () => Promise.resolve(new Response(null, { status: 503 }))

  await assert.rejects(
    fetchText('https://example.com/rules', fetcher),
    /status: 503/,
  )
})
