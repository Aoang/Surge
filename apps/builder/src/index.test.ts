import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { buildAll } from './index.ts'

test('buildAll writes every builder result to the selected output directory', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'surge-builder-'))

  try {
    await buildAll({
      builders: {
        example: () => Promise.resolve({
          title: 'Example',
          source: 'fixture',
          relativePath: 'Ruleset/Test/Example.list',
          content: 'DOMAIN,example.com\n',
        }),
      },
      now: new Date('2026-01-02T03:04:05Z'),
      outputDirectory: directory,
    })

    const output = await readFile(join(directory, 'Ruleset/Test/Example.list'), 'utf8')
    assert.match(output, /^# Example, fixture\n# Update: /)
    assert.match(output, /DOMAIN,example\.com\n$/)
  }
  finally {
    await rm(directory, { recursive: true })
  }
})
