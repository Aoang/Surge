import { resolve } from 'node:path'
import process from 'node:process'

import { buildAll } from './index.ts'

const outputDirectory = resolve(process.env.SURGE_OUTPUT_DIR ?? '_site')

buildAll({
  outputDirectory,
  onProgress(name) {
    process.stdout.write(`Build: ${name}\n`)
  },
}).then(() => {
  process.stdout.write('Build finished\n')
}).catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
