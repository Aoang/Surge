import type { RuleBuilder } from '@surge/core'
import { resolve } from 'node:path'
import process from 'node:process'

import { buildAppleCdn } from '@surge/apple-cdn'
import { buildBaseSet } from '@surge/base-set'
import { buildBogus } from '@surge/bogus'
import { buildChinaRoutes } from '@surge/china'
import { buildCloudflare } from '@surge/cloudflare'
import { writeRuleFile } from '@surge/core'
import { buildXiaomi } from '@surge/xiaomi'

export const ruleBuilders: Readonly<Record<string, RuleBuilder>> = {
  appleCdn: buildAppleCdn,
  baseSet: buildBaseSet,
  bogus: buildBogus,
  china: buildChinaRoutes,
  cloudflare: buildCloudflare,
  xiaomi: buildXiaomi,
}

export interface BuildOptions {
  readonly builders?: Readonly<Record<string, RuleBuilder>>
  readonly fetcher?: typeof fetch
  readonly now?: Date
  readonly outputDirectory?: string
  readonly onProgress?: (name: string) => void
}

export async function buildAll(options: BuildOptions = {}): Promise<void> {
  const builders = options.builders ?? ruleBuilders
  const outputDirectory = options.outputDirectory ?? resolve(process.cwd(), '_site')
  const updatedAt = options.now ?? new Date()

  await Promise.all(Object.entries(builders).map(async ([name, builder]) => {
    options.onProgress?.(name)
    const rule = await builder(options.fetcher)
    await writeRuleFile(outputDirectory, rule, updatedAt)
  }))
}
