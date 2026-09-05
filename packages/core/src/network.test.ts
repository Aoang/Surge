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
    fetchText('https://example.com/rules', fetcher, {
      attempts: 1,
    }),
    /after 1 attempts/,
  )
})

test('fetchText retries transient failures', async () => {
  let attempts = 0
  const fetcher = () => {
    attempts++
    return attempts === 1
      ? Promise.reject(new TypeError('fetch failed'))
      : Promise.resolve(new Response('rules'))
  }

  assert.equal(await fetchText('https://example.com/rules', fetcher, {
    retryDelayMs: 0,
  }), 'rules')
  assert.equal(attempts, 2)
})

test('fetchText applies a timeout signal to every attempt', async () => {
  const fetcher: typeof fetch = (_input, init) => {
    assert.ok(init?.signal)
    return Promise.resolve(new Response('rules'))
  }

  await fetchText('https://example.com/rules', fetcher, { timeoutMs: 10 })
})
