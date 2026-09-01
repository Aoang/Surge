import type { RuleFile } from '@surge/core'
import { createRequire } from 'node:module'
import { NetworkFilter } from '@ghostery/adblocker'

interface CompilerConfiguration {
  readonly name: string
  readonly sources: readonly {
    readonly source: string
    readonly transformations: readonly string[]
    readonly type: 'adblock'
  }[]
  readonly transformations: readonly string[]
}

type HostlistCompiler = (configuration: CompilerConfiguration) => Promise<string[]>

const require = createRequire(import.meta.url)
const compile = require('@adguard/hostlist-compiler') as HostlistCompiler

const sources = [
  'https://adguardteam.github.io/AdGuardSDNSFilter/Filters/filter.txt',
  'https://easylist.to/easylist/easylist.txt',
  'https://easylist.to/easylist/easyprivacy.txt',
]

const additionalDomains = [
  '.log.aliyuncs.com',
  'cls.tencentcloudapi.com',
  'cls.ap-guangzhou.tencentcloudapi.com',
  'cls.ap-shanghai.tencentcloudapi.com',
  'cls.ap-beijing.tencentcloudapi.com',
  'cls.ap-chengdu.tencentcloudapi.com',
  'cls.ap-chongqing.tencentcloudapi.com',
  'cls.ap-hongkong.tencentcloudapi.com',
  'cls.ap-singapore.tencentcloudapi.com',
  'cls.ap-bangkok.tencentcloudapi.com',
  'cls.ap-seoul.tencentcloudapi.com',
  'cls.ap-tokyo.tencentcloudapi.com',
  'cls.na-ashburn.tencentcloudapi.com',
  'cls.na-siliconvalley.tencentcloudapi.com',
  'cls.eu-frankfurt.tencentcloudapi.com',
  'cls.ap-shanghai-fsi.tencentcloudapi.com',
  'cls.ap-shenzhen-fsi.tencentcloudapi.com',
]

function isPlainHostnameRule(filter: NetworkFilter): boolean {
  return !filter.isElemHide()
    && !filter.isGenericHide()
    && !filter.isSpecificHide()
    && !filter.isRedirect()
    && !filter.isRedirectRule()
    && !filter.hasDomains()
    && !filter.isCSP()
    && filter.isPlain()
    && (filter.fromAny() || filter.fromDocument())
    && !filter.isRegex()
    && !filter.isFullRegex()
}

export function parseBaseSet(inputs: readonly string[]): string[] {
  const allowed = new Set<string>()
  const blocked: string[] = []

  for (const line of inputs.flatMap(input => input.split('\n'))) {
    const filter = NetworkFilter.parse(line.trim())
    const hostname = filter?.getHostname()

    if (!filter || !hostname || !isPlainHostnameRule(filter))
      continue

    if (filter.isException())
      allowed.add(hostname)
    else
      blocked.push(hostname)
  }

  return [...new Set(blocked
    .filter(hostname => !allowed.has(hostname))
    .map(hostname => `.${hostname}`))]
}

export function createBaseRule(compiledRules: readonly string[]): RuleFile {
  const domains = new Set([...parseBaseSet(compiledRules), ...additionalDomains])
  return {
    title: 'Base',
    source: 'EasyList, AdGuard',
    relativePath: 'Ruleset/Block/Base.set',
    content: [...domains].join('\n'),
  }
}

export async function buildBaseSet(): Promise<RuleFile> {
  const compiledRules = await compile({
    name: 'Base',
    sources: sources.map(source => ({
      type: 'adblock',
      source,
      transformations: ['RemoveComments', 'Validate'],
    })),
    transformations: [
      'RemoveComments',
      'Compress',
      'Validate',
      'Deduplicate',
      'RemoveEmptyLines',
      'TrimLines',
    ],
  })

  return createBaseRule(compiledRules)
}
