import type { RuleFile } from '@surge/core'
import { NetworkFilter } from '@ghostery/adblocker'
import { fetchText } from '@surge/core'

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

export async function buildBaseSet(fetcher: typeof fetch = fetch): Promise<RuleFile> {
  const inputs = await Promise.all(sources.map(source => fetchText(source, fetcher)))
  const domains = new Set([...parseBaseSet(inputs), ...additionalDomains])

  return {
    title: 'Base',
    source: 'EasyList, AdGuard',
    relativePath: 'Ruleset/Block/Base.set',
    content: [...domains].join('\n'),
  }
}
